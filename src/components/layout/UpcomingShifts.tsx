import { useState, useEffect } from "react";
import {
	Box,
	VStack,
	Text,
	HStack,
	Badge,
	Icon,
	Collapse,
	Tooltip,
	Spinner,
} from "@chakra-ui/react";
import { LockIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { MdCalendarToday } from "react-icons/md";
import apiService from "@/lib/api";

interface UpcomingShift {
	id: string;
	date: string;
	dayOfWeek: string;
	shiftName: string;
	startTime: string;
	endTime: string;
	status: "upcoming" | "today";
}

interface UpcomingShiftsProps {
	isCollapsed: boolean;
}

export function UpcomingShifts({ isCollapsed }: UpcomingShiftsProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [shifts, setShifts] = useState<UpcomingShift[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchShifts = async () => {
			setIsLoading(true);
			try {
				// API endpoint for shifts - will fail gracefully if not implemented
				const response = await apiService.get<{ data: UpcomingShift[] }>(
					"/shifts/upcoming",
				);
				setShifts(response.data || []);
			} catch {
				// API not yet available - show empty state
				setShifts([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchShifts();
	}, []);

	const nearestShift = shifts[0];

	// Loading state
	if (isLoading) {
		return (
			<Box
				px={3}
				py={3}
				borderTop="1px solid"
				borderColor="rgba(187, 214, 255, 0.1)">
				{isCollapsed ? (
					<Spinner
						size="xs"
						color="whiteAlpha.500"
						mx="auto"
						display="block"
					/>
				) : (
					<HStack spacing={2}>
						<Spinner
							size="xs"
							color="whiteAlpha.500"
						/>
						<Text
							fontSize="xs"
							color="whiteAlpha.500">
							Đang tải...
						</Text>
					</HStack>
				)}
			</Box>
		);
	}

	// Empty state - no shifts available or API not implemented
	if (shifts.length === 0) {
		return (
			<Box
				px={3}
				py={3}
				borderTop="1px solid"
				borderColor="rgba(187, 214, 255, 0.1)">
				{isCollapsed ? (
					<Tooltip
						label="Không có ca làm sắp tới"
						placement="right"
						hasArrow>
						<Box>
							<Icon
								as={MdCalendarToday}
								boxSize={5}
								color="whiteAlpha.400"
								mx="auto"
								display="block"
							/>
						</Box>
					</Tooltip>
				) : (
					<HStack spacing={2}>
						<Icon
							as={MdCalendarToday}
							boxSize={4}
							color="whiteAlpha.400"
						/>
						<Text
							fontSize="xs"
							color="whiteAlpha.500">
							Không có ca làm sắp tới
						</Text>
					</HStack>
				)}
			</Box>
		);
	}

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
					{shifts.length}
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
					{shifts.map((shift) => (
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
