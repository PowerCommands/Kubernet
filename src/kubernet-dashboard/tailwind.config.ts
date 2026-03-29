import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(201 96% 32%)",
        background: "hsl(204 33% 98%)",
        foreground: "hsl(215 25% 18%)",
        primary: {
          DEFAULT: "hsl(201 96% 32%)",
          foreground: "hsl(204 33% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(200 31% 94%)",
          foreground: "hsl(215 25% 18%)",
        },
        muted: {
          DEFAULT: "hsl(204 29% 95%)",
          foreground: "hsl(215 16% 42%)",
        },
        accent: {
          DEFAULT: "hsl(38 92% 94%)",
          foreground: "hsl(30 55% 25%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(215 25% 18%)",
        },
        success: {
          DEFAULT: "hsl(142 52% 93%)",
          foreground: "hsl(142 72% 24%)",
        },
        warning: {
          DEFAULT: "hsl(45 100% 92%)",
          foreground: "hsl(28 80% 28%)",
        },
        danger: {
          DEFAULT: "hsl(0 93% 94%)",
          foreground: "hsl(0 72% 35%)",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.875rem",
        sm: "0.625rem",
      },
      boxShadow: {
        panel: "0 20px 45px -28px rgba(15, 23, 42, 0.25)",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        shell:
          "radial-gradient(circle at top left, rgba(14, 116, 144, 0.10), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.85), rgba(248,250,252,0.96))",
      },
    },
  },
  plugins: [],
} satisfies Config;
