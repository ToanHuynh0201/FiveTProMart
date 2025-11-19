# Sidebar Component cho 5T Mart

Component Sidebar đã được tùy chỉnh dựa trên Figma design với những đặc điểm sau:

## Cấu trúc Components

```
src/components/layout/
├── Sidebar.tsx              # Component chính
├── SidebarLogo.tsx          # Logo 5T Mart
├── SidebarUserProfile.tsx   # Thông tin user
├── SidebarHeader.tsx        # Icons header (thông báo, lịch, chat, logout)
├── SidebarItem.tsx          # Menu item
├── sidebarConfig.ts         # Cấu hình menu
└── index.ts                 # Exports
```

## Thiết kế

### Màu sắc (từ Figma):

-   **Background**: `#161F70` (brand.500) - Navy blue chủ đạo
-   **Text**: `#FFFFFF` (White)
-   **Active indicator**: `#BBD6FF` (brand.100) - Light blue underline
-   **Hover**: `rgba(255, 255, 255, 0.1)`

### Layout:

-   **Width**: `254px` (cố định)
-   **Height**: `100vh` (full viewport)
-   **Position**: Sticky

### Các phần chính:

1. **Logo Section** (Top)

    - Logo 5T Mart (64x53px)
    - Tên thương hiệu (font: Kimberley)

2. **User Profile**

    - Avatar (45x45px)
    - Greeting: "Xin chào,"
    - User name (bold)

3. **Header Icons** (với tooltips)

    - Bell Icon - Thông báo
    - Calendar Icon - Lịch
    - Chat Icon - Tin nhắn
    - Close Icon - Đăng xuất

4. **Navigation Menu** (Auto scroll nếu dài)
    - Quản lí (`/dashboard`)
    - Nhân sự (`/staff`)
    - Bán hàng (`/sales`)
    - Nhập hàng (`/inventory`)
    - Tài chính (`/finance`)
    - Báo cáo (`/reports`)
    - Khách hàng (`/customers`)

### Active State:

-   Font weight: 700 (bold)
-   Blue underline (6px height, 60px width, 3px border radius)
-   Smooth transition (0.3s)

## Sử dụng

### 1. Basic Usage

```tsx
import { Sidebar } from "@/components/layout";

function App() {
	return (
		<Flex h="100vh">
			<Sidebar />
			<Box
				flex="1"
				overflowY="auto">
				{/* Your content */}
			</Box>
		</Flex>
	);
}
```

### 2. Với Router (Recommended)

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout";
import { ROUTES } from "@/constants";

function App() {
	return (
		<BrowserRouter>
			<Flex h="100vh">
				<Sidebar />
				<Box
					flex="1"
					overflowY="auto"
					bg="gray.50">
					<Routes>
						<Route
							path={ROUTES.DASHBOARD}
							element={<DashboardPage />}
						/>
						<Route
							path={ROUTES.STAFF}
							element={<StaffPage />}
						/>
						{/* More routes... */}
					</Routes>
				</Box>
			</Flex>
		</BrowserRouter>
	);
}
```

## Demo Page

File `src/pages/DashboardPage.tsx` đã được tạo sẵn để demo sidebar.

Để xem demo, truy cập: `http://localhost:5173/dashboard`

## Dependencies

Tất cả dependencies đã có sẵn trong project:

-   `@chakra-ui/react` - UI components
-   `@chakra-ui/icons` - Icons
-   `react-router-dom` - Navigation
-   `framer-motion` - Animations (peer dependency của Chakra)

## Customization

### 1. Thay đổi menu items:

Chỉnh sửa file `src/components/layout/sidebarConfig.ts`:

```ts
export const navItems: NavItem[] = [
	{
		label: "Menu mới",
		path: "/new-menu",
	},
	// ...
];
```

### 2. Thay đổi màu sắc:

Màu đã được định nghĩa trong `src/styles/theme.ts`:

```ts
const colors = {
	brand: {
		50: "#D3E5FF",
		100: "#BBD6FF",
		// ...
		500: "#161F70", // Primary navy blue
	},
};
```

### 3. Thêm logo thật:

Trong `src/components/layout/SidebarLogo.tsx`:

```tsx
<Box
	w="64px"
	h="53px"
	borderRadius="md"
	mb={2}>
	<Image
		src="/logo.png"
		alt="5T Mart Logo"
		w="100%"
		h="100%"
	/>
</Box>
```

### 4. Thay đổi user info:

Component sử dụng hook `useAuth` để lấy thông tin user. Chỉnh sửa trong `src/hooks/useAuth.ts`:

```ts
const [authState, setAuthState] = useState<AuthState>({
	user: {
		id: "1",
		name: "Tên của bạn",
		email: "email@5tmart.com",
	},
	isAuthenticated: true,
});
```

## TypeScript Types

### NavItem Type:

```ts
interface NavItem {
	label: string;
	path: string;
	icon?: IconType;
	children?: NavItem[];
}
```

### User Type:

```ts
interface User {
	id?: string;
	name?: string;
	email?: string;
	role?: string;
	avatar?: string;
}
```

## Path Aliases

Project đã được cấu hình path alias `@` trỏ tới thư mục `src/`:

**tsconfig.app.json:**

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@/*": ["src/*"]
		}
	}
}
```

**vite.config.ts:**

```ts
export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
```

## Notes

-   Sidebar có scrollbar custom khi menu items quá nhiều
-   Active state được xác định bằng `useLocation()` từ react-router-dom
-   Tất cả màu sắc và spacing tuân theo Figma design
-   Component đã responsive và optimized cho performance
-   Font Kimberley cần được thêm vào nếu muốn giống 100% với Figma

## Next Steps

1. ✅ Thêm logo thật vào `SidebarLogo.tsx`
2. ✅ Tạo các page components cho các routes
3. ✅ Tích hợp authentication thật thay vì mock data
4. ✅ Thêm font Kimberley nếu cần
5. ✅ Thêm animations cho transitions (đã có sẵn với Chakra + Framer Motion)
