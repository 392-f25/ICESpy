# Swarm 11/18/2025

## Priorities
- Refactor code (currently in monolithic Maps.tsx and uses CSS instead of Tailwind)
- Come up with schema for Sightings and Users
  - Add corroboration feature
- Edit Sighting creation and display to include the necessary data for the user as decided by the new types file
- Create Firebase Realtime database
  - Make it so other users can see a pin that one user drops

## Accomplished
- Accomplished all tasks except for database syncing
  - Firebase Realtime Database is created, a separate branch called `initial-firebase-attempt` stores our (not yet functional) implementation of `firebase.ts`

## Bugs/Questions
- Location is displayed as latitude/longitude
- How will user location preferences be decided?
  - X-mile radius around their current lat/lon
  - User's zip code + surrounding zip codes
  - Custom selected zip codes
  - Selected towns
- Google Maps UI:
  - Clicking out of the sighting creation form drops a new pin at the new mouse position. Maybe it should exit the form first and then the user clicks again to drop a new pin (less confusing for user if they accidentally click out)
  - Clicking on landmarks gives you Google's own modal about the landmark rather than dropping a pin. Should we remove this?

## Future Features
- Get cross-device sync using database working
- Filtering based on:
  - Distance
  - Selected zip codes
  - Tags of some sort (e.g. severity of incident, number of agents, etc.)
- Email notifications
  - Based on user's personal filters
- Resources page (know your rights files)
- Comments/additional image uploads to support corroborations