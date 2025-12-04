import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
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
											Đơn hàng
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
