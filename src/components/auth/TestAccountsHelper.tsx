import {
	Box,
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	HStack,
	useToast,
	Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface TestAccount {
	username: string;
	password: string;
	role: string;
	description: string;
}

const TEST_ACCOUNTS: TestAccount[] = [
	{
		username: "admin",
		password: "admin123",
		role: "Admin",
		description: "Full system access",
	},
	{
		username: "manager",
		password: "manager123",
		role: "Manager",
		description: "Read access + limited write",
	},
	{
		username: "salesstaff",
		password: "sales123",
		role: "SalesStaff",
		description: "Orders, customers, payments",
	},
	{
		username: "warehousestaff",
		password: "warehouse123",
		role: "WarehouseStaff",
		description: "Stock, inventory, suppliers",
	},
];

interface TestAccountsHelperProps {
	onSelectAccount: (username: string, password: string) => void;
}

/**
 * TestAccountsHelper - Dev-mode quick login helper
 * 
 * Only visible in development mode (import.meta.env.DEV).
 * Provides one-click access to test accounts for rapid testing.
 * 
 */
export const TestAccountsHelper: React.FC<TestAccountsHelperProps> = ({
	onSelectAccount,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const toast = useToast();

	// Only render in development mode
	if (!import.meta.env.DEV) {
		return null;
	}

	const handleSelectAccount = (account: TestAccount) => {
		setIsLoading(true);
		
		// Copy credentials to clipboard for manual paste if needed
		navigator.clipboard.writeText(`${account.username}\n${account.password}`).catch(() => {
			// Clipboard API might fail, ignore
		});

		toast({
			title: "Test account selected",
			description: `${account.role} credentials copied to clipboard`,
			status: "info",
			duration: 2000,
			isClosable: true,
			position: "top",
		});

		// Auto-fill the form
		onSelectAccount(account.username, account.password);
		
		setTimeout(() => setIsLoading(false), 500);
	};

	return (
		<Box
			position="fixed"
			bottom={4}
			right={4}
			zIndex={9999}
			bg="rgba(255, 255, 255, 0.95)"
			backdropFilter="blur(10px)"
			borderRadius="lg"
			boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
			border="2px solid"
			borderColor="brand.500"
			p={2}
		>
			<Menu>
				<MenuButton
					as={Button}
					rightIcon={<ChevronDownIcon />}
					size="sm"
					colorScheme="brand"
					variant="solid"
					isLoading={isLoading}
				>
					<HStack spacing={2}>
						<Text>🧪 Test Accounts</Text>
						<Badge colorScheme="orange" fontSize="9px">
							DEV
						</Badge>
					</HStack>
				</MenuButton>
				<MenuList
					bg="white"
					borderColor="brand.200"
					boxShadow="xl"
					maxW="320px"
				>
					{TEST_ACCOUNTS.map((account) => (
						<MenuItem
							key={account.username}
							onClick={() => handleSelectAccount(account)}
							_hover={{ bg: "brand.50" }}
							py={3}
						>
							<Box w="full">
								<HStack justify="space-between" mb={1}>
									<Text fontWeight="600" color="brand.600">
										{account.role}
									</Text>
									<Badge
										colorScheme="blue"
										fontSize="10px"
										textTransform="none"
									>
										{account.username}
									</Badge>
								</HStack>
								<Text fontSize="xs" color="gray.600">
									{account.description}
								</Text>
								<Text
									fontSize="10px"
									color="gray.400"
									mt={1}
									fontFamily="mono"
								>
									Username: {account.username}
								</Text>
							</Box>
						</MenuItem>
					))}
				</MenuList>
			</Menu>
		</Box>
	);
};
