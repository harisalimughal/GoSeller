# GoSellr Frontend - Next.js Version

This is the Next.js version of the GoSellr e-commerce frontend application.

## Migration from React/Vite to Next.js

The project has been successfully migrated from React + Vite to Next.js 14 with the following changes:

### Key Changes Made:

1. **Project Structure**: Converted from Vite to Next.js App Router
2. **Routing**: Replaced React Router with Next.js file-based routing
3. **Build System**: Updated from Vite to Next.js build system
4. **Dependencies**: Updated package.json for Next.js compatibility
5. **Configuration**: Added Next.js config files (next.config.js, tsconfig.json)

### New File Structure:

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── providers.tsx      # Context providers
│   ├── dashboard/         # Dashboard routes
│   ├── seller/            # Seller routes
│   ├── products/          # Products page
│   ├── product/[id]/      # Product detail (dynamic)
│   ├── category/[slug]/   # Category pages (dynamic)
│   └── ...                # Other routes
├── components/             # Reusable components
├── pages/                  # Page components (legacy)
├── contexts/               # React contexts
├── store/                  # Redux store
└── services/               # API services
```

### Routes Mapping:

- `/` → Homepage
- `/dashboard` → Main dashboard
- `/dashboard/products` → Products management
- `/dashboard/orders` → Orders management
- `/dashboard/customers` → Customers management
- `/dashboard/analytics` → Analytics dashboard
- `/seller/dashboard` → Seller dashboard
- `/seller/store-dashboard` → Store dashboard
- `/seller/add-product` → Add product form
- `/seller/edit-product` → Edit product form
- `/products` → Products listing
- `/product/[productId]` → Product detail page
- `/category/[slug]` → Category pages
- `/seller-login` → Seller login
- `/seller-registration` → Seller registration
- `/verification` → SQL verification

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

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Features

- **Modern UI**: Built with Tailwind CSS and Framer Motion
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Full TypeScript support
- **State Management**: Redux Toolkit + React Query
- **Authentication**: JWT-based auth system
- **E-commerce**: Complete product management system
- **Seller Portal**: Dedicated seller dashboard
- **Analytics**: Business intelligence dashboard

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Icons**: React Icons, Heroicons
- **Charts**: Recharts
- **UI Components**: Headless UI

## Migration Notes

- All React Router `Link` components have been converted to Next.js `Link`
- `useNavigate` has been replaced with Next.js `useRouter`
- `useLocation` has been replaced with Next.js `usePathname`
- File-based routing replaces manual route definitions
- API routes can now be added in `src/app/api/` directory

## Next Steps

1. **API Routes**: Consider moving API calls to Next.js API routes
2. **Image Optimization**: Use Next.js Image component for better performance
3. **SEO**: Leverage Next.js metadata API for better SEO
4. **Performance**: Implement Next.js performance optimizations
5. **Testing**: Add Jest and React Testing Library tests

## Support

For questions or issues related to the Next.js migration, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Migration Guide](https://nextjs.org/docs/migrating)
