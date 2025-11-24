import { useState, useEffect } from "react";
import {
	Box,
	Flex,
	Grid,
	Heading,
	VStack,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	useDisclosure,
} from "@chakra-ui/react";
import MainLayout from "@/components/layout/MainLayout";
import {
	ProductSearchBar,
	AddProductButton,
	OrderItemsTable,
	PaymentMethodSelector,
	OrderSummary,
	OrderHeader,
	CustomerInfoInput,
} from "../components/sales";
import type { OrderItem, PaymentMethod, Product } from "../types/sales";
import { salesService } from "../services/salesService";

interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

const SalesPage = () => {
	const [customer, setCustomer] = useState<Customer | null>(null);
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [paymentMethod, setPaymentMethod] = useState<
		PaymentMethod | undefined
	>();
	const [orderNumber] = useState(
		`#${Math.floor(Math.random() * 90000000) + 10000000}`,
	);
	const [createdAt] = useState(new Date());
	const [showProductList, setShowProductList] = useState(false);

	useEffect(() => {
		// Load all products on mount if needed
		salesService.getAllProducts().then(() => {
			// Products loaded successfully
		});
	}, []);

	const handleProductSelect = (product: Product) => {
		// Check if product already exists in order
		const existingItem = orderItems.find(
			(item) => item.product.id === product.id,
		);

		if (existingItem) {
			// Increase quantity
			handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
		} else {
			// Add new item
			const newItem = salesService.createOrderItem(product, 1);
			setOrderItems([...orderItems, newItem]);
		}
	};

	const handleUpdateQuantity = (itemId: string, quantity: number) => {
		if (quantity < 1) return;

		setOrderItems(
			orderItems.map((item) => {
				if (item.id === itemId) {
					const newQuantity = Math.min(quantity, item.product.stock);
					return {
						...item,
						quantity: newQuantity,
						totalPrice: item.unitPrice * newQuantity,
					};
				}
				return item;
			}),
		);
	};

	const handleRemoveItem = (itemId: string) => {
		setOrderItems(orderItems.filter((item) => item.id !== itemId));
	};

	const handleShowProductList = () => {
		setShowProductList(!showProductList);
		// TODO: Implement modal to show all products
	};

	const calculateTotal = () => {
		return salesService.calculateOrderTotal(orderItems);
	};

	const calculateLoyaltyPoints = () => {
		// Assuming 1 point per 10,000 VND
		return Math.floor(calculateTotal() / 10000);
	};

	const handlePrint = async () => {
		if (orderItems.length === 0) {
			alert("Vui lòng thêm sản phẩm vào đơn hàng");
			return;
		}

		if (!paymentMethod) {
			alert("Vui lòng chọn phương thức thanh toán");
			return;
		}

		try {
			const order = await salesService.createOrder({
				orderNumber,
				items: orderItems,
				subtotal: calculateTotal(),
				discount: 0,
				total: calculateTotal(),
				paymentMethod,
				customer: customer
					? {
							id: customer.id,
							name: customer.name,
							phone: customer.phone,
							points: customer.phone
								? (customer.points || 0) +
								  calculateLoyaltyPoints()
								: 0,
					  }
					: {
							id: `guest_${Date.now()}`,
							name: "KHÁCH HÀNG",
							phone: "",
							points: 0,
					  },
				staff: {
					id: "staff_1",
					name: "Đặng V",
				},
				createdAt,
				status: "completed",
			});

			// Complete the order
			await salesService.completeOrder(order.id);

			// Print logic here (could open print dialog)
			alert(
				`Đơn hàng ${orderNumber} đã được tạo thành công!\nTổng tiền: ${calculateTotal().toLocaleString(
					"vi-VN",
				)}đ`,
			);

			// Reset form
			setOrderItems([]);
			setPaymentMethod(undefined);
			setCustomer(null);

			// Reload page to get new order number
			window.location.reload();
		} catch (error) {
			console.error("Error creating order:", error);
			alert("Có lỗi xảy ra khi tạo đơn hàng");
		}
	};

	const handleCustomerConfirmed = (confirmedCustomer: Customer) => {
		setCustomer(confirmedCustomer);
	};

	const { isOpen, onOpen, onClose } = useDisclosure();

	const handleBackToCustomerInfo = () => {
		// Reset tất cả thông tin
		setCustomer(null);
		setOrderItems([]);
		setPaymentMethod(undefined);
		onClose();
	};

	return (
		<MainLayout>
			<Box
				p={8}
				bg="gray.50"
				minH="100%">
				<Box
					bg="white"
					p={{ base: 4, md: 8 }}
					borderRadius="xl"
					boxShadow="sm"
					mb={6}>
					<Flex
						align="center"
						gap={4}
						mb={5}>
						{customer && (
							<Button
								onClick={onOpen}
								colorScheme="gray"
								variant="outline"
								size="md"
								leftIcon={<Box as="span">←</Box>}>
								Quay lại
							</Button>
						)}
						<Heading
							size="lg"
							color="#161f70">
							Lập hóa đơn
						</Heading>
					</Flex>
					{customer && (
						<OrderHeader
							orderNumber={orderNumber}
							customerName={customer.name}
							createdAt={createdAt}
						/>
					)}
				</Box>

				{!customer ? (
					<CustomerInfoInput
						onCustomerConfirmed={handleCustomerConfirmed}
					/>
				) : (
					<>
						<Grid
							templateColumns={{ base: "1fr" }}
							gap={6}
							alignItems="start">
							<VStack
								spacing={5}
								align="stretch">
								<Box
									bg="white"
									borderRadius="xl"
									p={6}
									boxShadow="sm">
									<Flex
										gap={3}
										align="center"
										wrap="wrap">
										<AddProductButton
											onClick={handleShowProductList}
										/>
										<ProductSearchBar
											onProductSelect={
												handleProductSelect
											}
										/>
									</Flex>
								</Box>

								<Box
									bg="white"
									borderRadius="xl"
									p={6}
									boxShadow="sm">
									<OrderItemsTable
										items={orderItems}
										onUpdateQuantity={handleUpdateQuantity}
										onRemoveItem={handleRemoveItem}
									/>
								</Box>

								<Grid
									templateColumns={{
										base: "1fr",
										md: "repeat(2, 1fr)",
									}}
									gap={5}>
									<Box
										bg="white"
										borderRadius="xl"
										p={6}
										boxShadow="sm">
										<PaymentMethodSelector
											selected={paymentMethod}
											onSelect={setPaymentMethod}
										/>
									</Box>

									<Box
										bg="white"
										borderRadius="xl"
										p={6}
										boxShadow="sm">
										<OrderSummary
											total={calculateTotal()}
											loyaltyPoints={calculateLoyaltyPoints()}
											onPrint={handlePrint}
										/>
									</Box>
								</Grid>
							</VStack>
						</Grid>

						<Modal
							isOpen={isOpen}
							onClose={onClose}
							isCentered>
							<ModalOverlay bg="blackAlpha.600" />
							<ModalContent>
								<ModalHeader color="#161f70">
									Xác nhận quay lại
								</ModalHeader>
								<ModalCloseButton />
								<ModalBody>
									Bạn có chắc chắn muốn quay lại? Tất cả thông
									tin sản phẩm đã thêm và phương thức thanh
									toán sẽ bị xóa.
								</ModalBody>
								<ModalFooter gap={3}>
									<Button
										colorScheme="gray"
										variant="ghost"
										onClick={onClose}>
										Hủy
									</Button>
									<Button
										colorScheme="red"
										onClick={handleBackToCustomerInfo}>
										Xác nhận
									</Button>
								</ModalFooter>
							</ModalContent>
						</Modal>
					</>
				)}
			</Box>
		</MainLayout>
	);
};
export default SalesPage;
