import { useState } from "react";
import {
	Box,
	VStack,
	Text,
	HStack,
	Badge,
	Icon,
	Collapse,
	Tooltip,
} from "@chakra-ui/react";
import { LockIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { MdCalendarToday } from "react-icons/md";

interface UpcomingShift {
	id: string;
	date: string;
	dayOfWeek: string;
	shiftName: string;
	startTime: string;
	endTime: string;
	status: "upcoming" | "today";
}

// Hardcoded data
const upcomingShifts: UpcomingShift[] = [
	{
		id: "1",
		date: "04/12/2024",
		dayOfWeek: "Thứ 4",
		shiftName: "Ca Sáng",
		startTime: "08:00",
		endTime: "12:00",
		status: "today",
	},
	{
		id: "2",
		date: "05/12/2024",
		dayOfWeek: "Thứ 5",
		shiftName: "Ca Chiều",
		startTime: "13:00",
		endTime: "17:00",
		status: "upcoming",
	},
	{
		id: "3",
		date: "06/12/2024",
		dayOfWeek: "Thứ 6",
		shiftName: "Ca Sáng",
		startTime: "08:00",
		endTime: "12:00",
		status: "upcoming",
	},
];

interface UpcomingShiftsProps {
	isCollapsed: boolean;
}

export function UpcomingShifts({ isCollapsed }: UpcomingShiftsProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const nearestShift = upcomingShifts[0];

	// When sidebar is collapsed - show only icon
	if (isCollapsed) {
		return (
			<Tooltip
				label={`${nearestShift.shiftName}: ${nearestShift.startTime}-${nearestShift.endTime}`}
				placement="right"
				hasArrow>
				<Box
					px={2}
					py={3}
					borderTop="1px solid"
					borderColor="rgba(187, 214, 255, 0.1)"
					cursor="pointer"
					_hover={{ bg: "rgba(255, 255, 255, 0.08)" }}
					transition="all 0.2s">
					<Icon
						as={MdCalendarToday}
						boxSize={5}
						color={
							nearestShift.status === "today"
								? "green.300"
								: "blue.300"
						}
						mx="auto"
						display="block"
					/>
				</Box>
			</Tooltip>
		);
	}

	// When sidebar is expanded - collapsible notification style
	return (
		<Box
			borderTop="1px solid"
			borderColor="rgba(187, 214, 255, 0.1)">
			{/* Header - Click to toggle */}
			<HStack
				px={3}
				py={2}
				spacing={2}
				cursor="pointer"
				onClick={() => setIsExpanded(!isExpanded)}
				_hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
				transition="all 0.2s">
				<Icon
					as={MdCalendarToday}
					boxSize={4}
					color="whiteAlpha.700"
				/>
				<Text
					fontSize="xs"
					fontWeight="600"
					color="whiteAlpha.800"
					flex={1}>
					Ca làm sắp tới
				</Text>
				<Badge
					colorScheme={
						nearestShift.status === "today" ? "green" : "blue"
					}
					fontSize="9px"
					px={1.5}
					py={0.5}
					borderRadius="full">
					{upcomingShifts.length}
				</Badge>
				<Icon
					as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
					boxSize={4}
					color="whiteAlpha.600"
				/>
			</HStack>

			{/* Collapsible content */}
			<Collapse
				in={isExpanded}
				animateOpacity>
				<VStack
					spacing={1.5}
					px={3}
					pb={2}
					align="stretch">
					{upcomingShifts.map((shift) => (
						<Box
							key={shift.id}
							p={2}
							bg={
								shift.status === "today"
									? "rgba(72, 187, 120, 0.12)"
									: "rgba(255, 255, 255, 0.06)"
							}
							borderRadius="md"
							borderLeft="2px solid"
							borderColor={
								shift.status === "today"
									? "green.400"
									: "blue.300"
							}
							transition="all 0.2s"
							_hover={{
								bg:
									shift.status === "today"
										? "rgba(72, 187, 120, 0.18)"
										: "rgba(255, 255, 255, 0.1)",
							}}>
							<HStack
								justify="space-between"
								mb={1}>
								<HStack spacing={2}>
									<Text
										fontSize="xs"
										fontWeight="600"
										color="whiteAlpha.900">
										{shift.dayOfWeek}
									</Text>
									{shift.status === "today" && (
										<Badge
											colorScheme="green"
											fontSize="8px"
											px={1.5}
											py={0.5}
											borderRadius="full">
											Hôm nay
										</Badge>
									)}
								</HStack>
								<Text
									fontSize="9px"
									color="whiteAlpha.600">
									{shift.date}
								</Text>
							</HStack>

							<HStack
								spacing={2}
								fontSize="xs"
								color="whiteAlpha.700">
								<Text
									fontWeight="500"
									color="whiteAlpha.900">
									{shift.shiftName}
								</Text>
								<Text>•</Text>
								<HStack spacing={1}>
									<LockIcon boxSize={2.5} />
									<Text>
										{shift.startTime}-{shift.endTime}
									</Text>
								</HStack>
							</HStack>
						</Box>
					))}
				</VStack>
			</Collapse>
		</Box>
	);
}
