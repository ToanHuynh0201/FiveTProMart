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
	useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { Purchase } from "../../types/purchase";
import { formatDate } from "../../utils/date";
import { purchaseService } from "@/services/purchaseService";

interface PurchaseTableProps {
	purchases: Purchase[];
	onViewDetail: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onRefresh?: () => void;
}

export const PurchaseTable: React.FC<PurchaseTableProps> = ({
	purchases,
	onViewDetail,
	onEdit,
	onDelete,
	onRefresh,
}) => {
	const toast = useToast();
	// Create a key based on purchases to trigger animation on filter changes
	const tableKey = purchases.map((p) => p.id).join("-");

	const handleCancelPurchase = async (id: string) => {
		try {
			await purchaseService.cancelPurchase(id);
			toast({
				title: "Đã hủy đơn hàng",
				status: "success",
				duration: 2000,
			});
			onRefresh?.();
		} catch {
			toast({
				title: "Không thể hủy đơn hàng",
				status: "error",
				duration: 3000,
			});
		}
	};

	const getStatusBadge = (status: Purchase["status"]) => {
		const statusConfig = {
			draft: { color: "gray", label: "Nháp" },
			ordered: { color: "blue", label: "Đã đặt" },
			received: { color: "green", label: "Đã nhận" },
			cancelled: { color: "red", label: "Đã hủy" },
		};

		const config = statusConfig[status];

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

	const getPaymentStatusBadge = (
		paymentStatus: Purchase["paymentStatus"],
	) => {
		const statusConfig = {
			unpaid: { color: "red", label: "Chưa trả" },
			paid: { color: "green", label: "Đã trả" },
		};

		const config = statusConfig[paymentStatus];

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

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
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
								Mã phiếu nhập
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none">
								Nhà cung cấp
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								isNumeric>
								Số mặt hàng
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								isNumeric>
								Tổng tiền
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
								textTransform="none">
								Thanh toán
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none">
								Ngày tạo
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								textAlign="center">
								Thao tác
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{purchases.length === 0 ? (
							<Tr>
								<Td
									colSpan={8}
									textAlign="center"
									py={10}>
									<Text
										fontSize="15px"
										color="gray.500">
										Không có phiếu nhập hàng nào
									</Text>
								</Td>
							</Tr>
						) : (
							purchases.map((purchase) => (
								<Tr
									key={purchase.id}
									_hover={{ bg: "gray.50" }}
									transition="background 0.2s">
									<Td
										fontSize="14px"
										fontWeight="600"
										color="brand.500"
										cursor="pointer"
										onClick={() =>
											onViewDetail(purchase.id)
										}
										_hover={{
											textDecoration: "underline",
										}}>
										{purchase.purchaseNumber}
									</Td>
									<Td>
										<Text
											fontSize="14px"
											fontWeight="500"
											color="gray.800">
											{purchase.supplier.name}
										</Text>
										{purchase.supplier.phone && (
											<Text
												fontSize="12px"
												color="gray.500">
												{purchase.supplier.phone}
											</Text>
										)}
									</Td>
									<Td
										isNumeric
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										{purchase.items.length}
									</Td>
									<Td
										isNumeric
										fontSize="14px"
										fontWeight="700"
										color="gray.800">
										{formatCurrency(purchase.total)}
									</Td>
									<Td>{getStatusBadge(purchase.status)}</Td>
									<Td>
										{getPaymentStatusBadge(
											purchase.paymentStatus,
										)}
									</Td>
									<Td
										fontSize="14px"
										color="gray.600">
										{formatDate(purchase.createdAt)}
									</Td>
									<Td>
										<Flex
											justify="center"
											gap={1}>
											<Tooltip label="Xem chi tiết">
												<IconButton
													aria-label="View detail"
													icon={<ViewIcon />}
													size="sm"
													variant="ghost"
													colorScheme="blue"
													onClick={() =>
														onViewDetail(
															purchase.id,
														)
													}
												/>
											</Tooltip>

											{purchase.status !== "cancelled" &&
												purchase.status !==
													"received" && (
													<Tooltip label="Chỉnh sửa">
														<IconButton
															aria-label="Edit"
															icon={<EditIcon />}
															size="sm"
															variant="ghost"
															colorScheme="green"
															onClick={() =>
																onEdit(
																	purchase.id,
																)
															}
														/>
													</Tooltip>
												)}

											<Menu>
												<MenuButton
													as={IconButton}
													aria-label="More actions"
													icon={
														<BsThreeDotsVertical />
													}
													size="sm"
													variant="ghost"
													colorScheme="gray"
												/>
												<MenuList>
													{purchase.status ===
														"draft" && (
														<MenuItem
															icon={
																<DeleteIcon />
															}
															color="red.500"
															onClick={() =>
																onDelete(
																	purchase.id,
																)
															}>
															Xóa phiếu nhập
														</MenuItem>
													)}
													{purchase.status ===
														"ordered" && (
														<MenuItem
															onClick={() =>
																handleCancelPurchase(
																	purchase.id,
																)
															}>
															Hủy đơn hàng
														</MenuItem>
													)}
												</MenuList>
											</Menu>
										</Flex>
									</Td>
								</Tr>
							))
						)}
					</Tbody>
				</Table>
			</Box>
		</Box>
	);
};
