import { Component, OnInit } from '@angular/core';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { ReportService } from 'src/app/services/report/report.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AlertService } from 'src/app/_alert/alert.service';
import { ExportService } from 'src/app/services/export/export.service';
import {Sort} from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';

@Component({
  selector: 'app-status-report',
  templateUrl: './status-report.component.html',
  styleUrls: ['./status-report.component.css']
})
export class StatusReportComponent implements OnInit {
  m; m1;
  today = new Date();
  name = '';
  itemsPerPage = 10;

  // Options lists from API
  categoryOptions;
  vendorOptions;
  adusers: AdUser[];
  companyOptions;
  costCenterOptions;
  currencyOptions;
  // Data to be submitted
  searchForm: FormGroup;
  // Arrays to submit
  reqNumbers: number[] = [];
  categories: number[] = [];
  vendors: number[] = [];
  companies: number[] = [];
  statusPor: any[] = [];
  //  {id : 1, value: 'Draft'},
  statusList = [
    {id : 2, value: 'In Review'},
    {id : 3, value: 'Approval In Progress'},
    {id : 4, value: 'Pending Clarification'},
    {id : 5, value: 'Rejected'},
    {id : 6, value: 'Cancel'},
    {id : 7, value: 'Approved'},
    {id : 8, value: 'PO under review'},
    {id : 9, value: 'SAP PO Error'},
    {id : 10, value: 'Processed'}
  ];
  // Arrays to retrieve
  reports = [];
  initialreports = [];
  filteredReports = [];
  tableColumns = [
    {col: 'id', val: ''}, {col: 'status', val: ''}, {col: 'purchaseCategory', val: ''},
    {col: 'orderDate', val: '', type: 'date'}, {col: 'requester', val: ''}, {col: 'createdBy', val: ''},
    {col: 'company', val: ''}, {col: 'vendor', val: ''}, {col: 'costCenter', val: ''}, {col: 'cost', val: ''},
    {col: 'hCurrentApproverId', val: ''}, {col: 'hdisplayDate', val: '', type: 'date'}, {col: 'sapOrder', val: ''},
    {col: 'matno', val: ''}, {col: 'shorttext', val: ''}, {col: 'orderCurrency', val: ''}, {col: 'unitcost', val: ''},
    {col: 'totalcost', val: ''}, {col: 'totalusd', val: ''}, {col: 'ddate', val: '', type: 'date'}
    ];
  // Arrays to retrieve
  hierarchy = [];
  // Togglers
  searchOpened = true;
  vendorOptionsObservable: Observable<any>;
  loadingVendor = false;
  dateFormat = 'MM/dd/yyyy';
  numberFormat = '1,234,567.89';
  // display filters
  reportFilter = x => x.header.status !== 1;

  constructor(private options: OrderRequestOptionsService, private formBuilder: FormBuilder,
              private aduserService: AdusersService, private reportService: ReportService,
              private spinner: NgxSpinnerService, private alertService: AlertService,
              private datePipe: DatePipe, private prefService: UserPrefService,
              public errTransService: ErrorTranslationService,
              private dateTimeService: DateTimeService,
              private exportservice: ExportService) {
                this.searchForm = this.formBuilder.group({
                  createdDate: '',
                  toDate: '',
                  requisitioner: null,
                  createdBy: null,
                  approver: null,
                  // Current values to add to arrays
                  currentReqNo: Number,
                  currentCategory: null,
                  currentVendor: null,
                  currentCompany: null,
                  currentStatus: null,
                  radio: 1,
                  pending: 'false'
                });
              }

  async ngOnInit() {
    this.categoryOptions = await this.options.getCategories().toPromise();
    this.dateFormat = await this.dateTimeService.getDateFormat();
    this.loadingVendor = true;
    this.vendorOptionsObservable = this.options.getVendors()
      .pipe(tap((data) => {
        this.vendorOptions = data;
        this.loadingVendor = false;
      }));
    this.adusers = await this.aduserService.getAll().toPromise();
    const userProfile = await this.prefService.getProfileFromCache();
    if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.userPreference) {
        this.numberFormat = this.prefService.cachedUserPrefEntity.userPreference.numberFormat;
      }
    const region = (userProfile.hrUser && userProfile.hrUser.region) ? userProfile.hrUser.region : null;
    this.companyOptions = await this.options.getCompanyByRegion(region).toPromise();
    this.costCenterOptions = await this.options.getCostCenter().toPromise();
    this.currencyOptions = await this.options.getCurrency().toPromise();
    document.getElementById('orderDate').setAttribute('max', this.today.toISOString().split('T')[0]);
    this.name = document.getElementsByClassName('txt-usr')[0].innerHTML;
  }

  applyFilter(event, column, i, type) {
    if (event.keyCode === 9) { // on tab-key press
      return;
    }
    let filterVal = event.target.value;
    console.log(filterVal, column);
    let temp = [...this.initialreports];
    this.tableColumns.forEach(item => { // clear values from other column filters
      item.val = '';
    });
    this.tableColumns[i].val = filterVal;
    if (!filterVal) {
      this.reports = temp;
      return;
    }
    if (type !== 'date') {
      filterVal = event.target.value.toString().toLowerCase();
    }
    switch (column) {
      case 'status':
        this.reports = temp.filter(x => x.header[column] &&
          this.displayStatus(x.header[column]).toString().toLowerCase().includes(filterVal));
        break;
      case 'purchaseCategory':
        this.reports = temp.filter(x => x.header[column] &&
          this.displayCategory(x.header[column]).toString().toLowerCase().includes(filterVal));
        break;
      case 'orderDate':
        this.reports = temp.filter(x => x.header[column] &&
          this.datePipe.transform(x.header[column], 'MMM d, y') === this.datePipe.transform(event.target.value, 'MMM d, y'));
        break;
      case 'requester':
      case 'createdBy':
        this.reports = temp.filter(x => x.header[column] &&
          this.displayAduser(x.header[column]).toString().toLowerCase().includes(filterVal));
        break;
      case 'hCurrentApproverId':
        this.reports = temp.filter(x => x[column] && x.header.status < 5 &&
          this.displayAduser(x[column]).toString().toLowerCase().includes(filterVal));
        break;
      case 'company':
        this.reports = temp.filter(x => x.header[column] &&
          this.displayCompany(x.header[column]).toString().toLowerCase().includes(filterVal));
        break;
      case 'vendor':
        this.reports = temp.filter(x => x.header[column] &&
          this.displayVendor(x.header[column]).toString().toLowerCase().includes(filterVal));
        break;
      case 'costCenter':
        this.reports = temp.filter(x => x.header[column] &&
          this.displayCostCenter(x.header[column]).toString().toLowerCase().includes(filterVal));
        break;
      case 'hdisplayDate':
        this.reports = temp.filter(x => x[column] && x.header.status < 5 &&
          x[column] === this.datePipe.transform(event.target.value, 'dd MMM yyyy'));
        break;
      case 'orderCurrency':
        this.reports = temp.filter(x => x.header[column] &&
          this.displayCurrency(x.header[column]).toString().toLowerCase().includes(filterVal));
        break;
      // line items filters
      case 'matno':
        this.reports = temp.filter(x => x.header.itemDetails &&
           x.header.itemDetails.filter(item => item.material.toString().toLowerCase().includes(filterVal))[0]);
        break;
      case 'shorttext':
        this.reports = temp.filter(x => x.header.itemDetails &&
          x.header.itemDetails.filter(item => item.description.toString().toLowerCase().includes(filterVal))[0]);
        break;
      case 'unitcost':
        this.reports = temp.filter(x => x.header.itemDetails &&
          x.header.itemDetails.filter(item => item.unitCost.toString().toLowerCase().includes(filterVal))[0]);
        break;
      case 'totalcost':
        this.reports = temp.filter(x => x.header.itemDetails &&
          x.header.itemDetails.filter(item => item.totalCost.toString().toLowerCase().includes(filterVal))[0]);
        break;
      case 'totalusd':
        this.reports = temp.filter(x => x.header.itemDetails &&
          x.header.itemDetails.filter(item => item.totalCostUsd.toString().toLowerCase().includes(filterVal))[0]);
        break;
      case 'ddate':
        this.reports = temp.filter(x => x.header.itemDetails &&
          x.header.itemDetails.filter(item =>  (this.datePipe.transform(item.deliveryDate, 'MMM d, y') ===
          this.datePipe.transform(event.target.value, 'MMM d, y')))[0]);
        break;

      default:
        this.reports = temp.filter(x => x.header[column] && x.header[column].toString().toLowerCase().includes(filterVal));
        break;
    }
    this.filteredReports = [...this.reports];

  }
  sortData(sort: Sort) {
    const data = this.reports.slice();
    if (!sort.active || sort.direction === '') {
      this.reports = this.filteredReports;
      return;
    }
    this.reports = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'status': return this.compare(this.displayStatus(a.header.status), this.displayStatus(b.header.status), isAsc);
        case 'purchaseCategory': return this.compare(this.displayCategory(a.header.purchaseCategory),
                   this.displayCategory(b.header.purchaseCategory), isAsc);
        case 'requester': return this.compare(this.displayAduser(a.header.requester), this.displayAduser(b.header.requester), isAsc);
        case 'createdBy': return this.compare(this.displayAduser(a.header.createdBy), this.displayAduser(b.header.createdBy), isAsc);
        case 'company': return this.compare(this.displayCompany(a.header.company), this.displayCompany(b.header.company), isAsc);
        case 'costCenter': return this.compare(this.displayCostCenter(a.header.costCenter),
                   this.displayCostCenter(b.header.costCenter), isAsc);
        case 'vendor': return this.compare(this.displayVendor(a.header.vendor), this.displayVendor(b.header.vendor), isAsc);
        case 'hCurrentApproverId': return this.compare(
          (a.hcurrentApprovalstatus === 2 && a.header.status < 5) ?
          this.displayAduser( a.substituterId ? a.substituterId : a.hCurrentApproverId) : '',
          (b.hcurrentApprovalstatus === 2 && b.header.status < 5) ?
          this.displayAduser(b.substituterId ? b.substituterId : b.hCurrentApproverId) : '',
                  isAsc);
        case 'hLastFunctionalApproverId': return this.compare(this.displayAduser(a.hLastFunctionalApproverId),
                   this.displayAduser(b.hLastFunctionalApproverId), isAsc);

        case 'orderCurrency': return this.compare(this.displayCurrency(a.header.orderCurrency),
                   this.displayAduser(b.header.displayCurrency), isAsc);
        default: return this.compare(a.header[sort.active], b.header[sort.active], isAsc);
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  saveExcel() {
    this.exportservice.exportTable('excel-table', 'PurchaseOrderSheet.xlsx');
  }

  toggleSearch() {
    this.searchOpened = !this.searchOpened;
  }

  addToArray(array: any[], control, defaultToN1?) {
    if (defaultToN1 && this.searchForm.get(control).value === -1) {
      return;
    }
    if (!this.searchForm.get(control).value || typeof this.searchForm.get(control).value === 'function') {
      return;
    }
    if (array.indexOf(this.searchForm.get(control).value) > -1) {
      return;
    }
    array.push(this.searchForm.get(control).value);
    this.searchForm.get(control).reset();
    if (defaultToN1) {
      const temp: any = {};
      temp[control] = -1;
      this.searchForm.patchValue(temp);
    }
  }

  removeFromArray(array: any[], value) {
    array.splice(array.indexOf(value), 1);
  }

  displayCategory(val): string {
    // tslint:disable-next-line: triple-equals
    return this.categoryOptions.find(obj => obj.ID == val).Category;
  }

  displayVendor(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      let vendorDetials = this.vendorOptions.find(obj => obj.id == val).searchable
      let vendorName = vendorDetials.split(',')[0];
      let size = vendorDetials.split(',').length;
      let vendorNumber = vendorDetials.split(',')[size - 1];
      return vendorName + ' -' + vendorNumber.split(':')[1];

    } catch { return 'errror'; }
  }

  displayCompany(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      return this.companyOptions.find(obj => obj.id == val).name;
    } catch { return ''; }
  }

  displayAduser(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      return this.adusers.find(obj => obj.ID == val).firstname + ' ' +
           // tslint:disable-next-line: triple-equals
           this.adusers.find(obj => obj.ID == val).lastname;
    } catch {
      return ' ';
    }
  }

  displayCostCenter(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      let returnVal = this.costCenterOptions.find(obj => obj.id == val);
      return returnVal.name + ' (' + returnVal.code + ' )';
    } catch { return 'Cost Center: ' + val + ' not found.'; }
  }

  displayCurrency(val): string {
    // tslint:disable-next-line: triple-equals
    return this.currencyOptions.find(obj => obj.ID == val).currency;
  }

  displayStatus(code): string {
    code = Number(code);
    switch (code) {
      case 1:
        return this.errTransService.returnMsg('Draft');
      case 2:
        return this.errTransService.returnMsg('In Review');

      case 3:
        return this.errTransService.returnMsg('Approval In Progress');
      case 4:
        return this.errTransService.returnMsg('Pending Clarification');
      case 5:
        return this.errTransService.returnMsg('Rejected');
      case 6:
        return this.errTransService.returnMsg('Cancel');
      case 7:
        return this.errTransService.returnMsg('Approved');
      case 8:
        return this.errTransService.returnMsg('PO under review');
      case 9:
          return this.errTransService.returnMsg('SAP PO Error');
      case 10:
          return this.errTransService.returnMsg('Processed');
      default:
        return 'Error';
    }
  }

  async onSearchClick() {
    this.alertService.clear();
    this.spinner.show();
    let temp1: string;
    let temp2: string;
    if (this.searchForm.value.createdDate) {
      temp1 = new Date(this.searchForm.value.createdDate).toISOString().split('T')[0];
    } else {
      temp1 = '';
    }
    if (this.searchForm.value.toDate) {
      temp2 = new Date(this.searchForm.value.toDate).toISOString().split('T')[0];
    } else {
      temp2 = '';
    }
    let companiesToSend = [];
    if (!this.searchForm.value.currentCompany || this.searchForm.value.currentCompany.length === 0) {
      this.companyOptions.forEach(cmp => {
        companiesToSend.push(cmp.id);
      });
    } else {
      companiesToSend = this.searchForm.value.currentCompany;
    }
    const sendMe: any = {
      reqNumbers: this.reqNumbers,
      date: temp1,
      toDate: temp2,
      categories: this.searchForm.value.currentCategory,
      vendors: this.searchForm.value.currentVendor,
      requester: this.searchForm.value.requisitioner,
      createdBy: this.searchForm.value.createdBy,
      companies: companiesToSend,
      approver: this.searchForm.value.approver,
      status: this.searchForm.value.currentStatus,
      display: 1
    };

    if (!sendMe.toDate) {
      sendMe.toDate = '9999-01-01';
    }
    if (!sendMe.date) {
      sendMe.date = '0001-01-01';
    }

    if (this.searchForm.controls.pending.value === 'true') {
      sendMe.pending = true;
    } else {
      sendMe.pending = false;
    }

    for (const prop in sendMe) { // Remove -1 vals, they're only for display
      if (sendMe[prop] === -1) {
        sendMe[prop] = '';
      }
    }

    console.log(JSON.stringify(sendMe));

    try {
      const temp = await this.reportService.sendPostData(JSON.stringify(sendMe)).toPromise();
      this.reports = temp.purchaseRequest;
      this.initialreports = [...this.reports];
      this.filteredReports = [...this.reports];
      this.hierarchy = temp.hlistGrouped;
      console.log('data is' + JSON.stringify(this.reports) );
      // console.log(this.reports);
      // console.log(this.hierarchy);
      if (!this.reports[0] || !this.reports.filter(this.reportFilter)[0]) {
        this.spinner.hide();
        this.alertService.info(this.errTransService.returnMsg('noResult'));
        return;
      }
    } catch (error) {
      this.alertService.error(this.errTransService.returnMsg('errAPI2'));
      this.spinner.hide();
      return;
    }
    this.spinner.hide();
    this.searchOpened = false;
  }

  userSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    const searchMe = new RegExp(term);
    if (item) {
      const searchable = '' + item.firstname + ' ' + item.lastname + ' - ' + item.employeeId;
      return String(searchable.toLowerCase()).match(searchMe) !== null;
    }
  }

  vendorSearchFn = (term: string, item: any) => {
    term = this.customSearchEscape(term.toLowerCase());
    const searchMe = new RegExp(term);
    if (item) {
      return String(item.searchable.toLowerCase()).match(searchMe) !== null;
    }
  }

  private customSearchEscape(myString: string): string {
    return '^' + myString.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'); // force start of string, force * wildcard
  }

  resetSearchFilters() {
    this.reqNumbers = [];
    this.categories = [];
    this.vendors = [];
    this.companies = [];
    this.statusPor = [];
    this.searchForm.patchValue({
      createdDate: '',
      toDate: '',
      requisitioner: null,
      createdBy: null,
      approver: null,
      // Current values to add to arrays
      currentReqNo: Number,
      currentCategory: null,
      currentVendor: null,
      currentCompany: null,
      currentStatus: null,
      radio: 1,
      pending: 'false'
    });
  }

}
