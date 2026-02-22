"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { UserPlus, Trash2, Crown } from "lucide-react";
import { useProjectMembers } from "@/hooks/useProjectMembers";

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
  const { members, loading, emailMap, fetchMembers, addMember, removeMember } =
    useProjectMembers(projectId);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"member" | "owner">(
    "member",
  );

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
      setNewMemberEmail("");
      setNewMemberRole("member");
    }
    setAddingMember(false);
  };

  const handleRemoveMember = async (accountId: string, role: string) => {
    await removeMember(accountId, role);
  };

  const getInitials = (accountId: string) => {
    const email = emailMap[accountId];
    if (email) return email.substring(0, 2).toUpperCase();
    return accountId.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Members - {projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Member Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add New Member
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  disabled={addingMember}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newMemberRole}
                  onValueChange={(value: "member" | "owner") =>
                    setNewMemberRole(value)
                  }
                  disabled={addingMember}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddMember}
                disabled={addingMember || !newMemberEmail.trim()}
                className="w-full"
              >
                {addingMember ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Current Members ({members.length})
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-9 w-20" />
                    </div>
                  ))}
                </>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No members yet
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.account_id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {getInitials(member.account_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {emailMap[member.account_id] ?? member.account_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        Added {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        member.role === "owner" ? "default" : "secondary"
                      }
                      className="flex items-center gap-1"
                    >
                      {member.role === "owner" && <Crown className="w-3 h-3" />}
                      {member.role}
                    </Badge>
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveMember(member.account_id, member.role)
                        }
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageMembersModal;
