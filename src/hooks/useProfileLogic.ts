// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/libs/axios/axios.config";
import { UserAddress } from "@/types/address";

export const useProfile = () => {
  const { user, setUser } = useAuth();

  // --- Form State ---
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- UI & Feedback State ---
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // --- Address State ---
  // (Kita pindahkan address state ke sini agar bisa diakses page jika perlu,
  // atau bisa juga dipindah total ke component AddressManager)
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");

  // --- Inisialisasi Data User ---
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setPreviewUrl(user.photoUrl || null);
      fetchAddresses(); // Auto fetch address saat load
    }
  }, [user]);

  // --- Actions ---
  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      setAddressError("");
      const response = await axiosInstance.get("/auth/profile/addresses");
      const addressesArray = response.data.data || [];
      setAddresses(Array.isArray(addressesArray) ? addressesArray : []);
    } catch (err: any) {
      setAddressError(
        err.response?.data?.message || "Failed to load addresses"
      );
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        setError("File size must be less than 1MB.");
        return;
      }
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleResendVerification = async () => {
    try {
      await axiosInstance.post("/auth/profile/request-verification");
      setMessage("Verification email sent successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Simple Validation
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword)
        return setError("New passwords do not match");
      if (formData.newPassword.length < 8)
        return setError("Min 8 characters for password");
      if (!formData.currentPassword)
        return setError("Current password required");
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      if (formData.email !== user?.email) data.append("email", formData.email);
      if (formData.currentPassword)
        data.append("currentPassword", formData.currentPassword);
      if (formData.newPassword)
        data.append("newPassword", formData.newPassword);
      if (photo) data.append("photo", photo);

      const response = await axiosInstance.patch("/auth/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProfile = response.data.data.profile;
      setUser(updatedProfile);
      localStorage.setItem("user", JSON.stringify(updatedProfile));
      setMessage("Profile updated successfully");

      // Reset sensitive fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setPhoto(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    formData,
    photo,
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
  };
};
