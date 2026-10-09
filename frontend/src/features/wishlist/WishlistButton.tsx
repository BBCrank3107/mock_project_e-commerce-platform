import React from 'react';
import { IconButton, Button, Tooltip, Zoom } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';
import type { Product } from '../catalog/types';

interface WishlistButtonProps {
  product: Product;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  sx?: any;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 'medium',
  showLabel = false,
  sx = {},
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void toggleWishlist(product);
  };

  if (showLabel) {
    return (
      <Button
        variant={active ? 'contained' : 'outlined'}
        color={active ? 'error' : 'inherit'}
        size={size}
        startIcon={active ? <Favorite sx={{ color: '#fff' }} /> : <FavoriteBorder />}
        onClick={handleClick}
        sx={{
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 200ms ease',
          ...(active && {
            bgcolor: '#e11d48',
            borderColor: '#e11d48',
            color: '#fff',
            '&:hover': { bgcolor: '#be123c', borderColor: '#be123c' },
          }),
          ...sx,
        }}
      >
        {active ? 'Đã yêu thích' : 'Yêu thích'}
      </Button>
    );
  }

  return (
    <Tooltip
      title={active ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      TransitionComponent={Zoom}
      arrow
    >
      <IconButton
        onClick={handleClick}
        size={size}
        aria-label={active ? `Xóa ${product.name} khỏi yêu thích` : `Yêu thích ${product.name}`}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 200ms',
          '&:hover': {
            bgcolor: '#fff',
            transform: 'scale(1.15)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          },
          '&:active': {
            transform: 'scale(0.92)',
          },
          ...sx,
        }}
      >
        {active ? (
          <Favorite
            sx={{
              color: '#e11d48',
              fontSize: size === 'small' ? 18 : size === 'large' ? 24 : 20,
              animation: 'heartPop 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '@keyframes heartPop': {
                '0%': { transform: 'scale(0.5)' },
                '50%': { transform: 'scale(1.3)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          />
        ) : (
          <FavoriteBorder
            sx={{
              color: 'text.secondary',
              fontSize: size === 'small' ? 18 : size === 'large' ? 24 : 20,
              '&:hover': { color: '#e11d48' },
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
};
