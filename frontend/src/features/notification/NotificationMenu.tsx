import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  NotificationsNoneOutlined,
  NotificationsActiveOutlined,
  ReceiptLongOutlined,
  DeleteOutline,
  DoneAllOutlined,
  LocalShippingOutlined,
  CancelOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  } catch {
    return 'Gần đây';
  }
}

export const NotificationMenu: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotification();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (id: number) => {
    void markAsRead(id);
    handleClose();
    if (isAdmin) {
      navigate('/admin/orders');
    } else {
      navigate('/orders');
    }
  };

  const open = Boolean(anchorEl);

  const getNotificationIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('hủy')) {
      return <CancelOutlined sx={{ fontSize: 20, color: '#e11d48' }} />;
    }
    if (lower.includes('giao') || lower.includes('shipping')) {
      return <LocalShippingOutlined sx={{ fontSize: 20, color: '#0284c7' }} />;
    }
    return <ReceiptLongOutlined sx={{ fontSize: 20, color: 'primary.main' }} />;
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          onClick={handleClick}
          aria-label={`Thông báo, ${unreadCount} chưa đọc`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? (
              <NotificationsActiveOutlined sx={{ fontSize: 23, color: 'primary.main' }} />
            ) : (
              <NotificationsNoneOutlined sx={{ fontSize: 23 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 'min(380px, 92vw)',
            maxHeight: 520,
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(32, 41, 35, 0.16)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2.5, py: 2, bgcolor: '#fbfcf9' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              Thông báo
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'error.main',
                  color: '#fff',
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                {unreadCount} mới
              </Typography>
            )}
          </Stack>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllOutlined fontSize="small" />}
              onClick={() => void markAllAsRead()}
              sx={{ textTransform: 'none', fontSize: 12, p: 0.5 }}
            >
              Đọc tất cả
            </Button>
          )}
        </Stack>

        <Divider />

        <Box sx={{ overflowY: 'auto', flex: 1, maxHeight: 380 }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
              <NotificationsNoneOutlined
                sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }}
              />
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Bạn chưa có thông báo nào
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Các thông tin về đơn hàng và hệ thống sẽ xuất hiện tại đây.
              </Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <Box
                key={n.id}
                sx={{
                  position: 'relative',
                  px: 2.5,
                  py: 1.75,
                  display: 'flex',
                  gap: 1.5,
                  cursor: 'pointer',
                  bgcolor: n.isRead ? 'transparent' : 'rgba(38, 60, 48, 0.05)',
                  transition: 'background-color 150ms ease',
                  '&:hover': {
                    bgcolor: 'rgba(38, 60, 48, 0.09)',
                    '& .delete-btn': { opacity: 1 },
                  },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
                onClick={() => handleItemClick(n.id)}
              >
                <Box sx={{ mt: 0.5 }}>{getNotificationIcon(n.title)}</Box>

                <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: n.isRead ? 500 : 700,
                      lineHeight: 1.3,
                      color: 'text.primary',
                    }}
                  >
                    {n.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.25,
                      lineHeight: 1.4,
                    }}
                  >
                    {n.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5, display: 'block' }}
                  >
                    {formatRelativeTime(n.createdAt)}
                  </Typography>
                </Box>

                {!n.isRead && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 14,
                      top: 18,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                    }}
                  />
                )}

                <IconButton
                  size="small"
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteNotification(n.id);
                  }}
                  aria-label="Xóa thông báo"
                  sx={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    opacity: 0,
                    transition: 'opacity 150ms ease',
                    p: 0.5,
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  <DeleteOutline sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
};
