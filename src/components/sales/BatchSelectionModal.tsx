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
	Button,
	Text,
	Flex,
	Box,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
import type { Product } from "../../types/sales";
import { getExpiryStatus, isExpired, isExpiringSoon } from "../../utils/date";

interface BatchSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	product: Product | null;
	onConfirm: (batchId: string, quantity: number) => void;
}

export const BatchSelectionModal: React.FC<BatchSelectionModalProps> = ({
	isOpen,
	onClose,
	product,
	onConfirm,
}) => {
	const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);

	const handleClose = () => {
		setSelectedBatch(null);
		setQuantity(1);
		onClose();
	};

	const handleConfirm = () => {
		if (selectedBatch) {
			onConfirm(selectedBatch, quantity);
			handleClose();
		}
	};

	if (!product || !product.batches || product.batches.length === 0) {
		return null;
	}

	const selectedBatchData = product.batches.find(
		(b) => b.id === selectedBatch,
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="3xl">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent borderRadius="16px">
				<ModalHeader
					fontSize="20px"
					fontWeight="700"
					color="gray.800"
					borderBottom="1px solid"
					borderColor="gray.200"
					pb={4}>
					Chọn lô hàng - {product.name}
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody py={6}>
					<Box
						mb={4}
						p={3}
						bg="blue.50"
						borderRadius="8px">
						<Text
							fontSize="14px"
							color="blue.800">
							💡 Chọn lô hàng mà khách hàng đã lấy. Lô sắp hết hạn
							sẽ được đánh dấu để ưu tiên bán.
						</Text>
					</Box>

					<Table variant="simple">
						<Thead bg="gray.50">
							<Tr>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none">
									Số lô
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none">
									Tồn kho
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none">
									Hạn sử dụng
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none">
									Trạng thái
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									textAlign="center">
									Chọn
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{product.batches
								.sort((a, b) => {
									// Ưu tiên hiển thị lô sắp hết hạn trước
									const aExpiring = isExpiringSoon(
										a.expiryDate,
										7,
									);
									const bExpiring = isExpiringSoon(
										b.expiryDate,
										7,
									);
									const aExpired = isExpired(a.expiryDate);
									const bExpired = isExpired(b.expiryDate);

									if (aExpired && !bExpired) return -1;
									if (!aExpired && bExpired) return 1;
									if (aExpiring && !bExpiring) return -1;
									if (!aExpiring && bExpiring) return 1;
									return (
										new Date(a.expiryDate).getTime() -
										new Date(b.expiryDate).getTime()
									);
								})
								.map((batch) => {
									const expiryStatus = getExpiryStatus(
										batch.expiryDate,
									);
									const expired = isExpired(batch.expiryDate);
									const expiringSoon = isExpiringSoon(
										batch.expiryDate,
										7,
									);
									const isSelected =
										selectedBatch === batch.id;

									return (
										<Tr
											key={batch.id}
											bg={
												isSelected
													? "blue.50"
													: expired
													? "red.50"
													: expiringSoon
													? "orange.50"
													: "white"
											}
											_hover={{
												bg: isSelected
													? "blue.100"
													: "gray.50",
											}}
											cursor="pointer"
											onClick={() =>
												setSelectedBatch(batch.id)
											}
											borderLeft={
												isSelected
													? "4px solid"
													: "4px solid transparent"
											}
											borderColor={
												isSelected
													? "blue.500"
													: "transparent"
											}>
											<Td fontWeight="600">
												<Flex
													align="center"
													gap={2}>
													{batch.batchNumber}
													{(expired ||
														expiringSoon) && (
														<Tooltip
															label={
																expired
																	? "Ưu tiên bán - Đã hết hạn"
																	: "Ưu tiên bán - Sắp hết hạn"
															}>
															<Badge
																colorScheme={
																	expired
																		? "red"
																		: "orange"
																}
																fontSize="10px">
																Ưu tiên
															</Badge>
														</Tooltip>
													)}
												</Flex>
											</Td>
											<Td>
												<Text fontWeight="600">
													{batch.quantity}
												</Text>
											</Td>
											<Td>
												<Text fontSize="14px">
													{new Date(
														batch.expiryDate,
													).toLocaleDateString(
														"vi-VN",
													)}
												</Text>
											</Td>
											<Td>
												<Badge
													colorScheme={
														expired
															? "red"
															: expiryStatus.color
													}
													fontSize="11px"
													px={2}
													py={1}
													borderRadius="md">
													{expired
														? "Đã hết hạn"
														: expiryStatus.text}
												</Badge>
											</Td>
											<Td textAlign="center">
												<Button
													size="sm"
													colorScheme={
														isSelected
															? "blue"
															: "gray"
													}
													variant={
														isSelected
															? "solid"
															: "outline"
													}
													onClick={(e) => {
														e.stopPropagation();
														setSelectedBatch(
															batch.id,
														);
													}}>
													{isSelected
														? "✓ Đã chọn"
														: "Chọn"}
												</Button>
											</Td>
										</Tr>
									);
								})}
						</Tbody>
					</Table>

					{selectedBatch && selectedBatchData && (
						<Box
							mt={6}
							p={4}
							bg="gray.50"
							borderRadius="10px">
							<Flex
								justify="space-between"
								align="center">
								<Box>
									<Text
										fontSize="14px"
										color="gray.600"
										mb={1}>
										Lô đã chọn
									</Text>
									<Text
										fontSize="16px"
										fontWeight="700"
										color="gray.800">
										{selectedBatchData.batchNumber} (Tồn:{" "}
										{selectedBatchData.quantity})
									</Text>
								</Box>
								<Box>
									<Text
										fontSize="14px"
										color="gray.600"
										mb={2}>
										Số lượng
									</Text>
									<NumberInput
										value={quantity}
										min={1}
										max={selectedBatchData.quantity}
										w="120px"
										size="md"
										onChange={(_, val) => {
											if (!isNaN(val) && val >= 1) {
												setQuantity(
													Math.min(
														val,
														selectedBatchData.quantity,
													),
												);
											}
										}}>
										<NumberInputField
											textAlign="center"
											fontWeight="600"
										/>
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</Box>
							</Flex>
						</Box>
					)}
				</ModalBody>

				<Flex
					p={6}
					borderTop="1px solid"
					borderColor="gray.200"
					justify="flex-end"
					gap={3}>
					<Button
						variant="outline"
						onClick={handleClose}
						h="44px"
						px={6}>
						Hủy
					</Button>
					<Button
						colorScheme="blue"
						onClick={handleConfirm}
						isDisabled={!selectedBatch}
						h="44px"
						px={6}>
						Xác nhận
					</Button>
				</Flex>
			</ModalContent>
		</Modal>
	);
};
