import { Box, Heading, SimpleGrid, Button } from "@chakra-ui/react";
import type { PaymentMethod } from "../../types/sales";

interface PaymentMethodSelectorProps {
	selected?: PaymentMethod;
	onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
	selected,
	onSelect,
}) => {
	return (
		<Box>
			<Heading
				size="md"
				fontWeight="700"
				color="gray.800"
				mb={4}>
				Phương thức thanh toán
			</Heading>
			<SimpleGrid
				columns={{ base: 3 }}
				spacing={3}>
				<Button
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					gap={2}
					py={4}
					px={3}
					bg={selected === "cash" ? "#161f70" : "gray.50"}
					color={selected === "cash" ? "white" : "gray.600"}
					borderWidth="2px"
					borderColor={selected === "cash" ? "#161f70" : "gray.200"}
					borderRadius="10px"
					fontSize="14px"
					fontWeight="600"
					minH="90px"
					transition="all 0.2s"
					_hover={{
						bg: selected === "cash" ? "#0f1654" : "gray.100",
						borderColor:
							selected === "cash" ? "#0f1654" : "gray.300",
						transform: "translateY(-2px)",
						boxShadow: "md",
					}}
					onClick={() => onSelect("cash")}>
					<Box
						as="svg"
						viewBox="0 0 33 33"
						fill="none"
						w="28px"
						h="28px">
						<path
							d="M16.5 27.5C22.5751 27.5 27.5 22.5751 27.5 16.5C27.5 10.4249 22.5751 5.5 16.5 5.5C10.4249 5.5 5.5 10.4249 5.5 16.5C5.5 22.5751 10.4249 27.5 16.5 27.5Z"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<path
							d="M16.5 11V22M12.375 13.75H18.5625C19.0598 13.75 19.5367 13.9475 19.8884 14.2992C20.2402 14.6509 20.4375 15.1277 20.4375 15.625C20.4375 16.1223 20.2402 16.5991 19.8884 16.9508C19.5367 17.3025 19.0598 17.5 18.5625 17.5H14.4375C13.9402 17.5 13.4634 17.6975 13.1117 18.0492C12.76 18.4009 12.5625 18.8777 12.5625 19.375C12.5625 19.8723 12.76 20.3491 13.1117 20.7008C13.4634 21.0525 13.9402 21.25 14.4375 21.25H20.625"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</Box>
					Tiền mặt
				</Button>

				<Button
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					gap={2}
					py={4}
					px={3}
					bg={selected === "card" ? "#161f70" : "gray.50"}
					color={selected === "card" ? "white" : "gray.600"}
					borderWidth="2px"
					borderColor={selected === "card" ? "#161f70" : "gray.200"}
					borderRadius="10px"
					fontSize="14px"
					fontWeight="600"
					minH="90px"
					transition="all 0.2s"
					_hover={{
						bg: selected === "card" ? "#0f1654" : "gray.100",
						borderColor:
							selected === "card" ? "#0f1654" : "gray.300",
						transform: "translateY(-2px)",
						boxShadow: "md",
					}}
					onClick={() => onSelect("card")}>
					<Box
						as="svg"
						viewBox="0 0 30 30"
						fill="none"
						w="28px"
						h="28px">
						<rect
							x="2.5"
							y="6.25"
							width="25"
							height="18.75"
							rx="2"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<path
							d="M2.5 11.25H27.5"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<path
							d="M6.25 17.5H12.5M6.25 20H10"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</Box>
					Thẻ
				</Button>

				<Button
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					gap={2}
					py={4}
					px={3}
					bg={selected === "transfer" ? "#161f70" : "gray.50"}
					color={selected === "transfer" ? "white" : "gray.600"}
					borderWidth="2px"
					borderColor={
						selected === "transfer" ? "#161f70" : "gray.200"
					}
					borderRadius="10px"
					fontSize="14px"
					fontWeight="600"
					minH="90px"
					transition="all 0.2s"
					_hover={{
						bg: selected === "transfer" ? "#0f1654" : "gray.100",
						borderColor:
							selected === "transfer" ? "#0f1654" : "gray.300",
						transform: "translateY(-2px)",
						boxShadow: "md",
					}}
					onClick={() => onSelect("transfer")}>
					<Box
						as="svg"
						viewBox="0 0 21 21"
						fill="none"
						w="28px"
						h="28px">
						<rect
							x="1"
							y="1"
							width="19"
							height="19"
							rx="2"
							stroke="currentColor"
							strokeWidth="1.5"
						/>
						<path
							d="M5.5 5.5H15.5V15.5H5.5V5.5Z"
							stroke="currentColor"
							strokeWidth="1.5"
						/>
						<path
							d="M8.5 8.5H12.5M8.5 10.5H12.5M8.5 12.5H12.5"
							stroke="currentColor"
							strokeWidth="1.2"
						/>
					</Box>
					Chuyển khoản
				</Button>
			</SimpleGrid>
		</Box>
	);
};
