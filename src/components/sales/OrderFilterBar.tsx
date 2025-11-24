import {
	Box,
	HStack,
	Input,
	Select,
	Button,
	InputGroup,
	InputLeftElement,
	Grid,
	Text,
	FormControl,
	FormLabel,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export interface OrderFilters {
	searchQuery: string;
	status: string;
	paymentMethod: string;
	dateFrom: string;
	dateTo: string;
}

interface OrderFilterBarProps {
	filters: OrderFilters;
	onFiltersChange: (filters: OrderFilters) => void;
	onReset: () => void;
}

const OrderFilterBar = ({
	filters,
	onFiltersChange,
	onReset,
}: OrderFilterBarProps) => {
	const handleFilterChange = (key: keyof OrderFilters, value: string) => {
		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	return (
		<Box
			bg="white"
			p={5}
			borderRadius="xl"
			boxShadow="sm">
			<Grid
				templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
				gap={4}
				mb={4}>
				<InputGroup>
					<InputLeftElement pointerEvents="none">
						<SearchIcon color="gray.400" />
					</InputLeftElement>
					<Input
						placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
						value={filters.searchQuery}
						onChange={(e) =>
							handleFilterChange("searchQuery", e.target.value)
						}
						bg="white"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}
					/>
				</InputGroup>

				<HStack spacing={3}>
					<Select
						placeholder="Tất cả trạng thái"
						value={filters.status}
						onChange={(e) =>
							handleFilterChange("status", e.target.value)
						}
						bg="white"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}>
						<option value="completed">Hoàn thành</option>
						<option value="draft">Nháp</option>
						<option value="cancelled">Đã hủy</option>
					</Select>

					<Select
						placeholder="Tất cả phương thức"
						value={filters.paymentMethod}
						onChange={(e) =>
							handleFilterChange("paymentMethod", e.target.value)
						}
						bg="white"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}>
						<option value="cash">Tiền mặt</option>
						<option value="card">Thẻ</option>
						<option value="transfer">Chuyển khoản</option>
					</Select>
				</HStack>
			</Grid>

			<Grid
				templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
				gap={4}
				alignItems="end">
				<FormControl>
					<FormLabel
						fontSize="sm"
						color="gray.600"
						mb={2}>
						Từ ngày
					</FormLabel>
					<Input
						type="date"
						placeholder="Từ ngày"
						value={filters.dateFrom}
						onChange={(e) =>
							handleFilterChange("dateFrom", e.target.value)
						}
						bg="white"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}
					/>
				</FormControl>

				<FormControl>
					<FormLabel
						fontSize="sm"
						color="gray.600"
						mb={2}>
						Đến ngày
					</FormLabel>
					<Input
						type="date"
						placeholder="Đến ngày"
						value={filters.dateTo}
						onChange={(e) =>
							handleFilterChange("dateTo", e.target.value)
						}
						bg="white"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}
					/>
				</FormControl>

				<HStack spacing={3}>
					<Button
						colorScheme="gray"
						variant="outline"
						onClick={onReset}
						flex={1}>
						Đặt lại
					</Button>
				</HStack>
			</Grid>
		</Box>
	);
};

export default OrderFilterBar;
