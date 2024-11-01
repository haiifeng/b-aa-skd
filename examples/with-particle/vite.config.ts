import path from 'path';
import { ConfigEnv, defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fs from 'fs';

// Fix the '__wbindgen_add_to_stack_pointer' error
// https://developers.particle.network/api-reference/auth/faq#how-do-i-fix-the-wbindgen-add-to-stack-pointer-error-in-a-react-app-using-vite
const particleWasmPlugin: Plugin | undefined = {
  name: 'particle-wasm',
  apply: (_, env: ConfigEnv) => {
    return env.mode === 'development';
  },
  buildStart: () => {
    const copiedPath = path.join(
      __dirname,
      'node_modules/@particle-network/thresh-sig/wasm/thresh_sig_wasm_bg.wasm',
    );
    const dir = path.join(__dirname, 'node_modules/.vite/wasm');
    const resultPath = path.join(dir, 'thresh_sig_wasm_bg.wasm');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(copiedPath, resultPath);
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    particleWasmPlugin,
    nodePolyfills({
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    'process.env': process.env,
  },
  build: {
    target: 'esnext', // you can also use 'es2020' here
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // you can also use 'es2020' here
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
