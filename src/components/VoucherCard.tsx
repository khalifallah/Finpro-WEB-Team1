"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/libs/axios/axios.config";
import { FaTicketAlt, FaClock, FaExclamationCircle } from "react-icons/fa";

interface Voucher {
  id: number;
  code: string;
  description: string;
  value: number;
  type: "PERCENTAGE" | "NOMINAL";
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  expiresAt: string;
  isUsed: boolean;
  is_active: boolean; // Add this if backend returns it
}

// Add formatPrice helper here if you don't want to import it
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function VoucherCard() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axiosInstance.get("/auth/profile/vouchers");

        const voucherData = response.data?.data?.vouchers || [];
        setVouchers(voucherData);
      } catch (error) {
        console.error("Failed to fetch vouchers", error);
        setVouchers([]); // Clear vouchers on error instead of showing mock data
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const getDaysLeft = (dateString: string) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-5">
          <h2 className="card-title text-lg mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-primary" />
            My Vouchers
          </h2>
          <div className="space-y-4">
            <div className="h-24 bg-base-200 animate-pulse rounded-lg"></div>
            <div className="h-24 bg-base-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no vouchers, show empty state or return null
  if (vouchers.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-5">
          <h2 className="card-title text-lg mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-primary" />
            My Vouchers
          </h2>
          <div className="text-center py-8 text-base-content/50 text-sm">
            You don't have any vouchers yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body p-5">
        <h2 className="card-title text-lg mb-4 flex items-center gap-2">
          <FaTicketAlt className="text-primary" />
          My Vouchers
        </h2>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {vouchers.map((userVoucher: any) => {
            const voucher = userVoucher.voucher;
            // If backend returns flat structure, adjust accordingly
            const data = voucher || userVoucher;

            const daysLeft = getDaysLeft(data.expiresAt);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = daysLeft > 0 && daysLeft <= 3;
            const isUsed = userVoucher.isUsed;

            return (
              <div
                key={userVoucher.id}
                className={`relative border rounded-lg p-4 transition-all hover:shadow-md ${
                  isExpired || isUsed
                    ? "bg-base-200/50 border-base-200 grayscale-[0.6]"
                    : "bg-base-100 border-base-300"
                }`}
              >
                {/* Header: Value & Status */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3
                      className={`font-bold text-lg ${
                        isExpired || isUsed
                          ? "text-base-content/60"
                          : "text-primary"
                      }`}
                    >
                      {data.type === "PERCENTAGE"
                        ? `${data.value}% OFF`
                        : `${formatPrice(data.value)} OFF`}
                    </h3>
                    <p className="text-xs text-base-content/60 font-mono tracking-wider bg-base-200/50 px-2 py-0.5 rounded inline-block mt-1">
                      {data.code}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1">
                    {isUsed ? (
                      <div className="badge badge-neutral gap-1 opacity-80 text-xs">
                        Used
                      </div>
                    ) : isExpired ? (
                      <div className="badge badge-error gap-1 opacity-80 text-xs text-white">
                        <FaExclamationCircle className="text-[10px]" /> Expired
                      </div>
                    ) : (
                      <div
                        className={`badge gap-1 text-xs ${
                          isExpiringSoon
                            ? "badge-warning"
                            : "badge-success text-white"
                        }`}
                      >
                        <FaClock className="text-[10px]" />
                        {daysLeft === 0
                          ? "Expires Today"
                          : `${daysLeft} days left`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-dashed border-base-300 my-3"></div>

                <div className="text-xs space-y-1.5 text-base-content/70">
                  <p className="font-medium line-clamp-2">{data.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-80">
                    <p>Min. purchase: {formatPrice(data.minPurchaseAmount)}</p>
                    {data.maxDiscountAmount > 0 && (
                      <p>Max discount: {formatPrice(data.maxDiscountAmount)}</p>
                    )}
                  </div>

                  {/* Valid Until Text */}
                  <p
                    className={`pt-1 font-medium ${
                      isExpired ? "text-error/70" : "text-success"
                    }`}
                  >
                    {isExpired
                      ? `Expired on ${new Date(
                          data.expiresAt
                        ).toLocaleDateString()}`
                      : `Valid until ${new Date(
                          data.expiresAt
                        ).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
