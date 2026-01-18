/**
 * Stock Reservation Types
 * Used for POS operations to prevent overselling
 */

export interface ReserveStockRequest {
  lotId: string;
  quantity: number;
  reservedBy: string; // staff ID or session ID
}

export interface ReleaseReservationRequest {
  reservationId: string;
  reason?: string;
}

export interface StockReservation {
  reservationId: string;
  lotId: string;
  productId: string;
  quantity: number;
  reservedBy: string;
  reservedAt: string; // ISO date
  expiresAt: string; // ISO date
  status: 'ACTIVE' | 'COMMITTED' | 'RELEASED' | 'EXPIRED';
}

export interface CommitReservationsRequest {
  reservationIds: string[];
  orderId: string;
}
