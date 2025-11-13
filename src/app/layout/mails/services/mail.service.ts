import { Injectable } from '@angular/core';

export interface Mail {
  id: string;
  sender: string;
  senderEmail: string;
  senderAvatarUrl?: string;
  senderAvatarColor?: string;
  recipient?: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

export interface ComposeMail {
  to: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class MailService {

  private mails: Mail[] = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      senderEmail: 'sarah.johnson@example.com',
      senderAvatarColor: '#2563eb',
      recipient: 'you@task-manager.com',
      subject: 'Design Review Feedback',
      preview: 'Hi team, I reviewed the latest design mockups and have a few suggestions...',
      body: `Hi team,

I reviewed the latest design mockups and have a few suggestions for the landing page hero section. The typography looks great, but I think we could increase the contrast slightly.

Let’s discuss this during tomorrow’s sync.

Cheers,
Sarah`,
      timestamp: '2024-01-15T09:30:00Z',
      isRead: false
    },
    {
      id: '2',
      sender: 'Michael Chen',
      senderEmail: 'michael.chen@example.com',
      senderAvatarColor: '#db2777',
      recipient: 'you@task-manager.com',
      subject: 'Backend deployment complete',
      preview: 'Deployment complete for the backend services. Everything looks stable...',
      body: `Hello,

Deployment complete for the backend services. Everything looks stable in production and the monitoring dashboard is clear.

Let me know if you notice anything unusual.

Thanks,
Michael`,
      timestamp: '2024-01-15T08:05:00Z',
      isRead: true
    },
    {
      id: '3',
      sender: 'Emily Rodriguez',
      senderEmail: 'emily.rodriguez@example.com',
      senderAvatarColor: '#f97316',
      recipient: 'you@task-manager.com',
      subject: 'Reminder: Sprint planning agenda',
      preview: 'Quick reminder that sprint planning is tomorrow at 10am. Agenda is attached...',
      body: `Hi team,

Quick reminder that sprint planning is tomorrow at 10am. The agenda is attached in the shared folder. Please review your open tasks before the meeting.

Best,
Emily`,
      timestamp: '2024-01-14T17:45:00Z',
      isRead: true
    },
    {
      id: '4',
      sender: 'Sarah Johnson',
      senderEmail: 'sarah.johnson@example.com',
      senderAvatarColor: '#2563eb',
      recipient: 'you@task-manager.com',
      subject: 'Design Review Feedback',
      preview: 'Hi team, I reviewed the latest design mockups and have a few suggestions...',
      body: `Hi team,

I reviewed the latest design mockups and have a few suggestions for the landing page hero section. The typography looks great, but I think we could increase the contrast slightly.

Let’s discuss this during tomorrow’s sync.

Cheers,
Sarah`,
      timestamp: '2024-01-15T09:30:00Z',
      isRead: false
    },
    {
      id: '5',
      sender: 'Michael Chen',
      senderEmail: 'michael.chen@example.com',
      senderAvatarColor: '#db2777',
      recipient: 'you@task-manager.com',
      subject: 'Backend deployment complete',
      preview: 'Deployment complete for the backend services. Everything looks stable...',
      body: `Hello,

Deployment complete for the backend services. Everything looks stable in production and the monitoring dashboard is clear.

Let me know if you notice anything unusual.

Thanks,
Michael`,
      timestamp: '2024-01-15T08:05:00Z',
      isRead: true
    },
    {
      id: '6',
      sender: 'Emily Rodriguez',
      senderEmail: 'emily.rodriguez@example.com',
      senderAvatarColor: '#f97316',
      recipient: 'you@task-manager.com',
      subject: 'Reminder: Sprint planning agenda',
      preview: 'Quick reminder that sprint planning is tomorrow at 10am. Agenda is attached...',
      body: `Hi team,

Quick reminder that sprint planning is tomorrow at 10am. The agenda is attached in the shared folder. Please review your open tasks before the meeting.

Best,
Emily`,
      timestamp: '2024-01-14T17:45:00Z',
      isRead: true
    }
  ];

  constructor() { }

  getMails(): Mail[] {
    return [...this.mails];
  }

  getMailById(id: string): Mail | undefined {
    return this.mails.find(mail => mail.id === id);
  }

  sendMail(mail: ComposeMail): Mail {
    const now = new Date();
    const newMail: Mail = {
      id: now.getTime().toString(),
      sender: 'You',
      senderEmail: 'you@task-manager.com',
      recipient: mail.to,
      subject: mail.subject,
      preview: mail.body.length > 90 ? `${mail.body.substring(0, 87)}...` : mail.body,
      body: mail.body,
      timestamp: now.toISOString(),
      isRead: true
    };

    this.mails = [newMail, ...this.mails];
    return newMail;
  }
}
