import { Flex, Select, Button, Box, Text } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

interface SupplierFilterBarProps {
	supplierType: string;
	sortBy: string;
	order: string;
	onSupplierTypeChange: (value: string) => void;
	onSortByChange: (value: string) => void;
	onOrderChange: (value: string) => void;
	onReset: () => void;
}

const SupplierFilterBar = ({
	supplierType,
	sortBy,
	order,
	onSupplierTypeChange,
	onSortByChange,
	onOrderChange,
	onReset,
}: SupplierFilterBarProps) => {
	return (
		<Box
			bg="white"
			p={4}
			borderRadius="lg"
			boxShadow="sm">
			<Flex
				gap={3}
				flexWrap={{ base: "wrap", md: "nowrap" }}
				align="center">
				{/* Supplier Type Filter */}
				<Box flex={{ base: "1 1 100%", md: "0 0 auto" }}>
					<Text
						fontSize="sm"
						fontWeight="500"
						mb={1}
						color="gray.600">
						Loại nhà cung cấp
					</Text>
					<Select
						value={supplierType}
						onChange={(e) => onSupplierTypeChange(e.target.value)}
						size="md"
						borderRadius="md"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}
						minW={{ base: "100%", md: "200px" }}>
						<option value="">Tất cả loại</option>
						<option value="Doanh nghiệp">Doanh nghiệp</option>
						<option value="Tư nhân">Tư nhân</option>
					</Select>
				</Box>

				{/* Sort By Filter */}
				<Box flex={{ base: "1 1 100%", md: "0 0 auto" }}>
					<Text
						fontSize="sm"
						fontWeight="500"
						mb={1}
						color="gray.600">
						Sắp xếp theo
					</Text>
					<Select
						value={sortBy}
						onChange={(e) => onSortByChange(e.target.value)}
						size="md"
						borderRadius="md"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}
						minW={{ base: "100%", md: "180px" }}>
						<option value="supplierName">Tên nhà cung cấp</option>
						<option value="supplierId">Mã nhà cung cấp</option>
						<option value="currentDebt">Công nợ</option>
					</Select>
				</Box>

				{/* Order Filter */}
				<Box flex={{ base: "1 1 100%", md: "0 0 auto" }}>
					<Text
						fontSize="sm"
						fontWeight="500"
						mb={1}
						color="gray.600">
						Thứ tự
					</Text>
					<Select
						value={order}
						onChange={(e) => onOrderChange(e.target.value)}
						size="md"
						borderRadius="md"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}
						minW={{ base: "100%", md: "150px" }}>
						<option value="asc">Tăng dần</option>
						<option value="desc">Giảm dần</option>
					</Select>
				</Box>

				{/* Reset Button */}
				<Box
					flex={{ base: "1 1 100%", md: "0 0 auto" }}
					pt={{ base: 0, md: 6 }}>
					<Button
						leftIcon={<RepeatIcon />}
						onClick={onReset}
						size="md"
						variant="outline"
						colorScheme="gray"
						borderRadius="md"
						minW={{ base: "100%", md: "100px" }}>
						Đặt lại
					</Button>
				</Box>
			</Flex>
		</Box>
	);
};

export default SupplierFilterBar;
