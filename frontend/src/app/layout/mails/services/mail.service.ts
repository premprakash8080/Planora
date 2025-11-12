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
      "id": "1",
      "sender": "Sarah Johnson",
      "senderEmail": "sarah.johnson@example.com",
      "senderAvatarColor": "#2563eb",
      "recipient": "you@task-manager.com",
      "subject": "Design Review Feedback",
      "preview": "Hi team, I reviewed the latest design mockups and have a few suggestions...",
      "body": "Hi team,\nI reviewed the latest design mockups and have a few suggestions for the landing page\nCheers,\nSarah",
      "timestamp": "2024-01-15T09:30:00Z",
      "isRead": false
    },
    {
      "id": "2",
      "sender": "Michael Chen",
      "senderEmail": "michael.chen@example.com",
      "senderAvatarColor": "#dc2626",
      "recipient": "you@task-manager.com",
      "subject": "Sprint Planning Meeting",
      "preview": "Hey everyone, let's schedule the next sprint planning for Thursday at 2 PM...",
      "body": "Hey everyone,\nLet's schedule the next sprint planning for Thursday at 2 PM. Please confirm your availability.\nBest,\nMichael",
      "timestamp": "2024-01-16T14:45:00Z",
      "isRead": false
    },
    {
      "id": "3",
      "sender": "Emily Rodriguez",
      "senderEmail": "emily.rodriguez@example.com",
      "senderAvatarColor": "#16a34a",
      "recipient": "you@task-manager.com",
      "subject": "Bug Report - Login Issue",
      "preview": "Users are reporting they can't log in after the latest deployment...",
      "body": "Hi team,\nUsers are reporting they can't log in after the latest deployment. I've attached logs and screenshots.\nUrgent fix needed.\nEmily",
      "timestamp": "2024-01-17T08:12:00Z",
      "isRead": true
    },
    {
      "id": "4",
      "sender": "David Kim",
      "senderEmail": "david.kim@example.com",
      "senderAvatarColor": "#ea580c",
      "recipient": "you@task-manager.com",
      "subject": "API Documentation Update",
      "preview": "I've updated the API docs with the new authentication endpoints...",
      "body": "Team,\nI've updated the API docs with the new authentication endpoints. Please review before tomorrow's release.\nLink: https://docs.example.com/api/v2\nDavid",
      "timestamp": "2024-01-18T11:20:00Z",
      "isRead": false
    },
    {
      "id": "5",
      "sender": "Lisa Wong",
      "senderEmail": "lisa.wong@example.com",
      "senderAvatarColor": "#8b5cf6",
      "recipient": "you@task-manager.com",
      "subject": "Team Lunch Reminder",
      "preview": "Don't forget about tomorrow's team lunch at 12:30 PM...",
      "body": "Hi all,\nDon't forget about tomorrow's team lunch at 12:30 PM at The Corner Bistro. RSVP if you haven't already!\nLisa",
      "timestamp": "2024-01-19T16:55:00Z",
      "isRead": true
    },
    {
      "id": "6",
      "sender": "James Patel",
      "senderEmail": "james.patel@example.com",
      "senderAvatarColor": "#0891b2",
      "recipient": "you@task-manager.com",
      "subject": "Performance Review Schedule",
      "preview": "HR has released the Q1 performance review schedule...",
      "body": "Everyone,\nHR has released the Q1 performance review schedule. Please check your calendar invites.\nLet me know if you need to reschedule.\nJames",
      "timestamp": "2024-01-20T10:03:00Z",
      "isRead": false
    },
    {
      "id": "7",
      "sender": "Amanda Lee",
      "senderEmail": "amanda.lee@example.com",
      "senderAvatarColor": "#d946ef",
      "recipient": "you@task-manager.com",
      "subject": "Database Migration Complete",
      "preview": "The database migration to PostgreSQL 15 is now complete...",
      "body": "Team,\nThe database migration to PostgreSQL 15 is now complete. All services are running normally.\nMonitor for any issues over the next 24 hours.\nAmanda",
      "timestamp": "2024-01-21T03:17:00Z",
      "isRead": false
    },
    {
      "id": "8",
      "sender": "Robert Garcia",
      "senderEmail": "robert.garcia@example.com",
      "senderAvatarColor": "#84cc16",
      "recipient": "you@task-manager.com",
      "subject": "Client Feedback Call",
      "preview": "We have a feedback call with Acme Corp tomorrow at 11 AM...",
      "body": "Hi,\nWe have a feedback call with Acme Corp tomorrow at 11 AM. Please prepare your updates on the dashboard feature.\nRobert",
      "timestamp": "2024-01-22T13:40:00Z",
      "isRead": true
    },
    {
      "id": "9",
      "sender": "Sophie Martin",
      "senderEmail": "sophie.martin@example.com",
      "senderAvatarColor": "#f43f5e",
      "recipient": "you@task-manager.com",
      "subject": "Code Review Request",
      "preview": "Could someone review my PR for the payment integration?...",
      "body": "Hey team,\nCould someone review my PR for the payment integration? It's ready for final approval.\nLink: https://github.com/example/repo/pull/123\nThanks,\nSophie",
      "timestamp": "2024-01-23T09:28:00Z",
      "isRead": false
    },
    {
      "id": "10",
      "sender": "Tom Nguyen",
      "senderEmail": "tom.nguyen@example.com",
      "senderAvatarColor": "#0ea5e9",
      "recipient": "you@task-manager.com",
      "subject": "Security Alert",
      "preview": "Potential security vulnerability detected in our authentication library...",
      "body": "URGENT: Potential security vulnerability detected in our authentication library.\nPatch available: https://github.com/auth/lib/releases/v2.4.1\nApply immediately.\nTom",
      "timestamp": "2024-01-24T05:11:00Z",
      "isRead": false
    },
    {
      "id": "11",
      "sender": "Rachel Brown",
      "senderEmail": "rachel.brown@example.com",
      "senderAvatarColor": "#6366f1",
      "recipient": "you@task-manager.com",
      "subject": "Marketing Campaign Launch",
      "preview": "The new marketing campaign goes live tomorrow at 9 AM...",
      "body": "Team,\nThe new marketing campaign goes live tomorrow at 9 AM. All assets are uploaded and scheduled.\nMonitor social media engagement.\nRachel",
      "timestamp": "2024-01-25T15:33:00Z",
      "isRead": true
    },
    {
      "id": "12",
      "sender": "Kevin Park",
      "senderEmail": "kevin.park@example.com",
      "senderAvatarColor": "#f59e0b",
      "recipient": "you@task-manager.com",
      "subject": "Server Maintenance Window",
      "preview": "Scheduled maintenance for production servers this Saturday 2-4 AM...",
      "body": "Hi,\nScheduled maintenance for production servers this Saturday 2-4 AM UTC.\nMinimal downtime expected (15 mins).\nKevin",
      "timestamp": "2024-01-26T12:07:00Z",
      "isRead": false
    },
    {
      "id": "13",
      "sender": "Nina Patel",
      "senderEmail": "nina.patel@example.com",
      "senderAvatarColor": "#ec4899",
      "recipient": "you@task-manager.com",
      "subject": "Feature Request Approval",
      "preview": "The requested dark mode feature has been approved for Q2...",
      "body": "Great news! The requested dark mode feature has been approved for Q2 roadmap.\nDesign specs attached.\nNina",
      "timestamp": "2024-01-27T10:44:00Z",
      "isRead": true
    },
    {
      "id": "14",
      "sender": "Alex Turner",
      "senderEmail": "alex.turner@example.com",
      "senderAvatarColor": "#14b8a6",
      "recipient": "you@task-manager.com",
      "subject": "Deployment Failed",
      "preview": "Last night's deployment to staging failed due to test failures...",
      "body": "Team,\nLast night's deployment to staging failed due to test failures in the user service.\nLogs attached. Need help debugging.\nAlex",
      "timestamp": "2024-01-28T07:22:00Z",
      "isRead": false
    },
    {
      "id": "15",
      "sender": "Olivia Smith",
      "senderEmail": "olivia.smith@example.com",
      "senderAvatarColor": "#a855f7",
      "recipient": "you@task-manager.com",
      "subject": "Quarterly Report",
      "preview": "Q4 2023 quarterly report is now available for review...",
      "body": "Hi everyone,\nQ4 2023 quarterly report is now available for review. Please provide feedback by Friday.\nLink: https://reports.example.com/q4-2023\nOlivia",
      "timestamp": "2024-01-29T14:56:00Z",
      "isRead": false
    },
    {
      "id": "16",
      "sender": "Marcus Johnson",
      "senderEmail": "marcus.johnson@example.com",
      "senderAvatarColor": "#ef4444",
      "recipient": "you@task-manager.com",
      "subject": "New Hire Onboarding",
      "preview": "Welcome our new frontend developer starting Monday...",
      "body": "Team,\nWelcome our new frontend developer, Sarah Chen, starting Monday. Please help with onboarding.\nMarcus",
      "timestamp": "2024-01-30T11:19:00Z",
      "isRead": true
    },
    {
      "id": "17",
      "sender": "Grace Liu",
      "senderEmail": "grace.liu@example.com",
      "senderAvatarColor": "#22c55e",
      "recipient": "you@task-manager.com",
      "subject": "Mobile App Update",
      "preview": "iOS app version 3.2.1 submitted to App Store...",
      "body": "Good news! iOS app version 3.2.1 submitted to App Store. Expected approval in 2-3 days.\nAndroid update to follow.\nGrace",
      "timestamp": "2024-01-31T16:41:00Z",
      "isRead": false
    },
    {
      "id": "18",
      "sender": "Daniel Cohen",
      "senderEmail": "daniel.cohen@example.com",
      "senderAvatarColor": "#3b82f6",
      "recipient": "you@task-manager.com",
      "subject": "Budget Approval Needed",
      "preview": "Need approval for Q2 cloud infrastructure budget increase...",
      "body": "Hi,\nNeed approval for Q2 cloud infrastructure budget increase of $15K due to traffic growth.\nDetails attached.\nDaniel",
      "timestamp": "2024-02-01T09:05:00Z",
      "isRead": false
    },
    {
      "id": "19",
      "sender": "Victoria Adams",
      "senderEmail": "victoria.adams@example.com",
      "senderAvatarColor": "#f97316",
      "recipient": "you@task-manager.com",
      "subject": "Customer Support Update",
      "preview": "Response time improved by 40% this month...",
      "body": "Team,\nResponse time improved by 40% this month thanks to the new ticketing system. Great work everyone!\nVictoria",
      "timestamp": "2024-02-02T13:27:00Z",
      "isRead": true
    },
    {
      "id": "20",
      "sender": "Ethan Wilson",
      "senderEmail": "ethan.wilson@example.com",
      "senderAvatarColor": "#10b981",
      "recipient": "you@task-manager.com",
      "subject": "Retrospective Meeting",
      "preview": "Sprint 42 retrospective scheduled for Friday at 3 PM...",
      "body": "Hi all,\nSprint 42 retrospective scheduled for Friday at 3 PM. Please come prepared with what went well and improvements.\nEthan",
      "timestamp": "2024-02-03T10:52:00Z",
      "isRead": false
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
