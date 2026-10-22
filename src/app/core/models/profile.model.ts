export interface Profile {
  id: string;
  personId: string;
  userName: string;
  firstName: string;
  fatherName?: string;
  motherName?: string;
  lastName: string;
  address?: string;
  city?: string;
  country?: string;
  roles: string[];
  permissions: string[];
  photoUrl?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  fatherName?: string;
  motherName?: string;
  lastName: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ChangeOwnPasswordRequest {
  currentPassword: string;
  newPassword: string;
}