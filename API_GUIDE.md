# 📚 Hướng Dẫn Sử Dụng API - FiveTProMart

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc API](#cấu-trúc-api)
3. [Authentication & Token Management](#authentication--token-management)
4. [Sử Dụng API Service](#sử-dụng-api-service)
5. [Xử Lý Lỗi](#xử-lý-lỗi)
6. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan

Hệ thống API của FiveTProMart được xây dựng với các tính năng:

-   ✅ **Auto Token Refresh**: Tự động làm mới token khi hết hạn
-   ✅ **Centralized Error Handling**: Xử lý lỗi tập trung
-   ✅ **Security First**: Token trong memory, refresh token trong HttpOnly cookie
-   ✅ **Type Safety**: Full TypeScript support
-   ✅ **Queue-based Refresh**: Tránh race conditions

---

## 🏗️ Cấu Trúc API

### Core Files

```
src/
├── lib/
│   ├── api.ts              # ApiService class - Axios instance wrapper
│   └── tokenManager.ts     # Token refresh logic & JWT utilities
├── services/
│   ├── authService.ts      # Authentication endpoints
│   ├── customerService.ts  # Customer CRUD operations
│   ├── inventoryService.ts # Inventory management
│   └── ...                 # Other domain services
├── types/
│   └── api.ts             # API response types
└── utils/
    ├── error.ts           # Error parsing & handling
    └── queryParams.ts     # URL query builder
```

### Configuration

```typescript
// src/constants/index.ts
export const API_CONFIG = {
	BASE_URL:
		import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
	TIMEOUT: 10000, // 10 seconds
};
```

**Environment Variables** (`.env`):

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🔐 Authentication & Token Management

### Login Flow

```typescript
import { authService } from "@/services/authService";

// 1. Login với credentials
try {
	const response = await authService.login({
		username: "admin",
		password: "password123",
	});

	// Access token được lưu trong Zustand store (in-memory)
	// Refresh token được lưu trong HttpOnly cookie (backend tự động set)

	console.log("Login success:", response.data);
} catch (error) {
	console.error("Login failed:", error.message);
}
```

### Token Lifecycle

#### 1. **Access Token** (In-Memory)

-   Lưu trong Zustand store: `useAuthStore`
-   Lifetime: 30 phút (mặc định)
-   Tự động inject vào header bởi axios interceptor
-   Mất khi refresh/đóng tab (XSS-safe)

#### 2. **Refresh Token** (HttpOnly Cookie)

-   Set bởi backend sau khi login thành công
-   Lifetime: 7 ngày (tùy backend configuration)
-   Tự động gửi kèm mỗi request (`withCredentials: true`)
-   Không thể đọc từ JavaScript (CSRF-safe với SameSite policy)

### Auto Token Refresh

Token được refresh tự động khi:

-   ⏰ **Proactive**: Còn 20% thời gian sống (6 phút trước khi hết hạn)
-   ⚠️ **Reactive**: Server trả về 401 Unauthorized

```typescript
// Hệ thống tự động xử lý, bạn không cần làm gì
// Ví dụ: Token hết hạn lúc 10:00 AM
// → Tự động refresh lúc 9:54 AM (20% threshold)

// Nếu miss proactive refresh, axios interceptor sẽ bắt 401 và refresh
```

### Token Utilities

```typescript
import {
	decodeToken,
	isTokenExpired,
	shouldRefreshToken,
	getTokenStatus,
} from "@/lib/tokenManager";

// Decode JWT token (client-side, không verify signature)
const decoded = decodeToken(accessToken);
console.log("User ID:", decoded.sub);
console.log("Expires:", new Date(decoded.exp * 1000));

// Kiểm tra token đã hết hạn chưa
if (isTokenExpired(accessToken)) {
	console.log("Token đã hết hạn!");
}

// Kiểm tra có nên refresh không (còn < 6 phút)
if (shouldRefreshToken(accessToken)) {
	console.log("Nên refresh token ngay!");
}

// Lấy thông tin chi tiết
const status = getTokenStatus(accessToken);
console.log({
	expired: status.expired,
	shouldRefresh: status.shouldRefresh,
	expiresIn: status.expiresIn, // seconds
	expiryTime: status.expiryTime, // Date object
});
```

### Logout

```typescript
import { authService } from "@/services/authService";

// Logout: Clear store + Invalidate refresh token
authService.logout();
// → Gọi POST /auth/logout để xóa refresh token cookie
// → Clear Zustand store
// → Redirect về /login
```

---

## 🚀 Sử Dụng API Service

### Basic Usage

```typescript
import apiService from "@/lib/api";

// GET request
const response = await apiService.get("/customers");
console.log(response.data);

// POST request
const newCustomer = await apiService.post("/customers", {
	name: "Nguyễn Văn A",
	phone: "0901234567",
});

// PUT request (full update)
const updated = await apiService.put("/customers/123", {
	name: "Nguyễn Văn B",
	phone: "0907654321",
});

// PATCH request (partial update)
const patched = await apiService.patch("/customers/123", {
	phone: "0909999999",
});

// DELETE request
await apiService.delete("/customers/123");
```

### Service Layer Pattern

**Recommended**: Tạo service cho mỗi domain entity

```typescript
// src/services/customerService.ts
import apiService from "@/lib/api";
import type { Customer, ApiResponse } from "@/types";
import { buildQueryParams } from "@/utils/queryParams";

export const customerService = {
	// Lấy danh sách với filters & pagination
	async getCustomers(
		filters: CustomerFilters,
	): Promise<ApiResponse<Customer>> {
		const params = buildQueryParams(filters);
		const response = await apiService.get(`/customers?${params}`);
		return response.data;
	},

	// Lấy chi tiết 1 customer
	async getCustomerById(id: string): Promise<Customer> {
		const response = await apiService.get(`/customers/${id}`);
		return response.data.data; // Unwrap từ ApiResponse
	},

	// Tạo mới customer
	async createCustomer(data: Omit<Customer, "id">): Promise<Customer> {
		const response = await apiService.post("/customers", data);
		return response.data.data;
	},

	// Cập nhật customer
	async updateCustomer(
		id: string,
		data: Partial<Customer>,
	): Promise<Customer> {
		const response = await apiService.put(`/customers/${id}`, data);
		return response.data.data;
	},

	// Xóa customer
	async deleteCustomer(id: string): Promise<void> {
		await apiService.delete(`/customers/${id}`);
	},
};
```

### Sử Dụng Trong Component

```typescript
import { useState, useEffect } from "react";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types";

function CustomerList() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchCustomers();
	}, []);

	const fetchCustomers = async () => {
		try {
			setLoading(true);
			const response = await customerService.getCustomers({
				page: 1,
				limit: 10,
				search: "",
			});
			setCustomers(response.data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await customerService.deleteCustomer(id);
			// Refresh danh sách
			fetchCustomers();
		} catch (err: any) {
			alert(`Xóa thất bại: ${err.message}`);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<ul>
			{customers.map((customer) => (
				<li key={customer.id}>
					{customer.name}
					<button onClick={() => handleDelete(customer.id)}>
						Xóa
					</button>
				</li>
			))}
		</ul>
	);
}
```

---

## ⚠️ Xử Lý Lỗi

### Error Types

```typescript
// src/utils/error.ts
export class ApiError extends Error {
	status: number; // HTTP status code
	code: string; // Mã lỗi từ backend
	constructor(message: string, status = 500, code = "INTERNAL_ERROR") {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}
```

### Error Handling Wrapper

```typescript
import { withErrorHandling } from "@/utils/error";

// Wrap service methods với automatic error handling
const getCustomersSafe = withErrorHandling(async (filters) => {
	return await apiService.get("/customers", { params: filters });
});

// Sử dụng
const result = await getCustomersSafe({ page: 1 });

if (result.success) {
	console.log("Data:", result.data);
	console.log("Pagination:", result.pagination);
} else {
	console.error("Error:", result.error);
	console.error("Code:", result.code);
}
```

### Manual Error Handling

```typescript
import { parseError, logError } from "@/utils/error";

try {
	const response = await apiService.get("/customers/invalid-id");
} catch (err) {
	const apiError = parseError(err);

	console.log("Status:", apiError.status); // 404
	console.log("Code:", apiError.code); // "NOT_FOUND"
	console.log("Message:", apiError.message); // "Customer not found"

	// Log để debug
	logError(apiError, { context: "CustomerList.fetchData" });

	// Hiển thị thông báo cho user
	alert(apiError.message);
}
```

### Error Response Format

Backend trả về error theo format:

```json
{
	"success": false,
	"message": "Customer not found",
	"error": {
		"code": "NOT_FOUND",
		"message": "Customer with ID 999 does not exist"
	}
}
```

`parseError` sẽ tự động extract thông tin:

-   `status`: HTTP status code (404, 500, etc.)
-   `code`: Business error code (NOT_FOUND, VALIDATION_ERROR, etc.)
-   `message`: User-friendly error message

---

## 💡 Best Practices

### 1. **Luôn Sử Dụng Service Layer**

❌ **Bad** - Gọi trực tiếp trong component:

```typescript
function MyComponent() {
	const fetchData = async () => {
		const response = await apiService.get("/customers");
		setData(response.data);
	};
}
```

✅ **Good** - Dùng service:

```typescript
// services/customerService.ts
export const customerService = {
	getAll: () => apiService.get("/customers"),
};

// Component
function MyComponent() {
	const fetchData = async () => {
		const response = await customerService.getAll();
		setData(response.data);
	};
}
```

### 2. **Type Safety với TypeScript**

```typescript
// Định nghĩa types
interface Customer {
	id: string;
	name: string;
	phone: string;
}

interface ApiResponse<T> {
	success: boolean;
	data: T[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
	};
}

// Sử dụng với generic types
const response = await apiService.get<ApiResponse<Customer>>("/customers");
// response.data có type ApiResponse<Customer>
```

### 3. **Query Parameters Builder**

```typescript
import { buildQueryParams } from "@/utils/queryParams";

const filters = {
	page: 1,
	limit: 20,
	search: "Nguyễn",
	status: "active",
	sortBy: "name",
	sortOrder: "asc",
};

const params = buildQueryParams(filters);
// → "page=1&limit=20&search=Nguy%E1%BB%85n&status=active&sortBy=name&sortOrder=asc"

const response = await apiService.get(`/customers?${params}`);
```

### 4. **Loading & Error States**

```typescript
function DataComponent() {
	const [data, setData] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await customerService.getAll();
			setData(response.data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} />;
	return <DataTable data={data} />;
}
```

### 5. **Abort Requests on Unmount**

```typescript
useEffect(() => {
	const controller = new AbortController();

	const fetchData = async () => {
		try {
			const response = await apiService.get("/customers", {
				signal: controller.signal,
			});
			setData(response.data);
		} catch (err: any) {
			if (err.name !== "CanceledError") {
				setError(err.message);
			}
		}
	};

	fetchData();

	// Cleanup: Cancel request nếu component unmount
	return () => controller.abort();
}, []);
```

### 6. **Custom API Instance**

```typescript
import { ApiService } from "@/lib/api";

// Tạo instance riêng cho external API
const externalApi = new ApiService("https://external-api.com");

const data = await externalApi.get("/external-endpoint");
```

### 7. **Retry Logic cho Network Errors**

```typescript
const fetchWithRetry = async (url: string, retries = 3) => {
	for (let i = 0; i < retries; i++) {
		try {
			return await apiService.get(url);
		} catch (err: any) {
			if (err.status === 0 && i < retries - 1) {
				// Network error, retry
				await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
				continue;
			}
			throw err;
		}
	}
};
```

---

## 🔧 Advanced Features

### Request Interceptor

Request interceptor tự động:

-   ✅ Thêm Authorization header với access token từ store
-   ✅ Log errors với context
-   ✅ Set `withCredentials: true` để gửi HttpOnly cookie

### Response Interceptor

Response interceptor xử lý:

-   ✅ **401 Unauthorized**: Tự động refresh token và retry request
-   ✅ **Queue-based Refresh**: Multiple 401s chỉ trigger 1 refresh call
-   ✅ **Auto Logout**: Nếu refresh thất bại → logout + redirect /login
-   ✅ **Bypass Login Endpoint**: Không trigger logout cho login errors

### Token Refresh Flow

```
[Request] → 401 Unauthorized
    ↓
[Check] Is refresh in progress?
    ↓ No
[Refresh] POST /auth/refresh-token (with HttpOnly cookie)
    ↓ Success
[Update] Store new access token
    ↓
[Retry] Original request with new token
    ↓
[Return] Response to caller

[Multiple 401s] → All wait for same refresh promise
```

---

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Request successful",
  "data": [...],
  "pagination": {
    "totalItems": 100,
    "itemsPerPage": 20,
    "totalPages": 5,
    "currentPage": 1
  }
}
```

### Error Response

```json
{
	"success": false,
	"message": "Validation failed",
	"errors": {
		"name": ["Name is required"],
		"phone": ["Invalid phone format"]
	}
}
```

---

## 🐛 Troubleshooting

### Problem: Token không tự động refresh

**Solution**: Kiểm tra:

1. Backend có trả về `accessToken` trong response của `/auth/refresh-token`?
2. Backend có set HttpOnly cookie cho refresh token?
3. `withCredentials: true` có được config trong axios?

### Problem: 401 loop (liên tục refresh)

**Solution**:

-   Kiểm tra backend có rate limit cho refresh endpoint không
-   `MIN_REFRESH_INTERVAL_MS = 10000` đã đủ lớn chưa
-   Login endpoint có bị trigger interceptor không (đã bypass chưa)

### Problem: CORS errors

**Solution**: Backend cần config:

```javascript
// Express.js example
app.use(
	cors({
		origin: "http://localhost:5173", // Frontend URL
		credentials: true, // CRITICAL for cookies
	}),
);
```

---

## 📚 References

-   **Axios Documentation**: https://axios-http.com/docs/intro
-   **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
-   **OWASP Security**: https://owasp.org/www-community/vulnerabilities/

---

## 📞 Support

Có câu hỏi? Contact:

-   **Email**: support@fivetpromart.com
-   **Docs**: https://docs.fivetpromart.com

---

**Last Updated**: January 10, 2026  
**Version**: 1.0.0
