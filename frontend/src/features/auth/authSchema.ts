import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập không được để trống')
    .min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Tên đăng nhập không được để trống')
      .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
      .max(50, 'Tên đăng nhập tối đa 50 ký tự'),
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Địa chỉ email không hợp lệ'),
    fullName: z
      .string()
      .min(1, 'Họ và tên không được để trống')
      .min(2, 'Họ và tên tối thiểu 2 ký tự'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{10,11}$/.test(val),
        'Số điện thoại phải gồm 10-11 chữ số'
      ),
    password: z
      .string()
      .min(1, 'Mật khẩu không được để trống')
      .min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận lại mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
