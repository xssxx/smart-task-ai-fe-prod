export interface Invitation {
  project_id: string;
  project_name: string;
  inviter_account_id: string;
  inviter_name: string;
  invitee_account_id: string;
  invitee_short_id: string;
  invitee_name: string;
  role: 'member' | 'admin' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
  responded_at?: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateInvitationRequest {
  invitee_short_id: string;
  role: string;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
}
