import { useState, useEffect, useRef } from "react";
import {
	Box,
	Text,
	Flex,
	Button,
	Input,
	InputGroup,
	InputLeftElement,
	useDisclosure,
	useToast,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	Spinner,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import {
	CategoryTable,
	AddCategoryModal,
	EditCategoryModal,
} from "@/components/category";
import {
	inventoryService,
	type CategoryDTO,
	type CreateCategoryDTO,
	type UpdateCategoryDTO,
} from "@/services/inventoryService";

const CategoryPage = () => {
	const toast = useToast();

	// State
	const [categories, setCategories] = useState<CategoryDTO[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null,
	);
	const [categoryToDelete, setCategoryToDelete] = useState<string | null>(
		null,
	);

	// Modals
	const {
		isOpen: isAddModalOpen,
		onOpen: onAddModalOpen,
		onClose: onAddModalClose,
	} = useDisclosure();
	const {
		isOpen: isEditModalOpen,
		onOpen: onEditModalOpen,
		onClose: onEditModalClose,
	} = useDisclosure();
	const {
		isOpen: isDeleteAlertOpen,
		onOpen: onDeleteAlertOpen,
		onClose: onDeleteAlertClose,
	} = useDisclosure();
	const cancelRef = useRef<HTMLButtonElement>(null);

	// Fetch categories
	const fetchCategories = async (search?: string) => {
		setIsLoading(true);
		try {
			const response = await inventoryService.getCategories(search);
			setCategories(response.data);
		} catch (error) {
			console.error("Error fetching categories:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải danh sách danh mục",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Load categories on mount
	useEffect(() => {
		fetchCategories();
	}, []);

	// Handle search with debounce
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchCategories(searchQuery);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Handlers
	const handleAddCategory = async (data: CreateCategoryDTO) => {
		try {
			await inventoryService.createCategory(data);
			await fetchCategories(searchQuery);
		} catch (error) {
			console.error("Error creating category:", error);
			throw error;
		}
	};

	const handleEditCategory = async (
		id: string,
		data: UpdateCategoryDTO,
	) => {
		try {
			await inventoryService.updateCategory(id, data);
			await fetchCategories(searchQuery);
		} catch (error) {
			console.error("Error updating category:", error);
			throw error;
		}
	};

	const handleDeleteCategory = async () => {
		if (!categoryToDelete) return;

		try {
			await inventoryService.deleteCategory(categoryToDelete);
			await fetchCategories(searchQuery);
			toast({
				title: "Thành công",
				description: "Đã xóa danh mục",
				status: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("Error deleting category:", error);
			toast({
				title: "Lỗi",
				description: "Không thể xóa danh mục",
				status: "error",
				duration: 3000,
			});
		} finally {
			setCategoryToDelete(null);
			onDeleteAlertClose();
		}
	};

	const handleEdit = (id: string) => {
		setSelectedCategoryId(id);
		onEditModalOpen();
	};

	const handleDelete = (id: string) => {
		setCategoryToDelete(id);
		onDeleteAlertOpen();
	};

	return (
		<MainLayout>
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={6}>
				{/* Page Title */}
				<Flex
					justify="space-between"
					align="center"
					mb={6}>
					<Text
						fontSize={{ base: "28px", md: "36px" }}
						fontWeight="600"
						color="brand.600">
						Quản lý danh mục
					</Text>
					<Button
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						onClick={onAddModalOpen}
						size="md"
						fontWeight="600"
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
						}}>
						+ Thêm danh mục
					</Button>
				</Flex>

				{/* Search Bar */}
				<Box mb={6}>
					<InputGroup maxW="400px">
						<InputLeftElement
							pointerEvents="none"
							h="48px">
							<FiSearch color="gray" />
						</InputLeftElement>
						<Input
							placeholder="Tìm kiếm theo mã hoặc tên danh mục..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							fontSize="15px"
							h="48px"
							bg="white"
						/>
					</InputGroup>
				</Box>

				{/* Loading State */}
				{isLoading && (
					<Flex
						justify="center"
						align="center"
						minH="400px">
						<Spinner
							size="xl"
							color="brand.500"
						/>
					</Flex>
				)}

				{/* Category Table */}
				{!isLoading && categories.length > 0 && (
					<Box mb={6}>
						<Flex
							justify="space-between"
							align="center"
							mb={4}
							px={2}>
							<Text
								fontSize="18px"
								fontWeight="600"
								color="gray.700">
								Danh sách danh mục ({categories.length})
							</Text>
						</Flex>
						<CategoryTable
							categories={categories}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					</Box>
				)}

				{/* Empty State */}
				{!isLoading && categories.length === 0 && (
					<Flex
						direction="column"
						justify="center"
						align="center"
						minH="400px"
						gap={4}>
						<Text
							fontSize="20px"
							fontWeight="500"
							color="gray.600">
							{searchQuery
								? "Không tìm thấy danh mục nào"
								: "Chưa có danh mục"}
						</Text>
					</Flex>
				)}
			</Box>

			{/* Add Category Modal */}
			<AddCategoryModal
				isOpen={isAddModalOpen}
				onClose={onAddModalClose}
				onAdd={handleAddCategory}
			/>

			{/* Edit Category Modal */}
			<EditCategoryModal
				isOpen={isEditModalOpen}
				onClose={onEditModalClose}
				categoryId={selectedCategoryId}
				onUpdate={handleEditCategory}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={isDeleteAlertOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteAlertClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold">
							Xóa danh mục
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc chắn muốn xóa danh mục này? Hành động này
							không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={cancelRef}
								onClick={onDeleteAlertClose}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleDeleteCategory}
								ml={3}>
								Xóa
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</MainLayout>
	);
};

export default CategoryPage;
