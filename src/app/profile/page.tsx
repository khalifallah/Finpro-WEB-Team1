"use client";

import AuthGuard from "@/components/AuthGuard";
import ReferralCard from "@/components/ReferralCard";
import VoucherCard from "@/components/VoucherCard";

// Import Custom Hook
import { useProfile } from "@/hooks/useProfileLogic";

// Import New Feature Components
import ProfilePhotoCard from "@/components/features/profile/ProfilePhotoCard";
import AccountStatusCard from "@/components/features/profile/AccountStatusCard";
import ProfileEditForm from "@/components/features/profile/ProfileEditForm";
import AddressManager from "@/components/features/profile/AddressManager";

export default function ProfilePage() {
  // Panggil semua logika dari satu baris ini
  const {
    user,
    formData,
    previewUrl,
    error,
    message,
    isLoading,
    showPassword,
    addresses,
    addressLoading,
    addressError,
    handleChange,
    handlePhotoChange,
    handleSubmit,
    handleResendVerification,
    togglePasswordVisibility,
    fetchAddresses,
  } = useProfile();

  return (
    <AuthGuard requireAuth requireVerification={false}>
      <div className="min-h-screen bg-base-200/50 pb-10">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-base-content">
              My Profile
            </h1>
            <p className="text-sm text-base-content/60">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Verification Alert */}
          {!user?.emailVerifiedAt && (
            <div className="alert alert-warning mb-6 shadow-sm">
              <div className="flex-1">
                <h3 className="font-bold text-sm">Email not verified!</h3>
                <div className="text-xs">
                  Please verify your email to access all features.
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline bg-base-100"
                onClick={handleResendVerification}
              >
                Resend Email
              </button>
            </div>
          )}

          {/* Global Notifications */}
          {error && (
            <div className="alert alert-error mb-6 shadow-sm animate-fade-in-up">
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="alert alert-success mb-6 shadow-sm animate-fade-in-up">
              <span>{message}</span>
            </div>
          )}

          {/* Layout Grid */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* --- LEFT SIDEBAR --- */}
            <aside className="w-full lg:w-1/3 xl:w-1/4 space-y-6">
              <ProfilePhotoCard
                user={user}
                previewUrl={previewUrl}
                onPhotoChange={handlePhotoChange}
              />
              <AccountStatusCard user={user} />
            </aside>

            {/* --- RIGHT CONTENT --- */}
            <main className="w-full lg:w-2/3 xl:w-3/4 space-y-6">
              {/* Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="h-full">
                  <ReferralCard />
                </div>
                <div className="h-full">
                  <VoucherCard />
                </div>
              </div>

              {/* Edit Details Form */}
              <ProfileEditForm
                user={user}
                formData={formData}
                isLoading={isLoading}
                showPassword={showPassword}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                togglePasswordVisibility={togglePasswordVisibility}
              />

              {/* Address Manager */}
              <AddressManager
                addresses={addresses}
                loading={addressLoading}
                error={addressError}
                onRefresh={fetchAddresses}
              />
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
