import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
	Grid,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	Text,
	Divider,
	Badge,
} from "@chakra-ui/react";
import { OrdersChart } from "./OrdersChart";
import type { OrdersReport } from "@/types/reports";

interface OrdersDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: OrdersReport;
}

export const OrdersDetailModal: React.FC<OrdersDetailModalProps> = ({
	isOpen,
	onClose,
	data,
}) => {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const formatPercent = (value: number) => {
		return `${value.toFixed(1)}%`;
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="6xl"
			scrollBehavior="inside">
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent maxH="90vh">
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="gray.800">
					Chi tiết Báo cáo Đơn hàng
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					{/* Summary Stats */}
					<Grid
						templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
						gap={4}
						mb={6}>
						<Box
							bg="blue.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="blue.100">
							<Stat>
								<StatLabel
									color="blue.700"
									fontWeight="600">
									Tổng đơn hàng
								</StatLabel>
								<StatNumber
									color="blue.800"
									fontSize="2xl">
									{data.totalOrders}
								</StatNumber>
								<StatHelpText
									mb={0}
									color="blue.600">
									Tăng {data.growth.toFixed(1)}%
								</StatHelpText>
							</Stat>
						</Box>

						<Box
							bg="green.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="green.100">
							<Stat>
								<StatLabel
									color="green.700"
									fontWeight="600">
									Hoàn thành
								</StatLabel>
								<StatNumber
									color="green.800"
									fontSize="2xl">
									{data.completedOrders}
								</StatNumber>
								<StatHelpText
									mb={0}
									color="green.600">
									{formatPercent(data.completionRate)}
								</StatHelpText>
							</Stat>
						</Box>

						<Box
							bg="red.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="red.100">
							<Stat>
								<StatLabel
									color="red.700"
									fontWeight="600">
									Đã hủy
								</StatLabel>
								<StatNumber
									color="red.800"
									fontSize="2xl">
									{data.cancelledOrders}
								</StatNumber>
								<StatHelpText
									mb={0}
									color="red.600">
									{formatPercent(
										(data.cancelledOrders /
											data.totalOrders) *
											100,
									)}
								</StatHelpText>
							</Stat>
						</Box>

						<Box
							bg="purple.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="purple.100">
							<Stat>
								<StatLabel
									color="purple.700"
									fontWeight="600">
									Giá trị TB
								</StatLabel>
								<StatNumber
									color="purple.800"
									fontSize="2xl">
									{formatCurrency(data.averageOrderValue)}
								</StatNumber>
							</Stat>
						</Box>
					</Grid>

					<Divider mb={6} />

					{/* Chart */}
					<OrdersChart data={data} />

					<Divider my={6} />

					{/* Detailed Table */}
					<Box>
						<Text
							fontSize="18px"
							fontWeight="700"
							mb={4}>
							Chi tiết theo ngày
						</Text>
						<Box
							overflowX="auto"
							border="1px solid"
							borderColor="gray.200"
							borderRadius="lg">
							<Box
								as="table"
								w="full"
								fontSize="sm">
								<Box
									as="thead"
									bg="gray.50">
									<Box as="tr">
										<Box
											as="th"
											p={3}
											textAlign="left"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Ngày
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Tổng đơn
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Hoàn thành
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Đã hủy
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Tỷ lệ hoàn thành
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Giá trị TB
										</Box>
									</Box>
								</Box>
								<Box as="tbody">
									{data.data.map((row, index) => {
										const completionRate =
											(row.completedOrders /
												row.totalOrders) *
											100;
										return (
											<Box
												as="tr"
												key={index}
												_hover={{ bg: "gray.50" }}>
												<Box
													as="td"
													p={3}
													borderBottom="1px solid"
													borderColor="gray.100">
													{new Date(
														row.date,
													).toLocaleDateString(
														"vi-VN",
													)}
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													fontWeight="600"
													borderBottom="1px solid"
													borderColor="gray.100">
													{row.totalOrders}
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													borderBottom="1px solid"
													borderColor="gray.100">
													<Badge colorScheme="green">
														{row.completedOrders}
													</Badge>
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													borderBottom="1px solid"
													borderColor="gray.100">
													<Badge colorScheme="red">
														{row.cancelledOrders}
													</Badge>
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													fontWeight="600"
													color={
														completionRate >= 90
															? "green.600"
															: "orange.600"
													}
													borderBottom="1px solid"
													borderColor="gray.100">
													{formatPercent(
														completionRate,
													)}
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													fontWeight="600"
													color="purple.600"
													borderBottom="1px solid"
													borderColor="gray.100">
													{formatCurrency(
														row.averageValue,
													)}
												</Box>
											</Box>
										);
									})}
								</Box>
							</Box>
						</Box>
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
