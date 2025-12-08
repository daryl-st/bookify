# BookFlow - Professional Booking & Scheduling Platform

A comprehensive booking and scheduling platform built with Next.js, featuring customer login, admin dashboard, payment integration, calendar sync, cancellation logic, and automated email notifications.

## Features

- ✅ **Customer Portal** - Dedicated login and booking management for customers
- ✅ **Admin Dashboard** - Comprehensive admin interface with analytics
- ✅ **Payment Integration** - Secure payment processing with multiple gateways
- ✅ **Calendar Sync** - Seamless integration with Google Calendar, Outlook, and more
- ✅ **Cancellation Logic** - Smart cancellation policies with automated refunds
- ✅ **Email Notifications** - Automated email and SMS notifications
- ✅ **Clean API Structure** - RESTful APIs with modular services
- ✅ **Production-Ready** - Built with best practices and enterprise-grade reliability

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Theme**: Dark Violet (no gradients)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── page.tsx           # Landing page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and types
│   └── types/            # TypeScript type definitions
└── services/             # Business logic services
    ├── booking.service.ts
    ├── payment.service.ts
    ├── calendar.service.ts
    └── email.service.ts
```

## Services

The platform uses a modular service architecture:

- **BookingService** - Manages booking creation, cancellation, and availability
- **PaymentService** - Handles payment processing and refunds
- **CalendarService** - Manages calendar synchronization
- **EmailService** - Sends automated notifications

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
