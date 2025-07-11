// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import electron from 'vite-plugin-electron';
// import path from 'path';
// import renderer from 'vite-plugin-electron-renderer';

// export default defineConfig({
//   plugins: [
//     react(),
//     electron([
//       {
//         entry: 'electron/main.cjs',
//         vite: {
//           build: {
//             rollupOptions: {
//               external: ['electron', 'better-sqlite3']
//             }
//           }
//         }
//       },
//       {
//         entry: 'electron/preload.cjs',
//         onstart(options) {
//           options.reload()
//         },
//         vite: {
//           build: {
//             rollupOptions: {
//               external: ['better-sqlite3']
//             }
//           }
//         }
//       },
//       {
//         entry: 'electron/database.cjs',
//         vite: {
//           build: {
//             rollupOptions: {
//               external: ['better-sqlite3']
//             }
//           }
//         }
//       }
//     ]),
//     renderer()
//   ],
//   server: {
//     host: '127.0.0.1',
//     port: 5174
//   },
//   build: {
//     outDir: 'dist',
//     assetsDir: '.',
//   },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   base: './',
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.cjs',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', 'better-sqlite3'],
              output: {
                entryFileNames: 'main.cjs',
              },
            }
          }
        }
      },
      {
        entry: 'electron/preload.cjs',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            rollupOptions: {
              external: ['better-sqlite3'],
              output: {
                entryFileNames: 'preload.cjs',
              },
            }
          }
        }
      },
      {
        entry: 'electron/database.cjs',
        vite: {
          build: {
            rollupOptions: {
              external: ['better-sqlite3'],
              output: {
                entryFileNames: 'database.cjs',
              },
            }
          }
        }
      }
    ]),
    renderer()
  ],
  server: {
    host: '127.0.0.1',
    port: 5174
  },
  build: {
    outDir: 'dist',
    assetsDir: '.',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
});
