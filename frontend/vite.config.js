import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Resolve Google Client ID from VITE_GOOGLE_CLIENT_ID, or fall back to GOOGLE_CLIENT_ID
  const googleClientId = (
    env.VITE_GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    ''
  ).trim();

  // Resolve API URL if explicitly provided in environment
  const apiUrl = (
    env.VITE_API_URL ||
    process.env.VITE_API_URL ||
    env.API_URL ||
    process.env.API_URL ||
    ''
  ).trim();

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'REACT_APP_'],
    define: {
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
      ...(apiUrl ? { 'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl) } : {}),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
})

