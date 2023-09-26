const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["sans-serif", "InterVariable", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        primary: colors.blue,
        gray: colors.neutral
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            a: {
              color: theme("colors.primary.600"),
              "&:hover": {
                color: `${theme("colors.primary.700")} !important`
              },
              code: { color: theme("colors.primary.400") }
            },
            "h1,h2": {
              fontWeight: "600",
              color: theme("colors.gray.800"),
              borderBottomColor: theme("colors.gray.200"),
              borderBottomWidth: "1px",
              paddingBottom: "0.5rem"
            },
            h3: {
              fontWeight: "600",
              color: theme("colors.gray.800")
            },
            "h4,h5,h6": {
              color: theme("colors.gray.800")
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
              color: theme("colors.gray.500")
            },
            "ul li::marker": {
              backgroundColor: theme("colors.gray.500")
            },
            strong: { color: theme("colors.gray.600") },
            blockquote: {
              color: theme("colors.gray.900"),
              borderLeftColor: theme("colors.gray.200")
            },
            table: {
              tableLayout: "fixed"
            }
          }
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.primary.400"),
              "&:hover": {
                color: `${theme("colors.primary.300")} !important`
              },
              code: { color: theme("colors.primary.400") }
            },
            "h1,h2": {
              fontWeight: "600",
              color: theme("colors.gray.200"),
              borderBottomColor: theme("colors.gray.700"),
              borderBottomWidth: "1px",
              paddingBottom: "0.5rem"
            },
            h3: {
              fontWeight: "600",
              color: theme("colors.gray.200")
            },
            "h4,h5,h6": {
              color: theme("colors.gray.200")
            },
            pre: {
              backgroundColor: theme("colors.gray.700"),
              code: {
                backgroundColor: theme("colors.gray.700")
              }
            },
            code: {
              color: theme("colors.gray.200"),
              backgroundColor: theme("colors.gray.700")
            },
            // details: {},
            hr: { borderColor: theme("colors.gray.700") },
            "ol li::marker": {
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
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp")
  ]
};
