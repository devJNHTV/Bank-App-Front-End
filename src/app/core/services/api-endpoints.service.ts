import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiEndpointsService {
  private apiUrl = environment.apiUrl;
  private keycloakUrl = environment.keycloak.url;

  getRegisterEndpoint(): string {
    return `${this.apiUrl}/register`;
  }

  getConfirmRegisterEndpoint(): string {
    return `${this.apiUrl}/confirm-register`;
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
}