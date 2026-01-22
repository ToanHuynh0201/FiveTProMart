import {
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Text,
	Badge,
	IconButton,
	Flex,
	Tooltip,
	Tag,
	VStack,
	HStack,
} from "@chakra-ui/react";
import { ViewIcon, EditIcon, CloseIcon } from "@chakra-ui/icons";
import type {
	Promotion,
	PromotionStatus,
	PromotionType,
} from "../../types/promotion";

interface PromotionTableProps {
	promotions: Promotion[];
	onViewDetail: (id: string) => void;
	onEdit: (id: string) => void;
	onCancel: (id: string) => void;
	searchQuery?: string;
}

export const PromotionTable: React.FC<PromotionTableProps> = ({
	promotions,
	onViewDetail,
	onEdit,
	onCancel,
	searchQuery = "",
}) => {
	// Create a key based on promotions to trigger animation on filter changes
	const tableKey = promotions.map((p) => p.promotionId).join("-");

	// Highlight matching text
	const highlightText = (text: string, query: string) => {
		if (!query.trim()) return text;

		const lowerText = text.toLowerCase();
		const lowerQuery = query.toLowerCase();
		const index = lowerText.indexOf(lowerQuery);

		if (index === -1) return text;

		return (
			<>
				{text.substring(0, index)}
				<Text
					as="span"
					bg="yellow.200"
					px={1}
					borderRadius="sm"
					fontWeight="700">
					{text.substring(index, index + query.length)}
				</Text>
				{text.substring(index + query.length)}
			</>
		);
	};

	const getStatusBadge = (status: PromotionStatus) => {
		const statusConfig: Record<
			PromotionStatus,
			{ color: string; label: string }
		> = {
			Active: { color: "green", label: "Đang áp dụng" },
			Upcoming: { color: "orange", label: "Sắp diễn ra" },
			Expired: { color: "gray", label: "Đã hết hạn" },
			Cancelled: { color: "red", label: "Đã hủy" },
		};

		const config = statusConfig[status] || {
			color: "gray",
			label: status,
		};

		return (
			<Badge
				colorScheme={config.color}
				px={3}
				py={1}
				borderRadius="full"
				fontSize="12px"
				fontWeight="600">
				{config.label}
			</Badge>
		);
	};

	const getTypeBadge = (type: PromotionType) => {
		const typeConfig: Record<
			PromotionType,
			{ color: string; label: string }
		> = {
			Discount: { color: "blue", label: "Giảm giá" },
			"Buy X Get Y": { color: "purple", label: "Mua X tặng Y" },
		};

		const config = typeConfig[type] || {
			color: "gray",
			label: type,
		};

		return (
			<Tag
				colorScheme={config.color}
				size="md"
				width="200"
				fontWeight="600"
				fontSize="12px">
				{config.label}
			</Tag>
		);
	};

	// Check if promotion can be edited or cancelled (only Upcoming)
	const canEdit = (status: PromotionStatus) => {
		return status === "Upcoming";
	};

	const canCancel = (status: PromotionStatus) => {
		return status === "Upcoming";
	};

	// Get promotion value display
	const getPromotionValue = (promotion: Promotion) => {
		if (promotion.promotionType === "Discount") {
			return (
				<Text
					fontSize="14px"
					fontWeight="700"
					color="blue.600">
					-{promotion.discountPercent}%
				</Text>
			);
		}
		return (
			<Text
				fontSize="14px"
				fontWeight="700"
				color="purple.600">
				Mua {promotion.buyQuantity} tặng {promotion.getQuantity}
			</Text>
		);
	};

	return (
		<Box
			key={tableKey}
			bg="white"
			borderRadius="12px"
			boxShadow="sm"
			overflow="hidden"
			sx={{
				"@keyframes fadeIn": {
					from: { opacity: 0, transform: "translateY(8px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
				animation: "fadeIn 0.3s ease-out",
			}}>
			<Box overflowX="auto">
				<Table variant="simple">
					<Thead bg="gray.50">
						<Tr>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								maxW="50px">
								Tên chương trình
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Loại KM
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Giá trị
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Sản phẩm
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Thời gian
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Trạng thái
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								textAlign="center">
								Thao tác
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{promotions.map((promotion) => (
							<Tr
								key={promotion.promotionId}
								_hover={{ bg: "gray.50" }}
								transition="all 0.2s"
								bg={
									searchQuery &&
									(promotion.promotionId
										.toLowerCase()
										.includes(searchQuery.toLowerCase()) ||
										promotion.promotionName
											.toLowerCase()
											.includes(
												searchQuery.toLowerCase(),
											))
										? "yellow.50"
										: "transparent"
								}>
								<Td
									fontSize="14px"
									color="gray.800"
									fontWeight="600"
									maxW="100px">
									{highlightText(
										promotion.promotionName,
										searchQuery,
									)}
								</Td>
								<Td>{getTypeBadge(promotion.promotionType)}</Td>
								<Td>{getPromotionValue(promotion)}</Td>
								<Td>
									<VStack
										align="flex-start"
										spacing={1}>
										{promotion.products
											.slice(0, 2)
											.map((product) => (
												<Text
													key={product.productId}
													fontSize="13px"
													color="gray.600"
													noOfLines={1}>
													{highlightText(
														product.productName,
														searchQuery,
													)}
												</Text>
											))}
										{promotion.products.length > 2 && (
											<Text
												fontSize="12px"
												color="brand.500"
												fontWeight="600">
												+{promotion.products.length - 2}{" "}
												sản phẩm khác
											</Text>
										)}
									</VStack>
								</Td>
								<Td fontSize="13px">
									<VStack
										align="flex-start"
										spacing={0}>
										<Text color="gray.700">
											{promotion.startDate}
										</Text>
										<Text color="gray.500">đến</Text>
										<Text color="gray.700">
											{promotion.endDate}
										</Text>
									</VStack>
								</Td>
								<Td maxW="100px">
									{getStatusBadge(promotion.status)}
								</Td>
								<Td>
									<HStack
										justify="center"
										spacing={1}>
										<Tooltip
											label="Xem chi tiết"
											fontSize="xs">
											<IconButton
												aria-label="Xem chi tiết"
												icon={<ViewIcon />}
												size="sm"
												variant="ghost"
												colorScheme="blue"
												onClick={() =>
													onViewDetail(
														promotion.promotionId,
													)
												}
											/>
										</Tooltip>

										<Tooltip
											label={
												canEdit(promotion.status)
													? "Chỉnh sửa"
													: "Chỉ có thể chỉnh sửa khuyến mãi sắp diễn ra"
											}
											fontSize="xs">
											<IconButton
												aria-label="Chỉnh sửa"
												icon={<EditIcon />}
												size="sm"
												variant="ghost"
												colorScheme="orange"
												onClick={() =>
													onEdit(
														promotion.promotionId,
													)
												}
												isDisabled={
													!canEdit(promotion.status)
												}
											/>
										</Tooltip>

										<Tooltip
											label={
												canCancel(promotion.status)
													? "Hủy khuyến mãi"
													: "Chỉ có thể hủy khuyến mãi sắp diễn ra"
											}
											fontSize="xs">
											<IconButton
												aria-label="Hủy khuyến mãi"
												icon={<CloseIcon />}
												size="sm"
												variant="ghost"
												colorScheme="red"
												onClick={() =>
													onCancel(
														promotion.promotionId,
													)
												}
												isDisabled={
													!canCancel(promotion.status)
												}
											/>
										</Tooltip>
									</HStack>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>

			{promotions.length === 0 && (
				<Flex
					justify="center"
					align="center"
					py={12}>
					<Text
						fontSize="16px"
						color="gray.500"
						fontWeight="500">
						Không tìm thấy khuyến mãi nào
					</Text>
				</Flex>
			)}
		</Box>
	);
};
