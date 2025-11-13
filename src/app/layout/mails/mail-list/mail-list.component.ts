import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Mail, MailService } from '../services/mail.service';
import { MailComposeComponent } from '../mail-compose/mail-compose.component';

@Component({
  selector: 'app-mail-list',
  templateUrl: './mail-list.component.html',
  styleUrls: ['./mail-list.component.scss']
})
export class MailListComponent implements OnInit {

  mails: Mail[] = [];
  constructor(
    private readonly mailService: MailService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.mails = this.mailService.getMails();
  }

  openMail(mail: Mail): void {
    this.router.navigate([mail.id], { relativeTo: this.route });
  }

  openCompose(): void {
    const dialogRef = this.dialog.open(MailComposeComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((sent) => {
      if (sent) {
        this.mails = this.mailService.getMails();
      }
    });
  }

  getAvatarInitials(sender: string): string {
    return sender
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
