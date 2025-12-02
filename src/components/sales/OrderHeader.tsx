import { Text, Button, Flex } from "@chakra-ui/react";
import { FiPause } from "react-icons/fi";

interface OrderHeaderProps {
	orderNumber: string;
	customerName?: string;
	createdAt: Date;
	onPauseOrder?: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
	orderNumber,
	customerName,
	createdAt,
	onPauseOrder,
}) => {
	const formatDateTime = (date: Date) => {
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `${hours}:${minutes} - ${day}/${month}/${year}`;
	};

	return (
		<Flex
			gap={2}
			align="center"
			flexWrap="wrap"
			justify="flex-end">
			<Flex
				gap={2}
				align="center"
				bg="blue.50"
				px={2}
				py={1.5}
				borderRadius="lg"
				border="1px solid"
				borderColor="blue.100">
				<Text
					fontSize="xs"
					color="gray.600"
					fontWeight="500">
					Mã:
				</Text>
				<Text
					fontSize="sm"
					fontWeight="700"
					color="#161f70">
					{orderNumber}
				</Text>
			</Flex>

			<Flex
				gap={2}
				align="center"
				bg="purple.50"
				px={2}
				py={1.5}
				borderRadius="lg"
				border="1px solid"
				borderColor="purple.100">
				<Text
					fontSize="xs"
					color="gray.600"
					fontWeight="500">
					Thời gian:
				</Text>
				<Text
					fontSize="sm"
					fontWeight="600"
					color="#161f70">
					{formatDateTime(createdAt)}
				</Text>
			</Flex>

			{customerName && (
				<Flex
					gap={2}
					align="center"
					bg="green.50"
					px={2}
					py={1.5}
					borderRadius="lg"
					border="1px solid"
					borderColor="green.100">
					<Text
						fontSize="xs"
						color="gray.600"
						fontWeight="500">
						Khách:
					</Text>
					<Text
						fontSize="sm"
						fontWeight="700"
						color="#161f70">
						{customerName}
					</Text>
				</Flex>
			)}

			{onPauseOrder && (
				<Button
					leftIcon={<FiPause />}
					colorScheme="orange"
					size="sm"
					variant="solid"
					onClick={onPauseOrder}
					h="auto"
					py={1.5}
					_hover={{
						bg: "orange.600",
					}}>
					Tạm dừng
				</Button>
			)}
		</Flex>
	);
};
