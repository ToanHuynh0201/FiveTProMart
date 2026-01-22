import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	Button,
	Box,
	Text,
} from "@chakra-ui/react";
import type { SalesOrder } from "@/types/sales";
import { formatDate, formatTime } from "@/utils/date";
import { EmptyState } from "../common";

interface OrderHistoryTableProps {
	orders: SalesOrder[];
	onViewDetail: (order: SalesOrder) => void;
}

const OrderHistoryTable = ({
	orders,
	onViewDetail,
}: OrderHistoryTableProps) => {
	const getStatusBadge = (status: SalesOrder["status"]) => {
		const statusConfig = {
			completed: { label: "Hoàn thành", colorScheme: "green" },
			draft: { label: "Nháp", colorScheme: "gray" },
			cancelled: { label: "Đã hủy", colorScheme: "red" },
		};

		const config = statusConfig[status];
		return (
			<Badge
				colorScheme={config.colorScheme}
				fontSize="sm"
				px={3}
				py={1}
				borderRadius="md">
				{config.label}
			</Badge>
		);
	};

	const getPaymentMethodLabel = (method?: string) => {
		const methods = {
			cash: "Tiền mặt",
			card: "Thẻ",
			transfer: "Chuyển khoản",
		};
		return method ? methods[method as keyof typeof methods] : "-";
	};

	if (orders.length === 0) {
		return <EmptyState variant="no-orders" size="md" />;
	}

	return (
		<Box overflowX="auto">
			<Table variant="simple">
				<Thead bg="gray.50">
					<Tr>
						<Th>Mã đơn hàng</Th>
						<Th>Khách hàng</Th>
						<Th>Số điện thoại</Th>
						<Th isNumeric>Tổng tiền</Th>
						<Th>Thanh toán</Th>
						<Th>Thời gian</Th>
						<Th>Trạng thái</Th>
						<Th>Thao tác</Th>
					</Tr>
				</Thead>
				<Tbody>
					{orders.map((order) => (
						<Tr
							key={order.id}
							_hover={{ bg: "gray.50" }}>
							<Td fontWeight="medium">{order.orderNumber}</Td>
							<Td>{order.customer?.name || "Khách lẻ"}</Td>
							<Td>{order.customer?.phone || "-"}</Td>
							<Td
								isNumeric
								fontWeight="semibold"
								color="#161f70">
								{order.total.toLocaleString("vi-VN")}đ
							</Td>
							<Td>
								{getPaymentMethodLabel(order.paymentMethod)}
							</Td>
							<Td>
								<Text fontSize="sm">
									{formatDate(order.createdAt)}
								</Text>
								<Text
									fontSize="xs"
									color="gray.500">
									{formatTime(order.createdAt)}
								</Text>
							</Td>
							<Td>{getStatusBadge(order.status)}</Td>
							<Td>
								<Button
									size="sm"
									colorScheme="blue"
									variant="ghost"
									onClick={() => onViewDetail(order)}>
									Xem chi tiết
								</Button>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</Box>
	);
};

export default OrderHistoryTable;
