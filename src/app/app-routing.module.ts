import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CustomLayoutComponent } from './custom-layout/custom-layout.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "",
    component: CustomLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadChildren: () => import("./layout/dashboard/dashboard.module").then((m) => m.DashboardModule),
      },
      {
        path: "members",
        loadChildren: () => import("./layout/members/members.module").then((m) => m.MembersModule),
      },
      {
        path: "projects/:projectId/tasks",
        loadChildren: () => import("./layout/tasks/tasks.module").then((m) => m.DashboardProjectTasksModule),
      },
      {
        path: "mails",
        loadChildren: () => import("./layout/mails/mails.module").then((m) => m.MailsModule),
      },
      {
        path: "inbox",
        loadChildren: () => import("./layout/inbox/inbox.module").then((m) => m.InboxModule),
      },
      {
        path: "insights",
        loadChildren: () => import("./layout/insights/insights.module").then((m) => m.InsightsModule),
      },
      {
        path: "profile",
        loadChildren: () => import("./layout/profile/profile.module").then((m) => m.ProfileModule),
      },
      {
        path: "settings",
        loadChildren: () => import("./layout/settings/settings.module").then((m) => m.SettingsModule),
      },
      {
        path: "**",
        redirectTo: "dashboard",
        pathMatch: "full",
      }
    ]
  }
];

@NgModule({ imports: [RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules,
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
})], exports: [RouterModule] })
export class AppRoutingModule {}
