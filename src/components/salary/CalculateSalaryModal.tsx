import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	FormControl,
	FormLabel,
	Input,
	useToast,
	Box,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { salaryService } from "@/services";

interface CalculateSalaryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export const CalculateSalaryModal: React.FC<CalculateSalaryModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
}) => {
	const toast = useToast();
	const [selectedDate, setSelectedDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<any>(null);

	const handleCalculate = async () => {
		if (!selectedDate) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn ngày",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setLoading(true);
		try {
			// Convert date format to dd-MM-yyyy
			const [year, month, day] = selectedDate.split("-");
			const dateStr = `${day}-${month}-${year}`;

			const response = await salaryService.calculateDailySalary({
				date: dateStr,
			});

			setResult(response.data);

			toast({
				title: "Thành công",
				description: "Tính lương hàng ngày thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			onSuccess?.();
		} catch (error: any) {
			toast({
				title: "Lỗi",
				description:
					error?.message ||
					"Không thể tính lương. Ngày phải trước hôm nay.",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setSelectedDate("");
		setResult(null);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="lg">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Tính lương hàng ngày</ModalHeader>
				<ModalCloseButton isDisabled={loading} />
				<ModalBody>
					{!result ? (
						<VStack spacing={4}>
							<FormControl>
								<FormLabel>Chọn ngày tính lương</FormLabel>
								<Input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									isDisabled={loading}
									max={
										new Date(Date.now() - 86400000)
											.toISOString()
											.split("T")[0]
									}
								/>
								<Text fontSize="xs" color="gray.600" mt={2}>
									Ngày phải trước hôm nay
								</Text>
							</FormControl>
						</VStack>
					) : (
						<VStack spacing={4} align="start">
							<Box
								p={4}
								bg="green.50"
								borderRadius="md"
								borderLeft="4px"
								borderColor="green.500"
								w="full"
							>
								<Text fontWeight="bold" color="green.800" mb={2}>
									Tính lương thành công
								</Text>
								<Text color="green.700">
									Ngày: {result.processedDate}
								</Text>
								<Text color="green.700">Trạng thái: {result.status}</Text>
							</Box>
						</VStack>
					)}
				</ModalBody>
				<ModalFooter gap={3}>
					<Button variant="ghost" onClick={handleClose} isDisabled={loading}>
						{result ? "Đóng" : "Hủy"}
					</Button>
					{!result && (
						<Button
							colorScheme="blue"
							onClick={handleCalculate}
							isLoading={loading}
						>
							Tính lương
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
