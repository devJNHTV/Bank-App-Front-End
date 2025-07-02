export interface KycStatisticsResponse {
  totalKycRequests: number;
  successfulKyc: number;
  failedKyc: number;
  pendingKyc: number;
}