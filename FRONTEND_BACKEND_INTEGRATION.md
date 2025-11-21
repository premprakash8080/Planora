# Frontend-Backend Integration Guide

## Overview

This document describes the complete integration between the Angular frontend and Node.js/Express backend API for authentication and user management.

## Architecture

### **Modular Structure**
- **Models**: Type-safe interfaces matching backend API responses (`auth.models.ts`)
- **Services**: Business logic and API communication (`auth.service.ts`)
- **Components**: UI components with form validation (`login`, `registration`)
- **Guards**: Route protection (`auth.guard.ts`, `guest.guard.ts`)
- **Middleware**: HTTP interceptors for token injection

## File Structure

```
src/app/
├── auth/
│   ├── service/
│   │   ├── auth.service.ts          # Main authentication service
│   │   └── api.collection.ts        # API endpoint definitions
│   ├── components/
│   │   ├── login/                   # Login component
│   │   └── registration/            # Registration component
│   └── auth-routing.module.ts       # Auth routes with guards
├── core/
│   ├── models/
│   │   └── auth.models.ts          # TypeScript interfaces
│   └── guards/
│       ├── auth.guard.ts           # Protect authenticated routes
│       └── guest.guard.ts         # Protect guest routes (login/register)
├── shared/
│   ├── services/
│   │   └── user-session.service.ts # Session management
│   └── ui/
│       └── app-header/             # Header with user info & logout
└── environments/
    ├── environment.ts              # Development config
    └── environment.prod.ts         # Production config
```

## API Integration

### **Endpoints Used**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/users/login` | POST | User login | No |
| `/api/users/register` | POST | User registration | No |
| `/api/users/profile` | GET | Get user profile | Yes |
| `/api/users/profile` | PUT | Update user profile | Yes |

### **Request/Response Format**

**Login Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Login Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    expires: string;
  }
}
```

**Register Request:**
```typescript
{
  full_name: string;
  email: string;
  password: string;
}
```

## Authentication Flow

### **1. Login Flow**
```
User enters credentials
  ↓
LoginComponent validates form
  ↓
AuthenticationService.login() called
  ↓
HTTP POST to /api/users/login
  ↓
Backend validates & returns JWT token + user data
  ↓
Token stored in UserSessionService
  ↓
User redirected to home page
```

### **2. Registration Flow**
```
User fills registration form
  ↓
RegistrationComponent validates form (including password match)
  ↓
AuthenticationService.register() called
  ↓
HTTP POST to /api/users/register
  ↓
Backend creates user & returns JWT token + user data
  ↓
Token stored in UserSessionService
  ↓
User redirected to home page
```

### **3. Protected Route Access**
```
User navigates to protected route
  ↓
AuthGuard checks AuthenticationService.isAuthenticated
  ↓
If authenticated: Allow access
  ↓
If not authenticated: Redirect to /auth/login
```

### **4. Logout Flow**
```
User clicks logout in header
  ↓
AppHeaderComponent.handleLogout() called
  ↓
AuthenticationService.logout() clears session
  ↓
User redirected to /auth/login
```

## Key Components

### **AuthenticationService**
- Centralized authentication logic
- Handles login, register, profile operations
- Manages token storage via UserSessionService
- Provides `isAuthenticated` getter
- Error handling with user-friendly messages

### **UserSessionService**
- Manages user session data in localStorage
- Stores: `accessToken`, `userSession`, `rememberMe`, `userCredentials`
- Type-safe with new `User` interface from `auth.models.ts`

### **Auth Guards**
- **AuthGuard**: Protects routes requiring authentication
- **GuestGuard**: Prevents logged-in users from accessing login/register pages

### **HTTP Interceptor**
- Automatically injects `Authorization: Bearer <token>` header
- Handles errors globally
- Shows loading indicators

## Environment Configuration

### **Development** (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:2017'
};
```

### **Production** (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.planora.com' // Update with your production URL
};
```

## Usage Examples

### **Check Authentication Status**
```typescript
if (this.authenticationService.isAuthenticated) {
  // User is logged in
}
```

### **Get Current User**
```typescript
const user = this.authenticationService.currentUser;
// or
const user = this.userSessionService.userSession;
```

### **Login Programmatically**
```typescript
this.authenticationService.login(email, password).subscribe({
  next: (response) => {
    if (response.success) {
      // Login successful
      this.router.navigate(['/']);
    }
  },
  error: (error) => {
    // Handle error
  }
});
```

### **Protect Routes**
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard] // Requires authentication
}
```

## Error Handling

- **Validation Errors**: Displayed inline in forms
- **API Errors**: Shown via SnackBarService
- **Network Errors**: Handled by HTTP interceptor
- **401 Unauthorized**: Automatically redirects to login

## Security Features

- ✅ JWT token stored in localStorage
- ✅ Token automatically injected in HTTP requests
- ✅ Route guards prevent unauthorized access
- ✅ Password validation (min 6 characters)
- ✅ Email validation
- ✅ Password confirmation matching
- ✅ Remember me functionality (stores credentials securely)

## Testing the Integration

1. **Start Backend**: `npm run dev` (runs on port 2017)
2. **Start Frontend**: `ng serve`
3. **Test Login**:
   - Navigate to `/auth/login`
   - Use: `admin@planora.com` / `admin123`
4. **Test Registration**:
   - Navigate to `/auth/registration`
   - Fill form and submit
5. **Verify**:
   - Token stored in localStorage
   - User info displayed in header
   - Protected routes accessible
   - Logout works correctly

## Troubleshooting

### **CORS Issues**
- Ensure backend has CORS enabled for frontend origin
- Check `cors` middleware in `server.js`

### **Token Not Sent**
- Verify HTTP interceptor is registered in `app.module.ts`
- Check `UserSessionService.accessToken` is set

### **401 Unauthorized**
- Token may be expired
- Check token format in localStorage
- Verify backend JWT_SECRET matches

### **User Not Displayed in Header**
- Check `app-header` component receives user data
- Verify `UserSessionService.userSession` is set
- Check console for errors

## Next Steps

- [ ] Add token refresh mechanism
- [ ] Implement "Remember Me" with secure storage
- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Add social login (Google, GitHub, etc.)
- [ ] Add 2FA support

