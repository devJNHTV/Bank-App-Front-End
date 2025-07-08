import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiEndpointsService {
  private apiUrl = environment.apiUrl;
  private keycloakUrl = environment.keycloak.url;

  getRegisterInitiateEndpoint(): string {
    return `${this.apiUrl}/register/initiate`;
  }

  getKycAndOtpEndpoint(): string {
    return `${this.apiUrl}/register/kyc-and-otp`;
  }

  reSentOtpEndpoint(): string {
    return `${this.apiUrl}/register/send-otp`;
  }

  getConfirmRegisterEndpoint(): string {
    return `${this.apiUrl}/register/confirm`;
  }

  getKycStatusEndpoint(): string {
    return `${this.apiUrl}/status`;
  }

  getKycVerifyEndpoint(): string {
    return `${this.apiUrl}/kyc/verify`;
  }

  getCustomerListEndpoint(page: number, size: number, keyword: string): string {
    return `${this.apiUrl}/list?page=${page}&size=${size}&keyword=${keyword}`;
  }

  getCustomerDetailEndpoint(): string {
    return `${this.apiUrl}/detail`;
  }

  getCustomerDetailByCifCodeEndpoint(cifCode: string): string {
    return `${this.apiUrl}/detail/${cifCode}`;
  }

  getCustomerUpdateEndpoint(): string {
    return `${this.apiUrl}/update`;
  }

  getCustomerStatusEndpoint(): string {
    return `${this.apiUrl}/status`;
  }

  getCustomerAccountsEndpoint(): string {
    return `${this.apiUrl}/accounts`;
  }

  getForgotPasswordEndpoint(): string {
    return `${this.apiUrl}/forgot-password`;
  }

  getResetPasswordEndpoint(): string {
    return `${this.apiUrl}/reset-password`;
  }

  getUpdatePasswordEndpoint(): string {
    return `${this.apiUrl}/update-password`;
  }

  getKeycloakUrl(): string {
    return this.keycloakUrl;
  }


  getKycStatistics(): string {
    return `${this.apiUrl}/kyc/statistics`
  }

  getGrowth(): string {
    return `${this.apiUrl}/growth`
  }
}