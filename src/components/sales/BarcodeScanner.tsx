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
	Input,
	InputGroup,
	InputLeftElement,
	Spinner,
} from "@chakra-ui/react";
import { FiCamera, FiCheck, FiX, FiVideo, FiVideoOff, FiSearch } from "react-icons/fi";
import type { Product, CheckProductResponse } from "../../types/sales";
import { salesService } from "../../services/salesService";

interface BarcodeScannerProps {
	isOpen: boolean;
	onClose: () => void;
	onProductFound: (product: Product, lotId?: string, lotNumber?: string) => void;
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
	const [manualInput, setManualInput] = useState("");
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const scanIntervalRef = useRef<number>(0);

	// Demo barcodes for fallback testing when API is unavailable
	const demoBarcodes = [
		{ lotId: "LOT001", name: "Bánh snack bắp cải trộn - Lô 001", expiryDate: "31/12/2025" },
		{ lotId: "LOT002", name: "Bánh snack bắp cải trộn - Lô 002", expiryDate: "29/11/2025" },
		{ lotId: "LOT003", name: "Bánh snack củ cải trộn - Lô 003", expiryDate: "15/01/2026" },
		{ lotId: "LOT004", name: "Bánh snack củ cải trộn - Lô 004", expiryDate: "01/12/2025" },
		{ lotId: "LOT005", name: "Củ cải vàng - Lô 005", expiryDate: "20/12/2025" },
		{ lotId: "LOT006", name: "Củ cải vàng - Lô 006", expiryDate: "28/11/2025" },
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
		// This is a simulation. In production, you'd use BarcodeDetector API or Quagga2
		// See: FiveTProMart_fe/document/BARCODE_IMPLEMENTATION_PLAN.md
		toast({
			title: "Camera đang hoạt động",
			description: "Nhập mã lô hàng thủ công hoặc click mã demo bên dưới",
			status: "info",
			duration: 4000,
		});
	};

	/**
	 * Maps API CheckProductResponse to UI Product type
	 * This is a bridge layer to preserve existing UI while using real API
	 */
	const mapToUIProduct = (response: CheckProductResponse): Product => ({
		id: response.productId,
		code: response.productId,
		name: response.productName,
		price: response.unitPrice,
		stock: response.currentStock,
		category: undefined,
		barcode: response.lotId,
		promotion: response.promotion?.promotionName,
		batches: [
			{
				id: response.lotId,
				batchNumber: response.lotId,
				quantity: response.currentStock,
				expiryDate: new Date(), // API doesn't return expiry, will fix later
				importDate: new Date(),
			},
		],
	});

	const handleBarcodeScanned = async (lotId: string) => {
		if (!lotId.trim()) return;

		setIsScanning(true);
		setLastScanned(lotId);

		try {
			// Call real API
			const response = await salesService.checkProduct(lotId, 1);

			// Map to UI Product type
			const uiProduct = mapToUIProduct(response);

			toast({
				title: "Quét mã lô hàng thành công!",
				description: `Đã thêm: ${response.productName} - Lô ${response.lotId}`,
				status: "success",
				duration: 2000,
				icon: <Icon as={FiCheck} />,
			});

			// Pass lotId as both batchId and batchNumber for now
			onProductFound(uiProduct, response.lotId, response.lotId);
			onClose();
		} catch (error: unknown) {
			// Handle API error
			const errorMessage =
				error instanceof Error
					? error.message
					: "Không thể kiểm tra sản phẩm";

			toast({
				title: "Không tìm thấy lô hàng",
				description: `Mã lô "${lotId}" không có trong hệ thống hoặc đã hết hạn. ${errorMessage}`,
				status: "warning",
				duration: 4000,
				icon: <Icon as={FiX} />,
			});
		} finally {
			setIsScanning(false);
		}
	};

	const handleManualSubmit = () => {
		if (manualInput.trim()) {
			handleBarcodeScanned(manualInput.trim());
			setManualInput("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleManualSubmit();
		}
	};

	const handleDemoBarcode = (lotId: string) => {
		handleBarcodeScanned(lotId);
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

						{/* Manual Input */}
						<Box
							pt={4}
							borderTop="1px solid"
							borderColor="gray.200">
							<Text
								fontSize="14px"
								fontWeight="700"
								color="gray.700"
								mb={2}>
								Nhập mã lô hàng thủ công:
							</Text>
							<Flex gap={2}>
								<InputGroup flex={1}>
									<InputLeftElement>
										<Icon as={FiSearch} color="gray.400" />
									</InputLeftElement>
									<Input
										placeholder="VD: LOT001, LOT002..."
										value={manualInput}
										onChange={(e) => setManualInput(e.target.value)}
										onKeyPress={handleKeyPress}
										isDisabled={isScanning}
									/>
								</InputGroup>
								<Button
									colorScheme="brand"
									onClick={handleManualSubmit}
									isLoading={isScanning}
									loadingText="Đang kiểm tra..."
									leftIcon={isScanning ? undefined : <Icon as={FiCheck} />}>
									Kiểm tra
								</Button>
							</Flex>
						</Box>

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
										key={item.lotId}
										p={3}
										bg="gray.50"
										borderRadius="8px"
										cursor={isScanning ? "wait" : "pointer"}
										border="2px solid transparent"
										transition="all 0.2s"
										opacity={isScanning ? 0.6 : 1}
										_hover={{
											bg: isScanning ? "gray.50" : "brand.50",
											borderColor: isScanning ? "transparent" : "brand.200",
											transform: isScanning ? "none" : "translateY(-2px)",
										}}
										onClick={() =>
											!isScanning && handleDemoBarcode(item.lotId)
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
														{item.lotId}
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
