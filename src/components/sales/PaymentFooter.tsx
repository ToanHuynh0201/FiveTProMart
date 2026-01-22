import React, { useState } from "react";
import {
	Box,
	VStack,
	HStack,
	Text,
	Button,
	Badge,
	Grid,
	Input,
	useToast,
	Switch,
	Tooltip,
} from "@chakra-ui/react";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import type { PaymentMethod, DiscountRequest } from "@/types/sales";
import { customerService } from "@/services/customerService";
import { useSidebar } from "@/contexts/SidebarContext";

interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

interface PaymentFooterProps {
	subtotal: number;
	total: number;
	loyaltyPoints?: number;
	paymentMethod: PaymentMethod | undefined;
	onPaymentMethodChange: (method: PaymentMethod) => void;
	onPrint: () => void;
	isDisabled?: boolean;
	customer: Customer | null;
	onCustomerChange: (customer: Customer | null) => void;
	/** Amount given by customer for change calculation */
	cashReceived: number;
	onCashReceivedChange: (amount: number) => void;
	/** Discount request for loyalty points (optional) */
	discount?: DiscountRequest | null;
	onDiscountChange?: (discount: DiscountRequest | null) => void;
}

export const PaymentFooter: React.FC<PaymentFooterProps> = ({
	subtotal,
	total,
	loyaltyPoints,
	paymentMethod,
	onPaymentMethodChange,
	onPrint,
	isDisabled = false,
	customer,
	onCustomerChange,
	cashReceived,
	onCashReceivedChange,
	discount,
	onDiscountChange,
}) => {
	// Get sidebar width for proper positioning
	const { sidebarWidth } = useSidebar();

	// Calculate final total after discount (passed from parent)
	const discountAmount = Math.max(0, subtotal - total);
	const finalTotal = total;

	const [phoneInput, setPhoneInput] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	// Local string for input, synced with parent number
	const [cashInput, setCashInput] = useState<string>(
		cashReceived > 0 ? cashReceived.toString() : "",
	);
	// Local state for "use all points" toggle
	const [useAllPoints, setUseAllPoints] = useState(false);

	const toast = useToast();

	const handlePhoneSearch = async () => {
		if (!phoneInput.trim()) {
			const guestCustomer: Customer = {
				id: `guest_${Date.now()}`,
				name: "KHÁCH VÃNG LAI",
				phone: "",
				points: 0,
			};
			onCustomerChange(guestCustomer);
			return;
		}

		// Validate phone
		const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
		if (!phoneRegex.test(phoneInput.trim())) {
			toast({
				title: "Số điện thoại không hợp lệ",
				description: "Vui lòng nhập số điện thoại đúng định dạng",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		setIsSearching(true);
		try {
			const foundCustomer = await customerService.findByPhone(
				phoneInput.trim(),
			);
			if (foundCustomer) {
				onCustomerChange({
					id: foundCustomer.customerId,
					name: foundCustomer.fullName,
					phone: foundCustomer.phoneNumber ?? "",
					points: foundCustomer.loyaltyPoints ?? 0,
				});
				setPhoneInput(foundCustomer.phoneNumber ?? "");
				toast({
					title: "Tìm thấy khách hàng",
					description: `${foundCustomer.fullName} - ${foundCustomer.loyaltyPoints ?? 0} điểm`,
					status: "success",
					duration: 2000,
				});
			} else {
				const guestCustomer: Customer = {
					id: `guest_${Date.now()}`,
					name: "KHÁCH VÃNG LAI",
					phone: phoneInput.trim(),
					points: 0,
				};
				onCustomerChange(guestCustomer);
				toast({
					title: "Không tìm thấy khách hàng",
					description: "Tiếp tục với khách vãng lai",
					status: "info",
					duration: 2000,
				});
			}
		} catch (error) {
			console.error(error);
			toast({
				title: "Lỗi tìm kiếm",
				description: "Không thể tìm kiếm khách hàng",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsSearching(false);
		}
	};

	React.useEffect(() => {
		if (customer?.phone) {
			setPhoneInput(customer.phone);
		}
		// Reset points toggle when customer changes
		setUseAllPoints(false);
		if (onDiscountChange) {
			onDiscountChange(null);
		}
	}, [customer, onDiscountChange]);

	// Sync cashInput with prop when prop changes externally
	React.useEffect(() => {
		if (cashReceived > 0 && cashInput === "") {
			setCashInput(cashReceived.toString());
		}
	}, [cashReceived, cashInput]);
	
	// Recalculate discount when subtotal changes (in case points > new subtotal)
	React.useEffect(() => {
		if (useAllPoints && onDiscountChange && customer?.points) {
			const pointsToUse = Math.min(customer.points, Math.floor(subtotal));
			onDiscountChange({
				type: "LOYALTY_POINTS",
				pointsToUse,
			});
		}
	}, [subtotal, useAllPoints, customer?.points, onDiscountChange]);

	// Handle cash input change
	const handleCashInputChange = (value: string) => {
		setCashInput(value);
		const numValue = parseFloat(value) || 0;
		onCashReceivedChange(numValue);
	};

	// Calculate change from prop (source of truth)
	const change = cashReceived - finalTotal;
	const hasEnoughCash = cashReceived >= finalTotal;

	return (
		<Box
			position="fixed"
			bottom={0}
			left={{ base: 0, md: `${sidebarWidth}px` }}
			right={0}
			bg="white"
			boxShadow="0 -2px 16px rgba(0, 0, 0, 0.08)"
			borderTop="1px solid"
			borderColor="gray.200"
			zIndex={10}
			backdropFilter="blur(8px)"
			transition="left 0.3s cubic-bezier(0.4, 0, 0.2, 1)">
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={{ base: 4, md: 5 }}>
				{/* Desktop Layout */}
				<Box display={{ base: "none", xl: "block" }}>
					<VStack
						spacing={3}
						align="stretch">
						<Grid
							templateColumns="200px 1fr 240px"
							gap={5}
							alignItems="center">
							{/* Customer Phone */}
							<VStack
								align="stretch"
								spacing={2}>
								<Text
									fontSize="xs"
									fontWeight="600"
									color="gray.600"
									textTransform="uppercase"
									letterSpacing="wide">
									SDT Khách hàng
								</Text>
								<Input
									placeholder="Nhập SDT..."
									value={phoneInput}
									onChange={(e) =>
										setPhoneInput(e.target.value)
									}
									onKeyPress={(e) =>
										e.key === "Enter" && handlePhoneSearch()
									}
									onBlur={handlePhoneSearch}
									size="md"
									fontSize="sm"
									isDisabled={isSearching}
									borderRadius="md"
									borderColor="gray.300"
									_hover={{ borderColor: "gray.400" }}
									_focus={{
										borderColor: "#161f70",
										boxShadow: "0 0 0 1px #161f70",
									}}
								/>
								{customer?.name && (
									<HStack spacing={2} flexWrap="wrap">
										<Text
											fontSize="xs"
											color="green.600"
											fontWeight="600"
											noOfLines={1}>
											{customer.name}
										</Text>
										{customer.points &&
											customer.points > 0 && (
												<>
													<Badge
														colorScheme={useAllPoints ? "purple" : "green"}
														fontSize="10px"
														borderRadius="full">
														{useAllPoints ? `−${Math.min(customer.points, Math.floor(subtotal))}đ` : `${customer.points}đ`}
													</Badge>
													<Tooltip 
														label={`Dùng ${Math.min(customer.points, Math.floor(subtotal))} điểm để giảm ${Math.min(customer.points, Math.floor(subtotal)).toLocaleString("vi-VN")}đ`}
														placement="top"
														hasArrow
													>
														<HStack spacing={1} cursor="pointer">
															<Switch
																size="sm"
																colorScheme="purple"
																isChecked={useAllPoints}
																onChange={(e) => {
																	const checked = e.target.checked;
																	setUseAllPoints(checked);
																	if (checked && onDiscountChange && customer.points) {
																		// Use points up to subtotal (can't discount more than subtotal)
																		const pointsToUse = Math.min(customer.points, Math.floor(subtotal));
																		onDiscountChange({
																			type: "LOYALTY_POINTS",
																			pointsToUse,
																		});
																	} else if (onDiscountChange) {
																		onDiscountChange(null);
																	}
																}}
															/>
															<Text fontSize="10px" color="purple.600" fontWeight="600">
																Dùng điểm
															</Text>
														</HStack>
													</Tooltip>
												</>
											)}
									</HStack>
								)}
							</VStack>

							{/* Payment Method */}
							<Box>
								<PaymentMethodSelector
									selected={paymentMethod}
									onSelect={onPaymentMethodChange}
									compact={false}
								/>
							</Box>

							{/* Print Button */}
							<Button
								h="60px"
								bgGradient="linear(135deg, #161f70 0%, #0f1654 100%)"
								color="white"
								fontSize="md"
								fontWeight="700"
								borderRadius="lg"
								boxShadow="0 4px 14px rgba(22, 31, 112, 0.25)"
								transition="all 0.2s ease"
								leftIcon={<Text fontSize="xl">🖨️</Text>}
								_hover={{
									transform: "translateY(-1px)",
									boxShadow:
										"0 6px 20px rgba(22, 31, 112, 0.35)",
								}}
								_active={{ transform: "translateY(0)" }}
								_disabled={{
									bgGradient: "none",
									bg: "gray.300",
									cursor: "not-allowed",
									opacity: 0.6,
								}}
								onClick={onPrint}
								isDisabled={
									isDisabled ||
									total === 0 ||
									(paymentMethod === "cash" && !hasEnoughCash)
								}>
								In hóa đơn (P)
							</Button>
						</Grid>

						{/* Cash Input Row - Only show when payment method is cash */}
						{paymentMethod === "cash" && (
							<Grid
								templateColumns="1fr 1fr 1fr"
								gap={5}
								alignItems="center"
								mt={-2}>
								<VStack
									align="stretch"
									spacing={1}>
									<Text
										fontSize="xs"
										fontWeight="600"
										color="gray.600"
										textTransform="uppercase"
										letterSpacing="wide">
										Tiền khách đưa
									</Text>
									<Input
										placeholder="0"
										type="number"
										value={cashInput}
										onChange={(e) =>
											handleCashInputChange(e.target.value)
										}
										size="md"
										fontSize="sm"
										borderRadius="md"
										borderColor={
											cashInput && !hasEnoughCash
												? "red.300"
												: "gray.300"
										}
										_hover={{ borderColor: "gray.400" }}
										_focus={{
											borderColor: "#161f70",
											boxShadow: "0 0 0 1px #161f70",
										}}
									/>
								</VStack>
								<VStack
									align="stretch"
									spacing={1}>
									<Text
										fontSize="xs"
										fontWeight="600"
										color="gray.600"
										textTransform="uppercase"
										letterSpacing="wide">
										Tiền thối
									</Text>
									<Box
										p={2.5}
										bg={
											cashReceived && change >= 0
												? "green.50"
												: "gray.50"
										}
										borderRadius="md"
										border="2px solid"
										borderColor={
											cashReceived && change >= 0
												? "green.200"
												: "gray.200"
										}>
										<Text
											fontSize="md"
											fontWeight="700"
											color={
												cashReceived && change >= 0
													? "green.700"
													: "gray.600"
											}
											textAlign="center">
											{cashReceived && change >= 0
												? change.toLocaleString(
														"vi-VN",
												  ) + "đ"
												: cashReceived && change < 0
												? "Chưa đủ tiền!"
												: "0đ"}
										</Text>
									</Box>
								</VStack>
								<VStack
									align="flex-end"
									spacing={1}>
									<Text
										fontSize="xs"
										fontWeight="600"
										color="gray.600"
										textTransform="uppercase"
										letterSpacing="wide">
										TỔNG TIỀN
									</Text>
									<HStack spacing={2}>
										{discountAmount > 0 && (
											<Text
												fontSize="md"
												fontWeight="500"
												color="gray.400"
												textDecoration="line-through"
												lineHeight="1">
												{subtotal.toLocaleString("vi-VN")}đ
											</Text>
										)}
										<Text
											fontSize="2xl"
											fontWeight="800"
											color={discountAmount > 0 ? "red.500" : "#161f70"}
											lineHeight="1"
											letterSpacing="tight">
											{finalTotal.toLocaleString("vi-VN")}
										</Text>
										<Text
											fontSize="lg"
											fontWeight="700"
											color={discountAmount > 0 ? "red.500" : "#161f70"}>
											đ
										</Text>
									</HStack>
									{discountAmount > 0 && (
										<Badge
											colorScheme="red"
											fontSize="xs"
											px={3}
											py={1}
											borderRadius="full"
											fontWeight="600">
											-{discountAmount.toLocaleString("vi-VN")}đ điểm thưởng
										</Badge>
									)}
									{loyaltyPoints && loyaltyPoints > 0 && (
										<Badge
											colorScheme="green"
											fontSize="xs"
											px={3}
											py={1}
											borderRadius="full"
											fontWeight="600">
											+{loyaltyPoints}đ tích lũy
										</Badge>
									)}
								</VStack>
							</Grid>
						)}
					</VStack>
				</Box>

				{/* Tablet/Medium Desktop Layout */}
				<Box display={{ base: "none", md: "block", xl: "none" }}>
					<VStack
						spacing={3}
						align="stretch">
						{/* Row 1: Phone and Total */}
						<Grid
							templateColumns={{
								md: "1fr 180px",
								lg: "1fr 220px",
							}}
							gap={3}
							alignItems="start">
							{/* Left: Customer Phone */}
							<VStack
								align="stretch"
								spacing={2}>
								<Text
									fontSize="xs"
									fontWeight="600"
									color="gray.600"
									textTransform="uppercase">
									SDT Khách hàng
								</Text>
								<Input
									placeholder="Nhập SDT..."
									value={phoneInput}
									onChange={(e) =>
										setPhoneInput(e.target.value)
									}
									onKeyPress={(e) =>
										e.key === "Enter" && handlePhoneSearch()
									}
									onBlur={handlePhoneSearch}
									size="md"
									fontSize="sm"
									borderRadius="md"
									_focus={{
										borderColor: "#161f70",
										boxShadow: "0 0 0 1px #161f70",
									}}
								/>
								{customer?.name && (
									<Text
										fontSize="xs"
										color="green.600"
										fontWeight="600">
										{customer.name}
									</Text>
								)}
							</VStack>

							{/* Right: Total */}
							<VStack
								align="flex-end"
								spacing={1}
								minW="200px">
								<Text
									fontSize="xs"
									fontWeight="600"
									color="gray.600"
									textTransform="uppercase">
									TỔNG TIỀN
								</Text>
								<HStack spacing={2}>
									{discountAmount > 0 && (
										<Text
											fontSize="md"
											fontWeight="500"
											color="gray.400"
											textDecoration="line-through"
											lineHeight="1">
											{subtotal.toLocaleString("vi-VN")}đ
										</Text>
									)}
									<Text
										fontSize="3xl"
										fontWeight="800"
										color="#161f70"
										lineHeight="1">
										{finalTotal.toLocaleString("vi-VN")}
									</Text>
									<Text
										fontSize="lg"
										fontWeight="700"
										color="#161f70">
										đ
									</Text>
								</HStack>
							</VStack>
						</Grid>

						{/* Row 2: Payment Method and Print Button */}
						<VStack
							spacing={3}
							align="stretch">
							{/* Payment Method - Full Width */}
							<Box>
								<PaymentMethodSelector
									selected={paymentMethod}
									onSelect={onPaymentMethodChange}
									compact={true}
								/>
							</Box>

							{/* Cash Input - Only show when payment method is cash */}
							{paymentMethod === "cash" && (
								<Grid
									templateColumns="1fr 1fr"
									gap={3}>
									<VStack
										align="stretch"
										spacing={1}>
										<Text
											fontSize="xs"
											fontWeight="600"
											color="gray.600"
											textTransform="uppercase">
											Tiền khách đưa
										</Text>
										<Input
											placeholder="0"
											type="number"
											value={cashInput}
											onChange={(e) =>
												handleCashInputChange(e.target.value)
											}
											size="md"
											fontSize="sm"
											borderRadius="md"
											borderColor={
												cashInput && !hasEnoughCash
													? "red.300"
													: "gray.300"
											}
											_focus={{
												borderColor: "#161f70",
												boxShadow: "0 0 0 1px #161f70",
											}}
										/>
									</VStack>
									<VStack
										align="stretch"
										spacing={1}>
										<Text
											fontSize="xs"
											fontWeight="600"
											color="gray.600"
											textTransform="uppercase">
											Tiền thối
										</Text>
										<Box
											p={2}
											bg={
												cashReceived && change >= 0
													? "green.50"
													: "gray.50"
											}
											borderRadius="md"
											border="1px solid"
											borderColor={
												cashReceived && change >= 0
													? "green.200"
													: "gray.200"
											}>
											<Text
												fontSize="md"
												fontWeight="700"
												color={
													cashReceived && change >= 0
														? "green.700"
														: "gray.600"
												}>
												{cashReceived && change >= 0
													? change.toLocaleString(
															"vi-VN",
													  ) + "đ"
													: cashReceived && change < 0
													? "Chưa đủ tiền!"
													: "0đ"}
											</Text>
										</Box>
									</VStack>
								</Grid>
							)}

							{/* Print Button - Full Width */}
							<Button
								h="52px"
								w="100%"
								bgGradient="linear(135deg, #161f70 0%, #0f1654 100%)"
								color="white"
								fontSize="md"
								fontWeight="700"
								borderRadius="lg"
								boxShadow="0 4px 12px rgba(22, 31, 112, 0.25)"
								leftIcon={<Text fontSize="lg">🖨️</Text>}
								onClick={onPrint}
								isDisabled={
									isDisabled ||
									total === 0 ||
									(paymentMethod === "cash" && !hasEnoughCash)
								}
								_hover={{
									transform: "translateY(-1px)",
									boxShadow:
										"0 6px 16px rgba(22, 31, 112, 0.35)",
								}}>
								In hóa đơn (P)
							</Button>
						</VStack>
					</VStack>
				</Box>

				{/* Mobile Layout */}
				<Box display={{ base: "block", md: "none" }}>
					<VStack
						spacing={3}
						align="stretch">
						{/* Customer Phone */}
						<VStack
							align="stretch"
							spacing={1}>
							<Text
								fontSize="xs"
								fontWeight="600"
								color="gray.600"
								textTransform="uppercase">
								SDT Khách hàng
							</Text>
							<Input
								placeholder="Nhập SDT (tùy chọn)"
								value={phoneInput}
								onChange={(e) => setPhoneInput(e.target.value)}
								onKeyPress={(e) =>
									e.key === "Enter" && handlePhoneSearch()
								}
								onBlur={handlePhoneSearch}
								size="md"
								fontSize="sm"
								borderRadius="md"
								_focus={{
									borderColor: "#161f70",
									boxShadow: "0 0 0 1px #161f70",
								}}
							/>
							{customer?.name && (
								<Text
									fontSize="xs"
									color="green.600"
									fontWeight="600">
									{customer.name}
								</Text>
							)}
						</VStack>

						{/* Payment Method */}
						<Box>
							<PaymentMethodSelector
								selected={paymentMethod}
								onSelect={onPaymentMethodChange}
								compact={false}
							/>
						</Box>

						{/* Cash Input - Only show when payment method is cash */}
						{paymentMethod === "cash" && (
							<VStack
								spacing={2}
								align="stretch">
								<VStack
									align="stretch"
									spacing={1}>
									<Text
										fontSize="xs"
										fontWeight="600"
										color="gray.600"
										textTransform="uppercase">
										Tiền khách đưa
									</Text>
									<Input
										placeholder="0"
										type="number"
										value={cashInput}
										onChange={(e) =>
											handleCashInputChange(e.target.value)
										}
										size="md"
										fontSize="sm"
										borderRadius="md"
										borderColor={
											cashInput && !hasEnoughCash
												? "red.300"
												: "gray.300"
										}
										_focus={{
											borderColor: "#161f70",
											boxShadow: "0 0 0 1px #161f70",
										}}
									/>
								</VStack>
								<VStack
									align="stretch"
									spacing={1}>
									<Text
										fontSize="xs"
										fontWeight="600"
										color="gray.600"
										textTransform="uppercase">
										Tiền thối
									</Text>
									<Box
										p={2.5}
										bg={
											cashReceived && change >= 0
												? "green.50"
												: "gray.50"
										}
										borderRadius="md"
										border="2px solid"
										borderColor={
											cashReceived && change >= 0
												? "green.200"
												: "gray.200"
										}>
										<Text
											fontSize="lg"
											fontWeight="700"
											color={
												cashReceived && change >= 0
													? "green.700"
													: "gray.600"
											}
											textAlign="center">
											{cashReceived && change >= 0
												? change.toLocaleString(
														"vi-VN",
												  ) + "đ"
												: cashReceived && change < 0
												? "Chưa đủ tiền!"
												: "0đ"}
										</Text>
									</Box>
								</VStack>
							</VStack>
						)}

						{/* Total & Print */}
						<Grid
							templateColumns="1fr auto"
							gap={3}
							alignItems="center"
							mt={1}>
							<VStack
								align="flex-start"
								spacing={1}>
								<Text
									fontSize="xs"
									fontWeight="600"
									color="gray.600"
									textTransform="uppercase">
									TỔNG TIỀN
								</Text>
								<HStack spacing={2}>
									{discountAmount > 0 && (
										<Text
											fontSize="sm"
											fontWeight="500"
											color="gray.400"
											textDecoration="line-through"
											lineHeight="1">
											{subtotal.toLocaleString("vi-VN")}đ
										</Text>
									)}
									<Text
										fontSize="2xl"
										fontWeight="800"
										color="#161f70"
										lineHeight="1">
										{finalTotal.toLocaleString("vi-VN")}
									</Text>
									<Text
										fontSize="md"
										fontWeight="700"
										color="#161f70">
										đ
									</Text>
								</HStack>
							</VStack>
							<Button
								h="56px"
								minW="130px"
								bgGradient="linear(135deg, #161f70 0%, #0f1654 100%)"
								color="white"
								fontSize="sm"
								fontWeight="700"
								borderRadius="lg"
								boxShadow="0 4px 12px rgba(22, 31, 112, 0.25)"
								onClick={onPrint}
								isDisabled={
									isDisabled ||
									total === 0 ||
									(paymentMethod === "cash" && !hasEnoughCash)
								}
								_active={{ transform: "scale(0.98)" }}>
								<VStack spacing={0.5}>
									<Text fontSize="xl">🖨️</Text>
									<Text fontSize="xs">In hóa đơn (P)</Text>
								</VStack>
							</Button>
						</Grid>
					</VStack>
				</Box>
			</Box>
		</Box>
	);
};
