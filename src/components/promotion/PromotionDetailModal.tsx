import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	Box,
	Text,
	VStack,
	HStack,
	Badge,
	Divider,
	Flex,
	Spinner,
	Tag,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import type { Promotion } from "../../types/promotion";
import { promotionService } from "../../services/promotionService";
import { formatDate } from "../../utils/date";

interface PromotionDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	promotionId: string | null;
	onEdit: (id: string) => void;
	onDelete: (id: string) => Promise<void>;
}

export const PromotionDetailModal: React.FC<PromotionDetailModalProps> = ({
	isOpen,
	onClose,
	promotionId,
	onEdit,
	onDelete,
}) => {
	const [promotion, setPromotion] = useState<Promotion | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (isOpen && promotionId) {
			loadPromotion();
		}
	}, [isOpen, promotionId]);

	const loadPromotion = async () => {
		setIsLoading(true);
		try {
			const data = await promotionService.getPromotionById(promotionId!);
			setPromotion(data || null);
		} catch (error) {
			console.error("Error loading promotion:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!promotionId || !promotion) return;

		if (
			window.confirm(
				`Bạn có chắc chắn muốn xóa khuyến mãi "${promotion.name}"?`,
			)
		) {
			setIsDeleting(true);
			try {
				await onDelete(promotionId);
				onClose();
			} catch (error) {
				console.error("Error deleting promotion:", error);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: { color: "green", label: "Đang áp dụng" },
			inactive: { color: "gray", label: "Chưa áp dụng" },
			expired: { color: "red", label: "Đã hết hạn" },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || {
			color: "gray",
			label: status,
		};

		return (
			<Badge
				colorScheme={config.color}
				px={3}
				py={1}
				borderRadius="full"
				fontSize="13px"
				fontWeight="600">
				{config.label}
			</Badge>
		);
	};

	const getTypeBadge = (type: string) => {
		const typeConfig = {
			discount: { color: "blue", label: "Giảm giá" },
			buyThisGetThat: { color: "orange", label: "Mua này tặng kia" },
		};

		const config = typeConfig[type as keyof typeof typeConfig] || {
			color: "gray",
			label: type,
		};

		return (
			<Tag
				colorScheme={config.color}
				size="lg"
				fontWeight="600">
				{config.label}
			</Tag>
		);
	};

	if (isLoading) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="xl">
				<ModalOverlay bg="blackAlpha.600" />
				<ModalContent>
					<ModalBody
						py={12}
						display="flex"
						justifyContent="center">
						<Spinner
							size="xl"
							color="brand.500"
						/>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}

	if (!promotion) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="xl">
				<ModalOverlay bg="blackAlpha.600" />
				<ModalContent>
					<ModalBody py={12}>
						<Text
							textAlign="center"
							color="gray.500">
							Không tìm thấy thông tin khuyến mãi
						</Text>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent>
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600">
					Chi tiết khuyến mãi
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack
						spacing={5}
						align="stretch">
						{/* Header info */}
						<Box>
							<Flex
								justify="space-between"
								align="center"
								mb={3}>
								<Text
									fontSize="20px"
									fontWeight="700"
									color="gray.800">
									{promotion.name}
								</Text>
								{getStatusBadge(promotion.status)}
							</Flex>
							<Flex
								gap={2}
								align="center">
								<Text
									fontSize="14px"
									color="gray.600"
									fontWeight="600">
									Mã KM:
								</Text>
								<Badge
									colorScheme="brand"
									fontSize="13px"
									px={2}
									py={1}>
									{promotion.code}
								</Badge>
								{getTypeBadge(promotion.type)}
							</Flex>
						</Box>

						<Divider />

						{/* Description */}
						{promotion.description && (
							<Box>
								<Text
									fontSize="14px"
									fontWeight="600"
									color="gray.700"
									mb={2}>
									Mô tả
								</Text>
								<Text
									fontSize="14px"
									color="gray.600">
									{promotion.description}
								</Text>
							</Box>
						)}

						{/* Promotion Details */}
						<Box>
							<Text
								fontSize="14px"
								fontWeight="600"
								color="gray.700"
								mb={2}>
								Chi tiết khuyến mãi
							</Text>
							<Box
								p={4}
								bg="brand.50"
								borderRadius="8px"
								borderWidth="1px"
								borderColor="brand.200">
								{promotion.type === "discount" &&
									promotion.discountConfig && (
										<VStack
											align="stretch"
											spacing={3}>
											<HStack spacing={2}>
												<Text
													fontSize="16px"
													fontWeight="700"
													color="brand.700">
													Giảm giá:
												</Text>
												<Text
													fontSize="24px"
													fontWeight="800"
													color="brand.600">
													{
														promotion.discountConfig
															.percentage
													}
													%
												</Text>
											</HStack>

											<Divider />

											<Text
												fontSize="14px"
												fontWeight="600"
												color="gray.700">
												Sản phẩm áp dụng (
												{
													promotion.discountConfig
														.products.length
												}
												):
											</Text>
											<Table
												size="sm"
												variant="simple">
												<Thead>
													<Tr>
														<Th
															fontSize="12px"
															color="gray.700">
															Sản phẩm
														</Th>
														<Th
															fontSize="12px"
															color="gray.700">
															Mã sản phẩm
														</Th>
													</Tr>
												</Thead>
												<Tbody>
													{promotion.discountConfig.products.map(
														(product, index) => (
															<Tr key={index}>
																<Td fontSize="13px">
																	<Text
																		fontWeight="600"
																		color="gray.800">
																		{
																			product.name
																		}
																	</Text>
																</Td>
																<Td
																	fontSize="13px"
																	color="gray.600">
																	{
																		product.code
																	}
																</Td>
															</Tr>
														),
													)}
												</Tbody>
											</Table>
										</VStack>
									)}

								{promotion.type === "buyThisGetThat" &&
									promotion.buyThisGetThatConfig && (
										<VStack
											align="stretch"
											spacing={3}>
											<Text
												fontSize="16px"
												fontWeight="700"
												color="brand.700">
												Mua này tặng kia
											</Text>

											{/* Purchase Groups */}
											<Box>
												<Text
													fontSize="14px"
													fontWeight="600"
													color="gray.700"
													mb={2}>
													Sản phẩm cần mua (
													{
														promotion
															.buyThisGetThatConfig
															.purchaseGroups
															.length
													}
													):
												</Text>
												<Table
													size="sm"
													variant="simple">
													<Thead>
														<Tr>
															<Th
																fontSize="12px"
																color="gray.700">
																Sản phẩm
															</Th>
															<Th
																fontSize="12px"
																color="gray.700"
																isNumeric>
																Số lượng
															</Th>
														</Tr>
													</Thead>
													<Tbody>
														{promotion.buyThisGetThatConfig.purchaseGroups.map(
															(group, index) => (
																<Tr key={index}>
																	<Td fontSize="13px">
																		<VStack
																			align="flex-start"
																			spacing={
																				0
																			}>
																			<Text
																				fontWeight="600"
																				color="gray.800">
																				{
																					group
																						.product
																						.name
																				}
																			</Text>
																			<Text
																				fontSize="12px"
																				color="gray.500">
																				{
																					group
																						.product
																						.code
																				}
																			</Text>
																		</VStack>
																	</Td>
																	<Td
																		fontSize="14px"
																		fontWeight="600"
																		color="blue.600"
																		isNumeric>
																		×
																		{
																			group.quantity
																		}
																	</Td>
																</Tr>
															),
														)}
													</Tbody>
												</Table>
											</Box>

											<Divider />

											{/* Gift Products */}
											<Box>
												<Text
													fontSize="14px"
													fontWeight="600"
													color="gray.700"
													mb={2}>
													Sản phẩm tặng (
													{
														promotion
															.buyThisGetThatConfig
															.giftProducts.length
													}
													):
												</Text>
												<Table
													size="sm"
													variant="simple">
													<Thead>
														<Tr>
															<Th
																fontSize="12px"
																color="gray.700">
																Sản phẩm
															</Th>
															<Th
																fontSize="12px"
																color="gray.700"
																isNumeric>
																Số lượng
															</Th>
														</Tr>
													</Thead>
													<Tbody>
														{promotion.buyThisGetThatConfig.giftProducts.map(
															(gift, index) => (
																<Tr key={index}>
																	<Td fontSize="13px">
																		<VStack
																			align="flex-start"
																			spacing={
																				0
																			}>
																			<Text
																				fontWeight="600"
																				color="gray.800">
																				{
																					gift
																						.product
																						.name
																				}
																			</Text>
																			<Text
																				fontSize="12px"
																				color="gray.500">
																				{
																					gift
																						.product
																						.code
																				}
																			</Text>
																		</VStack>
																	</Td>
																	<Td
																		fontSize="14px"
																		fontWeight="600"
																		color="green.600"
																		isNumeric>
																		×
																		{
																			gift.quantity
																		}
																	</Td>
																</Tr>
															),
														)}
													</Tbody>
												</Table>
											</Box>
										</VStack>
									)}
							</Box>
						</Box>

						{/* Time period */}
						<Box>
							<Text
								fontSize="14px"
								fontWeight="600"
								color="gray.700"
								mb={2}>
								Thời gian áp dụng
							</Text>
							<HStack
								spacing={4}
								p={3}
								bg="gray.50"
								borderRadius="8px">
								<VStack
									align="flex-start"
									spacing={0}
									flex={1}>
									<Text
										fontSize="12px"
										color="gray.600">
										Ngày bắt đầu
									</Text>
									<Text
										fontSize="15px"
										fontWeight="600"
										color="gray.800">
										{formatDate(promotion.startDate)}
									</Text>
								</VStack>
								<Text
									fontSize="20px"
									color="gray.400">
									→
								</Text>
								<VStack
									align="flex-start"
									spacing={0}
									flex={1}>
									<Text
										fontSize="12px"
										color="gray.600">
										Ngày kết thúc
									</Text>
									<Text
										fontSize="15px"
										fontWeight="600"
										color="gray.800">
										{formatDate(promotion.endDate)}
									</Text>
								</VStack>
							</HStack>
						</Box>

						{/* Additional info */}
						<Box>
							<VStack
								align="flex-start"
								spacing={0}
								fontSize="13px">
								<Text color="gray.600">Ngày tạo</Text>
								<Text
									fontWeight="600"
									color="gray.800">
									{formatDate(promotion.createdAt)}
								</Text>
							</VStack>
						</Box>
					</VStack>
				</ModalBody>

				<ModalFooter gap={3}>
					<Button
						variant="ghost"
						onClick={onClose}>
						Đóng
					</Button>
					<Button
						leftIcon={<DeleteIcon />}
						colorScheme="red"
						variant="outline"
						onClick={handleDelete}
						isLoading={isDeleting}>
						Xóa
					</Button>
					<Button
						leftIcon={<EditIcon />}
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						onClick={() => {
							onEdit(promotionId!);
							onClose();
						}}
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
						}}>
						Chỉnh sửa
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
