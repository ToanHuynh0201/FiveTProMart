import {useColorModeValue} from "@chakra-ui/react";

/**
 * Theme utility functions to prevent duplication of color mode values
 *
 * This module provides reusable theme utilities that abstract common
 * color mode values used throughout the application. Instead of duplicating
 * useColorModeValue calls in every component, use these utilities:
 *
 * - useThemeGradients() - for background gradients
 * - useThemeCards() - for card styling
 * - useThemeText() - for text colors
 * - useThemeValues() - combined utility with all values
 *
 * Example usage:
 * ```
 * import { useThemeValues } from '../styles';
 *
 * const MyComponent = () => {
 *   const { mainBgGradient, cardBg, cardShadow } = useThemeValues();
 *   // ...
 * }
 * ```
 */

// Common background gradients
export const useThemeGradients = () => {
    const mainBgGradient = useColorModeValue(
        "linear(to-br, blue.50, purple.50, pink.50)",
        "linear(to-br, gray.900, blue.900, purple.900)"
    );

    const subtleBgGradient = useColorModeValue(
        "linear(to-br, blue.50, purple.50)",
        "linear(to-br, gray.900, blue.900)"
    );

    return {
        mainBgGradient,
        subtleBgGradient,
    };
};

// Common card styling
export const useThemeCards = () => {
    const cardBg = useColorModeValue("white", "gray.800");
    const cardShadow = useColorModeValue("xl", "dark-lg");
    const cardBorder = useColorModeValue("gray.200", "gray.600");

    return {
        cardBg,
        cardShadow,
        cardBorder,
    };
};

// Common text colors
export const useThemeText = () => {
    const primaryText = useColorModeValue("gray.800", "white");
    const secondaryText = useColorModeValue("gray.600", "gray.300");
    const mutedText = useColorModeValue("gray.500", "gray.400");

    return {
        primaryText,
        secondaryText,
        mutedText,
    };
};

// Combined theme values for convenience
export const useThemeValues = () => {
    const gradients = useThemeGradients();
    const cards = useThemeCards();
    const text = useThemeText();

    return {
        ...gradients,
        ...cards,
        ...text,
    };
};
