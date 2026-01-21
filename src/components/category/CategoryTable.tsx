import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	IconButton,
	HStack,
	Tooltip,
	Box,
	Text,
	useToast,
} from "@chakra-ui/react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import type { CategoryDTO } from "@/services/inventoryService";

interface CategoryTableProps {
	categories: CategoryDTO[];
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
	categories,
	onEdit,
	onDelete,
}) => {
	const toast = useToast();

	const handleCopyId = (categoryId: string) => {
		navigator.clipboard.writeText(categoryId);
		toast({
			title: "Đã copy mã danh mục",
			description: categoryId,
			status: "success",
			duration: 2000,
			isClosable: true,
			position: "top",
		});
	};

	return (
		<Box
			borderWidth="1px"
			borderRadius="lg"
			overflow="hidden"
			bg="white"
			shadow="sm">
			<Table variant="simple">
				<Thead bg="gray.50">
					<Tr>
						<Th
							fontSize="14px"
							fontWeight="700"
							color="gray.700"
							textTransform="none">
							Mã danh mục
						</Th>
						<Th
							fontSize="14px"
							fontWeight="700"
							color="gray.700"
							textTransform="none">
							Tên danh mục
						</Th>
						<Th
							fontSize="14px"
							fontWeight="700"
							color="gray.700"
							textAlign="right"
							textTransform="none">
							Thao tác
						</Th>
					</Tr>
				</Thead>
				<Tbody>
					{categories.map((category) => (
						<Tr
							key={category.categoryId}
							_hover={{ bg: "gray.50" }}
							transition="background-color 0.2s">
							<Td
								fontSize="15px"
								color="gray.800"
								fontWeight="500"
								maxW="120px">
								<Tooltip
									label={category.categoryId}
									placement="top"
									hasArrow>
									<Text
										isTruncated
										cursor="pointer"
										onClick={() =>
											handleCopyId(category.categoryId)
										}
										_hover={{
											color: "blue.600",
											textDecoration: "underline",
										}}>
										{category.categoryId}
									</Text>
								</Tooltip>
							</Td>
							<Td
								fontSize="15px"
								color="gray.700">
								{category.categoryName}
							</Td>
							<Td textAlign="right">
								<HStack
									spacing={2}
									justify="flex-end">
									<Tooltip
										label="Chỉnh sửa"
										placement="top">
										<IconButton
											aria-label="Chỉnh sửa danh mục"
											icon={<FiEdit />}
											size="sm"
											colorScheme="blue"
											variant="ghost"
											onClick={() =>
												onEdit(category.categoryId)
											}
										/>
									</Tooltip>
									<Tooltip
										label="Xóa"
										placement="top">
										<IconButton
											aria-label="Xóa danh mục"
											icon={<FiTrash2 />}
											size="sm"
											colorScheme="red"
											variant="ghost"
											onClick={() =>
												onDelete(category.categoryId)
											}
										/>
									</Tooltip>
								</HStack>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</Box>
	);
};
