import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	VStack,
	HStack,
	FormControl,
	FormLabel,
	Input,
	Text,
	useToast,
	Spinner,
	Box,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { salaryService } from "@/services";
import type { SalaryRoleConfig, UpdateSalaryConfigRequest } from "@/types";

interface SalaryConfigModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export const SalaryConfigModal: React.FC<SalaryConfigModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
}) => {
	const toast = useToast();
	const [configs, setConfigs] = useState<SalaryRoleConfig[]>([]);
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [rates, setRates] = useState<Record<string, number>>({});

	const defaultConfigs: SalaryRoleConfig[] = [
		{
			id: "SalesStaff",
			role: "SalesStaff",
			hourlySalary: 0,
			updatedAt: "",
		},
		{
			id: "WarehouseStaff",
			role: "WarehouseStaff",
			hourlySalary: 0,
			updatedAt: "",
		},
	];

	// Load configs on modal open
	useEffect(() => {
		if (isOpen) {
			loadConfigs();
		}
	}, [isOpen]);

	const loadConfigs = async () => {
		setLoading(true);
		try {
			const response = await salaryService.getSalaryConfigs();
			if (!response.success) {
				throw new Error(response.message || "Không thể tải cấu hình lương");
			}
			const data = response.data && response.data.length > 0 ? response.data : defaultConfigs;
			setConfigs(data);
			const ratesMap = data.reduce(
				(acc, config) => {
					acc[config.role] =
						(config as any).hourlyRate ?? (config as any).hourlySalary ?? 0;
					return acc;
				},
				{} as Record<string, number>,
			);
			setRates(ratesMap);
		} catch (error) {
			setConfigs(defaultConfigs);
			setRates({ SalesStaff: 0, WarehouseStaff: 0 });
			toast({
				title: "Lỗi",
				description:
					error instanceof Error
						? error.message
						: "Không thể tải cấu hình lương",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleRateChange = (role: string, value: string) => {
		setRates((prev) => ({
			...prev,
			[role]: parseFloat(value) || 0,
		}));
	};

	const handleSave = async () => {
		// Validate rates
		const invalidRates = Object.entries(rates).some(([_, rate]) => rate < 0);
		if (invalidRates) {
			toast({
				title: "Lỗi",
				description: "Lương giờ không được âm",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setUpdating(true);
		try {
			const request: UpdateSalaryConfigRequest = {
				configs: Object.entries(rates).map(([role, hourlyRate]) => ({
					role: role as "SalesStaff" | "WarehouseStaff",
					hourlyRate,
				})),
			};

			const response = await salaryService.updateSalaryConfigs(request);

			if (!response.success) {
				throw new Error(response.message || "Cập nhật cấu hình lương thất bại");
			}

			toast({
				title: "Thành công",
				description: "Cập nhật cấu hình lương thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			onSuccess?.();
			onClose();
		} catch (error: any) {
			toast({
				title: "Lỗi",
				description: error?.message || "Không thể cập nhật cấu hình lương",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setUpdating(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Cấu hình lương theo chức vụ</ModalHeader>
				<ModalCloseButton isDisabled={loading || updating} />
				<ModalBody>
					{loading ? (
						<Box display="flex" justifyContent="center" py={8}>
							<Spinner />
						</Box>
					) : (
						<VStack spacing={4} align="stretch">
							{configs.map((config) => (
								<FormControl key={config.role}>
									<FormLabel>
										{config.role === "SalesStaff"
											? "Nhân viên bán hàng"
											: "Nhân viên kho"}
									</FormLabel>
									<HStack>
										<Input
											type="number"
											min={0}
											value={rates[config.role] || ""}
											onChange={(e) =>
												handleRateChange(config.role, e.target.value)
											}
											placeholder="Nhập lương giờ"
											isDisabled={updating}
										/>
										<Text fontSize="sm" whiteSpace="nowrap">
											đ/giờ
										</Text>
									</HStack>
									<Text fontSize="xs" color="gray.600" mt={1}>
										Cập nhật: {config.updatedAt}
									</Text>
								</FormControl>
							))}
						</VStack>
					)}
				</ModalBody>
				<ModalFooter gap={3}>
					<Button variant="ghost" onClick={onClose} isDisabled={updating}>
						Hủy
					</Button>
					<Button
						colorScheme="blue"
						onClick={handleSave}
						isLoading={updating}
						isDisabled={loading}
					>
						Lưu
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
