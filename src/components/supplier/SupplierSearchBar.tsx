import { Input, InputGroup, InputLeftElement, Box } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

interface SupplierSearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const SupplierSearchBar = ({
	value,
	onChange,
	placeholder = "Tìm kiếm theo mã, tên, SĐT, email...",
}: SupplierSearchBarProps) => {
	return (
		<Box w="100%">
			<InputGroup size="lg">
				<InputLeftElement pointerEvents="none">
					<SearchIcon color="gray.400" />
				</InputLeftElement>
				<Input
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					bg="white"
					borderRadius="lg"
					borderColor="gray.300"
					_hover={{ borderColor: "gray.400" }}
					_focus={{
						borderColor: "#161f70",
						boxShadow: "0 0 0 1px #161f70",
					}}
					fontSize="15px"
				/>
			</InputGroup>
		</Box>
	);
};

export default SupplierSearchBar;
