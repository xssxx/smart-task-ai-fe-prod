"use client";
import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Trash2, Crown, Loader2 } from "lucide-react";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { toast } from "@/lib/enhanced-toast";

interface ManageMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

const ManageMembersModal = ({
  open,
  onOpenChange,
  projectId,
  projectName,
}: ManageMembersModalProps) => {
  const t = useTranslations();
  const { members, loading, emailMap, fetchMembers, addMember, removeMember } =
    useProjectMembers(projectId);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"member" | "owner">(
    "member",
  );
  const [removingMember, setRemovingMember] = useState<{
    accountId: string;
    email: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, fetchMembers]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      return;
    }

    setAddingMember(true);
    const success = await addMember({
      email: newMemberEmail.trim(),
      role: newMemberRole,
    });

    if (success) {
      toast.success(t('members.memberAddedSuccess'), {
        description: `${newMemberEmail} ${t('members.added').toLowerCase()}`,
      });
      setNewMemberEmail("");
      setNewMemberRole("member");
    }
    setAddingMember(false);
  };

  const handleRemoveMemberClick = (accountId: string) => {
    const email = emailMap[accountId] || accountId;
    setRemovingMember({ accountId, email });
  };

  const handleConfirmRemove = async () => {
    if (!removingMember) return;

    setIsRemoving(true);
    const success = await removeMember(removingMember.accountId, "member");

    if (success) {
      toast.success(t('members.memberRemovedSuccess'), {
        description: `${removingMember.email}`,
      });
      setRemovingMember(null);
    } else {
      toast.error(t('members.memberRemoveFailed'));
    }
    setIsRemoving(false);
  };

  const getInitials = (accountId: string) => {
    const email = emailMap[accountId];
    if (email) return email.substring(0, 2).toUpperCase();
    return accountId.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl pr-6">
              {t('members.manageMembers')} - {projectName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {t('members.addNewMember')}
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-sm">{t('members.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('members.emailPlaceholder')}
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    disabled={addingMember}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-sm">{t('members.role')}</Label>
                  <Select
                    value={newMemberRole}
                    onValueChange={(value: "member" | "owner") =>
                      setNewMemberRole(value)
                    }
                    disabled={addingMember}
                  >
                    <SelectTrigger id="role" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">{t('members.member')}</SelectItem>
                      <SelectItem value="owner">{t('members.owner')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddMember}
                  disabled={addingMember || !newMemberEmail.trim()}
                  className="w-full text-sm"
                >
                  {addingMember ? t('members.adding') : t('members.addMember')}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t('members.currentMembers')} ({members.length})
              </h3>
              <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg"
                      >
                        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2 min-w-0">
                          <Skeleton className="h-4 w-24 sm:w-32" />
                          <Skeleton className="h-3 w-16 sm:w-24" />
                        </div>
                        <Skeleton className="h-8 w-16 sm:h-9 sm:w-20 shrink-0" />
                      </div>
                    ))}
                  </>
                ) : members.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
                    {t('members.noMembers')}
                  </p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.account_id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {getInitials(member.account_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {emailMap[member.account_id] ?? member.account_id}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {t('members.added')} {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Badge
                          variant={
                            member.role === "owner" ? "default" : "secondary"
                          }
                          className="flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
                        >
                          {member.role === "owner" && <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                          {t(`members.${member.role}`)}
                        </Badge>
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMemberClick(member.account_id)}
                            className="h-7 w-7 sm:h-9 sm:w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removingMember} onOpenChange={() => !isRemoving && setRemovingMember(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 text-base sm:text-lg">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('members.removeMember')}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t('common.cannotUndo')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                {t('members.confirmRemoveMember')}
              </p>
              <p className="text-sm sm:text-base font-semibold text-rose-800 dark:text-rose-300 mt-2 break-all">
                {removingMember?.email}
              </p>
              <p className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-500 mt-2">
                {t('members.confirmRemoveWarning')}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRemovingMember(null)}
              disabled={isRemoving}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('members.removing')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('members.removeMember')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageMembersModal;
