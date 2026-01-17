import { useState, useRef } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	VStack,
	Text,
	Box,
	useToast,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Flex,
} from "@chakra-ui/react";
import { DownloadIcon, AttachmentIcon } from "@chakra-ui/icons";
import type { PurchaseItem } from "../../types/purchase";
import { purchaseService } from "@/services/purchaseService";

interface ImportExcelModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (items: PurchaseItem[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
	isOpen,
	onClose,
	onImport,
}) => {
	const toast = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [previewItems, setPreviewItems] = useState<PurchaseItem[]>([]);

	const handleDownloadTemplate = async () => {
		try {
			const blob = await purchaseService.getExcelTemplate();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "purchase_template.xlsx";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			
			toast({
				title: "Tải xuống thành công",
				description: "File mẫu đã được tải xuống",
				status: "success",
				duration: 2000,
			});
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể tải file mẫu",
				status: "error",
				duration: 3000,
			});
		}
	};

	const handleFileSelect = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (
			!file.name.endsWith(".xlsx") &&
			!file.name.endsWith(".xls") &&
			!file.name.endsWith(".csv")
		) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn file Excel (.xlsx, .xls, .csv)",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);

		try {
			const response = await purchaseService.importFromExcel(file);
			const items: PurchaseItem[] = response.data ?? [];

			if (items.length === 0) {
				toast({
					title: "Cảnh báo",
					description: "File Excel không có dữ liệu",
					status: "warning",
					duration: 3000,
				});
				return;
			}

			setPreviewItems(items);
			toast({
				title: "Đọc file thành công",
				description: `Đã đọc ${items.length} sản phẩm từ file Excel`,
				status: "success",
				duration: 2000,
			});
		} catch (error: unknown) {
			toast({
				title: "Lỗi",
				description: error.message || "Không thể đọc file Excel",
				status: "error",
				duration: 4000,
			});
		} finally {
			setIsLoading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleConfirmImport = () => {
		onImport(previewItems);
		setPreviewItems([]);
		onClose();
		toast({
			title: "Nhập thành công",
			description: `Đã nhập ${previewItems.length} sản phẩm`,
			status: "success",
			duration: 3000,
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN").format(amount);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="6xl"
			scrollBehavior="inside">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader
					fontSize="20px"
					fontWeight="700"
					color="gray.800">
					Nhập hàng từ Excel
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					<VStack
						spacing={6}
						align="stretch">
						{/* Hướng dẫn */}
						<Box
							bg="blue.50"
							p={4}
							borderRadius="8px"
							borderLeft="4px solid"
							borderColor="blue.500">
							<Text
								fontSize="14px"
								fontWeight="600"
								color="blue.800"
								mb={2}>
								📋 Hướng dẫn nhập file Excel
							</Text>
							<VStack
								align="start"
								spacing={1}
								fontSize="13px"
								color="blue.700">
								<Text>
									1. Tải xuống file mẫu và điền thông tin sản
									phẩm
								</Text>
								<Text>
									2. Đảm bảo các cột: Mã sản phẩm, Tên sản
									phẩm, Đơn vị tính, Số lượng, Đơn giá, VAT
									(%)
								</Text>
								<Text>
									3. Các trường tùy chọn: Ngày sản xuất, Hạn
									sử dụng (DD/MM/YYYY)
								</Text>
								<Text>
									4. Chọn file Excel và xem trước dữ liệu
								</Text>
								<Text>
									5. Xác nhận nhập vào phiếu nhập hàng
								</Text>
							</VStack>
						</Box>

						{/* Buttons */}
						<Flex
							gap={4}
							flexWrap="wrap">
							<Button
								leftIcon={<DownloadIcon />}
								colorScheme="green"
								variant="outline"
								onClick={handleDownloadTemplate}>
								Tải file mẫu Excel
							</Button>

							<Button
								leftIcon={<AttachmentIcon />}
								colorScheme="brand"
								onClick={handleFileSelect}
								isLoading={isLoading}>
								Chọn file Excel
							</Button>

							<input
								ref={fileInputRef}
								type="file"
								accept=".xlsx,.xls,.csv"
								style={{ display: "none" }}
								onChange={handleFileChange}
							/>
						</Flex>

						{/* Preview */}
						{previewItems.length > 0 && (
							<Box>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Xem trước dữ liệu ({previewItems.length} sản
									phẩm)
								</Text>
								<Box
									border="1px solid"
									borderColor="gray.200"
									borderRadius="8px"
									overflow="hidden"
									maxH="400px"
									overflowY="auto">
									<Table size="sm">
										<Thead
											bg="gray.50"
											position="sticky"
											top={0}
											zIndex={1}>
											<Tr>
												<Th>STT</Th>
												<Th>Mã SP</Th>
												<Th>Tên sản phẩm</Th>
												<Th>Nhóm hàng</Th>
												<Th>Đơn vị</Th>
												<Th isNumeric>SL</Th>
												<Th isNumeric>Đơn giá</Th>
												<Th isNumeric>VAT (%)</Th>
												<Th>NSX</Th>
												<Th>HSD</Th>
												<Th isNumeric>Thành tiền</Th>
											</Tr>
										</Thead>
										<Tbody>
											{previewItems.map((item, index) => (
												<Tr key={item.id}>
													<Td>{index + 1}</Td>
													<Td fontSize="13px">
														{item.productCode}
													</Td>
													<Td fontSize="13px">
														{item.productName}
													</Td>
													<Td fontSize="13px">
														{item.category || "-"}
													</Td>
													<Td fontSize="13px">
														{item.unit}
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														fontWeight="600">
														{item.quantity}
													</Td>
													<Td
														isNumeric
														fontSize="13px">
														{formatCurrency(
															item.unitPrice,
														)}
													</Td>
													<Td
														isNumeric
														fontSize="13px">
														{item.vat}%
													</Td>
													<Td fontSize="13px">
														{item.manufactureDate
															? new Date(
																	item.manufactureDate,
															  ).toLocaleDateString(
																	"vi-VN",
															  )
															: "-"}
													</Td>
													<Td fontSize="13px">
														{item.expiryDate
															? new Date(
																	item.expiryDate,
															  ).toLocaleDateString(
																	"vi-VN",
															  )
															: "-"}
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														fontWeight="700">
														{formatCurrency(
															item.totalPrice,
														)}
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</Box>

								<Box
									bg="gray.50"
									p={3}
									mt={3}
									borderRadius="8px">
									<Flex justify="space-between">
										<Text
											fontSize="15px"
											fontWeight="600">
											Tổng cộng:
										</Text>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="brand.500">
											{formatCurrency(
												previewItems.reduce(
													(sum, item) =>
														sum + item.totalPrice,
													0,
												),
											)}
										</Text>
									</Flex>
								</Box>
							</Box>
						)}
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button
						variant="ghost"
						mr={3}
						onClick={() => {
							setPreviewItems([]);
							onClose();
						}}>
						Hủy
					</Button>
					{previewItems.length > 0 && (
						<Button
							colorScheme="brand"
							onClick={handleConfirmImport}>
							Xác nhận nhập ({previewItems.length} sản phẩm)
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
