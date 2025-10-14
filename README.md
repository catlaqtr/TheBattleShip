SeaStrike Battleship

A full-stack Battleship game with a Spring Boot + MySQL backend and a React + TypeScript + Vite frontend.
Supports two players, JWT authentication, ship placement with validation, turn-based shots, and win detection.

Features
Backend (Spring Boot + MySQL)

Create and join games

Place ships with validation (bounds, overlap, one of each type)

Fire shots with turn enforcement (HIT / MISS / SUNK)

JWT authentication with BCrypt password hashing

Flyway migrations for database schema

Integration tests with H2 (in-memory)

Frontend (React + Vite + Tailwind)

Responsive UI with Tailwind CSS

React Router for navigation

TanStack Query for server state & caching

React Hook Form + Zod for forms & validation

Toast system for user feedback

Framer Motion animations

Code-splitting with React.lazy + Suspense

License

MIT
