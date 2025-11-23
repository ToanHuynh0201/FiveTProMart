import { Grid, GridItem, Box, Text } from "@chakra-ui/react";
import type { DaySchedule } from "@/types";
import ShiftCell from "./ShiftCell";

interface ScheduleGridProps {
	weekData: DaySchedule[];
	onCellClick?: (date: string, shift: "morning" | "afternoon") => void;
}

const ScheduleGrid = ({ weekData, onCellClick }: ScheduleGridProps) => {
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

			{/* Morning Shift Row */}
			<Grid
				templateColumns="100px repeat(7, 1fr)"
				bg="white"
				borderBottom="1px solid"
				borderColor="rgba(0, 0, 0, 0.4)">
				<GridItem
					p={4}
					borderRight="1px solid"
					borderColor="rgba(0, 0, 0, 0.1)"
					display="flex"
					alignItems="center"
					justifyContent="center">
					<Text
						fontSize="20px"
						fontWeight="700"
						color="brand.600">
						SÁNG
					</Text>
				</GridItem>
				{weekData.map((day) => (
					<GridItem
						key={`morning-${day.date}`}
						p={0}>
						<ShiftCell
							assignments={day.morning}
							onClick={() => onCellClick?.(day.date, "morning")}
						/>
					</GridItem>
				))}
			</Grid>

			{/* Afternoon Shift Row */}
			<Grid
				templateColumns="100px repeat(7, 1fr)"
				bg="white"
				borderBottom="1px solid"
				borderColor="rgba(0, 0, 0, 0.4)">
				<GridItem
					p={4}
					borderRight="1px solid"
					borderColor="rgba(0, 0, 0, 0.1)"
					display="flex"
					alignItems="center"
					justifyContent="center">
					<Text
						fontSize="20px"
						fontWeight="700"
						color="brand.600">
						CHIỀU
					</Text>
				</GridItem>
				{weekData.map((day) => (
					<GridItem
						key={`afternoon-${day.date}`}
						p={0}>
						<ShiftCell
							assignments={day.afternoon}
							onClick={() => onCellClick?.(day.date, "afternoon")}
						/>
					</GridItem>
				))}
			</Grid>
		</Box>
	);
};

export default ScheduleGrid;
