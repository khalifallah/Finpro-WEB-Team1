import React from "react";
import { FaUser, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

interface Props {
  formData: any;
  user: any;
  isLoading: boolean;
  showPassword: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  togglePasswordVisibility: (field: "current" | "new" | "confirm") => void;
}

const ProfileEditForm: React.FC<Props> = ({
  formData,
  user,
  isLoading,
  showPassword,
  handleChange,
  handleSubmit,
  togglePasswordVisibility,
}) => {
  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-5 md:p-8">
        <h2 className="card-title text-xl mb-6">Edit Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FaUser className="text-base-content/40" /> Full Name
                </span>
              </label>
              <input
                type="text"
                name="fullName"
                className="input input-bordered w-full"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FaEnvelope className="text-base-content/40" /> Email
                </span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formData.email !== user?.email && (
                <div className="mt-2 text-xs text-warning">
                  *Changing email requires re-verification
                </div>
              )}
            </div>
          </div>

          <div className="divider text-xs text-base-content/30 font-semibold uppercase">
            Change Password
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Helper component for password input could be created here, but keeping it inline for simplicity */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Current Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  className="input input-bordered w-full pr-10"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Required only if changing password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-base-content/50"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  className="input input-bordered w-full pr-10"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Min. 8 chars"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-base-content/50"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  className="input input-bordered w-full pr-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-base-content/50"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto md:px-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProfileEditForm;
