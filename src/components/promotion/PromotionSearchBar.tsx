import { useState, useEffect } from "react";
import {
	Flex,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Button,
	IconButton,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";

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
	const [localQuery, setLocalQuery] = useState(searchQuery);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			onSearchChange(localQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [localQuery]);

	// Sync with external changes
	useEffect(() => {
		setLocalQuery(searchQuery);
	}, [searchQuery]);

	const handleClear = () => {
		setLocalQuery("");
		onSearchChange("");
	};

	return (
		<Flex
			gap={4}
			mb={6}
			direction={{ base: "column", md: "row" }}>
			<InputGroup
				size="lg"
				flex={1}>
				<InputLeftElement
					pointerEvents="none"
					h="52px">
					<SearchIcon color="gray.400" />
				</InputLeftElement>
				<Input
					placeholder="Tìm kiếm theo tên, mã khuyến mãi, sản phẩm..."
					value={localQuery}
					onChange={(e) => setLocalQuery(e.target.value)}
					bg="white"
					borderRadius="12px"
					fontSize="15px"
					h="52px"
					pr={localQuery ? "45px" : "12px"}
					_placeholder={{ color: "gray.400" }}
					_focus={{
						borderColor: "brand.400",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
					}}
				/>
				{localQuery && (
					<InputRightElement h="52px">
						<IconButton
							aria-label="Xóa tìm kiếm"
							icon={<CloseIcon />}
							size="xs"
							variant="ghost"
							colorScheme="gray"
							onClick={handleClear}
							borderRadius="full"
						/>
					</InputRightElement>
				)}
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
