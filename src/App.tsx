import "./App.css";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { ROUTES } from "./constants";
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
