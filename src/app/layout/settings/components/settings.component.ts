import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings = {
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: true,
      showPhone: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/Los_Angeles'
    }
  };

  themes = ['light', 'dark', 'auto'];
  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ];
  timezones = [
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo'
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onSave(): void {
    // TODO: Save settings
    console.log('Settings saved:', this.settings);
  }

  onCancel(): void {
    // TODO: Reset to original settings
    console.log('Settings cancelled');
  }
}

