import {
	Box,
	Flex,
	Select,
	Input,
	HStack,
	Text,
	useToast,
} from "@chakra-ui/react";
import type { PurchaseFilter } from "@/types/purchase";

interface PurchaseFilterBarProps {
	filters: PurchaseFilter;
	onFiltersChange: (filters: PurchaseFilter) => void;
}

export const PurchaseFilterBar: React.FC<PurchaseFilterBarProps> = ({
	filters,
	onFiltersChange,
}) => {
	const toast = useToast();

	const handleFilterChange = (key: keyof PurchaseFilter, value: string) => {
		// Validate date range when either date changes
		if (key === "startDate" || key === "endDate") {
			const startDate = key === "startDate" ? value : filters.startDate;
			const endDate = key === "endDate" ? value : filters.endDate;

			// Check if both dates are provided and endDate is before startDate
			if (
				startDate &&
				endDate &&
				new Date(endDate) < new Date(startDate)
			) {
				toast({
					title: "Lỗi",
					description:
						"Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
				return; // Don't update the filter
			}
		}

		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	return (
		<Box
			bg="white"
			p={4}
			borderRadius="10px"
			boxShadow="sm"
			mb={4}>
			<Flex
				gap={3}
				flexWrap={{ base: "wrap", lg: "nowrap" }}
				align="flex-end">
				{/* Status Filter */}
				<Select
					value={filters.status || "all"}
					onChange={(e) =>
						handleFilterChange("status", e.target.value)
					}
					bg="gray.50"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="8px"
					fontSize="14px"
					h="42px"
					flex={{ base: "1 1 100%", sm: "1 1 45%", lg: "1" }}
					_hover={{ bg: "gray.100" }}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					}}>
					<option value="all">Tất cả trạng thái</option>
					<option value="Draft">Nháp</option>
					<option value="Completed">Hoàn thành</option>
					<option value="Cancelled">Đã hủy</option>
				</Select>

				{/* Date Range Filter */}
				<HStack
					spacing={2}
					flex={{ base: "1 1 100%", lg: "2" }}>
					<Box flex={1}>
						<Text
							fontSize="12px"
							color="gray.600"
							mb={1}>
							Từ ngày
						</Text>
						<Input
							type="date"
							value={filters.startDate || ""}
							onChange={(e) =>
								handleFilterChange("startDate", e.target.value)
							}
							bg="gray.50"
							border="1px solid"
							borderColor="gray.200"
							borderRadius="8px"
							fontSize="14px"
							h="42px"
							_hover={{ bg: "gray.100" }}
							_focus={{
								bg: "white",
								borderColor: "brand.500",
								boxShadow:
									"0 0 0 1px var(--chakra-colors-brand-500)",
							}}
						/>
					</Box>
					<Box flex={1}>
						<Text
							fontSize="12px"
							color="gray.600"
							mb={1}>
							Đến ngày
						</Text>
						<Input
							type="date"
							value={filters.endDate || ""}
							onChange={(e) =>
								handleFilterChange("endDate", e.target.value)
							}
							bg="gray.50"
							border="1px solid"
							borderColor="gray.200"
							borderRadius="8px"
							fontSize="14px"
							h="42px"
							_hover={{ bg: "gray.100" }}
							_focus={{
								bg: "white",
								borderColor: "brand.500",
								boxShadow:
									"0 0 0 1px var(--chakra-colors-brand-500)",
							}}
						/>
					</Box>
				</HStack>
			</Flex>
		</Box>
	);
};
