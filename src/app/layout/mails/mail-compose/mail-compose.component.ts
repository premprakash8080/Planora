import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComposeMail, MailService } from '../services/mail.service';

export interface MailComposeData {
  to?: string;
  subject?: string;
}

@Component({
  selector: 'app-mail-compose',
  templateUrl: './mail-compose.component.html',
  styleUrls: ['./mail-compose.component.scss']
})
export class MailComposeComponent {

  form: ComposeMail = {
    to: this.data?.to || '',
    subject: this.data?.subject || '',
    body: ''
  };

  constructor(
    private readonly dialogRef: MatDialogRef<MailComposeComponent>,
    private readonly mailService: MailService,
    @Inject(MAT_DIALOG_DATA) public data: MailComposeData | null
  ) { }

  send(): void {
    if (!this.form.to || !this.form.subject || !this.form.body) {
      return;
    }

    this.mailService.sendMail({ ...this.form });
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
