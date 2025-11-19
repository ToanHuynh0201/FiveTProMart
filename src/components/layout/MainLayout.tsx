import { useThemeGradients } from "@/styles/themeUtils";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";

const MainLayout = ({ children, showSidebar = true }: any) => {
	const { mainBgGradient: bgGradient } = useThemeGradients();
	return (
		<Flex
			w="100%"
			h="100vh"
			overflow="hidden"
			bgGradient={bgGradient}>
			{showSidebar && <Sidebar />}
			<Flex
				direction="column"
				flex="1"
				overflow="hidden">
				<Box
					as="main"
					flex="1"
					overflowY="auto"
					p={6}>
					{children}
				</Box>
			</Flex>
		</Flex>
	);
};

export default MainLayout;
