import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatBadgeModule,
    RouterModule,
    RouterOutlet,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  opened = true;
  username: string | null = null;
  customer: any;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private adminService: AdminService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsername();
  }

  loadUsername(): void {
    this.username = this.userService.getUsername() ?? null;
  }

  toggleSidenav(): void {
    this.opened = !this.opened;
  }

  logout(): void {
    this.authService.logout();
  }

  openUpdateDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '600px',
      data: { ...this.customer }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customer = result;
      }
    });
  }

  isAdmin(): boolean {
    return this.adminService.checkAdminAccess();
  }
}
