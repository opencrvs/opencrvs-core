import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    'process.env': {},
    APP_VERSION: null,
    config: {
      API_GATEWAY_URL: 'http://localhost:7070/',
      CONFIG_API_URL: 'http://localhost:2021',
      LOGIN_URL: 'http://localhost:3020',
      AUTH_URL: 'http://localhost:7070/auth/',
      MINIO_BUCKET: 'ocrvs',
      MINIO_URL: 'http://localhost:3535/ocrvs/',
      MINIO_BASE_URL: 'http://localhost:3535', // URL without path/bucket information, used for file uploads, v2
      COUNTRY_CONFIG_URL: 'http://localhost:3040',
      // Country code in uppercase ALPHA-3 format
      COUNTRY: 'FAR',
      LANGUAGES: 'en,fr',
      SENTRY: '',
      DASHBOARDS: [
        {
          id: 'registrations',
          title: {
            id: 'dashboard.registrationsTitle',
            defaultMessage: 'Registrations Dashboard',
            description: 'Menu item for registrations dashboard'
          },
          url: `http://localhost:4444/public/dashboard/03be04d6-bde0-4fa7-9141-21cea2a7518b#bordered=false&titled=false&refresh=300` // Filled in below
        },
        {
          id: 'completeness',
          title: {
            id: 'dashboard.completenessTitle',
            defaultMessage: 'Completeness Dashboard',
            description: 'Menu item for completeness dashboard'
          },
          url: `http://localhost:4444/public/dashboard/41940907-8542-4e18-a05d-2408e7e9838a#bordered=false&titled=false&refresh=300`
        },
        {
          id: 'registry',
          title: {
            id: 'dashboard.registryTitle',
            defaultMessage: 'Registry',
            description: 'Menu item for registry dashboard'
          },
          url: `http://localhost:4444/public/dashboard/dc66b77a-79df-4f68-8fc8-5e5d5a2d7a35#bordered=false&titled=false&refresh=300`
        }
      ],
      FEATURES: {}
    }
  },
  resolve: {
    alias: {
      '@opencrvs/client/src': path.resolve(__dirname, '../client/src'),
      '@opencrvs/client': path.resolve(__dirname, '../client/src')
    }
  }
})

// packages/client/src/views/RegisterForm/review/ReviewSectionCorrection.tsx
