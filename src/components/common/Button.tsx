import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button as ChakraButton } from "@chakra-ui/react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg" | "xl";
	isLoading?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	children: ReactNode;
	fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "lg",
			isLoading = false,
			leftIcon,
			rightIcon,
			children,
			fullWidth = false,
			disabled,
			...props
		},
		ref,
	) => {
		const getVariantStyles = () => {
			switch (variant) {
				case "primary":
					return {
						bgGradient:
							"linear(135deg, brand.500 0%, brand.400 100%)",
						color: "white",
						boxShadow: "0 4px 14px rgba(22, 31, 112, 0.25)",
						_hover: {
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
							transform: "translateY(-2px)",
							boxShadow: "0 6px 20px rgba(22, 31, 112, 0.35)",
						},
						_active: {
							bgGradient:
								"linear(135deg, brand.700 0%, brand.600 100%)",
							transform: "translateY(0)",
							boxShadow: "0 2px 8px rgba(22, 31, 112, 0.25)",
						},
					};
				case "secondary":
					return {
						bg: "rgba(226, 232, 240, 0.8)",
						color: "gray.700",
						boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
						_hover: {
							bg: "rgba(203, 213, 225, 0.9)",
							transform: "translateY(-1px)",
							boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
						},
						_active: {
							bg: "rgba(186, 200, 216, 1)",
							transform: "translateY(0)",
							boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
						},
					};
				case "outline":
					return {
						bg: "transparent",
						color: "brand.500",
						border: "2px solid",
						borderColor: "brand.400",
						_hover: {
							bg: "rgba(211, 229, 255, 0.3)",
							borderColor: "brand.500",
							transform: "translateY(-1px)",
							boxShadow: "0 4px 12px rgba(22, 31, 112, 0.15)",
						},
						_active: {
							bg: "rgba(211, 229, 255, 0.5)",
							borderColor: "brand.600",
							transform: "translateY(0)",
						},
					};
				case "ghost":
					return {
						bg: "transparent",
						color: "brand.500",
						_hover: {
							bg: "rgba(211, 229, 255, 0.3)",
						},
						_active: {
							bg: "rgba(211, 229, 255, 0.5)",
						},
					};
				default:
					return {};
			}
		};

		const getSizeStyles = () => {
			switch (size) {
				case "sm":
					return {
						height: "40px",
						fontSize: "14px",
						px: 4,
						borderRadius: "12px",
					};
				case "md":
					return {
						height: "48px",
						fontSize: "16px",
						px: 6,
						borderRadius: "14px",
					};
				case "lg":
					return {
						height: "56px",
						fontSize: "18px",
						px: 8,
						borderRadius: "16px",
					};
				case "xl":
					return {
						height: "60px",
						fontSize: "20px",
						fontWeight: "600",
						px: 10,
						borderRadius: "18px",
					};
				default:
					return {};
			}
		};

		return (
			<ChakraButton
				ref={ref}
				isLoading={isLoading}
				leftIcon={leftIcon as any}
				rightIcon={rightIcon as any}
				width={fullWidth ? "full" : "auto"}
				fontWeight="600"
				transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
				isDisabled={disabled || isLoading}
				letterSpacing="tight"
				_disabled={{
					opacity: 0.5,
					cursor: "not-allowed",
					transform: "none",
					boxShadow: "none",
				}}
				{...getVariantStyles()}
				{...getSizeStyles()}
				{...(props as any)}>
				{children}
			</ChakraButton>
		);
	},
);

Button.displayName = "Button";
