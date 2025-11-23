import { Select, HStack } from "@chakra-ui/react";

interface MonthSelectorProps {
	selectedMonth: number;
	selectedYear: number;
	onMonthChange: (month: number) => void;
	onYearChange: (year: number) => void;
}

const MonthSelector = ({
	selectedMonth,
	selectedYear,
	onMonthChange,
	onYearChange,
}: MonthSelectorProps) => {
	const months = [
		"Tháng 1",
		"Tháng 2",
		"Tháng 3",
		"Tháng 4",
		"Tháng 5",
		"Tháng 6",
		"Tháng 7",
		"Tháng 8",
		"Tháng 9",
		"Tháng 10",
		"Tháng 11",
		"Tháng 12",
	];

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

	return (
		<HStack spacing={4}>
			<Select
				value={selectedYear}
				onChange={(e) => onYearChange(Number(e.target.value))}
				bg="#D3E5FF"
				border="none"
				fontWeight="700"
				fontSize="16px"
				color="brand.600"
				borderRadius="8px"
				cursor="pointer"
				w="140px"
				_focus={{ boxShadow: "none" }}
				iconColor="brand.600">
				{years.map((year) => (
					<option
						key={year}
						value={year}>
						{year}
					</option>
				))}
			</Select>
			<Select
				value={selectedMonth}
				onChange={(e) => onMonthChange(Number(e.target.value))}
				bg="#D3E5FF"
				border="none"
				fontWeight="700"
				fontSize="16px"
				color="brand.600"
				borderRadius="8px"
				cursor="pointer"
				w="180px"
				_focus={{ boxShadow: "none" }}
				iconColor="brand.600">
				{months.map((month, index) => (
					<option
						key={index}
						value={index + 1}>
						{month}
					</option>
				))}
			</Select>
		</HStack>
	);
};

export default MonthSelector;
