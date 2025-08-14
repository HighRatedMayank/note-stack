"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const notificationStyles = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-800 dark:text-green-200",
    iconColor: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-800 dark:text-yellow-200",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

export default function Notification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className = "",
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const styles = notificationStyles[type];
  const Icon = styles.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${className}`}
    >
      <div
        className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4`}
      >
        <div className="flex items-start gap-3">
          <Icon size={20} className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <h3 className={`${styles.text} font-medium text-sm`}>{title}</h3>
            {message && (
              <p className={`${styles.text} text-sm mt-1 opacity-90`}>{message}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`${styles.text} hover:opacity-70 transition-opacity duration-200`}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast notification for quick feedback
export function Toast({
  type,
  title,
  message,
  duration = 3000,
  onClose,
}: Omit<NotificationProps, "className">) {
  return (
    <Notification
      type={type}
      title={title}
      message={message}
      duration={duration}
      onClose={onClose}
      className="max-w-xs"
    />
  );
}

// Inline notification for forms and content
export function InlineNotification({
  type,
  title,
  message,
  className = "",
}: Omit<NotificationProps, "duration" | "onClose">) {
  const styles = notificationStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-md p-3 ${className}`}
    >
      <div className="flex items-start gap-2">
        <Icon size={16} className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className={`${styles.text} font-medium text-sm`}>{title}</h4>
          {message && (
            <p className={`${styles.text} text-sm mt-1 opacity-90`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
