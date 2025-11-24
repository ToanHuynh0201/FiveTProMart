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
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import type { OrderItem } from "../../types/sales";

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
				size="md">
				<Thead bg="#161f70">
					<Tr>
						<Th
							w="60px"
							fontSize="13px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={5}>
							STT
						</Th>
						<Th
							minW="280px"
							fontSize="13px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={5}>
							SẢN PHẨM
						</Th>
						<Th
							w="140px"
							fontSize="13px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={5}>
							MÃ HÀNG
						</Th>
						<Th
							w="140px"
							fontSize="13px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={5}
							textAlign="center">
							SỐ LƯỢNG
						</Th>
						<Th
							w="160px"
							fontSize="13px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={5}
							textAlign="right"
							isNumeric>
							ĐƠN GIÁ
						</Th>
						<Th
							w="180px"
							fontSize="13px"
							fontWeight="700"
							color="white"
							textTransform="uppercase"
							letterSpacing="wider"
							py={5}
							textAlign="right"
							isNumeric>
							THÀNH TIỀN
						</Th>
						<Th
							w="120px"
							py={5}></Th>
					</Tr>
				</Thead>
				<Tbody>
					{items.length === 0 ? (
						<Tr>
							<Td
								colSpan={7}
								py={20}
								textAlign="center"
								color="gray.500"
								fontSize="16px"
								fontWeight="500">
								Chưa có sản phẩm nào trong đơn hàng
							</Td>
						</Tr>
					) : (
						items.map((item, index) => (
							<Tr
								key={item.id}
								borderBottom="1px solid"
								borderColor="gray.100"
								transition="all 0.2s"
								_hover={{ bg: "gray.50" }}
								_last={{
									borderBottom: "none",
								}}>
								<Td
									py={5}
									fontSize="16px"
									fontWeight="600"
									color="gray.700">
									{index + 1}
								</Td>
								<Td py={5}>
									<Text
										fontSize="16px"
										fontWeight="600"
										color="gray.800"
										mb={item.product.promotion ? 1 : 0}>
										{item.product.name}
									</Text>
									{item.product.promotion && (
										<Text
											fontSize="14px"
											color="red.500"
											fontWeight="500"
											display="flex"
											alignItems="center"
											gap={1}>
											✨ {item.product.promotion}
										</Text>
									)}
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
										value={item.quantity}
										min={1}
										max={item.product.stock}
										w="90px"
										size="md"
										mx="auto"
										onChange={(_, valueAsNumber) => {
											if (!isNaN(valueAsNumber)) {
												onUpdateQuantity(
													item.id,
													Math.min(
														valueAsNumber,
														item.product.stock,
													),
												);
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
									{item.unitPrice.toLocaleString("vi-VN")}đ
								</Td>
								<Td
									py={5}
									fontSize="17px"
									fontWeight="700"
									color="#161f70"
									textAlign="right"
									isNumeric>
									{item.totalPrice.toLocaleString("vi-VN")}đ
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
										onClick={() => onRemoveItem(item.id)}
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
						))
					)}
				</Tbody>
			</Table>
		</Box>
	);
};
