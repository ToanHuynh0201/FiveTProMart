import {
	Flex,
	Input,
	InputGroup,
	InputLeftElement,
	Button,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon } from "@chakra-ui/icons";

interface PromotionSearchBarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onAddPromotion: () => void;
}

export const PromotionSearchBar: React.FC<PromotionSearchBarProps> = ({
	searchQuery,
	onSearchChange,
	onAddPromotion,
}) => {
	return (
		<Flex
			gap={4}
			mb={6}
			direction={{ base: "column", md: "row" }}>
			<InputGroup
				size="lg"
				flex={1}>
				<InputLeftElement pointerEvents="none">
					<SearchIcon color="gray.400" />
				</InputLeftElement>
				<Input
					placeholder="Tìm kiếm theo tên, mã khuyến mãi, sản phẩm..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					bg="white"
					borderRadius="12px"
					fontSize="15px"
					h="52px"
					_placeholder={{ color: "gray.400" }}
				/>
			</InputGroup>

			<Button
				leftIcon={<AddIcon />}
				bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
				color="white"
				size="lg"
				fontSize="15px"
				fontWeight="600"
				h="52px"
				px={8}
				onClick={onAddPromotion}
				_hover={{
					bgGradient: "linear(135deg, brand.600 0%, brand.500 100%)",
					transform: "translateY(-2px)",
					boxShadow: "lg",
				}}
				_active={{
					transform: "translateY(0)",
				}}
				flexShrink={0}>
				Thêm khuyến mãi
			</Button>
		</Flex>
	);
};
