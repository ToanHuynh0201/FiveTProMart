import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    useToast,
    Box,
    Text,
    VStack,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Spinner,
    Badge,
    Divider,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { salaryService } from "@/services";

interface StaffSalaryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffId: string;
    startDate: string; // dd-MM-yyyy
    endDate: string; // dd-MM-yyyy
}

interface DailyDetail {
    date: string; // dd-MM-yyyy
    workHours: number;
    appliedRate: number;
    dailyAmount: number;
}

// SỬA: Cập nhật interface khớp với backend (SalaryReportDateRange thường trả về startDate/endDate)
interface StaffSalaryData {
    userId: string;
    fullName: string;
    role: string;
    range: {
        startDate: string; // Sửa từ fromDate -> startDate
        endDate: string;   // Sửa từ toDate -> endDate
    };
    summary: {
        totalSalary: number;
        totalWorkHours: number;
    };
    dailyDetails: DailyDetail[];
}

export const StaffSalaryDetailModal: React.FC<StaffSalaryDetailModalProps> = ({
    isOpen,
    onClose,
    staffId,
    startDate,
    endDate,
}) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    // State sử dụng interface đã cập nhật
    const [data, setData] = useState<StaffSalaryData | null>(null);

    useEffect(() => {
        if (isOpen && staffId) {
            loadStaffSalaryDetail();
        }
    }, [isOpen, staffId, startDate, endDate]);

    const loadStaffSalaryDetail = async () => {
        setLoading(true);
        try {
            const response = await salaryService.getStaffSalaryReport(staffId, {
                startDate,
                endDate,
            });

            if (response.success && response.data) {
                // Backend trả về StaffSalaryReport, ta ép kiểu về StaffSalaryData
                // (Giả sử cấu trúc JSON thực tế khớp với interface StaffSalaryData đã sửa ở trên)
                setData(response.data as unknown as StaffSalaryData);
            } else {
                throw new Error(response.message || "Không thể tải dữ liệu");
            }
        } catch (error: any) {
            console.error("Load staff salary detail error:", error);
			
			// Kiểm tra nếu lỗi 500 từ backend (staff không tồn tại)
			const isStaffNotFound = error?.message?.includes("Cannot invoke") || 
									  error?.message?.includes("null") ||
									  error?.status === 500;
			
			toast({
				title: "Lỗi",
				description: isStaffNotFound 
					? "Nhân viên không tồn tại hoặc đã bị xóa" 
					: error?.message || "Nhân viên không tồn tại hoặc chưa có dữ liệu lương",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			// Auto close modal on error
			setTimeout(() => {
				onClose();
			}, 1000);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number): string => {
		if (amount >= 1000000) {
			return `${(amount / 1000000).toFixed(1)}M`;
		}
		if (amount >= 1000) {
			return `${(amount / 1000).toFixed(0)}K`;
		}
		return amount.toString();
	};

    const getRoleName = (role: string): string => {
        const roleMap: Record<string, string> = {
            SalesStaff: "Nhân viên bán hàng",
            WarehouseStaff: "Nhân viên kho",
        };
        return roleMap[role] || role;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent maxH="90vh">
                <ModalHeader>Chi tiết lương nhân viên</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {loading ? (
                        <Box textAlign="center" py={10}>
                            <Spinner size="xl" color="blue.500" />
                            <Text mt={4} color="gray.600">
                                Đang tải dữ liệu...
                            </Text>
                        </Box>
                    ) : data ? (
                        <VStack align="stretch" spacing={6}>
                            {/* Staff Info */}
                            <Box bg="blue.50" p={4} borderRadius="md">
                                <HStack justify="space-between" mb={2}>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {data.fullName}
                                    </Text>
                                    <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                        {getRoleName(data.role)}
                                    </Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                    {/* SỬA: Dùng đúng key startDate/endDate */}
                                    Kỳ lương: {data.range.startDate} - {data.range.endDate}
                                </Text>
                            </Box>

                            {/* Summary */}
                            <HStack spacing={4}>
                                <Box flex={1} bg="green.50" p={4} borderRadius="md">
                                    <Text fontSize="sm" color="gray.600">
                                        Tổng lương
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                        {formatCurrency(data.summary.totalSalary)} VNĐ
                                    </Text>
                                </Box>
                                <Box flex={1} bg="purple.50" p={4} borderRadius="md">
                                    <Text fontSize="sm" color="gray.600">
                                        Tổng giờ công
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                        {data.summary.totalWorkHours.toFixed(1)} giờ
                                    </Text>
                                </Box>
                            </HStack>

                            <Divider />

                            {/* Daily Details Table */}
                            <Box>
                                <Text fontSize="lg" fontWeight="bold" mb={3}>
                                    Chi tiết theo ngày
                                </Text>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Ngày</Th>
                                                <Th isNumeric>Giờ công</Th>
                                                <Th isNumeric>Đơn giá/giờ</Th>
                                                <Th isNumeric>Thành tiền</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data.dailyDetails.length > 0 ? (
                                                data.dailyDetails.map((detail, index) => (
                                                    <Tr key={index}>
                                                        <Td>{detail.date}</Td>
                                                        <Td isNumeric>{detail.workHours.toFixed(1)}</Td>
                                                        <Td isNumeric>
                                                            {formatCurrency(detail.appliedRate)} VNĐ
                                                        </Td>
                                                        <Td isNumeric fontWeight="bold">
                                                            {formatCurrency(detail.dailyAmount)} VNĐ
                                                        </Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr>
                                                    <Td colSpan={4} textAlign="center" py={6}>
                                                        <Text color="gray.500">
                                                            Không có dữ liệu trong kỳ này
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </VStack>
                    ) : (
                        <Box textAlign="center" py={10}>
                            <Text color="gray.500">Không có dữ liệu</Text>
                        </Box>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button onClick={onClose}>Đóng</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};