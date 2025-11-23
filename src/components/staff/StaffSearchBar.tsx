import {
	Flex,
	Input,
	InputGroup,
	InputLeftElement,
	Text,
	Icon,
} from "@chakra-ui/react";

interface StaffSearchBarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onAddStaff?: () => void;
}

const StaffSearchBar = ({
	searchQuery,
	onSearchChange,
	onAddStaff,
}: StaffSearchBarProps) => {
	return (
		<Flex
			gap={4}
			mb={6}
			flexDirection={{ base: "column", md: "row" }}
			alignItems="stretch">
			{/* Search Input */}
			<InputGroup
				size="lg"
				flex={1}
				maxW={{ base: "100%", md: "354px" }}>
				<InputLeftElement
					pointerEvents="none"
					height="47px"
					pl={2}>
					<Icon
						viewBox="0 0 24 24"
						w={6}
						h={6}
						color="brand.600">
						<path
							fill="currentColor"
							d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
						/>
					</Icon>
				</InputLeftElement>
				<Input
					placeholder="Tìm kiếm"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					bg="brand.50"
					border="none"
					borderRadius="10px"
					height="47px"
					pl={12}
					fontSize="16px"
					fontWeight="400"
					color="black"
					_placeholder={{
						color: "rgba(0, 0, 0, 0.5)",
					}}
					_focus={{
						outline: "none",
						boxShadow: "0 0 0 2px rgba(22, 31, 112, 0.2)",
					}}
				/>
			</InputGroup>

			{/* Add Staff Button */}
			<Flex
				bg="brand.50"
				borderRadius="10px"
				height="47px"
				px={5}
				cursor="pointer"
				transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
				_hover={{
					bg: "brand.100",
					transform: "translateY(-2px)",
					boxShadow: "0 4px 12px rgba(22, 31, 112, 0.15)",
				}}
				_active={{
					transform: "translateY(0)",
					bg: "brand.200",
				}}
				onClick={onAddStaff}
				alignItems="center"
				gap={3}
				minW={{ base: "100%", md: "200px" }}
				maxW={{ base: "100%", md: "240px" }}
				justifyContent="center">
				{/* Add Icon */}
				<Flex
					w="24px"
					h="24px"
					borderRadius="full"
					bg="transparent"
					border="2px solid"
					borderColor="brand.600"
					alignItems="center"
					justifyContent="center"
					position="relative">
					<Icon
						viewBox="0 0 24 24"
						w={5}
						h={5}
						color="brand.600">
						<path
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							d="M12 5v14M5 12h14"
						/>
					</Icon>
				</Flex>
				<Text
					fontSize="18px"
					fontWeight="500"
					color="brand.600"
					letterSpacing="tight">
					Thêm nhân sự
				</Text>
			</Flex>
		</Flex>
	);
};

export default StaffSearchBar;
