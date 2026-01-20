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
	Button,
} from "@chakra-ui/react";
import { ViewIcon, CloseIcon, CheckIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical, BsPrinter } from "react-icons/bs";
import type { PurchaseListItem, PurchaseStatus } from "@/types/purchase";

interface PurchaseTableProps {
	purchases: PurchaseListItem[];
	onViewDetail: (id: string) => void;
	onConfirmReceipt: (id: string) => void;
	onCancelOrder: (id: string) => void;
	onReprintLabels: (id: string) => void;
}

export const PurchaseTable: React.FC<PurchaseTableProps> = ({
	purchases,
	onViewDetail,
	onConfirmReceipt,
	onCancelOrder,
	onReprintLabels,
}) => {
	const tableKey = purchases.map((p) => p.id).join("-");

	const getStatusBadge = (status: PurchaseStatus) => {
		const statusConfig = {
			Draft: { color: "gray", label: "Nháp" },
			Completed: { color: "green", label: "Hoàn thành" },
			Cancelled: { color: "red", label: "Đã hủy" },
		};

		const config = statusConfig[status];
		if (!config) return null;

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
								Mã đơn
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
								Ngày tạo
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none">
								Ngày kiểm
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
										Không có đơn nhập hàng nào
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
										{purchase.poCode}
									</Td>
									<Td>
										<Text
											fontSize="14px"
											fontWeight="500"
											color="gray.800">
											{purchase.supplierName}
										</Text>
									</Td>
									<Td
										isNumeric
										fontSize="14px"
										fontWeight="700"
										color="gray.800">
										{formatCurrency(purchase.totalAmount)}
									</Td>
									<Td>{getStatusBadge(purchase.status)}</Td>
									<Td
										fontSize="14px"
										color="gray.600">
										{purchase.purchaseDate}
									</Td>
									<Td
										fontSize="14px"
										color="gray.600">
										{purchase.checkDate}
									</Td>
									<Td>
										<Flex
											justify="center"
											gap={1}
											align="center">
											{/* Draft status actions */}
											{purchase.status === "Draft" && (
												<>
													<Tooltip label="Xác nhận nhận hàng">
														<Button
															size="sm"
															colorScheme="green"
															leftIcon={
																<CheckIcon />
															}
															onClick={() =>
																onConfirmReceipt(
																	purchase.id,
																)
															}>
															Nhận hàng
														</Button>
													</Tooltip>
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
															<MenuItem
																icon={
																	<ViewIcon />
																}
																onClick={() =>
																	onViewDetail(
																		purchase.id,
																	)
																}>
																Xem chi tiết
															</MenuItem>
															<MenuItem
																icon={
																	<CloseIcon />
																}
																color="red.500"
																onClick={() =>
																	onCancelOrder(
																		purchase.id,
																	)
																}>
																Hủy đơn hàng
															</MenuItem>
														</MenuList>
													</Menu>
												</>
											)}

											{/* Completed status actions */}
											{purchase.status ===
												"Completed" && (
												<>
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
													<Tooltip label="In lại tem">
														<IconButton
															aria-label="Reprint labels"
															icon={<BsPrinter />}
															size="sm"
															variant="ghost"
															colorScheme="green"
															onClick={() =>
																onReprintLabels(
																	purchase.id,
																)
															}
														/>
													</Tooltip>
												</>
											)}

											{/* Cancelled status actions */}
											{purchase.status ===
												"Cancelled" && (
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
											)}
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
