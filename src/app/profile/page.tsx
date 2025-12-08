"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import AddressList from "@/components/AddressList";
import { UserAddress } from "@/types/address";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    console.log("Addresses state:", addresses);
    console.log("Addresses type:", typeof addresses);
  }, [addresses]);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      setAddressError("");
      const response = await axiosInstance.get("/auth/profile/addresses");
      console.log("API Response:", response.data);
      console.log("Data structure:", response.data.data);
      const addressesArray = response.data.data || [];
      if (Array.isArray(addressesArray)) {
        setAddresses(addressesArray);
      } else {
        console.error("Unexpected response format:", response.data);
        setAddresses([]);
        setAddressError("Invalid address data format");
      }
    } catch (err: any) {
      console.error("Error fetching addresses:", err);
      setAddressError(
        err.response?.data?.message || "Failed to load addresses"
      );
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
      setFormData({
        fullName: user.fullName,
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPreviewUrl(user.photoUrl || null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPG, PNG, and GIF are allowed.");
        return;
      }
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        setError("File size must be less than 1MB.");
        return;
      }

      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }
      if (formData.newPassword.length < 8) {
        setError("New password must be at least 8 characters");
        return;
      }
      if (!formData.currentPassword) {
        setError("Current password is required to change password");
        return;
      }
    }
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      // Only append email if it's changed
      if (formData.email !== user?.email) {
        formDataToSend.append("email", formData.email);
      }
      if (formData.currentPassword) {
        formDataToSend.append("currentPassword", formData.currentPassword);
      }
      if (formData.newPassword) {
        formDataToSend.append("newPassword", formData.newPassword);
      }
      if (photo) {
        formDataToSend.append("photo", photo);
      }
      const response = await axiosInstance.patch(
        "/auth/profile",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(response.data.data.profile);
      setMessage("Profile updated successfully");

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear photo
      setPhoto(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await axiosInstance.post("/auth/profile/request-verification");
      setMessage("Verification email sent successfully");
      // Force refresh user data from backend
      const response = await axiosInstance.get("/auth/me");
      const updatedUser = response.data.data.user;
      // Update the auth context
      setUser(updatedUser);
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          emailVerifiedAt: updatedUser.emailVerifiedAt,
        })
      );
    } catch (err: any) {
      // If error is "Email is already verified", update the UI anyway
      if (err.response?.data?.message?.includes("already verified")) {
        setMessage("Email is already verified. Updating your status...");
        // Force update the user as verified
        if (user) {
          const updatedUser = {
            ...user,
            emailVerifiedAt: new Date().toISOString(),
          };
          setUser(updatedUser);
          // Update localStorage
          localStorage.setItem("user", JSON.stringify(updatedUser));
          // Refresh the page to show updated status
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        setError(
          err.response?.data?.message || "Failed to send verification email"
        );
      }
    }
  };

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <AuthGuard requireAuth requireVerification={false}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {!user?.emailVerifiedAt && (
          <div className="alert alert-warning mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
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
            <div>
              <h3 className="font-bold">Email not verified!</h3>
              <div className="text-xs">
                Please verify your email to access all features including
                ordering.
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
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
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
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
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Profile Photo</h2>
                <div className="flex flex-col items-center">
                  <div className="avatar mb-4">
                    <div className="w-48 h-48 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : user?.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-base-300 flex items-center justify-center h-full text-6xl">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    className="file-input file-input-bordered w-full"
                    onChange={handlePhotoChange}
                  />

                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Allowed: JPG, PNG, GIF
                    <br />
                    Max size: 1MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Profile Information</h2>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        className="input input-bordered"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="input input-bordered"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {formData.email !== user?.email && (
                        <label className="label">
                          <span className="label-text-alt text-warning">
                            Changing email requires re-verification
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="divider mt-8">Change Password (Optional)</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Current Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          name="currentPassword"
                          className="input input-bordered w-full pr-12"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Required for password change"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility("current")}
                          aria-label={
                            showPassword.current
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword.current ? (
                            <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                          ) : (
                            <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">New Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          name="newPassword"
                          className="input input-bordered w-full pr-12"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility("new")}
                          aria-label={
                            showPassword.new ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword.new ? (
                            <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                          ) : (
                            <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text">Confirm New Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirmPassword"
                          className="input input-bordered w-full pr-12"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility("confirm")}
                          aria-label={
                            showPassword.confirm
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword.confirm ? (
                            <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                          ) : (
                            <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-control mt-8">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Account Information */}
            <div className="card bg-base-100 shadow-xl mt-6">
              <div className="card-body">
                <h2 className="card-title">Account Information</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account Status:</span>
                    <span
                      className={`badge ${
                        user?.emailVerifiedAt
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {user?.emailVerifiedAt ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Member Since:</span>
                    <span>
                      {user &&
                        new Date(
                          user.createdAt || Date.now()
                        ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Last Updated:</span>
                    <span>
                      {user &&
                        new Date(
                          user.updatedAt || Date.now()
                        ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account Type:</span>
                    <span className="badge badge-outline">
                      {user?.role || "User"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">Shipping Addresses</h2>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={fetchAddresses}
                    disabled={addressLoading}
                  >
                    {addressLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Refresh"
                    )}
                  </button>
                </div>

                {addressError && (
                  <div className="alert alert-error mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
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
                    <span>{addressError}</span>
                  </div>
                )}

                {addressLoading ? (
                  <div className="text-center py-8">
                    <span className="loading loading-spinner"></span>
                    <p className="mt-2">Loading addresses...</p>
                  </div>
                ) : (
                  <AddressList
                    addresses={addresses}
                    onAddressUpdate={fetchAddresses}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
