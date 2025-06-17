import { CustomerStatus } from './enums/customer-status.enum';

export interface UpdateStatusRequest {
  id: number;
  status: CustomerStatus;
}