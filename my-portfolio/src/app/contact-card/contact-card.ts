import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-contact-card',
  imports: [],
  templateUrl: './contact-card.html',
  styleUrl: './contact-card.css',
})
export class ContactCard {
  @Input() email!: string;
  @Input() phone!: string;
  @Input() location!: string;
   @Input() name!: string;
   @Input() role!: string;
   @Input() github!: string;

}
