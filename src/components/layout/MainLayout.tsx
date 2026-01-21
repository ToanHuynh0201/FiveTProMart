import { useThemeGradients } from "@/styles/themeUtils";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";

const MainLayout = ({ children, showSidebar = true }: any) => {
	const { mainBgGradient: bgGradient } = useThemeGradients();
	return (
		<SidebarProvider>
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
						px={6}
						py={0}>
						{children}
					</Box>
				</Flex>
			</Flex>
		</SidebarProvider>
	);
};

export default MainLayout;
