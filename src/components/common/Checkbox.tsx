import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { Box, Checkbox as ChakraCheckbox, Text } from "@chakra-ui/react";

interface CheckboxProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
	label?: string;
	error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, error, ...props }, ref) => {
		return (
			<Box>
				<ChakraCheckbox
					ref={ref as any}
					colorScheme="brand"
					size="md"
					borderColor="brand.300"
					iconColor="white"
					sx={{
						".chakra-checkbox__control": {
							borderRadius: "4px",
							borderWidth: "1px",
							borderColor: "brand.300",
							_checked: {
								bg: "brand.500",
								borderColor: "brand.500",
								_hover: {
									bg: "brand.600",
									borderColor: "brand.600",
								},
							},
							_hover: {
								borderColor: "brand.400",
							},
						},
					}}
					{...(props as any)}>
					{label && (
						<Text
							fontSize="12px"
							fontWeight="400"
							color="brand.400">
							{label}
						</Text>
					)}
				</ChakraCheckbox>
				{error && (
					<Text
						color="error.500"
						fontSize="sm"
						mt={1}>
						{error}
					</Text>
				)}
			</Box>
		);
	},
);

Checkbox.displayName = "Checkbox";
