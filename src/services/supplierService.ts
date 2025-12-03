import type {
	Supplier,
	SupplierDetail,
	SupplierStats,
	SupplierFilter,
	UpdateSupplierData,
} from "@/types/supplier";

// Mock supplier data
const mockSupplierData: Supplier[] = [
	{
		id: "1",
		code: "NCC001",
		name: "Công ty TNHH Thực phẩm Sạch Việt Nam",
		phone: "0281234567",
		email: "contact@thucphamsach.vn",
		address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
		taxCode: "0123456789",
		contactPerson: "Nguyễn Văn A",
		contactPhone: "0901234567",
		bankAccount: "1234567890",
		bankName: "Vietcombank",
		totalProducts: 45,
		totalPurchases: 128,
		totalValue: 350000000,
		lastPurchaseDate: new Date("2024-11-28"),
		status: "active",
		notes: "Nhà cung cấp uy tín, giao hàng đúng hạn",
		createdAt: new Date("2023-01-15"),
		updatedAt: new Date("2024-11-28"),
	},
	{
		id: "2",
		code: "NCC002",
		name: "Công ty CP Nông sản Đà Lạt",
		phone: "0263123456",
		email: "sales@nongsandalat.com",
		address: "456 Trần Phú, Phường 4, Đà Lạt, Lâm Đồng",
		taxCode: "0234567890",
		contactPerson: "Trần Thị B",
		contactPhone: "0912345678",
		bankAccount: "2345678901",
		bankName: "Techcombank",
		totalProducts: 78,
		totalPurchases: 256,
		totalValue: 580000000,
		lastPurchaseDate: new Date("2024-11-30"),
		status: "active",
		notes: "Chuyên cung cấp rau củ quả tươi",
		createdAt: new Date("2023-02-20"),
		updatedAt: new Date("2024-11-30"),
	},
	{
		id: "3",
		code: "NCC003",
		name: "Công ty TNHH Thịt & Hải sản An Phát",
		phone: "0281345678",
		email: "info@thithaisan.vn",
		address: "789 Võ Văn Kiệt, Quận 6, TP.HCM",
		taxCode: "0345678901",
		contactPerson: "Lê Văn C",
		contactPhone: "0923456789",
		bankAccount: "3456789012",
		bankName: "ACB",
		totalProducts: 35,
		totalPurchases: 89,
		totalValue: 420000000,
		lastPurchaseDate: new Date("2024-11-29"),
		status: "active",
		notes: "Thịt heo, gà tươi sống chất lượng cao",
		createdAt: new Date("2023-03-10"),
		updatedAt: new Date("2024-11-29"),
	},
	{
		id: "4",
		code: "NCC004",
		name: "Công ty CP Sữa & Bánh Việt",
		phone: "0282456789",
		email: "contact@suabanh.vn",
		address: "321 Lý Thường Kiệt, Quận 10, TP.HCM",
		taxCode: "0456789012",
		contactPerson: "Phạm Thị D",
		contactPhone: "0934567890",
		bankAccount: "4567890123",
		bankName: "VietinBank",
		totalProducts: 120,
		totalPurchases: 345,
		totalValue: 650000000,
		lastPurchaseDate: new Date("2024-11-27"),
		status: "active",
		notes: "Sữa các loại, bánh mì, bánh ngọt",
		createdAt: new Date("2023-04-05"),
		updatedAt: new Date("2024-11-27"),
	},
	{
		id: "5",
		code: "NCC005",
		name: "Công ty TNHH Gia vị & Đồ khô Hương Việt",
		phone: "0283567890",
		email: "sales@giavi.vn",
		address: "654 Hậu Giang, Quận 6, TP.HCM",
		taxCode: "0567890123",
		contactPerson: "Hoàng Văn E",
		contactPhone: "0945678901",
		bankAccount: "5678901234",
		bankName: "BIDV",
		totalProducts: 95,
		totalPurchases: 178,
		totalValue: 280000000,
		lastPurchaseDate: new Date("2024-11-26"),
		status: "active",
		notes: "Gia vị, đồ khô đóng gói",
		createdAt: new Date("2023-05-12"),
		updatedAt: new Date("2024-11-26"),
	},
	{
		id: "6",
		code: "NCC006",
		name: "Công ty CP Nước giải khát Tân Hiệp Phát",
		phone: "0284678901",
		email: "order@thp.com.vn",
		address: "100 Quốc lộ 1A, Bình Chánh, TP.HCM",
		taxCode: "0678901234",
		contactPerson: "Vũ Thị F",
		contactPhone: "0956789012",
		bankAccount: "6789012345",
		bankName: "Sacombank",
		totalProducts: 68,
		totalPurchases: 234,
		totalValue: 450000000,
		lastPurchaseDate: new Date("2024-11-25"),
		status: "active",
		notes: "Nước ngọt, nước tăng lực, trà",
		createdAt: new Date("2023-06-18"),
		updatedAt: new Date("2024-11-25"),
	},
	{
		id: "7",
		code: "NCC007",
		name: "Công ty TNHH Bánh kẹo Kinh Đô",
		phone: "0285789012",
		email: "info@kinhdo.com.vn",
		address: "234 Hoàng Văn Thụ, Tân Bình, TP.HCM",
		taxCode: "0789012345",
		contactPerson: "Đỗ Minh G",
		contactPhone: "0967890123",
		bankAccount: "7890123456",
		bankName: "MB Bank",
		totalProducts: 156,
		totalPurchases: 289,
		totalValue: 520000000,
		lastPurchaseDate: new Date("2024-11-24"),
		status: "active",
		notes: "Bánh kẹo, snack đóng gói",
		createdAt: new Date("2023-07-22"),
		updatedAt: new Date("2024-11-24"),
	},
	{
		id: "8",
		code: "NCC008",
		name: "Công ty CP Chế biến Thủy sản Minh Phú",
		phone: "0286890123",
		email: "sales@minhphu.com",
		address: "567 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
		taxCode: "0890123456",
		contactPerson: "Ngô Văn H",
		contactPhone: "0978901234",
		status: "inactive",
		notes: "Tạm ngưng hợp tác",
		createdAt: new Date("2023-08-15"),
		updatedAt: new Date("2024-10-15"),
	},
	{
		id: "9",
		code: "NCC009",
		name: "Công ty TNHH Gạo & Lương thực Nam Việt",
		phone: "0287901234",
		email: "contact@gaoluongthuc.vn",
		address: "890 Hùng Vương, Quận 5, TP.HCM",
		taxCode: "0901234567",
		contactPerson: "Bùi Thị I",
		contactPhone: "0989012345",
		bankAccount: "9012345678",
		bankName: "HDBank",
		totalProducts: 42,
		totalPurchases: 156,
		totalValue: 380000000,
		lastPurchaseDate: new Date("2024-11-28"),
		status: "active",
		notes: "Gạo các loại, bột mì, ngũ cốc",
		createdAt: new Date("2023-09-10"),
		updatedAt: new Date("2024-11-28"),
	},
	{
		id: "10",
		code: "NCC010",
		name: "Công ty CP Dầu ăn Cái Lân",
		phone: "0288012345",
		email: "info@dauancailan.vn",
		address: "432 Lê Hồng Phong, Quận 10, TP.HCM",
		taxCode: "0123456780",
		contactPerson: "Trương Văn K",
		contactPhone: "0990123456",
		bankAccount: "0123456789",
		bankName: "VPBank",
		totalProducts: 28,
		totalPurchases: 98,
		totalValue: 220000000,
		lastPurchaseDate: new Date("2024-11-23"),
		status: "active",
		notes: "Dầu ăn, nước mắm, tương ớt",
		createdAt: new Date("2023-10-05"),
		updatedAt: new Date("2024-11-23"),
	},
];

// Export mock data for other services to use
export { mockSupplierData };

class SupplierService {
	private suppliers: Supplier[] = [...mockSupplierData];

	// Get all suppliers
	async getAllSuppliers(): Promise<Supplier[]> {
		await this.delay(300);
		return [...this.suppliers];
	}

	// Get supplier by ID
	async getSupplierById(id: string): Promise<SupplierDetail | null> {
		await this.delay(200);
		const supplier = this.suppliers.find((s) => s.id === id);
		if (!supplier) return null;

		// Mock detailed data
		return {
			...supplier,
			products: this.getMockProducts(id),
			purchaseHistory: this.getMockPurchaseHistory(id),
		};
	}

	// Filter suppliers
	async filterSuppliers(filters: SupplierFilter): Promise<Supplier[]> {
		await this.delay(200);
		let filtered = [...this.suppliers];

		// Filter by search query
		if (filters.searchQuery.trim() !== "") {
			const query = filters.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(supplier) =>
					supplier.code.toLowerCase().includes(query) ||
					supplier.name.toLowerCase().includes(query) ||
					supplier.phone.includes(query) ||
					supplier.email?.toLowerCase().includes(query) ||
					supplier.contactPerson?.toLowerCase().includes(query),
			);
		}

		// Filter by status
		if (filters.status && filters.status !== "all") {
			filtered = filtered.filter(
				(supplier) => supplier.status === filters.status,
			);
		}

		return filtered;
	}

	// Add new supplier
	async addSupplier(
		supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
	): Promise<Supplier> {
		await this.delay(500);

		const newSupplier: Supplier = {
			...supplierData,
			id: `${Date.now()}`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.suppliers.push(newSupplier);
		return newSupplier;
	}

	// Update supplier
	async updateSupplier(
		id: string,
		updates: UpdateSupplierData,
	): Promise<Supplier | null> {
		await this.delay(500);

		const index = this.suppliers.findIndex((s) => s.id === id);
		if (index === -1) return null;

		this.suppliers[index] = {
			...this.suppliers[index],
			...updates,
			updatedAt: new Date(),
		};

		return this.suppliers[index];
	}

	// Delete supplier
	async deleteSupplier(id: string): Promise<boolean> {
		await this.delay(500);

		const index = this.suppliers.findIndex((s) => s.id === id);
		if (index === -1) return false;

		this.suppliers.splice(index, 1);
		return true;
	}

	// Get supplier statistics
	async getSupplierStats(): Promise<SupplierStats> {
		await this.delay(300);

		const activeSuppliers = this.suppliers.filter(
			(s) => s.status === "active",
		);
		const inactiveSuppliers = this.suppliers.filter(
			(s) => s.status === "inactive",
		);

		const totalPurchaseValue = this.suppliers.reduce(
			(sum, s) => sum + (s.totalValue || 0),
			0,
		);

		// Find top supplier by value
		const topSupplier = this.suppliers.reduce((top, current) => {
			if (!top || (current.totalValue || 0) > (top.totalValue || 0)) {
				return current;
			}
			return top;
		}, this.suppliers[0]);

		return {
			totalSuppliers: this.suppliers.length,
			activeSuppliers: activeSuppliers.length,
			inactiveSuppliers: inactiveSuppliers.length,
			totalPurchaseValue,
			topSupplier: topSupplier
				? {
						name: topSupplier.name,
						value: topSupplier.totalValue || 0,
				  }
				: undefined,
		};
	}

	// Helper method to simulate API delay
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Mock products for a supplier
	private getMockProducts(supplierId: string) {
		// Specific products for each supplier
		const supplierProducts: Record<string, any[]> = {
			"1": [
				// Thực phẩm Sạch Việt Nam
				{
					code: "TP001",
					name: "Rau cải xanh hữu cơ",
					category: "Rau củ",
					unit: "kg",
					price: 25000,
				},
				{
					code: "TP002",
					name: "Rau muống hữu cơ",
					category: "Rau củ",
					unit: "kg",
					price: 20000,
				},
				{
					code: "TP003",
					name: "Cà chua bi",
					category: "Rau củ",
					unit: "kg",
					price: 35000,
				},
				{
					code: "TP004",
					name: "Dưa leo",
					category: "Rau củ",
					unit: "kg",
					price: 18000,
				},
				{
					code: "TP005",
					name: "Ớt chuông",
					category: "Rau củ",
					unit: "kg",
					price: 45000,
				},
			],
			"2": [
				// Nông sản Đà Lạt
				{
					code: "DL001",
					name: "Cà rót Đà Lạt",
					category: "Rau củ",
					unit: "kg",
					price: 30000,
				},
				{
					code: "DL002",
					name: "Súp lơ xanh",
					category: "Rau củ",
					unit: "kg",
					price: 40000,
				},
				{
					code: "DL003",
					name: "Cải thảo",
					category: "Rau củ",
					unit: "kg",
					price: 22000,
				},
				{
					code: "DL004",
					name: "Bí đỏ",
					category: "Rau củ",
					unit: "kg",
					price: 28000,
				},
				{
					code: "DL005",
					name: "Khoai tây",
					category: "Rau củ",
					unit: "kg",
					price: 25000,
				},
				{
					code: "DL006",
					name: "Dâu tây",
					category: "Hoa quả",
					unit: "hộp",
					price: 120000,
				},
			],
			"3": [
				// Thịt & Hải sản An Phát
				{
					code: "TS001",
					name: "Thịt ba chỉ",
					category: "Thịt",
					unit: "kg",
					price: 120000,
				},
				{
					code: "TS002",
					name: "Thịt nạc vai",
					category: "Thịt",
					unit: "kg",
					price: 140000,
				},
				{
					code: "TS003",
					name: "Sườn non",
					category: "Thịt",
					unit: "kg",
					price: 150000,
				},
				{
					code: "TS004",
					name: "Cá diêu hồng",
					category: "Hải sản",
					unit: "kg",
					price: 180000,
				},
				{
					code: "TS005",
					name: "Tôm sú",
					category: "Hải sản",
					unit: "kg",
					price: 350000,
				},
			],
			"4": [
				// Sữa & Bánh Việt
				{
					code: "SB001",
					name: "Sữa tươi không đường",
					category: "Sữa",
					unit: "hộp",
					price: 35000,
				},
				{
					code: "SB002",
					name: "Sữa chua uống",
					category: "Sữa",
					unit: "chai",
					price: 8000,
				},
				{
					code: "SB003",
					name: "Bánh mì sandwich",
					category: "Bánh",
					unit: "gói",
					price: 15000,
				},
				{
					code: "SB004",
					name: "Bánh croissant",
					category: "Bánh",
					unit: "cái",
					price: 25000,
				},
				{
					code: "SB005",
					name: "Phô mai lát",
					category: "Sữa",
					unit: "gói",
					price: 45000,
				},
			],
			"5": [
				// Gia vị & Đồ khô Hương Việt
				{
					code: "GV001",
					name: "Nước mắm",
					category: "Gia vị",
					unit: "chai",
					price: 35000,
				},
				{
					code: "GV002",
					name: "Dầu ăn",
					category: "Gia vị",
					unit: "chai",
					price: 45000,
				},
				{
					code: "GV003",
					name: "Hạt nêm",
					category: "Gia vị",
					unit: "gói",
					price: 25000,
				},
				{
					code: "GV004",
					name: "Mì gói",
					category: "Đồ khô",
					unit: "thùng",
					price: 120000,
				},
				{
					code: "GV005",
					name: "Hạt điều rang",
					category: "Đồ khô",
					unit: "kg",
					price: 250000,
				},
			],
			"6": [
				// Nước giải khát Tân Hiệp Phát
				{
					code: "THP001",
					name: "Trà xanh không độ",
					category: "Nước giải khát",
					unit: "thùng",
					price: 85000,
				},
				{
					code: "THP002",
					name: "Number 1",
					category: "Nước giải khát",
					unit: "thùng",
					price: 90000,
				},
				{
					code: "THP003",
					name: "Dr Thanh",
					category: "Nước giải khát",
					unit: "thùng",
					price: 95000,
				},
				{
					code: "THP004",
					name: "Nước suối",
					category: "Nước giải khát",
					unit: "thùng",
					price: 50000,
				},
			],
			"7": [
				// Bánh kẹo Kinh Đô
				{
					code: "KD001",
					name: "Bánh quy Cosy",
					category: "Bánh kẹo",
					unit: "hộp",
					price: 35000,
				},
				{
					code: "KD002",
					name: "Kẹo mút Chupa Chups",
					category: "Bánh kẹo",
					unit: "gói",
					price: 45000,
				},
				{
					code: "KD003",
					name: "Bánh AFC",
					category: "Bánh kẹo",
					unit: "hộp",
					price: 40000,
				},
				{
					code: "KD004",
					name: "Socola Merci",
					category: "Bánh kẹo",
					unit: "hộp",
					price: 150000,
				},
			],
			"8": [
				// Đồ uống Coca Cola
				{
					code: "CC001",
					name: "Coca Cola",
					category: "Nước ngọt",
					unit: "thùng",
					price: 120000,
				},
				{
					code: "CC002",
					name: "Sprite",
					category: "Nước ngọt",
					unit: "thùng",
					price: 115000,
				},
				{
					code: "CC003",
					name: "Fanta",
					category: "Nước ngọt",
					unit: "thùng",
					price: 115000,
				},
				{
					code: "CC004",
					name: "Aquarius",
					category: "Nước ngọt",
					unit: "thùng",
					price: 100000,
				},
			],
			"9": [
				// Mì ăn liền Acecook
				{
					code: "AC001",
					name: "Hảo Hảo tôm chua cay",
					category: "Mì ăn liền",
					unit: "thùng",
					price: 95000,
				},
				{
					code: "AC002",
					name: "Hảo Hảo sườn heo",
					category: "Mì ăn liền",
					unit: "thùng",
					price: 95000,
				},
				{
					code: "AC003",
					name: "Mì Kokomi",
					category: "Mì ăn liền",
					unit: "thùng",
					price: 110000,
				},
				{
					code: "AC004",
					name: "Phở ăn liền",
					category: "Mì ăn liền",
					unit: "thùng",
					price: 120000,
				},
			],
			"10": [
				// Đồ đông lạnh Tươi Ngon
				{
					code: "TN001",
					name: "Gà công nghiệp đông lạnh",
					category: "Thịt đông lạnh",
					unit: "kg",
					price: 85000,
				},
				{
					code: "TN002",
					name: "Cá phi lê đông lạnh",
					category: "Hải sản đông lạnh",
					unit: "kg",
					price: 120000,
				},
				{
					code: "TN003",
					name: "Rau củ đông lạnh",
					category: "Rau đông lạnh",
					unit: "kg",
					price: 35000,
				},
				{
					code: "TN004",
					name: "Khoai tây đông lạnh",
					category: "Rau đông lạnh",
					unit: "kg",
					price: 40000,
				},
			],
		};

		const products = supplierProducts[supplierId] || [];

		return products.map((p, i) => ({
			id: `prod_${supplierId}_${i}`,
			productId: `p${supplierId}_${i + 1}`,
			productCode: p.code,
			productName: p.name,
			category: p.category,
			unit: p.unit,
			lastPurchasePrice: p.price,
			lastPurchaseDate: new Date(
				Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
			),
			totalQuantityPurchased: Math.floor(Math.random() * 1000) + 100,
		}));
	}

	// Mock purchase history for a supplier
	private getMockPurchaseHistory(supplierId: string) {
		const historyCount = Math.floor(Math.random() * 10) + 5;
		return Array.from({ length: historyCount }, (_, i) => ({
			id: `purchase_${supplierId}_${i}`,
			purchaseNumber: `PN-${new Date().getFullYear()}${String(
				Math.floor(Math.random() * 12) + 1,
			).padStart(2, "0")}${String(i + 1).padStart(4, "0")}`,
			date: new Date(
				Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
			),
			totalAmount: Math.floor(Math.random() * 50000000) + 5000000,
			itemCount: Math.floor(Math.random() * 20) + 5,
			status: (["ordered", "received", "cancelled"] as const)[i % 3],
		}));
	}
}

export const supplierService = new SupplierService();
