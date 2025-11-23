import { Select, HStack, Text } from "@chakra-ui/react";
import type { WeekRange } from "@/types";

interface WeekSelectorProps {
	weeks: WeekRange[];
	selectedWeekIndex: number;
	onChange: (weekIndex: number) => void;
}

const WeekSelector = ({
	weeks,
	selectedWeekIndex,
	onChange,
}: WeekSelectorProps) => {
	return (
		<HStack
			spacing={0}
			bg="#D3E5FF"
			borderRadius="8px"
			overflow="hidden"
			maxW="300px">
			<Select
				value={selectedWeekIndex}
				onChange={(e) => onChange(Number(e.target.value))}
				border="none"
				bg="transparent"
				fontWeight="700"
				fontSize="16px"
				color="brand.600"
				cursor="pointer"
				_focus={{ boxShadow: "none" }}
				iconColor="brand.600">
				{weeks.map((week, index) => (
					<option
						key={index}
						value={index}>
						{week.label}
					</option>
				))}
			</Select>
		</HStack>
	);
};

export default WeekSelector;
