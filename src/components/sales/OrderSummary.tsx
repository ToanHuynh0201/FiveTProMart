import { Box, VStack, HStack, Text, Button, Badge } from "@chakra-ui/react";

interface OrderSummaryProps {
	total: number;
	loyaltyPoints?: number;
	onPrint: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
	total,
	loyaltyPoints,
	onPrint,
}) => {
	return (
		<Box>
			<Box
				bgGradient="linear(135deg, gray.50 0%, gray.100 100%)"
				p={6}
				borderRadius="10px"
				borderWidth="2px"
				borderColor="gray.200">
				<VStack
					align="stretch"
					spacing={3}
					mb={5}>
					<HStack justify="space-between">
						<Text
							fontSize="16px"
							fontWeight="600"
							color="gray.600">
							TổNG TIỀN:
						</Text>
						<Text
							fontSize="32px"
							fontWeight="700"
							color="#161f70">
							{total.toLocaleString("vi-VN")}đ
						</Text>
					</HStack>
					{loyaltyPoints && loyaltyPoints > 0 && (
						<Badge
							colorScheme="green"
							fontSize="14px"
							fontWeight="600"
							py={2}
							px={4}
							borderRadius="6px"
							textAlign="center">
							⭐ Tích {loyaltyPoints} điểm
						</Badge>
					)}
				</VStack>
				<Button
					w="full"
					h="52px"
					bgGradient="linear(135deg, #161f70 0%, #0f1654 100%)"
					color="white"
					fontSize="18px"
					fontWeight="700"
					borderRadius="10px"
					boxShadow="0 4px 12px rgba(22, 31, 112, 0.3)"
					transition="all 0.3s"
					_hover={{
						transform: "translateY(-2px)",
						boxShadow: "0 6px 16px rgba(22, 31, 112, 0.4)",
					}}
					_active={{
						transform: "translateY(0)",
					}}
					_disabled={{
						bgGradient: "none",
						bg: "gray.300",
						cursor: "not-allowed",
						boxShadow: "none",
					}}
					onClick={onPrint}
					isDisabled={total === 0}>
					In hóa đơn
				</Button>
			</Box>
		</Box>
	);
};
