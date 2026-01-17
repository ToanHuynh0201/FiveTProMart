import { Box, Heading, Text, Container, VStack, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Icon, HStack, Spinner, Center } from "@chakra-ui/react";
import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { inventoryService } from "@/services/inventoryService";
import { MdInventory, MdWarning, MdAccessTime, MdCheckCircle } from "react-icons/md";

const DashboardPage = () => {
	const [stats, setStats] = useState<{
		totalProducts: number;
		lowStockCount: number;
		expiringCount: number;
		inStockCount: number;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			setIsLoading(true);
			try {
				const data = await inventoryService.getStats();
				setStats(data as any);
			} catch (error) {
				console.error("Error fetching dashboard stats:", error);
				setStats(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, []);

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

					{isLoading ? (
						<Center py={12}>
							<Spinner size="xl" color="brand.500" thickness="4px" />
						</Center>
					) : stats ? (
						<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
							<Stat
								bg="white"
								p={6}
								borderRadius="xl"
								boxShadow="sm"
								borderLeft="4px solid"
								borderLeftColor="brand.500">
								<HStack spacing={3} mb={2}>
									<Icon as={MdInventory} boxSize={6} color="brand.500" />
									<StatLabel fontSize="sm" color="gray.600">Tổng sản phẩm</StatLabel>
								</HStack>
								<StatNumber fontSize="3xl" color="brand.600">{stats.totalProducts}</StatNumber>
								<StatHelpText color="gray.500">Trong kho</StatHelpText>
							</Stat>

							<Stat
								bg="white"
								p={6}
								borderRadius="xl"
								boxShadow="sm"
								borderLeft="4px solid"
								borderLeftColor="green.500">
								<HStack spacing={3} mb={2}>
									<Icon as={MdCheckCircle} boxSize={6} color="green.500" />
									<StatLabel fontSize="sm" color="gray.600">Còn hàng</StatLabel>
								</HStack>
								<StatNumber fontSize="3xl" color="green.600">{stats.inStockCount}</StatNumber>
								<StatHelpText color="gray.500">Sản phẩm</StatHelpText>
							</Stat>

							<Stat
								bg="white"
								p={6}
								borderRadius="xl"
								boxShadow="sm"
								borderLeft="4px solid"
								borderLeftColor="orange.500">
								<HStack spacing={3} mb={2}>
									<Icon as={MdWarning} boxSize={6} color="orange.500" />
									<StatLabel fontSize="sm" color="gray.600">Sắp hết hàng</StatLabel>
								</HStack>
								<StatNumber fontSize="3xl" color="orange.600">{stats.lowStockCount}</StatNumber>
								<StatHelpText color="gray.500">Cần nhập thêm</StatHelpText>
							</Stat>

							<Stat
								bg="white"
								p={6}
								borderRadius="xl"
								boxShadow="sm"
								borderLeft="4px solid"
								borderLeftColor="red.500">
								<HStack spacing={3} mb={2}>
									<Icon as={MdAccessTime} boxSize={6} color="red.500" />
									<StatLabel fontSize="sm" color="gray.600">Sắp hết hạn</StatLabel>
								</HStack>
								<StatNumber fontSize="3xl" color="red.600">{stats.expiringCount}</StatNumber>
								<StatHelpText color="gray.500">Cần xử lý</StatHelpText>
							</Stat>
						</SimpleGrid>
					) : (
						<Box
							bg="white"
							p={8}
							borderRadius="xl"
							boxShadow="md"
							textAlign="center">
							<Text color="gray.500">
								Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
							</Text>
						</Box>
					)}
				</VStack>
			</Container>
		</MainLayout>
	);
};

export default DashboardPage;
