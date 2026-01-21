import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const SIDEBAR_WIDTH_EXPANDED = 254;
const SIDEBAR_WIDTH_COLLAPSED = 80;

interface SidebarContextValue {
	isCollapsed: boolean;
	toggleSidebar: () => void;
	sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
		return saved ? JSON.parse(saved) : false;
	});

	useEffect(() => {
		localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(isCollapsed));
	}, [isCollapsed]);

	const toggleSidebar = () => setIsCollapsed((prev: boolean) => !prev);

	const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

	return (
		<SidebarContext.Provider value={{ isCollapsed, toggleSidebar, sidebarWidth }}>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}

// Constants for use in components
export { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED };
