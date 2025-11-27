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

function App() {
	return (
		<Router>
			<Routes>
				<Route
					path={ROUTES.LOGIN}
					element={<LoginPage />}
				/>
				<Route
					path={ROUTES.HOME}
					element={<HomePage />}
				/>
				<Route
					path={ROUTES.DASHBOARD}
					element={<DashboardPage />}
				/>
				<Route
					path={ROUTES.STAFF}
					element={<StaffPage />}
				/>
				<Route
					path={ROUTES.SCHEDULE}
					element={<SchedulePage />}
				/>
				<Route
					path={ROUTES.SALES}
					element={<SalesPage />}
				/>
				<Route
					path={ROUTES.INVENTORY}
					element={<InventoryPage />}
				/>
				<Route
					path={ROUTES.PURCHASE}
					element={<PurchasePage />}
				/>
				<Route
					path="/"
					element={
						<Navigate
							to={ROUTES.LOGIN}
							replace
						/>
					}
				/>
				<Route
					path="*"
					element={
						<Navigate
							to={ROUTES.LOGIN}
							replace
						/>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
