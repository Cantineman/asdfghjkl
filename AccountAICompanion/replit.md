# AI Accounting Pro - Replit Development Guide

## Overview

This is a full-stack AI-powered accounting SaaS application designed for accountants to manage multiple clients. The application automates bookkeeping tasks, generates insights, and provides tools for invoicing, expense management, payroll, and reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between frontend and backend:

- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Deployment**: Configured for both development and production builds

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: React Router for client-side navigation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system using violet/purple theme
- **State Management**: TanStack Query for server state, local React state for UI
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with consistent error handling
- **Authentication**: Simple mock authentication (ready for JWT implementation)
- **Middleware**: Request logging and error handling

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Comprehensive schema covering users, clients, invoices, expenses, employees, reports, integrations, and settings
- **Migrations**: Drizzle Kit for schema management

## Data Flow

1. **Authentication Flow**: Login → JWT token storage → Protected route access
2. **Client Management**: Onboarding wizard → Integration setup → Data import
3. **Real-time Updates**: TanStack Query for automatic data synchronization
4. **AI Integration**: Placeholder endpoints for AI-powered insights and automation

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component collection
- **State Management**: TanStack Query for server state
- **Form Validation**: React Hook Form + Zod
- **Charts**: Chart.js integration for data visualization
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL support
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Validation**: Zod for runtime type checking
- **Development**: tsx for TypeScript execution

### Planned Integrations
- **Banking**: Plaid for bank account connections
- **Payments**: Stripe for payment processing
- **Payroll**: Gusto API integration
- **AI Services**: OpenAI for intelligent insights
- **Automation**: Make.com for workflow automation

## Deployment Strategy

### Development
- Vite dev server for frontend hot reloading
- tsx for backend TypeScript execution
- Concurrent development with proper proxy setup

### Production Build
- Frontend: Vite build with optimized assets
- Backend: esbuild for Node.js bundle creation
- Static file serving integrated with Express

### Environment Configuration
- Environment-based configuration
- Database URL from environment variables
- Production-ready error handling and logging

## Key Features

### Core Functionality
1. **Multi-client Management**: Accountants can manage multiple client accounts
2. **Automated Bookkeeping**: AI-powered categorization and data entry
3. **Integration Hub**: Connect banking, payroll, and payment systems
4. **Real-time Dashboard**: Cash flow monitoring and financial insights
5. **Comprehensive Reporting**: Automated report generation with AI analysis

### User Experience
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Progressive Enhancement**: Graceful fallbacks and loading states
- **Accessibility**: Semantic HTML and ARIA compliance
- **Performance**: Optimized bundles and lazy loading

### Development Features
- **Type Safety**: End-to-end TypeScript coverage
- **Code Quality**: ESLint and proper project structure
- **Hot Reloading**: Fast development cycle
- **Error Handling**: Comprehensive error boundaries and API error handling

This architecture provides a solid foundation for building a professional-grade accounting SaaS platform with room for scaling and adding advanced AI features.