import { Box, Text, VStack, Icon, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

// Professional sale success notification - top right corner, clean, subtle

interface SaleCelebrationProps {
	isOpen: boolean;
	onClose: () => void;
	amount: number;
	orderId: string;
	change: number;
	duration?: number;
}

export const SaleCelebration: React.FC<SaleCelebrationProps> = ({
	isOpen,
	onClose,
	amount,
	orderId,
	change,
	duration = 2500,
}) => {
	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [isOpen, duration, onClose]);

	if (!isOpen) return null;

	return (
		<Box
			position="fixed"
			top={4}
			right={4}
			zIndex={9999}
			pointerEvents="none"
		>
			<Box
				bg="white"
				borderRadius="lg"
				p={4}
				shadow="lg"
				border="1px solid"
				borderColor="success.500"
				minW="320px"
			>
				<HStack spacing={3} mb={2}>
					<Icon
						as={FaCheckCircle}
						color="success.500"
						fontSize="xl"
					/>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color="gray.800"
					>
						Thanh toán thành công
					</Text>
				</HStack>
				
				<VStack align="stretch" spacing={2} fontSize="sm" color="gray.600">
					<HStack justify="space-between">
						<Text>Mã đơn:</Text>
						<Text fontWeight="semibold" fontFamily="mono">{orderId}</Text>
					</HStack>
					<HStack justify="space-between">
						<Text>Tổng tiền:</Text>
						<Text fontWeight="bold" fontSize="lg" color="brand.500">
							{amount.toLocaleString("vi-VN")}đ
						</Text>
					</HStack>
					{change > 0 && (
						<HStack justify="space-between">
							<Text>Tiền thừa:</Text>
							<Text fontWeight="semibold">{change.toLocaleString("vi-VN")}đ</Text>
						</HStack>
					)}
				</VStack>
			</Box>
		</Box>
	);
};

// Hook to trigger success notification
export const useSaleCelebration = () => {
	const [celebrationData, setCelebrationData] = useState<{
		isOpen: boolean;
		amount: number;
		orderId: string;
		change: number;
	}>({
		isOpen: false,
		amount: 0,
		orderId: "",
		change: 0,
	});

	const celebrate = (data: {
		amount: number;
		orderId: string;
		change: number;
	}) => {
		setCelebrationData({
			isOpen: true,
			...data,
		});
	};

	const closeCelebration = () => {
		setCelebrationData(prev => ({
			...prev,
			isOpen: false,
		}));
	};

	return {
		celebrationData,
		celebrate,
		closeCelebration,
	};
};
