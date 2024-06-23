import shopify from 'vite-plugin-shopify'
import pageReload from 'vite-plugin-page-reload'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { watch } from 'chokidar';
import fs from 'fs-extra'

const watchStaticAssets = () => ({
  name: 'watch-static-assets',
  configureServer(server) {
    const watcher = watch('./public/*', {
      persistent: true
    });

    const copyAsset = async path => {
      await fs.copy(path, `assets/${path.replace('public/', '')}`);
    }

    const removeAsset = async path => {
      await fs.remove(`assets/${path.replace('public/', '')}`);
    }

    watcher.on('add', copyAsset);
    watcher.on('change', copyAsset);
    watcher.on('unlink', removeAsset);
  }
})

export default {
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    https: true,
    port: 3000,
    hmr: true
  },
  publicDir: 'public',
  plugins: [
    basicSsl(),
    watchStaticAssets(),
    shopify({
      sourceCodeDir: "src",
      entrypointsDir: 'src/entrypoints',
      snippetFile: "vite.liquid"
    }),
    pageReload('/tmp/theme.update', {
      delay: 2000
    }),
    {
      name: 'vite-plugin-liquid-tailwind-refresh',
      handleHotUpdate(ctx) {
        if (ctx.file.endsWith('.liquid')) {
          console.log('is liquid')

          // Filter out the liquid module to prevent a full refresh
          return [...ctx.modules[0]?.importers ?? [], ...ctx.modules.slice(1)]
        }
      }
    }
  ],
  build: {
    manifest: false,
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].min.js',
        chunkFileNames: '[name].[hash].min.js',
        assetFileNames: '[name].[hash].min[extname]',
      },
    }
  }
}
