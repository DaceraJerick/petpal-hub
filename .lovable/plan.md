
# Larana Pet Care Hub — Full Build Plan

## 1. Foundation & Design System
- Set up custom color palette (Teal #00B4A6, Coral #FF7B54, etc.) and typography (Nunito + Poppins) in Tailwind config
- Create mobile-first layout shell with bottom nav (Home, Feed, +, Appointments, Profile) and desktop top nav
- Build reusable components: rounded cards, pill badges, gradient headers, loading skeletons, empty states

## 2. Authentication & Onboarding
- Enable Lovable Cloud with Supabase Auth (email/password + Google OAuth)
- Create Login, Register, and Forgot Password pages
- Build guided onboarding flow (3 steps: profile setup → add first pet → set first feeding schedule)
- Create `user_roles` table with RLS and `has_role()` security definer function

## 3. Database Schema
Create all tables via migrations:
- `profiles` (linked to auth.users), `user_roles`
- `pets` (name, species, breed, dob, weight, gender, photo_url, microchip_id, allergies, notes)
- `feeding_schedules`, `feeding_logs`
- `vet_clinics`, `appointments`
- `vaccines`, `medications`, `health_records`
- `services`, `service_bookings`
- `notifications`
- Set up RLS policies so users only access their own data; admins/vets get broader access

## 4. Pet Profile Management
- Pet list page with grid cards and "+ Add Pet" button
- Pet creation/edit form with photo upload (Supabase Storage)
- Pet detail page with health score card and tabs (Health, Feeding, Records)
- Delete pet with cascade confirmation

## 5. Feeding Plans
- Create/edit daily meal schedules per pet (time, food type, portion)
- Daily feeding log with progress bar (mark meals as given/skipped)
- Feeding history view (weekly/monthly)
- Nutritional tip cards based on species/breed (static content)

## 6. Vet Appointment Booking with Map
- Vet clinics browsing with Leaflet.js map integration showing clinic pins
- Appointment booking flow: select clinic → pick date/time → enter reason
- Appointment list with status badges (Pending, Confirmed, Completed, Cancelled)
- Cancel/reschedule functionality
- Upcoming and past appointment history

## 7. Health & Care Records
- Vaccine tracker with next-due date tracking
- Medication tracker (name, dosage, frequency, duration)
- Health notes and vet visit summaries
- File upload for health documents (PDF, images) via Supabase Storage
- Breed-specific care guide articles (static content pages)

## 8. Pet Services Marketplace
- Service categories: Grooming, Boarding, Dog Walking, Pharmacy, Training
- Service listing cards with name, description, price, location, rating
- Service detail page with booking form
- Ratings and reviews system for completed services

## 9. Dashboard (Home)
- Today's schedule: feeds, meds, appointments for the day
- Pet carousel with health score overview per pet
- Quick action buttons (Feed, Vet, Medicine, Grooming)
- Notification bell with unread count
- Upcoming reminders panel (next 7 days)

## 10. Notifications System
- In-app notification center with read/unread states and type filtering
- Edge function for sending email notifications via Lovable's built-in email (appointment confirmations, medication reminders, vaccine due dates)
- Notification triggers on appointment booking, status changes, and upcoming events

## 11. Admin Panel
- Role-gated `/admin` route
- Stats cards: total users, pets, weekly appointments, monthly bookings
- User management table with search, role filter, deactivate ability
- Service management (add/edit/remove listings)
- Simple analytics charts using Recharts

## 12. Profile & Settings
- User profile page with avatar, stats, and settings
- Logout functionality
- Pet overview stats

## Design Details
- **Colors**: Primary Teal #00B4A6, Dark Teal #007D75, Coral #FF7B54, Background #F4FFFE
- **Fonts**: Nunito (headings, 700-900 weight), Poppins (body, 400-500 weight)
- **Components**: 20px rounded cards with teal shadow, pill badges, gradient teal headers, animated loading skeletons, friendly empty states
- **Mobile**: Bottom nav with raised center "+" action button
- **Desktop**: Top navigation bar
- **Transitions**: Smooth page transitions, toast notifications (bottom center, 3s auto-dismiss)
