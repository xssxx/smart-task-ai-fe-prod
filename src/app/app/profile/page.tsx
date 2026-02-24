"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getProfile, updateProfile, requestPresignedURL, UploadFileS3 } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/lib/enhanced-toast";
import { validateFile } from "@/utils/fileValidation";
import { uploadToSupabase } from "@/utils/uploadToSupabase";
import { useProfile } from "@/contexts/ProfileContext";
import axios from "axios";

export default function ProfilePage() {
  const t = useTranslations();
  const { refreshProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    avatarPath: "",
    accountId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

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
          accountId: profile.account_id || "",
        });
      } catch (err) {
        toast.error(t('common.error'), {
          description: t('profile.cannotLoadProfile'),
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(t('profile.invalidFile'), {
        description: validation.error,
      });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      const presignResponse = await requestPresignedURL({
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
      });

      const { presigned_url, key } = presignResponse.data.data;
      try {
        await uploadToSupabase(presigned_url, file, (progress) => {
          setUploadProgress(progress.percentage);
        });
      } catch (uploadError) {
        if (uploadError instanceof Error) {
          if (uploadError.message.includes('อินเทอร์เน็ต')) {
            throw new Error(t('profile.connectionError'));
          }
          throw uploadError;
        }
        throw new Error(t('profile.uploadFailed'));
      }
      try {
        const UploadResponse = await UploadFileS3({ key });
        return UploadResponse.data.data.url;
      } catch (completeError) {
        if (axios.isAxiosError(completeError)) {
          const errorMsg = completeError.response?.data?.error?.message || t('profile.confirmUploadFailed');
          throw new Error(errorMsg);
        }
        throw new Error(t('profile.confirmUploadFailed'));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(t('profile.pleaseLoginAgain'));
        }
        const errorMsg = error.response?.data?.error?.message || t('profile.uploadFailed');
        throw new Error(errorMsg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(t('profile.uploadFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      toast.error(t('profile.incompleteData'), {
        description: t('profile.firstNameAndLastNameRequired'),
      });
      return;
    }

    if (formData.firstName.length < 4 || formData.firstName.length > 50) {
      toast.error(t('profile.invalidData'), {
        description: t('profile.firstNameLength'),
      });
      return;
    }

    if (formData.lastName.length < 4 || formData.lastName.length > 50) {
      toast.error(t('profile.invalidData'), {
        description: t('profile.lastNameLength'),
      });
      return;
    }

    if (formData.nickname && formData.nickname.length > 20) {
      toast.error(t('profile.invalidData'), {
        description: t('profile.nicknameLength'),
      });
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = formData.avatarPath;

      if (selectedFile) {
        setIsUploading(true);
        setUploadProgress(0);

        try {
          avatarUrl = await handleAvatarUpload(selectedFile);
        } catch (uploadError) {
          setIsUploading(false);
          setIsLoading(false);
          toast.error(t('common.error'), {
            description: uploadError instanceof Error ? uploadError.message : t('profile.uploadFailed'),
          });
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        ...(formData.nickname && { nickname: formData.nickname }),
        ...(avatarUrl && { avatar_path: avatarUrl }),
      };

      await updateProfile(payload);

      // Refresh profile in context to update Navbar
      await refreshProfile();

      toast.success(t('profile.profileUpdatedSuccess'), {
        description: selectedFile
          ? t('profile.profileUpdatedWithImageSuccess')
          : t('profile.profileUpdatedSuccess'),
      });

      setFormData((prev) => ({ ...prev, avatarPath: avatarUrl }));

      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      setImageLoadError(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || t('profile.profileUpdateFailed');
        toast.error(t('common.error'), {
          description: errorMsg,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col items-center md:items-start">
              <Skeleton className="w-48 h-48 rounded-2xl" />
            </div>

            <div className="md:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-8">
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-2 lg:hidden">
          {t('profile.pageTitle')}
        </h1>

        <div className="mb-6">
          <p className="text-base text-muted-foreground">{t('profile.pageSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <div className="w-48 h-48 rounded-2xl overflow-hidden">
              <Avatar className="w-full h-full">
                {formData.avatarPath && !imageLoadError ? (
                  <AvatarImage
                    src={formData.avatarPath}
                    alt="Profile"
                    onError={() => setImageLoadError(true)}
                  />
                ) : null}
                <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 text-center md:text-left">
              <p className="text-lg font-semibold text-foreground">
                {formData.firstName} {formData.lastName}
              </p>
              {formData.accountId && (
                <p className="text-sm text-muted-foreground font-mono">{formData.accountId}</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  {t('profile.firstName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder={t('profile.firstName')}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-border outline-none focus:border-ring focus:bg-background transition-all duration-200 text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  {t('profile.lastName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder={t('profile.lastName')}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-border outline-none focus:border-ring focus:bg-background transition-all duration-200 text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  {t('profile.nickname')} <span className="text-muted-foreground">({t('common.optional')})</span>
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  placeholder={t('profile.nickname')}
                  className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-border outline-none focus:border-ring focus:bg-background transition-all duration-200 text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>

              {/* Avatar Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  {t('profile.avatar')} <span className="text-muted-foreground">({t('common.optional')})</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(file);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer px-6 h-12 bg-muted hover:bg-accent text-foreground rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    {t('profile.selectImage')}
                  </label>
                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title={t('profile.deleteImage')}
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 hover:text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">{t('profile.preview')}:</p>
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
                        title={t('profile.deleteImage')}
                      >
                        <svg
                          className="w-4 h-4 text-gray-700 hover:text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{t('profile.uploading')}</span>
                      <span className="text-sm font-medium text-foreground">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                      <span>{t('profile.saving')}</span>
                    </div>
                  ) : (
                    t('profile.saveChanges')
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
