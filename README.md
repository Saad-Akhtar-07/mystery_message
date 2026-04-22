# Mystery Message

Anonymous messaging app built with Next.js 16, MongoDB, Zod, Resend, and Auth.js v5 (Credentials provider).

## Auth Architecture

The project now uses a credentials flow with username and password:

1. Input is validated with Zod (`signInSchema`) in both server action and Auth.js authorize callback.
2. User is fetched from MongoDB by username.
3. Password is verified with bcrypt.
4. Unverified users are blocked from login with a dedicated auth error code.
5. On successful login, user fields are written into JWT and then copied into the session.

This lets the app read common user data from session/token without additional DB calls on every request.

## Implemented Auth Files

- `auth.ts`: Main Auth.js v5 config (providers, callbacks, signIn/signOut/auth exports)
- `src/app/api/auth/[...nextauth]/route.ts`: Auth route handlers
- `proxy.ts`: Route guarding and redirect strategy
- `src/types/next-auth.d.ts`: Session/JWT type augmentation
- `src/components/auth/auth-provider.tsx`: Session provider for client-side context
- `src/hooks/use-auth-session.ts`: Small helper hook around `useSession`
- `src/app/sign-in/*`: Credentials sign-in UI + server action

## Environment Variables

Create/update `.env.local` with:

```bash
MONGODB_URI=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your_random_secret
AUTH_TRUST_HOST=true
```

`AUTH_SECRET` is mandatory for Auth.js token/session encryption.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available Routes

- `/`: Landing page
- `/sign-in`: Credentials login
- `/sign-up`: Placeholder page (signup API is ready)
- `/dashboard`: Protected route (requires session)
- `/api/auth/signup`: Existing OTP-based signup API
- `/api/auth/[...nextauth]`: Auth.js endpoints

## Quality Checks

```bash
npm run lint
npm run build
```

Both currently pass.
