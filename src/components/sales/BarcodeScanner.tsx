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
			description: "Nhập mã lô hàng vào ô bên dưới hoặc quét mã barcode",
			status: "info",
			duration: 4000,
		});
	};

	/**
	 * Maps API CheckProductResponse to UI Product type
	 * This is a bridge layer to preserve existing UI while using real API
	 */
	const mapToUIProduct = (response: CheckProductResponse): Product => {
		// Parse expirationDate from API (dd-MM-yyyy) or use far future if not provided
		let expiryDate = new Date(2099, 11, 31); // Default: far future (no expiry check)
		if (response.expirationDate) {
			const parts = response.expirationDate.split("-");
			if (parts.length === 3) {
				expiryDate = new Date(
					parseInt(parts[2]),
					parseInt(parts[1]) - 1,
					parseInt(parts[0]),
				);
			}
		}

		return {
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
					expiryDate,
					importDate: new Date(),
				},
			],
		};
	};

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
