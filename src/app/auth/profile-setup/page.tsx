"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createProfile } from "../../../services/api";
import { ROUTES } from "@/constants";
import axios from "axios";

export default function ProfileSetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        nickname: "",
        avatarPath: "",
    });

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        // Validation - required fields
        if (!formData.firstName || !formData.lastName) {
            setError("กรุณากรอกชื่อและนามสกุล");
            return;
        }

        if (formData.firstName.length < 4 || formData.firstName.length > 50) {
            setError("ชื่อต้องมีความยาว 4-50 ตัวอักษร");
            return;
        }

        if (formData.lastName.length < 4 || formData.lastName.length > 50) {
            setError("นามสกุลต้องมีความยาว 4-50 ตัวอักษร");
            return;
        }

        if (formData.nickname && formData.nickname.length > 20) {
            setError("ชื่อเล่นต้องมีความยาวไม่เกิน 20 ตัวอักษร");
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

            await createProfile(payload);

            // Success - redirect to home
            router.push(ROUTES.HOME);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errorCode = err.response?.data?.error?.code;
                if (errorCode === "PROFILE_ALREADY_EXISTS") {
                    // Profile already exists, redirect to home
                    router.push(ROUTES.HOME);
                    return;
                }
                setError(
                    err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-48 -right-48 w-96 h-96 bg-gray-200 rounded-full filter blur-[100px] opacity-30"></div>
                <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-gray-300 rounded-full filter blur-[100px] opacity-30"></div>
            </div>

            {/* Main Card */}
            <div className="relative bg-white rounded-2xl shadow-md w-full max-w-md p-8 border border-gray-200">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <Image
                            src="/logo.svg"
                            alt="Smart Task AI Logo"
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ตั้งค่าโปรไฟล์
                    </h1>
                    <p className="text-gray-600 text-lg">กรุณากรอกข้อมูลโปรไฟล์ของคุณ</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* First Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <svg
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                placeholder="ชื่อจริง"
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Last Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            นามสกุล <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <svg
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                placeholder="นามสกุล"
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Nickname Input (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อเล่น <span className="text-gray-400">(ไม่บังคับ)</span>
                        </label>
                        <div className="relative">
                            <svg
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={formData.nickname}
                                onChange={(e) => handleInputChange("nickname", e.target.value)}
                                placeholder="ชื่อเล่น"
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Avatar Path Input (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL รูปโปรไฟล์ <span className="text-gray-400">(ไม่บังคับ)</span>
                        </label>
                        <div className="relative">
                            <svg
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={formData.avatarPath}
                                onChange={(e) => handleInputChange("avatarPath", e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-gray-900 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
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
                            "บันทึกโปรไฟล์"
                        )}
                    </button>
                </form>

                {/* Info */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    <span className="text-red-500">*</span> หมายถึงช่องที่จำเป็นต้องกรอก
                </p>
            </div>
        </div>
    );
}
