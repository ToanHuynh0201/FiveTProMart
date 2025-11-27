import type {
	Purchase,
	PurchaseItem,
	PurchaseStats,
	PurchaseFilter,
	Supplier,
	ExcelPurchaseItem,
} from "../types/purchase";
import * as XLSX from "xlsx";

// Mock suppliers
const mockSuppliers: Supplier[] = [
	{
		id: "sup_1",
		name: "Công ty TNHH ABC",
		phone: "0901234567",
		email: "abc@example.com",
		address: "123 Đường ABC, Quận 1, TP.HCM",
	},
	{
		id: "sup_2",
		name: "Nông trại XYZ",
		phone: "0907654321",
		email: "xyz@example.com",
		address: "456 Đường XYZ, Quận 2, TP.HCM",
	},
	{
		id: "sup_3",
		name: "Công ty Coca Cola VN",
		phone: "0909876543",
		email: "cocacola@example.com",
		address: "789 Đường Coca, Quận 3, TP.HCM",
	},
	{
		id: "sup_4",
		name: "Acecook Việt Nam",
		phone: "0903456789",
		email: "acecook@example.com",
		address: "321 Đường Acecook, Quận 4, TP.HCM",
	},
];

// Mock purchases
let mockPurchases: Purchase[] = [
	{
		id: "pur_1",
		purchaseNumber: "PN-20251120-0001",
		supplier: mockSuppliers[0],
		items: [
			{
				id: "pi_1",
				productCode: "SN00000001",
				productName: "Bánh snack bắp cải trộn",
				category: "Snack",
				unit: "gói",
				quantity: 50,
				unitPrice: 35000,
				totalPrice: 1750000,
			},
			{
				id: "pi_2",
				productCode: "SN00000002",
				productName: "Bánh snack củ cải trộn",
				category: "Snack",
				unit: "gói",
				quantity: 30,
				unitPrice: 55000,
				totalPrice: 1650000,
			},
		],
		subtotal: 3400000,
		tax: 340000,
		shippingFee: 100000,
		discount: 0,
		total: 3840000,
		paymentStatus: "paid",
		paidAmount: 3840000,
		notes: "Nhập hàng snack tháng 11",
		staff: {
			id: "staff_1",
			name: "Nguyễn Văn A",
		},
		warehouseLocation: "Kho A",
		expectedDeliveryDate: new Date("2025-11-25"),
		actualDeliveryDate: new Date("2025-11-20"),
		status: "received",
		createdAt: new Date("2025-11-15"),
		updatedAt: new Date("2025-11-20"),
	},
	{
		id: "pur_2",
		purchaseNumber: "PN-20251122-0002",
		supplier: mockSuppliers[1],
		items: [
			{
				id: "pi_3",
				productCode: "CN00000002",
				productName: "Củ cải vàng",
				category: "Rau củ",
				unit: "kg",
				quantity: 100,
				unitPrice: 25000,
				totalPrice: 2500000,
			},
			{
				id: "pi_4",
				productCode: "CN00000004",
				productName: "Củ cải xanh",
				category: "Rau củ",
				unit: "kg",
				quantity: 80,
				unitPrice: 26000,
				totalPrice: 2080000,
			},
		],
		subtotal: 4580000,
		tax: 0,
		shippingFee: 50000,
		discount: 100000,
		total: 4530000,
		paymentStatus: "unpaid",
		paidAmount: 0,
		notes: "Rau củ tươi sạch",
		staff: {
			id: "staff_1",
			name: "Nguyễn Văn A",
		},
		warehouseLocation: "Kho B",
		expectedDeliveryDate: new Date("2025-11-28"),
		status: "ordered",
		createdAt: new Date("2025-11-22"),
		updatedAt: new Date("2025-11-22"),
	},
	{
		id: "pur_3",
		purchaseNumber: "PN-20251123-0003",
		supplier: mockSuppliers[2],
		items: [
			{
				id: "pi_5",
				productCode: "NC00000001",
				productName: "Nước ngọt Coca Cola",
				category: "Nước uống",
				unit: "lon",
				quantity: 200,
				unitPrice: 8000,
				totalPrice: 1600000,
			},
		],
		subtotal: 1600000,
		tax: 160000,
		shippingFee: 80000,
		discount: 0,
		total: 1840000,
		paymentStatus: "unpaid",
		paidAmount: 0,
		staff: {
			id: "staff_2",
			name: "Trần Thị B",
		},
		warehouseLocation: "Kho A",
		expectedDeliveryDate: new Date("2025-11-30"),
		status: "ordered",
		createdAt: new Date("2025-11-23"),
		updatedAt: new Date("2025-11-23"),
	},
];

let purchaseIdCounter = 4;

export const purchaseService = {
	// Lấy tất cả phiếu nhập
	getAllPurchases: async (): Promise<Purchase[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		return [...mockPurchases].sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);
	},

	// Lấy phiếu nhập theo ID
	getPurchaseById: async (id: string): Promise<Purchase | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockPurchases.find((p) => p.id === id);
	},

	// Lọc phiếu nhập
	filterPurchases: async (filters: PurchaseFilter): Promise<Purchase[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		let filtered = [...mockPurchases];

		// Tìm kiếm
		if (filters.searchQuery && filters.searchQuery.trim()) {
			const query = filters.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.purchaseNumber.toLowerCase().includes(query) ||
					p.supplier.name.toLowerCase().includes(query),
			);
		}

		// Lọc theo trạng thái
		if (filters.status && filters.status !== "all") {
			filtered = filtered.filter((p) => p.status === filters.status);
		}

		// Lọc theo trạng thái thanh toán
		if (filters.paymentStatus && filters.paymentStatus !== "all") {
			filtered = filtered.filter(
				(p) => p.paymentStatus === filters.paymentStatus,
			);
		}

		// Lọc theo nhà cung cấp
		if (filters.supplierId && filters.supplierId !== "all") {
			filtered = filtered.filter(
				(p) => p.supplier.id === filters.supplierId,
			);
		}

		// Lọc theo ngày
		if (filters.dateFrom) {
			filtered = filtered.filter((p) => p.createdAt >= filters.dateFrom!);
		}
		if (filters.dateTo) {
			filtered = filtered.filter((p) => p.createdAt <= filters.dateTo!);
		}

		return filtered.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);
	},

	// Tạo phiếu nhập mới
	createPurchase: async (
		purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt">,
	): Promise<Purchase> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const newPurchase: Purchase = {
			...purchase,
			id: `pur_${purchaseIdCounter++}`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockPurchases.push(newPurchase);
		return newPurchase;
	},

	// Cập nhật phiếu nhập
	updatePurchase: async (
		id: string,
		updates: Partial<Purchase>,
	): Promise<Purchase> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const index = mockPurchases.findIndex((p) => p.id === id);
		if (index === -1) {
			throw new Error("Purchase not found");
		}

		mockPurchases[index] = {
			...mockPurchases[index],
			...updates,
			updatedAt: new Date(),
		};

		return mockPurchases[index];
	},

	// Xóa phiếu nhập
	deletePurchase: async (id: string): Promise<boolean> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const index = mockPurchases.findIndex((p) => p.id === id);
		if (index === -1) {
			return false;
		}

		mockPurchases.splice(index, 1);
		return true;
	},

	// Lấy thống kê
	getStats: async (): Promise<PurchaseStats> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const totalPurchases = mockPurchases.length;
		const totalAmount = mockPurchases.reduce((sum, p) => sum + p.total, 0);
		const pendingOrders = mockPurchases.filter(
			(p) => p.status === "ordered",
		).length;
		const totalItems = mockPurchases.reduce(
			(sum, p) => sum + p.items.length,
			0,
		);

		return {
			totalPurchases,
			totalAmount,
			pendingOrders,
			totalItems,
		};
	},

	// Lấy danh sách nhà cung cấp
	getSuppliers: async (): Promise<Supplier[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return [...mockSuppliers];
	},

	// Tạo mã phiếu nhập tự động
	generatePurchaseNumber: (): string => {
		const today = new Date();
		const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

		const todayPurchases = mockPurchases.filter((p) =>
			p.purchaseNumber.includes(dateStr),
		);
		const nextNumber = todayPurchases.length + 1;

		return `PN-${dateStr}-${String(nextNumber).padStart(4, "0")}`;
	},

	// Import từ Excel
	importFromExcel: async (file: File): Promise<PurchaseItem[]> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const data = e.target?.result;
					const workbook = XLSX.read(data, { type: "binary" });
					const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
					const jsonData: ExcelPurchaseItem[] =
						XLSX.utils.sheet_to_json(firstSheet);

					// Chuyển đổi dữ liệu Excel thành PurchaseItem
					const items: PurchaseItem[] = jsonData.map((row, index) => {
						const quantity = Number(row["Số lượng"]) || 0;
						const unitPrice = Number(row["Đơn giá"]) || 0;

						return {
							id: `temp_${index + 1}`,
							productCode: String(row["Mã sản phẩm"] || ""),
							productName: String(row["Tên sản phẩm"] || ""),
							category: row["Nhóm hàng"],
							unit: String(row["Đơn vị tính"] || ""),
							quantity,
							unitPrice,
							totalPrice: quantity * unitPrice,
							expiryDate: row["Hạn sử dụng"]
								? parseExcelDate(row["Hạn sử dụng"])
								: undefined,
						};
					});

					resolve(items);
				} catch (error) {
					reject(
						new Error(
							"Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.",
						),
					);
				}
			};

			reader.onerror = () => {
				reject(new Error("Lỗi khi đọc file"));
			};

			reader.readAsBinaryString(file);
		});
	},

	// Export mẫu Excel
	exportExcelTemplate: () => {
		const template: ExcelPurchaseItem[] = [
			{
				"Mã sản phẩm": "SN00000001",
				"Tên sản phẩm": "Bánh snack bắp cải trộn",
				"Nhóm hàng": "Snack",
				"Đơn vị tính": "gói",
				"Số lượng": 50,
				"Đơn giá": 35000,
				"Hạn sử dụng": "31/12/2025",
			},
			{
				"Mã sản phẩm": "CN00000002",
				"Tên sản phẩm": "Củ cải vàng",
				"Nhóm hàng": "Rau củ",
				"Đơn vị tính": "kg",
				"Số lượng": 100,
				"Đơn giá": 25000,
				"Hạn sử dụng": "",
			},
		];

		const ws = XLSX.utils.json_to_sheet(template);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Mẫu nhập hàng");

		// Tự động điều chỉnh độ rộng cột
		const colWidths = [
			{ wch: 15 }, // Mã sản phẩm
			{ wch: 30 }, // Tên sản phẩm
			{ wch: 15 }, // Nhóm hàng
			{ wch: 12 }, // Đơn vị tính
			{ wch: 12 }, // Số lượng
			{ wch: 12 }, // Đơn giá
			{ wch: 15 }, // Hạn sử dụng
		];
		ws["!cols"] = colWidths;

		XLSX.writeFile(wb, "Mau_Nhap_Hang.xlsx");
	},

	// Export danh sách phiếu nhập ra Excel
	exportPurchasesToExcel: (purchases: Purchase[]) => {
		const data = purchases.flatMap((purchase) =>
			purchase.items.map((item) => ({
				"Mã phiếu nhập": purchase.purchaseNumber,
				"Nhà cung cấp": purchase.supplier.name,
				"Mã sản phẩm": item.productCode,
				"Tên sản phẩm": item.productName,
				"Nhóm hàng": item.category || "",
				"Đơn vị tính": item.unit,
				"Số lượng": item.quantity,
				"Đơn giá": item.unitPrice,
				"Thành tiền": item.totalPrice,
				"Trạng thái": getStatusText(purchase.status),
				"Thanh toán": getPaymentStatusText(purchase.paymentStatus),
				"Ngày tạo": purchase.createdAt.toLocaleDateString("vi-VN"),
			})),
		);

		const ws = XLSX.utils.json_to_sheet(data);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhập hàng");

		// Tự động điều chỉnh độ rộng cột
		const colWidths = [
			{ wch: 18 }, // Mã phiếu nhập
			{ wch: 25 }, // Nhà cung cấp
			{ wch: 15 }, // Mã sản phẩm
			{ wch: 30 }, // Tên sản phẩm
			{ wch: 15 }, // Nhóm hàng
			{ wch: 12 }, // Đơn vị tính
			{ wch: 10 }, // Số lượng
			{ wch: 12 }, // Đơn giá
			{ wch: 15 }, // Thành tiền
			{ wch: 12 }, // Trạng thái
			{ wch: 12 }, // Thanh toán
			{ wch: 12 }, // Ngày tạo
		];
		ws["!cols"] = colWidths;

		const fileName = `Danh_Sach_Nhap_Hang_${new Date()
			.toISOString()
			.slice(0, 10)}.xlsx`;
		XLSX.writeFile(wb, fileName);
	},
};

// Helper functions
function parseExcelDate(dateStr: string): Date | undefined {
	if (!dateStr) return undefined;

	try {
		// Định dạng DD/MM/YYYY
		const parts = dateStr.split("/");
		if (parts.length === 3) {
			const day = parseInt(parts[0]);
			const month = parseInt(parts[1]) - 1;
			const year = parseInt(parts[2]);
			return new Date(year, month, day);
		}
	} catch (error) {
		console.warn("Error parsing date:", error);
	}

	return undefined;
}

function getStatusText(status: Purchase["status"]): string {
	const statusMap = {
		draft: "Nháp",
		ordered: "Đã đặt",
		received: "Đã nhận",
		cancelled: "Đã hủy",
	};
	return statusMap[status] || status;
}

function getPaymentStatusText(
	paymentStatus: Purchase["paymentStatus"],
): string {
	const statusMap = {
		unpaid: "Chưa trả",
		paid: "Đã trả",
	};
	return statusMap[paymentStatus] || paymentStatus;
}
