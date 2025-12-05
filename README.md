# Xandeum pNode Analytics

A web-based analytics platform for Xandeum pNodes, providing real-time monitoring of network health, storage metrics, and individual pNode performance.

## Features

- **Dashboard** - Network overview with key metrics, health indicators, and top pNodes
- **pNode List** - Searchable, filterable list of all pNodes with sorting and pagination
- **pNode Details** - Individual pNode view with uptime charts, storage visualization, and detailed stats
- **Network Health** - Comprehensive network status and storage distribution
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Real-time Updates** - Auto-refresh with TanStack Query polling
- **Responsive Design** - Mobile-friendly layout

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd xandman

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# API Configuration (set when real pRPC API is available)
NEXT_PUBLIC_API_URL=https://api.xandeum.network

# Enable mock data (set to "false" for real API)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Site URL (update for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── pnodes/            # pNode list and details
│   └── network/           # Network health page
├── components/
│   ├── ui/                # Base UI components
│   ├── layout/            # Header, Footer, ThemeToggle
│   ├── charts/            # Chart components
│   └── common/            # Shared components
├── features/
│   ├── pnodes/            # pNode feature module
│   └── network/           # Network stats module
├── lib/
│   ├── api/               # API abstraction layer
│   └── queries/           # TanStack Query setup
└── providers/             # React context providers
```

## API Integration

The platform uses a flexible API abstraction layer that supports both mock data and real pRPC API:

- **Mock Mode** (default): Uses realistic generated data for development
- **Real API Mode**: Connects to Xandeum pRPC when `NEXT_PUBLIC_USE_MOCK_DATA=false`

### Switching to Real API

When the Xandeum pRPC API documentation becomes available:

1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local`
2. Set `NEXT_PUBLIC_API_URL` to the actual API endpoint
3. Update `src/lib/api/pnode-api.ts` if the API response format differs

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type check
npx tsc --noEmit
```

## Links

- [Xandeum Documentation](https://docs.xandeum.network)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [Xandeum GitHub](https://github.com/Xandeum)

## License

MIT
