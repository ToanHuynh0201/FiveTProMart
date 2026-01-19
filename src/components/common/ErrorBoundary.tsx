import { Component, type ReactNode } from "react";
import {
	Box,
	VStack,
	Heading,
	Text,
	Button,
	Icon,
	Container,
} from "@chakra-ui/react";
import { BsExclamationTriangle } from "react-icons/bs";

interface ErrorBoundaryProps {
	children: ReactNode;
	/**
	 * Optional fallback component to render when an error occurs.
	 * If not provided, uses the default error UI.
	 */
	fallback?: ReactNode;
	/**
	 * Optional callback when an error is caught.
	 * Use this for error reporting/logging services.
	 */
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child components.
 *
 * Provides crash containment so one broken component doesn't take down
 * the entire application. Shows a branded fallback UI with recovery options.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * // With error logging
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render shows the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		// Log error to console in development
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// Call optional error handler for external logging
		this.props.onError?.(error, errorInfo);
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	handleReload = (): void => {
		window.location.reload();
	};

	render(): ReactNode {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default branded error UI
			return (
				<Container maxW="lg" py={16}>
					<VStack spacing={6} textAlign="center">
						<Box
							p={4}
							borderRadius="full"
							bg="red.50"
							color="red.500"
						>
							<Icon
								as={BsExclamationTriangle}
								boxSize={12}
							/>
						</Box>

						<VStack spacing={2}>
							<Heading
								as="h2"
								size="lg"
								color="gray.700"
							>
								Đã xảy ra lỗi
							</Heading>
							<Text color="gray.600" maxW="md">
								Xin lỗi, đã xảy ra lỗi không mong muốn. Vui lòng
								thử lại hoặc liên hệ hỗ trợ nếu lỗi tiếp tục.
							</Text>
						</VStack>

						{/* Show error details in development */}
						{import.meta.env.DEV && this.state.error && (
							<Box
								w="full"
								p={4}
								bg="gray.50"
								borderRadius="md"
								textAlign="left"
								fontFamily="mono"
								fontSize="sm"
								color="gray.600"
								overflowX="auto"
							>
								<Text fontWeight="bold" color="red.500" mb={2}>
									{this.state.error.name}: {this.state.error.message}
								</Text>
								<Text whiteSpace="pre-wrap" fontSize="xs">
									{this.state.error.stack}
								</Text>
							</Box>
						)}

						<VStack spacing={3}>
							<Button
								colorScheme="brand"
								onClick={this.handleReset}
							>
								Thử lại
							</Button>
							<Button
								variant="ghost"
								colorScheme="gray"
								onClick={this.handleReload}
							>
								Tải lại trang
							</Button>
						</VStack>
					</VStack>
				</Container>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
