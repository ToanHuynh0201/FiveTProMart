import {
	Flex,
	Input,
	InputGroup,
	InputLeftElement,
	Icon,
} from "@chakra-ui/react";

interface CustomerSearchBarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

const CustomerSearchBar = ({
	searchQuery,
	onSearchChange,
}: CustomerSearchBarProps) => {
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
				maxW={{ base: "100%", sm: "360px" }}>
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
					placeholder="Tìm kiếm theo tên hoặc số điện thoại"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					bg="brand.50"
					border="none"
					borderRadius="10px"
					height="47px"
					pl={12}
					fontSize="16px"
					minW={{ base: "100%", sm: "360px" }}
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
		</Flex>
	);
};

export default CustomerSearchBar;
