import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Box,
	Text,
	NumberInput,
	NumberInputField,
	Button,
	Badge,
	Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import type { OrderItem } from "../../types/sales";
import { getExpiryStatus, isExpired } from "../../utils/date";

interface OrderItemsTableProps {
	items: OrderItem[];
	onUpdateQuantity: (itemId: string, quantity: number) => void;
	onRemoveItem: (itemId: string) => void;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
	items,
	onUpdateQuantity,
	onRemoveItem,
}) => {
	return (
		<Box
			overflowX="auto"
			mt={0}
			bg="white"
			borderRadius="12px"
			border="1px solid"
			borderColor="gray.200"
			boxShadow="sm">
			<Table
				variant="simple"
				size="sm">
				<Thead bg="#161f70">
					<Tr>
						<Th
							w={{ base: "40px", md: "50px" }}
							fontSize="11px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={3}>
							STT
						</Th>
						<Th
							minW={{ base: "180px", md: "220px" }}
							fontSize="11px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={3}>
							SẢN PHẨM
						</Th>
						<Th
							w={{ base: "100px", md: "120px" }}
							fontSize="11px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={3}
							display={{ base: "none", md: "table-cell" }}>
							MÃ HÀNG
						</Th>
						<Th
							w={{ base: "100px", md: "120px" }}
							fontSize="11px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={3}
							textAlign="center">
							SL
						</Th>
						<Th
							w={{ base: "100px", md: "130px" }}
							fontSize="11px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={3}
							textAlign="right"
							display={{ base: "none", sm: "table-cell" }}
							isNumeric>
							ĐƠN GIÁ
						</Th>
						<Th
							w={{ base: "110px", md: "140px" }}
							fontSize="11px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={3}
							textAlign="right"
							isNumeric>
							THÀNH TIỀN
						</Th>
						<Th
							w={{ base: "70px", md: "100px" }}
							py={3}></Th>
					</Tr>
				</Thead>
				<Tbody>
					{items.length === 0 ? (
						<Tr>
							<Td
								colSpan={7}
								py={12}
								textAlign="center"
								color="gray.500"
								fontSize="14px"
								fontWeight="500">
								Chưa có sản phẩm nào trong đơn hàng
							</Td>
						</Tr>
					) : (
						items.map((item, index) => {
							const expiryStatus = getExpiryStatus(
								item.product.expiryDate,
							);
							const isProductExpired = isExpired(
								item.product.expiryDate,
							);

							return (
								<Tr
									key={item.id}
									borderBottom="1px solid"
									borderColor="gray.100"
									transition="all 0.2s"
									_hover={{ bg: "gray.50" }}
									_last={{
										borderBottom: "none",
									}}
									bg={
										isProductExpired
											? "red.50" // Đổi từ "red.500" sang "red.50" cho dễ nhìn
											: "transparent"
									}>
									<Td
										py={3}
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										{index + 1}
									</Td>
									<Td py={3}>
										<Box>
											<Text
												fontSize="14px"
												fontWeight="600"
												color="gray.800"
												mb={
													item.product.promotion ||
													item.product.expiryDate ||
													item.batchNumber
														? 1
														: 0
												}>
												{item.product.name}
											</Text>
											{item.batchNumber && (
												<Text
													fontSize="11px"
													color="blue.600"
													fontWeight="500"
													display="flex"
													alignItems="center"
													gap={1}
													mb={
														item.product
															.promotion ||
														item.product.expiryDate
															? 1
															: 0
													}>
													📦 Lô: {item.batchNumber}
												</Text>
											)}
											{item.product.promotion && (
												<Text
													fontSize="12px"
													color="red.500"
													fontWeight="500"
													display="flex"
													alignItems="center"
													gap={1}
													mb={
														item.product.expiryDate
															? 1
															: 0
													}>
													✨ {item.product.promotion}
												</Text>
											)}
											{item.product.expiryDate && (
												<Tooltip
													label={
														isProductExpired
															? "Sản phẩm đã hết hạn sử dụng, không nên bán!"
															: expiryStatus.status ===
															  "critical"
															? "Sản phẩm sắp hết hạn, cần xử lý nhanh!"
															: expiryStatus.status ===
															  "warning"
															? "Sản phẩm sắp hết hạn trong tuần này"
															: `Hạn sử dụng: ${expiryStatus.text}`
													}
													placement="top"
													hasArrow>
													<Badge
														colorScheme={
															isProductExpired
																? "red"
																: expiryStatus.status ===
																  "critical"
																? "red"
																: expiryStatus.status ===
																  "warning"
																? "orange"
																: "green"
														}
														fontSize="12px"
														px={2}
														py={0.5}
														borderRadius="md"
														display="inline-flex"
														alignItems="center"
														gap={1}>
														{isProductExpired
															? "⚠️ Đã hết hạn"
															: `📅 HSD: ${expiryStatus.text}`}
													</Badge>
												</Tooltip>
											)}
										</Box>
									</Td>
									<Td
										py={5}
										fontSize="15px"
										color="gray.600"
										fontFamily="mono">
										{item.product.code}
									</Td>
									<Td
										py={5}
										textAlign="center">
										<NumberInput
											defaultValue={item.quantity}
											min={1}
											max={item.product.stock}
											w="90px"
											size="md"
											mx="auto"
											allowMouseWheel={false}
											onChange={(
												valueString,
												valueAsNumber,
											) => {
												// Nếu rỗng, set về 1
												if (
													valueString === "" ||
													valueString === null
												) {
													onUpdateQuantity(
														item.id,
														1,
													);
													return;
												}
												if (
													!isNaN(valueAsNumber) &&
													valueAsNumber >= 1
												) {
													onUpdateQuantity(
														item.id,
														Math.min(
															valueAsNumber,
															item.product.stock,
														),
													);
												}
											}}
											onBlur={(e) => {
												// Khi blur, nếu rỗng hoặc < 1 thì set về 1
												const val = parseInt(
													e.target.value,
												);
												if (
													isNaN(val) ||
													val < 1 ||
													e.target.value === ""
												) {
													onUpdateQuantity(
														item.id,
														1,
													);
													e.target.value = "1";
												}
											}}>
											<NumberInputField
												px={3}
												py={2}
												h="42px"
												textAlign="center"
												fontSize="16px"
												fontWeight="600"
												borderWidth="2px"
												borderColor="gray.300"
												borderRadius="8px"
												_hover={{
													borderColor: "gray.400",
												}}
												_focus={{
													borderColor: "#161f70",
													boxShadow:
														"0 0 0 3px rgba(22, 31, 112, 0.15)",
												}}
											/>
										</NumberInput>
									</Td>
									<Td
										py={5}
										fontSize="16px"
										fontWeight="500"
										color="gray.700"
										textAlign="right"
										isNumeric>
										{item.unitPrice.toLocaleString("vi-VN")}
										đ
									</Td>
									<Td
										py={5}
										fontSize="17px"
										fontWeight="700"
										color="#161f70"
										textAlign="right"
										isNumeric>
										{item.totalPrice.toLocaleString(
											"vi-VN",
										)}
										đ
									</Td>
									<Td
										py={5}
										textAlign="center">
										<Button
											size="md"
											variant="ghost"
											colorScheme="red"
											leftIcon={<DeleteIcon />}
											fontSize="14px"
											fontWeight="600"
											px={4}
											h="40px"
											onClick={() =>
												onRemoveItem(item.id)
											}
											_hover={{
												bg: "red.50",
												color: "red.600",
											}}
											_active={{
												bg: "red.100",
											}}>
											Xóa
										</Button>
									</Td>
								</Tr>
							);
						})
					)}
				</Tbody>
			</Table>
		</Box>
	);
};
