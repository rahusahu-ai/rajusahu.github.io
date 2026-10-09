import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const kiteApiBaseUrl = process.env['KITE_API_BASE_URL'] || 'https://api.kite.trade';
const kiteApiKey = process.env['KITE_API_KEY'];
const kiteClientSecret = process.env['KITE_CLIENT_SECRET'];
const kiteRedirectUri = process.env['KITE_REDIRECT_URI'] || 'https://rajusahu.in/api/kite/callback';
const kiteSessionCookie = 'kite_session';

const app = express();
const angularApp = new AngularNodeAppEngine();

const kiteRequest = async (path: string, accessToken?: string): Promise<Response> => {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return fetch(`${kiteApiBaseUrl}${path}`, { headers });
};

const getKiteAccessToken = async (requestToken: string): Promise<string> => {
  if (!kiteApiKey || !kiteClientSecret) {
    console.error('[Kite] Token exchange failed: API key or API secret is missing.');
    throw new Error('Kite OAuth credentials are not configured.');
  }

  console.log('[Kite] Exchanging request token with Kite API.');
  const checksum = createHash('sha256')
    .update(`${kiteApiKey}${requestToken}${kiteClientSecret}`)
    .digest('hex');
  const params = new URLSearchParams({
    api_key: kiteApiKey,
    request_token: requestToken,
    checksum,
  });
  const response = await fetch(`${kiteApiBaseUrl}/session/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Kite-Version': '3',
    },
    body: params,
  });
  const body = await response.json() as {
    data?: { access_token?: string };
    message?: string;
  };

  const accessToken = body.data?.access_token;
  if (!response.ok || !accessToken) {
    console.error(`[Kite] Token exchange failed: ${response.status} ${body.message || 'No access token returned.'}`);
    throw new Error(body.message || 'Kite authentication failed.');
  }

  console.log(`[Kite] Token exchange succeeded with status ${response.status}.`);
  return accessToken;
};

const getCookie = (req: express.Request, name: string): string | undefined => {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=').slice(1).join('=');
};

app.get('/api/kite/kiteLogin', (_req, res) => {
  if (!kiteApiKey) {
    console.error('[Kite] Login failed: KITE_API_KEY is not configured.');
    res.status(503).send({ message: 'Kite API key is not configured.' });
    return;
  }

  const loginUrl = new URL('https://kite.zerodha.com/connect/login');
  loginUrl.searchParams.set('v', '3');
  loginUrl.searchParams.set('api_key', kiteApiKey);
  console.log('[Kite] Redirecting to Kite Connect v3 login.');
  res.redirect(loginUrl.toString());
});

app.get('/api/kite/callback', async (req, res) => {
  const requestToken = typeof req.query['request_token'] === 'string'
    ? req.query['request_token']
    : undefined;
  const error = typeof req.query['error'] === 'string' ? req.query['error'] : undefined;

  if (error || !requestToken) {
    console.error(`[Kite] Callback rejected: ${error || 'request_token is missing.'}`);
    res.status(400).send({ message: error || 'Kite did not return a request token.' });
    return;
  }

  console.log('[Kite] Callback received a request token.');
  try {
    const accessToken = await getKiteAccessToken(requestToken);
    res.cookie(kiteSessionCookie, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: 60 * 60 * 1000,
    });
    console.log('[Kite] Session cookie created; redirecting to tradeAnalysis.');
    res.redirect('/tradeAnalysis');
  } catch (authError) {
    console.error('[Kite] Callback token exchange failed.', authError);
    res.status(502).send({ message: authError instanceof Error ? authError.message : 'Kite authentication failed.' });
  }
});

app.get('/api/kite/nifty50', async (req, res) => {
  const accessToken = getCookie(req, kiteSessionCookie);
  if (!accessToken) {
    console.error('[Kite] Nifty 50 request rejected: session cookie is missing.');
    res.status(401).send({ message: 'Login to Kite before requesting Nifty 50 data.' });
    return;
  }

  console.log('[Kite] Nifty 50 request received.');
  try {
    const response = await kiteRequest('/api/v1/market/quotes?i=NIFTY50', accessToken);
    const data = await response.json();
    if (!response.ok) {
      console.error(`[Kite] Nifty 50 request failed with status ${response.status}.`);
      throw new Error(data.message || 'Kite could not return Nifty 50 data.');
    }
    console.log(`[Kite] Nifty 50 request succeeded with status ${response.status}.`);
    res.json(data);
  } catch (dataError) {
    console.error('[Kite] Nifty 50 request failed.', dataError);
    res.status(502).send({ message: dataError instanceof Error ? dataError.message : 'Unable to load Nifty 50 data.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
