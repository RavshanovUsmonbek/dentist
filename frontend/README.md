# Dentist Website - Frontend

Modern React single-page application for a dentist profile website.

## Overview

Professional, responsive website featuring:
- Hero section with call-to-action
- About section with dentist credentials
- Services showcase
- Photo gallery
- Patient testimonials
- Contact form with backend integration

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Icons** - Icon library

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Create `.env.local` if you need to override the API URL:

```env
VITE_API_URL=http://localhost:8080/api
```

### 3. Run Development Server

```bash
npm run dev
```

Site will be available at http://localhost:5173

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Customization Guide

### 1. Practice Name & Branding

Search and replace "Smile Dental Care" in:
- `src/components/layout/Header.jsx`
- `src/components/layout/Footer.jsx`

### 2. Dentist Information

Edit `src/components/sections/About.jsx`:
- Name, credentials, bio
- Education and experience
- Awards and memberships

### 3. Contact Information

Edit `src/components/sections/Contact.jsx` and `src/components/layout/Footer.jsx`:
- Phone, email, address
- Office hours

### 4. Services

Edit `src/data/services.js` to add/modify dental services.

### 5. Testimonials

Edit `src/data/testimonials.js` to add patient reviews.

### 6. Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Main blue
    700: '#0369a1',  // Dark blue
  },
  accent: {
    500: '#06b6d4',  // Teal
  }
}
```

### 7. Images

Add images to `public/images/`:
- `hero/` - Hero banner images
- `gallery/` - Office and equipment photos

## Building for Production

```bash
npm run build
```

Outputs to `dist/` folder.

## Deployment

Deploy `dist/` folder to:
- **Vercel** - vercel.com
- **Netlify** - netlify.com
- **Cloudflare Pages** - pages.cloudflare.com

Set `VITE_API_URL` environment variable to your production backend URL.

## License

Apache License 2.0
