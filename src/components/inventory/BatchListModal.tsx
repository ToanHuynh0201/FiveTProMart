import { useState } from "react";
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
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import type { InventoryProduct, ProductBatch } from "@/types/inventory";
import EditBatchModal from "./EditBatchModal";

interface BatchListModalProps {
	isOpen: boolean;
	onClose: () => void;
	product: InventoryProduct | null;
	onUpdateBatch: (
		batchId: string,
		updates: Partial<ProductBatch>,
	) => Promise<void>;
}

const BatchListModal = ({
	isOpen,
	onClose,
	product,
	onUpdateBatch,
}: BatchListModalProps) => {
	const {
		isOpen: isEditOpen,
		onOpen: onEditOpen,
		onClose: onEditClose,
	} = useDisclosure();
	const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(
		null,
	);

	const handleEditBatch = (batch: ProductBatch) => {
		setSelectedBatch(batch);
		onEditOpen();
	};

	const handleUpdateBatch = async (
		batchId: string,
		updates: Partial<ProductBatch>,
	) => {
		await onUpdateBatch(batchId, updates);
		onEditClose();
	};

	if (!product) return null;

	const batches = product.batches || [];

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: { label: "Đang hoạt động", color: "green" },
			expired: { label: "Hết hạn", color: "red" },
			"sold-out": { label: "Đã bán hết", color: "gray" },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || {
			label: status,
			color: "gray",
		};
		return <Badge colorScheme={config.color}>{config.label}</Badge>;
	};

	const formatDate = (date: Date | undefined) => {
		if (!date) return "-";
		return new Date(date).toLocaleDateString("vi-VN");
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const isExpiringSoon = (expiryDate: Date | undefined) => {
		if (!expiryDate) return false;
		const now = new Date();
		const expiry = new Date(expiryDate);
		const daysUntilExpiry = Math.ceil(
			(expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);
		return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
	};

	const isExpired = (expiryDate: Date | undefined) => {
		if (!expiryDate) return false;
		return new Date(expiryDate) < new Date();
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="6xl">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						Quản lý lô hàng - {product.name}
						<Text
							fontSize="sm"
							fontWeight="normal"
							color="gray.500"
							mt={1}>
							Mã sản phẩm: {product.code} | Tổng tồn kho:{" "}
							{product.stock} {product.unit}
						</Text>
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						{batches.length === 0 ? (
							<Box
								textAlign="center"
								py={10}>
								<Text color="gray.500">
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
											<Th>Số lô</Th>
											<Th isNumeric>Số lượng</Th>
											<Th isNumeric>Giá vốn</Th>
											<Th>Ngày nhập</Th>
											<Th>Hạn sử dụng</Th>
											<Th>Nhà cung cấp</Th>
											<Th>Trạng thái</Th>
											<Th textAlign="center">Thao tác</Th>
										</Tr>
									</Thead>
									<Tbody>
										{batches.map((batch) => {
											const expiringSoon = isExpiringSoon(
												batch.expiryDate,
											);
											const expired = isExpired(
												batch.expiryDate,
											);

											return (
												<Tr
													key={batch.id}
													bg={
														expired
															? "red.50"
															: expiringSoon
															? "yellow.50"
															: undefined
													}>
													<Td fontWeight="medium">
														{batch.batchNumber}
													</Td>
													<Td isNumeric>
														{batch.quantity}{" "}
														{product.unit}
													</Td>
													<Td isNumeric>
														{formatCurrency(
															batch.costPrice,
														)}
													</Td>
													<Td>
														{formatDate(
															batch.importDate,
														)}
													</Td>
													<Td>
														<HStack spacing={2}>
															<Text>
																{formatDate(
																	batch.expiryDate,
																)}
															</Text>
															{expiringSoon && (
																<Badge
																	colorScheme="yellow"
																	fontSize="xs">
																	Sắp hết hạn
																</Badge>
															)}
															{expired && (
																<Badge
																	colorScheme="red"
																	fontSize="xs">
																	Đã hết hạn
																</Badge>
															)}
														</HStack>
													</Td>
													<Td>
														{batch.supplier || "-"}
													</Td>
													<Td>
														{getStatusBadge(
															batch.status,
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
