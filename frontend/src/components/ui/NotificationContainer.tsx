"use client";

import { memo, useMemo } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationToast from "./NotificationToast";

const NotificationContainer = memo(function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  const notificationElements = useMemo(
    () =>
      notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      )),
    [notifications, removeNotification]
  );

  return (
    <div className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notificationElements}
      </div>
    </div>
  );
});

export default NotificationContainer;
