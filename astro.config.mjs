// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'static', 
  env:{
    schema:{
      SHOW_BUY_BUTTON: envField.boolean({context:'server', access:'public'})
    }
  }
});