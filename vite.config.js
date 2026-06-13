import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const framerMotionUseClientWarning =
  'Module level directives cause errors when bundled'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        const isFramerMotionDirectiveWarning =
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          warning.message.includes(framerMotionUseClientWarning) &&
          typeof warning.id === 'string' &&
          warning.id.includes('framer-motion')

        if (isFramerMotionDirectiveWarning) {
          return
        }

        warn(warning)
      },
    },
  },
})
