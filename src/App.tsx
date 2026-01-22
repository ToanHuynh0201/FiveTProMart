import "./App.css";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import { ROUTES } from "./constants";
import StaffPage from "./pages/StaffPage";
import SchedulePage from "./pages/SchedulePage";
import SalesPage from "./pages/SalesPage";
import InventoryPage from "./pages/InventoryPage";
import PurchasePage from "./pages/PurchasePage";
import PromotionPage from "./pages/PromotionPage";
import { ReportsPage } from "./pages/ReportsPage";
import CustomersPage from "./pages/CustomersPage";
import SupplierPage from "./pages/SupplierPage";
import ExpensesPage from "./pages/ExpensesPage";
import CategoryPage from "./pages/CategoryPage";
import { AuthProvider } from "./contexts/AuthContext";
import { TokenRefreshProvider } from "./components/providers/TokenRefreshProvider";
import { ErrorBoundary } from "./components/common";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
	return (
		<Router>
			<ErrorBoundary>
				<AuthProvider>
					<TokenRefreshProvider>
						<Routes>
							<Route
								path={ROUTES.LOGIN}
								element={<LoginPage />}
							/>
							<Route
								path={ROUTES.HOME}
								element={
									<ProtectedRoute>
										<HomePage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.DASHBOARD}
								element={
									<ProtectedRoute module="dashboard">
										<DashboardPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.STAFF}
								element={
									<ProtectedRoute module="staff">
										<StaffPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.SCHEDULE}
								element={
									<ProtectedRoute module="schedule">
										<SchedulePage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.SALES}
								element={
									<ProtectedRoute module="sales">
										<SalesPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.INVENTORY}
								element={
									<ProtectedRoute module="inventory">
										<InventoryPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.CATEGORIES}
								element={
									<ProtectedRoute module="categories">
										<CategoryPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.PURCHASE}
								element={
									<ProtectedRoute module="purchase">
										<PurchasePage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.PROMOTIONS}
								element={
									<ProtectedRoute module="promotions">
										<PromotionPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.REPORTS}
								element={
									<ProtectedRoute module="reports">
										<ReportsPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.CUSTOMERS}
								element={
									<ProtectedRoute module="customers">
										<CustomersPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.SUPPLIERS}
								element={
									<ProtectedRoute module="suppliers">
										<SupplierPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path={ROUTES.EXPENSES}
								element={
									<ProtectedRoute module="expenses">
										<ExpensesPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="*"
								element={
									<Navigate
										to={ROUTES.HOME}
										replace
									/>
								}
							/>
						</Routes>
					</TokenRefreshProvider>
				</AuthProvider>
			</ErrorBoundary>
		</Router>
	);
}

export default App;
