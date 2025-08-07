import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigpaths from 'vite-tsconfig-paths'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
	plugins: [
		tsconfigpaths(),
		TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
		viteReact(),
		tailwindcss(),
	],
})
