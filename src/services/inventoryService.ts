import type {
	InventoryProduct,
	InventoryCategory,
	InventoryStats,
	StockMovement,
	ProductFilter,
} from "../types/inventory";

// Mock data cho danh mục sản phẩm
const mockCategories: InventoryCategory[] = [
	{
		id: "cat_1",
		name: "Snack",
		description: "Bánh snack các loại",
		productCount: 15,
	},
	{
		id: "cat_2",
		name: "Rau củ",
		description: "Rau củ tươi sạch",
		productCount: 24,
	},
	{
		id: "cat_3",
		name: "Nước uống",
		description: "Nước giải khát",
		productCount: 18,
	},
	{
		id: "cat_4",
		name: "Thực phẩm khô",
		description: "Thực phẩm khô bảo quản",
		productCount: 12,
	},
	{
		id: "cat_5",
		name: "Đồ ăn nhanh",
		description: "Đồ ăn nhanh tiện lợi",
		productCount: 8,
	},
];

// Mock data cho sản phẩm
let mockProducts: InventoryProduct[] = [
	{
		id: "p1",
		code: "SN00000001",
		name: "Bánh snack bắp cải trộn",
		category: "Snack",
		unit: "gói",
		price: 50000,
		costPrice: 35000,
		stock: 100,
		minStock: 20,
		maxStock: 300,
		supplier: "Công ty TNHH ABC",
		barcode: "8934567890123",
		batches: [
			{
				id: "batch_p1_1",
				productId: "p1",
				batchNumber: "LOT001",
				quantity: 60,
				costPrice: 35000,
				expiryDate: new Date("2025-12-31"),
				importDate: new Date("2025-10-01"),
				supplier: "Công ty TNHH ABC",
				status: "active",
			},
			{
				id: "batch_p1_2",
				productId: "p1",
				batchNumber: "LOT002",
				quantity: 40,
				costPrice: 35000,
				expiryDate: new Date("2026-01-15"),
				importDate: new Date("2025-11-10"),
				supplier: "Công ty TNHH ABC",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2025-11-20"),
	},
	{
		id: "p2",
		code: "SN00000002",
		name: "Bánh snack củ cải trộn",
		category: "Snack",
		unit: "gói",
		price: 80000,
		costPrice: 55000,
		stock: 50,
		minStock: 15,
		maxStock: 200,
		supplier: "Công ty TNHH ABC",
		barcode: "8934567890124",
		batches: [
			{
				id: "batch_p2_1",
				productId: "p2",
				batchNumber: "LOT003",
				quantity: 50,
				costPrice: 55000,
				expiryDate: new Date("2025-11-28"), // Sắp hết hạn
				importDate: new Date("2025-09-15"),
				supplier: "Công ty TNHH ABC",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2025-11-20"),
	},
	{
		id: "p3",
		code: "CN00000002",
		name: "Củ cải vàng",
		category: "Rau củ",
		unit: "kg",
		price: 40000,
		costPrice: 25000,
		stock: 200,
		minStock: 30,
		maxStock: 500,
		supplier: "Nông trại XYZ",
		batches: [
			{
				id: "batch_p3_1",
				productId: "p3",
				batchNumber: "LOT004",
				quantity: 120,
				costPrice: 25000,
				expiryDate: new Date("2025-12-05"),
				importDate: new Date("2025-11-15"),
				supplier: "Nông trại XYZ",
				status: "active",
			},
			{
				id: "batch_p3_2",
				productId: "p3",
				batchNumber: "LOT005",
				quantity: 80,
				costPrice: 25000,
				expiryDate: new Date("2025-12-20"),
				importDate: new Date("2025-11-22"),
				supplier: "Nông trại XYZ",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-02-10"),
		updatedAt: new Date("2025-11-22"),
	},
	{
		id: "p4",
		code: "CN00000004",
		name: "Củ cải xanh",
		category: "Rau củ",
		unit: "kg",
		price: 40000,
		costPrice: 26000,
		stock: 150,
		minStock: 30,
		maxStock: 400,
		supplier: "Nông trại XYZ",
		batches: [
			{
				id: "batch_p4_1",
				productId: "p4",
				batchNumber: "LOT006",
				quantity: 150,
				costPrice: 26000,
				expiryDate: new Date("2025-12-10"),
				importDate: new Date("2025-11-18"),
				supplier: "Nông trại XYZ",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-02-10"),
		updatedAt: new Date("2025-11-23"),
	},
	{
		id: "p5",
		code: "NC00000001",
		name: "Nước ngọt Coca Cola",
		category: "Nước uống",
		unit: "lon",
		price: 12000,
		costPrice: 8000,
		stock: 300,
		minStock: 50,
		maxStock: 1000,
		supplier: "Công ty Coca Cola VN",
		barcode: "8934567890125",
		batches: [
			{
				id: "batch_p5_1",
				productId: "p5",
				batchNumber: "LOT007",
				quantity: 100,
				costPrice: 8000,
				expiryDate: new Date("2025-11-29"), // Sắp hết hạn
				importDate: new Date("2025-05-15"),
				supplier: "Công ty Coca Cola VN",
				status: "active",
			},
			{
				id: "batch_p5_2",
				productId: "p5",
				batchNumber: "LOT008",
				quantity: 200,
				costPrice: 8000,
				expiryDate: new Date("2025-12-25"),
				importDate: new Date("2025-10-20"),
				supplier: "Công ty Coca Cola VN",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-03-01"),
		updatedAt: new Date("2025-11-24"),
	},
	{
		id: "p6",
		code: "NC00000002",
		name: "Nước suối Lavie",
		category: "Nước uống",
		unit: "chai",
		price: 5000,
		costPrice: 3000,
		stock: 500,
		minStock: 100,
		maxStock: 1500,
		supplier: "Công ty Lavie",
		barcode: "8934567890126",
		batches: [
			{
				id: "batch_p6_1",
				productId: "p6",
				batchNumber: "LOT009",
				quantity: 500,
				costPrice: 3000,
				expiryDate: new Date("2026-08-20"),
				importDate: new Date("2025-11-01"),
				supplier: "Công ty Lavie",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-03-01"),
		updatedAt: new Date("2025-11-24"),
	},
	{
		id: "p7",
		code: "TP00000001",
		name: "Mì gói Hảo Hảo",
		category: "Thực phẩm khô",
		unit: "gói",
		price: 4000,
		costPrice: 2500,
		stock: 18,
		minStock: 50,
		maxStock: 800,
		supplier: "Acecook Việt Nam",
		barcode: "8934567890127",
		batches: [
			{
				id: "batch_p7_1",
				productId: "p7",
				batchNumber: "LOT010",
				quantity: 18,
				costPrice: 2500,
				expiryDate: new Date("2026-03-10"),
				importDate: new Date("2025-10-15"),
				supplier: "Acecook Việt Nam",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-04-05"),
		updatedAt: new Date("2025-11-23"),
	},
	{
		id: "p8",
		code: "TP00000002",
		name: "Mì ly Kokomi",
		category: "Thực phẩm khô",
		unit: "ly",
		price: 7000,
		costPrice: 5000,
		stock: 180,
		minStock: 40,
		maxStock: 600,
		supplier: "Acecook Việt Nam",
		barcode: "8934567890128",
		batches: [
			{
				id: "batch_p8_1",
				productId: "p8",
				batchNumber: "LOT011",
				quantity: 180,
				costPrice: 5000,
				expiryDate: new Date("2026-04-25"),
				importDate: new Date("2025-10-20"),
				supplier: "Acecook Việt Nam",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-04-05"),
		updatedAt: new Date("2025-11-23"),
	},
	{
		id: "p9",
		code: "DA00000001",
		name: "Hamburger bò",
		category: "Đồ ăn nhanh",
		unit: "cái",
		price: 35000,
		costPrice: 20000,
		stock: 0,
		minStock: 10,
		maxStock: 100,
		supplier: "Nhà cung cấp thực phẩm DEF",
		batches: [],
		status: "out-of-stock",
		createdAt: new Date("2024-05-15"),
		updatedAt: new Date("2025-11-24"),
	},
	{
		id: "p10",
		code: "DA00000002",
		name: "Gà rán KFC",
		category: "Đồ ăn nhanh",
		unit: "phần",
		price: 45000,
		costPrice: 28000,
		stock: 8,
		minStock: 15,
		maxStock: 80,
		supplier: "Nhà cung cấp thực phẩm DEF",
		batches: [
			{
				id: "batch_p10_1",
				productId: "p10",
				batchNumber: "LOT012",
				quantity: 8,
				costPrice: 28000,
				expiryDate: new Date("2025-11-29"),
				importDate: new Date("2025-11-22"),
				supplier: "Nhà cung cấp thực phẩm DEF",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-05-15"),
		updatedAt: new Date("2025-11-24"),
	},
	{
		id: "p11",
		code: "SN00000003",
		name: "Snack khoai tây Lays",
		category: "Snack",
		unit: "gói",
		price: 25000,
		costPrice: 18000,
		stock: 95,
		minStock: 25,
		maxStock: 300,
		supplier: "Frito-Lay",
		barcode: "8934567890129",
		batches: [
			{
				id: "batch_p11_1",
				productId: "p11",
				batchNumber: "LOT013",
				quantity: 95,
				costPrice: 18000,
				expiryDate: new Date("2026-01-30"),
				importDate: new Date("2025-11-01"),
				supplier: "Frito-Lay",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-06-01"),
		updatedAt: new Date("2025-11-22"),
	},
	{
		id: "p12",
		code: "CN00000005",
		name: "Cà rốt",
		category: "Rau củ",
		unit: "kg",
		price: 35000,
		costPrice: 22000,
		stock: 12,
		minStock: 25,
		maxStock: 350,
		supplier: "Nông trại XYZ",
		batches: [
			{
				id: "batch_p12_1",
				productId: "p12",
				batchNumber: "LOT014",
				quantity: 12,
				costPrice: 22000,
				expiryDate: new Date("2025-12-01"),
				importDate: new Date("2025-11-20"),
				supplier: "Nông trại XYZ",
				status: "active",
			},
		],
		status: "active",
		createdAt: new Date("2024-02-20"),
		updatedAt: new Date("2025-11-24"),
	},
];

// Mock stock movements
const mockStockMovements: StockMovement[] = [
	{
		id: "sm_1",
		productId: "p1",
		productName: "Bánh snack bắp cải trộn",
		type: "import",
		quantity: 50,
		beforeStock: 50,
		afterStock: 100,
		reason: "Nhập hàng từ nhà cung cấp",
		createdBy: "staff_1",
		createdAt: new Date("2025-11-20"),
	},
	{
		id: "sm_2",
		productId: "p3",
		productName: "Củ cải vàng",
		type: "export",
		quantity: 30,
		beforeStock: 230,
		afterStock: 200,
		reason: "Bán hàng",
		createdBy: "staff_1",
		createdAt: new Date("2025-11-22"),
	},
];

let productIdCounter = 13;

export const inventoryService = {
	// Lấy tất cả sản phẩm
	getAllProducts: async (): Promise<InventoryProduct[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		return [...mockProducts];
	},

	// Lấy sản phẩm theo ID
	getProductById: async (
		id: string,
	): Promise<InventoryProduct | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockProducts.find((p) => p.id === id);
	},

	// Tìm kiếm và lọc sản phẩm
	filterProducts: async (
		filters: ProductFilter,
	): Promise<InventoryProduct[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		let filtered = [...mockProducts];

		// Tìm kiếm theo tên hoặc mã
		if (filters.searchQuery && filters.searchQuery.trim()) {
			const query = filters.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.code.toLowerCase().includes(query) ||
					p.barcode?.toLowerCase().includes(query),
			);
		}

		// Lọc theo danh mục
		if (filters.category && filters.category !== "all") {
			filtered = filtered.filter((p) => p.category === filters.category);
		}

		// Lọc theo trạng thái
		if (filters.status && filters.status !== "all") {
			filtered = filtered.filter((p) => p.status === filters.status);
		}

		// Lọc theo mức tồn kho
		if (filters.stockLevel && filters.stockLevel !== "all") {
			switch (filters.stockLevel) {
				case "low":
					filtered = filtered.filter(
						(p) => p.stock > 0 && p.stock <= p.minStock,
					);
					break;
				case "out":
					filtered = filtered.filter((p) => p.stock === 0);
					break;
				case "normal":
					filtered = filtered.filter((p) => p.stock > p.minStock);
					break;
			}
		}

		return filtered;
	},

	// Thêm sản phẩm mới
	addProduct: async (
		product: Omit<InventoryProduct, "id" | "createdAt" | "updatedAt">,
	): Promise<InventoryProduct> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const newProduct: InventoryProduct = {
			...product,
			id: `p${productIdCounter++}`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockProducts.push(newProduct);
		return newProduct;
	},

	// Cập nhật sản phẩm
	updateProduct: async (
		id: string,
		updates: Partial<InventoryProduct>,
	): Promise<InventoryProduct> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const index = mockProducts.findIndex((p) => p.id === id);
		if (index === -1) {
			throw new Error("Product not found");
		}

		mockProducts[index] = {
			...mockProducts[index],
			...updates,
			updatedAt: new Date(),
		};

		return mockProducts[index];
	},

	// Xóa sản phẩm
	deleteProduct: async (id: string): Promise<boolean> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const index = mockProducts.findIndex((p) => p.id === id);
		if (index === -1) {
			return false;
		}

		mockProducts.splice(index, 1);
		return true;
	},

	// Cập nhật số lượng tồn kho
	updateStock: async (
		productId: string,
		quantity: number,
		type: "import" | "export" | "adjustment",
		reason?: string,
	): Promise<InventoryProduct> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const product = mockProducts.find((p) => p.id === productId);
		if (!product) {
			throw new Error("Product not found");
		}

		const beforeStock = product.stock;
		let afterStock = beforeStock;

		switch (type) {
			case "import":
				afterStock = beforeStock + quantity;
				break;
			case "export":
				afterStock = Math.max(0, beforeStock - quantity);
				break;
			case "adjustment":
				afterStock = quantity;
				break;
		}

		// Update product stock
		product.stock = afterStock;
		product.updatedAt = new Date();

		// Update status based on stock
		if (afterStock === 0) {
			product.status = "out-of-stock";
		} else if (product.status === "out-of-stock" && afterStock > 0) {
			product.status = "active";
		}

		// Record stock movement
		const movement: StockMovement = {
			id: `sm_${Date.now()}`,
			productId: product.id,
			productName: product.name,
			type,
			quantity,
			beforeStock,
			afterStock,
			reason,
			createdBy: "staff_1",
			createdAt: new Date(),
		};
		mockStockMovements.push(movement);

		return product;
	},

	// Lấy danh sách danh mục
	getCategories: async (): Promise<InventoryCategory[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return [...mockCategories];
	},

	// Lấy thống kê tồn kho
	getStats: async (): Promise<InventoryStats> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const totalProducts = mockProducts.length;
		const totalValue = mockProducts.reduce(
			(sum, p) => sum + p.stock * p.costPrice,
			0,
		);
		const lowStockProducts = mockProducts.filter(
			(p) => p.stock > 0 && p.stock <= p.minStock,
		).length;
		const outOfStockProducts = mockProducts.filter(
			(p) => p.stock === 0,
		).length;
		const activeProducts = mockProducts.filter(
			(p) => p.status === "active",
		).length;

		// Tính số lô hết hạn và sắp hết hạn
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const sevenDaysLater = new Date(today);
		sevenDaysLater.setDate(today.getDate() + 7);

		let expiredBatches = 0;
		let expiringSoonBatches = 0;

		mockProducts.forEach((product) => {
			product.batches?.forEach((batch) => {
				if (batch.expiryDate) {
					const expiryDate = new Date(batch.expiryDate);
					expiryDate.setHours(0, 0, 0, 0);

					if (expiryDate < today) {
						expiredBatches++;
					} else if (expiryDate <= sevenDaysLater) {
						expiringSoonBatches++;
					}
				}
			});
		});

		return {
			totalProducts,
			totalValue,
			lowStockProducts,
			outOfStockProducts,
			activeProducts,
			expiredBatches,
			expiringSoonBatches,
		};
	},

	// Lấy lịch sử xuất nhập kho
	getStockMovements: async (productId?: string): Promise<StockMovement[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		if (productId) {
			return mockStockMovements.filter((m) => m.productId === productId);
		}

		return [...mockStockMovements];
	},

	// Tạo mã sản phẩm tự động
	generateProductCode: (category: string): string => {
		const categoryPrefix = category.substring(0, 2).toUpperCase();
		const maxCode = mockProducts
			.filter((p) => p.code.startsWith(categoryPrefix))
			.map((p) => parseInt(p.code.substring(2)))
			.reduce((max, num) => Math.max(max, num), 0);

		const nextNumber = maxCode + 1;
		return `${categoryPrefix}${String(nextNumber).padStart(8, "0")}`;
	},
};
