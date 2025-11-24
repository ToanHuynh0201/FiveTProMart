import { useState } from "react";
import {
	Box,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Button,
	Text,
	VStack,
	HStack,
	Badge,
} from "@chakra-ui/react";
import { salesService } from "@/services/salesService";

interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

interface CustomerInfoInputProps {
	onCustomerConfirmed: (customer: Customer) => void;
}

export const CustomerInfoInput: React.FC<CustomerInfoInputProps> = ({
	onCustomerConfirmed,
}) => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customer, setCustomer] = useState<Customer | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState("");

	const handleSearch = async () => {
		if (!phoneNumber.trim()) {
			setError("Vui lòng nhập số điện thoại");
			return;
		}

		// Validate phone number (basic Vietnamese phone format)
		const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
		if (!phoneRegex.test(phoneNumber.trim())) {
			setError("Số điện thoại không hợp lệ");
			return;
		}

		setError("");
		setIsSearching(true);

		try {
			const foundCustomer = await salesService.findCustomerByPhone(
				phoneNumber,
			);

			if (foundCustomer) {
				setCustomer(foundCustomer);
			} else {
				setError(
					"Không tìm thấy khách hàng. Vui lòng kiểm tra lại số điện thoại hoặc đăng ký khách hàng mới.",
				);
				setCustomer(null);
			}
		} catch (err) {
			setError("Có lỗi xảy ra khi tìm kiếm khách hàng");
			console.error(err);
		} finally {
			setIsSearching(false);
		}
	};

	const handleConfirm = () => {
		if (customer) {
			onCustomerConfirmed(customer);
		}
	};

	const handleReset = () => {
		setPhoneNumber("");
		setCustomer(null);
		setError("");
	};

	const handleSkip = () => {
		// Tạo khách hàng vãng lai
		const guestCustomer: Customer = {
			id: `guest_${Date.now()}`,
			name: "KHÁCH HÀNG",
			phone: "",
			points: 0,
		};
		setCustomer(guestCustomer);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && phoneNumber.trim()) {
			handleSearch();
		}
	};

	return (
		<Box
			bg="white"
			borderRadius="xl"
			p={6}
			boxShadow="sm">
			<Text
				fontSize="lg"
				fontWeight="700"
				color="#161f70"
				mb={4}>
				Thông tin khách hàng
			</Text>

			<VStack
				spacing={4}
				align="stretch">
				<FormControl>
					<FormLabel
						fontSize="sm"
						fontWeight="600"
						color="gray.700">
						Số điện thoại (Không bắt buộc)
					</FormLabel>
					<Flex gap={3}>
						<Input
							placeholder="Nhập số điện thoại hoặc bỏ qua cho khách vãng lai"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							onKeyPress={handleKeyPress}
							isDisabled={customer !== null}
							fontSize="sm"
							borderColor="gray.300"
							_hover={{ borderColor: "#161f70" }}
							_focus={{
								borderColor: "#161f70",
								boxShadow: "0 0 0 1px #161f70",
							}}
						/>
						{customer ? (
							<Button
								onClick={handleReset}
								colorScheme="gray"
								size="md"
								minW="100px">
								Đổi KH
							</Button>
						) : (
							<>
								<Button
									onClick={handleSearch}
									isLoading={isSearching}
									bg="#161f70"
									color="white"
									_hover={{ bg: "#1a2580" }}
									size="md"
									minW="100px"
									isDisabled={!phoneNumber.trim()}>
									Tìm kiếm
								</Button>
								<Button
									onClick={handleSkip}
									colorScheme="orange"
									size="md"
									minW="100px">
									Bỏ qua
								</Button>
							</>
						)}
					</Flex>
				</FormControl>

				{error && (
					<Text
						fontSize="sm"
						color="red.500">
						{error}
					</Text>
				)}

				{customer && (
					<Box
						p={4}
						bg={customer.phone ? "green.50" : "orange.50"}
						borderRadius="md"
						borderLeft="3px solid"
						borderColor={
							customer.phone ? "green.500" : "orange.500"
						}>
						<VStack
							align="stretch"
							spacing={2}>
							<HStack justify="space-between">
								<Text
									fontSize="sm"
									color="gray.600">
									{customer.phone
										? "Tên khách hàng:"
										: "Loại khách:"}
								</Text>
								<Text
									fontSize="md"
									fontWeight="700"
									color="#161f70">
									{customer.name}
								</Text>
							</HStack>

							{customer.phone && (
								<HStack justify="space-between">
									<Text
										fontSize="sm"
										color="gray.600">
										Số điện thoại:
									</Text>
									<Text
										fontSize="md"
										fontWeight="600">
										{customer.phone}
									</Text>
								</HStack>
							)}

							{customer.phone &&
								customer.points !== undefined &&
								customer.points > 0 && (
									<HStack justify="space-between">
										<Text
											fontSize="sm"
											color="gray.600">
											Điểm tích lũy:
										</Text>
										<Badge
											colorScheme="green"
											fontSize="md"
											px={2}
											py={1}
											borderRadius="md">
											{customer.points} điểm
										</Badge>
									</HStack>
								)}

							<Button
								onClick={handleConfirm}
								bg="#161f70"
								color="white"
								_hover={{ bg: "#1a2580" }}
								size="md"
								mt={2}
								w="full">
								Xác nhận và bắt đầu lập hóa đơn
							</Button>
						</VStack>
					</Box>
				)}
			</VStack>
		</Box>
	);
};
