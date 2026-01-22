import { Navigate } from "react-router-dom";
import { hasModuleAccess } from "../../utils/permissions";
import { ROUTES } from "../../constants";
import type { PermissionModule } from "../../types/permissions";
import { LoadingSpinner } from "../../components/common";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
	children: React.ReactNode;
	module?: PermissionModule;
	requireAuth?: boolean;
}

/**
 * Protected Route Component with Role-Based Access Control
 *
 * Features:
 * - Redirects unauthenticated users to login
 * - Redirects unauthorized users to home (based on role)
 * - Shows loading state during auth initialization
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute module="sales">
 *   <SalesPage />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute = ({
	children,
	module,
	requireAuth = true,
}: ProtectedRouteProps) => {
	const { isAuthenticated, isLoading, user } = useAuth();

	// Show loading spinner during auth initialization
	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}>
				<LoadingSpinner />
			</div>
		);
	}

	// Redirect to login if authentication is required and user is not authenticated
	if (requireAuth && !isAuthenticated) {
		return (
			<Navigate
				to={ROUTES.LOGIN}
				replace
			/>
		);
	}

	// Check module-level permissions if module is specified
	if (module && !hasModuleAccess(user, module)) {
		// Redirect unauthorized users to home page
		return (
			<Navigate
				to={ROUTES.HOME}
				replace
			/>
		);
	}

	return <>{children}</>;
};
