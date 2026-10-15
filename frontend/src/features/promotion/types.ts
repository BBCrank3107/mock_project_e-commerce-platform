export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountPercent: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'DISABLED';
  statusLabel: string;
}

export interface VoucherFormData {
  code: string;
  description?: string;
  discountPercent: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}
