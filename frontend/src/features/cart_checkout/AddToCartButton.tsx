import { useState } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { AddShoppingCartOutlined } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from './CartContext';
import { errorMessage } from './transactionApi';
export function AddToCartButton({
  productId,
  quantity = 1,
  compact = false,
  disabled = false,
}: {
  productId: number;
  quantity?: number;
  compact?: boolean;
  disabled?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const { add, busy } = useCart();
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const [failed, setFailed] = useState(false);
  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${productId}` } });
      return;
    }
    try {
      await add(productId, quantity);
      setFailed(false);
      setNotice('Đã thêm vào giỏ hàng');
    } catch (err) {
      setFailed(true);
      setNotice(errorMessage(err));
    }
  };
  return (
    <>
      <Button
        fullWidth
        variant={compact ? 'outlined' : 'contained'}
        size={compact ? 'small' : 'large'}
        startIcon={<AddShoppingCartOutlined sx={{ fontSize: '18px !important' }} />}
        disabled={busy || disabled}
        onClick={handleAdd}
        sx={{ fontSize: compact ? { xs: 10, sm: 12 } : 14, px: compact ? 0.75 : 2 }}
      >
        {busy
          ? 'Đang thêm...'
          : disabled
            ? 'Tạm hết hàng'
            : compact
              ? 'Thêm vào giỏ'
              : 'Thêm vào giỏ hàng'}
      </Button>
      <Snackbar
        open={!!notice}
        autoHideDuration={5000}
        onClose={() => setNotice('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={failed ? 'error' : 'success'}
          onClose={() => setNotice('')}
          action={
            !failed ? (
              <Button component={Link} to="/cart" color="inherit" size="small">
                Xem giỏ
              </Button>
            ) : undefined
          }
        >
          {notice}
        </Alert>
      </Snackbar>
    </>
  );
}
