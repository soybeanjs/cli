import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';
import { presetSoybean } from '@soybeanjs/unocss-preset';

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.vue($|\?)/]
    }
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [presetWind3({ dark: 'class' }), presetSoybean()]
});
