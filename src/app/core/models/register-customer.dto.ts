import { Gender } from './enums/gender.enum';

export interface RegisterCustomerDTO {
  username: string;
  fullName: string;
  address: string;
  identityNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  dateOfBirth: string;
  gender: Gender;
}