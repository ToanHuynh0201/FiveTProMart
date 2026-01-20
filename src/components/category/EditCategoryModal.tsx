import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	FormControl,
	FormLabel,
	Input,
	useToast,
	Spinner,
	Flex,
} from "@chakra-ui/react";
import { inventoryService, type UpdateCategoryDTO } from "@/services/inventoryService";

interface EditCategoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	categoryId: string | null;
	onUpdate: (id: string, data: UpdateCategoryDTO) => Promise<void>;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
	isOpen,
	onClose,
	categoryId,
	onUpdate,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [categoryName, setCategoryName] = useState("");

	useEffect(() => {
		const loadCategory = async () => {
			if (isOpen && categoryId) {
				setIsLoading(true);
				try {
					const response = await inventoryService.getCategoryById(categoryId);
					setCategoryName(response.data.categoryName);
				} catch (error) {
					console.error("Error loading category:", error);
					toast({
						title: "Lỗi",
						description: "Không thể tải thông tin danh mục",
						status: "error",
						duration: 3000,
					});
					onClose();
				} finally {
					setIsLoading(false);
				}
			}
		};

		loadCategory();
	}, [isOpen, categoryId, onClose, toast]);

	const handleSubmit = async () => {
		if (!categoryName.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên danh mục",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!categoryId) return;

		setIsSaving(true);

		try {
			await onUpdate(categoryId, { categoryName: categoryName.trim() });
			toast({
				title: "Thành công",
				description: "Cập nhật danh mục thành công",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật danh mục",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent>
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600">
					Chỉnh sửa danh mục
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					{isLoading ? (
						<Flex
							justify="center"
							align="center"
							minH="100px">
							<Spinner
								size="lg"
								color="brand.500"
							/>
						</Flex>
					) : (
						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Tên danh mục
							</FormLabel>
							<Input
								placeholder="Nhập tên danh mục"
								value={categoryName}
								onChange={(e) => setCategoryName(e.target.value)}
								fontSize="15px"
								h="48px"
								autoFocus
							/>
						</FormControl>
					)}
				</ModalBody>

				<ModalFooter gap={3}>
					<Button
						variant="ghost"
						onClick={onClose}
						isDisabled={isSaving}>
						Hủy
					</Button>
					<Button
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						onClick={handleSubmit}
						isLoading={isSaving}
						isDisabled={isLoading}
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
						}}>
						Lưu thay đổi
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
