"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HandymanDashboard from "@/components/HandymanDashboard"; // Import the new component
import api from "../../../../lib/axios";
import countryList from 'react-select-country-list';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  ShieldCheck,
  Loader2,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

// POBOLJŠAN CSS - Da PhoneInput izgleda 1:1 kao tvoji ostali inputi
const phoneInputCustomStyles = `
  .PhoneInput {
    width: 100%;
    background: white;
    border: 2px solid black;
    padding: 1rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
    box-sizing: border-box;
  }
  .PhoneInput:focus-within {
    background-color: #fefce8; /* yellow-50 */
  }
  .PhoneInputInput {
    border: none !important;
    outline: none !important;
    font-weight: bold;
    font-size: 0.875rem;
    background: transparent !important;
    width: 100%;
    color: black;
  }
  .PhoneInputCountry {
    display: flex;
    align-items: center;
    background: transparent;
    border-right: 1px solid #000;
    padding-right: 10px;
    margin-right: 4px;
  }
  .PhoneInputCountrySelectArrow {
    margin-left: 5px;
    opacity: 0.7;
  }
  .PhoneInputCountrySelect {
    background: transparent;
    color: #111827;
    border: none;
    outline: none;
    font-weight: 700;
  }
  .PhoneInputCountrySelect option {
    background: #ffffff;
    color: #111827;
    font-weight: 700;
  }
  .dark .PhoneInput {
    background: #09090b;
    border-color: #52525b;
  }
  .dark .PhoneInput:focus-within {
    background-color: #27272a;
  }
  
  .dark .PhoneInputInput {
    color: #f4f4f5;
    background: transparent !important;
  }
  .dark .PhoneInputCountry {
    background: transparent;
    border-right-color: #71717a;
  }
  .dark .PhoneInputCountrySelect {
    color: #f4f4f5;
    background: transparent;
  }
  .dark .PhoneInputCountrySelect option {
    background: #27272a;
    color: #f4f4f5;
  }
`;

type ProfileResponse = {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  username: string;
  avatar_url: string;
  has_custom_avatar: boolean;
  phone: string;
  county: string;
  city: string;
  zip_code: string;
  wallet_balance: number;
};

type ApiErrorResponse = {
  detail?: string;
  non_field_errors?: string[];
  current_password?: string[];
  new_password?: string[];
  confirm_password?: string[];
  avatar?: string[];
};

export default function ProfilePage() {
  const brandColor = "#EF9D39";
  const { t } = useLanguage();
  const profileTitleParts = t("profile.title").split(" ");

  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    avatarUrl: "",
    phone: "",
    county: "",
    city: "",
    zipCode: "",
    walletBalance: 0.00,
  });
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingNames, setSavingNames] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordChangedModalOpen, setPasswordChangedModalOpen] =
    useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: "names" | "password" | "avatar" | "removeAvatar" | null;
    title: string;
    message: string;
  }>({
    open: false,
    action: null,
    title: "",
    message: "",
  });

  const countries = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError(null);
        const response = await api.get<ProfileResponse>("/api/accounts/me/");
        const data = response.data;

        const newProfile = {
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          username: data.username || "",
          avatarUrl: data.avatar_url || "",
          phone: data.phone || "",
          county: data.county || "",
          city: data.city || "",
          zipCode: data.zip_code || "",
          walletBalance: data.wallet_balance || 0.00,
        };

        setFormData(newProfile);
        setHasCustomAvatar(Boolean(data.has_custom_avatar));
        setUserRole(data.role || "client");

        if (typeof window !== "undefined") {
          Object.entries(data).forEach(([key, value]) => {
            if (value) localStorage.setItem(key, value.toString());
          });
        }
      } catch (err: unknown) {
        // Fallback na localStorage ako API ne radi
        // Unutar catch bloka u useEffect
        // U catch bloku unutar useEffect
        if (typeof window !== "undefined") {
          setFormData({
            firstName: localStorage.getItem("first_name") || "",
            lastName: localStorage.getItem("last_name") || "",
            email: localStorage.getItem("email") || "",
            username: localStorage.getItem("username") || "",
            avatarUrl: localStorage.getItem("avatar_url") || "",
            // DODAJ OVA POLJA DA NESTANE CRVENILO:
            phone: localStorage.getItem("phone") || "",
            city: localStorage.getItem("city") || "",
            county: localStorage.getItem("county") || "",
            zipCode: localStorage.getItem("zip_code") || "",
            walletBalance: parseFloat(localStorage.getItem("wallet_balance") || "0") || 0.00,
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const getApiErrorMessage = (errorData?: ApiErrorResponse) => {
    if (!errorData) return t("profile.genericError");
    return (
      errorData.current_password?.[0] ||
      errorData.new_password?.[0] ||
      errorData.confirm_password?.[0] ||
      errorData.avatar?.[0] ||
      errorData.non_field_errors?.[0] ||
      errorData.detail ||
      t("profile.genericError")
    );
  };

  const persistNameChanges = async () => {
    try {
      setSavingNames(true);
      setProfileError(null);
      setProfileMessage(null);

      const response = await api.patch<ProfileResponse>("/api/accounts/me/", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        county: formData.county,
        city: formData.city,
        zip_code: formData.zipCode,
      });

      const updated = response.data;
      console.log('After upload, API returned:', {
        avatar_url: updated.avatar_url,
        has_custom_avatar: updated.has_custom_avatar,
      });

      // AŽURIRAJ SVA POLJA OVDJE:
      setFormData({
        firstName: updated.first_name || "",
        lastName: updated.last_name || "",
        email: updated.email || "",
        username: updated.username || "",
        avatarUrl: updated.avatar_url || "",
        phone: updated.phone || "",
        county: updated.county || "",
        city: updated.city || "",
        zipCode: updated.zip_code || "",
        walletBalance: updated.wallet_balance || 0.00,
      });

      setHasCustomAvatar(Boolean(updated.has_custom_avatar));
      setIsEditing(false); // Automatski izađi iz edit moda nakon spremanja

      // ... unutar persistNameChanges funkcije
      if (typeof window !== "undefined") {
        localStorage.setItem("first_name", updated.first_name || "");
        localStorage.setItem("last_name", updated.last_name || "");
        localStorage.setItem("username", updated.username || "");
        localStorage.setItem("email", updated.email || "");
        localStorage.setItem("avatar_url", updated.avatar_url || "");

        // DODAJ OVE LINIJE KOJE SU NEDOSTAJALE:
        localStorage.setItem("phone", updated.phone || "");
        localStorage.setItem("city", updated.city || "");
        localStorage.setItem("county", updated.county || "");
        localStorage.setItem("zip_code", updated.zip_code || "");

        window.dispatchEvent(new Event("profile-updated"));
      }

      setProfileMessage(t("profile.nameSavedSuccess"));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: ApiErrorResponse } };
      setProfileError(getApiErrorMessage(apiError.response?.data));
    } finally {
      setSavingNames(false);
    }
  };

  const persistAvatarChange = async () => {
    if (!pendingAvatarFile) return;

    try {
      setUploadingAvatar(true);
      setAvatarError(null);
      setAvatarMessage(null);

      const data = new FormData();
      data.append("avatar", pendingAvatarFile);

      const response = await api.patch<ProfileResponse>("/api/accounts/me/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = response.data;

      setFormData((prev) => ({
        ...prev,
        firstName: updated.first_name || prev.firstName,
        lastName: updated.last_name || prev.lastName,
        email: updated.email || prev.email,
        username: updated.username || prev.username,
        avatarUrl: updated.avatar_url || prev.avatarUrl,
        phone: updated.phone || prev.phone,
        county: updated.county || prev.county,
        city: updated.city || prev.city,
        zipCode: updated.zip_code || prev.zipCode,
      }));
      setHasCustomAvatar(Boolean(updated.has_custom_avatar));

      if (typeof window !== "undefined") {
        localStorage.setItem("avatar_url", updated.avatar_url || "");
        localStorage.setItem("username", updated.username || "");
        window.dispatchEvent(new Event("profile-updated"));
      }

      setAvatarMessage(t("profile.avatarUploadSuccess"));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: ApiErrorResponse } };
      setAvatarError(getApiErrorMessage(apiError.response?.data));
    } finally {
      setUploadingAvatar(false);
      setPendingAvatarFile(null);
    }
  };

  const handleOpenRemoveAvatarConfirm = () => {
    setAvatarError(null);
    setConfirmModal({
      open: true,
      action: "removeAvatar",
      title: t("profile.confirmRemoveAvatarTitle"),
      message: t("profile.confirmRemoveAvatarMessage"),
    });
  };

  const removeCustomAvatar = async () => {
    try {
      setUploadingAvatar(true);
      setAvatarError(null);
      setAvatarMessage(null);

      const response = await api.patch<ProfileResponse>("/api/accounts/me/", {
        avatar: null,
      });
      const updated = response.data;

      setFormData((prev) => ({
        ...prev,
        avatarUrl: updated.avatar_url || "",  // ✅ NE koristi prev.avatarUrl kao fallback!
        firstName: updated.first_name || prev.firstName,
        lastName: updated.last_name || prev.lastName,
        email: updated.email || prev.email,
        username: updated.username || prev.username,
        phone: updated.phone || prev.phone,
        county: updated.county || prev.county,
        city: updated.city || prev.city,
        zipCode: updated.zip_code || prev.zipCode,
      }));

      setHasCustomAvatar(false);  // ✅ Eksplicitno postavi na false

      if (typeof window !== "undefined") {
        localStorage.setItem("avatar_url", "");  // ✅ Obriši iz localStorage
        localStorage.setItem("username", updated.username || "");
        window.dispatchEvent(new Event("profile-updated"));
      }

      setAvatarMessage(t("profile.avatarRemoveSuccess"));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: ApiErrorResponse } };
      setAvatarError(getApiErrorMessage(apiError.response?.data));
    } finally {
      setUploadingAvatar(false);
      setPendingAvatarFile(null);
    }
  };

  const persistPasswordChanges = async () => {
    try {
      setSavingPassword(true);
      setPasswordError(null);

      await api.post("/api/accounts/change-password/", {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordChangedModalOpen(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: ApiErrorResponse } };
      setPasswordError(getApiErrorMessage(apiError.response?.data));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleGoToLoginAfterPasswordChange = async () => {
    try {
      await api.post("/api/accounts/logout/");
    } catch {
      // Continue with client-side logout even if backend logout fails.
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("user_role");
        localStorage.removeItem("role");
        localStorage.removeItem("first_name");
        localStorage.removeItem("last_name");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("avatar_url");
      }
      window.location.href = "/login";
    }
  };

  const handleOpenNamesConfirm = () => {
    setConfirmModal({
      open: true,
      action: "names",
      title: t("profile.confirmNamesTitle"),
      message: t("profile.confirmNamesMessage"),
    });
  };

  const handleOpenPasswordConfirm = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t("profile.passwordMismatch"));
      return;
    }

    setConfirmModal({
      open: true,
      action: "password",
      title: t("profile.confirmPasswordTitle"),
      message: t("profile.confirmPasswordMessage"),
    });
  };

  const handleAvatarFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setAvatarError(t("profile.avatarInvalidType"));
      return;
    }

    setPendingAvatarFile(selectedFile);
    setAvatarError(null);
    setConfirmModal({
      open: true,
      action: "avatar",
      title: t("profile.confirmAvatarTitle"),
      message: t("profile.confirmAvatarMessage"),
    });

    event.target.value = "";
  };

  const handleConfirmAction = async () => {
    if (confirmModal.action === "names") {
      await persistNameChanges();
    }
    if (confirmModal.action === "password") {
      await persistPasswordChanges();
    }
    if (confirmModal.action === "avatar") {
      await persistAvatarChange();
    }
    if (confirmModal.action === "removeAvatar") {
      await removeCustomAvatar();
    }

    setConfirmModal({
      open: false,
      action: null,
      title: "",
      message: "",
    });
  };

  const handleCloseConfirmModal = () => {
    if (confirmModal.action === "avatar") {
      setPendingAvatarFile(null);
    }
    setConfirmModal({
      open: false,
      action: null,
      title: "",
      message: "",
    });
  };

  const SUPABASE_STORAGE_URL = 'https://itqhsfuxuhrnbfrcwbbt.supabase.co/storage/v1/object/public';

  const avatarUrl = useMemo(() => {
    console.log('avatarUrl raw value:', formData.avatarUrl);

    if (formData.avatarUrl) {
      if (formData.avatarUrl.startsWith('http')) return formData.avatarUrl;

      // Strip leading slashes from the stored path
      const filePath = formData.avatarUrl.replace(/^\/+/, '');

      // If the path already includes 'avatars/', don't add it again
      if (filePath.startsWith('avatars/')) {
        return `${SUPABASE_STORAGE_URL}/${filePath}`;
      }

      // Otherwise, assume it's just the filename
      return `${SUPABASE_STORAGE_URL}/avatars/${filePath}`;
    }


    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.username || "User")}`;
  }, [formData.avatarUrl, formData.username]);
  return (
    <div className="page-gradient flex flex-col min-h-screen text-black dark:text-white selection:bg-black selection:text-white font-sans">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        {/* HEADER / AVATAR SECTION */}
        <div
          className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-8 mb-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(239,157,57,0.2)] flex flex-col md:flex-row items-center gap-8"
          style={{ borderRadius: "30px" }}
        >
          <div className="relative group">
            <div className="w-32 h-32 bg-black border-[3px] border-black rounded-[24px] overflow-hidden shadow-[5px_5px_0px_0px_rgba(239,157,57,1)]">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 bg-[#EF9D39] border-2 border-black p-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-70"
            >
              <Camera size={18} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelected}
              className="hidden"
            />
            {hasCustomAvatar && (
              <button
                onClick={handleOpenRemoveAvatarConfirm}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 left-0 bg-red-500 text-white border-2 border-black px-2 py-1 rounded-lg text-[9px] font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-70"
              >
                {t("profile.removePhoto")}
              </button>
            )}
          </div>

          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
              {profileTitleParts[0]}{" "}
              <span style={{ color: brandColor }}>
                {profileTitleParts.slice(1).join(" ")}
              </span>
            </h1>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">
              {t("profile.subtitle")}
            </p>
            {avatarError && (
              <p className="mt-3 text-[10px] font-black uppercase text-red-500">
                {avatarError}
              </p>
            )}
            {avatarMessage && (
              <p className="mt-3 text-[10px] font-black uppercase text-green-600 dark:text-green-400">
                {avatarMessage}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT COLUMN: INFO & DASHBOARD */}
          <div className="md:col-span-2 space-y-8">
            {/* Basic Info Box */}
            <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(239,157,57,0.2)] rounded-[24px]">
              <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                <User size={20} style={{ color: brandColor }} strokeWidth={3} />
                {t("profile.basicInfo")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t("profile.firstName")}
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing || loadingProfile || savingNames} // DODATO !isEditing
                    className={`w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 outline-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-zinc-950' : 'focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`} />
                </div>
                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t("profile.lastName")}
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing || loadingProfile || savingNames}
                    className={`w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 outline-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-zinc-950' : 'focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  />
                </div>
                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t("profile.phone") !== "profile.phone" ? t("profile.phone") : "Phone Number"}
                  </label>
                  <style>{phoneInputCustomStyles}</style>
                  <PhoneInput
                    international
                    placeholder={t("profile.placeholders.phone")}
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value || "" }))}
                    disabled={!isEditing || loadingProfile || savingNames}
                    className={`w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 outline-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-zinc-950' : 'focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`} />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t("profile.city") || "City"}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing || loadingProfile || savingNames}
                    className={`w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 outline-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-zinc-950' : 'focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  />
                </div>

                {/* County / Region */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t("profile.county") || "County / Region"}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.county}
                      onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                      disabled={!isEditing || loadingProfile || savingNames}
                      className={`w-full bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold text-gray-900 dark:text-white outline-none appearance-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-zinc-950' : 'focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                    >
                      <option value="" disabled>
                        {t("register.select") || "Select country"}
                      </option>
                      {countries.map((c) => (
                        <option key={c.value} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" /></svg>
                    </div>
                  </div>
                </div>

                {/* Zip Code */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t("profile.zipCode") || "Zip Code"}
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    disabled={!isEditing || loadingProfile || savingNames}
                    className={`w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 outline-none transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-zinc-950' : 'focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  />
                </div>
              </div>

              {profileError && (
                <p className="mt-6 text-xs font-bold uppercase text-red-500">
                  {profileError}
                </p>
              )}
              {profileMessage && (
                <p className="mt-6 text-xs font-bold uppercase text-green-600 dark:text-green-400">
                  {profileMessage}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-8">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3 border-[3px] border-black rounded-[20px] bg-[#EF9D39] text-black font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleOpenNamesConfirm}
                      disabled={loadingProfile || savingNames}
                      className="px-8 py-3 border-[3px] border-black rounded-[20px] bg-green-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                    >
                      {savingNames ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {t("profile.saveChanges")}
                    </button>

                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-3 border-[3px] border-black rounded-[20px] bg-white text-black font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* --- THE DYNAMIC DASHBOARD --- */}
            {userRole === "handyman" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <HandymanDashboard />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SECURITY & STATUS */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(239,157,57,0.2)] rounded-[24px]">

              {/* --- WALLET BALANCE BOX --- */}
              <div className="mb-6 bg-white dark:bg-zinc-900 border-[3px] border-[#EF9D39] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#EF9D39]">
                <p className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                  Your Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-black dark:text-[#EF9D39]">
                    {Number(formData.walletBalance).toFixed(2)}
                  </span>
                  <span className="text-sm font-black text-black dark:text-[#EF9D39] uppercase">KM</span>
                </div>
              </div>

              {/* --- SECURITY & STATUS HEADER --- */}
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck size={18} className="text-[#EF9D39]" strokeWidth={3} />
                <h2 className="text-sm font-black uppercase">
                  {t("profile.securityStatus")}
                </h2>
              </div>

              <div className="space-y-5">
                {/* --- EMAIL ADDRESS BOX --- */}
                <div className="bg-zinc-100 dark:bg-zinc-900 border-[3px] border-zinc-300 dark:border-zinc-700 p-4 rounded-2xl">
                  <p className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest mb-3">
                    Email Address
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Mail size={16} className="text-[#EF9D39] flex-shrink-0" strokeWidth={2.5} />
                      <p className="text-xs font-bold text-black dark:text-white truncate">{formData.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 flex-shrink-0">
                      <Lock size={14} strokeWidth={2.5} />
                      <span className="text-[9px] font-black uppercase whitespace-nowrap">
                        Locked
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- CHANGE PASSWORD SECTION --- */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">
                    Change Password
                  </p>

                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Current password"
                    disabled={savingPassword || loadingProfile}
                    className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white border-[3px] border-black dark:border-zinc-700 p-3.5 rounded-2xl font-bold text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(239,157,57,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />

                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="New password"
                    disabled={savingPassword || loadingProfile}
                    className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white border-[3px] border-black dark:border-zinc-700 p-3.5 rounded-2xl font-bold text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(239,157,57,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />

                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    disabled={savingPassword || loadingProfile}
                    className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white border-[3px] border-black dark:border-zinc-700 p-3.5 rounded-2xl font-bold text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(239,157,57,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />

                  {passwordError && (
                    <p className="text-[10px] font-bold uppercase text-red-500 pt-1">
                      {passwordError}
                    </p>
                  )}

                  {/* --- SAVE PASSWORD BUTTON --- */}
                  <button
                    onClick={handleOpenPasswordConfirm}
                    disabled={savingPassword || loadingProfile}
                    className="w-full border-[3px] border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white p-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_rgba(239,157,57,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] dark:hover:bg-[#EF9D39] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_#000] dark:disabled:hover:shadow-[6px_6px_0px_0px_rgba(239,157,57,0.3)] disabled:hover:bg-white dark:disabled:hover:bg-zinc-900"
                  >
                    {savingPassword ? (
                      <Loader2 size={16} className="animate-spin" strokeWidth={3} />
                    ) : (
                      <Lock size={16} strokeWidth={3} />
                    )}
                    Save Password
                  </button>
                </div>
              </div>

              {/* --- ACCOUNT STATUS --- */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-zinc-800">
                <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                  Account Status
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full animate-pulse ${userRole === "handyman" ? "bg-green-500" : "bg-blue-500"
                      }`}
                  ></div>
                  <span className="text-[10px] font-black uppercase text-black dark:text-white">
                    {userRole === "handyman"
                      ? t("profile.verifiedHandyman")
                      : t("profile.verifiedClient")}
                  </span>
                </div>
              </div>
            </div>

            {/* --- DANGER ZONE --- */}
            <div className="bg-white dark:bg-zinc-900 border-[3px] border-red-500 dark:border-red-500 p-6 shadow-[8px_8px_0px_0px_rgba(239,68,68,0.25)] rounded-[24px] border-dashed">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">
                Danger Zone
              </p>
              <button className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 underline underline-offset-4 decoration-2 transition-colors">
                Delete Account Forever
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-6 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(239,157,57,0.35)]">
            <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">
              {confirmModal.title}
            </h3>
            <p className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-6">
              {confirmModal.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCloseConfirmModal}
                className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-zinc-500 rounded-xl py-3 text-xs font-black uppercase"
              >
                {t("profile.cancel")}
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 bg-white text-black border-[3px] border-black rounded-[20px] py-3 text-xs font-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] transition-all"
              >
                {t("profile.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordChangedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-6 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(239,157,57,0.35)]">
            <h3 className="text-xl font-black uppercase text-black dark:text-white mb-3">
              {t("profile.passwordChangedTitle")}
            </h3>
            <p className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-6">
              {t("profile.passwordChangedDescription")}
            </p>
            <button
              onClick={handleGoToLoginAfterPasswordChange}
              className="w-full bg-white text-black border-[3px] border-black rounded-[20px] py-3 text-xs font-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] transition-all"
            >
              {t("profile.goToLogin")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
