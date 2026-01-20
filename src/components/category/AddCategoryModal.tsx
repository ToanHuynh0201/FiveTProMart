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
} from "@chakra-ui/react";
import type { CreateCategoryDTO } from "@/services/inventoryService";

interface AddCategoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (data: CreateCategoryDTO) => Promise<void>;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
	isOpen,
	onClose,
	onAdd,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [categoryName, setCategoryName] = useState("");

	useEffect(() => {
		if (!isOpen) {
			setCategoryName("");
		}
	}, [isOpen]);

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

		setIsLoading(true);

		try {
			await onAdd({ categoryName: categoryName.trim() });
			toast({
				title: "Thành công",
				description: "Thêm danh mục thành công",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi thêm danh mục",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
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
					Thêm danh mục mới
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
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
				</ModalBody>

				<ModalFooter gap={3}>
					<Button
						variant="ghost"
						onClick={onClose}
						isDisabled={isLoading}>
						Hủy
					</Button>
					<Button
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						onClick={handleSubmit}
						isLoading={isLoading}
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
						}}>
						Thêm danh mục
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
