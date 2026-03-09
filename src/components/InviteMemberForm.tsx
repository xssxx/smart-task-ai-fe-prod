"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { useInvitationActions } from "@/hooks/useInvitationActions";

interface InviteMemberFormProps {
  projectId: string;
  onSuccess: () => void;
}

const InviteMemberForm = ({ projectId, onSuccess }: InviteMemberFormProps) => {
  const t = useTranslations();
  const { createInvitation, loading } = useInvitationActions();
  const [shortId, setShortId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateShortId = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError(t('invitations.shortIdRequired'));
      return false;
    }
    if (!value.startsWith("acc_")) {
      setValidationError(t('invitations.shortIdInvalid'));
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateShortId(shortId)) {
      return;
    }

    const result = await createInvitation(projectId, {
      invitee_short_id: shortId.trim(),
      role: "member",
    });

    if (result) {
      setShortId("");
      setValidationError(null);
      onSuccess();
    }
  };

  const handleShortIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setShortId(value);
    if (validationError) {
      validateShortId(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        {t('invitations.inviteMember')}
      </h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="shortId" className="text-sm">
            {t('invitations.accountShortId')}
          </Label>
          <Input
            id="shortId"
            type="text"
            placeholder="acc_xxx"
            value={shortId}
            onChange={handleShortIdChange}
            disabled={loading}
            className={`text-sm ${validationError ? 'invitation-danger-border' : ''}`}
          />
          {validationError && (
            <p className="text-xs invitation-danger-text mt-1">{validationError}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading || !shortId.trim()}
          className="w-full text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('invitations.sending')}
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              {t('invitations.sendInvitation')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default InviteMemberForm;
