import { Box, Heading, Text, Container, VStack } from "@chakra-ui/react";
import MainLayout from "@/components/layout/MainLayout";

const DashboardPage = () => {
	return (
		<MainLayout>
			<Container
				maxW="7xl"
				py={8}>
				<VStack
					spacing={6}
					align="stretch">
					<Heading
						size="xl"
						color="brand.500">
						Quản lí
					</Heading>
					<Text
						fontSize="lg"
						color="gray.600">
						Chào mừng đến với hệ thống quản lý 5T Mart
					</Text>

					{/* Demo content */}
					<Box
						bg="white"
						p={8}
						borderRadius="xl"
						boxShadow="md">
						<Heading
							size="md"
							mb={4}
							color="brand.500">
							Dashboard Demo
						</Heading>
						<Text color="gray.600">
							Sidebar đã được tùy chỉnh theo design Figma của bạn
							với màu sắc và layout phù hợp với app hiện tại.
						</Text>
					</Box>
				</VStack>
			</Container>
		</MainLayout>
	);
};

export default DashboardPage;
