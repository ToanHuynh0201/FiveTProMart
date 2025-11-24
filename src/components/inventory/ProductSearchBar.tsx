import {
	Input,
	InputGroup,
	InputLeftElement,
	Flex,
	Button,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon } from "@chakra-ui/icons";

interface ProductSearchBarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onAddProduct: () => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
	searchQuery,
	onSearchChange,
	onAddProduct,
}) => {
	return (
		<Flex
			gap={4}
			mb={6}
			flexWrap={{ base: "wrap", md: "nowrap" }}>
			<InputGroup flex="1">
				<InputLeftElement
					pointerEvents="none"
					h="56px">
					<SearchIcon color="gray.500" />
				</InputLeftElement>
				<Input
					h="56px"
					bg="white"
					border="2px solid"
					borderColor="gray.200"
					borderRadius="12px"
					fontSize="16px"
					placeholder="Tìm kiếm theo tên, mã hàng hoặc mã vạch..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					_placeholder={{ color: "gray.500" }}
					_hover={{
						borderColor: "gray.300",
					}}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 3px rgba(22, 31, 112, 0.1)",
					}}
				/>
			</InputGroup>

			<Button
				h="56px"
				px={6}
				bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
				color="white"
				borderRadius="12px"
				fontWeight="600"
				fontSize="16px"
				leftIcon={<AddIcon />}
				onClick={onAddProduct}
				boxShadow="0 4px 14px rgba(22, 31, 112, 0.25)"
				_hover={{
					bgGradient: "linear(135deg, brand.600 0%, brand.500 100%)",
					transform: "translateY(-2px)",
					boxShadow: "0 6px 20px rgba(22, 31, 112, 0.35)",
				}}
				_active={{
					bgGradient: "linear(135deg, brand.700 0%, brand.600 100%)",
					transform: "translateY(0)",
				}}>
				Thêm hàng hóa
			</Button>
		</Flex>
	);
};
