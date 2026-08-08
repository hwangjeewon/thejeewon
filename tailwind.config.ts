import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:     'var(--color-primary)',
        black:       'var(--color-black)',
        gray:        'var(--color-gray)',
        'light-gray':'var(--color-light-gray)',
        'off-white': 'var(--color-off-white)',
        white:       'var(--color-white)',
        bg:          'var(--color-bg)',
        stroke:      'var(--color-stroke)',
        green:       'var(--color-green)',
        red:         'var(--color-red)',
        dim:         'var(--color-dim)',
      },
      borderRadius: {
        card:  'var(--radius-card)',
        modal: 'var(--radius-modal)',
        cta:   'var(--radius-cta)',
        sm:    'var(--radius-sm)',
        bar:   'var(--radius-bar)',
        row:   'var(--radius-row)',
      },
      boxShadow: {
        modal: 'var(--shadow-modal)',
      },
      fontSize: {
        '9':  'var(--text-9)',
        '10': 'var(--text-10)',
        '11': 'var(--text-11)',
        '12': 'var(--text-12)',
        '13': 'var(--text-13)',
        '14': 'var(--text-14)',
        '15': 'var(--text-15)',
        '16': 'var(--text-16)',
        '20': 'var(--text-20)',
        '26': 'var(--text-26)',
        '32': 'var(--text-32)',
        '42': 'var(--text-42)',
      },
    },
  },
  plugins: [],
}

export default config
