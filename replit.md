# ScheduleOut - Fitness Management Platform

## Overview

ScheduleOut is a comprehensive fitness management platform that serves three distinct user types: coaches, clients, and gym owners. The application provides role-based dashboards and functionality for workout planning, client management, exercise libraries, and fitness tracking. Built as a full-stack TypeScript application with a React frontend and Express backend, it uses Supabase PostgreSQL for data persistence and offers a modern, responsive UI powered by shadcn/ui components.

## Recent Changes (August 2025)

- ✓ Successfully migrated from Replit Agent to standard Replit environment
- ✓ Integrated Supabase PostgreSQL database with REST API for data operations
- ✓ Configured SupabaseStorage class using direct HTTP calls for reliable API integration
- ✓ Fixed authentication system with service role key for server-side operations
- ✓ Database schema successfully created in Supabase with all fitness-related tables
- ✓ User registration and login now working with Supabase backend
- ✓ Exercise library API functioning correctly with sample data
- ✓ Application running successfully on port 5000 with full Supabase integration
- ✓ Replaced problematic Supabase JS client with direct HTTP fetch calls for better reliability

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI System**: shadcn/ui component library with Radix UI primitives and Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod schema validation
- **Design Approach**: Component-based architecture with role-specific dashboards and shared UI components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based endpoints for authentication, user management, and fitness data
- **Middleware**: Custom logging middleware for API requests and error handling
- **Development**: Hot reloading with Vite integration in development mode

### Database & ORM
- **Database**: Supabase PostgreSQL with REST API integration
- **Data Access**: Supabase JavaScript client for type-safe database operations
- **Schema**: Comprehensive fitness domain model including users, gyms, coaches, clients, exercises, workout plans, and workout tracking
- **Storage Layer**: SupabaseStorage class implementing IStorage interface for consistent API access

### Authentication & Authorization
- **Strategy**: Custom session-based authentication with role-based access control
- **User Types**: Three distinct roles (coach, client, gym owner) with different permissions and dashboard views
- **Session Storage**: PostgreSQL session store with connect-pg-simple
- **Security**: Password hashing and secure session management

### Development Environment
- **Build System**: Vite for frontend bundling and esbuild for backend compilation
- **Development Tools**: TypeScript compilation checking, hot reloading, and Replit integration
- **Code Organization**: Monorepo structure with shared schema types between frontend and backend
- **Path Aliases**: Configured path aliases for clean imports across client, shared, and server code

## External Dependencies

### Core Infrastructure
- **Database**: Supabase PostgreSQL database with REST API for scalable data storage
- **API Client**: Supabase JavaScript client for type-safe database operations
- **Session Store**: PostgreSQL-based session storage for user authentication

### UI & Design System
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation and formatting

### Development & Build Tools
- **Frontend Bundling**: Vite with React plugin and runtime error overlay
- **Backend Compilation**: esbuild for fast TypeScript compilation
- **Development Platform**: Replit-specific plugins for cartographer and development banner

### Form & Validation
- **Form Library**: React Hook Form for performant form handling
- **Schema Validation**: Zod for runtime type checking and form validation
- **Form Integration**: Hookform resolvers for seamless Zod integration

### State Management & HTTP
- **Server State**: TanStack React Query for caching, synchronization, and background updates
- **HTTP Client**: Native fetch API with custom wrapper for consistent error handling
- **Type Safety**: Shared TypeScript types between frontend and backend for API contracts