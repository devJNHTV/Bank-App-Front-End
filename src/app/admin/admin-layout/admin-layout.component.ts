import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  isDropdownOpen = false;
  isDropdownSetting = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.isDropdownOpen = false;
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdownSetting(): void {
    this.isDropdownSetting = !this.isDropdownSetting;
  }

  logout(): void {
    this.authService.logout();
  }
}