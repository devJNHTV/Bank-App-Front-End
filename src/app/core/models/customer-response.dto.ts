import { Gender } from './enums/gender.enum';
import { CustomerStatus } from './enums/customer-status.enum';
import { KycStatus } from './enums/kyc-status.enum';

export interface CustomerResponse {
  cifCode: string;
  fullName: string;
  address: string;
  email: string;
  identityNumber: string;
  dateOfBirth: string; // ISO 8601 format (yyyy-MM-dd)
  phoneNumber: string;
  status: CustomerStatus;
  kycStatus: KycStatus;
  gender: Gender;
}