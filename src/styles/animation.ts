import { keyframes } from "@emotion/react";

// Common animation keyframes
export const animations = {
	fadeIn: keyframes`
    from { 
      opacity: 0; 
      transform: translateY(10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  `,

	fadeInUp: keyframes`
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  `,

	slideInLeft: keyframes`
    from { 
      opacity: 0; 
      transform: translateX(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  `,

	slideInRight: keyframes`
    from { 
      opacity: 0; 
      transform: translateX(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  `,

	pulse: keyframes`
    0%, 100% { 
      opacity: 1; 
      transform: scale(1); 
    }
    50% { 
      opacity: 0.8; 
      transform: scale(1.05); 
    }
  `,

	bounce: keyframes`
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -8px, 0);
    }
    70% {
      transform: translate3d(0, -4px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  `,

	float: keyframes`
    0%, 100% { 
      transform: translateY(0px); 
    }
    50% { 
      transform: translateY(-10px); 
    }
  `,

	shimmer: keyframes`
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  `,

	spin: keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `,

	scale: keyframes`
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  `,

	slideDown: keyframes`
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,

	shake: keyframes`
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-4px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(4px);
    }
  `,
};

// Animation presets with duration and easing
export const animationPresets = {
	fadeIn: `${animations.fadeIn} 0.3s ease-out`,
	fadeInUp: `${animations.fadeInUp} 0.4s ease-out`,
	slideInLeft: `${animations.slideInLeft} 0.3s ease-out`,
	slideInRight: `${animations.slideInRight} 0.3s ease-out`,
	pulse: `${animations.pulse} 2s ease-in-out infinite`,
	bounce: `${animations.bounce} 1s ease-in-out`,
	float: `${animations.float} 3s ease-in-out infinite`,
	shimmer: `${animations.shimmer} 1.5s ease-in-out infinite`,
	spin: `${animations.spin} 1s linear infinite`,
	scale: `${animations.scale} 0.2s ease-out`,
	slideDown: `${animations.slideDown} 0.3s ease-out`,
	shake: `${animations.shake} 0.5s ease-in-out`,
}; // Transition presets
export const transitions = {
	fast: "all 0.15s ease",
	normal: "all 0.2s ease",
	slow: "all 0.3s ease",
	bounce: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
	smooth: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
};

// Animation utilities
export const animationUtils = {
	/**
	 * Create staggered animation delays for lists
	 * @param {number} index - Item index
	 * @param {number} delay - Base delay in ms
	 * @returns {string} Animation delay
	 */
	staggerDelay: (index: any, delay = 100) => `${index * delay}ms`,

	/**
	 * Get random animation duration
	 * @param {number} min - Minimum duration in ms
	 * @param {number} max - Maximum duration in ms
	 * @returns {string} Random duration
	 */
	randomDuration: (min = 300, max = 800) =>
		`${Math.random() * (max - min) + min}ms`,
};

export default {
	animations,
	animationPresets,
	transitions,
	animationUtils,
};
