import { useState, useEffect } from "react";
import {
	Box,
	Flex,
	Heading,
	VStack,
	useToast,
	useDisclosure,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
} from "@chakra-ui/react";
import MainLayout from "@/components/layout/MainLayout";
import {
	ProductSearchBar,
	AddProductButton,
	OrderItemsTable,
	OrderHeader,
	PaymentFooter,
	OrderHistoryTable,
	OrderDetailModal,
	OrderFilterBar,
	BatchSelectionModal,
	PendingOrdersList,
} from "../components/sales";
import type {
	OrderItem,
	PaymentMethod,
	Product,
	SalesOrder,
	PendingOrder,
} from "../types/sales";
import type { OrderFilters } from "../components/sales/OrderFilterBar";
import { salesService } from "../services/salesService";
import { isExpired, isExpiringSoon } from "../utils/date";

interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

const SalesPage = () => {
	const toast = useToast();
	const [customer, setCustomer] = useState<Customer | null>({
		id: `guest_${Date.now()}`,
		name: "KHÁCH VÃNG LAI",
		phone: "",
		points: 0,
	});
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [paymentMethod, setPaymentMethod] = useState<
		PaymentMethod | undefined
	>();
	const [orderNumber] = useState(
		`#${Math.floor(Math.random() * 90000000) + 10000000}`,
	);
	const [createdAt] = useState(new Date());
	const [showProductList, setShowProductList] = useState(false);
	const [selectedProductForBatch, setSelectedProductForBatch] =
		useState<Product | null>(null);
	// Pending orders state
	const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

	// Order history states
	const [orders, setOrders] = useState<SalesOrder[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
	const [filters, setFilters] = useState<OrderFilters>({
		searchQuery: "",
		status: "",
		paymentMethod: "",
		dateFrom: "",
		dateTo: "",
	});

	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		isOpen: isBatchModalOpen,
		onOpen: onBatchModalOpen,
		onClose: onBatchModalClose,
	} = useDisclosure();

	useEffect(() => {
		// Load all products on mount if needed
		salesService.getAllProducts().then(() => {
			// Products loaded successfully
		});

		// Load orders for history
		loadOrders();
	}, []);

	useEffect(() => {
		// Apply filters when filters change
		applyFilters();
	}, [filters, orders]);

	const loadOrders = async () => {
		const allOrders = await salesService.getAllOrders();
		setOrders(allOrders);
		setFilteredOrders(allOrders);
	};

	const applyFilters = async () => {
		const filtered = await salesService.filterOrders(filters);
		setFilteredOrders(filtered);
	};

	const handleFiltersChange = (newFilters: OrderFilters) => {
		setFilters(newFilters);
	};

	const handleResetFilters = () => {
		setFilters({
			searchQuery: "",
			status: "",
			paymentMethod: "",
			dateFrom: "",
			dateTo: "",
		});
	};

	const handleViewOrderDetail = (order: SalesOrder) => {
		setSelectedOrder(order);
		onOpen();
	};

	const handleProductSelect = (product: Product) => {
		// Nếu sản phẩm có nhiều lô hàng, mở modal chọn lô
		if (product.batches && product.batches.length > 0) {
			setSelectedProductForBatch(product);
			onBatchModalOpen();
		} else {
			// Xử lý như cũ cho sản phẩm không có lô
			addProductToCart(product, 1);
		}
	};

	const handleBatchSelect = (batchId: string, quantity: number) => {
		if (!selectedProductForBatch) return;

		const batch = selectedProductForBatch.batches?.find(
			(b) => b.id === batchId,
		);
		if (!batch) return;

		// Cảnh báo nếu lô đã hết hạn
		if (isExpired(batch.expiryDate)) {
			toast({
				title: "Cảnh báo lô hàng hết hạn",
				description: `Lô ${batch.batchNumber} đã hết hạn sử dụng. Không nên bán!`,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
		}

		// Cảnh báo nếu lô sắp hết hạn
		if (isExpiringSoon(batch.expiryDate, 7)) {
			toast({
				title: "Lô hàng sắp hết hạn",
				description: `Lô ${batch.batchNumber} sắp hết hạn. Nên ưu tiên bán lô này.`,
				status: "warning",
				duration: 4000,
				isClosable: true,
				position: "top",
			});
		}

		addProductToCart(
			selectedProductForBatch,
			quantity,
			batchId,
			batch.batchNumber,
		);
		setSelectedProductForBatch(null);
	};

	const addProductToCart = (
		product: Product,
		quantity: number,
		batchId?: string,
		batchNumber?: string,
	) => {
		// Check if same product and batch already exists
		const existingItem = orderItems.find(
			(item) =>
				item.product.id === product.id && item.batchId === batchId,
		);

		if (existingItem) {
			// Increase quantity
			handleUpdateQuantity(
				existingItem.id,
				existingItem.quantity + quantity,
			);
		} else {
			// Add new item
			const newItem: OrderItem = {
				id: `item_${Date.now()}_${Math.random()}`,
				product,
				quantity,
				unitPrice: product.price,
				totalPrice: product.price * quantity,
				batchId,
				batchNumber,
			};
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
			setCustomer({
				id: `guest_${Date.now()}`,
				name: "KHÁCH VÃNG LAI",
				phone: "",
				points: 0,
			});

			// Reload page to get new order number
			window.location.reload();
		} catch (error) {
			console.error("Error creating order:", error);
			alert("Có lỗi xảy ra khi tạo đơn hàng");
		}
	};

	const handleCustomerChange = (updatedCustomer: Customer | null) => {
		setCustomer(updatedCustomer);
	};

	// Tạm dừng hóa đơn hiện tại
	const handlePauseOrder = () => {
		if (orderItems.length === 0) {
			toast({
				title: "Không có hóa đơn để tạm dừng",
				description: "Vui lòng thêm sản phẩm trước khi tạm dừng",
				status: "warning",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		const pendingOrder: PendingOrder = {
			id: `pending_${Date.now()}`,
			orderNumber,
			items: [...orderItems],
			customer: customer ? { ...customer } : null,
			paymentMethod,
			createdAt,
			pausedAt: new Date(),
		};

		setPendingOrders([...pendingOrders, pendingOrder]);

		// Reset form để tạo hóa đơn mới
		setOrderItems([]);
		setPaymentMethod(undefined);
		setCustomer({
			id: `guest_${Date.now()}`,
			name: "KHÁCH VÃNG LAI",
			phone: "",
			points: 0,
		});

		toast({
			title: "Đã tạm dừng hóa đơn",
			description: `Hóa đơn ${orderNumber} đã được lưu. Bạn có thể tạo hóa đơn mới.`,
			status: "success",
			duration: 3000,
			isClosable: true,
			position: "top",
		});
	};

	// Khôi phục hóa đơn tạm dừng
	const handleRestoreOrder = (order: PendingOrder) => {
		// Nếu đang có hóa đơn, hỏi có muốn tạm dừng không
		if (orderItems.length > 0) {
			const shouldPause = window.confirm(
				"Bạn đang có hóa đơn chưa hoàn thành. Bạn có muốn tạm dừng hóa đơn hiện tại không?",
			);
			if (shouldPause) {
				handlePauseOrder();
			} else {
				return;
			}
		}

		// Khôi phục dữ liệu từ pending order
		setOrderItems(order.items);
		if (order.customer) {
			setCustomer({
				id: order.customer.id,
				name: order.customer.name,
				phone: order.customer.phone || "",
				points: order.customer.points || 0,
			});
		} else {
			setCustomer({
				id: `guest_${Date.now()}`,
				name: "KHÁCH VÃNG LAI",
				phone: "",
				points: 0,
			});
		}
		setPaymentMethod(order.paymentMethod);

		// Xóa khỏi danh sách pending
		setPendingOrders(pendingOrders.filter((po) => po.id !== order.id));
	};

	// Xóa hóa đơn tạm dừng
	const handleDeletePendingOrder = (orderId: string) => {
		setPendingOrders(pendingOrders.filter((order) => order.id !== orderId));
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
					<Heading
						size="lg"
						color="#161f70"
						mb={5}>
						Quản lý bán hàng
					</Heading>

					<Tabs
						colorScheme="blue"
						variant="enclosed">
						<TabList>
							<Tab
								_selected={{
									color: "#161f70",
									bg: "blue.50",
									borderColor: "#161f70",
									borderBottomColor: "white",
								}}>
								Lập hóa đơn
							</Tab>
							<Tab
								_selected={{
									color: "#161f70",
									bg: "blue.50",
									borderColor: "#161f70",
									borderBottomColor: "white",
								}}>
								Lịch sử bán hàng
							</Tab>
						</TabList>

						<TabPanels>
							{/* Tab: Lập hóa đơn */}
							<TabPanel px={0}>
								<Box
									pt={4}
									pb="100px">
									<Box mb={5}>
										<OrderHeader
											orderNumber={orderNumber}
											customerName={
												customer?.name ||
												"KHÁCH VÃNG LAI"
											}
											createdAt={createdAt}
											onPauseOrder={handlePauseOrder}
										/>
									</Box>

									<Box mb={5}>
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
													onClick={
														handleShowProductList
													}
												/>
												<ProductSearchBar
													onProductSelect={
														handleProductSelect
													}
												/>
											</Flex>
										</Box>
									</Box>

									<Box mb={5}>
										<Box
											bg="white"
											borderRadius="xl"
											p={6}
											boxShadow="sm">
											<OrderItemsTable
												items={orderItems}
												onUpdateQuantity={
													handleUpdateQuantity
												}
												onRemoveItem={handleRemoveItem}
											/>
										</Box>
									</Box>

									{/* Danh sách hóa đơn tạm dừng */}
									<PendingOrdersList
										pendingOrders={pendingOrders}
										onRestore={handleRestoreOrder}
										onDelete={handleDeletePendingOrder}
									/>

									<BatchSelectionModal
										isOpen={isBatchModalOpen}
										onClose={onBatchModalClose}
										product={selectedProductForBatch}
										onConfirm={handleBatchSelect}
									/>
								</Box>

								{/* Floating Payment Footer */}
								<PaymentFooter
									total={calculateTotal()}
									loyaltyPoints={
										customer?.phone
											? calculateLoyaltyPoints()
											: undefined
									}
									paymentMethod={paymentMethod}
									onPaymentMethodChange={setPaymentMethod}
									onPrint={handlePrint}
									isDisabled={orderItems.length === 0}
									customer={customer}
									onCustomerChange={handleCustomerChange}
								/>
							</TabPanel>

							{/* Tab: Lịch sử bán hàng */}
							<TabPanel px={0}>
								<VStack
									spacing={5}
									align="stretch"
									pt={4}>
									<OrderFilterBar
										filters={filters}
										onFiltersChange={handleFiltersChange}
										onReset={handleResetFilters}
									/>{" "}
									<Box
										bg="white"
										borderRadius="xl"
										p={6}
										boxShadow="sm">
										<Heading
											size="md"
											mb={4}
											color="#161f70">
											Danh sách đơn hàng (
											{filteredOrders.length})
										</Heading>
										<OrderHistoryTable
											orders={filteredOrders}
											onViewDetail={handleViewOrderDetail}
										/>
									</Box>
								</VStack>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>

				{/* Order Detail Modal */}
				<OrderDetailModal
					isOpen={isOpen}
					onClose={onClose}
					order={selectedOrder}
				/>
			</Box>
		</MainLayout>
	);
};
export default SalesPage;
