"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, ChevronDown } from "lucide-react";
import { createProject, CreateProjectRequest } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/enhanced-toast";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectModalProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    context: "",
    domain_knowledge: "",
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError(t('project.pleaseEnterWorkspaceName'));
      return;
    }

    setIsLoading(true);

    try {
      const payload: CreateProjectRequest = {
        name: formData.name.trim(),
      };

      if (formData.nickname || formData.context || formData.domain_knowledge) {
        payload.config = {};
        if (formData.nickname) payload.config.nickname = formData.nickname;
        if (formData.context) payload.config.context = formData.context;
        if (formData.domain_knowledge) payload.config.domain_knowledge = formData.domain_knowledge;
      }

      await createProject(payload);

      setFormData({
        name: "",
        nickname: "",
        context: "",
        domain_knowledge: "",
      });
      setShowAdvanced(false);

      toast.success(t('project.workspaceCreatedSuccess'), {
        description: (
          <>
            {t('project.workspaceCreatedDescription').replace('{name}', '')} <strong>{formData.name.trim()}</strong>
          </>
        ),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(t('project.workspaceCreateFailedDescription'));
      toast.error(t('project.workspaceCreateFailed'), {
        description: t('project.workspaceCreateFailedDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: "",
        nickname: "",
        context: "",
        domain_knowledge: "",
      });
      setError(null);
      setShowAdvanced(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('project.createNewWorkspace')}</DialogTitle>
          <DialogDescription>
            {t('project.createWorkspaceDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="name">
              {t('project.workspaceName')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t('project.workspaceNamePlaceholder')}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    showAdvanced && "rotate-180"
                  )}
                />
                {t('project.aiAssistantSettings')}
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
                <div className="space-y-2">
                  <Label htmlFor="nickname">{t('project.aiNickname')}</Label>
                  <Input
                    id="nickname"
                    placeholder={t('project.aiNicknamePlaceholder')}
                    value={formData.nickname}
                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    {t('project.aiNicknameDescription')}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="context">{t('project.context')}</Label>
                  <Textarea
                    id="context"
                    placeholder={t('project.contextPlaceholder')}
                    value={formData.context}
                    onChange={(e) => handleInputChange("context", e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {t('project.contextDescription')}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="domain_knowledge">{t('project.domainKnowledge')}</Label>
                  <Textarea
                    id="domain_knowledge"
                    placeholder={t('project.domainKnowledgePlaceholder')}
                    value={formData.domain_knowledge}
                    onChange={(e) => handleInputChange("domain_knowledge", e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {t('project.domainKnowledgeDescription')}
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('common.creating')}
                </>
              ) : (
                t('project.createWorkspace')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
