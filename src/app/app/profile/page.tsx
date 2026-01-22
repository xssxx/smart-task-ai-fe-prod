"use client";
import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    avatarPath: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response.data.data;
        setFormData({
          firstName: profile.first_name,
          lastName: profile.last_name,
          nickname: profile.nickname || "",
          avatarPath: profile.avatar_path || "",
        });
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.firstName || !formData.lastName) {
      setError("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    if (formData.firstName.length < 4 || formData.firstName.length > 50) {
      setError("ชื่อต้องมี 4-50 ตัวอักษร");
      return;
    }

    if (formData.lastName.length < 4 || formData.lastName.length > 50) {
      setError("นามสกุลต้องมี 4-50 ตัวอักษร");
      return;
    }

    if (formData.nickname && formData.nickname.length > 20) {
      setError("ชื่อเล่นต้องไม่เกิน 20 ตัวอักษร");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        ...(formData.nickname && { nickname: formData.nickname }),
        ...(formData.avatarPath && { avatar_path: formData.avatarPath }),
      };

      await updateProfile(payload);
      setSuccess("อัพเดทโปรไฟล์สำเร็จ");
      
      // Refresh after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "An error occurred. Please try again"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Picture Skeleton - Mobile: top, Desktop: left */}
            <div className="md:col-span-1 flex flex-col items-center md:items-start">
              <Skeleton className="w-48 h-48 rounded-2xl" />
            </div>

            {/* Form Skeleton */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-6">
                {/* First Name Field */}
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                {/* Last Name Field */}
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                {/* Nickname Field */}
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                {/* Avatar Path Field */}
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                  <Skeleton className="flex-1 h-12 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    return (formData.firstName[0] + formData.lastName[0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
          <p className="text-gray-600 mt-2">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Picture Section - Mobile: top, Desktop: left */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <div className="w-48 h-48 rounded-2xl overflow-hidden">
              <Avatar className="w-full h-full">
                {formData.avatarPath && (
                  <AvatarImage src={formData.avatarPath} alt="Profile" />
                )}
                <AvatarFallback className="text-4xl font-bold bg-gray-900 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 text-center md:text-left">
              <p className="text-lg font-semibold text-gray-900">
                {formData.firstName} {formData.lastName}
              </p>
              {formData.nickname && (
                <p className="text-sm text-gray-600">@{formData.nickname}</p>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="ชื่อ"
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="นามสกุล"
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                />
              </div>

              {/* Nickname */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อเล่น <span className="text-gray-400">(ไม่บังคับ)</span>
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  placeholder="ชื่อเล่น"
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                />
              </div>

              {/* Avatar Path */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Avatar URL <span className="text-gray-400">(ไม่บังคับ)</span>
                </label>
                <input
                  type="text"
                  value={formData.avatarPath}
                  onChange={(e) => handleInputChange("avatarPath", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>กำลังบันทึก...</span>
                    </div>
                  ) : (
                    "บันทึกการเปลี่ยนแปลง"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
