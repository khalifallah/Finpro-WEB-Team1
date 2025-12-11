// src/hooks/useOrderActions.ts
import { useState } from "react";
import { axiosInstance } from "@/libs/axios/axios.config";
// Pastikan path ToastContext sesuai dengan struktur foldermu
import { useToast } from "@/contexts/ToastContext";

export const useOrderActions = (
  orderId: string | string[],
  onSuccess: () => void
) => {
  const { showToast } = useToast(); // Pastikan ToastContext sudah diprovide di root
  const [actionLoading, setActionLoading] = useState(false);

  const uploadPayment = async (file: File) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      await axiosInstance.post(`/orders/${orderId}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Payment proof uploaded successfully", "success");
      onSuccess();
      return true;
    } catch (err: any) {
      showToast(err.response?.data?.message || "Upload failed", "error");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const cancelOrder = async (reason: string) => {
    try {
      setActionLoading(true);
      await axiosInstance.post(`/orders/${orderId}/cancel`, { reason });
      showToast("Order cancelled successfully", "success");
      onSuccess();
      return true;
    } catch (err: any) {
      showToast(err.response?.data?.message || "Cancellation failed", "error");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const confirmOrder = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.post(`/orders/${orderId}/confirm`);
      showToast("Order confirmed received", "success");
      onSuccess();
      return true;
    } catch (err: any) {
      showToast(err.response?.data?.message || "Confirmation failed", "error");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    uploadPayment,
    cancelOrder,
    confirmOrder,
  };
};
