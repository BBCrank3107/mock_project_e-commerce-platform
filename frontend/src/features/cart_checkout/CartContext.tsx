import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { transactionApi, errorMessage } from './transactionApi';
import type { Cart } from './types';

interface CartState {
  cart: Cart | null; loading: boolean; busy: boolean; error: string;
  refresh: () => Promise<void>;
  add: (productId: number) => Promise<void>;
  update: (id: number, quantity: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}
const Context = createContext<CartState | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!user) return;
    const current = generation.current;
    setLoading(true); setError('');
    try { const data = await transactionApi.cart(); if (current === generation.current) setCart(data); }
    catch (err) { if (current === generation.current) setError(errorMessage(err)); }
    finally { if (current === generation.current) setLoading(false); }
  }, [user?.id]);
  useEffect(() => {
    generation.current++; setCart(null); setError(''); setLoading(false); setBusy(false);
    void refresh();
    return () => { generation.current++; };
  }, [refresh]);
  const mutate = async (operation: () => Promise<Cart>) => {
    const current = generation.current; setBusy(true); setError('');
    try { const data = await operation(); if (current === generation.current) setCart(data); }
    catch (err) { if (current === generation.current) setError(errorMessage(err)); throw err; }
    finally { if (current === generation.current) setBusy(false); }
  };
  return <Context.Provider value={{ cart, loading, busy, error, refresh,
    add: id => mutate(() => transactionApi.add(id)),
    update: (id, quantity) => mutate(() => transactionApi.update(id, quantity)),
    remove: id => mutate(() => transactionApi.remove(id)),
  }}>{children}</Context.Provider>;
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error('CartProvider is required');
  return value;
}
