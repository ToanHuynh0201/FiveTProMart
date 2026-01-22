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
import { scheduleService } from "@/services/scheduleService";
import { useAuthStore } from "@/store/authStore";

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
	const user = useAuthStore((state) => state.user);

	// Helper: Format date to dd-MM-yyyy
	const formatDateForAPI = (date: Date): string => {
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	};

	// Helper: Format date to display format (dd/MM)
	const formatDateForDisplay = (dateStr: string): string => {
		const date = new Date(dateStr);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		return `${day}/${month}`;
	};

	// Helper: Get day of week in Vietnamese
	const getDayOfWeek = (dateStr: string): string => {
		const date = new Date(dateStr);
		const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
		return days[date.getDay()];
	};

	// Helper: Parse dd-MM-yyyy to yyyy-MM-dd
	const parseDateFromAPI = (dateStr: string): string => {
		// Check if already in ISO format (yyyy-MM-dd)
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
			return dateStr;
		}

		// Parse dd-MM-yyyy format
		const parts = dateStr.split("-");
		if (parts.length === 3) {
			const [day, month, year] = parts;
			return `${year}-${month}-${day}`;
		}

		// Fallback: return as is
		return dateStr;
	};

	useEffect(() => {
		const fetchShifts = async () => {
			// Only fetch if user is logged in
			if (!user?.profileId) {
				setIsLoading(false);
				setShifts([]);
				return;
			}

			setIsLoading(true);
			try {
				const today = new Date();
				const endDate = new Date();
				endDate.setDate(today.getDate() + 7); // Get next 7 days

				const result = await scheduleService.getWorkSchedules({
					startDate: formatDateForAPI(today),
					endDate: formatDateForAPI(endDate),
					profileId: user.profileId,
				});

				if (result.success && result.data) {
					// Transform WorkScheduleResponse[] to UpcomingShift[]
					const todayStr = today.toISOString().split("T")[0];

					const upcomingShifts: UpcomingShift[] = result.data
						.map((schedule: any) => {
							const workDate = parseDateFromAPI(
								schedule.workDate,
							);
							const isToday = workDate === todayStr;

							return {
								id: schedule.id,
								date: formatDateForDisplay(workDate),
								dayOfWeek: getDayOfWeek(workDate),
								shiftName: schedule.shiftName,
								startTime: schedule.startTime,
								endTime: schedule.endTime,
								status: isToday
									? ("today" as const)
									: ("upcoming" as const),
								_sortDate: workDate, // For sorting
							};
						})
						.sort((a: any, b: any) =>
							a._sortDate.localeCompare(b._sortDate),
						)
						.map(({ _sortDate, ...shift }: any) => shift); // Remove sort field

					setShifts(upcomingShifts);
				} else {
					// API call failed - show empty state
					setShifts([]);
				}
			} catch (error) {
				console.error("Error fetching upcoming shifts:", error);
				// API not yet available - show empty state
				setShifts([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchShifts();
	}, [user?.profileId]);

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
