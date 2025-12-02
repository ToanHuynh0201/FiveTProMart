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
	Input,
	Code,
	Badge,
	useToast,
	Kbd,
	Alert,
	AlertIcon,
} from "@chakra-ui/react";
import {
	FiCamera,
	FiType,
	FiCheck,
	FiX,
	FiVideo,
	FiVideoOff,
} from "react-icons/fi";
import type { Product } from "../../types/sales";
import { salesService } from "../../services/salesService";

interface BarcodeScannerProps {
	isOpen: boolean;
	onClose: () => void;
	onProductFound: (product: Product) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
	isOpen,
	onClose,
	onProductFound,
}) => {
	const toast = useToast();
	const [scanMode, setScanMode] = useState<"camera" | "manual">("manual");
	const [barcodeInput, setBarcodeInput] = useState("");
	const [isScanning, setIsScanning] = useState(false);
	const [lastScanned, setLastScanned] = useState<string>("");
	const [isCameraActive, setIsCameraActive] = useState(false);
	const [cameraError, setCameraError] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const scanIntervalRef = useRef<number>(0);

	// Demo barcodes for testing
	const demoBarcodes = [
		{ barcode: "8934567890123", name: "Bánh snack bắp cải trộn" },
		{ barcode: "8934567890124", name: "Bánh snack củ cải trộn" },
		{ barcode: "8934567890125", name: "Nước ngọt Coca Cola" },
		{ barcode: "8934567890126", name: "Nước suối Lavie" },
		{ barcode: "8934567890127", name: "Mì gói Hảo Hảo" },
		{ barcode: "8934567890128", name: "Mì ly Kokomi" },
		{ barcode: "8934567890129", name: "Snack khoai tây Lays" },
	];

	useEffect(() => {
		if (isOpen && scanMode === "manual") {
			// Auto focus input when modal opens
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}

		// Cleanup when modal closes
		return () => {
			stopCamera();
		};
	}, [isOpen, scanMode]);

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

	// Switch mode handler
	const handleModeSwitch = async (mode: "camera" | "manual") => {
		setScanMode(mode);
		if (mode === "camera") {
			await startCamera();
		} else {
			stopCamera();
		}
	};

	const handleBarcodeScanned = async (barcode: string) => {
		if (!barcode.trim()) return;

		setIsScanning(true);
		setLastScanned(barcode);

		try {
			// Search for product by barcode
			const results = await salesService.searchProducts(barcode);
			const product = results.find((p) => p.barcode === barcode);

			if (product) {
				toast({
					title: "Quét thành công!",
					description: `Đã tìm thấy: ${product.name}`,
					status: "success",
					duration: 2000,
					icon: <Icon as={FiCheck} />,
				});
				onProductFound(product);
				setBarcodeInput("");
				onClose();
			} else {
				toast({
					title: "Không tìm thấy sản phẩm",
					description: `Mã vạch ${barcode} không có trong hệ thống`,
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

	const handleManualSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleBarcodeScanned(barcodeInput);
	};

	const handleDemoBarcode = (barcode: string) => {
		setBarcodeInput(barcode);
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
						Quét mã vạch
					</Flex>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack
						spacing={5}
						align="stretch">
						{/* Mode Selection */}
						<Flex gap={3}>
							<Button
								flex={1}
								size="lg"
								variant={
									scanMode === "camera" ? "solid" : "outline"
								}
								colorScheme={
									scanMode === "camera" ? "brand" : "gray"
								}
								leftIcon={<Icon as={FiCamera} />}
								onClick={() => handleModeSwitch("camera")}>
								Camera
							</Button>
							<Button
								flex={1}
								size="lg"
								variant={
									scanMode === "manual" ? "solid" : "outline"
								}
								colorScheme={
									scanMode === "manual" ? "brand" : "gray"
								}
								leftIcon={<Icon as={FiType} />}
								onClick={() => handleModeSwitch("manual")}>
								Nhập thủ công
							</Button>
						</Flex>

						{scanMode === "manual" && (
							<>
								{/* Manual Input */}
								<Box>
									<form onSubmit={handleManualSubmit}>
										<VStack
											spacing={3}
											align="stretch">
											<Text
												fontSize="14px"
												fontWeight="600"
												color="gray.700">
												Nhập mã vạch:
											</Text>
											<Input
												ref={inputRef}
												size="lg"
												placeholder="Nhập hoặc quét mã vạch..."
												value={barcodeInput}
												onChange={(e) =>
													setBarcodeInput(
														e.target.value,
													)
												}
												bg="gray.50"
												border="2px solid"
												borderColor="gray.200"
												_focus={{
													bg: "white",
													borderColor: "brand.500",
													boxShadow:
														"0 0 0 3px rgba(22, 31, 112, 0.1)",
												}}
												fontSize="16px"
												fontFamily="monospace"
												isDisabled={isScanning}
											/>
											<Button
												type="submit"
												colorScheme="brand"
												size="lg"
												isLoading={isScanning}
												loadingText="Đang tìm kiếm..."
												isDisabled={
													!barcodeInput.trim()
												}>
												<Icon
													as={FiCheck}
													mr={2}
												/>
												Tìm kiếm
											</Button>
										</VStack>
									</form>
								</Box>

								{/* Demo Barcodes */}
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
											Mã vạch demo (Click để test):
										</Text>
										<Badge
											colorScheme="purple"
											fontSize="11px">
											Dùng để demo
										</Badge>
									</Flex>
									<VStack
										spacing={2}
										align="stretch"
										maxH="250px"
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
														<Code
															fontSize="12px"
															colorScheme="purple"
															px={2}
															py={0.5}
															borderRadius="4px">
															{item.barcode}
														</Code>
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

								{/* Tips */}
								<Box
									p={3}
									bg="blue.50"
									borderRadius="8px"
									border="1px solid"
									borderColor="blue.200">
									<Text
										fontSize="13px"
										color="blue.800"
										fontWeight="500">
										💡 <strong>Mẹo:</strong> Khi có máy quét
										mã vạch, chỉ cần focus vào ô input và
										quét. Mã vạch sẽ tự động nhập vào.
									</Text>
									<Flex
										gap={2}
										mt={2}
										flexWrap="wrap">
										<Text
											fontSize="12px"
											color="blue.700">
											Hoặc nhấn:
										</Text>
										<Kbd fontSize="12px">Ctrl</Kbd>
										<Text
											fontSize="12px"
											color="blue.700">
											+
										</Text>
										<Kbd fontSize="12px">B</Kbd>
										<Text
											fontSize="12px"
											color="blue.700">
											để mở nhanh
										</Text>
									</Flex>
								</Box>
							</>
						)}

						{scanMode === "camera" && (
							<>
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
																Camera đang hoạt
																động
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

								{/* Demo barcodes for camera mode */}
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
											Mã vạch demo (Click để test với
											camera):
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
														<Code
															fontSize="12px"
															colorScheme="purple"
															px={2}
															py={0.5}
															borderRadius="4px">
															{item.barcode}
														</Code>
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
							</>
						)}

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
									Mã vạch vừa quét:
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
