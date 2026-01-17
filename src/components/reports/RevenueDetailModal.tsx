import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
	Grid,
	Text,
	Divider,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	Progress,
} from "@chakra-ui/react";
import { RevenueChart } from "./RevenueChart";
import type { RevenueReport, CategoryReport } from "@/types/reports";
import { useState, useEffect } from "react";
import apiService from "@/lib/api";

interface RevenueDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: RevenueReport;
}

export const RevenueDetailModal: React.FC<RevenueDetailModalProps> = ({
	isOpen,
	onClose,
	data,
}) => {
	const [categoryData, setCategoryData] = useState<CategoryReport | null>(null);

	// Load category breakdown data when modal opens
	useEffect(() => {
		if (isOpen && data.period) {
			loadCategoryReport();
		}
	}, [isOpen, data.period]);

	const loadCategoryReport = async () => {
		try {
			const response = await apiService.get<{ data: CategoryReport }>(
				`/reports/revenue/categories?period=${data.period}`
			);
			setCategoryData(response.data);
		} catch {
			// Category data is supplementary - modal still works without it
			setCategoryData(null);
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const formatPercent = (value: number) => {
		return `${value.toFixed(2)}%`;
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
					Chi tiết Báo cáo Doanh thu
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
									Tổng Doanh thu
								</StatLabel>
								<StatNumber
									color="blue.800"
									fontSize="2xl">
									{formatCurrency(data.totalRevenue)}
								</StatNumber>
								{data.growth !== undefined && (
									<StatHelpText mb={0}>
										<StatArrow
											type={
												data.growth >= 0
													? "increase"
													: "decrease"
											}
										/>
										{Math.abs(data.growth).toFixed(1)}% so
										với kỳ trước
									</StatHelpText>
								)}
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
									Tổng Chi phí
								</StatLabel>
								<StatNumber
									color="red.800"
									fontSize="2xl">
									{formatCurrency(data.totalCost)}
								</StatNumber>
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
									Lợi nhuận
								</StatLabel>
								<StatNumber
									color="green.800"
									fontSize="2xl">
									{formatCurrency(data.totalProfit)}
								</StatNumber>
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
									Biên lợi nhuận
								</StatLabel>
								<StatNumber
									color="purple.800"
									fontSize="2xl">
									{formatPercent(data.profitMargin)}
								</StatNumber>
							</Stat>
						</Box>
					</Grid>

					<Divider mb={6} />

					{/* Chart */}
					<RevenueChart data={data} />

					<Divider my={6} />

					{/* Category Revenue Breakdown */}
					{categoryData && (
						<>
							<Box mb={6}>
								<Text
									fontSize="18px"
									fontWeight="700"
									mb={4}>
									Doanh thu theo danh mục
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
													Danh mục
												</Box>
												<Box
													as="th"
													p={3}
													textAlign="right"
													fontWeight="600"
													borderBottom="1px solid"
													borderColor="gray.200">
													Doanh thu
												</Box>
												<Box
													as="th"
													p={3}
													textAlign="right"
													fontWeight="600"
													borderBottom="1px solid"
													borderColor="gray.200">
													Số lượng bán
												</Box>
												<Box
													as="th"
													p={3}
													textAlign="right"
													fontWeight="600"
													borderBottom="1px solid"
													borderColor="gray.200">
													Số sản phẩm
												</Box>
												<Box
													as="th"
													p={3}
													textAlign="left"
													fontWeight="600"
													borderBottom="1px solid"
													borderColor="gray.200"
													minW="200px">
													Tỷ trọng
												</Box>
											</Box>
										</Box>
										<Box as="tbody">
											{categoryData.categories.map((category, index) => (
												<Box
													as="tr"
													key={index}
													_hover={{ bg: "gray.50" }}>
													<Box
														as="td"
														p={3}
														fontWeight="600"
														borderBottom="1px solid"
														borderColor="gray.100">
														{category.category}
													</Box>
													<Box
														as="td"
														p={3}
														textAlign="right"
														fontWeight="600"
														color="blue.600"
														borderBottom="1px solid"
														borderColor="gray.100">
														{formatCurrency(category.revenue)}
													</Box>
													<Box
														as="td"
														p={3}
														textAlign="right"
														borderBottom="1px solid"
														borderColor="gray.100">
														{category.quantitySold.toLocaleString()}
													</Box>
													<Box
														as="td"
														p={3}
														textAlign="right"
														borderBottom="1px solid"
														borderColor="gray.100">
														{category.productCount}
													</Box>
													<Box
														as="td"
														p={3}
														borderBottom="1px solid"
														borderColor="gray.100">
														<Box>
															<Text
																fontSize="xs"
																fontWeight="600"
																color="purple.600"
																mb={1}>
																{category.percentage}%
															</Text>
															<Progress
																value={category.percentage}
																size="sm"
																colorScheme="purple"
																borderRadius="full"
															/>
														</Box>
													</Box>
												</Box>
											))}
										</Box>
									</Box>
								</Box>
							</Box>

							<Divider my={6} />
						</>
					)}

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
											Doanh thu
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Chi phí
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Lợi nhuận
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Số đơn hàng
										</Box>
										<Box
											as="th"
											p={3}
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Biên LN
										</Box>
									</Box>
								</Box>
								<Box as="tbody">
									{data.data.map((row, index) => {
										const margin =
											(row.profit / row.revenue) * 100;
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
													color="blue.600"
													borderBottom="1px solid"
													borderColor="gray.100">
													{formatCurrency(
														row.revenue,
													)}
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													color="red.600"
													borderBottom="1px solid"
													borderColor="gray.100">
													{formatCurrency(row.cost)}
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													fontWeight="600"
													color="green.600"
													borderBottom="1px solid"
													borderColor="gray.100">
													{formatCurrency(row.profit)}
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													borderBottom="1px solid"
													borderColor="gray.100">
													{row.orders}
												</Box>
												<Box
													as="td"
													p={3}
													textAlign="right"
													fontWeight="600"
													color="purple.600"
													borderBottom="1px solid"
													borderColor="gray.100">
													{formatPercent(margin)}
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
