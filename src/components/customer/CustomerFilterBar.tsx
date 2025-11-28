import { Flex, Select, Box } from "@chakra-ui/react";

interface CustomerFilterBarProps {
	selectedGender: string;
	selectedPointRange: string;
	onGenderChange: (gender: string) => void;
	onPointRangeChange: (range: string) => void;
}

const CustomerFilterBar = ({
	selectedGender,
	selectedPointRange,
	onGenderChange,
	onPointRangeChange,
}: CustomerFilterBarProps) => {
	return (
		<Box
			mb={6}
			ml={6}>
			<Flex
				gap={4}
				flexDirection={{ base: "column", sm: "row" }}
				alignItems="stretch">
				{/* Gender Filter */}
				<Select
					value={selectedGender}
					onChange={(e) => onGenderChange(e.target.value)}
					bg="brand.50"
					border="none"
					borderRadius="10px"
					height="47px"
					fontSize="16px"
					fontWeight="400"
					color="black"
					maxW={{ base: "100%", sm: "200px" }}
					_focus={{
						outline: "none",
						boxShadow: "0 0 0 2px rgba(22, 31, 112, 0.2)",
					}}>
					<option value="all">Tất cả giới tính</option>
					<option value="Nam">Nam</option>
					<option value="Nữ">Nữ</option>
					<option value="Khác">Khác</option>
				</Select>

				{/* Points Range Filter */}
				<Select
					value={selectedPointRange}
					onChange={(e) => onPointRangeChange(e.target.value)}
					bg="brand.50"
					border="none"
					borderRadius="10px"
					height="47px"
					fontSize="16px"
					fontWeight="400"
					color="black"
					minW={{ base: "100%", sm: "220px" }}
					_focus={{
						outline: "none",
						boxShadow: "0 0 0 2px rgba(22, 31, 112, 0.2)",
					}}>
					<option value="all">Tất cả điểm tích lũy</option>
					<option value="0-500">0 - 500 điểm</option>
					<option value="501-1000">501 - 1,000 điểm</option>
					<option value="1001-1500">1,001 - 1,500 điểm</option>
					<option value="1501-2000">1,501 - 2,000 điểm</option>
					<option value="2001+">Trên 2,000 điểm</option>
				</Select>
			</Flex>
		</Box>
	);
};

export default CustomerFilterBar;
