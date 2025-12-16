import React from "react";
import { FaShieldAlt } from "react-icons/fa";

const AccountStatusCard = ({ user }: { user: any }) => {
  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-primary" /> Account Info
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-base-200 pb-2">
            <span className="text-base-content/70">Status</span>
            <span
              className={`badge badge-sm ${
                user?.emailVerifiedAt
                  ? "badge-success text-white"
                  : "badge-warning"
              }`}
            >
              {user?.emailVerifiedAt ? "Verified" : "Unverified"}
            </span>
          </div>
          <div className="flex justify-between border-b border-base-200 pb-2">
            <span className="text-base-content/70">Type</span>
            <span className="font-medium">{user?.role || "User"}</span>
          </div>
          <div className="flex justify-between border-b border-base-200 pb-2">
            <span className="text-base-content/70">Member Since</span>
            <span className="font-medium">
              {user &&
                new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccountStatusCard;
