  // src/app/dashboard-loan/dashboard-loan.component.ts
  import { Component, numberAttribute, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Router } from '@angular/router';
  import { LoanService } from '../../services/loan.service';
  import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
  import { Loan } from '../../models/loan.model';
  import { CardModule } from 'primeng/card';
  import { ButtonModule } from 'primeng/button';
  import { PanelModule } from 'primeng/panel';
  import { TableModule } from 'primeng/table';
  import { Observable } from 'rxjs';
  import { ToastrService } from 'ngx-toastr';
  import { LoanStatus } from '../../models/loanStatus .model';
  @Component({
    selector: 'app-dashboard-loan',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, PanelModule, TableModule],
    templateUrl: './orverview-loan.component.html',
    styleUrls: ['./orverview-loan.component.scss']
  })
  export class OrverviewLoanComponent implements OnInit {
    loans: Loan[] = [];
    approvedLoans: Loan[] = [];
    pendingLoans: Loan[] = [];
    rejectedLoans: Loan[] = [];
    expandedRows: { [key: number]: boolean } = {};

    constructor(private loanService: LoanService, private router: Router, private toastr: ToastrService) { }

    ngOnInit(): void {
      const idCustomer = localStorage.getItem("idCustomer");
      console.log(idCustomer);
      this.loanService.getLoansByCustomerId(Number(idCustomer))
        .then((obs: Observable<ApiResponseWrapper<Loan[]>>) => {
          obs.subscribe({
            next: (response: ApiResponseWrapper<Loan[]>) => {
              this.loans = response.data;
              console.log(this.loans);
              
              this.approvedLoans = this.loans.filter(l => l.status === LoanStatus.APPROVED);
              this.pendingLoans = this.loans.filter(l => l.status === LoanStatus.PENDING);
              this.rejectedLoans = this.loans.filter(l => l.status === LoanStatus.REJECTED);

            },
            error: (err) => {
              console.error('Lỗi khi gọi API:', err);
              this.toastr.error(`Không tải được danh sách khoản vay: ${err}`, 'Lỗi');
            }
          });
        })
        .catch((err) => {
          console.error('Promise từ getLoansByCustomerId bị lỗi:', err);
          this.toastr.error(`Không tải được danh sách khoản vay: ${err}`, 'Lỗi');
        });


    }
    
      getDetailLoan(id : number) {
      this.router.navigate(['/detail/loan', id]);
    }
    getUpdatelLoan(id : number) {
      this.router.navigate(['/update/loan', id]);
    }
    getDetailReject(id : number) {
      this.router.navigate(['/detail/loan/reject', id]);
    }

  }