export interface KycRequest {
  identityNumber: string;
  fullName: string;
  dateOfBirth: string; // ISO 8601 format (yyyy-MM-dd)
  gender: string;
}