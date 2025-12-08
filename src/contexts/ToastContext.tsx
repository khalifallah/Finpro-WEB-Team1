"use client";

import React, { createContext, useState, useContext, ReactNode, useRef } from "react";

interface Toast {
  id: string; // Changed from number to string for better uniqueness
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"], duration?: number) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0); // Add a counter ref for unique IDs

  const showToast = (
    message: string,
    type: Toast["type"] = "info",
    duration: number = 5000
  ): string => {
    // Generate a more unique ID with timestamp + counter
    const timestamp = Date.now();
    counter.current += 1;
    const id = `${timestamp}_${counter.current}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => {
      // Ensure we don't have duplicate IDs (though very unlikely with this method)
      const existingIds = new Set(prev.map(toast => toast.id));
      if (existingIds.has(id)) {
        // If by chance duplicate, generate a new one
        const newId = `${id}_${Math.random().toString(36).substr(2, 4)}`;
        return [...prev, { ...newToast, id: newId }];
      }
      return [...prev, newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const hideAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, hideAllToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast toast-bottom toast-end z-[100]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert ${getToastClass(toast.type)} animate-fade-in-up mb-2 shadow-lg`}
            onClick={() => hideToast(toast.id)}
          >
            <div className="flex items-center">
              {getToastIcon(toast.type)}
              <span className="flex-1 px-2">{toast.message}</span>
              <button
                className="btn btn-ghost btn-xs ml-2 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  hideToast(toast.id);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

function getToastClass(type: Toast["type"]): string {
  switch (type) {
    case "success":
      return "alert-success";
    case "error":
      return "alert-error";
    case "warning":
      return "alert-warning";
    case "info":
      return "alert-info";
    default:
      return "alert-info";
  }
}

function getToastIcon(type: Toast["type"]): React.ReactNode {
  switch (type) {
    case "success":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    case "info":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      return null;
  }
}