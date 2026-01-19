/**
 * Stock Reservation Service
 * Prevents overselling by reserving stock when products are scanned in POS
 * 
 * Spec: Backend StockReservationController
 * Endpoint: /api/v1/stock-reservations
 */

import apiService from "@/lib/api";
import type {
  ReserveStockRequest,
  ReleaseReservationRequest,
  StockReservation,
  CommitReservationsRequest,
} from "@/types/reservation";

export const reservationService = {
  /**
   * Reserve stock when product is scanned in POS
   * Prevents other cashiers from selling the same stock
   * 
   * @param request - lotId, quantity, reservedBy (staff/session ID)
   * @returns StockReservation with reservationId for tracking
   */
  reserve: async (request: ReserveStockRequest): Promise<StockReservation> => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: StockReservation;
    }>("/stock-reservations", request);
    return response.data;
  },

  /**
   * Release a reservation (when removing item from cart or canceling order)
   * 
   * @param request - reservationId, optional reason
   */
  release: async (request: ReleaseReservationRequest): Promise<void> => {
    await apiService.post<{ success: boolean; message: string }>(
      "/stock-reservations/release",
      request
    );
  },

  /**
   * Commit reservations when order is completed
   * Converts reserved stock to sold stock
   * 
   * NOTE: This is typically called by the backend during order creation
   * Frontend may not need to call this directly
   */
  commit: async (request: CommitReservationsRequest): Promise<void> => {
    await apiService.post<{ success: boolean; message: string }>(
      "/stock-reservations/commit",
      request
    );
  },

  /**
   * Release multiple reservations at once
   * Useful when clearing the cart
   */
  releaseAll: async (reservationIds: string[], reason?: string): Promise<void> => {
    await Promise.all(
      reservationIds.map(reservationId =>
        reservationService.release({ reservationId, reason })
      )
    );
  },
};

export default reservationService;
