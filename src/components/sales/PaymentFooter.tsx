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
} from "@chakra-ui/react";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import type { PaymentMethod } from "@/types/sales";
import { salesService } from "@/services/salesService";

interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

interface PaymentFooterProps {
	total: number;
	loyaltyPoints?: number;
	paymentMethod: PaymentMethod | undefined;
	onPaymentMethodChange: (method: PaymentMethod) => void;
	onPrint: () => void;
	isDisabled?: boolean;
	customer: Customer | null;
	onCustomerChange: (customer: Customer | null) => void;
}

export const PaymentFooter: React.FC<PaymentFooterProps> = ({
	total,
	loyaltyPoints,
	paymentMethod,
	onPaymentMethodChange,
	onPrint,
	isDisabled = false,
	customer,
	onCustomerChange,
}) => {
	const [phoneInput, setPhoneInput] = useState("");
	const [isSearching, setIsSearching] = useState(false);

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
			return;
		}

		setIsSearching(true);
		try {
			const foundCustomer = await salesService.findCustomerByPhone(
				phoneInput,
			);
			if (foundCustomer) {
				onCustomerChange(foundCustomer);
				setPhoneInput(foundCustomer.phone);
			} else {
				const guestCustomer: Customer = {
					id: `guest_${Date.now()}`,
					name: "KHÁCH VÃNG LAI",
					phone: "",
					points: 0,
				};
				onCustomerChange(guestCustomer);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsSearching(false);
		}
	};

	React.useEffect(() => {
		if (customer?.phone) {
			setPhoneInput(customer.phone);
		}
	}, [customer]);

	return (
		<Box
			position="fixed"
			bottom={0}
			left={{ base: 0, md: "254px" }}
			right={0}
			bg="white"
			boxShadow="0 -2px 16px rgba(0, 0, 0, 0.08)"
			borderTop="1px solid"
			borderColor="gray.200"
			zIndex={10}
			backdropFilter="blur(8px)">
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={{ base: 4, md: 5 }}>
				{/* Desktop Layout */}
				<Box display={{ base: "none", xl: "block" }}>
					<Grid
						templateColumns="200px 1fr 200px 240px"
						gap={5}
						alignItems="center">
						{/* Customer Phone */}
						<VStack
							align="stretch"
							spacing={2}>
							<Text
								fontSize="xs"
								fontWeight="600"
								color="gray.500"
								textTransform="uppercase"
								letterSpacing="wide">
								SDT Khách hàng
							</Text>
							<Input
								placeholder="Nhập SDT..."
								value={phoneInput}
								onChange={(e) => setPhoneInput(e.target.value)}
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
								<HStack spacing={2}>
									<Text
										fontSize="xs"
										color="green.600"
										fontWeight="600"
										noOfLines={1}>
										{customer.name}
									</Text>
									{customer.points && customer.points > 0 && (
										<Badge
											colorScheme="green"
											fontSize="10px"
											borderRadius="full">
											{customer.points}đ
										</Badge>
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

						{/* Total */}
						<VStack
							align="flex-end"
							spacing={1}
							pr={4}>
							<Text
								fontSize="xs"
								fontWeight="600"
								color="gray.500"
								textTransform="uppercase"
								letterSpacing="wide">
								TỔNG TIỀN
							</Text>
							<HStack spacing={2}>
								<Text
									fontSize="3xl"
									fontWeight="800"
									color="#161f70"
									lineHeight="1"
									letterSpacing="tight">
									{total.toLocaleString("vi-VN")}
								</Text>
								<Text
									fontSize="xl"
									fontWeight="700"
									color="#161f70">
									đ
								</Text>
							</HStack>
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
								boxShadow: "0 6px 20px rgba(22, 31, 112, 0.35)",
							}}
							_active={{ transform: "translateY(0)" }}
							_disabled={{
								bgGradient: "none",
								bg: "gray.300",
								cursor: "not-allowed",
								opacity: 0.6,
							}}
							onClick={onPrint}
							isDisabled={isDisabled || total === 0}>
							In hóa đơn
						</Button>
					</Grid>
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
									color="gray.500"
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
									color="gray.500"
									textTransform="uppercase">
									TỔNG TIỀN
								</Text>
								<HStack spacing={1}>
									<Text
										fontSize="3xl"
										fontWeight="800"
										color="#161f70"
										lineHeight="1">
										{total.toLocaleString("vi-VN")}
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
								isDisabled={isDisabled || total === 0}
								_hover={{
									transform: "translateY(-1px)",
									boxShadow:
										"0 6px 16px rgba(22, 31, 112, 0.35)",
								}}>
								In hóa đơn
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
								color="gray.500"
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
									color="gray.500"
									textTransform="uppercase">
									TỔNG TIỀN
								</Text>
								<HStack spacing={1}>
									<Text
										fontSize="2xl"
										fontWeight="800"
										color="#161f70"
										lineHeight="1">
										{total.toLocaleString("vi-VN")}
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
								isDisabled={isDisabled || total === 0}
								_active={{ transform: "scale(0.98)" }}>
								<VStack spacing={0.5}>
									<Text fontSize="xl">🖨️</Text>
									<Text fontSize="xs">In hóa đơn</Text>
								</VStack>
							</Button>
						</Grid>
					</VStack>
				</Box>
			</Box>
		</Box>
	);
};
