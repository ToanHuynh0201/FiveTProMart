import { Button } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

interface AddProductButtonProps {
	onClick: () => void;
}

export const AddProductButton: React.FC<AddProductButtonProps> = ({
	onClick,
}) => {
	return (
		<Button
			minW="180px"
			h="48px"
			bg="#161f70"
			color="white"
			borderRadius="10px"
			fontSize="15px"
			fontWeight="600"
			leftIcon={<AddIcon />}
			onClick={onClick}
			_hover={{
				bg: "#0f1654",
				transform: "translateY(-2px)",
				boxShadow: "0 4px 8px rgba(22, 31, 112, 0.3)",
			}}
			_active={{
				transform: "translateY(0)",
			}}
			boxShadow="0 2px 4px rgba(22, 31, 112, 0.2)"
			transition="all 0.2s">
			Thêm sản phẩm
		</Button>
	);
};
