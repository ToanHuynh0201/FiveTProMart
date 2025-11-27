import {
	Button,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Flex,
	Text,
} from "@chakra-ui/react";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import type { DateRange } from "@/types/reports";

interface DateRangePickerProps {
	value: DateRange;
	onChange: (range: DateRange) => void;
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
	{ value: "today", label: "Hôm nay" },
	{ value: "week", label: "7 ngày qua" },
	{ value: "month", label: "30 ngày qua" },
	{ value: "quarter", label: "3 tháng qua" },
	{ value: "year", label: "Năm nay" },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
	value,
	onChange,
}) => {
	const selectedOption = DATE_RANGE_OPTIONS.find(
		(opt) => opt.value === value,
	);

	return (
		<Menu>
			<MenuButton
				as={Button}
				rightIcon={<FiChevronDown />}
				leftIcon={<FiCalendar />}
				variant="outline"
				size="md"
				fontWeight="500"
				w={{ base: "full", md: "auto" }}>
				{selectedOption?.label || "Chọn khoảng thời gian"}
			</MenuButton>
			<MenuList>
				{DATE_RANGE_OPTIONS.map((option) => (
					<MenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						bg={value === option.value ? "brand.50" : "white"}
						fontWeight={value === option.value ? "600" : "400"}>
						<Flex
							align="center"
							gap={2}>
							<Text>{option.label}</Text>
						</Flex>
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
};
