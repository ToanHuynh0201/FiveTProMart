import { useState } from "react";
import type { FormEvent } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	VStack,
	Text,
	useToast,
	HStack,
	PinInput,
	PinInputField,
	Box,
} from "@chakra-ui/react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { LockIcon } from "../icons/AuthIcons";
import { authService } from "@/services/authService";

type Step = "email" | "otp" | "password" | "success";

interface ForgotPasswordModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ForgotPasswordModal({
	isOpen,
	onClose,
}: ForgotPasswordModalProps) {
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const toast = useToast();

	const handleSendEmail = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Send forgot password request to API
			await authService.forgotPassword(email);

			toast({
				title: "Mã OTP đã được gửi",
				description: "Vui lòng kiểm tra email của bạn.",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "top",
			});

			setStep("otp");
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể gửi mã OTP. Vui lòng thử lại.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOTP = async (e: FormEvent) => {
		e.preventDefault();

		if (otp.length !== 6) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập đầy đủ 6 số OTP.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		setIsLoading(true);

		try {
			// Verify OTP via API
			await authService.verifyOtp(email, otp);

			toast({
				title: "Xác thực thành công",
				description: "Vui lòng nhập mật khẩu mới.",
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top",
			});

			setStep("password");
		} catch {
			toast({
				title: "Lỗi",
				description: "Mã OTP không hợp lệ hoặc đã hết hạn.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async (e: FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast({
				title: "Lỗi",
				description: "Mật khẩu xác nhận không khớp.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		if (newPassword.length < 6) {
			toast({
				title: "Lỗi",
				description: "Mật khẩu phải có ít nhất 6 ký tự.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		setIsLoading(true);

		try {
			// Reset password via API
			await authService.resetPassword(email, otp, newPassword);

			toast({
				title: "Đặt lại mật khẩu thành công",
				description: "Bạn có thể đăng nhập bằng mật khẩu mới.",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "top",
			});

			setStep("success");

			// Close modal after showing success message
			setTimeout(() => {
				handleClose();
			}, 2000);
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
				status: "error",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setStep("email");
		setEmail("");
		setOtp("");
		setNewPassword("");
		setConfirmPassword("");
		setIsLoading(false);
		onClose();
	};

	const getTitle = () => {
		switch (step) {
			case "email":
				return "Quên mật khẩu";
			case "otp":
				return "Nhập mã OTP";
			case "password":
				return "Đặt mật khẩu mới";
			case "success":
				return "Thành công";
			default:
				return "Quên mật khẩu";
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
			<ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
			<ModalContent
				mx={4}
				borderRadius="2xl"
				boxShadow="0 8px 32px rgba(22, 31, 112, 0.12)"
				border="1px solid"
				borderColor="rgba(255, 255, 255, 0.6)">
				<ModalHeader
					fontSize={{ base: "20px", md: "24px" }}
					fontWeight="700"
					color="brand.500"
					pb={2}
					pt={6}>
					{getTitle()}
				</ModalHeader>
				<ModalCloseButton
					top={4}
					right={4}
					color="gray.500"
					_hover={{ color: "gray.700", bg: "gray.100" }}
					borderRadius="full"
				/>
				<ModalBody pb={6}>
					{/* Step 1: Email Input */}
					{step === "email" && (
						<form onSubmit={handleSendEmail}>
							<VStack spacing={5} align="stretch">
								<Text
									fontSize={{ base: "14px", md: "15px" }}
									color="gray.600"
									lineHeight="1.6">
									Nhập địa chỉ email của bạn và chúng tôi sẽ gửi
									mã OTP để đặt lại mật khẩu.
								</Text>

								<Input
									label="Email"
									type="email"
									placeholder="example@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									autoFocus
								/>

								<VStack spacing={3} pt={2}>
									<Button
										type="submit"
										variant="primary"
										size="lg"
										fullWidth
										isLoading={isLoading}
										loadingText="Đang gửi...">
										Gửi mã OTP
									</Button>
									<Button
										type="button"
										variant="secondary"
										size="lg"
										fullWidth
										onClick={handleClose}
										isDisabled={isLoading}>
										Hủy
									</Button>
								</VStack>
							</VStack>
						</form>
					)}

					{/* Step 2: OTP Verification */}
					{step === "otp" && (
						<form onSubmit={handleVerifyOTP}>
							<VStack spacing={5} align="stretch">
								<Text
									fontSize={{ base: "14px", md: "15px" }}
									color="gray.600"
									lineHeight="1.6"
									textAlign="center">
									Mã OTP đã được gửi đến email:{" "}
									<Text
										as="span"
										fontWeight="600"
										color="brand.500">
										{email}
									</Text>
								</Text>

								<Box>
									<Text
										fontSize={{ base: "13px", md: "14px" }}
										fontWeight="500"
										color="gray.700"
										mb={3}>
										Nhập mã OTP (6 số)
									</Text>
									<HStack spacing={2} justify="center">
										<PinInput
											otp
											size="lg"
											value={otp}
											onChange={setOtp}
											autoFocus>
											<PinInputField
												borderColor="gray.300"
												_focus={{
													borderColor: "brand.400",
													boxShadow:
														"0 0 0 1px var(--chakra-colors-brand-400)",
												}}
											/>
											<PinInputField
												borderColor="gray.300"
												_focus={{
													borderColor: "brand.400",
													boxShadow:
														"0 0 0 1px var(--chakra-colors-brand-400)",
												}}
											/>
											<PinInputField
												borderColor="gray.300"
												_focus={{
													borderColor: "brand.400",
													boxShadow:
														"0 0 0 1px var(--chakra-colors-brand-400)",
												}}
											/>
											<PinInputField
												borderColor="gray.300"
												_focus={{
													borderColor: "brand.400",
													boxShadow:
														"0 0 0 1px var(--chakra-colors-brand-400)",
												}}
											/>
											<PinInputField
												borderColor="gray.300"
												_focus={{
													borderColor: "brand.400",
													boxShadow:
														"0 0 0 1px var(--chakra-colors-brand-400)",
												}}
											/>
											<PinInputField
												borderColor="gray.300"
												_focus={{
													borderColor: "brand.400",
													boxShadow:
														"0 0 0 1px var(--chakra-colors-brand-400)",
												}}
											/>
										</PinInput>
									</HStack>
								</Box>

								<VStack spacing={3} pt={2}>
									<Button
										type="submit"
										variant="primary"
										size="lg"
										fullWidth
										isLoading={isLoading}
										loadingText="Đang xác thực...">
										Xác nhận
									</Button>
									<Button
										type="button"
										variant="secondary"
										size="lg"
										fullWidth
										onClick={() => setStep("email")}
										isDisabled={isLoading}>
										Quay lại
									</Button>
								</VStack>
							</VStack>
						</form>
					)}

					{/* Step 3: New Password Input */}
					{step === "password" && (
						<form onSubmit={handleResetPassword}>
							<VStack spacing={5} align="stretch">
								<Text
									fontSize={{ base: "14px", md: "15px" }}
									color="gray.600"
									lineHeight="1.6">
									Nhập mật khẩu mới của bạn.
								</Text>

								<Input
									label="Mật khẩu mới"
									type="password"
									placeholder="••••••"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									leftIcon={<LockIcon />}
									showPasswordToggle
									required
									autoFocus
								/>

								<Input
									label="Xác nhận mật khẩu"
									type="password"
									placeholder="••••••"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									leftIcon={<LockIcon />}
									showPasswordToggle
									required
								/>

								<VStack spacing={3} pt={2}>
									<Button
										type="submit"
										variant="primary"
										size="lg"
										fullWidth
										isLoading={isLoading}
										loadingText="Đang xử lý...">
										Đặt lại mật khẩu
									</Button>
									<Button
										type="button"
										variant="secondary"
										size="lg"
										fullWidth
										onClick={() => setStep("otp")}
										isDisabled={isLoading}>
										Quay lại
									</Button>
								</VStack>
							</VStack>
						</form>
					)}

					{/* Step 4: Success */}
					{step === "success" && (
						<VStack spacing={4} py={4}>
							<Text
								fontSize={{ base: "15px", md: "16px" }}
								color="green.600"
								fontWeight="500"
								textAlign="center">
								✓ Đặt lại mật khẩu thành công!
							</Text>
							<Text
								fontSize={{ base: "14px", md: "15px" }}
								color="gray.600"
								textAlign="center"
								lineHeight="1.6">
								Bạn có thể đăng nhập bằng mật khẩu mới.
							</Text>
						</VStack>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
