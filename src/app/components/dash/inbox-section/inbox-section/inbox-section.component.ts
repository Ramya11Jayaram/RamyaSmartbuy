import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { NgxSpinnerService } from 'ngx-spinner';
import { Sort } from '@angular/material/sort';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';

@Component({
  selector: 'app-inbox-section',
  templateUrl: './inbox-section.component.html',
  styleUrls: ['./inbox-section.component.css']
})
export class InboxSectionComponent implements OnInit {

  @Input() prefs: any;
  @Input() list: any;
  @Input() title: string;
  @Input() adUsers: AdUser[];
  @Input() reqType: string;
  @Input() numberPref: any;
  @Output() pageNo = new EventEmitter<any>();
  itemsPerPage = [10, 10, 10, 10, 10, 10, 10, 10, 10]; // initial items per page for all table
  state = [1, 10]; // Default state...
  pagination = {
    'Your Requests': 1,
    'Requests Created for Others': 1,
    'Waiting for your Approval': 1,
    'Waiting for your Approval as a Substitute': 1,
    'Approved or Rejected Requests': 1
  };
  dateFormat = 'MM/dd/yyyy';

  constructor(public errTransService: ErrorTranslationService,
              private dateTimeService: DateTimeService,
              private spinner: NgxSpinnerService) { }

  async ngOnInit()  {
    if (this.prefs) {
      this.prefs.sort((a, b) => a.position - b.position);
    }
    this.dateFormat = await this.dateTimeService.getDateFormat();
  }

  returnUsername(id: number): string {
    const foundUser = this.adUsers.find(obj => obj.ID === id);
    if (foundUser) {
      return (foundUser.firstname + ' ' + foundUser.lastname);
    }
    return 'NA';
  }

  returnUsernameByEAID(eaid: string): string {
    const foundUser =  this.adUsers.find(obj => obj.employeeId === eaid);
    if (foundUser) {
      return (foundUser.firstname + ' ' + foundUser.lastname);
    }
    return 'NA';
  }

  returnProperStauts(code: number): string {
    switch (this.reqType) {
      case 'por':
        return this.returnRequistionStatus(code);
      case 'budget':
        return this.returnBrStatus(code);
      default:
        return this.returnRequistionStatus(code);
    }
  }

  returnRequistionStatus(code: number): string {
    // Pending-1/Active-2/Approved-3/Rejected-4
    switch (code) {
      case 1:
        return 'Draft';
      case 2:
        return 'In Review';

      case 3:
        return 'Approval In Progress';
      case 4:
        return 'Pending Clarification';
      case 5:
        return 'Rejected';
      case 6:
        return 'Cancel';
      case 7:
        return 'Approved';
      case 8:
        return 'PO under review';
      case 9:
        return 'SAP PO In Error';
      case 10:
        return 'Processed';
      default:
        return 'Error';
    }
  }

  returnBrStatus(code: number): string {
    switch (code) {
      case 6:
        return 'Approval In Progress';
      case 5:
        return 'Finance Review';
      case 4:
        return 'Additional Finance Review';
      case 3:
        return 'Approved';
      case 2:
        return 'Pending Clarification';
      case 1:
        return 'Rejected';
      default:
        return 'Error';
    }
  }

  sortData(sort: Sort) {
    if (!this.list || !this.list[0]) {
      return;
    }
    this.spinner.show();
    const data = this.list.slice();
    if (!sort.active || sort.direction === '') {
      this.list = [...this.list];
      this.spinner.hide();
      return;
    }
    this.list = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case '#': return this.compare((a && a.compositeId && a.compositeId.id || 0),
          (b && b.compositeId && b.compositeId.id || 0), isAsc);
        case 'Company Code': return this.compare((a && a.companyCode && a.companyCode.name || ''),
          (b && b.companyCode && b.companyCode.name || ''), isAsc);
        case 'POR Brief Description': return this.compare((a && a.comments || ''),
          (b && b.comments || ''), isAsc);
        case 'Purchase Category': return this.compare((a && a.purchaseCategorydto && a.purchaseCategorydto.Category || ''),
          (b && b.purchaseCategorydto && b.purchaseCategorydto.Category || ''), isAsc);
        case 'Creator': return this.compare((a && a.adInfoCreatedBy && a.adInfoCreatedBy.displayName || ''),
          (b && b.adInfoCreatedBy && b.adInfoCreatedBy.displayName || ''), isAsc);
        case 'Requester': return this.compare((a && a.adInfoRequester && a.adInfoRequester.displayName || ''),
          (b && b.adInfoRequester && b.adInfoRequester.displayName || ''), isAsc);
        case 'Created On': return this.compare((a.createdon),
          (b.createdon), isAsc);
        case 'Vendor Name': return this.compare((a && a.vendordto && a.vendordto.address && a.vendordto.address.split(',', 1)[0] || ''),
          (b && b.vendordto && b.vendordto.address && b.vendordto.address.split(',', 1)[0] || ''), isAsc);
        case 'Currency': return this.compare((a && a.orderCurrencydto && a.orderCurrencydto.currency || ''),
          (b && b.orderCurrencydto && b.orderCurrencydto.currency || ''), isAsc);
        case 'Total Cost': return this.compare((a && a.localCost || ''),
          (b && b.localCost || ''), isAsc);
        case 'Total Cost USD': return this.compare((a && a.cost || ''),
          (b && b.cost || ''), isAsc);
        case 'Pending With': return this.compare((a && a.pendingWith && a.pendingWith.displayName || ''),
          (b && b.pendingWith && b.pendingWith.displayName || ''), isAsc);
        case 'Pending Since': return this.compare((a.pendingSince),
          (b.pendingSince), isAsc);
        case 'Status':
          return this.compare
            ((a && a.approvelStatus ? this.errTransService.returnMsg(this.returnRequistionStatus(Number(a.approvelStatus))) : ''),
              (b && b.approvelStatus ? this.errTransService.returnMsg(this.returnRequistionStatus(Number(b.approvelStatus))) : ''), isAsc);
        default: return this.compare(a[sort.active], b[sort.active], isAsc);
      }
    });
    this.spinner.hide();
  }

  sortBudget(sort: Sort) {
    if (!this.list || !this.list[0]) {
      return;
    }
    this.spinner.show();
    const data = this.list.slice();
    if (!sort.active || sort.direction === '') {
      this.list = [...this.list];
      this.spinner.hide();
      return;
    }
    this.list = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case '#': return this.compare((a && a.budgetRequestId || 0),
          (b && b.budgetRequestId || 0), isAsc);
        case 'Creator': return this.compare((a && a.createdby || ''),
          (b && b.createdby || ''), isAsc);
        case 'Requester': return this.compare((a && a.requester || ''),
          (b && b.requester || ''), isAsc);
        case 'Created On': return this.compare((a.creationdate),
          (b.creationdate), isAsc);
        case 'Status': return this.compare((a && a.docStatus || ''),
          (b && b.docStatus || ''), isAsc);
        default: return this.compare(a[sort.active], b[sort.active], isAsc);
      }
    });
    this.spinner.hide();
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getClass(value) {
    switch (value) {
      case 'Created On':
      case 'Pending Since':
      case 'Total Cost':
      case 'Total Cost USD':
        return 'min130';
      case 'Currency':
      return 'min100';
      default:
        return 'min-width-15';
    }
  }

  onPageChange(event, title) {
    /* event is just the page number */
    this.pagination[title] = event;
    this.pageNo.emit({pageNo: event , itemsPerPage: this.itemsPerPage[0]});
  }

  onPageSizeChange() {
    /* this.pagination[title] = pageNo: */
    if (JSON.stringify(this.state) === JSON.stringify([this.pagination[this.title], this.itemsPerPage[0]])) {
      return; // Don't emit the event if nothing has actually changed! This DOES happen in the app, due to
      // use of both the keyup and change properties, but we NEED both events to be captured due to the arrows
    }
    this.pageNo.emit({pageNo: this.pagination[this.title], itemsPerPage: this.itemsPerPage[0]});
    this.state = JSON.parse(JSON.stringify([this.pagination[this.title], this.itemsPerPage[0]]));
  }
}
