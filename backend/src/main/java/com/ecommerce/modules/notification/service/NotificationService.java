package com.ecommerce.modules.notification.service;

import com.ecommerce.modules.notification.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getMyNotifications();
    long getUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
    void deleteNotification(Long id);

    void notifyUser(Long userId, String title, String message);
    void notifyAdmins(String title, String message);
}
