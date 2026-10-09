import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../features/wishlist/wishlistApi';
import type { WishlistItem } from '../features/wishlist/types';
import type { Product } from '../features/catalog/types';

interface WishlistContextType {
  wishlistIds: Set<number>;
  items: WishlistItem[];
  loading: boolean;
  wishlistCount: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const [fetchedItems, fetchedIds] = await Promise.all([
        wishlistApi.getMyWishlist(),
        wishlistApi.getWishlistIds(),
      ]);
      setItems(fetchedItems);
      setWishlistIds(new Set(fetchedIds));
    } catch {
      // Ignore or clear on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = useCallback(
    (productId: number) => wishlistIds.has(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!isAuthenticated) {
        setFeedback({
          open: true,
          message: 'Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!',
          severity: 'info',
        });
        return false;
      }

      const wasInWishlist = wishlistIds.has(product.id);
      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasInWishlist) {
          next.delete(product.id);
        } else {
          next.add(product.id);
        }
        return next;
      });

      if (wasInWishlist) {
        setItems((prev) => prev.filter((item) => item.product.id !== product.id));
      }

      try {
        const res = await wishlistApi.toggleWishlist(product.id);
        setFeedback({
          open: true,
          message: res.message,
          severity: res.inWishlist ? 'success' : 'info',
        });

        if (res.inWishlist) {
          // Add to items list if wasn't there
          setItems((prev) => [
            { id: Date.now(), product, createdAt: new Date().toISOString() },
            ...prev,
          ]);
        }
        return res.inWishlist;
      } catch (err: any) {
        // Rollback on error
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasInWishlist) {
            next.add(product.id);
          } else {
            next.delete(product.id);
          }
          return next;
        });
        setFeedback({
          open: true,
          message: err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!',
          severity: 'error',
        });
        return wasInWishlist;
      }
    },
    [isAuthenticated, wishlistIds]
  );

  const removeFromWishlist = useCallback(
    async (productId: number) => {
      // Optimistic remove
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setItems((prev) => prev.filter((item) => item.product.id !== productId));

      try {
        await wishlistApi.removeFromWishlist(productId);
        setFeedback({
          open: true,
          message: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
          severity: 'info',
        });
      } catch {
        void refreshWishlist();
      }
    },
    [refreshWishlist]
  );

  const wishlistCount = useMemo(() => wishlistIds.size, [wishlistIds]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        items,
        loading,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
      <Snackbar
        open={feedback.open}
        autoHideDuration={2500}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setFeedback((f) => ({ ...f, open: false }))}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
