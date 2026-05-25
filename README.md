# PetPal Hub - Full-Stack Pet Care Management App

PetPal Hub is a comprehensive management system for pet owners and caregivers, featuring appointment booking, health records tracking, and feeding management.

## Features

- **Pet Profiles**: Manage detailed records for all your pets.
- **Appointment Booking**: Schedule and track veterinary visits.
- **Health Records**: Keep track of vaccinations, medications, and health history.
- **Feeding Management**: Set up and monitor feeding schedules.
- **Onboarding**: Simple setup for new users and their pets.

## Tech Stack

- **Vite**
- **TypeScript**
- **React**
- **shadcn-ui**
- **Tailwind CSS**
- **Supabase**

## Getting Started

1. Clone the repository
2. Install dependencies: `npm i`
3. Start development server: `npm run dev`
## Admin account setup
If you want to use the admin panel, make sure the admin user exists in Supabase Auth and has the `admin` role in `public.user_roles`.

If the user exists but the admin role is missing, run this query in Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
WHERE u.email = 'admin@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'admin'
  );
```

If you need a new admin user, create `admin@gmail.com` in Supabase Auth and set its password to `admin@gmail.com`.
---
*Built with Lovable*
