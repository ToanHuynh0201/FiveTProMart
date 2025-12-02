import { Grid, Box, Text, Button, Flex } from "@chakra-ui/react";
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
		<Box>
			<Flex
				justify="space-between"
				align="center"
				mb={4}>
				<Text
					fontSize="lg"
					fontWeight="bold"
					color="#161f70">
					Thông tin đơn hàng
				</Text>
				{onPauseOrder && (
					<Button
						leftIcon={<FiPause />}
						colorScheme="orange"
						size="sm"
						variant="outline"
						onClick={onPauseOrder}
						_hover={{
							bg: "orange.50",
							borderColor: "orange.600",
						}}>
						Tạm dừng hóa đơn
					</Button>
				)}
			</Flex>
			<Grid
				templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
				gap={6}>
				<Box
					p={3}
					bg="gray.50"
					borderRadius="md"
					borderLeft="3px solid"
					borderColor="#161f70"
					transition="all 0.2s"
					_hover={{
						bg: "gray.100",
						transform: "translateY(-2px)",
					}}>
					<Text
						fontSize="xs"
						fontWeight="500"
						color="gray.600"
						textTransform="uppercase"
						letterSpacing="wider"
						mb={1.5}>
						Mã đơn hàng
					</Text>
					<Text
						fontSize="xl"
						fontWeight="700"
						color="#161f70">
						{orderNumber}
					</Text>
				</Box>

				<Box
					p={3}
					bg="gray.50"
					borderRadius="md"
					borderLeft="3px solid"
					borderColor="#161f70"
					transition="all 0.2s"
					_hover={{
						bg: "gray.100",
						transform: "translateY(-2px)",
					}}>
					<Text
						fontSize="xs"
						fontWeight="500"
						color="gray.600"
						textTransform="uppercase"
						letterSpacing="wider"
						mb={1.5}>
						Thời gian tạo
					</Text>
					<Text
						fontSize="lg"
						fontWeight="600"
						color="#161f70">
						{formatDateTime(createdAt)}
					</Text>
				</Box>

				{customerName && (
					<Box
						p={3}
						bg="gray.50"
						borderRadius="md"
						borderLeft="3px solid"
						borderColor="#161f70"
						transition="all 0.2s"
						_hover={{
							bg: "gray.100",
							transform: "translateY(-2px)",
						}}>
						<Text
							fontSize="xs"
							fontWeight="500"
							color="gray.600"
							textTransform="uppercase"
							letterSpacing="wider"
							mb={1.5}>
							Khách hàng
						</Text>
						<Text
							fontSize="xl"
							fontWeight="700"
							color="#161f70">
							{customerName}
						</Text>
					</Box>
				)}
			</Grid>
		</Box>
	);
};
