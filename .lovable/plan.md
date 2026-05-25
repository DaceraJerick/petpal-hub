# Vet Appointment System — Full Build Plan

Transform the current app into a complete veterinary appointment management platform with two user types (Doctor, Client), pet management, appointment booking against real registered doctors, and a doctor dashboard with accept/reject flows and real-time status updates.

## 1. Database (Supabase migration)

**Extend `app_role` enum** to include `'doctor'` and `'client'` (keep existing `admin`, `owner`).

**New table `doctors`** (one row per doctor user):
- `user_id` (unique, references auth users)
- `full_name`, `email`, `specialization`, `clinic_address`, `contact_number`, `photo_url`
- timestamps

**Extend `profiles`** with `contact_number` (clients use existing `profiles` + `name`).

**Extend `appointments`**:
- Add `doctor_id` (references `doctors.id`, nullable for back-compat)
- Extend `appointment_status` enum with `'accepted'` and `'rejected'` (keep existing `pending`, `completed`, plus existing values)

**RLS policies**:
- `doctors`: anyone authenticated can SELECT (for booking dropdown); each doctor can INSERT/UPDATE their own row (`auth.uid() = user_id`); admins manage all.
- `appointments`: keep existing client policies; add doctor policies — doctors can SELECT/UPDATE appointments where `doctor_id` matches their `doctors.id` (via `has_role(auth.uid(),'doctor')` + subquery).
- `pets`: add SELECT policy so a doctor can view pets belonging to clients who booked with them.
- `profiles`: already viewable by all authenticated users — fine for doctor to see client name/contact.

**Trigger update**: modify `assign_default_role()` to read `raw_user_meta_data->>'role'` and assign `'doctor'` or `'client'` (default `'client'`). When role is doctor, also insert into `doctors` table from metadata.

**Realtime**: enable `REPLICA IDENTITY FULL` and add `appointments` to `supabase_realtime` publication.

**Storage**: reuse existing `pet-photos` bucket; add a public `doctor-photos` bucket with RLS for doctor uploads.

## 2. Auth & Registration UI

**RegisterPage**: add a role selector (Doctor / Client with Pet) at top. Renders one of two forms:

- **Client form**: full name, email, password, contact number → signUp with metadata `{ role: 'client', full_name, contact_number }`. On success, redirect to `/onboarding` (existing) which prompts to add first pet.
- **Doctor form**: full name, email, password, specialization, clinic address, contact number, profile photo upload → signUp with metadata `{ role: 'doctor', ...all fields, photo_url }`. Upload photo to `doctor-photos` bucket before signUp metadata. Redirect to `/doctor` dashboard.

**useAuth**: expose current user's role (query `user_roles`), expose `isDoctor`, `isClient`.

**Routing (App.tsx)**:
- Add `/doctor` route protected + doctor-only.
- Redirect logic in `HomePage`/`ProtectedRoute`: if user role is `doctor`, redirect away from client pages to `/doctor`.

## 3. Client Booking Flow

Update **BookAppointmentPage** (or add a new "Book with Doctor" path):
- Add a Doctor selector that queries `doctors` table (shows name, specialization, clinic, photo).
- Keep existing clinic selection optional or replace with doctor-based flow.
- Save `doctor_id` on the appointment along with pet, date, time, reason.
- Status defaults to `pending`.

## 4. Doctor Dashboard (`/doctor`)

New `DoctorDashboardPage` with:
- **Stats cards**: pending count, today's accepted, completed, total.
- **Tabs**: Requests (pending) · Upcoming (accepted, future) · History (completed/rejected/past).
- **Appointment cards/table**: client name + contact (from `profiles`), pet info (from `pets`), date/time, reason.
- **Actions**: Accept, Reject, Mark Completed (UPDATE `appointments.status`).
- **Schedule view**: list view of upcoming week.
- Uses Supabase Realtime channel on `appointments` filtered by `doctor_id` to live-update across both panels.

Client side: **AppointmentsPage** also subscribes to realtime updates so status changes appear instantly with a colored badge (pending/accepted/rejected/completed).

## 5. UI/UX

- Keep existing teal + coral design tokens, Nunito/Poppins fonts.
- Doctor dashboard uses card grid on desktop, stacked on mobile.
- Smooth Framer Motion transitions on cards and tab switches.
- Status badges color-coded via design tokens.

## Technical notes

- Doctor signup uploads the photo using the anon client (bucket has public insert policy keyed by future auth uid would fail pre-signup) — workaround: sign up first, then upload photo and update `doctors.photo_url` from the client after first sign-in (handled in a small `DoctorOnboardingPage` if email confirmation is on, otherwise inline).
- Migration enum changes use `ALTER TYPE ... ADD VALUE IF NOT EXISTS` in separate statements (Postgres requires them outside transactions; split migration or use DO blocks).
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;` + `ALTER TABLE public.appointments REPLICA IDENTITY FULL;`.
- No new external dependencies — uses existing stack (React, Supabase, Tailwind, shadcn, Framer Motion, react-query).

## Out of scope (unless asked later)

- In-app messaging between doctor and client
- Payment processing
- Doctor availability/time-slot management (free-form time entry for now)
- Email notifications (toast + in-app only)

Approve to proceed and I'll ship the migration first, then the UI in one pass.
