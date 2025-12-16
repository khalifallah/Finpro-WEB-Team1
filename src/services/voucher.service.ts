import { axiosInstance } from "@/libs/axios/axios.config";

export interface Voucher {
  id: number;
  code: string; // Kode unik (misal: REFERRAL-123)
  description: string;
  type: "NOMINAL" | "PERCENTAGE";
  value: number;
  minPurchase: number;
  maxDiscount: number;
  expiresAt: string;
  target: "TRANSACTION" | "SHIPPING";
}

export const voucherService = {
  getMyVouchers: async () => {
    try {
      const response = await axiosInstance.get("/vouchers/my-vouchers");
      return response.data.data as Voucher[];
    } catch (error: any) {
      console.error("Failed to fetch vouchers", error);
      return [];
    }
  },
};
