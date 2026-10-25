# SustainFlow — ESG Reporting

A web application for managing environmental, social, and governance data and sustainability reporting. The codebase also uses the internal name **GreenMetrics**.

## Project areas

- Organization and user management
- Sustainability metrics and reporting
- Dashboard visualizations
- Authentication and session handling
- Subscription integration with Stripe

This is a development project. Reporting features should be reviewed against the applicable reporting requirements before operational use.

## Technology

Next.js 16, React 19, TypeScript, SQLite through better-sqlite3, Chart.js, and Stripe.

## Local setup

Use a Node.js release compatible with the versions in [package.json](package.json). Native better-sqlite3 dependencies may require platform build tools.

```bash
git clone https://github.com/patelmup1/SustainFlow-ESG-Reporting.git
cd SustainFlow-ESG-Reporting
npm ci
```

Create a local `.env.local` and set a unique `JWT_SECRET`. Inspect the integration routes for any additional environment variables needed by the features you use; keep credentials out of Git.

The application uses `src/db/greenmetrics.db`. To initialize a local database, review and run:

```bash
node scripts/init-db.js
npm run dev
```

The initialization script seeds a development administrator with email `admin@greenmetrics.com` and password `admin`. Replace or remove that account before exposing the application. The current authentication code also has a fallback JWT secret; configure your own secret.

Open [localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm start` | Start an existing production build |

## Repository guide

- [src/app](src/app): pages and API routes
- [src/components](src/components): interface components
- [src/lib](src/lib): authentication, database, plans, and supporting services
- [src/db/schema.sql](src/db/schema.sql): database schema
- [scripts](scripts): initialization and database maintenance tools

Review database scripts before running them against existing data, and back up the database first.

## Feedback

Report issues through [GitHub Issues](https://github.com/patelmup1/SustainFlow-ESG-Reporting/issues) with steps to reproduce and relevant error messages.
