import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { transactionApi, errorMessage } from './transactionApi';
import type { Cart } from './types';
interface CartState {
  cart: Cart | null;
  loading: boolean;
  busy: boolean;
  error: string;
  refresh: () => Promise<void>;
  add: (productId: number, quantity?: number) => Promise<void>;
  update: (id: number, quantity: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}
const Context = createContext<CartState | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const revision = useRef(0);
  const pending = useRef(false);
  const refresh = useCallback(async () => {
    if (!userId || pending.current) return;
    const request = ++revision.current;
    setLoading(true);
    setError('');
    try {
      const data = await transactionApi.cart();
      if (request === revision.current) setCart(data);
    } catch (err) {
      if (request === revision.current) setError(errorMessage(err));
    } finally {
      if (request === revision.current) setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    revision.current++;
    pending.current = false;
    setCart(null);
    setError('');
    setBusy(false);
    setLoading(!!userId);
    void refresh();
    return () => {
      revision.current++;
    };
  }, [refresh, userId]);
  const mutate = async (operation: () => Promise<Cart>) => {
    if (pending.current) throw new Error('Đang cập nhật giỏ hàng');
    const request = ++revision.current;
    pending.current = true;
    setBusy(true);
    setLoading(false);
    setError('');
    try {
      const data = await operation();
      if (request === revision.current) setCart(data);
    } catch (err) {
      if (request === revision.current) setError(errorMessage(err));
      throw err;
    } finally {
      if (request === revision.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  };
  return (
    <Context.Provider
      value={{
        cart,
        loading,
        busy,
        error,
        refresh,
        add: (id, quantity = 1) => mutate(() => transactionApi.add(id, quantity)),
        update: (id, quantity) => mutate(() => transactionApi.update(id, quantity)),
        remove: (id) => mutate(() => transactionApi.remove(id)),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error('CartProvider is required');
  return value;
}
