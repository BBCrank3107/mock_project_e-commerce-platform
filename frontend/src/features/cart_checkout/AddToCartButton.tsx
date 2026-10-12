import { useState } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { AddShoppingCartOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from './CartContext';
import { errorMessage } from './transactionApi';
export function AddToCartButton({ productId }: { productId: number }) {
  const { isAuthenticated } = useAuth(); const { add, busy } = useCart(); const navigate = useNavigate();
  const [notice, setNotice] = useState(''); const [failed, setFailed] = useState(false);
  const handleAdd = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try { await add(productId); setFailed(false); setNotice('Đã thêm sản phẩm vào giỏ hàng'); }
    catch (err) { setFailed(true); setNotice(errorMessage(err)); }
  };
  return <>
    <Button fullWidth variant="outlined" startIcon={<AddShoppingCartOutlined />} disabled={busy} onClick={handleAdd}>Thêm vào giỏ hàng</Button>
    <Snackbar open={!!notice} autoHideDuration={4000} onClose={() => setNotice('')}>
      <Alert severity={failed ? 'error' : 'success'} onClose={() => setNotice('')}>{notice}</Alert>
    </Snackbar>
  </>;
}
