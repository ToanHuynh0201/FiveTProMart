import { useState, useEffect, useRef } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
	VStack,
	Text,
	Button,
	Icon,
	Flex,
	Code,
	Badge,
	useToast,
	Alert,
	AlertIcon,
} from "@chakra-ui/react";
import { FiCamera, FiCheck, FiX, FiVideo, FiVideoOff } from "react-icons/fi";
import type { Product } from "../../types/sales";

interface BarcodeScannerProps {
	isOpen: boolean;
	onClose: () => void;
	onProductFound: (product: Product, batchId?: string, batchNumber?: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
	isOpen,
	onClose,
	onProductFound,
}) => {
	const toast = useToast();
	const [isScanning, setIsScanning] = useState(false);
	const [lastScanned, setLastScanned] = useState<string>("");
	const [isCameraActive, setIsCameraActive] = useState(false);
	const [cameraError, setCameraError] = useState<string>("");
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const scanIntervalRef = useRef<number>(0);

	// Demo barcodes for testing - chỉ mã lô hàng
	const demoBarcodes = [
		{ barcode: "LOT001", name: "Bánh snack bắp cải trộn - Lô 001", expiryDate: "31/12/2025" },
		{ barcode: "LOT002", name: "Bánh snack bắp cải trộn - Lô 002", expiryDate: "29/11/2025" },
		{ barcode: "LOT003", name: "Bánh snack củ cải trộn - Lô 003", expiryDate: "15/01/2026" },
		{ barcode: "LOT004", name: "Bánh snack củ cải trộn - Lô 004", expiryDate: "01/12/2025" },
		{ barcode: "LOT005", name: "Củ cải vàng - Lô 005", expiryDate: "20/12/2025" },
		{ barcode: "LOT006", name: "Củ cải vàng - Lô 006", expiryDate: "28/11/2025" },
	];

	useEffect(() => {
		if (isOpen) {
			// Auto start camera when modal opens
			startCamera();
		}

		// Cleanup when modal closes
		return () => {
			stopCamera();
		};
	}, [isOpen]);

	// Start camera
	const startCamera = async () => {
		setCameraError("");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" }, // Use back camera on mobile
			});

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;
				setIsCameraActive(true);

				// Start barcode detection simulation
				// In production, you would use a library like @zxing/browser or quagga2
				startBarcodeDetection();
			}
		} catch (error) {
			console.error("Camera error:", error);
			setCameraError(
				"Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập hoặc sử dụng chế độ nhập thủ công.",
			);
			toast({
				title: "Lỗi camera",
				description: "Không thể khởi động camera",
				status: "error",
				duration: 3000,
			});
		}
	};

	// Stop camera
	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		if (scanIntervalRef.current) {
			clearInterval(scanIntervalRef.current);
		}
		setIsCameraActive(false);
	};

	// Simulated barcode detection (in production, use a real library)
	const startBarcodeDetection = () => {
		// This is a simulation. In production, you'd use BarcodeDetector API or a library
		// For now, we'll just show the demo barcodes for user to click
		toast({
			title: "Camera đang hoạt động",
			description: "Để demo, vui lòng click vào mã vạch bên dưới",
			status: "info",
			duration: 4000,
		});
	};

	const handleBarcodeScanned = async (barcode: string) => {
		if (!barcode.trim()) return;

		setIsScanning(true);
		setLastScanned(barcode);

		try {
			// TODO: Implement searchProductByBatchCode API call from salesService
			// const batchResult = await salesService.searchProductByBatchCode(barcode);
			const batchResult = null;

			if (batchResult) {
				// Tìm thấy lô hàng
				toast({
					title: "Quét mã lô hàng thành công!",
					description: `Đã thêm: ${batchResult.product.name} - Lô ${batchResult.batch.batchNumber}`,
					status: "success",
					duration: 2000,
					icon: <Icon as={FiCheck} />,
				});
				onProductFound(batchResult.product, batchResult.batch.id, batchResult.batch.batchNumber);
				onClose();
			} else {
				toast({
					title: "Không tìm thấy lô hàng",
					description: `Mã lô "${barcode}" không có trong hệ thống. Vui lòng quét mã lô hàng hợp lệ (VD: LOT001)`,
					status: "warning",
					duration: 3000,
					icon: <Icon as={FiX} />,
				});
			}
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Không thể quét mã vạch",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsScanning(false);
		}
	};

	const handleDemoBarcode = (barcode: string) => {
		handleBarcodeScanned(barcode);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			isCentered>
			<ModalOverlay
				bg="blackAlpha.700"
				backdropFilter="blur(8px)"
			/>
			<ModalContent borderRadius="16px">
				<ModalHeader
					fontSize="22px"
					fontWeight="700"
					color="brand.600"
					pb={3}>
					<Flex
						align="center"
						gap={3}>
						<Icon
							as={FiCamera}
							w="24px"
							h="24px"
						/>
						Quét mã lô hàng
					</Flex>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack
						spacing={5}
						align="stretch">
						{/* Camera View */}
						<Box
							position="relative"
							bg="black"
							borderRadius="12px"
							overflow="hidden"
							minH="400px">
							{cameraError ? (
								<Alert
									status="error"
									borderRadius="12px">
									<AlertIcon />
									{cameraError}
								</Alert>
							) : (
								<>
									<video
										ref={videoRef}
										autoPlay
										playsInline
										muted
										style={{
											width: "100%",
											height: "400px",
											objectFit: "cover",
											borderRadius: "12px",
										}}
									/>
									{isCameraActive && (
										<>
											{/* Scanning overlay */}
											<Box
												position="absolute"
												top="50%"
												left="50%"
												transform="translate(-50%, -50%)"
												width="80%"
												height="200px"
												border="3px solid"
												borderColor="green.400"
												borderRadius="12px"
												boxShadow="0 0 0 9999px rgba(0,0,0,0.5)"
												pointerEvents="none">
												<Box
													position="absolute"
													top={0}
													left={0}
													right={0}
													height="3px"
													bg="green.400"
													animation="scan 2s ease-in-out infinite"
													sx={{
														"@keyframes scan":
															{
																"0%, 100%":
																	{
																		top: "0",
																	},
																"50%": {
																	top: "calc(100% - 3px)",
																},
															},
													}}
												/>
											</Box>
											{/* Status */}
											<Flex
												position="absolute"
												bottom={4}
												left={4}
												right={4}
												justify="center"
												gap={2}>
												<Badge
													colorScheme="green"
													fontSize="14px"
													px={4}
													py={2}
													borderRadius="full">
													<Flex
														align="center"
														gap={2}>
														<Icon
															as={FiVideo}
															w="16px"
															h="16px"
														/>
														Camera đang hoạt động
													</Flex>
												</Badge>
											</Flex>
										</>
									)}
								</>
							)}
						</Box>

						{/* Camera Controls */}
						<Flex gap={3}>
							<Button
								flex={1}
								colorScheme="red"
								variant="outline"
								leftIcon={<Icon as={FiVideoOff} />}
								onClick={stopCamera}
								isDisabled={!isCameraActive}>
								Tắt camera
							</Button>
							<Button
								flex={1}
								colorScheme="green"
								leftIcon={<Icon as={FiVideo} />}
								onClick={startCamera}
								isDisabled={isCameraActive}>
								Bật camera
							</Button>
						</Flex>

						{/* Demo barcodes */}
						<Box
							pt={4}
							borderTop="1px solid"
							borderColor="gray.200">
							<Flex
								justify="space-between"
								align="center"
								mb={3}>
								<Text
									fontSize="14px"
									fontWeight="700"
									color="gray.700">
									Mã lô hàng demo (Click để test):
								</Text>
								<Badge
									colorScheme="purple"
									fontSize="11px">
									Demo mode
								</Badge>
							</Flex>
							<VStack
								spacing={2}
								align="stretch"
								maxH="200px"
								overflowY="auto"
								pr={2}
								sx={{
									"&::-webkit-scrollbar": {
										width: "6px",
									},
									"&::-webkit-scrollbar-track": {
										bg: "gray.50",
										borderRadius: "10px",
									},
									"&::-webkit-scrollbar-thumb": {
										bg: "gray.300",
										borderRadius: "10px",
										"&:hover": {
											bg: "gray.400",
										},
									},
								}}>
								{demoBarcodes.map((item) => (
									<Box
										key={item.barcode}
										p={3}
										bg="gray.50"
										borderRadius="8px"
										cursor="pointer"
										border="2px solid transparent"
										transition="all 0.2s"
										_hover={{
											bg: "brand.50",
											borderColor: "brand.200",
											transform:
												"translateY(-2px)",
										}}
										onClick={() =>
											handleDemoBarcode(
												item.barcode,
											)
										}>
										<Flex
											justify="space-between"
											align="center"
											gap={3}>
											<Box flex={1}>
												<Text
													fontSize="13px"
													fontWeight="600"
													color="gray.800"
													mb={1}>
													{item.name}
												</Text>
												<Flex gap={2} align="center">
													<Code
														fontSize="12px"
														colorScheme="orange"
														px={2}
														py={0.5}
														borderRadius="4px">
														{item.barcode}
													</Code>
													<Text fontSize="11px" color="gray.600">
														HSD: {item.expiryDate}
													</Text>
												</Flex>
											</Box>
											<Icon
												as={FiCheck}
												color="brand.500"
												w="18px"
												h="18px"
											/>
										</Flex>
									</Box>
								))}
							</VStack>
						</Box>

						{lastScanned && (
							<Box
								p={3}
								bg="green.50"
								borderRadius="8px"
								border="1px solid"
								borderColor="green.200">
								<Text
									fontSize="12px"
									fontWeight="600"
									color="green.800"
									mb={1}>
									Mã lô vừa quét:
								</Text>
								<Code
									fontSize="14px"
									colorScheme="green"
									px={2}
									py={1}>
									{lastScanned}
								</Code>
							</Box>
						)}
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
