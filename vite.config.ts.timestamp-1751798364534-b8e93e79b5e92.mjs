// vite.config.ts
import { defineConfig } from "file:///C:/Users/farac/Desktop/SUMRY/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/farac/Desktop/SUMRY/node_modules/@vitejs/plugin-react/dist/index.mjs";
import electron from "file:///C:/Users/farac/Desktop/SUMRY/node_modules/vite-plugin-electron/dist/index.mjs";
import path from "path";
import renderer from "file:///C:/Users/farac/Desktop/SUMRY/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\farac\\Desktop\\SUMRY";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.cjs",
        vite: {
          build: {
            rollupOptions: {
              external: ["electron", "better-sqlite3"],
              output: {
                entryFileNames: "main.cjs"
              }
            }
          }
        }
      },
      {
        entry: "electron/preload.cjs",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            rollupOptions: {
              external: ["better-sqlite3"],
              output: {
                entryFileNames: "preload.cjs"
              }
            }
          }
        }
      },
      {
        entry: "electron/database.cjs",
        vite: {
          build: {
            rollupOptions: {
              external: ["better-sqlite3"],
              output: {
                entryFileNames: "database.cjs"
              }
            }
          }
        }
      }
    ]),
    renderer()
  ],
  server: {
    host: "127.0.0.1",
    port: 5174
  },
  build: {
    outDir: "dist",
    assetsDir: "."
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  base: "./"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmYXJhY1xcXFxEZXNrdG9wXFxcXFNVTVJZXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmYXJhY1xcXFxEZXNrdG9wXFxcXFNVTVJZXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9mYXJhYy9EZXNrdG9wL1NVTVJZL3ZpdGUuY29uZmlnLnRzXCI7Ly8gaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbi8vIGltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbi8vIGltcG9ydCBlbGVjdHJvbiBmcm9tICd2aXRlLXBsdWdpbi1lbGVjdHJvbic7XHJcbi8vIGltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG4vLyBpbXBvcnQgcmVuZGVyZXIgZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXInO1xyXG5cclxuLy8gZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuLy8gICBwbHVnaW5zOiBbXHJcbi8vICAgICByZWFjdCgpLFxyXG4vLyAgICAgZWxlY3Ryb24oW1xyXG4vLyAgICAgICB7XHJcbi8vICAgICAgICAgZW50cnk6ICdlbGVjdHJvbi9tYWluLmNqcycsXHJcbi8vICAgICAgICAgdml0ZToge1xyXG4vLyAgICAgICAgICAgYnVpbGQ6IHtcclxuLy8gICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4vLyAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJ2VsZWN0cm9uJywgJ2JldHRlci1zcWxpdGUzJ11cclxuLy8gICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgfVxyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgfSxcclxuLy8gICAgICAge1xyXG4vLyAgICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vcHJlbG9hZC5janMnLFxyXG4vLyAgICAgICAgIG9uc3RhcnQob3B0aW9ucykge1xyXG4vLyAgICAgICAgICAgb3B0aW9ucy5yZWxvYWQoKVxyXG4vLyAgICAgICAgIH0sXHJcbi8vICAgICAgICAgdml0ZToge1xyXG4vLyAgICAgICAgICAgYnVpbGQ6IHtcclxuLy8gICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4vLyAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJ2JldHRlci1zcWxpdGUzJ11cclxuLy8gICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgfVxyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgfSxcclxuLy8gICAgICAge1xyXG4vLyAgICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vZGF0YWJhc2UuY2pzJyxcclxuLy8gICAgICAgICB2aXRlOiB7XHJcbi8vICAgICAgICAgICBidWlsZDoge1xyXG4vLyAgICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbi8vICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnYmV0dGVyLXNxbGl0ZTMnXVxyXG4vLyAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICB9XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICB9XHJcbi8vICAgICBdKSxcclxuLy8gICAgIHJlbmRlcmVyKClcclxuLy8gICBdLFxyXG4vLyAgIHNlcnZlcjoge1xyXG4vLyAgICAgaG9zdDogJzEyNy4wLjAuMScsXHJcbi8vICAgICBwb3J0OiA1MTc0XHJcbi8vICAgfSxcclxuLy8gICBidWlsZDoge1xyXG4vLyAgICAgb3V0RGlyOiAnZGlzdCcsXHJcbi8vICAgICBhc3NldHNEaXI6ICcuJyxcclxuLy8gICB9LFxyXG4vLyAgIHJlc29sdmU6IHtcclxuLy8gICAgIGFsaWFzOiB7XHJcbi8vICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4vLyAgICAgfSxcclxuLy8gICB9LFxyXG4vLyAgIGJhc2U6ICcuLycsXHJcbi8vIH0pXHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IGVsZWN0cm9uIGZyb20gJ3ZpdGUtcGx1Z2luLWVsZWN0cm9uJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCByZW5kZXJlciBmcm9tICd2aXRlLXBsdWdpbi1lbGVjdHJvbi1yZW5kZXJlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBlbGVjdHJvbihbXHJcbiAgICAgIHtcclxuICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4uY2pzJyxcclxuICAgICAgICB2aXRlOiB7XHJcbiAgICAgICAgICBidWlsZDoge1xyXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnZWxlY3Ryb24nLCAnYmV0dGVyLXNxbGl0ZTMnXSxcclxuICAgICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnbWFpbi5janMnLCAvLyBcdUQ4M0RcdURDNDggb3V0cHV0IGFzIC5janNcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZW50cnk6ICdlbGVjdHJvbi9wcmVsb2FkLmNqcycsXHJcbiAgICAgICAgb25zdGFydChvcHRpb25zKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnJlbG9hZCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdml0ZToge1xyXG4gICAgICAgICAgYnVpbGQ6IHtcclxuICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGV4dGVybmFsOiBbJ2JldHRlci1zcWxpdGUzJ10sXHJcbiAgICAgICAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ3ByZWxvYWQuY2pzJywgLy8gXHVEODNEXHVEQzQ4IG91dHB1dCBhcyAuY2pzXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vZGF0YWJhc2UuY2pzJyxcclxuICAgICAgICB2aXRlOiB7XHJcbiAgICAgICAgICBidWlsZDoge1xyXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnYmV0dGVyLXNxbGl0ZTMnXSxcclxuICAgICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnZGF0YWJhc2UuY2pzJywgLy8gXHVEODNEXHVEQzQ4IG91dHB1dCBhcyAuY2pzXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXSksXHJcbiAgICByZW5kZXJlcigpXHJcbiAgXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxyXG4gICAgcG9ydDogNTE3NFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgYXNzZXRzRGlyOiAnLicsXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBiYXNlOiAnLi8nLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQThEQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGNBQWM7QUFsRXJCLElBQU0sbUNBQW1DO0FBb0V6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUDtBQUFBLFFBQ0UsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFVBQ0osT0FBTztBQUFBLFlBQ0wsZUFBZTtBQUFBLGNBQ2IsVUFBVSxDQUFDLFlBQVksZ0JBQWdCO0FBQUEsY0FDdkMsUUFBUTtBQUFBLGdCQUNOLGdCQUFnQjtBQUFBO0FBQUEsY0FDbEI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0UsT0FBTztBQUFBLFFBQ1AsUUFBUSxTQUFTO0FBQ2Ysa0JBQVEsT0FBTztBQUFBLFFBQ2pCO0FBQUEsUUFDQSxNQUFNO0FBQUEsVUFDSixPQUFPO0FBQUEsWUFDTCxlQUFlO0FBQUEsY0FDYixVQUFVLENBQUMsZ0JBQWdCO0FBQUEsY0FDM0IsUUFBUTtBQUFBLGdCQUNOLGdCQUFnQjtBQUFBO0FBQUEsY0FDbEI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0UsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFVBQ0osT0FBTztBQUFBLFlBQ0wsZUFBZTtBQUFBLGNBQ2IsVUFBVSxDQUFDLGdCQUFnQjtBQUFBLGNBQzNCLFFBQVE7QUFBQSxnQkFDTixnQkFBZ0I7QUFBQTtBQUFBLGNBQ2xCO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsU0FBUztBQUFBLEVBQ1g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUNSLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
