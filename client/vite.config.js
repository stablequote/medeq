import { defineConfig, searchForWorkspaceRoot  } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        "./src/locales", "./src/assets", "./src", "./index.html"
      ],
    }
  }
})
