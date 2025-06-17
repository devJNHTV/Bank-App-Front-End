import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Customer Accounts</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort>
            <!-- Account Number Column -->
            <ng-container matColumnDef="accountNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Account Number</th>
              <td mat-cell *matCellDef="let row">{{row.accountNumber}}</td>
            </ng-container>

            <!-- Account Type Column -->
            <ng-container matColumnDef="accountType">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let row">{{row.accountType}}</td>
            </ng-container>

            <!-- Balance Column -->
            <ng-container matColumnDef="balance">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Balance</th>
              <td mat-cell *matCellDef="let row">{{row.balance | currency:'VND':'symbol':'1.0-0'}}</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let row">{{row.status}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Row shown when there is no data -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="4">No accounts found</td>
            </tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25]" aria-label="Select page of accounts"></mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .table-container {
      position: relative;
      min-height: 200px;
      max-height: 400px;
      overflow: auto;
    }

    table {
      width: 100%;
    }

    .mat-column-accountNumber {
      flex: 0 0 25%;
    }

    .mat-column-accountType {
      flex: 0 0 25%;
    }

    .mat-column-balance {
      flex: 0 0 25%;
    }

    .mat-column-status {
      flex: 0 0 25%;
    }
  `]
})
export class CustomerAccountsComponent implements OnInit {
  displayedColumns: string[] = ['accountNumber', 'accountType', 'balance', 'status'];
  dataSource!: MatTableDataSource<any>;
  isLoading = false;

  constructor(
    private userServie: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCustomerAccounts();
  }

  loadCustomerAccounts(): void {
    this.isLoading = true;
    this.userServie.getCustomerAccounts().subscribe({
      next: (accounts) => {
        this.dataSource = new MatTableDataSource(accounts);
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load customer accounts'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
} 