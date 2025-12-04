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
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Tag,
	VStack,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { Promotion } from "../../types/promotion";
import { formatDate } from "../../utils/date";

interface PromotionTableProps {
	promotions: Promotion[];
	onViewDetail: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	searchQuery?: string;
}

export const PromotionTable: React.FC<PromotionTableProps> = ({
	promotions,
	onViewDetail,
	onEdit,
	onDelete,
	searchQuery = "",
}) => {
	// Create a key based on promotions to trigger animation on filter changes
	const tableKey = promotions.map((p) => p.id).join("-");

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
				fontSize="12px"
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
				size="md"
				fontWeight="600"
				fontSize="12px">
				{config.label}
			</Tag>
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
								py={4}>
								Mã KM
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
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
								key={promotion.id}
								_hover={{ bg: "gray.50" }}
								transition="all 0.2s"
								bg={
									searchQuery &&
									(promotion.code
										.toLowerCase()
										.includes(searchQuery.toLowerCase()) ||
										promotion.name
											.toLowerCase()
											.includes(
												searchQuery.toLowerCase(),
											))
										? "yellow.50"
										: "transparent"
								}>
								<Td
									fontSize="14px"
									color="gray.700"
									fontWeight="600">
									{highlightText(promotion.code, searchQuery)}
								</Td>
								<Td
									fontSize="14px"
									color="gray.800"
									fontWeight="600"
									maxW="200px">
									{highlightText(promotion.name, searchQuery)}
								</Td>
								<Td>{getTypeBadge(promotion.type)}</Td>
								<Td fontSize="13px">
									<VStack
										align="flex-start"
										spacing={0}>
										<Text color="gray.700">
											{formatDate(promotion.startDate)}
										</Text>
										<Text color="gray.500">đến</Text>
										<Text color="gray.700">
											{formatDate(promotion.endDate)}
										</Text>
									</VStack>
								</Td>
								<Td>{getStatusBadge(promotion.status)}</Td>
								<Td>
									<Flex
										justify="center"
										gap={1}>
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
													onViewDetail(promotion.id)
												}
											/>
										</Tooltip>

										<Menu>
											<MenuButton
												as={IconButton}
												aria-label="Thao tác khác"
												icon={<BsThreeDotsVertical />}
												size="sm"
												variant="ghost"
											/>
											<MenuList>
												<MenuItem
													icon={<EditIcon />}
													onClick={() =>
														onEdit(promotion.id)
													}
													isDisabled={
														promotion.status !== "inactive"
													}>
													Chỉnh sửa
												</MenuItem>
												<MenuItem
													icon={<DeleteIcon />}
													color="red.500"
													onClick={() =>
														onDelete(promotion.id)
													}>
													Xóa
												</MenuItem>
											</MenuList>
										</Menu>
									</Flex>
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
