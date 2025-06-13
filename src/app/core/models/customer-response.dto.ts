import { Gender } from './enums/gender.enum';
import { CustomerStatus } from './enums/customer-status.enum';
import { KycStatus } from './enums/kyc-status.enum';

export interface CustomerResponse {
  cifCode: string;
  fullName: string;
  address: string;
  email: string;
  identityNumber: string;
  dateOfBirth: Date | null;
  phoneNumber: string;
  status: CustomerStatus;
  kycStatus: KycStatus;
  gender: Gender;
}