import {extendTheme} from "@chakra-ui/react";

// Custom color palette - Based on Figma design
const colors = {
    brand: {
        50: "#D3E5FF",  // Lightest blue
        100: "#BBD6FF", // Light blue
        200: "#6890FF", // Medium light blue
        300: "#1728BC", // Medium blue
        400: "#1C2A93", // Medium dark blue
        500: "#161F70", // Primary brand color (dark blue)
        600: "#121959", // Darker
        700: "#0E1343", // Even darker
        800: "#0A0D2D", // Very dark
        900: "#050617", // Darkest
    },
    gray: {
        50: "#f7fafc",
        100: "#edf2f7",
        200: "#e2e8f0",
        300: "#C8C8C8", // From Figma
        400: "#a0aec0",
        500: "#718096",
        600: "#4a5568",
        700: "#2d3748",
        800: "#1a202c",
        900: "#171923",
    },
    success: {
        500: "#009781", // Green accent from Figma
    },
    error: {
        500: "#C90003", // Red accent from Figma
    },
};

// Custom fonts
const fonts = {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
    mono: `SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
};

// Custom component styles
const components = {
    Button: {
        baseStyle: {
            fontWeight: "semibold",
            borderRadius: "lg",
            _focus: {
                boxShadow: "outline",
            },
        },
        variants: {
            solid: {
                bg: "brand.500",
                color: "white",
                _hover: {
                    bg: "brand.600",
                    transform: "translateY(-1px)",
                    boxShadow: "lg",
                },
                _active: {
                    bg: "brand.700",
                    transform: "translateY(0)",
                },
            },
            outline: {
                borderColor: "brand.500",
                color: "brand.500",
                _hover: {
                    bg: "brand.50",
                    transform: "translateY(-1px)",
                    boxShadow: "md",
                },
            },
        },
        defaultProps: {
            colorScheme: "brand",
        },
    },
    Card: {
        baseStyle: {
            container: {
                borderRadius: "xl",
                boxShadow: "md",
                _hover: {
                    boxShadow: "lg",
                    transform: "translateY(-2px)",
                },
                transition: "all 0.2s",
            },
        },
    },
    Input: {
        variants: {
            filled: {
                field: {
                    bg: "gray.50",
                    borderRadius: "lg",
                    _hover: {
                        bg: "gray.100",
                    },
                    _focus: {
                        bg: "white",
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                    },
                },
            },
        },
        defaultProps: {
            variant: "filled",
        },
    },
    FormLabel: {
        baseStyle: {
            fontWeight: "semibold",
            color: "gray.700",
        },
    },
};

// Global styles
const styles = {
    global: {
        body: {
            bg: "gray.50",
            color: "gray.800",
        },
        "*::placeholder": {
            color: "gray.400",
        },
        "*, *::before, *::after": {
            borderColor: "gray.200",
        },
    },
};

// Custom breakpoints
const breakpoints = {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "96em",
};

// Animation config
const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

// Custom spacing
const space = {
    px: "1px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
};

// Create and export the theme
const theme = extendTheme({
    colors,
    fonts,
    components,
    styles,
    breakpoints,
    config,
    space,
});

export default theme;
