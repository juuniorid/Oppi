# API Documentation

## Authentication

All API endpoints (except `/v1/auth/google` and `/v1/auth/google/callback`) require
a valid JWT token stored in the `jwt` cookie.

### Login Flow

1. User visits `/login` on frontend
2. Click "Sign in with Google" which redirects to `GET /v1/auth/google`
3. Backend redirects to Google OAuth consent screen
4. Google redirects to `GET /v1/auth/google/callback`
5. Backend validates token and sets `jwt` cookie
6. Redirects to `/dashboard`

## Endpoints

### Auth

- `GET /v1/auth/google` - Initiate Google OAuth flow
- `GET /v1/auth/google/callback` - OAuth callback handler
- `GET /v1/auth/me` - Get current user profile (requires auth)
- `GET /v1/auth/logout` - Clear JWT cookie

### Posts

- `POST /v1/posts` - Create announcement (teacher only)
  ```json
  {
    "title": "string",
    "content": "string",
    "groupId": number
  }
  ```
- `GET /v1/posts/group/:id` - Get all posts for a group

### Children

- `GET /v1/children/group/:id` - Get all children in a group (teacher only)

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": 400
}
```
