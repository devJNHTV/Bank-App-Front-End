import { Gender } from './enums/gender.enum';

export interface UpdateCustomerDTO {
  fullName: string;
  dateOfBirth: string; // ISO 8601 format (yyyy-MM-dd)
  address: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
}