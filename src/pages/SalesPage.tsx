import { useState, useEffect, useCallback, useRef } from "react";
import {
	Box,
	Flex,
	Heading,
	VStack,
	useToast,
	useDisclosure,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	Button,
} from "@chakra-ui/react";
import MainLayout from "@/components/layout/MainLayout";
import {
	ProductSearchBar,
	OrderItemsTable,
	OrderHeader,
	PaymentFooter,
	OrderHistoryTable,
	OrderDetailModal,
	OrderFilterBar,
	PendingOrdersList,
	BarcodeScanner,
} from "../components/sales";
import type { ScannedPromotionInfo } from "../components/sales/BarcodeScanner";
import {
	KeyboardShortcutsModal,
	SaleCelebration,
	useSaleCelebration,
	Pagination,
} from "../components/common";
import type {
	OrderItem,
	PaymentMethod,
	Product,
	SalesOrder,
	PendingOrder,
	OrderFilters as ApiOrderFilters,
	OrderListItem,
	DiscountRequest,
	CreateOrderResponse,
} from "../types/sales";
import type { OrderFilters } from "../components/sales/OrderFilterBar";
import { isExpired, isExpiringSoon } from "../utils/date";
import { salesService } from "../services/salesService";
import { reservationService } from "../services/reservationService";
import { useAuthStore } from "../store/authStore";
import { API_CONFIG } from "../constants";
import { useKeyboardShortcuts } from "../hooks";

interface Customer {
	id: string;
	name: string;
	phone: string;
	points?: number;
}

const createDraftOrderNumber = () => `TẠM-${Date.now()}`;

const SalesPage = () => {
	const toast = useToast();
	const { user } = useAuthStore();
	const [customer, setCustomer] = useState<Customer | null>({
		id: `guest_${Date.now()}`,
		name: "KHÁCH VÃNG LAI",
		phone: "",
		points: 0,
	});
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [paymentMethod, setPaymentMethod] = useState<
		PaymentMethod | undefined
	>();
	const [cashReceived, setCashReceived] = useState<number>(0);
	const [discount, setDiscount] = useState<DiscountRequest | null>(null);
	const [orderNumber, setOrderNumber] = useState(createDraftOrderNumber);
	const [createdAt, setCreatedAt] = useState(new Date());
	// Pending orders state - Load from localStorage
	const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(() => {
		try {
			const saved = localStorage.getItem("salesPage_pendingOrders");
			if (saved) {
				const parsed = JSON.parse(saved);
				// Convert date strings back to Date objects
				return parsed.map((order: PendingOrder) => ({
					...order,
					createdAt: new Date(order.createdAt),
					pausedAt: new Date(order.pausedAt),
				}));
			}
		} catch (error) {
			console.error("Error loading pending orders:", error);
		}
		return [];
	});

	// Tab state
	const [activeTabIndex, setActiveTabIndex] = useState(0);

	// Order history states
	const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
	const [orderPage, setOrderPage] = useState(1);
	const [orderPageSize] = useState(10);
	const [orderTotalItems, setOrderTotalItems] = useState(0);
	const [orderTotalPages, setOrderTotalPages] = useState(1);
	const [filters, setFilters] = useState<OrderFilters>({
		searchQuery: "",
		status: "",
		paymentMethod: "",
		dateFrom: "",
		dateTo: "",
	});

	const { isOpen, onOpen, onClose } = useDisclosure();

	const {
		isOpen: isBarcodeScannerOpen,
		onOpen: onBarcodeScannerOpen,
		onClose: onBarcodeScannerClose,
	} = useDisclosure();

	const {
		isOpen: isShortcutsHelpOpen,
		onOpen: onShortcutsHelpOpen,
		onClose: onShortcutsHelpClose,
	} = useDisclosure();

	// Clear cart confirmation dialog
	const {
		isOpen: isClearCartOpen,
		onOpen: onClearCartOpen,
		onClose: onClearCartClose,
	} = useDisclosure();
	const clearCartCancelRef = useRef<HTMLButtonElement>(null);

	// Sale celebration hook - triggers confetti on successful payment
	const { celebrationData, celebrate, closeCelebration } = useSaleCelebration();

	// Refs for handlers that are defined later (needed for keyboard shortcuts)
	const handlePrintRef = useRef<() => void>(() => {});
	const handlePauseOrderRef = useRef<() => void>(() => {});

	// Track current reservation IDs for cleanup on page unload
	// Using ref to avoid re-renders and keep value fresh in cleanup callback
	const activeReservationsRef = useRef<string[]>([]);
	useEffect(() => {
		activeReservationsRef.current = orderItems
			.filter((item) => item.reservationId)
			.map((item) => item.reservationId as string);
	}, [orderItems]);

	// ============================================================================
	// BUY X GET Y PROMOTION: Auto-add/update free items
	// When cart has eligible items, automatically add free items
	// ============================================================================
	useEffect(() => {
		let cancelled = false;

		const syncFreeItems = async () => {
			const buyXGetYItems = orderItems.filter(
				(item) =>
					item.promotionType === "Buy X Get Y" &&
					item.buyQuantity &&
					item.getQuantity &&
					!item.isFreeItem,
			);

			if (buyXGetYItems.length === 0) return;

			let shouldUpdate = false;
			let newItems = [...orderItems];

			for (const item of buyXGetYItems) {
				const entitledFreeQty =
					Math.floor(item.quantity / item.buyQuantity!) *
					item.getQuantity!;

				const freeItemIndex = newItems.findIndex(
					(i) =>
						i.isFreeItem &&
						i.product.id === item.product.id &&
						i.promotionId === item.promotionId,
				);

				const canReserve = Boolean(item.batchId && user?.userId);

				const reserveForFreeItem = async (
					quantity: number,
					existingReservationId?: string,
				) => {
					if (!canReserve) return existingReservationId;
					if (existingReservationId) {
						await reservationService.release({
							reservationId: existingReservationId,
							reason: "Promo quantity adjustment",
						});
					}
					const reservation = await reservationService.reserve({
						lotId: item.batchId!,
						quantity,
						reservedBy: user!.userId,
					});
					return reservation.reservationId;
				};

				if (entitledFreeQty > 0) {
					if (freeItemIndex === -1) {
						let reservationId: string | undefined;
						if (canReserve) {
							try {
								const reservation = await reservationService.reserve({
									lotId: item.batchId!,
									quantity: entitledFreeQty,
									reservedBy: user!.userId,
								});
								reservationId = reservation.reservationId;
							} catch {
								toast({
									title: "Không thể áp dụng khuyến mãi",
									description:
										"Không đủ tồn kho để tặng sản phẩm miễn phí.",
									status: "warning",
									duration: 3000,
									position: "top",
								});
								continue;
							}
						}

						const freeItem: OrderItem = {
							id: `free_${Date.now()}_${item.product.id}`,
							product: item.product,
							quantity: entitledFreeQty,
							unitPrice: 0,
							totalPrice: 0,
							batchId: item.batchId,
							batchNumber: item.batchNumber,
							promotionId: item.promotionId,
							promotionName: item.promotionName,
							promotionType: "Buy X Get Y",
							isFreeItem: true,
							reservationId,
						};
						newItems.push(freeItem);
						shouldUpdate = true;
					} else if (newItems[freeItemIndex].quantity !== entitledFreeQty) {
						let reservationId = newItems[freeItemIndex].reservationId;
						if (canReserve) {
							try {
								reservationId = await reserveForFreeItem(
									entitledFreeQty,
									reservationId,
								);
							} catch {
								toast({
									title: "Không thể cập nhật khuyến mãi",
									description:
										"Không đủ tồn kho để cập nhật số lượng tặng.",
									status: "warning",
									duration: 3000,
									position: "top",
								});
								continue;
							}
						}

						newItems[freeItemIndex] = {
							...newItems[freeItemIndex],
							quantity: entitledFreeQty,
							reservationId,
						};
						shouldUpdate = true;
					}
				} else if (freeItemIndex !== -1) {
					const freeItem = newItems[freeItemIndex];
					if (freeItem.reservationId) {
						try {
							await reservationService.release({
								reservationId: freeItem.reservationId,
								reason: "Promo removed",
							});
						} catch {
							// Ignore release failure; reservation TTL will recover
						}
					}
					newItems.splice(freeItemIndex, 1);
					shouldUpdate = true;
				}
			}

			const orphanedFreeItems = newItems.filter(
				(item) =>
					item.isFreeItem &&
					!newItems.some(
						(parent) =>
							!parent.isFreeItem &&
							parent.product.id === item.product.id &&
							parent.promotionId === item.promotionId,
					),
			);

			for (const orphan of orphanedFreeItems) {
				if (orphan.reservationId) {
					try {
						await reservationService.release({
							reservationId: orphan.reservationId,
							reason: "Promo orphan cleanup",
						});
					} catch {
						// Ignore release failure; reservation TTL will recover
					}
				}
			}

			if (orphanedFreeItems.length > 0) {
				newItems = newItems.filter(
					(item) => !orphanedFreeItems.includes(item),
				);
				shouldUpdate = true;
			}

			if (shouldUpdate && !cancelled) {
				setOrderItems(newItems);
			}
		};

		void syncFreeItems();

		return () => {
			cancelled = true;
		};
	}, [orderItems, user?.userId, toast]);

	// Cleanup reservations when browser tab/window closes (zombie prevention)
	// Backend has 15-min TTL as fallback, but this provides faster cleanup
	useEffect(() => {
		const handleBeforeUnload = () => {
			const reservationIds = activeReservationsRef.current;
			if (reservationIds.length === 0) return;

			// Use sendBeacon for reliable delivery during unload
			// Note: sendBeacon only supports simple POST with form/text data
			// We send a JSON blob and rely on backend accepting application/json
			const payload = JSON.stringify({
				reservationIds,
				reason: "Browser closed",
			});
			const endpoint = `${API_CONFIG.BASE_URL}/stock-reservations/release-batch`;
			const accessToken = useAuthStore.getState().accessToken;

			if (accessToken) {
				void fetch(endpoint, {
					method: "POST",
					keepalive: true,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
					credentials: "include",
					body: payload,
				});
			} else {
				const blob = new Blob([payload], { type: "application/json" });
				navigator.sendBeacon(endpoint, blob);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, []);

	// Actual clear cart logic (called after confirmation)
	const doClearCart = useCallback(async () => {
		if (orderItems.length > 0) {
			// Release all reservations
			const reservationIds = orderItems
				.filter((item) => item.reservationId)
				.map((item) => item.reservationId as string);
			
			if (reservationIds.length > 0) {
				try {
					await reservationService.releaseAll(reservationIds, "Cart cleared");
				} catch (error) {
					console.error("Failed to release some reservations:", error);
					// Continue with clearing cart
				}
			}
			
			setOrderItems([]);
			setPaymentMethod(undefined);
			setCashReceived(0);
			localStorage.removeItem("salesPage_currentOrder");
			toast({
				title: "Đã xóa giỏ hàng",
				status: "info",
				duration: 2000,
				position: "top",
			});
		}
		onClearCartClose();
	}, [orderItems, toast, onClearCartClose]);

	// Keyboard shortcut handlers (memoized for stable references)
	const handleClearCart = useCallback(() => {
		if (orderItems.length > 0) {
			onClearCartOpen();
		}
	}, [orderItems.length, onClearCartOpen]);

	const handleSelectCash = useCallback(() => {
		if (activeTabIndex === 0) {
			setPaymentMethod("cash");
			toast({
				title: "💵 Tiền mặt",
				status: "info",
				duration: 1500,
				position: "top",
			});
		}
	}, [activeTabIndex, toast]);

	const handleSelectTransfer = useCallback(() => {
		if (activeTabIndex === 0) {
			setPaymentMethod("transfer");
			setCashReceived(0);
			toast({
				title: "🏦 Chuyển khoản",
				status: "info",
				duration: 1500,
				position: "top",
			});
		}
	}, [activeTabIndex, toast]);

	// Focus search input handler
	const handleFocusSearch = useCallback(() => {
		const searchInput = document.getElementById("sales-product-search");
		if (searchInput) {
			searchInput.focus();
		}
	}, []);

	// Keyboard shortcuts for Sales page
	useKeyboardShortcuts([
		{
			key: "?",
			shift: true,
			action: onShortcutsHelpOpen,
			description: "Mở hướng dẫn phím tắt",
		},
		{
			key: "b",
			ctrl: true,
			action: onBarcodeScannerOpen,
			description: "Mở máy quét mã vạch",
			enabled: activeTabIndex === 0,
		},
		{
			key: "f",
			action: handleFocusSearch,
			description: "Tìm kiếm sản phẩm",
			enabled: activeTabIndex === 0,
		},
		{
			key: "1",
			action: handleSelectCash,
			description: "Chọn thanh toán tiền mặt",
			enabled: activeTabIndex === 0,
		},
		{
			key: "2",
			action: handleSelectTransfer,
			description: "Chọn thanh toán chuyển khoản",
			enabled: activeTabIndex === 0,
		},
		{
			key: "p",
			action: () => handlePrintRef.current(),
			description: "Thanh toán & In hóa đơn",
			enabled: activeTabIndex === 0 && orderItems.length > 0 && !!paymentMethod,
		},
		{
			key: "Escape",
			action: () => handlePauseOrderRef.current(),
			description: "Tạm dừng đơn hàng",
			enabled: activeTabIndex === 0 && orderItems.length > 0,
		},
		{
			key: "Delete",
			ctrl: true,
			action: handleClearCart,
			description: "Xóa giỏ hàng",
			enabled: activeTabIndex === 0 && orderItems.length > 0,
		},
	]);

	useEffect(() => {
		// Load orders for history
		loadOrders();

		// Restore current order state from localStorage
		// NOTE: We clear reservationIds because they're likely expired (15-min TTL)
		// The items can still be checked out, but without reservation protection
		try {
			const saved = localStorage.getItem("salesPage_currentOrder");
			if (saved && orderItems.length === 0) {
				const currentOrderState = JSON.parse(saved);
				// Clear stale reservation IDs - they've likely expired
				const itemsWithoutReservations = (currentOrderState.orderItems || []).map(
					(item: OrderItem) => ({
						...item,
						reservationId: undefined, // Clear potentially stale reservation
					})
				);
				setOrderItems(itemsWithoutReservations);
				setPaymentMethod(currentOrderState.paymentMethod);
				if (currentOrderState.customer) {
					setCustomer(currentOrderState.customer);
				}
				
				// Warn user if there were items restored
				if (itemsWithoutReservations.length > 0) {
					toast({
						title: "Giỏ hàng đã được khôi phục",
						description: "Lưu ý: Hàng có thể đã được bán bởi quầy khác. Vui lòng kiểm tra.",
						status: "warning",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
				}
			}
		} catch (error) {
			console.error("Error restoring current order:", error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// Apply filters when filters change
		applyFilters();
	}, [filters, orderPage]);

	// Save pending orders to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem(
				"salesPage_pendingOrders",
				JSON.stringify(pendingOrders),
			);
		} catch (error) {
			console.error("Error saving pending orders:", error);
		}
	}, [pendingOrders]);

	// Save current order state to localStorage whenever it changes
	useEffect(() => {
		try {
			if (orderItems.length > 0 || paymentMethod || customer?.phone) {
				const currentState = {
					orderItems,
					paymentMethod,
					customer,
					orderNumber,
					createdAt,
				};
				localStorage.setItem(
					"salesPage_currentOrder",
					JSON.stringify(currentState),
				);
			} else {
				// Clear localStorage if order is empty
				localStorage.removeItem("salesPage_currentOrder");
			}
		} catch (error) {
			console.error("Error saving current order:", error);
		}
	}, [orderItems, paymentMethod, customer, orderNumber, createdAt]);

	const loadOrders = async () => {
		try {
			const statusMap: Record<string, string> = {
				completed: "Đã thanh toán",
				draft: "Chưa thanh toán",
				cancelled: "Đã huỷ",
			};
			const paymentMethodMap: Record<string, string> = {
				cash: "Tiền mặt",
				transfer: "Chuyển khoản",
			};

			// Convert UI filters to API format
			const apiFilters: ApiOrderFilters = {
				search: filters.searchQuery || undefined,
				status: filters.status
					? (statusMap[filters.status] as ApiOrderFilters["status"])
					: undefined,
				paymentMethod:
					filters.paymentMethod
						? (paymentMethodMap[filters.paymentMethod] as ApiOrderFilters["paymentMethod"])
						: undefined,
				startDate: filters.dateFrom || undefined,
				endDate: filters.dateTo || undefined,
				page: orderPage - 1,
				size: orderPageSize,
				sort: "orderDate,desc",
			};

			const response = await salesService.getOrders(apiFilters);

			// Map API response to UI SalesOrder format for display
			const uiOrders: SalesOrder[] = response.data.map(
				(order: OrderListItem) => ({
					id: order.orderId,
					orderNumber: `#${order.orderId}`,
					items: [], // Not available in list view
					subtotal: order.totalAmount,
					discount: 0,
					total: order.totalAmount,
					paymentMethod:
						order.paymentMethod === "Tiền mặt" ? "cash" : "transfer",
					customer: {
						id: "",
						name: order.customerName,
						phone: "",
					},
					staff: {
						id: "",
						name: order.staffName,
					},
					createdAt: new Date(order.createdAt),
					status:
						order.status === "Đã huỷ"
							? "cancelled"
							: order.status === "Đã thanh toán"
								? "completed"
								: "draft",
				}),
			);

			setFilteredOrders(uiOrders);
			setOrderTotalItems(response.pagination.totalItems);
			setOrderTotalPages(response.pagination.totalPages);
		} catch (error) {
			console.error("Error loading orders:", error);
			toast({
				title: "Lỗi tải đơn hàng",
				description: "Không thể tải danh sách đơn hàng",
				status: "error",
				duration: 3000,
			});
			setFilteredOrders([]);
			setOrderTotalItems(0);
			setOrderTotalPages(1);
		}
	};

	const applyFilters = async () => {
		// Filters are applied via loadOrders which reads the filters state
		await loadOrders();
	};

	const handleFiltersChange = (newFilters: OrderFilters) => {
		setFilters(newFilters);
		setOrderPage(1);
	};

	const handleResetFilters = () => {
		setFilters({
			searchQuery: "",
			status: "",
			paymentMethod: "",
			dateFrom: "",
			dateTo: "",
		});
		setOrderPage(1);
	};

	const handleViewOrderDetail = async (order: SalesOrder) => {
		try {
			// Fetch full order details from backend
			const orderDetail = await salesService.getOrderById(order.id);
			
			// Map to SalesOrder format with items
			const fullOrder: SalesOrder = {
				...order,
				items: orderDetail.items.map(item => ({
					id: item.productId,
					product: {
						id: item.productId,
						code: item.productId,
						name: item.productName,
						price: item.originalUnitPrice ?? item.unitPrice,
						stock: 0, // Not relevant for completed order
					},
					quantity: item.quantity,
					unitPrice: item.originalUnitPrice ?? item.unitPrice,
					promotionalPrice:
						item.originalUnitPrice && item.originalUnitPrice > item.unitPrice
							? item.unitPrice
							: undefined,
					promotionId: item.promotionId,
					isFreeItem: item.isFreeItem,
					totalPrice: item.subTotal,
				})),
				subtotal: orderDetail.subTotal,
				discount: orderDetail.discountAmount,
				total: orderDetail.totalAmount,
			};
			
			setSelectedOrder(fullOrder);
			onOpen();
		} catch (error) {
			console.error("Error loading order details:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải chi tiết đơn hàng",
				status: "error",
				duration: 3000,
			});
		}
	};

	const handleProductSelect = async (
		product: Product,
		batchId?: string,
		batchNumber?: string,
		promotion?: ScannedPromotionInfo | null,
	) => {
		// Chỉ chấp nhận khi có thông tin lô hàng (từ quét mã lô)
		if (batchId && batchNumber) {
			const batch = product.batches?.find((b) => b.id === batchId);
			if (batch) {
				// Cảnh báo nếu lô đã hết hạn
				if (isExpired(batch.expiryDate)) {
					toast({
						title: "Cảnh báo lô hàng hết hạn",
						description: `Lô ${batch.batchNumber} đã hết hạn sử dụng. Không nên bán!`,
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
				}

				// Cảnh báo nếu lô sắp hết hạn
				if (isExpiringSoon(batch.expiryDate, 7)) {
					toast({
						title: "Lô hàng sắp hết hạn",
						description: `Lô ${batch.batchNumber} sắp hết hạn. Nên ưu tiên bán lô này.`,
						status: "warning",
						duration: 4000,
						isClosable: true,
						position: "top",
					});
				}

				await addProductToCart(product, 1, batchId, batchNumber, promotion);
			}
		}
		// Không làm gì nếu không có mã lô - bắt buộc phải quét mã lô hàng
	};

	const addProductToCart = async (
		product: Product,
		quantity: number,
		batchId?: string,
		batchNumber?: string,
		promotion?: ScannedPromotionInfo | null,
	) => {
		// Check if same product and batch already exists
		const existingItem = orderItems.find(
			(item) =>
				item.product.id === product.id && item.batchId === batchId,
		);

		// Calculate effective unit price (promotional or regular)
		const effectiveUnitPrice = promotion?.promotionalPrice ?? product.price;

		if (existingItem) {
			// Increase quantity - tìm số lượng tồn kho của lô
			let maxQuantity = existingItem.product.stock;
			if (existingItem.batchId) {
				const batch = existingItem.product.batches?.find(
					(b) => b.id === existingItem.batchId,
				);
				if (batch) {
					maxQuantity = batch.quantity;
				}
			}

			const newQuantity = Math.min(
				existingItem.quantity + quantity,
				maxQuantity,
			);

			// Reserve additional stock
			if (batchId && user?.userId) {
				try {
					await reservationService.reserve({
						lotId: batchId,
						quantity: quantity, // Only reserve the additional quantity
						reservedBy: user.userId,
					});
				} catch (error) {
					toast({
						title: "Không thể đặt trước hàng",
						description: "Có thể đã hết hàng hoặc đã được đặt bởi quầy khác",
						status: "error",
						duration: 3000,
						position: "top",
					});
					return; // Don't add to cart if reservation fails
				}
			}

			// Use the existing item's effective price (promotional if exists)
			const existingEffectivePrice = existingItem.promotionalPrice ?? existingItem.unitPrice;

			setOrderItems((prevItems) =>
				prevItems.map((item) =>
					item.id === existingItem.id
						? {
								...item,
								quantity: newQuantity,
								totalPrice: existingEffectivePrice * newQuantity,
						  }
						: item,
				),
			);
		} else {
			// Reserve stock for new item
			let reservationId: string | undefined;
			if (batchId && user?.userId) {
				try {
					const reservation = await reservationService.reserve({
						lotId: batchId,
						quantity: quantity,
						reservedBy: user.userId,
					});
					reservationId = reservation.reservationId;
				} catch (error) {
					toast({
						title: "Không thể đặt trước hàng",
						description: "Có thể đã hết hàng hoặc đã được đặt bởi quầy khác",
						status: "error",
						duration: 3000,
						position: "top",
					});
					return; // Don't add to cart if reservation fails
				}
			}

			// Add new item with reservation ID and promotion info
			const newItem: OrderItem = {
				id: `item_${Date.now()}_${Math.random()}`,
				product,
				quantity,
				unitPrice: product.price, // Original price
				totalPrice: effectiveUnitPrice * quantity, // Uses promotional if available
				batchId,
				batchNumber,
				reservationId,
				// Promotion fields
				promotionalPrice: promotion?.promotionalPrice,
				savings: promotion?.savings,
				promotionName: promotion?.promotionName,
				promotionType: promotion?.promotionType,
				promotionId: promotion?.promotionId, // For backend persistence
				// Buy X Get Y fields
				buyQuantity: promotion?.buyQuantity,
				getQuantity: promotion?.getQuantity,
			};
			setOrderItems((prevItems) => [...prevItems, newItem]);
		}
	};

	const handleUpdateQuantity = async (itemId: string, quantity: number) => {
		if (quantity < 1) return;

		const item = orderItems.find((i) => i.id === itemId);
		if (!item) return;

		// Calculate max quantity from batch
		let maxQuantity = item.product.stock;
		if (item.batchId) {
			const batch = item.product.batches?.find((b) => b.id === item.batchId);
			if (batch) {
				maxQuantity = batch.quantity;
			}
		}

		const newQuantity = Math.min(quantity, maxQuantity);
		const quantityDelta = newQuantity - item.quantity;

		// If no change, skip
		if (quantityDelta === 0) return;

		// Handle reservation sync for batch items
		if (item.batchId && user?.userId) {
			if (quantityDelta > 0) {
				// INCREASING quantity: reserve additional units
				try {
					await reservationService.reserve({
						lotId: item.batchId,
						quantity: quantityDelta,
						reservedBy: user.userId,
					});
				} catch (error) {
					toast({
						title: "Không thể đặt thêm hàng",
						description: "Số lượng yêu cầu vượt quá tồn kho khả dụng",
						status: "error",
						duration: 3000,
						position: "top",
					});
					return; // Don't update if can't reserve
				}
			} else if (quantityDelta < 0 && item.reservationId) {
				// DECREASING quantity: release old reservation, create new one
				// (Backend doesn't support partial release, so we do release + re-reserve)
				try {
					await reservationService.release({
						reservationId: item.reservationId,
						reason: "Quantity decreased",
					});
					
					// Re-reserve with new quantity
					const reservation = await reservationService.reserve({
						lotId: item.batchId,
						quantity: newQuantity,
						reservedBy: user.userId,
					});
					
					// Update with new reservation ID
					setOrderItems((prevItems) =>
						prevItems.map((i) =>
							i.id === itemId
								? {
										...i,
										quantity: newQuantity,
										totalPrice: (i.promotionalPrice ?? i.unitPrice) * newQuantity,
										reservationId: reservation.reservationId,
								  }
								: i,
						),
					);
					return; // Exit early, we've already updated
				} catch (error) {
					console.error("Failed to adjust reservation:", error);
					// Continue with UI update even if reservation fails
				}
			}
		}

		// Update UI
		setOrderItems((prevItems) =>
			prevItems.map((i) =>
				i.id === itemId
					? {
							...i,
							quantity: newQuantity,
							totalPrice: (i.promotionalPrice ?? i.unitPrice) * newQuantity,
					  }
					: i,
			),
		);
	};

	const handleRemoveItem = async (itemId: string) => {
		const itemToRemove = orderItems.find((item) => item.id === itemId);
		
		// Release reservation if exists
		if (itemToRemove?.reservationId) {
			try {
				await reservationService.release({
					reservationId: itemToRemove.reservationId,
					reason: "Item removed from cart",
				});
			} catch (error) {
				console.error("Failed to release reservation:", error);
				// Continue with removal even if release fails
			}
		}
		
		setOrderItems(orderItems.filter((item) => item.id !== itemId));
	};

	const calculateSubtotal = () => {
		return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
	};

	const calculateDiscountAmount = (subtotal: number) => {
		if (!discount || discount.type === "NONE") return 0;

		switch (discount.type) {
			case "LOYALTY_POINTS":
				return Math.min(discount.pointsToUse ?? 0, subtotal);
			case "PERCENTAGE": {
				const percentage = discount.percentage ?? 0;
				const rawDiscount = (subtotal * percentage) / 100;
				const cappedDiscount =
					discount.maxAmount !== undefined
						? Math.min(rawDiscount, discount.maxAmount)
						: rawDiscount;
				return Math.min(cappedDiscount, subtotal);
			}
			case "FIXED_AMOUNT":
				return Math.min(discount.amount ?? 0, subtotal);
			default:
				return 0;
		}
	};

	const calculateFinalTotal = () => {
		const subtotal = calculateSubtotal();
		const discountAmount = calculateDiscountAmount(subtotal);
		return Math.max(0, subtotal - discountAmount);
	};

	const calculateRoundedCashTotal = () => {
		// Round to nearest 1,000 VND (Vietnam retail standard)
		return Math.round(calculateFinalTotal() / 1000) * 1000;
	};

	const calculateLoyaltyPoints = () => {
		// 1 point per 100 VND spent (1% loyalty rate)
		return Math.floor(calculateFinalTotal() / 100);
	};

	const finalTotal = calculateFinalTotal();
	const roundedCashTotal = calculateRoundedCashTotal();
	const roundingAdjustment = roundedCashTotal - finalTotal;

	const printReceipt = (
		response: CreateOrderResponse,
		localData: { subTotal: number; discountAmount: number; amountGiven: number },
		lineItems: OrderItem[],
	) => {
		const receiptWindow = window.open(
			"",
			"_blank",
			"width=420,height=640,noopener,noreferrer",
		);

		if (!receiptWindow) return;

		const itemsHtml = lineItems
			.map((item) => {
				const isFree = item.isFreeItem;
				const unitPrice = isFree
					? 0
					: item.promotionalPrice ?? item.unitPrice;
				const originalUnitPrice = isFree
					? item.product.price
					: item.unitPrice;
				const hasDiscount = originalUnitPrice > unitPrice;

				return `
					<tr>
						<td>${item.product.name}${isFree ? " (Tặng)" : ""}</td>
						<td style="text-align:right;">${item.quantity}</td>
						<td style="text-align:right;">
							${isFree ? "MIỄN PHÍ" : unitPrice.toLocaleString("vi-VN")}
						</td>
					</tr>
					${hasDiscount ? `
					<tr>
						<td colspan="3" style="text-align:right;font-size:11px;color:#888;">
							Giá gốc: ${originalUnitPrice.toLocaleString("vi-VN")}đ
						</td>
					</tr>
				` : ""}
				`;
			})
			.join("");

		receiptWindow.document.write(`
			<html>
				<head>
					<title>Hóa đơn</title>
					<style>
						body { font-family: Arial, sans-serif; padding: 16px; }
						h1 { font-size: 16px; margin-bottom: 8px; }
						table { width: 100%; border-collapse: collapse; }
						td { padding: 4px 0; font-size: 12px; }
						.total { font-weight: bold; margin-top: 8px; }
					</style>
				</head>
				<body>
					<h1>Hóa đơn #${response.orderId}</h1>
					<div>Ngày: ${response.orderDate}</div>
					<table>
						<thead>
							<tr>
								<td>Sản phẩm</td>
								<td style="text-align:right;">SL</td>
								<td style="text-align:right;">Thành tiền</td>
							</tr>
						</thead>
						<tbody>
							${itemsHtml}
						</tbody>
					</table>
					<div class="total">Tạm tính: ${localData.subTotal.toLocaleString("vi-VN")}đ</div>
					<div>Giảm giá: ${localData.discountAmount.toLocaleString("vi-VN")}đ</div>
					<div class="total">Tổng: ${response.totalAmount.toLocaleString("vi-VN")}đ</div>
					${response.roundingAdjustment ? `<div>Điều chỉnh làm tròn: ${response.roundingAdjustment.toLocaleString("vi-VN")}đ</div>` : ""}
					<div>Tiền khách đưa: ${localData.amountGiven.toLocaleString("vi-VN")}đ</div>
					<div>Tiền thối: ${response.changeReturned.toLocaleString("vi-VN")}đ</div>
					${response.pointsEarned > 0 ? `<div style="margin-top:8px;color:#dd6b20;">⭐ Điểm tích lũy: +${response.pointsEarned.toLocaleString("vi-VN")} điểm</div>` : ""}
				</body>
			</html>
		`);

		receiptWindow.document.close();
		receiptWindow.focus();
		receiptWindow.print();
		// Don't auto-close - let user close when ready
	};

	// Print receipt for historical orders (from order detail modal)
	const printHistoricalReceipt = (order: SalesOrder) => {
		const receiptWindow = window.open(
			"",
			"_blank",
			"width=420,height=640,noopener,noreferrer",
		);
		if (!receiptWindow) return;

		const itemsHtml = order.items
			.map((item) => `
				<tr>
					<td>${item.product.name}${item.isFreeItem ? " (Tặng)" : ""}</td>
					<td style="text-align:right;">${item.quantity}</td>
					<td style="text-align:right;">${item.totalPrice.toLocaleString("vi-VN")}đ</td>
				</tr>
			`)
			.join("");

		const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);

		receiptWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Hóa đơn #${order.id}</title>
				<style>
					body { font-family: monospace; padding: 10px; max-width: 400px; margin: 0 auto; }
					h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
					table { width: 100%; border-collapse: collapse; margin: 10px 0; }
					td { padding: 5px; border-bottom: 1px dotted #ccc; }
					.total { font-weight: bold; font-size: 16px; margin-top: 10px; }
					@media print { body { width: 80mm; } }
				</style>
			</head>
			<body>
				<h1>🛒 5TProMart</h1>
				<h1>Hóa đơn #${order.id}</h1>
				<div>Ngày: ${orderDate.toLocaleDateString("vi-VN")} ${orderDate.toLocaleTimeString("vi-VN")}</div>
				<div>Khách: ${order.customer?.name || "Khách vãng lai"}</div>
				<table>
					<thead>
						<tr>
							<td>Sản phẩm</td>
							<td style="text-align:right;">SL</td>
							<td style="text-align:right;">Thành tiền</td>
						</tr>
					</thead>
					<tbody>${itemsHtml}</tbody>
				</table>
				<div class="total">Tổng: ${order.total.toLocaleString("vi-VN")}đ</div>
				<div>Thanh toán: ${order.paymentMethod === "cash" ? "Tiền mặt" : order.paymentMethod === "transfer" ? "Chuyển khoản" : order.paymentMethod}</div>
			</body>
			</html>
		`);

		receiptWindow.document.close();
		receiptWindow.focus();
		receiptWindow.print();
	};

	const handlePrint = async () => {
		if (orderItems.length === 0) {
			toast({
				title: "Đơn hàng trống",
				description: "Vui lòng thêm sản phẩm vào đơn hàng",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!paymentMethod) {
			toast({
				title: "Chưa chọn thanh toán",
				description: "Vui lòng chọn phương thức thanh toán",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const missingLotItems = orderItems.filter((item) => !item.batchId);
		if (missingLotItems.length > 0) {
			toast({
				title: "Thiếu mã lô",
				description:
					"Có sản phẩm chưa có mã lô. Vui lòng quét mã lô trước khi thanh toán.",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
			return;
		}

		if (user?.userId) {
			const unreservedItems = orderItems.filter(
				(item) => item.batchId && !item.reservationId,
			);
			if (unreservedItems.length > 0) {
				toast({
					title: "Chưa đặt trước đủ hàng",
					description:
						"Một số sản phẩm chưa được giữ chỗ. Vui lòng kiểm tra lại tồn kho.",
					status: "error",
					duration: 4000,
					isClosable: true,
				});
				return;
			}
		}

		try {
			// Convert orderItems to API format
			// NOTE: batchId IS the lotId (stored from BarcodeScanner)
			// Include promotional pricing data for backend persistence
			const apiItems = orderItems
				.filter((item) => item.batchId) // Only items with lotId
				.map((item) => ({
					lotId: item.batchId!,
					quantity: item.quantity,
					// Pass promotional price if available, otherwise current unit price
					// For free items: unitPrice is 0, for promo items: promotionalPrice
					unitPrice: item.isFreeItem ? 0 : (item.promotionalPrice ?? item.unitPrice),
					// Original price = product's base price (for financial tracking)
					// This is the price BEFORE any promotion was applied
					originalUnitPrice: item.product.price,
					// Pass promotion ID if item has a promotion applied
					promotionId: item.promotionId,
					// Flag for free items (Buy X Get Y)
					isFreeItem: item.isFreeItem,
				}));

			if (apiItems.length === 0) {
				toast({
					title: "Lỗi đơn hàng",
					description:
						"Không có sản phẩm hợp lệ. Vui lòng quét mã lô hàng.",
					status: "error",
					duration: 4000,
					isClosable: true,
				});
				return;
			}

			// Map FE paymentMethod to BE format
			const bePaymentMethod =
				paymentMethod === "cash" ? "CASH" : "BANK_TRANSFER";

			// Get staffId from auth store
			const staffId = user?.userId ?? "guest_staff";

			const payableTotal =
				paymentMethod === "cash"
					? calculateRoundedCashTotal()
					: calculateFinalTotal();
			if (paymentMethod === "cash") {
				if (cashReceived <= 0) {
					toast({
						title: "Chưa nhập tiền khách đưa",
						description: "Vui lòng nhập số tiền khách đưa",
						status: "warning",
						duration: 3000,
						isClosable: true,
					});
					return;
				}
				if (cashReceived < payableTotal) {
					toast({
						title: "Tiền khách đưa không đủ",
						description: `Số tiền tối thiểu cần thu: ${payableTotal.toLocaleString("vi-VN")}đ`,
						status: "warning",
						duration: 3000,
						isClosable: true,
					});
					return;
				}
			}

			// Use cashReceived if provided, otherwise use total (for transfer payments)
			const amountGiven =
				paymentMethod === "cash" ? cashReceived : payableTotal;

			// Calculate local values for receipt (BE doesn't return these)
			const subTotal = calculateSubtotal();
			const discountAmount = calculateDiscountAmount(subTotal);

			// Call API to create order
			const response = await salesService.createOrder({
				staffId,
				customerId: customer?.phone ? customer.id : null,
				paymentMethod: bePaymentMethod,
				amountGiven,
				items: apiItems,
				discount: discount || undefined,
			});

			printReceipt(response, { subTotal, discountAmount, amountGiven }, orderItems);

			// Success notification - brief, professional confirmation
			celebrate({
				amount: response.totalAmount,
				orderId: response.orderId,
				change: response.changeReturned,
				originalAmount: response.originalAmount,
				roundingAdjustment: response.roundingAdjustment,
				pointsEarned: response.pointsEarned,
			});

			// Clear localStorage
			localStorage.removeItem("salesPage_currentOrder");

			// Reset form
			setOrderItems([]);
			setPaymentMethod(undefined);
			setCashReceived(0);
			setDiscount(null);
			setOrderNumber(createDraftOrderNumber());
			setCreatedAt(new Date());
			setCustomer({
				id: `guest_${Date.now()}`,
				name: "KHÁCH VÃNG LAI",
				phone: "",
				points: 0,
			});

			// Reload orders list
			loadOrders();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Không thể tạo đơn hàng";
			toast({
				title: "Lỗi thanh toán",
				description: errorMessage,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	// Update refs for keyboard shortcuts
	handlePrintRef.current = handlePrint;

	const handleCustomerChange = (updatedCustomer: Customer | null) => {
		setCustomer(updatedCustomer);
	};

	// Tạm dừng hóa đơn hiện tại
	const handlePauseOrder = () => {
		if (orderItems.length === 0) {
			toast({
				title: "Không có hóa đơn để tạm dừng",
				description: "Vui lòng thêm sản phẩm trước khi tạm dừng",
				status: "warning",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		const pendingOrder: PendingOrder = {
			id: `pending_${Date.now()}`,
			orderNumber,
			items: [...orderItems],
			customer: customer ? { ...customer } : null,
			paymentMethod,
			createdAt,
			pausedAt: new Date(),
		};

		setPendingOrders([...pendingOrders, pendingOrder]);

		// Clear current order from localStorage
		localStorage.removeItem("salesPage_currentOrder");

		// Reset form để tạo hóa đơn mới
		setOrderItems([]);
		setPaymentMethod(undefined);
		setCustomer({
			id: `guest_${Date.now()}`,
			name: "KHÁCH VÃNG LAI",
			phone: "",
			points: 0,
		});

		toast({
			title: "Đã tạm dừng hóa đơn",
			description: `Hóa đơn ${orderNumber} đã được lưu. Bạn có thể tạo hóa đơn mới.`,
			status: "success",
			duration: 3000,
			isClosable: true,
			position: "top",
		});
	};

	// Update refs for keyboard shortcuts
	handlePauseOrderRef.current = handlePauseOrder;

	// Khôi phục hóa đơn tạm dừng
	const handleRestoreOrder = async (order: PendingOrder) => {
		// Nếu đang có hóa đơn, tự động lưu vào danh sách pending
		if (orderItems.length > 0) {
			const currentPendingOrder: PendingOrder = {
				id: `pending_${Date.now()}`,
				orderNumber,
				items: [...orderItems],
				customer: customer ? { ...customer } : null,
				paymentMethod,
				createdAt,
				pausedAt: new Date(),
			};

			// Thêm giỏ hàng hiện tại vào danh sách pending (nhưng chưa cập nhật state)
			// Sẽ cập nhật cùng lúc với việc xóa đơn hàng được khôi phục
			const updatedPendingOrders = [
				...pendingOrders.filter((po) => po.id !== order.id), // Xóa đơn hàng sẽ khôi phục
				currentPendingOrder, // Thêm giỏ hàng hiện tại
			];
			setPendingOrders(updatedPendingOrders);

			toast({
				title: "Đã lưu hóa đơn hiện tại",
				description: `Hóa đơn ${orderNumber} đã được lưu vào danh sách chờ`,
				status: "info",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
		} else {
			// Nếu giỏ hàng trống, chỉ xóa đơn hàng được khôi phục khỏi pending
			setPendingOrders(pendingOrders.filter((po) => po.id !== order.id));
		}

		// Re-reserve stock for restored items (old reservations are likely expired)
		// This is critical for data integrity - pending orders can be restored hours later
		const restoredItems: OrderItem[] = [];
		const failedItems: string[] = [];

		for (const item of order.items) {
			if (item.batchId && user?.userId) {
				try {
					// Create fresh reservation (ignore old reservationId - it's expired)
					const reservation = await reservationService.reserve({
						lotId: item.batchId,
						quantity: item.quantity,
						reservedBy: user.userId,
					});
					
					// Add item with fresh reservation ID
					restoredItems.push({
						...item,
						reservationId: reservation.reservationId,
					});
				} catch (error) {
					// Stock no longer available - add without reservation but warn user
					console.error(`Failed to reserve stock for ${item.product.name}:`, error);
					failedItems.push(item.product.name);
					restoredItems.push({
						...item,
						reservationId: undefined, // Clear stale reservation
					});
				}
			} else {
				// No batch (shouldn't happen in normal flow) - add as-is
				restoredItems.push({
					...item,
					reservationId: undefined,
				});
			}
		}

		// Khôi phục dữ liệu từ pending order
		setOrderItems(restoredItems);
		if (order.customer) {
			setCustomer({
				id: order.customer.id,
				name: order.customer.name,
				phone: order.customer.phone || "",
				points: order.customer.points || 0,
			});
		} else {
			setCustomer({
				id: `guest_${Date.now()}`,
				name: "KHÁCH VÃNG LAI",
				phone: "",
				points: 0,
			});
		}
		setPaymentMethod(order.paymentMethod);

		// Show appropriate toast based on results
		if (failedItems.length > 0) {
			toast({
				title: "Khôi phục hóa đơn - Cảnh báo",
				description: `Một số sản phẩm có thể đã hết hàng: ${failedItems.join(", ")}. Vui lòng kiểm tra lại.`,
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
		} else {
			toast({
				title: "Đã khôi phục hóa đơn",
				description: `Hóa đơn ${order.orderNumber} đã được khôi phục`,
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top",
			});
		}
	};

	// Xóa hóa đơn tạm dừng
	const handleDeletePendingOrder = async (orderId: string) => {
		const orderToDelete = pendingOrders.find((o) => o.id === orderId);
		if (orderToDelete) {
			// Release any reservations held by this pending order
			const reservationIds = orderToDelete.items
				.filter((item) => item.reservationId)
				.map((item) => item.reservationId as string);
			
			if (reservationIds.length > 0) {
				try {
					await reservationService.releaseAll(reservationIds, "Pending order deleted");
				} catch (error) {
					console.error("Failed to release reservations:", error);
				}
			}
		}
		setPendingOrders(pendingOrders.filter((order) => order.id !== orderId));
	};

	return (
		<MainLayout>
			<Box
				p={8}
				bg="gray.50"
				minH="100%">
				<Box
					bg="white"
					p={{ base: 4, md: 8 }}
					borderRadius="xl"
					boxShadow="sm"
					mb={6}>
					<Flex
						justify="space-between"
						align="flex-start"
						mb={5}
						gap={4}
						flexWrap={{ base: "wrap", lg: "nowrap" }}>
						<Heading
							size="lg"
							color="#161f70"
							minW="200px">
							Quản lý bán hàng
						</Heading>
						{activeTabIndex === 0 && (
							<Box flex="1">
								<OrderHeader
									orderNumber={orderNumber}
									customerName={
										customer?.name || "KHÁCH VÃNG LAI"
									}
									createdAt={createdAt}
									onPauseOrder={handlePauseOrder}
								/>
							</Box>
						)}
					</Flex>

					<Tabs
						colorScheme="blue"
						variant="enclosed"
						index={activeTabIndex}
						onChange={setActiveTabIndex}>
						<TabList>
							<Tab
								_selected={{
									color: "#161f70",
									bg: "blue.50",
									borderColor: "#161f70",
									borderBottomColor: "white",
								}}>
								Lập hóa đơn
							</Tab>
							<Tab
								_selected={{
									color: "#161f70",
									bg: "blue.50",
									borderColor: "#161f70",
									borderBottomColor: "white",
								}}>
								Lịch sử bán hàng
							</Tab>
						</TabList>

						<TabPanels>
							{/* Tab: Lập hóa đơn */}
							<TabPanel px={0}>
								<Box
									pt={1}
									pb="180px">
									{/* pb=200px to clear PaymentFooter (~180px) which is position:fixed at bottom */}

									{/* Pending Orders - Show at top for visibility */}
									<PendingOrdersList
										pendingOrders={pendingOrders}
										onRestore={handleRestoreOrder}
										onDelete={handleDeletePendingOrder}
									/>

									<Box
										mb={2}
										flex={1}
										maxW="100%">
										<Box
											bg="white"
											borderRadius="xl"
											p={3}
											boxShadow="sm">
											<ProductSearchBar
												onProductSelect={
													handleProductSelect
												}
												onOpenBarcodeScanner={
													onBarcodeScannerOpen
												}
											/>
										</Box>
									</Box>

									<Box mb={5}>
										<Box
											bg="white"
											borderRadius="xl"
											p={3}
											boxShadow="sm">
											<OrderItemsTable
												items={orderItems}
												onUpdateQuantity={
													handleUpdateQuantity
												}
												onRemoveItem={handleRemoveItem}
											/>
										</Box>
									</Box>

									<BarcodeScanner
										isOpen={isBarcodeScannerOpen}
										onClose={onBarcodeScannerClose}
										onProductFound={handleProductSelect}
									/>
								</Box>

								{/* Floating Payment Footer */}
								<PaymentFooter
									subtotal={calculateSubtotal()}
											total={finalTotal}
											roundedTotal={roundedCashTotal}
											roundingAdjustment={roundingAdjustment}
									loyaltyPoints={
										customer?.phone
											? calculateLoyaltyPoints()
											: undefined
									}
									paymentMethod={paymentMethod}
											onPaymentMethodChange={(method) => {
												setPaymentMethod(method);
												if (method !== "cash") {
													setCashReceived(0);
												}
											}}
									onPrint={handlePrint}
									isDisabled={orderItems.length === 0}
									customer={customer}
									onCustomerChange={handleCustomerChange}
									cashReceived={cashReceived}
									onCashReceivedChange={setCashReceived}
									discount={discount}
									onDiscountChange={setDiscount}
								/>
							</TabPanel>

							{/* Tab: Lịch sử bán hàng */}
							<TabPanel px={0}>
								<VStack
									spacing={5}
									align="stretch"
									pt={4}>
									<OrderFilterBar
										filters={filters}
										onFiltersChange={handleFiltersChange}
										onReset={handleResetFilters}
									/>{" "}
									<Box
										bg="white"
										borderRadius="xl"
										p={6}
										boxShadow="sm">
											<Heading
											size="md"
											mb={4}
											color="#161f70">
												Danh sách đơn hàng ({orderTotalItems})
										</Heading>
										<OrderHistoryTable
											orders={filteredOrders}
											onViewDetail={handleViewOrderDetail}
										/>
											{orderTotalPages > 1 && (
												<Box mt={4}>
													<Pagination
														currentPage={orderPage}
														totalPages={orderTotalPages}
														totalItems={orderTotalItems}
														pageSize={orderPageSize}
														onPageChange={setOrderPage}
														showInfo={true}
														itemLabel="đơn hàng"
													/>
												</Box>
											)}
									</Box>
								</VStack>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>

				{/* Keyboard Shortcuts Help Modal */}
				<KeyboardShortcutsModal
					isOpen={isShortcutsHelpOpen}
					onClose={onShortcutsHelpClose}
					context="sales"
				/>

				{/* Order Detail Modal */}
				<OrderDetailModal
					isOpen={isOpen}
					onClose={onClose}
					order={selectedOrder}
					onPrint={printHistoricalReceipt}
				/>

				{/* Sale success notification */}
				<SaleCelebration
					isOpen={celebrationData.isOpen}
					onClose={closeCelebration}
					amount={celebrationData.amount}
					orderId={celebrationData.orderId}
					change={celebrationData.change}
					originalAmount={celebrationData.originalAmount}
					roundingAdjustment={celebrationData.roundingAdjustment}
					pointsEarned={celebrationData.pointsEarned}
				/>

				{/* Clear Cart Confirmation Dialog */}
				<AlertDialog
					isOpen={isClearCartOpen}
					leastDestructiveRef={clearCartCancelRef}
					onClose={onClearCartClose}
				>
					<AlertDialogOverlay>
						<AlertDialogContent>
							<AlertDialogHeader fontSize="lg" fontWeight="bold">
								Xóa giỏ hàng?
							</AlertDialogHeader>

							<AlertDialogBody>
								Bạn có chắc muốn xóa {orderItems.length} sản phẩm khỏi giỏ hàng? 
								Hành động này không thể hoàn tác.
							</AlertDialogBody>

							<AlertDialogFooter>
								<Button ref={clearCartCancelRef} onClick={onClearCartClose}>
									Hủy
								</Button>
								<Button colorScheme="red" onClick={doClearCart} ml={3}>
									Xóa
								</Button>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialogOverlay>
				</AlertDialog>
			</Box>
		</MainLayout>
	);
};
export default SalesPage;
