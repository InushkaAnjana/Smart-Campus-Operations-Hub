import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API calls to backend during development.
    // This eliminates CORS issues — the browser sees all requests as same-origin.
    proxy: {
      // Proxy all /api/* calls to the Spring Boot backend (port 9090)
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Spring Security OAuth2 authorization endpoint
      // When the user clicks "Sign in with Google", the browser hits:
      //   http://localhost:3000/oauth2/authorization/google
      // Vite proxies this to the backend at:
      //   http://localhost:9090/oauth2/authorization/google
      '/oauth2': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Spring Security's OAuth2 callback redirect handler
      '/login/oauth2': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
