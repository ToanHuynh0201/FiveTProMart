import { Grid, GridItem, Box, Text } from "@chakra-ui/react";
import type { DaySchedule, ShiftTemplate } from "@/types";
import ShiftCell from "./ShiftCell";

interface ScheduleGridProps {
	weekData: DaySchedule[];
	shifts: ShiftTemplate[];
	onCellClick?: (date: string, shiftId: string) => void;
}

const ScheduleGrid = ({ weekData, shifts, onCellClick }: ScheduleGridProps) => {
	const daysOfWeek = [
		"Thứ 2",
		"Thứ 3",
		"Thứ 4",
		"Thứ 5",
		"Thứ 6",
		"Thứ 7",
		"Chủ nhật",
	];

	return (
		<Box
			borderRadius="8px"
			overflow="hidden"
			border="1px solid"
			borderColor="rgba(0, 0, 0, 0.1)">
			{/* Header Row */}
			<Grid
				templateColumns="100px repeat(7, 1fr)"
				bg="white"
				borderBottom="1px solid"
				borderColor="rgba(0, 0, 0, 0.4)">
				<GridItem
					p={4}
					borderRight="1px solid"
					borderColor="rgba(0, 0, 0, 0.1)">
					<Text
						fontSize="20px"
						fontWeight="700"
						color="brand.600"
						textAlign="center">
						CA LÀM
					</Text>
				</GridItem>
				{daysOfWeek.map((day) => (
					<GridItem
						key={day}
						p={4}
						borderRight="1px solid"
						borderColor="rgba(0, 0, 0, 0.1)">
						<Text
							fontSize="20px"
							fontWeight="700"
							color="brand.600"
							textAlign="center">
							{day}
						</Text>
					</GridItem>
				))}
			</Grid>

			{/* Dynamic Shift Rows */}
			{shifts.map((shift) => (
				<Grid
					key={shift.id}
					templateColumns="100px repeat(7, 1fr)"
					bg="white"
					borderBottom="1px solid"
					borderColor="rgba(0, 0, 0, 0.4)">
					<GridItem
						p={4}
						borderRight="1px solid"
						borderColor="rgba(0, 0, 0, 0.1)"
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center">
						<Text
							fontSize="18px"
							fontWeight="700"
							color="brand.600">
							{shift.name.toUpperCase()}
						</Text>
						<Text
							fontSize="12px"
							color="gray.600">
							{shift.startTime} - {shift.endTime}
						</Text>
					</GridItem>
					{weekData.map((day) => (
						<GridItem
							key={`${shift.id}-${day.date}`}
							p={0}>
							<ShiftCell
								assignments={day.shifts[shift.id] || []}
								shift={shift}
								onClick={() =>
									onCellClick?.(day.date, shift.id)
								}
							/>
						</GridItem>
					))}
				</Grid>
			))}
		</Box>
	);
};

export default ScheduleGrid;
