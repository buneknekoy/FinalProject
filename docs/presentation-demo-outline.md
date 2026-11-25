# FitConnect presentation and demo outline

Suggested 10–15 minute classroom presentation, matching the Lab 03–06 design work.

## 1. Problem and system goal (1 minute)

Small gyms often rely on paper or spreadsheets for member records, schedules, bookings and progress. FitConnect puts those tasks behind one API and database.

## 2. Intended users and features (1 minute)

Introduce Members, Trainers, Front Desk/Staff and Administrators. Show class scheduling and booking, membership plans and renewals, workout/progress history, and payment record keeping.

## 3. Architecture (2 minutes)

Walk through the Lab 03 diagram: web/mobile client → NestJS REST API → JWT authorization → TypeORM → MySQL. Mention that email reminders are a planned integration point, not a configured external service in this starter.

## 4. Database design (2 minutes)

Use the ERD to explain the plan/member and trainer/class one-to-many links, the booking junction between members and classes, and the one-to-one booking/payment relation. Show how membership history and fitness measurements are stored as separate records.

## 5. API and security (2 minutes)

Show `/api/v1`, resource naming, JSON validation, bcrypt password hashing, JWT bearer tokens, role-based access and why errors differ: 401 means no valid login, 403 means insufficient role, and 409 means a conflict such as a full class or duplicate payment.

## 6. Live Postman demo (4–5 minutes)

1. Log in as the seeded Admin; show the token is saved to `{{token}}`.
2. List plans, trainers, classes and members.
3. Create a booking for the sample member; retrieve it and add a payment record.
4. Add one membership period, workout and progress measurement.
5. Demonstrate one validation error and one authorization/conflict response.

Do not display secrets on screen. Set Postman login values privately before recording. The local demo account password is the value entered as `SEED_ADMIN_PASSWORD` in `.env`.

## 7. Limitations and next steps (1 minute)

Payment gateway processing, notifications, QR check-in, frontend, reporting, production migrations and concurrency-safe class reservation are future work. Explain how an HTTPS deployment, database transactions and automated integration tests would harden the next version.

## Closing

FitConnect centralizes gym operations while keeping identity, business rules and related data connected through a documented REST API and relational database.
