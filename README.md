# MetriWeigh

MetriWeigh is an MVP web application for laboratory management of Non-Automatic Weighing Instrument test workflows under an OIML R-76 evaluation process.

## Stack

- React, Vite, TypeScript
- React Router
- React Hook Form and Zod
- Recharts
- Firebase Authentication, Firestore, Storage, and Hosting
- Separate CSS files, no Tailwind CSS

## Important Rules Notice

This MVP intentionally does not encode official OIML R-76 formulas, tolerances, limits, or regulatory decisions. The current rule registry contains a clearly marked demo rule that compares calculated indication error with a manually supplied permissible error. Replace `src/services/ruleRegistry.ts` with verified regulatory modules before using the app for conformity decisions.

## Firestore Collections

The app is structured around these top-level collections:

- `users`
- `instruments`
- `tests`
- `testObservations`
- `laboratories`
- `referenceEquipment`
- `reports`
- `attachments`
- `auditLogs`

## Local Development

```bash
npm install
npm run dev
```

Without Firebase environment variables, the app runs in demo mode with seeded local data and a local demo session.

To enable Firebase, copy `.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*` values from your Firebase web app.

## Verification

```bash
npm run lint
npm run build
```

## Deployment

```bash
npm run build
firebase deploy
```

Firebase Hosting is configured in `firebase.json`. Firestore and Storage security rules are included as a starting point and should be reviewed against the laboratory's final access-control policy.
