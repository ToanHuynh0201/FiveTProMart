import { Flex, Select, Button, Box, Text } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

interface StaffFilterBarProps {
	accountType: string;
	sortBy: string;
	order: string;
	onAccountTypeChange: (value: string) => void;
	onSortByChange: (value: string) => void;
	onOrderChange: (value: string) => void;
	onReset: () => void;
}

const StaffFilterBar = ({
	accountType,
	sortBy,
	order,
	onAccountTypeChange,
	onSortByChange,
	onOrderChange,
	onReset,
}: StaffFilterBarProps) => {
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
				{/* Account Type Filter */}
				<Box flex={{ base: "1 1 100%", md: "0 0 auto" }}>
					<Text
						fontSize="sm"
						fontWeight="500"
						mb={1}
						color="gray.600">
						Chức vụ
					</Text>
					<Select
						value={accountType}
						onChange={(e) => onAccountTypeChange(e.target.value)}
						size="md"
						borderRadius="md"
						borderColor="gray.300"
						_hover={{ borderColor: "gray.400" }}
						_focus={{
							borderColor: "#161f70",
							boxShadow: "0 0 0 1px #161f70",
						}}
						minW={{ base: "100%", md: "200px" }}>
						<option value="">Tất cả chức vụ</option>
						<option value="SalesStaff">Nhân viên bán hàng</option>
						<option value="WarehouseStaff">Nhân viên kho</option>
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
						<option value="fullName">Họ và tên</option>
						<option value="username">Tên đăng nhập</option>
						<option value="email">Email</option>
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

export default StaffFilterBar;
