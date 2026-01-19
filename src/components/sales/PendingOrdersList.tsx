import { useRef, useState } from "react";
import {
	Box,
	Flex,
	Text,
	Badge,
	HStack,
	IconButton,
	Tooltip,
	useToast,
	SimpleGrid,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	Button,
	useDisclosure,
} from "@chakra-ui/react";
import type { PendingOrder } from "@/types/sales";
import { DeleteIcon, RepeatIcon } from "@chakra-ui/icons";

interface PendingOrdersListProps {
	pendingOrders: PendingOrder[];
	onRestore: (order: PendingOrder) => void;
	onDelete: (orderId: string) => void;
}

const PendingOrdersList = ({
	pendingOrders,
	onRestore,
	onDelete,
}: PendingOrdersListProps) => {
	const toast = useToast();
	
	// Delete confirmation dialog state
	const [orderToDelete, setOrderToDelete] = useState<{id: string; orderNumber: string} | null>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);
	const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleRestore = (order: PendingOrder) => {
		onRestore(order);
		toast({
			title: "Đã khôi phục hóa đơn",
			description: `Hóa đơn ${order.orderNumber} đã được khôi phục`,
			status: "success",
			duration: 2000,
			isClosable: true,
			position: "top",
		});
	};

	const handleDelete = (orderId: string, orderNumber: string) => {
		setOrderToDelete({ id: orderId, orderNumber });
		onDeleteAlertOpen();
	};

	const handleDeleteConfirm = () => {
		if (orderToDelete) {
			onDelete(orderToDelete.id);
			toast({
				title: "Đã xóa hóa đơn",
				description: `Hóa đơn ${orderToDelete.orderNumber} đã được xóa`,
				status: "info",
				duration: 2000,
				isClosable: true,
				position: "top",
			});
			setOrderToDelete(null);
			onDeleteAlertClose();
		}
	};

	if (pendingOrders.length === 0) {
		return null;
	}

	return (
		<Box
			bg="white"
			borderRadius="xl"
			p={6}
			mb={5}
			boxShadow="sm"
			border="2px solid"
			borderColor="orange.200">
			<Flex
				justify="space-between"
				align="center"
				mb={4}>
				<HStack spacing={2}>
					<Text
						fontWeight="bold"
						color="#161f70"
						fontSize="lg">
						Hóa đơn tạm dừng
					</Text>
					<Badge
						colorScheme="orange"
						fontSize="md"
						px={3}
						py={1}
						borderRadius="full">
						{pendingOrders.length}
					</Badge>
				</HStack>
			</Flex>

			<SimpleGrid
				columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
				spacing={3}>
				{pendingOrders.map((order) => (
					<Box
						key={order.id}
						bg="orange.50"
						p={4}
						borderRadius="lg"
						borderWidth="2px"
						borderColor="orange.200"
						_hover={{
							bg: "orange.100",
							borderColor: "orange.400",
							transform: "translateY(-2px)",
							boxShadow: "md",
						}}
						transition="all 0.2s"
						cursor="pointer">
						<Flex
							direction="column"
							gap={2}>
							<Flex
								justify="space-between"
								align="flex-start">
								<Box flex={1}>
									<Text
										fontWeight="bold"
										color="#161f70"
										fontSize="md"
										mb={1}>
										{order.orderNumber}
									</Text>
									<Badge
										colorScheme="blue"
										fontSize="xs"
										mb={2}>
										{order.items.length} SP
									</Badge>
								</Box>
							</Flex>

							<Text
								fontSize="sm"
								color="gray.700"
								fontWeight="medium"
								noOfLines={1}>
								{order.customer?.name || "Khách vãng lai"}
							</Text>

							{order.customer?.phone && (
								<Text
									fontSize="xs"
									color="gray.600"
									noOfLines={1}>
									{order.customer.phone}
								</Text>
							)}

							<Text
								fontSize="xs"
								color="gray.600"
								mt={1}>
								{formatTime(order.pausedAt)}
							</Text>

							<Flex
								gap={2}
								mt={2}>
								<Tooltip label="Khôi phục">
									<IconButton
										aria-label="Restore order"
										icon={<RepeatIcon />}
										colorScheme="green"
										size="sm"
										flex={1}
										onClick={() => handleRestore(order)}
									/>
								</Tooltip>
								<Tooltip label="Xóa">
									<IconButton
										aria-label="Delete order"
										icon={<DeleteIcon />}
										colorScheme="red"
										variant="outline"
										size="sm"
										onClick={() =>
											handleDelete(
												order.id,
												order.orderNumber,
											)
										}
									/>
								</Tooltip>
							</Flex>
						</Flex>
					</Box>
				))}
			</SimpleGrid>

			{/* Delete Confirmation Dialog - Branded, accessible UX */}
			<AlertDialog
				isOpen={isDeleteAlertOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteAlertClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Xóa Hóa Đơn Tạm Dừng
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc muốn xóa hóa đơn{" "}
							<Text as="span" fontWeight="bold">
								{orderToDelete?.orderNumber}
							</Text>
							? Dữ liệu sẽ mất vĩnh viễn và không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onDeleteAlertClose}>
								Hủy
							</Button>
							<Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
								Xóa
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
};

export default PendingOrdersList;
