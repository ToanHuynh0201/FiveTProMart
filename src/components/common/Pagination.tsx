import { Flex, HStack, Button, Text, Input, useToast } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	showInfo?: boolean;
	itemLabel?: string;
}

const Pagination = ({
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
	showInfo = true,
	itemLabel = "items",
}: PaginationProps) => {
	const [pageInput, setPageInput] = useState("");
	const toast = useToast();

	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalItems);
	const safeTotalPages = totalPages || 1;

	const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPageInput(e.target.value);
	};

	const handlePageInputSubmit = (
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Enter") {
			const pageNumber = parseInt(pageInput, 10);

			if (
				isNaN(pageNumber) ||
				pageNumber < 1 ||
				pageNumber > safeTotalPages
			) {
				toast({
					title: "Số trang không hợp lệ",
					description: `Vui lòng nhập số từ 1 đến ${safeTotalPages}`,
					status: "error",
					duration: 3000,
					isClosable: true,
				});
				setPageInput("");
				return;
			}

			onPageChange(pageNumber);
			setPageInput("");
		}
	};

	if (totalPages <= 1 && !showInfo) return null;

	return (
		<Flex
			justify="space-between"
			mt={6}
			align="center"
			flexDirection={{ base: "column", md: "row" }}
			gap={4}>
			{showInfo && (
				<Text
					fontSize="sm"
					color="gray.600"
					fontWeight="500">
					Hiển thị {startItem} đến {endItem} trong tổng số{" "}
					{totalItems} {itemLabel}
				</Text>
			)}
			<HStack spacing={2}>
				<Button
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					isDisabled={currentPage <= 1}
					leftIcon={<ChevronLeftIcon />}
					variant="outline"
					colorScheme="brand"
					borderRadius="8px"
					_hover={{
						bg: currentPage > 1 ? "brand.50" : "transparent",
						transform:
							currentPage > 1 ? "translateX(-2px)" : "none",
					}}
					transition="all 0.2s ease">
					Trước
				</Button>

				<HStack spacing={1}>
					<Text
						fontSize="sm"
						fontWeight="500"
						color="gray.600">
						Trang
					</Text>
					<Input
						size="sm"
						width="60px"
						textAlign="center"
						placeholder={currentPage.toString()}
						value={pageInput}
						onChange={handlePageInputChange}
						onKeyDown={handlePageInputSubmit}
						type="number"
						min="1"
						max={safeTotalPages}
						borderRadius="8px"
						borderColor="brand.200"
						_hover={{
							borderColor: "brand.300",
						}}
						_focus={{
							borderColor: "brand.500",
							boxShadow:
								"0 0 0 1px var(--chakra-colors-brand-500)",
						}}
					/>
					<Text
						fontSize="sm"
						fontWeight="500"
						color="gray.600">
						/ {safeTotalPages}
					</Text>
				</HStack>

				<Button
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					isDisabled={currentPage >= safeTotalPages}
					rightIcon={<ChevronRightIcon />}
					variant="outline"
					colorScheme="brand"
					borderRadius="8px"
					_hover={{
						bg:
							currentPage < safeTotalPages
								? "brand.50"
								: "transparent",
						transform:
							currentPage < safeTotalPages
								? "translateX(2px)"
								: "none",
					}}
					transition="all 0.2s ease">
					Sau
				</Button>
			</HStack>
		</Flex>
	);
};

export default Pagination;
