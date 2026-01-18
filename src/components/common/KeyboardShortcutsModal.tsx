/**
 * Keyboard Shortcuts Help Modal
 *
 * A help overlay that shows all available keyboard shortcuts.
 * Triggered by pressing "?" anywhere in the application.
 */
import React from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
	VStack,
	HStack,
	Text,
	Kbd,
	Grid,
	GridItem,
	Badge,
	Divider,
} from "@chakra-ui/react";
import { FiCommand } from "react-icons/fi";

interface ShortcutItem {
	keys: string[];
	description: string;
}

interface ShortcutGroup {
	title: string;
	shortcuts: ShortcutItem[];
}

interface KeyboardShortcutsModalProps {
	isOpen: boolean;
	onClose: () => void;
	/** The page context to show relevant shortcuts */
	context?: "sales" | "inventory" | "global";
}

const globalShortcuts: ShortcutGroup = {
	title: "Phím tắt chung",
	shortcuts: [
		{ keys: ["?"], description: "Mở hướng dẫn phím tắt" },
		{ keys: ["Esc"], description: "Đóng modal / Hủy thao tác" },
	],
};

const salesShortcuts: ShortcutGroup = {
	title: "Bán hàng",
	shortcuts: [
		{ keys: ["Ctrl", "B"], description: "Mở máy quét mã vạch" },
		{ keys: ["F"], description: "Tìm kiếm sản phẩm" },
		{ keys: ["1"], description: "Chọn thanh toán tiền mặt" },
		{ keys: ["2"], description: "Chọn thanh toán chuyển khoản" },
		{ keys: ["P"], description: "Thanh toán & In hóa đơn" },
		{ keys: ["Esc"], description: "Tạm dừng đơn hàng" },
	],
};

const inventoryShortcuts: ShortcutGroup = {
	title: "Kho hàng",
	shortcuts: [
		{ keys: ["Ctrl", "F"], description: "Tìm kiếm sản phẩm" },
		{ keys: ["N"], description: "Thêm sản phẩm mới" },
		{ keys: ["R"], description: "Làm mới danh sách" },
	],
};

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
	isOpen,
	onClose,
	context = "global",
}) => {
	const getShortcutGroups = (): ShortcutGroup[] => {
		const groups = [globalShortcuts];
		
		if (context === "sales" || context === "global") {
			groups.push(salesShortcuts);
		}
		if (context === "inventory" || context === "global") {
			groups.push(inventoryShortcuts);
		}
		
		return groups;
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg"
			isCentered
			motionPreset="slideInBottom">
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent
				borderRadius="xl"
				mx={4}>
				<ModalHeader
					display="flex"
					alignItems="center"
					gap={3}
					borderBottom="1px solid"
					borderColor="gray.100"
					pb={4}>
					<Box
						p={2}
						bg="brand.50"
						borderRadius="lg">
						<FiCommand size={20} color="#161f70" />
					</Box>
					<Box>
						<Text
							fontSize="lg"
							fontWeight="700"
							color="gray.800">
							Phím tắt bàn phím
						</Text>
						<Text
							fontSize="sm"
							color="gray.500"
							fontWeight="normal">
							Nhấn <Kbd>?</Kbd> bất cứ lúc nào để mở
						</Text>
					</Box>
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody py={6}>
					<VStack
						spacing={6}
						align="stretch">
						{getShortcutGroups().map((group, groupIndex) => (
							<Box key={group.title}>
								{groupIndex > 0 && <Divider mb={4} />}
								<Badge
									colorScheme="blue"
									fontSize="xs"
									mb={3}
									px={2}
									py={1}
									borderRadius="md">
									{group.title}
								</Badge>
								<Grid
									templateColumns="1fr 1fr"
									gap={3}>
									{group.shortcuts.map((shortcut, index) => (
										<GridItem
											key={index}
											p={3}
											bg="gray.50"
											borderRadius="lg"
											_hover={{ bg: "gray.100" }}
											transition="all 0.2s">
											<HStack
												justify="space-between"
												align="center">
												<Text
													fontSize="sm"
													color="gray.700"
													flex={1}>
													{shortcut.description}
												</Text>
												<HStack spacing={1}>
													{shortcut.keys.map(
														(key, keyIndex) => (
															<React.Fragment
																key={keyIndex}>
																<Kbd
																	bg="white"
																	color="gray.800"
																	fontSize="xs"
																	fontWeight="600"
																	px={2}
																	py={1}
																	borderRadius="md"
																	boxShadow="sm">
																	{key}
																</Kbd>
																{keyIndex <
																	shortcut
																		.keys
																		.length -
																		1 && (
																	<Text
																		color="gray.400"
																		fontSize="xs">
																		+
																	</Text>
																)}
															</React.Fragment>
														)
													)}
												</HStack>
											</HStack>
										</GridItem>
									))}
								</Grid>
							</Box>
						))}
					</VStack>

					<Box
						mt={6}
						p={4}
						bg="blue.50"
						borderRadius="lg"
						border="1px solid"
						borderColor="blue.100">
						<Text
							fontSize="sm"
							color="blue.700"
							fontWeight="500">
							💡 Mẹo: Sử dụng phím tắt để thao tác nhanh hơn,
							đặc biệt hữu ích khi bận rộn vào giờ cao điểm!
						</Text>
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default KeyboardShortcutsModal;
