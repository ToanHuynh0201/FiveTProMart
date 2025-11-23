import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import type { ShiftAssignment } from "@/types";

interface ShiftCellProps {
	assignments: ShiftAssignment[];
	onClick?: () => void;
}

const ShiftCell = ({ assignments, onClick }: ShiftCellProps) => {
	// Separate assignments by position
	const warehouseStaff = assignments.filter(
		(a) => a.staffPosition === "Nhân viên kho",
	);
	const salesStaff = assignments.filter(
		(a) => a.staffPosition === "Nhân viên bán hàng",
	);

	return (
		<Box
			p={3}
			h="full"
			minH="180px"
			borderRight="1px solid"
			borderColor="rgba(0, 0, 0, 0.1)"
			cursor={onClick ? "pointer" : "default"}
			onClick={onClick}
			_hover={
				onClick
					? {
							bg: "gray.50",
					  }
					: undefined
			}
			transition="background 0.2s">
			<VStack
				spacing={2}
				align="stretch"
				h="full">
				{assignments.length === 0 ? (
					<Text
						fontSize="14px"
						color="gray.400"
						textAlign="center"
						py={4}>
						-
					</Text>
				) : (
					<>
						{/* Warehouse Staff */}
						<Box>
							<HStack
								spacing={1}
								mb={1}>
								<Box
									w="3px"
									h="14px"
									bg="blue.500"
									borderRadius="1px"
								/>
								<Text
									fontSize="11px"
									fontWeight="700"
									color="blue.600"
									textTransform="uppercase">
									Kho
								</Text>
							</HStack>
							{warehouseStaff.length > 0 ? (
								<VStack
									spacing={1}
									align="stretch">
									{warehouseStaff.map((assignment) => (
										<Box
											key={assignment.id}
											py={1.5}
											px={2}
											bg="blue.50"
											borderRadius="6px"
											borderLeft="2px solid"
											borderLeftColor="blue.400">
											<Text
												fontSize="13px"
												fontWeight="600"
												color="gray.800"
												wordBreak="break-word"
												lineHeight="1.4">
												{assignment.staffName}
											</Text>
										</Box>
									))}
								</VStack>
							) : (
								<Text
									fontSize="12px"
									color="gray.400"
									pl={2}>
									-
								</Text>
							)}
						</Box>

						{/* Sales Staff */}
						<Box>
							<HStack
								spacing={1}
								mb={1}>
								<Box
									w="3px"
									h="14px"
									bg="green.500"
									borderRadius="1px"
								/>
								<Text
									fontSize="11px"
									fontWeight="700"
									color="green.600"
									textTransform="uppercase">
									Bán hàng
								</Text>
							</HStack>
							{salesStaff.length > 0 ? (
								<VStack
									spacing={1}
									align="stretch">
									{salesStaff.map((assignment) => (
										<Box
											key={assignment.id}
											py={1.5}
											px={2}
											bg="green.50"
											borderRadius="6px"
											borderLeft="2px solid"
											borderLeftColor="green.400">
											<Text
												fontSize="13px"
												fontWeight="600"
												color="gray.800"
												wordBreak="break-word"
												lineHeight="1.4">
												{assignment.staffName}
											</Text>
										</Box>
									))}
								</VStack>
							) : (
								<Text
									fontSize="12px"
									color="gray.400"
									pl={2}>
									-
								</Text>
							)}
						</Box>
					</>
				)}
			</VStack>
		</Box>
	);
};

export default ShiftCell;
