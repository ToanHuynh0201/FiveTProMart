import { Box, Flex, Select } from "@chakra-ui/react";
import type { PurchaseFilter, Supplier } from "../../types/purchase";

interface PurchaseFilterBarProps {
	filters: PurchaseFilter;
	suppliers: Supplier[];
	onFiltersChange: (filters: PurchaseFilter) => void;
}

export const PurchaseFilterBar: React.FC<PurchaseFilterBarProps> = ({
	filters,
	suppliers,
	onFiltersChange,
}) => {
	const handleFilterChange = (key: keyof PurchaseFilter, value: string) => {
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
				align="center">
				<Select
					value={filters.supplierId}
					onChange={(e) =>
						handleFilterChange("supplierId", e.target.value)
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
					<option value="all">Tất cả nhà cung cấp</option>
					{suppliers.map((supplier) => (
						<option
							key={supplier.id}
							value={supplier.id}>
							{supplier.name}
						</option>
					))}
				</Select>

				<Select
					value={filters.status}
					onChange={(e) =>
						handleFilterChange("status", e.target.value)
					}
					bg="gray.50"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="10px"
					fontSize="15px"
					h="48px"
					flex={{ base: "1 1 100%", sm: "1 1 45%", lg: "1" }}
					_hover={{ bg: "gray.100" }}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					}}>
					<option value="all">Tất cả trạng thái</option>
					<option value="ordered">Đã đặt</option>
					<option value="received">Đã nhận</option>
					<option value="cancelled">Đã hủy</option>
				</Select>

				<Select
					value={filters.paymentStatus}
					onChange={(e) =>
						handleFilterChange("paymentStatus", e.target.value)
					}
					bg="gray.50"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="10px"
					fontSize="15px"
					h="48px"
					flex={{ base: "1 1 100%", sm: "1 1 45%", lg: "1" }}
					_hover={{ bg: "gray.100" }}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					}}>
					<option value="all">Tất cả thanh toán</option>
					<option value="unpaid">Chưa trả</option>
					<option value="paid">Đã trả</option>
				</Select>
			</Flex>
		</Box>
	);
};
