import { useState, useEffect } from "react";
import {
	Box,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Button,
	Text,
	Badge,
	HStack,
	VStack,
} from "@chakra-ui/react";

interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

interface CustomerInfoInlineProps {
	customer: Customer | null;
	onCustomerChange: (customer: Customer | null) => void;
}

export const CustomerInfoInline: React.FC<CustomerInfoInlineProps> = ({
	customer,
	onCustomerChange,
}) => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState("");

	// Sync với customer prop
	useEffect(() => {
		if (customer && customer.phone) {
			setPhoneNumber(customer.phone);
		} else {
			setPhoneNumber("");
		}
	}, [customer]);

	const handleSearch = async () => {
		if (!phoneNumber.trim()) {
			// Nếu không nhập gì, set khách vãng lai
			const guestCustomer: Customer = {
				id: `guest_${Date.now()}`,
				name: "KHÁCH VÃNG LAI",
				phone: "",
				points: 0,
			};
			onCustomerChange(guestCustomer);
			setError("");
			return;
		}

		// Validate phone number
		const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
		if (!phoneRegex.test(phoneNumber.trim())) {
			setError("Số điện thoại không hợp lệ");
			return;
		}

		setError("");
		setIsSearching(true);

		try {
			// TODO: Replace with actual salesService.findCustomerByPhone() API call
			const foundCustomer = null;

			if (foundCustomer) {
				onCustomerChange(foundCustomer);
				setError("");
			} else {
				setError("Không tìm thấy khách hàng");
				// Vẫn cho phép tiếp tục với khách vãng lai
				const guestCustomer: Customer = {
					id: `guest_${Date.now()}`,
					name: "KHÁCH VÃNG LAI",
					phone: "",
					points: 0,
				};
				onCustomerChange(guestCustomer);
			}
		} catch (err) {
			setError("Có lỗi xảy ra khi tìm kiếm");
			console.error(err);
		} finally {
			setIsSearching(false);
		}
	};

	const handleReset = () => {
		setPhoneNumber("");
		setError("");
		const guestCustomer: Customer = {
			id: `guest_${Date.now()}`,
			name: "KHÁCH VÃNG LAI",
			phone: "",
			points: 0,
		};
		onCustomerChange(guestCustomer);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<Box
			bg="white"
			borderRadius="xl"
			p={5}
			boxShadow="sm">
			<Text
				fontSize="md"
				fontWeight="700"
				color="#161f70"
				mb={3}>
				Thông tin khách hàng
			</Text>

			<VStack
				spacing={3}
				align="stretch">
				<FormControl>
					<FormLabel
						fontSize="sm"
						fontWeight="600"
						color="gray.700"
						mb={2}>
						Số điện thoại (Tùy chọn)
					</FormLabel>
					<Flex gap={2}>
						<Input
							placeholder="Nhập SĐT để tìm khách hàng hoặc bỏ trống"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							onKeyPress={handleKeyPress}
							fontSize="sm"
							borderColor="gray.300"
							_hover={{ borderColor: "#161f70" }}
							_focus={{
								borderColor: "#161f70",
								boxShadow: "0 0 0 1px #161f70",
							}}
						/>
						<Button
							onClick={handleSearch}
							isLoading={isSearching}
							bg="#161f70"
							color="white"
							_hover={{ bg: "#1a2580" }}
							size="md"
							minW="90px">
							{phoneNumber.trim() ? "Tìm" : "OK"}
						</Button>
						{customer && customer.phone && (
							<Button
								onClick={handleReset}
								colorScheme="gray"
								variant="outline"
								size="md"
								minW="80px">
								Xóa
							</Button>
						)}
					</Flex>
				</FormControl>

				{error && (
					<Text
						fontSize="sm"
						color="orange.500">
						{error}
					</Text>
				)}

				{customer && (
					<Box
						p={3}
						bg={customer.phone ? "green.50" : "gray.50"}
						borderRadius="md"
						borderLeft="3px solid"
						borderColor={customer.phone ? "green.500" : "gray.400"}>
						<HStack justify="space-between">
							<VStack
								align="start"
								spacing={1}>
								<Text
									fontSize="sm"
									color="gray.600">
									{customer.phone ? "Khách hàng:" : "Loại:"}
								</Text>
								<Text
									fontSize="md"
									fontWeight="700"
									color="#161f70">
									{customer.name}
								</Text>
								{customer.phone && (
									<Text
										fontSize="sm"
										color="gray.600">
										SĐT: {customer.phone}
									</Text>
								)}
							</VStack>

							{customer.phone &&
								customer.points !== undefined &&
								customer.points > 0 && (
									<Badge
										colorScheme="green"
										fontSize="sm"
										px={3}
										py={1}
										borderRadius="md">
										{customer.points} điểm
									</Badge>
								)}
						</HStack>
					</Box>
				)}
			</VStack>
		</Box>
	);
};
