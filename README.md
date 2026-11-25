# FitConnect API Starter

Starter backend for **FitConnect: An Integrated Gym Membership, Class Scheduling & Fitness Tracking System**. It follows the uploaded Lab 03 architecture, Lab 04 data dictionary, Lab 05 REST API resource names and `/api/v1` prefix, and Lab 06 JWT and role based access design.

## Included

- NestJS REST API, TypeORM entities, MySQL schema, validation and seed script.
- JWT login with bcrypt password hashes, one hour token default, role checks, request throttling and safe error responses from NestJS.
- Plans, members/accounts, trainers, fitness classes, bookings and nested booking payments from the lab API design.
- Membership periods, workout logs and progress measurements as FitConnect extensions.
- Postman collection and safe Postman environment, architecture notes, ERD and demo presentation outline.

## Requirements

- Node.js 20 or newer and npm.
- MySQL 8.0+ (the SQL uses enforced `CHECK` constraints).

## Setup and run

1. Create a MySQL user and database, or use the included schema script. From a MySQL client, run `database/schema.sql`. The script creates the `fitconnect` database and all required tables.
2. Copy `.env.example` to `.env`. Fill in your local MySQL connection values. Replace both seed passwords with your own unique passwords of at least 12 characters. Keep `.env` private; it is ignored by Git.
3. Install packages with `npm install`.
4. Add starter records and the admin/member users with `npm run seed`. The seeded demo member uses email `member@fitconnect.local`; its password is the value you set in `SEED_DEMO_MEMBER_PASSWORD`.
5. Start the API with `npm run start:dev`. It listens on `http://localhost:3000/api/v1` by default.
6. In Postman, import `postman/FitConnect.postman_collection.json` and `postman/FitConnect.local.postman_environment.json`. Set `adminEmail`, `adminPassword` and, when needed, `memberPassword` in the environment, then run **Auth / Login**. The collection saves the JWT automatically.

To build for production run `npm run build`, then `npm run start:prod`. Run `npm test` for the Nest test runner; no test suite is included in this starter yet. Use HTTPS through a reverse proxy before exposing a deployment to the internet.

## First Postman demo sequence

1. Auth / Login (admin) saves `{{token}}`.
2. Plans / List, Trainers / List, Classes / List and Members / List. The collection captures the first returned IDs when possible.
3. Create a class booking, then retrieve it and create/read its payment.
4. Create a membership period and add a workout and progress entry.
5. Show validation and access checks: send a protected request without a token for 401, log in as a non-admin and attempt an admin-only change for 403, or try a duplicate booking/payment for 409.

## API coverage

The Lab 05 resources are under `/api/v1`: `/auth`, `/members`, `/membership-plans`, `/trainers`, `/classes`, `/bookings`, and nested `/bookings/:id/payment`. FitConnect extensions use `/memberships`, `/workouts`, and `/progress`. The full runnable request set is in the Postman collection.

Roles are `Member`, `Trainer`, `Staff`, and `Admin`. Plan reads are public. Member listing and management are staff/admin; member deletion, plan management, trainer management, and permanent booking deletion are admin-only. Booking creation and workout/progress writes are scoped to the signed-in member when the token belongs to a member account.

## Database and design notes

See `docs/architecture-and-erd.md` for the component flow, entity relationships, role matrix, and endpoint notes. The six Lab 04 entities remain recognizable; `users` supplies credential and role records, `member_memberships` stores membership history, and `workouts`/`progress_entries` provide tracking history. SQL foreign keys and unique constraints protect key relationships. TypeORM synchronization is deliberately disabled; the provided schema script is the starting schema.

## Limitations to know

- Payments are records only. No card processing, GCash integration, receipts, refunds, or PCI handling is included.
- Email/SMS notification is represented in the architecture notes only; no provider credentials or external service integration is configured.
- QR check-in, reporting dashboards, file uploads and frontend/mobile screens are outside this backend starter.
- Class seat checks are suitable for a local class demo. A production system should serialize competing reservations in a database transaction and add idempotency, audit logging, and integration tests.
- The class uses a single controller for a compact starter; features are grouped by route/resource sections and share TypeORM entities. Split each section into dedicated Nest modules as the project grows.
- Use migrations and reviewed secrets management for deployment. The schema script is for a fresh local database and is not an upgrade migration.

## Credentials and safety

No real account or service credentials are included. `.env.example` and the Postman environment contain placeholders only. The seed command refuses placeholder seed passwords. Never commit `.env` or use sample passwords outside a disposable local demonstration.
