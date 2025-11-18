import "./App.css";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
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
					path="/"
					element={
						<Navigate
							to={ROUTES.HOME}
							replace
						/>
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
		</Router>
	);
}

export default App;
