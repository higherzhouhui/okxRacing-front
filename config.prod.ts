import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { nodePolyfills } from "vite-plugin-node-polyfills";
// import compression from 'vite-plugin-compression';


import path from 'path';

// 定义一个函数来解析路径
function _resolve(dir: string) {
  return path.resolve(__dirname, dir);
}


// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Allows using self-signed certificates to run the dev server using HTTPS.
    // https://www.npmjs.com/package/@vitejs/plugin-basic-ssl
    basicSsl(),
    nodePolyfills(),
    // compression({
    //   verbose: true, // 是否在控制台输出压缩结果
    //   disable: false, // 是否禁用压缩
    //   threshold: 10240, // 压缩文件的大小阈值（以字节为单位）
    //   algorithm: 'gzip', // 压缩算法
    //   ext: '.gz', // 压缩文件的后缀名
    //   deleteOriginFile: true, // 是否删除原文件
    // })
  ],
  build: {
    outDir: 'racedist',
    rollupOptions: {
      output: {
        manualChunks: {
          aelfSdk: ['aelf-sdk'],
          antd: ['antd'],
          login: ['@aelf-web-login/utils'],
          loginbase: ['@aelf-web-login/wallet-adapter-base'],
          loginbridge: ['@aelf-web-login/wallet-adapter-bridge'],
          loginelf: ['@aelf-web-login/wallet-adapter-night-elf'],
          loginaa: ['@aelf-web-login/wallet-adapter-portkey-aa'],
          logindiscover: ['@aelf-web-login/wallet-adapter-portkey-discover'],
          loginreact: ['@aelf-web-login/wallet-adapter-react'],
        },
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    }
  },
  // base: process.env.GH_PAGES ? '/telegram-mini/' : './',
  server: {
    fs: {
      allow: ['../sdk', './'],
    },
  },
  resolve: {
    alias: {
      '@': _resolve('src'),
    },
  },
  publicDir: './public',
})