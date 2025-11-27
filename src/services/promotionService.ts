import type {
	Promotion,
	PromotionFilter,
	PromotionStats,
	PromotionFormData,
	PromotionProduct,
} from "../types/promotion";

// Mock data cho sản phẩm (lấy từ inventory)
const mockProducts: PromotionProduct[] = [
	{
		id: "p1",
		code: "SN00000001",
		name: "Bánh snack bắp cải trộn",
		category: "Snack",
		unit: "gói",
	},
	{
		id: "p2",
		code: "SN00000002",
		name: "Bánh snack củ cải trộn",
		category: "Snack",
		unit: "gói",
	},
	{
		id: "p3",
		code: "CN00000002",
		name: "Củ cải vàng",
		category: "Rau củ",
		unit: "kg",
	},
	{
		id: "p5",
		code: "NC00000001",
		name: "Nước ngọt Coca Cola",
		category: "Nước uống",
		unit: "lon",
	},
	{
		id: "p6",
		code: "NC00000002",
		name: "Nước suối Lavie",
		category: "Nước uống",
		unit: "chai",
	},
	{
		id: "p7",
		code: "TP00000001",
		name: "Mì gói Hảo Hảo",
		category: "Thực phẩm khô",
		unit: "gói",
	},
	{
		id: "p11",
		code: "SN00000003",
		name: "Snack khoai tây Lays",
		category: "Snack",
		unit: "gói",
	},
	{
		id: "p13",
		code: "NC00000003",
		name: "Nước ngọt 7up",
		category: "Nước uống",
		unit: "lon",
	},
	{
		id: "p14",
		code: "AC00000001",
		name: "Khăn tay giấy",
		category: "Phụ kiện",
		unit: "gói",
	},
];

// Mock data cho khuyến mãi
let mockPromotions: Promotion[] = [
	{
		id: "promo_1",
		code: "KM001",
		name: "Giảm giá Coca Cola",
		description: "Giảm 20% cho sản phẩm Coca Cola",
		type: "discount",
		product: mockProducts[3],
		discountConfig: {
			percentage: 20,
		},
		startDate: new Date("2025-11-01"),
		endDate: new Date("2025-12-31"),
		status: "active",
		createdAt: new Date("2025-10-25"),
		updatedAt: new Date("2025-10-25"),
		createdBy: "admin_1",
	},
	{
		id: "promo_2",
		code: "KM002",
		name: "Mua 1 tặng 2 Coca Cola",
		description: "Mua 1 lon Coca tặng thêm 2 lon",
		type: "buy1getN",
		product: mockProducts[3],
		buy1GetNConfig: {
			quantityReceived: 2,
		},
		startDate: new Date("2025-11-15"),
		endDate: new Date("2025-11-30"),
		status: "active",
		createdAt: new Date("2025-11-10"),
		updatedAt: new Date("2025-11-10"),
		createdBy: "admin_1",
	},
	{
		id: "promo_3",
		code: "KM003",
		name: "Mua Coca tặng 7up và khăn giấy",
		description: "Mua 1 lon Coca tặng 1 lon 7up và 1 gói khăn giấy",
		type: "buyThisGetThat",
		product: mockProducts[3],
		buyThisGetThatConfig: {
			giftProducts: [
				{
					product: mockProducts[7], // 7up
					quantity: 1,
				},
				{
					product: mockProducts[8], // Khăn giấy
					quantity: 1,
				},
			],
		},
		startDate: new Date("2025-12-01"),
		endDate: new Date("2025-12-25"),
		status: "active",
		createdAt: new Date("2025-11-25"),
		updatedAt: new Date("2025-11-25"),
		createdBy: "admin_1",
	},
	{
		id: "promo_4",
		code: "KM004",
		name: "Giảm giá Snack Lays",
		description: "Giảm 15% cho Snack khoai tây Lays",
		type: "discount",
		product: mockProducts[6],
		discountConfig: {
			percentage: 15,
		},
		startDate: new Date("2025-10-01"),
		endDate: new Date("2025-10-31"),
		status: "expired",
		createdAt: new Date("2025-09-25"),
		updatedAt: new Date("2025-09-25"),
		createdBy: "admin_1",
	},
	{
		id: "promo_5",
		code: "KM005",
		name: "Mua 1 tặng 1 Mì Hảo Hảo",
		description: "Mua 1 gói mì tặng 1 gói",
		type: "buy1getN",
		product: mockProducts[5],
		buy1GetNConfig: {
			quantityReceived: 1,
		},
		startDate: new Date("2025-11-20"),
		endDate: new Date("2025-12-20"),
		status: "active",
		createdAt: new Date("2025-11-15"),
		updatedAt: new Date("2025-11-15"),
		createdBy: "admin_1",
	},
	{
		id: "promo_6",
		code: "KM006",
		name: "Flash Sale Tết 2026",
		description: "Giảm 50% Bánh snack bắp cải",
		type: "discount",
		product: mockProducts[0],
		discountConfig: {
			percentage: 50,
		},
		startDate: new Date("2026-01-01"),
		endDate: new Date("2026-01-07"),
		status: "inactive",
		createdAt: new Date("2025-11-26"),
		updatedAt: new Date("2025-11-26"),
		createdBy: "admin_1",
	},
];

let promotionIdCounter = 7;

export const promotionService = {
	// Lấy tất cả khuyến mãi
	getAllPromotions: async (): Promise<Promotion[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		// Update statuses based on current date
		const now = new Date();
		mockPromotions = mockPromotions.map((promo) => {
			let status = promo.status;
			if (promo.endDate < now) {
				status = "expired";
			} else if (promo.startDate <= now && promo.endDate >= now) {
				status = promo.status === "inactive" ? "inactive" : "active";
			}
			return { ...promo, status };
		});
		return [...mockPromotions];
	},

	// Lấy khuyến mãi theo ID
	getPromotionById: async (id: string): Promise<Promotion | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockPromotions.find((p) => p.id === id);
	},

	// Lọc khuyến mãi
	filterPromotions: async (
		filters: PromotionFilter,
	): Promise<Promotion[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		let filtered = [...mockPromotions];

		// Tìm kiếm theo tên, mã KM, tên sản phẩm
		if (filters.searchQuery && filters.searchQuery.trim()) {
			const query = filters.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.code.toLowerCase().includes(query) ||
					p.product.name.toLowerCase().includes(query) ||
					p.product.code.toLowerCase().includes(query),
			);
		}

		// Lọc theo loại khuyến mãi
		if (filters.type && filters.type !== "all") {
			filtered = filtered.filter((p) => p.type === filters.type);
		}

		// Lọc theo trạng thái
		if (filters.status && filters.status !== "all") {
			filtered = filtered.filter((p) => p.status === filters.status);
		}

		// Lọc theo khoảng thời gian
		if (filters.dateRange) {
			filtered = filtered.filter(
				(p) =>
					p.startDate <= filters.dateRange!.end &&
					p.endDate >= filters.dateRange!.start,
			);
		}

		return filtered;
	},

	// Thêm khuyến mãi mới
	addPromotion: async (promotion: PromotionFormData): Promise<Promotion> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Determine status based on dates
		const now = new Date();
		let status: "active" | "inactive" | "expired" = "inactive";
		if (promotion.endDate < now) {
			status = "expired";
		} else if (promotion.startDate <= now && promotion.endDate >= now) {
			status = "active";
		}

		const newPromotion: Promotion = {
			...promotion,
			id: `promo_${promotionIdCounter++}`,
			status,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		mockPromotions.push(newPromotion);
		return newPromotion;
	},

	// Cập nhật khuyến mãi
	updatePromotion: async (
		id: string,
		updates: Partial<Promotion>,
	): Promise<Promotion> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const index = mockPromotions.findIndex((p) => p.id === id);
		if (index === -1) {
			throw new Error("Promotion not found");
		}

		mockPromotions[index] = {
			...mockPromotions[index],
			...updates,
			updatedAt: new Date(),
		};

		return mockPromotions[index];
	},

	// Xóa khuyến mãi
	deletePromotion: async (id: string): Promise<boolean> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const index = mockPromotions.findIndex((p) => p.id === id);
		if (index === -1) {
			return false;
		}

		mockPromotions.splice(index, 1);
		return true;
	},

	// Lấy thống kê khuyến mãi
	getStats: async (): Promise<PromotionStats> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const now = new Date();
		const totalPromotions = mockPromotions.length;
		const activePromotions = mockPromotions.filter(
			(p) => p.status === "active",
		).length;
		const expiredPromotions = mockPromotions.filter(
			(p) => p.status === "expired",
		).length;
		const upcomingPromotions = mockPromotions.filter(
			(p) => p.startDate > now,
		).length;

		return {
			totalPromotions,
			activePromotions,
			expiredPromotions,
			upcomingPromotions,
		};
	},

	// Lấy danh sách sản phẩm có thể áp dụng khuyến mãi
	getAvailableProducts: async (): Promise<PromotionProduct[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return [...mockProducts];
	},

	// Tìm kiếm sản phẩm
	searchProducts: async (query: string): Promise<PromotionProduct[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		if (!query || !query.trim()) {
			return [...mockProducts];
		}

		const searchQuery = query.toLowerCase();
		return mockProducts.filter(
			(p) =>
				p.name.toLowerCase().includes(searchQuery) ||
				p.code.toLowerCase().includes(searchQuery),
		);
	},

	// Tạo mã khuyến mãi tự động
	generatePromotionCode: (): string => {
		const maxCode = mockPromotions
			.map((p) => parseInt(p.code.substring(2)))
			.reduce((max, num) => Math.max(max, num), 0);

		const nextNumber = maxCode + 1;
		return `KM${String(nextNumber).padStart(3, "0")}`;
	},

	// Kiểm tra khuyến mãi có đang áp dụng cho sản phẩm không
	getActivePromotionForProduct: async (
		productId: string,
	): Promise<Promotion | null> => {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const now = new Date();
		const activePromotions = mockPromotions.filter(
			(p) =>
				p.product.id === productId &&
				p.status === "active" &&
				p.startDate <= now &&
				p.endDate >= now,
		);

		return activePromotions.length > 0 ? activePromotions[0] : null;
	},
};
