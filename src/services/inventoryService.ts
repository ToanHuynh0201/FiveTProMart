import type { ProductBatch } from "@/types";
import type {
	InventoryProduct,
	InventoryCategory,
	InventoryStats,
	StockMovement,
	ProductFilter,
} from "../types/inventory";
import { mockSupplierData } from "./supplierService";

// Mock data cho danh mục sản phẩm
const mockCategories: InventoryCategory[] = [
	{
		id: "cat_1",
		name: "Rau củ",
		description: "Rau củ tươi sạch",
		productCount: 15,
	},
	{
		id: "cat_2",
		name: "Thịt",
		description: "Thịt tươi sống",
		productCount: 3,
	},
	{
		id: "cat_3",
		name: "Hải sản",
		description: "Hải sản tươi sống",
		productCount: 2,
	},
	{
		id: "cat_4",
		name: "Sữa",
		description: "Sản phẩm từ sữa",
		productCount: 3,
	},
	{
		id: "cat_5",
		name: "Bánh",
		description: "Bánh mì và bánh ngọt",
		productCount: 2,
	},
	{
		id: "cat_6",
		name: "Gia vị",
		description: "Gia vị và đồ khô",
		productCount: 3,
	},
	{
		id: "cat_7",
		name: "Nước giải khát",
		description: "Nước uống các loại",
		productCount: 8,
	},
	{
		id: "cat_8",
		name: "Bánh kẹo",
		description: "Bánh kẹo các loại",
		productCount: 4,
	},
	{
		id: "cat_9",
		name: "Mì ăn liền",
		description: "Mì ăn liền các loại",
		productCount: 4,
	},
	{
		id: "cat_10",
		name: "Đồ đông lạnh",
		description: "Thực phẩm đông lạnh",
		productCount: 4,
	},
];

// Generate products from suppliers
const generateProductsFromSuppliers = (): InventoryProduct[] => {
	const products: InventoryProduct[] = [];
	let productCounter = 1;

	// Supplier 1: Thực phẩm Sạch Việt Nam - Rau củ
	const supplier1Products = [
		{
			code: "TP001",
			name: "Rau cải xanh hữu cơ",
			category: "Rau củ",
			unit: "kg",
			costPrice: 25000,
			price: 35000,
		},
		{
			code: "TP002",
			name: "Rau muống hữu cơ",
			category: "Rau củ",
			unit: "kg",
			costPrice: 20000,
			price: 28000,
		},
		{
			code: "TP003",
			name: "Cà chua bi",
			category: "Rau củ",
			unit: "kg",
			costPrice: 35000,
			price: 48000,
		},
		{
			code: "TP004",
			name: "Dưa leo",
			category: "Rau củ",
			unit: "kg",
			costPrice: 18000,
			price: 25000,
		},
		{
			code: "TP005",
			name: "Ớt chuông",
			category: "Rau củ",
			unit: "kg",
			costPrice: 45000,
			price: 62000,
		},
	];

	// Supplier 2: Nông sản Đà Lạt - Rau củ
	const supplier2Products = [
		{
			code: "DL001",
			name: "Cà rót Đà Lạt",
			category: "Rau củ",
			unit: "kg",
			costPrice: 30000,
			price: 42000,
		},
		{
			code: "DL002",
			name: "Súp lơ xanh",
			category: "Rau củ",
			unit: "kg",
			costPrice: 40000,
			price: 55000,
		},
		{
			code: "DL003",
			name: "Cải thảo",
			category: "Rau củ",
			unit: "kg",
			costPrice: 22000,
			price: 30000,
		},
		{
			code: "DL004",
			name: "Bí đỏ",
			category: "Rau củ",
			unit: "kg",
			costPrice: 28000,
			price: 38000,
		},
		{
			code: "DL005",
			name: "Khoai tây",
			category: "Rau củ",
			unit: "kg",
			costPrice: 25000,
			price: 34000,
		},
	];

	// Supplier 3: Thịt & Hải sản An Phát
	const supplier3Products = [
		{
			code: "TS001",
			name: "Thịt ba chỉ",
			category: "Thịt",
			unit: "kg",
			costPrice: 120000,
			price: 165000,
		},
		{
			code: "TS002",
			name: "Thịt nạc vai",
			category: "Thịt",
			unit: "kg",
			costPrice: 140000,
			price: 190000,
		},
		{
			code: "TS003",
			name: "Sườn non",
			category: "Thịt",
			unit: "kg",
			costPrice: 150000,
			price: 205000,
		},
		{
			code: "TS004",
			name: "Cá diêu hồng",
			category: "Hải sản",
			unit: "kg",
			costPrice: 180000,
			price: 245000,
		},
		{
			code: "TS005",
			name: "Tôm sú",
			category: "Hải sản",
			unit: "kg",
			costPrice: 350000,
			price: 480000,
		},
	];

	// Supplier 4: Sữa & Bánh Việt
	const supplier4Products = [
		{
			code: "SB001",
			name: "Sữa tươi không đường",
			category: "Sữa",
			unit: "hộp",
			costPrice: 35000,
			price: 48000,
		},
		{
			code: "SB002",
			name: "Sữa chua uống",
			category: "Sữa",
			unit: "chai",
			costPrice: 8000,
			price: 11000,
		},
		{
			code: "SB003",
			name: "Bánh mì sandwich",
			category: "Bánh",
			unit: "gói",
			costPrice: 15000,
			price: 20000,
		},
		{
			code: "SB004",
			name: "Bánh croissant",
			category: "Bánh",
			unit: "cái",
			costPrice: 25000,
			price: 34000,
		},
		{
			code: "SB005",
			name: "Phô mai lát",
			category: "Sữa",
			unit: "gói",
			costPrice: 45000,
			price: 62000,
		},
	];

	// Supplier 5: Gia vị & Đồ khô
	const supplier5Products = [
		{
			code: "GV001",
			name: "Nước mắm",
			category: "Gia vị",
			unit: "chai",
			costPrice: 35000,
			price: 48000,
		},
		{
			code: "GV002",
			name: "Dầu ăn",
			category: "Gia vị",
			unit: "chai",
			costPrice: 45000,
			price: 62000,
		},
		{
			code: "GV003",
			name: "Hạt nêm",
			category: "Gia vị",
			unit: "gói",
			costPrice: 25000,
			price: 34000,
		},
		{
			code: "GV004",
			name: "Mì gói",
			category: "Mì ăn liền",
			unit: "thùng",
			costPrice: 120000,
			price: 165000,
		},
		{
			code: "GV005",
			name: "Hạt điều rang",
			category: "Gia vị",
			unit: "kg",
			costPrice: 250000,
			price: 340000,
		},
	];

	// Supplier 6: Tân Hiệp Phát
	const supplier6Products = [
		{
			code: "THP001",
			name: "Trà xanh không độ",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 85000,
			price: 115000,
		},
		{
			code: "THP002",
			name: "Number 1",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 90000,
			price: 122000,
		},
		{
			code: "THP003",
			name: "Dr Thanh",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 95000,
			price: 129000,
		},
		{
			code: "THP004",
			name: "Nước suối",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 50000,
			price: 68000,
		},
	];

	// Supplier 7: Kinh Đô
	const supplier7Products = [
		{
			code: "KD001",
			name: "Bánh quy Cosy",
			category: "Bánh kẹo",
			unit: "hộp",
			costPrice: 35000,
			price: 48000,
		},
		{
			code: "KD002",
			name: "Kẹo mút Chupa Chups",
			category: "Bánh kẹo",
			unit: "gói",
			costPrice: 45000,
			price: 62000,
		},
		{
			code: "KD003",
			name: "Bánh AFC",
			category: "Bánh kẹo",
			unit: "hộp",
			costPrice: 40000,
			price: 55000,
		},
		{
			code: "KD004",
			name: "Socola Merci",
			category: "Bánh kẹo",
			unit: "hộp",
			costPrice: 150000,
			price: 205000,
		},
	];

	// Supplier 8: Coca Cola
	const supplier8Products = [
		{
			code: "CC001",
			name: "Coca Cola",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 120000,
			price: 165000,
		},
		{
			code: "CC002",
			name: "Sprite",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 115000,
			price: 157000,
		},
		{
			code: "CC003",
			name: "Fanta",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 115000,
			price: 157000,
		},
		{
			code: "CC004",
			name: "Aquarius",
			category: "Nước giải khát",
			unit: "thùng",
			costPrice: 100000,
			price: 136000,
		},
	];

	// Supplier 9: Acecook
	const supplier9Products = [
		{
			code: "AC001",
			name: "Hảo Hảo tôm chua cay",
			category: "Mì ăn liền",
			unit: "thùng",
			costPrice: 95000,
			price: 129000,
		},
		{
			code: "AC002",
			name: "Hảo Hảo sườn heo",
			category: "Mì ăn liền",
			unit: "thùng",
			costPrice: 95000,
			price: 129000,
		},
		{
			code: "AC003",
			name: "Mì Kokomi",
			category: "Mì ăn liền",
			unit: "thùng",
			costPrice: 110000,
			price: 150000,
		},
		{
			code: "AC004",
			name: "Phở ăn liền",
			category: "Mì ăn liền",
			unit: "thùng",
			costPrice: 120000,
			price: 164000,
		},
	];

	// Supplier 10: Đồ đông lạnh
	const supplier10Products = [
		{
			code: "TN001",
			name: "Gà công nghiệp đông lạnh",
			category: "Đồ đông lạnh",
			unit: "kg",
			costPrice: 85000,
			price: 116000,
		},
		{
			code: "TN002",
			name: "Cá phi lê đông lạnh",
			category: "Đồ đông lạnh",
			unit: "kg",
			costPrice: 120000,
			price: 164000,
		},
		{
			code: "TN003",
			name: "Rau củ đông lạnh",
			category: "Đồ đông lạnh",
			unit: "kg",
			costPrice: 35000,
			price: 48000,
		},
		{
			code: "TN004",
			name: "Khoai tây đông lạnh",
			category: "Đồ đông lạnh",
			unit: "kg",
			costPrice: 40000,
			price: 55000,
		},
	];

	const allSupplierProducts = [
		{
			supplierId: "1",
			supplierName: mockSupplierData[0].name,
			products: supplier1Products,
		},
		{
			supplierId: "2",
			supplierName: mockSupplierData[1].name,
			products: supplier2Products,
		},
		{
			supplierId: "3",
			supplierName: mockSupplierData[2].name,
			products: supplier3Products,
		},
		{
			supplierId: "4",
			supplierName: mockSupplierData[3].name,
			products: supplier4Products,
		},
		{
			supplierId: "5",
			supplierName: mockSupplierData[4].name,
			products: supplier5Products,
		},
		{
			supplierId: "6",
			supplierName: mockSupplierData[5].name,
			products: supplier6Products,
		},
		{
			supplierId: "7",
			supplierName: mockSupplierData[6].name,
			products: supplier7Products,
		},
		{
			supplierId: "8",
			supplierName: mockSupplierData[7]?.name || "Coca Cola",
			products: supplier8Products,
		},
		{
			supplierId: "9",
			supplierName: mockSupplierData[8]?.name || "Acecook",
			products: supplier9Products,
		},
		{
			supplierId: "10",
			supplierName: mockSupplierData[9]?.name || "Đồ đông lạnh",
			products: supplier10Products,
		},
	];

	allSupplierProducts.forEach((supplierData) => {
		supplierData.products.forEach((p) => {
			const stock = Math.floor(Math.random() * 150) + 50;
			const product: InventoryProduct = {
				id: `p${productCounter}`,
				code: p.code,
				name: p.name,
				category: p.category,
				unit: p.unit,
				price: p.price,
				costPrice: p.costPrice,
				stock: stock,
				minStock: 20,
				maxStock: 300,
				supplier: supplierData.supplierName,
				barcode: `89345678901${String(productCounter).padStart(
					2,
					"0",
				)}`,
				batches: [
					{
						id: `batch_p${productCounter}_1`,
						productId: `p${productCounter}`,
						batchNumber: `LOT${String(productCounter).padStart(
							3,
							"0",
						)}`,
						quantity: stock,
						costPrice: p.costPrice,
						expiryDate: new Date(
							Date.now() +
								Math.random() * 365 * 24 * 60 * 60 * 1000,
						),
						importDate: new Date(
							Date.now() -
								Math.random() * 30 * 24 * 60 * 60 * 1000,
						),
						supplier: supplierData.supplierName,
						status: "active",
					},
				],
				status: "active",
				createdAt: new Date(
					Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
				),
				updatedAt: new Date(
					Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
				),
			};
			products.push(product);
			productCounter++;
		});
	});

	return products;
};

// Mock data cho sản phẩm
let mockProducts: InventoryProduct[] = generateProductsFromSuppliers();

// Mock stock movements
const mockStockMovements: StockMovement[] = [
	{
		id: "sm_1",
		productId: "prod_1",
		productName: "Cà chua",
		type: "import",
		quantity: 50,
		beforeStock: 100,
		afterStock: 150,
		reason: "Nhập hàng từ nhà cung cấp",
		createdBy: "staff_1",
		createdAt: new Date("2025-11-20"),
	},
	{
		id: "sm_2",
		productId: "prod_6",
		productName: "Bơ sữa",
		type: "export",
		quantity: 20,
		beforeStock: 100,
		afterStock: 80,
		reason: "Bán hàng",
		createdBy: "staff_1",
		createdAt: new Date("2025-11-22"),
	},
];

let productIdCounter = 48;

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
				case "expiring-soon":
					filtered = filtered.filter((p) => {
						if (!p.batches || p.batches.length === 0) return false;
						const now = new Date();
						const sevenDaysLater = new Date();
						sevenDaysLater.setDate(now.getDate() + 7);
						return p.batches.some((batch) => {
							if (!batch.expiryDate || batch.status !== "active")
								return false;
							const expiryDate = new Date(batch.expiryDate);
							return (
								expiryDate > now && expiryDate <= sevenDaysLater
							);
						});
					});
					break;
				case "expired":
					filtered = filtered.filter((p) => {
						if (!p.batches || p.batches.length === 0) return false;
						const now = new Date();
						return p.batches.some((batch) => {
							if (!batch.expiryDate) return false;
							const expiryDate = new Date(batch.expiryDate);
							return expiryDate <= now;
						});
					});
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

	// Cập nhật thông tin lô hàng
	updateBatch: async (
		productId: string,
		batchId: string,
		updates: Partial<ProductBatch>,
	): Promise<InventoryProduct> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const product = mockProducts.find((p) => p.id === productId);
		if (!product) {
			throw new Error("Không tìm thấy sản phẩm");
		}

		if (!product.batches) {
			throw new Error("Sản phẩm không có lô hàng");
		}

		const batchIndex = product.batches.findIndex((b) => b.id === batchId);
		if (batchIndex === -1) {
			throw new Error("Không tìm thấy lô hàng");
		}

		const oldQuantity = product.batches[batchIndex].quantity;

		// Update batch
		product.batches[batchIndex] = {
			...product.batches[batchIndex],
			...updates,
		};

		// Recalculate product stock if quantity changed
		if (
			updates.quantity !== undefined &&
			updates.quantity !== oldQuantity
		) {
			product.stock = product.batches.reduce(
				(total, batch) => total + batch.quantity,
				0,
			);

			// Update product status based on new stock
			if (product.stock === 0) {
				product.status = "out-of-stock";
			} else if (product.status === "out-of-stock") {
				product.status = "active";
			}
		}

		// Recalculate average cost price
		const totalCost = product.batches.reduce(
			(total, batch) => total + batch.quantity * batch.costPrice,
			0,
		);
		product.costPrice = product.stock > 0 ? totalCost / product.stock : 0;

		product.updatedAt = new Date();

		return product;
	},
};
