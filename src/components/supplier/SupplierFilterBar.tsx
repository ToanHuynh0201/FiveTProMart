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
	onSupplierTypeChange,
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
