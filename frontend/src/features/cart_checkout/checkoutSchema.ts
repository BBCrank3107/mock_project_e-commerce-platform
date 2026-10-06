import { z } from 'zod';
export const checkoutSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ tên')
    .max(150, 'Họ tên tối đa 150 ký tự'),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9][0-9 ()-]{8,19}$/, 'Số điện thoại không hợp lệ'),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ').max(2000, 'Địa chỉ quá dài'),
  city: z.string().trim().min(1, 'Vui lòng nhập tỉnh/thành phố').max(100),
  paymentMethod: z.enum(['COD', 'BANKING']),
  notes: z.string().max(2000, 'Ghi chú tối đa 2.000 ký tự').optional(),
});
