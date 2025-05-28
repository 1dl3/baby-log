# Baby Protocol App

A web application for tracking and managing baby care activities, including diaper changes, feedings, and nursing sessions.

## Features

- User registration and email verification
- Baby profile management
- QR code generation for quick activity logging
- Activity tracking for:
  - Diaper changes
  - Feedings (bottle and nursing)
  - Nursing sessions
- Statistics and visualizations
- Mobile-friendly interface

## Tech Stack

- SvelteKit
- TypeScript
- PostgreSQL
- Drizzle ORM
- Tailwind CSS
- Chart.js

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- SMTP server for email verification

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/baby_protocol
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
APP_URL=http://localhost:5173
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/baby-protocol.git
cd baby-protocol
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:migrate
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Register a new account
2. Verify your email address
3. Add your baby's information
4. Generate QR codes for different activities
5. Scan QR codes to quickly log activities
6. View statistics and trends in the dashboard

## QR Code Usage

1. Generate QR codes from the dashboard
2. Print and place them in relevant locations (e.g., changing table, kitchen)
3. Scan with your phone's camera to quickly log activities
4. Fill in the required information
5. Save the log entry

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.



  Project next steps ─────────────────────────────────────────────────────╮
│                                                                          │
│  1: cd baby-protocoll                                                    │
│  2: git init && git add -A && git commit -m "Initial commit" (optional)  │
│  3: yarn run dev --open                                                  │
│                                                                          │
│  To close the dev server, hit Ctrl-C                                     │
│                                                                          │
│  Stuck? Visit us at https://svelte.dev/chat                              │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────╯
│
◇  Add-on next steps ──────────────────────────────────────────────────╮
│                                                                      │
│  drizzle:                                                            │
│  - You will need to set DATABASE_URL in your production environment  │
│  - Run yarn run db:start to start the docker container               │
│  - Run yarn run db:push to update your database schema               │
│                                                                      │
├──────────────────────────────────────────────────────────────────────╯
│
└  You're all set!