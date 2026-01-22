export interface CreateProfileRequest {
  first_name: string;
  last_name: string;
  nickname?: string;
  avatar_path?: string;
}

export interface CreateProfileResponse {
  account_id: string;
  profile_id: string;
}

export interface Profile {
  account_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  avatar_path?: string;
  state: string;
  created_at: string;
  updated_at: string;
}
