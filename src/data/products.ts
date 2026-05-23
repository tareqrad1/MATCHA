// MATCHA catalogue — ceremonial drinks, tools and tins.
// Each product's `image` points at /public/products/<file>. Drop your own
// photos there using these exact filenames and they appear automatically;
// until then a styled placeholder renders in their place.

import type { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 'classic-uji',
    kind: 'Iced Matcha',
    name: 'Uji Classic',
    tagline: 'The original. Quiet and complete.',
    price: 9,
    unit: 'per cup',
    image: '/products/classic-uji.png',
    notes: ['Single-origin Uji leaf', 'Whole or oat milk', 'Stone-ground daily'],
    description:
      'First-harvest leaf from Uji, stone-ground to a deep emerald and poured over ice. Soft, grassy, faintly sweet — the cup that needs nothing added.',
    accent: '#8aa05f',
  },
  {
    id: 'yuzu-citrus',
    kind: 'Iced Matcha',
    name: 'Yuzu',
    tagline: 'Bright. Clean. Awake.',
    price: 11,
    unit: 'per cup',
    image: '/products/yuzu-citrus.png',
    notes: ['Japanese yuzu', 'Ceremonial base', 'Lightly sparkling'],
    description:
      'Japanese yuzu folded through ceremonial matcha and a whisper of sparkle. Citrus lifts the green into something luminous and calmly refreshing.',
    accent: '#a3b87a',
  },
  {
    id: 'hojicha-smoke',
    kind: 'Iced Matcha',
    name: 'Hojicha',
    tagline: 'Warm. Roasted. Low and slow.',
    price: 11,
    unit: 'per cup',
    image: '/products/hojicha-smoke.png',
    notes: ['Fire-roasted leaf', 'Toasted caramel', 'Gentle caffeine'],
    description:
      'Leaf roasted over open flame for a toasted-caramel depth and a soft, smoky finish. The evening pour — easy on caffeine, generous on calm.',
    accent: '#8a7a52',
  },
  {
    id: 'signature-cup',
    kind: 'Drinkware',
    name: 'The Cup',
    tagline: 'Where the ritual rests.',
    price: 38,
    unit: 'each',
    image: '/products/signature-cup.png',
    notes: ['Speckled stoneware', 'Hand-thrown', 'Double-walled'],
    description:
      'Hand-thrown speckled stoneware, double-walled to hold the cold and the quiet. Weighted, tactile and made to outlast every trend.',
    accent: '#cfc6b0',
  },
  {
    id: 'ceremonial-whisk',
    kind: 'Tools',
    name: 'Chasen Whisk',
    tagline: 'One bamboo. Eighty tines.',
    price: 32,
    unit: 'each',
    image: '/products/ceremonial-whisk.png',
    notes: ['Single-cut bamboo', 'Eighty prongs', 'Whisks to silk'],
    description:
      'A chasen carved from a single node of bamboo into eighty fine prongs — whisking matcha to a weightless foam. The line between a drink and a ceremony.',
    accent: '#b9c79a',
  },
  {
    id: 'matcha-tin',
    kind: 'Matcha',
    name: 'Ceremonial Tin',
    tagline: 'Thirty grams of stillness.',
    price: 46,
    unit: '30g tin',
    image: '/products/matcha-tin.png',
    notes: ['First harvest', 'Shade-grown', 'Light-sealed'],
    description:
      'Thirty grams of first-harvest, shade-grown ceremonial matcha in a light-sealed tin. The same grade we pour — now yours, for the quiet morning.',
    accent: '#5e7242',
  },
  {
    id: 'gift-set',
    kind: 'Sets',
    name: 'The Ritual Set',
    tagline: 'Everything, quietly boxed.',
    price: 110,
    unit: 'gift set',
    image: '/products/gift-set.png',
    notes: ['Cup, whisk & tin', 'Linen-wrapped', 'Limited release'],
    description:
      'The cup, the whisk and a tin of first-harvest matcha, linen-wrapped in a magnetic box. The complete ritual — to give, or to keep.',
    accent: '#8aa05f',
  },
];
