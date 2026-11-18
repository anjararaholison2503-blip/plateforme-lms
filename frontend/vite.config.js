// // 

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'  // Ajouter cette ligne

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),  // Ajouter cette ligne
//   ],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});