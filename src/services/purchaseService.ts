import apiService from "@/lib/api";
import type { Purchase } from "@/types";
import type { PurchaseFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const purchaseService = {
	/**
	 * Fetch purchases with server-side filtering and pagination
	 */
	async getPurchases(
		filters: PurchaseFilters,
	): Promise<ApiResponse<Purchase>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<Purchase>>(
			`/purchases?${params.toString()}`,
		);
	},

	async getPurchaseById(id: string): Promise<Purchase> {
		return apiService.get<Purchase>(`/purchases/${id}`);
	},

	async createPurchase(data: Omit<Purchase, "id">): Promise<Purchase> {
		return apiService.post<Purchase>("/purchases", data);
	},

	async updatePurchase(
		id: string,
		data: Partial<Purchase>,
	): Promise<Purchase> {
		return apiService.put<Purchase>(`/purchases/${id}`, data);
	},

	async deletePurchase(id: string): Promise<void> {
		return apiService.delete(`/purchases/${id}`);
	},

	/**
	 * Cancel a purchase order (status: "ordered" → "cancelled")
	 */
	async cancelPurchase(id: string): Promise<Purchase> {
		return apiService.put<Purchase>(`/purchases/${id}/cancel`, {});
	},

	/**
	 * Export purchases to Excel file
	 */
	async exportToExcel(purchaseIds: string[]): Promise<Blob> {
		const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/purchases/export`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ ids: purchaseIds }),
		});
		if (!response.ok) throw new Error('Export failed');
		return response.blob();
	},

	/**
	 * Generate a new purchase number
	 */
	async generatePurchaseNumber(): Promise<string> {
		try {
			const response = await apiService.get<{ data: string }>('/purchases/generate-number');
			return response.data;
		} catch {
			// Fallback: Generate client-side
			const now = new Date();
			const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
			const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
			return `PO-${dateStr}-${random}`;
		}
	},

	/**
	 * Get Excel template for import
	 */
	async getExcelTemplate(): Promise<Blob> {
		const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/purchases/template`, {
			method: 'GET',
		});
		if (!response.ok) throw new Error('Template download failed');
		return response.blob();
	},

	/**
	 * Import purchases from Excel file
	 */
	async importFromExcel(file: File): Promise<{ success: boolean; count: number; errors: string[] }> {
		const formData = new FormData();
		formData.append('file', file);
		return apiService.post('/purchases/import', formData);
	},
};
