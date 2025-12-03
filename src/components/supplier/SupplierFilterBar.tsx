import { Flex, Select, Button, Box } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

interface SupplierFilterBarProps {
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
	onReset: () => void;
}

const SupplierFilterBar = ({
	statusFilter,
	onStatusFilterChange,
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
				<Select
					value={statusFilter}
					onChange={(e) => onStatusFilterChange(e.target.value)}
					size="md"
					borderRadius="md"
					borderColor="gray.300"
					_hover={{ borderColor: "gray.400" }}
					_focus={{
						borderColor: "#161f70",
						boxShadow: "0 0 0 1px #161f70",
					}}
					maxW={{ base: "100%", md: "200px" }}>
					<option value="all">Tất cả trạng thái</option>
					<option value="active">Hoạt động</option>
					<option value="inactive">Ngưng hoạt động</option>
				</Select>

				<Button
					leftIcon={<RepeatIcon />}
					onClick={onReset}
					size="md"
					variant="outline"
					colorScheme="gray"
					borderRadius="md"
					minW="100px">
					Đặt lại
				</Button>
			</Flex>
		</Box>
	);
};

export default SupplierFilterBar;
