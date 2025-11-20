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
