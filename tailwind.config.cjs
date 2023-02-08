const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["InterVariable", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        primary: colors.indigo,
        gray: colors.neutral
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            a: {
              color: theme("colors.primary.500"),
              "&:hover": {
                color: `${theme("colors.primary.600")} !important`
              },
              code: { color: theme("colors.primary.400") }
            },
            h1: {
              fontWeight: "700",
              letterSpacing: theme("letterSpacing.tight"),
              color: theme("colors.gray.900")
            },
            h2: {
              fontWeight: "700",
              letterSpacing: theme("letterSpacing.tight"),
              color: theme("colors.gray.900")
            },
            h3: {
              fontWeight: "600",
              color: theme("colors.gray.900")
            },
            "h4,h5,h6": {
              color: theme("colors.gray.900")
            },
            pre: {
              backgroundColor: theme("colors.gray.800")
            },
            code: {
              color: theme("colors.gray.600"),
              backgroundColor: theme("colors.gray.200"),
              fontWeight: "400",
              paddingLeft: "4px",
              paddingRight: "4px",
              paddingTop: "2px",
              paddingBottom: "2px",
              borderRadius: "0.25rem",
              wordBreak: "break-word"
            },
            "code::before": {
              content: "none"
            },
            "code::after": {
              content: "none"
            },
            details: {
              paddingLeft: "4px",
              paddingRight: "4px",
              paddingTop: "2px",
              paddingBottom: "2px",
              borderRadius: "0.25rem"
            },
            hr: { borderColor: theme("colors.gray.200") },
            "ol li::marker": {
              fontWeight: "600",
              color: theme("colors.gray.500")
            },
            "ul li::marker": {
              backgroundColor: theme("colors.gray.500")
            },
            strong: { color: theme("colors.gray.600") },
            blockquote: {
              color: theme("colors.gray.900"),
              borderLeftColor: theme("colors.gray.200")
            }
          }
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.primary.500"),
              "&:hover": {
                color: `${theme("colors.primary.400")} !important`
              },
              code: { color: theme("colors.primary.400") }
            },
            h1: {
              fontWeight: "700",
              letterSpacing: theme("letterSpacing.tight"),
              color: theme("colors.gray.100")
            },
            h2: {
              fontWeight: "700",
              letterSpacing: theme("letterSpacing.tight"),
              color: theme("colors.gray.100")
            },
            h3: {
              fontWeight: "600",
              color: theme("colors.gray.100")
            },
            "h4,h5,h6": {
              color: theme("colors.gray.100")
            },
            pre: {
              backgroundColor: theme("colors.gray.800"),
              code: {
                backgroundColor: theme("colors.gray.800")
              }
            },
            code: {
              color: theme("colors.gray.200"),
              backgroundColor: theme("colors.gray.700")
            },
            // details: {},
            hr: { borderColor: theme("colors.gray.700") },
            "ol li::marker": {
              fontWeight: "600",
              color: theme("colors.gray.400")
            },
            "ul li::marker": {
              backgroundColor: theme("colors.gray.400")
            },
            strong: { color: theme("colors.gray.100") },
            thead: {
              th: {
                color: theme("colors.gray.100")
              }
            },
            tbody: {
              tr: {
                borderBottomColor: theme("colors.gray.700")
              }
            },
            blockquote: {
              color: theme("colors.gray.100"),
              borderLeftColor: theme("colors.gray.700")
            }
          }
        }
      })
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
