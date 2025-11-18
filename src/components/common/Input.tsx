import { useState, forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import {
	Input as ChakraInput,
	FormControl,
	FormLabel,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	IconButton,
	Text,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface InputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
	label?: string;
	error?: string;
	leftIcon?: ReactNode;
	rightElement?: ReactNode;
	showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			leftIcon,
			rightElement,
			showPasswordToggle,
			type = "text",
			...props
		},
		ref,
	) => {
		const [showPassword, setShowPassword] = useState(false);
		const inputType = type === "password" && showPassword ? "text" : type;

		return (
			<FormControl isInvalid={!!error}>
				{label && (
					<FormLabel
						fontSize={{ base: "18px", md: "20px" }}
						fontWeight="600"
						color="gray.700"
						mb={{ base: 2, md: 2.5 }}
						letterSpacing="tight">
						{label}
					</FormLabel>
				)}
				<InputGroup size="lg">
					{leftIcon && (
						<InputLeftElement
							pointerEvents="none"
							height={{ base: "56px", md: "64px" }}
							width={{ base: "50px", md: "60px" }}>
							{leftIcon}
						</InputLeftElement>
					)}
					<ChakraInput
						ref={ref}
						type={inputType}
						bg="rgba(217, 233, 255, 0.4)"
						border="1px solid"
						borderColor="rgba(22, 31, 112, 0.08)"
						borderRadius="20px"
						height={{ base: "56px", md: "64px" }}
						fontSize={{ base: "16px", md: "18px" }}
						fontWeight="400"
						color="gray.800"
						pl={leftIcon ? { base: "60px", md: "70px" } : "20px"}
						pr={
							showPasswordToggle || rightElement
								? { base: "100px", md: "120px" }
								: "20px"
						}
						_placeholder={{
							color: "gray.500",
							opacity: 0.7,
							fontWeight: "400",
						}}
						_hover={{
							bg: "rgba(217, 233, 255, 0.55)",
							borderColor: "rgba(22, 31, 112, 0.12)",
						}}
						_focus={{
							bg: "rgba(217, 233, 255, 0.6)",
							borderColor: "brand.300",
							boxShadow:
								"0 0 0 3px rgba(22, 31, 112, 0.08), 0 1px 2px rgba(22, 31, 112, 0.05)",
							outline: "none",
						}}
						transition="all 0.2s ease"
						{...props}
					/>
					{showPasswordToggle && type === "password" && (
						<InputRightElement
							height={{ base: "56px", md: "68px" }}
							width="auto"
							pr={4}>
							<IconButton
								aria-label={
									showPassword
										? "Ẩn mật khẩu"
										: "Hiện mật khẩu"
								}
								icon={
									showPassword ? (
										<ViewOffIcon />
									) : (
										<ViewIcon />
									)
								}
								onClick={() => setShowPassword(!showPassword)}
								variant="ghost"
								size="sm"
								color="brand.400"
								_hover={{
									bg: "transparent",
									color: "brand.500",
								}}
							/>
							<Text
								fontSize={{ base: "10px", md: "12px" }}
								color="brand.400"
								ml={2}
								display={{ base: "none", sm: "block" }}>
								{showPassword ? "Ẩn" : "Hiện"} mật khẩu
							</Text>
						</InputRightElement>
					)}
					{rightElement && !showPasswordToggle && (
						<InputRightElement
							height={{ base: "56px", md: "68px" }}
							width="auto"
							pr={4}>
							{rightElement}
						</InputRightElement>
					)}
				</InputGroup>
				{error && (
					<Text
						color="error.500"
						fontSize="sm"
						mt={1}>
						{error}
					</Text>
				)}
			</FormControl>
		);
	},
);

Input.displayName = "Input";
