# Build and Output Settings Guide

This document explains the optimized build and output settings for your Navigation Assistant app.

## Vercel Configuration (`vercel.json`)

### Build Settings
- **Frontend Build**: Uses `@vercel/static-build` with Vite
- **Build Command**: `npm run build` (explicitly specified)
- **Output Directory**: `client/dist`
- **API Functions**: Node.js with 10-second timeout

### Performance Optimizations
- **Asset Caching**: Static assets cached for 1 year
- **Security Headers**: XSS protection, content type options
- **Function Timeout**: 10 seconds for API calls

## Vite Configuration (`client/vite.config.js`)

### Build Optimizations
- **Minification**: Terser with console/debugger removal
- **Code Splitting**: Separate chunks for vendor libraries
- **Source Maps**: Disabled for production (faster builds)
- **Asset Organization**: Assets in dedicated `/assets` folder

### Chunk Strategy
```javascript
manualChunks: {
  vendor: ["react", "react-dom"],      // Core React libraries
  leaflet: ["leaflet", "react-leaflet"] // Map libraries
}
```

## Build Commands

### Development
```bash
cd client
npm run dev
```

### Production Build
```bash
cd client
npm run build
```

### Vercel Build (Automatic)
```bash
# Triggered automatically on git push
vercel build
```

## Output Structure

```
client/dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main application bundle
│   ├── vendor-[hash].js    # React libraries
│   ├── leaflet-[hash].js   # Map libraries
│   └── index-[hash].css    # Compiled styles
└── vite.svg               # Static assets
```

## Performance Features

### 1. Code Splitting
- **Vendor Chunk**: React and React-DOM
- **Leaflet Chunk**: Map-related libraries
- **Main Chunk**: Application code

### 2. Asset Optimization
- **CSS**: PostCSS processing with Tailwind
- **JavaScript**: Terser minification
- **Images**: Optimized by Vite
- **Caching**: Long-term cache for static assets

### 3. Bundle Analysis
To analyze your bundle size:
```bash
cd client
npm run build
npx vite-bundle-analyzer dist
```

## Environment-Specific Settings

### Development
- Source maps enabled
- Console logs preserved
- Hot module replacement
- Detailed error messages

### Production
- Source maps disabled
- Console logs removed
- Minified code
- Optimized assets

## Vercel Deployment Settings

### Build Command
```json
{
  "buildCommand": "npm run build"
}
```

### Output Directory
```json
{
  "distDir": "dist"
}
```

### Function Configuration
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 10
    }
  }
}
```

## Monitoring Build Performance

### Build Logs
Check Vercel dashboard for:
- Build duration
- Bundle size
- Error messages
- Performance metrics

### Bundle Size Targets
- **Total JS**: < 500KB
- **Vendor Chunk**: < 200KB
- **Leaflet Chunk**: < 150KB
- **Main Chunk**: < 150KB

## Troubleshooting

### Common Issues

1. **Build Timeout**
   - Check API function complexity
   - Optimize external API calls

2. **Bundle Size Too Large**
   - Analyze with bundle analyzer
   - Check for unused dependencies
   - Optimize imports

3. **Asset Loading Issues**
   - Verify asset paths
   - Check CORS settings
   - Ensure proper caching headers

### Optimization Tips

1. **Reduce Bundle Size**
   - Use dynamic imports for large libraries
   - Remove unused dependencies
   - Optimize images

2. **Improve Build Speed**
   - Use build caching
   - Optimize Vite configuration
   - Minimize external API calls

3. **Better Performance**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading

## Build Commands Reference

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

## Configuration Files

- `vercel.json` - Vercel deployment settings
- `client/vite.config.js` - Vite build configuration
- `client/package.json` - Dependencies and scripts
- `client/tailwind.config.js` - CSS framework settings
