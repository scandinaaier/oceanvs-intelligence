/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        border: 'var(--border)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-mid': 'var(--accent-mid)',
        alert: 'var(--alert)',
        success: 'var(--success)',
        amber: '#D4A017',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)'
      },
      boxShadow: {
        card: '0 2px 8px rgba(26,107,154,0.08)'
      },
      borderRadius: {
        card: '12px'
      }
    }
  },
  plugins: []
}
