import type { Product, SalesOrder, OrderItem } from "../types/sales";

// Mock data cho sản phẩm
const mockProducts: Product[] = [
	{
		id: "p1",
		code: "SN00000001",
		name: "Bánh snack bắp cải trộn",
		price: 50000,
		stock: 100,
		category: "Snack",
	},
	{
		id: "p2",
		code: "SN00000002",
		name: "Bánh snack củ cải trộn",
		price: 80000,
		stock: 50,
		category: "Snack",
	},
	{
		id: "p3",
		code: "CN00000002",
		name: "Củ cải vàng",
		price: 40000,
		stock: 200,
		category: "Rau củ",
	},
	{
		id: "p4",
		code: "CN00000004",
		name: "Củ cải xanh",
		price: 40000,
		stock: 150,
		category: "Rau củ",
		promotion: "mua 2 tặng cây đấm lưng",
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

// Mock orders in memory
let orders: SalesOrder[] = [];
let orderCounter = 12345678;

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
