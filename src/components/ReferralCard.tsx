import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FaCopy, FaGift, FaCheck } from "react-icons/fa";

export default function ReferralCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user?.referralCode) return null;

  return (
    <div className="card bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-xl mt-6">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="card-title text-2xl mb-1 flex items-center gap-2">
              <FaGift className="text-yellow-300" />
              Invite Friends & Earn!
            </h2>
            <p className="opacity-90">
              Share your code. When a friend registers and shops:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm opacity-90 font-medium">
              <li>
                They get{" "}
                <span className="text-yellow-300 font-bold">10% OFF</span> their
                first purchase
              </li>
              <li>
                You get{" "}
                <span className="text-yellow-300 font-bold">15% OFF</span>{" "}
                discount coupon
              </li>
            </ul>
          </div>
        </div>

        <div className="divider divider-neutral opacity-30 my-2"></div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <span className="text-sm uppercase tracking-wider font-semibold opacity-80">
            Your Referral Code
          </span>

          <div className="join w-full sm:w-auto">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-l-lg font-mono text-xl font-bold tracking-widest border border-white/30 flex-grow text-center">
              {user.referralCode}
            </div>
            <button
              className="btn btn-warning join-item rounded-r-lg border-0"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <FaCheck /> Copied
                </>
              ) : (
                <>
                  <FaCopy /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
