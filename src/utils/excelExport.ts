import * as XLSX from "xlsx";
import type { PurchaseDetail } from "@/types/purchase";

/**
 * Xuất thông tin đơn nhập hàng ra file Excel
 * @param purchase - Chi tiết đơn nhập hàng
 */
export const exportPurchaseToExcel = (purchase: PurchaseDetail) => {
	// Tạo workbook mới
	const workbook = XLSX.utils.book_new();

	// Format tiền tệ
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN").format(amount);
	};

	// Xác định trạng thái đơn hàng
	const statusLabel =
		purchase.status === "Draft"
			? "Nháp"
			: purchase.status === "Completed"
				? "Hoàn thành"
				: "Đã hủy";

	// Tạo header thông tin đơn hàng
	const headerData = [
		["PHIẾU NHẬP HÀNG"],
		[""],
		["Mã đơn:", purchase.poCode],
		["Trạng thái:", statusLabel],
		["Ngày tạo:", purchase.purchaseDate],
	];

	// Thêm ngày kiểm nhận nếu đơn đã hoàn thành
	if (purchase.checkDate) {
		headerData.push(["Ngày kiểm nhận:", purchase.checkDate]);
	}

	headerData.push(
		[""],
		["THÔNG TIN NHÀ CUNG CẤP"],
		["Tên nhà cung cấp:", purchase.supplier.supplierName],
		["Số điện thoại:", purchase.supplier.phone || "-"],
		["Người đại diện:", purchase.supplier.representName || "-"],
		["SĐT đại diện:", purchase.supplier.representPhoneNumber || "-"],
		[""],
		["THÔNG TIN NHÂN VIÊN"],
		["Người tạo đơn:", purchase.staffIdCreated],
	);

	// Thêm người kiểm hàng nếu có
	if (purchase.staffIdChecked) {
		headerData.push(["Người kiểm hàng:", purchase.staffIdChecked]);
	}

	headerData.push([""]);

	// Thêm ghi chú nếu có
	if (purchase.notes) {
		headerData.push(["Ghi chú:", purchase.notes]);
		headerData.push([""]);
	}

	// Tạo header bảng sản phẩm
	const productTableHeader = [["DANH SÁCH SẢN PHẨM"], [""]];

	// Header cột khác nhau cho đơn nháp và đơn hoàn thành
	if (purchase.status === "Draft") {
		productTableHeader.push([
			"STT",
			"Mã sản phẩm",
			"Tên sản phẩm",
			"Số lượng đặt",
			"Giá nhập (VND)",
			"Thành tiền (VND)",
		]);
	} else {
		productTableHeader.push([
			"STT",
			"Mã sản phẩm",
			"Tên sản phẩm",
			"Số lượng đặt",
			"Số lượng nhận",
			"Giá nhập (VND)",
			"Thành tiền (VND)",
		]);
	}

	// Tạo dữ liệu sản phẩm
	const productData = purchase.items.map((item, index) => {
		if (purchase.status === "Draft") {
			return [
				index + 1,
				item.productId,
				item.productName,
				item.quantityOrdered,
				formatCurrency(item.importPrice),
				formatCurrency(item.subTotal),
			];
		} else {
			return [
				index + 1,
				item.productId,
				item.productName,
				item.quantityOrdered,
				item.quantityReceived,
				formatCurrency(item.importPrice),
				formatCurrency(item.subTotal),
			];
		}
	});

	// Tạo tổng cộng (số cột khác nhau cho đơn nháp và hoàn thành)
	const totalRow =
		purchase.status === "Draft"
			? [
					"",
					"",
					"",
					"",
					"TỔNG CỘNG:",
					formatCurrency(purchase.totalAmount),
				]
			: [
					"",
					"",
					"",
					"",
					"",
					"TỔNG CỘNG:",
					formatCurrency(purchase.totalAmount),
				];

	// Kết hợp tất cả dữ liệu
	const allData = [
		...headerData,
		...productTableHeader,
		...productData,
		[""],
		totalRow,
	];

	// Tạo worksheet
	const worksheet = XLSX.utils.aoa_to_sheet(allData);

	// Thiết lập độ rộng cột (khác nhau cho đơn nháp và hoàn thành)
	const columnWidths =
		purchase.status === "Draft"
			? [
					{ wch: 5 }, // STT
					{ wch: 15 }, // Mã sản phẩm
					{ wch: 40 }, // Tên sản phẩm
					{ wch: 15 }, // Số lượng đặt
					{ wch: 20 }, // Giá nhập
					{ wch: 20 }, // Thành tiền
				]
			: [
					{ wch: 5 }, // STT
					{ wch: 15 }, // Mã sản phẩm
					{ wch: 40 }, // Tên sản phẩm
					{ wch: 15 }, // Số lượng đặt
					{ wch: 15 }, // Số lượng nhận
					{ wch: 20 }, // Giá nhập
					{ wch: 20 }, // Thành tiền
				];
	worksheet["!cols"] = columnWidths;

	// Merge cells cho tiêu đề (số cột phụ thuộc vào trạng thái)
	const maxCol = purchase.status === "Draft" ? 5 : 6;
	const merges = [
		{ s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } }, // Merge "PHIẾU NHẬP HÀNG"
	];

	// // Tìm vị trí các section trong headerData
	// let currentRow = 0;
	// for (let i = 0; i < headerData.length; i++) {
	// 	if (headerData[i][0] === "THÔNG TIN NHÀ CUNG CẤP") {
	// 		merges.push({
	// 			s: { r: i, c: 0 },
	// 			e: { r: i, c: maxCol },
	// 		});
	// 	}
	// 	if (headerData[i][0] === "THÔNG TIN NHÂN VIÊN") {
	// 		merges.push({
	// 			s: { r: i, c: 0 },
	// 			e: { r: i, c: maxCol },
	// 		});
	// 	}
	// }

	// Tìm vị trí "DANH SÁCH SẢN PHẨM"
	const productListIndex = headerData.length;
	merges.push({
		s: { r: productListIndex, c: 0 },
		e: { r: productListIndex, c: maxCol },
	});

	worksheet["!merges"] = merges;

	// Thêm worksheet vào workbook
	XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn nhập hàng");

	// Tạo tên file dựa vào trạng thái
	const statusFileName =
		purchase.status === "Draft"
			? "nhap"
			: purchase.status === "Completed"
				? "hoan_thanh"
				: "da_huy";
	const fileName = `Don_nhap_hang_${statusFileName}_${purchase.poCode}_${purchase.purchaseDate.replace(/\//g, "-")}.xlsx`;

	// Xuất file
	XLSX.writeFile(workbook, fileName);
};

/**
 * Xuất thông tin đơn nhập hàng nháp ra file Excel (tên cũ để tương thích ngược)
 * @deprecated Sử dụng exportPurchaseToExcel thay thế
 */
export const exportDraftPurchaseToExcel = exportPurchaseToExcel;
