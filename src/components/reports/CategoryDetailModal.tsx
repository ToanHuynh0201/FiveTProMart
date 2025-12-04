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
	Progress,
	Flex,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { CategoryChart } from "./CategoryChart";
import Pagination from "@/components/common/Pagination";
import type { CategoryReport } from "@/types/reports";

interface CategoryDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: CategoryReport;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
	isOpen,
	onClose,
	data,
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const formatPercent = (value: number) => {
		return `${value.toFixed(1)}%`;
	};

	// Calculate pagination
	const totalPages = Math.ceil(data.categories.length / pageSize);
	const paginatedCategories = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return data.categories.slice(startIndex, endIndex);
	}, [data.categories, currentPage, pageSize]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
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
					Chi tiết Doanh thu theo Danh mục
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<Divider mb={6} />

					{/* Chart */}
					<CategoryChart data={data} />

					<Divider my={6} />

					{/* Detailed Table */}
					<Box>
						<Text
							fontSize="18px"
							fontWeight="700"
							mb={4}>
							Chi tiết theo danh mục
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
											textAlign="right"
											fontWeight="600"
											borderBottom="1px solid"
											borderColor="gray.200">
											Doanh thu TB/SP
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
									{paginatedCategories.map((category, index) => {
										const avgRevenuePerProduct =
											category.revenue / category.productCount;
										const globalIndex = (currentPage - 1) * pageSize + index + 1;
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
													<Flex
														align="center"
														gap={2}>
														<Text
															fontSize="xs"
															fontWeight="600"
															color="gray.500"
															minW="20px">
															{globalIndex}.
														</Text>
														<Text fontWeight="600">
															{category.category}
														</Text>
													</Flex>
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
													textAlign="right"
													fontWeight="600"
													color="green.600"
													borderBottom="1px solid"
													borderColor="gray.100">
													{formatCurrency(avgRevenuePerProduct)}
												</Box>
												<Box
													as="td"
													p={3}
													borderBottom="1px solid"
													borderColor="gray.100">
													<Box>
														<Flex
															justify="space-between"
															align="center"
															mb={1}>
															<Text
																fontSize="xs"
																fontWeight="600"
																color="purple.600">
																{formatPercent(category.percentage)}
															</Text>
															<Text
																fontSize="xs"
																color="gray.500">
																{formatCurrency(category.revenue)}
															</Text>
														</Flex>
														<Progress
															value={category.percentage}
															size="sm"
															colorScheme="purple"
															borderRadius="full"
														/>
													</Box>
												</Box>
											</Box>
										);
									})}
								</Box>
							</Box>
						</Box>

						{/* Pagination */}
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={data.categories.length}
							pageSize={pageSize}
							onPageChange={handlePageChange}
							itemLabel="danh mục"
						/>
					</Box>

					<Divider my={6} />

					{/* Summary Stats */}
					<Box>
						<Text
							fontSize="18px"
							fontWeight="700"
							mb={4}>
							Tổng quan
						</Text>
						<Box
							p={4}
							bg="blue.50"
							borderRadius="lg"
							border="1px solid"
							borderColor="blue.100">
							<Flex
								justify="space-between"
								align="center"
								mb={3}>
								<Text
									fontSize="sm"
									color="blue.700"
									fontWeight="600">
									Tổng doanh thu:
								</Text>
								<Text
									fontSize="lg"
									fontWeight="700"
									color="blue.800">
									{formatCurrency(data.totalRevenue)}
								</Text>
							</Flex>
							<Flex
								justify="space-between"
								align="center"
								mb={3}>
								<Text
									fontSize="sm"
									color="blue.700"
									fontWeight="600">
									Số danh mục:
								</Text>
								<Text
									fontSize="lg"
									fontWeight="700"
									color="blue.800">
									{data.categories.length}
								</Text>
							</Flex>
							<Flex
								justify="space-between"
								align="center">
								<Text
									fontSize="sm"
									color="blue.700"
									fontWeight="600">
									Danh mục có doanh thu cao nhất:
								</Text>
								<Text
									fontSize="lg"
									fontWeight="700"
									color="blue.800">
									{data.categories[0]?.category} (
									{formatPercent(data.categories[0]?.percentage || 0)})
								</Text>
							</Flex>
						</Box>
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
