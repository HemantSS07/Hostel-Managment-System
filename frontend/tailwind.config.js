/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom Colors
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      
      // Font Family
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'Courier New', 'monospace'],
      },
      
      // Font Sizes
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Border Radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        'full': '9999px',
      },
      
      // Box Shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '3xl': '0 35px 60px -15px rgb(0 0 0 / 0.3)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.6)',
        'glow-xl': '0 0 40px rgba(59, 130, 246, 0.7)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-yellow': '0 0 20px rgba(234, 179, 8, 0.5)',
      },
      
      // Animations
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-slower': 'spin 5s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'spin-reverse-slow': 'spin-reverse 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slower': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'bounce-slower': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-out': 'fadeOut 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'gradient': 'gradient 6s ease infinite',
        'gradient-slow': 'gradient 10s ease infinite',
        'ripple': 'ripple 0.6s linear',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      // Keyframes
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'slideUp': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slideDown': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slideLeft': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slideRight': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fadeOut': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scaleIn': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scaleOut': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        'gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      
      // Background Images
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)',
        'gradient-diagonal': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'noise': "url('data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E')",
      },
      
      // Background Size
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '200%': '200% 200%',
        '300%': '300% 300%',
        '400%': '400% 400%',
      },
      
      // Transition Duration
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
        '5000': '5000ms',
      },
      
      // Transition Timing Function
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Z-Index
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'auto': 'auto',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      
      // Opacity
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '35': '0.35',
        '40': '0.4',
        '45': '0.45',
        '50': '0.5',
        '55': '0.55',
        '60': '0.6',
        '65': '0.65',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
      
      // Blur
      blur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // Max Width
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      },
      
      // Screens
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      
      // Aspect Ratio
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'portrait': '3 / 4',
        'landscape': '4 / 3',
        'ultrawide': '21 / 9',
      },
    },
  },
  
  // Plugins
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    
    // Custom plugin for glass morphism
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-light': {
          'background': 'rgba(255, 255, 255, 0.3)',
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'border-radius': '1rem',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.glass-card-dark': {
          'background': 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'border-radius': '1rem',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
        '.glass-modal': {
          'background': 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'border-radius': '1.5rem',
          'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        '.glass-modal-dark': {
          'background': 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'border-radius': '1.5rem',
          'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          'color': 'transparent',
        },
        '.text-gradient-blue': {
          'background': 'linear-gradient(to right, #3b82f6, #06b6d4)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          'color': 'transparent',
        },
        '.text-gradient-purple': {
          'background': 'linear-gradient(to right, #8b5cf6, #d946ef)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          'color': 'transparent',
        },
        '.text-gradient-green': {
          'background': 'linear-gradient(to right, #10b981, #34d399)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          'color': 'transparent',
        },
        '.bg-gradient-shine': {
          'background': 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)',
          'background-size': '200% 100%',
        },
        '.animate-shimmer': {
          'animation': 'shimmer 2s linear infinite',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            'display': 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            'width': '6px',
            'height': '6px',
          },
        },
      };
      
      addUtilities(newUtilities, ['responsive', 'hover', 'dark']);
    },
    
    // Custom plugin for animations
    function({ addUtilities }) {
      const animationUtilities = {
        '.animation-delay-100': {
          'animation-delay': '100ms',
        },
        '.animation-delay-200': {
          'animation-delay': '200ms',
        },
        '.animation-delay-300': {
          'animation-delay': '300ms',
        },
        '.animation-delay-500': {
          'animation-delay': '500ms',
        },
        '.animation-delay-1000': {
          'animation-delay': '1000ms',
        },
        '.animation-delay-2000': {
          'animation-delay': '2000ms',
        },
        '.animation-delay-4000': {
          'animation-delay': '4000ms',
        },
        '.animation-duration-2000': {
          'animation-duration': '2000ms',
        },
        '.animation-duration-3000': {
          'animation-duration': '3000ms',
        },
        '.animation-duration-5000': {
          'animation-duration': '5000ms',
        },
      };
      
      addUtilities(animationUtilities);
    },
  ],
  
  // Variants
  variants: {
    extend: {
      opacity: ['disabled', 'group-hover'],
      cursor: ['disabled'],
      backgroundColor: ['active', 'disabled', 'group-hover'],
      textColor: ['active', 'disabled', 'group-hover'],
      borderColor: ['active', 'disabled', 'group-hover'],
      ringColor: ['active', 'focus-visible'],
      ringWidth: ['active', 'focus-visible'],
      scale: ['active', 'group-hover'],
      translate: ['active', 'group-hover'],
      boxShadow: ['active', 'group-hover'],
      blur: ['hover', 'group-hover'],
      backdropBlur: ['hover', 'group-hover'],
      animation: ['hover', 'group-hover', 'focus'],
    },
  },
  
  // Core Plugins
  corePlugins: {
    preflight: true,
  },
};