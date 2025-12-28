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
	OrderItemsTable,
	OrderHeader,
	PaymentFooter,
	OrderHistoryTable,
	OrderDetailModal,
	OrderFilterBar,
	PendingOrdersList,
	BarcodeScanner,
} from "../components/sales";
import type {
	OrderItem,
	PaymentMethod,
	Product,
	SalesOrder,
	PendingOrder,
} from "../types/sales";
import type { OrderFilters } from "../components/sales/OrderFilterBar";
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
	// Pending orders state - Load from localStorage
	const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(() => {
		try {
			const saved = localStorage.getItem("salesPage_pendingOrders");
			if (saved) {
				const parsed = JSON.parse(saved);
				// Convert date strings back to Date objects
				return parsed.map((order: PendingOrder) => ({
					...order,
					createdAt: new Date(order.createdAt),
					pausedAt: new Date(order.pausedAt),
				}));
			}
		} catch (error) {
			console.error("Error loading pending orders:", error);
		}
		return [];
	});

	// Tab state
	const [activeTabIndex, setActiveTabIndex] = useState(0);

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
		isOpen: isBarcodeScannerOpen,
		onOpen: onBarcodeScannerOpen,
		onClose: onBarcodeScannerClose,
	} = useDisclosure();

	useEffect(() => {
		// TODO: Implement API call to load products

		// Load orders for history
		loadOrders();

		// Restore current order state from localStorage
		try {
			const saved = localStorage.getItem("salesPage_currentOrder");
			if (saved && orderItems.length === 0) {
				const currentOrderState = JSON.parse(saved);
				setOrderItems(currentOrderState.orderItems || []);
				setPaymentMethod(currentOrderState.paymentMethod);
				if (currentOrderState.customer) {
					setCustomer(currentOrderState.customer);
				}
			}
		} catch (error) {
			console.error("Error restoring current order:", error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// Apply filters when filters change
		applyFilters();
	}, [filters, orders]);

	// Save pending orders to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem(
				"salesPage_pendingOrders",
				JSON.stringify(pendingOrders),
			);
		} catch (error) {
			console.error("Error saving pending orders:", error);
		}
	}, [pendingOrders]);

	// Save current order state to localStorage whenever it changes
	useEffect(() => {
		try {
			if (orderItems.length > 0 || paymentMethod || customer?.phone) {
				const currentState = {
					orderItems,
					paymentMethod,
					customer,
					orderNumber,
					createdAt,
				};
				localStorage.setItem(
					"salesPage_currentOrder",
					JSON.stringify(currentState),
				);
			} else {
				// Clear localStorage if order is empty
				localStorage.removeItem("salesPage_currentOrder");
			}
		} catch (error) {
			console.error("Error saving current order:", error);
		}
	}, [orderItems, paymentMethod, customer, orderNumber, createdAt]);

	const loadOrders = async () => {
		// TODO: Implement API call to load orders
		setOrders([]);
		setFilteredOrders([]);
	};

	const applyFilters = async () => {
		// TODO: Implement API call to filter orders
		setFilteredOrders([]);
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

	const handleProductSelect = (
		product: Product,
		batchId?: string,
		batchNumber?: string,
	) => {
		// Chỉ chấp nhận khi có thông tin lô hàng (từ quét mã lô)
		if (batchId && batchNumber) {
			const batch = product.batches?.find((b) => b.id === batchId);
			if (batch) {
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

				addProductToCart(product, 1, batchId, batchNumber);
			}
		}
		// Không làm gì nếu không có mã lô - bắt buộc phải quét mã lô hàng
	};

	const addProductToCart = (
		product: Product,
		quantity: number,
		batchId?: string,
		batchNumber?: string,
	) => {
		setOrderItems((prevItems) => {
			// Check if same product and batch already exists
			const existingItem = prevItems.find(
				(item) =>
					item.product.id === product.id && item.batchId === batchId,
			);

			if (existingItem) {
				// Increase quantity - tìm số lượng tồn kho của lô
				let maxQuantity = existingItem.product.stock;
				if (existingItem.batchId) {
					const batch = existingItem.product.batches?.find(
						(b) => b.id === existingItem.batchId,
					);
					if (batch) {
						maxQuantity = batch.quantity;
					}
				}

				const newQuantity = Math.min(
					existingItem.quantity + quantity,
					maxQuantity,
				);

				return prevItems.map((item) =>
					item.id === existingItem.id
						? {
								...item,
								quantity: newQuantity,
								totalPrice: item.unitPrice * newQuantity,
						  }
						: item,
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
				return [...prevItems, newItem];
			}
		});
	};

	const handleUpdateQuantity = (itemId: string, quantity: number) => {
		if (quantity < 1) return;

		setOrderItems((prevItems) =>
			prevItems.map((item) => {
				if (item.id === itemId) {
					// Tìm số lượng tồn kho của lô hàng cụ thể
					let maxQuantity = item.product.stock;
					if (item.batchId) {
						const batch = item.product.batches?.find(
							(b) => b.id === item.batchId,
						);
						if (batch) {
							maxQuantity = batch.quantity;
						}
					}

					const newQuantity = Math.min(quantity, maxQuantity);
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

	const calculateTotal = () => {
		return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
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

		// TODO: Implement API call to create and complete order
		console.log("Create order:", {
			orderNumber,
			items: orderItems,
			subtotal: calculateTotal(),
			discount: 0,
			total: calculateTotal(),
			paymentMethod,
			customer,
		});

		// Clear localStorage
		localStorage.removeItem("salesPage_currentOrder");

		// Reset form
		setOrderItems([]);
		setPaymentMethod(undefined);
		setCustomer({
			id: `guest_${Date.now()}`,
			name: "KHÁCH VÃNG LAI",
			phone: "",
			points: 0,
		});
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

		// Clear current order from localStorage
		localStorage.removeItem("salesPage_currentOrder");

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
		// Nếu đang có hóa đơn, tự động lưu vào danh sách pending
		if (orderItems.length > 0) {
			const currentPendingOrder: PendingOrder = {
				id: `pending_${Date.now()}`,
				orderNumber,
				items: [...orderItems],
				customer: customer ? { ...customer } : null,
				paymentMethod,
				createdAt,
				pausedAt: new Date(),
			};

			// Thêm giỏ hàng hiện tại vào danh sách pending (nhưng chưa cập nhật state)
			// Sẽ cập nhật cùng lúc với việc xóa đơn hàng được khôi phục
			const updatedPendingOrders = [
				...pendingOrders.filter((po) => po.id !== order.id), // Xóa đơn hàng sẽ khôi phục
				currentPendingOrder, // Thêm giỏ hàng hiện tại
			];
			setPendingOrders(updatedPendingOrders);

			toast({
				title: "Đã lưu hóa đơn hiện tại",
				description: `Hóa đơn ${orderNumber} đã được lưu vào danh sách chờ`,
				status: "info",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
		} else {
			// Nếu giỏ hàng trống, chỉ xóa đơn hàng được khôi phục khỏi pending
			setPendingOrders(pendingOrders.filter((po) => po.id !== order.id));
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

		toast({
			title: "Đã khôi phục hóa đơn",
			description: `Hóa đơn ${order.orderNumber} đã được khôi phục`,
			status: "success",
			duration: 3000,
			isClosable: true,
			position: "top",
		});
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
					<Flex
						justify="space-between"
						align="flex-start"
						mb={5}
						gap={4}
						flexWrap={{ base: "wrap", lg: "nowrap" }}>
						<Heading
							size="lg"
							color="#161f70"
							minW="200px">
							Quản lý bán hàng
						</Heading>
						{activeTabIndex === 0 && (
							<Box flex="1">
								<OrderHeader
									orderNumber={orderNumber}
									customerName={
										customer?.name || "KHÁCH VÃNG LAI"
									}
									createdAt={createdAt}
									onPauseOrder={handlePauseOrder}
								/>
							</Box>
						)}
					</Flex>

					<Tabs
						colorScheme="blue"
						variant="enclosed"
						index={activeTabIndex}
						onChange={setActiveTabIndex}>
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
									pt={1}
									pb="50px">
									<Box
										mb={2}
										flex={1}
										maxW="100%">
										<Box
											bg="white"
											borderRadius="xl"
											p={3}
											boxShadow="sm">
											<ProductSearchBar
												onProductSelect={
													handleProductSelect
												}
												onOpenBarcodeScanner={
													onBarcodeScannerOpen
												}
											/>
										</Box>
									</Box>

									<Box mb={5}>
										<Box
											bg="white"
											borderRadius="xl"
											p={3}
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

									<BarcodeScanner
										isOpen={isBarcodeScannerOpen}
										onClose={onBarcodeScannerClose}
										onProductFound={handleProductSelect}
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
