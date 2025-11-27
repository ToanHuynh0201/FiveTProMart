import type { Product, SalesOrder, OrderItem } from "../types/sales";

// Mock data cho sản phẩm
const mockProducts: Product[] = [
	{
		id: "p1",
		code: "SN00000001",
		name: "Bánh snack bắp cải trộn",
		price: 50000,
		stock: 150,
		category: "Snack",
		batches: [
			{
				id: "b1_1",
				batchNumber: "LOT001",
				quantity: 100,
				expiryDate: new Date("2025-12-31"), // Còn hạn dài
				importDate: new Date("2025-10-15"),
			},
			{
				id: "b1_2",
				batchNumber: "LOT002",
				quantity: 50,
				expiryDate: new Date("2025-11-29"), // Sắp hết hạn (2 ngày)
				importDate: new Date("2025-09-20"),
			},
		],
	},
	{
		id: "p2",
		code: "SN00000002",
		name: "Bánh snack củ cải trộn",
		price: 80000,
		stock: 120,
		category: "Snack",
		batches: [
			{
				id: "b2_1",
				batchNumber: "LOT003",
				quantity: 70,
				expiryDate: new Date("2026-01-15"), // Còn hạn dài
				importDate: new Date("2025-11-01"),
			},
			{
				id: "b2_2",
				batchNumber: "LOT004",
				quantity: 50,
				expiryDate: new Date("2025-12-01"), // Sắp hết hạn (4 ngày)
				importDate: new Date("2025-10-10"),
			},
		],
	},
	{
		id: "p3",
		code: "CN00000002",
		name: "Củ cải vàng",
		price: 40000,
		stock: 250,
		category: "Rau củ",
		batches: [
			{
				id: "b3_1",
				batchNumber: "LOT005",
				quantity: 200,
				expiryDate: new Date("2025-12-20"), // Còn hạn dài
				importDate: new Date("2025-11-15"),
			},
			{
				id: "b3_2",
				batchNumber: "LOT006",
				quantity: 50,
				expiryDate: new Date("2025-11-28"), // Sắp hết hạn (1 ngày)
				importDate: new Date("2025-11-10"),
			},
		],
	},
	{
		id: "p4",
		code: "CN00000004",
		name: "Củ cải xanh",
		price: 40000,
		stock: 180,
		category: "Rau củ",
		promotion: "mua 2 tặng cây đấm lưng",
		batches: [
			{
				id: "b4_1",
				batchNumber: "LOT007",
				quantity: 150,
				expiryDate: new Date("2026-02-10"), // Còn hạn dài
				importDate: new Date("2025-11-20"),
			},
			{
				id: "b4_2",
				batchNumber: "LOT008",
				quantity: 30,
				expiryDate: new Date("2025-12-02"), // Sắp hết hạn (5 ngày)
				importDate: new Date("2025-10-25"),
			},
		],
	},
];

// Mock data cho khách hàng
interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

const mockCustomers: Customer[] = [
	{
		id: "cust_1",
		name: "Nguyễn Văn A",
		phone: "0901234567",
		points: 150,
	},
	{
		id: "cust_2",
		name: "Trần Thị B",
		phone: "0912345678",
		points: 320,
	},
	{
		id: "cust_3",
		name: "Lê Văn C",
		phone: "0923456789",
		points: 80,
	},
	{
		id: "cust_4",
		name: "Hoàng Sếu",
		phone: "0934567890",
		points: 500,
	},
	{
		id: "cust_5",
		name: "Phạm Thị D",
		phone: "0945678901",
		points: 250,
	},
];

// Mock orders in memory with sample data
let orders: SalesOrder[] = [
	{
		id: "order_1",
		orderNumber: "#12345678",
		items: [
			{
				id: "item_1",
				product: {
					id: "p1",
					code: "SN00000001",
					name: "Bánh snack bắp cải trộn",
					price: 50000,
					stock: 100,
					category: "Snack",
				},
				quantity: 2,
				unitPrice: 50000,
				totalPrice: 100000,
			},
			{
				id: "item_2",
				product: {
					id: "p3",
					code: "CN00000002",
					name: "Củ cải vàng",
					price: 40000,
					stock: 200,
					category: "Rau củ",
				},
				quantity: 3,
				unitPrice: 40000,
				totalPrice: 120000,
			},
		],
		subtotal: 220000,
		discount: 0,
		total: 220000,
		paymentMethod: "cash",
		customer: {
			id: "cust_1",
			name: "Nguyễn Văn A",
			phone: "0901234567",
			points: 172,
		},
		staff: {
			id: "staff_1",
			name: "Đặng V",
		},
		createdAt: new Date("2025-11-24T09:30:00"),
		status: "completed",
	},
	{
		id: "order_2",
		orderNumber: "#12345679",
		items: [
			{
				id: "item_3",
				product: {
					id: "p2",
					code: "SN00000002",
					name: "Bánh snack củ cải trộn",
					price: 80000,
					stock: 50,
					category: "Snack",
				},
				quantity: 1,
				unitPrice: 80000,
				totalPrice: 80000,
			},
		],
		subtotal: 80000,
		discount: 0,
		total: 80000,
		paymentMethod: "card",
		customer: {
			id: "cust_2",
			name: "Trần Thị B",
			phone: "0912345678",
			points: 328,
		},
		staff: {
			id: "staff_1",
			name: "Đặng V",
		},
		createdAt: new Date("2025-11-24T10:15:00"),
		status: "completed",
	},
	{
		id: "order_3",
		orderNumber: "#12345680",
		items: [
			{
				id: "item_4",
				product: {
					id: "p4",
					code: "CN00000004",
					name: "Củ cải xanh",
					price: 40000,
					stock: 150,
					category: "Rau củ",
					promotion: "mua 2 tặng cây đấm lưng",
				},
				quantity: 5,
				unitPrice: 40000,
				totalPrice: 200000,
			},
			{
				id: "item_5",
				product: {
					id: "p1",
					code: "SN00000001",
					name: "Bánh snack bắp cải trộn",
					price: 50000,
					stock: 100,
					category: "Snack",
				},
				quantity: 1,
				unitPrice: 50000,
				totalPrice: 50000,
			},
		],
		subtotal: 250000,
		discount: 0,
		total: 250000,
		paymentMethod: "transfer",
		customer: {
			id: "cust_4",
			name: "Hoàng Sếu",
			phone: "0934567890",
			points: 525,
		},
		staff: {
			id: "staff_1",
			name: "Đặng V",
		},
		createdAt: new Date("2025-11-23T14:20:00"),
		status: "completed",
	},
	{
		id: "order_4",
		orderNumber: "#12345681",
		items: [
			{
				id: "item_6",
				product: {
					id: "p3",
					code: "CN00000002",
					name: "Củ cải vàng",
					price: 40000,
					stock: 200,
					category: "Rau củ",
				},
				quantity: 10,
				unitPrice: 40000,
				totalPrice: 400000,
			},
		],
		subtotal: 400000,
		discount: 0,
		total: 400000,
		paymentMethod: "cash",
		customer: {
			id: "guest_1",
			name: "KHÁCH HÀNG",
			phone: "",
			points: 0,
		},
		staff: {
			id: "staff_1",
			name: "Đặng V",
		},
		createdAt: new Date("2025-11-22T16:45:00"),
		status: "completed",
	},
	{
		id: "order_5",
		orderNumber: "#12345682",
		items: [
			{
				id: "item_7",
				product: {
					id: "p2",
					code: "SN00000002",
					name: "Bánh snack củ cải trộn",
					price: 80000,
					stock: 50,
					category: "Snack",
				},
				quantity: 2,
				unitPrice: 80000,
				totalPrice: 160000,
			},
		],
		subtotal: 160000,
		discount: 0,
		total: 160000,
		paymentMethod: "card",
		customer: {
			id: "cust_5",
			name: "Phạm Thị D",
			phone: "0945678901",
			points: 266,
		},
		staff: {
			id: "staff_1",
			name: "Đặng V",
		},
		createdAt: new Date("2025-11-21T11:30:00"),
		status: "completed",
	},
];
let orderCounter = 12345683;

export const salesService = {
	// Tìm kiếm khách hàng theo số điện thoại
	findCustomerByPhone: async (
		phone: string,
	): Promise<Customer | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

		// Normalize phone number (remove spaces and special characters)
		const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");

		return mockCustomers.find((c) => {
			const customerPhone = c.phone.replace(/[\s\-\(\)]/g, "");
			return customerPhone === normalizedPhone;
		});
	},

	// Tìm kiếm sản phẩm
	searchProducts: async (query: string): Promise<Product[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

		if (!query.trim()) {
			return mockProducts;
		}

		const lowerQuery = query.toLowerCase();
		return mockProducts.filter(
			(p) =>
				p.name.toLowerCase().includes(lowerQuery) ||
				p.code.toLowerCase().includes(lowerQuery),
		);
	},

	// Lấy sản phẩm theo ID
	getProductById: async (id: string): Promise<Product | undefined> => {
		return mockProducts.find((p) => p.id === id);
	},

	// Lấy tất cả sản phẩm
	getAllProducts: async (): Promise<Product[]> => {
		return mockProducts;
	},

	// Tạo đơn hàng mới
	createOrder: async (
		orderData: Partial<SalesOrder>,
	): Promise<SalesOrder> => {
		const newOrder: SalesOrder = {
			id: `order_${Date.now()}`,
			orderNumber: `#${orderCounter++}`,
			items: orderData.items || [],
			subtotal: orderData.subtotal || 0,
			discount: orderData.discount || 0,
			total: orderData.total || 0,
			paymentMethod: orderData.paymentMethod,
			customer: orderData.customer,
			staff: orderData.staff,
			createdAt: new Date(),
			status: "draft",
		};

		orders.push(newOrder);
		return newOrder;
	},

	// Cập nhật đơn hàng
	updateOrder: async (
		orderId: string,
		updates: Partial<SalesOrder>,
	): Promise<SalesOrder> => {
		const index = orders.findIndex((o) => o.id === orderId);
		if (index === -1) {
			throw new Error("Order not found");
		}

		orders[index] = { ...orders[index], ...updates };
		return orders[index];
	},

	// Hoàn thành đơn hàng
	completeOrder: async (orderId: string): Promise<SalesOrder> => {
		const index = orders.findIndex((o) => o.id === orderId);
		if (index === -1) {
			throw new Error("Order not found");
		}

		orders[index].status = "completed";
		return orders[index];
	},

	// Lấy đơn hàng theo ID
	getOrderById: async (orderId: string): Promise<SalesOrder | undefined> => {
		return orders.find((o) => o.id === orderId);
	},

	// Lấy tất cả đơn hàng
	getAllOrders: async (): Promise<SalesOrder[]> => {
		return orders;
	},

	// Filter và search đơn hàng
	filterOrders: async (filters: {
		searchQuery?: string;
		status?: string;
		paymentMethod?: string;
		dateFrom?: string;
		dateTo?: string;
	}): Promise<SalesOrder[]> => {
		let filteredOrders = [...orders];

		// Filter by search query (order number or customer name)
		if (filters.searchQuery && filters.searchQuery.trim()) {
			const query = filters.searchQuery.toLowerCase();
			filteredOrders = filteredOrders.filter(
				(order) =>
					order.orderNumber.toLowerCase().includes(query) ||
					order.customer?.name.toLowerCase().includes(query),
			);
		}

		// Filter by status
		if (filters.status) {
			filteredOrders = filteredOrders.filter(
				(order) => order.status === filters.status,
			);
		}

		// Filter by payment method
		if (filters.paymentMethod) {
			filteredOrders = filteredOrders.filter(
				(order) => order.paymentMethod === filters.paymentMethod,
			);
		}

		// Filter by date range
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			fromDate.setHours(0, 0, 0, 0);
			filteredOrders = filteredOrders.filter(
				(order) => new Date(order.createdAt) >= fromDate,
			);
		}

		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59, 999);
			filteredOrders = filteredOrders.filter(
				(order) => new Date(order.createdAt) <= toDate,
			);
		}

		// Sort by date (newest first)
		filteredOrders.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime(),
		);

		return filteredOrders;
	},

	// Tính toán giá trị đơn hàng
	calculateOrderTotal: (items: OrderItem[]): number => {
		return items.reduce((sum, item) => sum + item.totalPrice, 0);
	},

	// Tạo order item từ product
	createOrderItem: (product: Product, quantity: number): OrderItem => {
		return {
			id: `item_${Date.now()}_${Math.random()}`,
			product,
			quantity,
			unitPrice: product.price,
			totalPrice: product.price * quantity,
		};
	},
};
