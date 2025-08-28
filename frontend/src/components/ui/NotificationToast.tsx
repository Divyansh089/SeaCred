"use client";

import { Fragment, memo, useCallback } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Notification } from "@/contexts/NotificationContext";

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const colors = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

const iconColors = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
};

const NotificationToast = memo(function NotificationToast({
  notification,
  onRemove,
}: NotificationToastProps) {
  const Icon = icons[notification.type];
  const colorClass = colors[notification.type];
  const iconColorClass = iconColors[notification.type];

  const handleRemove = useCallback(() => {
    onRemove(notification.id);
  }, [onRemove, notification.id]);

  return (
    <Transition
      show={true}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg ring-1 ring-black ring-opacity-5 ${colorClass}`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon
                className={`h-6 w-6 ${iconColorClass}`}
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium">{notification.title}</p>
              {notification.message && (
                <p className="mt-1 text-sm opacity-90">
                  {notification.message}
                </p>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconColorClass} hover:opacity-75 transition-opacity duration-200`}
                onClick={handleRemove}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
});

export default NotificationToast;
