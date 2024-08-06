import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Specify the root directory as the current directory
  server: {
    proxy: {
      '/upload': 'http://localhost:3005' // Proxy to the backend server
    }
  }
});