import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
   @Input() email!: string;

   // model bound to template via [(ngModel)]
  formData = {
    name: '',
    email: '',
    message: ''
  };

   onSubmit(formData: any) {
     // Handle form submission logic here
     console.log('Form submitted:', formData);
     alert(`Thank you for contacting me! I will get back to you at ${this.email}.`);
       // reset form if desired
    this.formData = { name: '', email: '', message: '' };

   }  
}

