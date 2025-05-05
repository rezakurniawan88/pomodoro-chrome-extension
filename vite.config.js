import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'mock-chrome-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!globalThis.chrome) {
            globalThis.chrome = {
              runtime: {
                id: 'test123',
                sendMessage: (msg, cb) => {
                  console.log('Mock sendMessage:', msg);
                  if (cb) cb({});
                },
                onMessage: {
                  addListener: () => {},
                  removeListener: () => {}
                }
              },
              storage: {
                local: {
                  get: (keys, cb) => cb({}),
                  set: (items) => console.log('Mock storage set:', items)
                }
              }
            };
          }
          next();
        });
      }
    }
  ],
})
