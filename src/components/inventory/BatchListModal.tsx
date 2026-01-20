import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	IconButton,
	HStack,
	Text,
	Box,
	useDisclosure,
	Tooltip,
	Spinner,
	Flex,
	useToast,
	Button,
} from "@chakra-ui/react";
import { EditIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import type { InventoryProduct } from "@/types/inventory";
import type {
	StockInventoryItem,
	UpdateStockInventoryRequest,
} from "@/types/stockInventory";
import { stockInventoryService } from "@/services/stockInventoryService";
import EditBatchModal from "./EditBatchModal";

interface BatchListModalProps {
	isOpen: boolean;
	onClose: () => void;
	product: InventoryProduct | null;
}

const BatchListModal = ({ isOpen, onClose, product }: BatchListModalProps) => {
	const toast = useToast();
	const {
		isOpen: isEditOpen,
		onOpen: onEditOpen,
		onClose: onEditClose,
	} = useDisclosure();

	const [batches, setBatches] = useState<StockInventoryItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedBatch, setSelectedBatch] =
		useState<StockInventoryItem | null>(null);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const pageSize = 10;

	// Fetch batches when modal opens or product changes or page changes
	useEffect(() => {
		if (isOpen && product?.id) {
			fetchBatches();
		}
	}, [isOpen, product?.id, currentPage]);

	const fetchBatches = async () => {
		if (!product?.id) return;

		setIsLoading(true);
		try {
			const result = await stockInventoryService.getStockInventories({
				productId: product.id,
				sortBy: "expirationDate",
				order: "asc",
				page: currentPage - 1, // Convert to zero-based
				size: pageSize,
			});
			console.log(result);

			if (result.success) {
				setBatches(result.data || []);
				setTotalItems(result.pagination?.totalItems || 0);
				setTotalPages(result.pagination?.totalPages || 0);
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải danh sách lô hàng",
					status: "error",
					duration: 3000,
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditBatch = (batch: StockInventoryItem) => {
		setSelectedBatch(batch);
		onEditOpen();
	};

	const handleUpdateBatch = async (
		lotId: string,
		updates: UpdateStockInventoryRequest,
	) => {
		const result = await stockInventoryService.updateStockInventory(
			lotId,
			updates,
		);

		if (result.success) {
			toast({
				title: "Thành công",
				description: "Đã cập nhật lô hàng",
				status: "success",
				duration: 2000,
			});
			await fetchBatches(); // Refresh list
			onEditClose();
		} else {
			toast({
				title: "Lỗi",
				description: result.error || "Không thể cập nhật lô hàng",
				status: "error",
				duration: 3000,
			});
		}
	};

	if (!product) return null;

	// Convert dd-MM-yyyy to Date object
	const parseBackendDate = (dateString: string): Date | null => {
		if (!dateString) return null;
		const [day, month, year] = dateString.split("-");
		return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const isExpiringSoon = (dateString: string | undefined) => {
		if (!dateString) return false;
		const expiryDate = parseBackendDate(dateString);
		if (!expiryDate) return false;

		const now = new Date();
		const daysUntilExpiry = Math.ceil(
			(expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);
		return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
	};

	const isExpired = (dateString: string | undefined) => {
		if (!dateString) return false;
		const expiryDate = parseBackendDate(dateString);
		if (!expiryDate) return false;
		return expiryDate < new Date();
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const handleModalClose = () => {
		setCurrentPage(1); // Reset to first page when closing
		onClose();
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleModalClose}
				size="6xl">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						Quản lý lô hàng - {product.name}
						<Text
							fontSize="sm"
							fontWeight="normal"
							color="gray.600"
							mt={1}>
							Mã sản phẩm: {product.code} | Tổng tồn kho:{" "}
							{product.stock} {product.unit}
						</Text>
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						{isLoading ? (
							<Flex
								justify="center"
								align="center"
								py={10}>
								<Spinner
									size="lg"
									color="brand.500"
								/>
							</Flex>
						) : batches.length === 0 ? (
							<Box
								textAlign="center"
								py={10}>
								<Text color="gray.600">
									Chưa có lô hàng nào
								</Text>
							</Box>
						) : (
							<Box overflowX="auto">
								<Table
									variant="simple"
									size="sm">
									<Thead bg="gray.50">
										<Tr>
											<Th>Mã lô</Th>
											<Th isNumeric>Số lượng</Th>
											<Th isNumeric>Giá nhập</Th>
											<Th>Ngày sản xuất</Th>
											<Th>Hạn sử dụng</Th>
											<Th textAlign="center">
												Trạng thái
											</Th>
											<Th textAlign="center">Thao tác</Th>
										</Tr>
									</Thead>
									<Tbody>
										{batches.map((batch) => {
											const expiringSoon = isExpiringSoon(
												batch.expirationDate,
											);
											const expired = isExpired(
												batch.expirationDate,
											);

											return (
												<Tr
													key={batch.lotId}
													bg={
														expired
															? "red.50"
															: expiringSoon
																? "yellow.50"
																: undefined
													}>
													<Td
														fontWeight="medium"
														maxW="200px">
														<Tooltip label={batch.lotId} placement="top">
															<Text
																overflow="hidden"
																textOverflow="ellipsis"
																whiteSpace="nowrap"
																cursor="pointer"
																onClick={() => {
																	navigator.clipboard.writeText(batch.lotId);
																	toast({
																		title: "Đã copy",
																		description: `Đã copy mã lô: ${batch.lotId}`,
																		status: "success",
																		duration: 1500,
																	});
																}}>
																{batch.lotId}
															</Text>
														</Tooltip>
													</Td>
													<Td isNumeric>
														{batch.stockQuantity}{" "}
														{product.unit}
													</Td>
													<Td isNumeric>
														{formatCurrency(
															batch.importPrice,
														)}
													</Td>
													<Td>
														{batch.manufactureDate}
													</Td>
													<Td>
														<HStack spacing={2}>
															<Text>
																{
																	batch.expirationDate
																}
															</Text>
														</HStack>
													</Td>
													<Td>
														{expiringSoon &&
															!expired && (
																<Badge
																	colorScheme="yellow"
																	fontSize="10px"
																	px={2}
																	py={1}>
																	Sắp hết hạn
																</Badge>
															)}
														{expired && (
															<Badge
																colorScheme="red"
																fontSize="10px"
																px={2}
																py={1}>
																Đã hết hạn
															</Badge>
														)}
													</Td>
													<Td textAlign="center">
														<Tooltip label="Chỉnh sửa lô hàng">
															<IconButton
																aria-label="Edit batch"
																icon={
																	<EditIcon />
																}
																size="sm"
																colorScheme="blue"
																variant="ghost"
																onClick={() =>
																	handleEditBatch(
																		batch,
																	)
																}
															/>
														</Tooltip>
													</Td>
												</Tr>
											);
										})}
									</Tbody>
								</Table>

								{/* Pagination Controls */}
								{totalPages > 1 && (
									<Flex
										mt={4}
										justify="space-between"
										align="center">
										<Text fontSize="sm" color="gray.600">
											Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
											{Math.min(currentPage * pageSize, totalItems)} trong tổng số {totalItems} lô hàng
										</Text>

										<HStack spacing={2}>
											<Button
												size="sm"
												leftIcon={<ChevronLeftIcon />}
												onClick={() => handlePageChange(currentPage - 1)}
												isDisabled={currentPage === 1}
												variant="outline">
												Trước
											</Button>

											<HStack spacing={1}>
												{Array.from({ length: totalPages }, (_, i) => i + 1)
													.filter(
														(page) =>
															page === 1 ||
															page === totalPages ||
															Math.abs(page - currentPage) <= 1,
													)
													.map((page, index, array) => {
														const prevPage = array[index - 1];
														const showEllipsis = prevPage && page - prevPage > 1;

														return (
															<>
																{showEllipsis && (
																	<Text key={`ellipsis-${page}`} px={2}>
																		...
																	</Text>
																)}
																<Button
																	key={page}
																	size="sm"
																	onClick={() => handlePageChange(page)}
																	colorScheme={
																		currentPage === page ? "blue" : "gray"
																	}
																	variant={
																		currentPage === page ? "solid" : "outline"
																	}>
																	{page}
																</Button>
															</>
														);
													})}
											</HStack>

											<Button
												size="sm"
												rightIcon={<ChevronRightIcon />}
												onClick={() => handlePageChange(currentPage + 1)}
												isDisabled={currentPage === totalPages}
												variant="outline">
												Sau
											</Button>
										</HStack>
									</Flex>
								)}
							</Box>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>

			<EditBatchModal
				isOpen={isEditOpen}
				onClose={onEditClose}
				batch={selectedBatch}
				productName={product.name}
				onUpdate={handleUpdateBatch}
			/>
		</>
	);
};

export default BatchListModal;
