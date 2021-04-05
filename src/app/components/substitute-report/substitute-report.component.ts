import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HrUser } from 'src/app/models/hrUser';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { BudgetRequestService } from 'src/app/services/budget-request/budget-request.service';
import { AlertService } from 'src/app/_alert/alert.service';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportService } from 'src/app/services/report/report.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Sort } from '@angular/material';
import { ExportService } from 'src/app/services/export/export.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { CustomCurrencyPipe } from 'src/app/pipes/customCurrency/custom-currency.pipe';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
@Component({
  selector: 'app-substitute-report',
  templateUrl: './substitute-report.component.html',
  styleUrls: ['./substitute-report.component.css']
})
export class SubstituteReportComponent implements OnInit {
  searchForm: FormGroup;
  searchOpened = true;
  loading = false;
  hrUsers;
  hrUsersObservable: Observable<any>;
  initialReports = [];
  reports = [];
  regionOptions = [];
  itemsPerPage = 10;
  findObjLevelOptions;
  m;
  m1;
  dateFormat = 'MM/dd/yyyy';
  numberFormat = '1,234,567.89';
  dateTime = 'MM/dd/yyyy, h:mm:ss a z';
  constructor( private formBuilder: FormBuilder, private adService: AdusersService,
               private spinner: NgxSpinnerService, private alertService: AlertService,
               private datePipe: DatePipe, private reportService: ReportService,
               private exportservice: ExportService, private dateTimeService: DateTimeService,
               private budgetService: BudgetRequestService, public errTransService: ErrorTranslationService, 
               private customCurrencyPipe: CustomCurrencyPipe,
               private prefService: UserPrefService,
               private options: OrderRequestOptionsService,) {
    this.searchForm = this.formBuilder.group({
      subFor: null,
      subBy: null,
      createdBy: null,
      region: null,
      createdFrom: '',
      createdTo: '',
      validFrom: '',
      validTo: '',
      showActive: true
    });
   }

  async ngOnInit() {

    this.regionOptions = await this.budgetService.getRegions().toPromise();
    this.dateFormat = await this.dateTimeService.getDateFormat();
    this.dateTime = this.dateFormat + ', ' + await this.dateTimeService.getTimeFormat();
    this.loading = true;
    this.hrUsersObservable = this.adService.getHr()
    .pipe(tap((data) => {
      this.hrUsers = data;
      this.hrUsers.forEach(user => {
        user.displayValue = user.firstName + ' ' + user.lastName + ' - ' + user.employeeID;
      });
      this.loading = false;
    }));
    this.findObjLevelOptions = await this.options.getlevelObj().toPromise();
    if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.userPreference) {
      this.numberFormat = this.prefService.cachedUserPrefEntity.userPreference.numberFormat;
    }
  }

  toggleSearch() {
    this.searchOpened = !this.searchOpened;
  }
  async onSearchClick() {
    this.spinner.show();
    let createdFrom: string;
    let createdTo: string;
    let validfrom: string;
    let validto: string;
    createdFrom = this.searchForm.value.createdFrom ? new Date(this.searchForm.value.createdFrom).toISOString().split('T')[0] : '';
    createdTo = this.searchForm.value.createdTo ? new Date(this.searchForm.value.createdTo).toISOString().split('T')[0] : '';
    validfrom = this.searchForm.value.validFrom ? new Date(this.searchForm.value.validFrom).toISOString().split('T')[0] : '';
    validto = this.searchForm.value.validTo ? new Date(this.searchForm.value.validTo).toISOString().split('T')[0] : '';

    const sendMe: any = {
      substitutorFor: this.searchForm.value.subFor,
      substitutedBy: this.searchForm.value.subBy,
      createdBy: this.searchForm.value.createdBy,
      regions: this.searchForm.value.region,
      createdFrom: createdFrom || null,
      createdTo: createdTo ||  null,
      updatedFrom: null,
      updatedTO: null,
      validFrom: validfrom || null,
      validTo: validto ||  null,
      active: this.searchForm.value.showActive || false
    };
    if (sendMe.createdFrom && !sendMe.createdTo) {
      sendMe.createdTo = '9999-01-01';
    } else if (sendMe.createdTo && !sendMe.createdFrom) {
      sendMe.createdFrom = '0001-01-01';
    }
    if (sendMe.validFrom && !sendMe.validTo) {
      sendMe.validTo = '9999-01-01';
    } else if (sendMe.validTo && !sendMe.validFrom) {
      sendMe.validFrom = '0001-01-01';
    }
    try {
      this.alertService.clear();
      const temp = await this.reportService.sendSubstituteReportData(JSON.stringify(sendMe)).toPromise();
      this.reports = temp;
      this.initialReports = temp;
      if (!this.reports[0]) {
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

  sortData(sort: Sort) {
    const data = this.reports.slice();
    if (!sort.active || sort.direction === '') {
      this.reports = this.initialReports;
      return;
    }
    this.reports = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'req_firstname':
        case 'req_lastname':
        case 'req_title':
          const key = sort.active.split('req_')[1];
          const value1 = a.adInfo_requester ? a.adInfo_requester[key] : '';
          const value2 = b.adInfo_requester ? b.adInfo_requester[key] : '';
          return this.compare(value1, value2, isAsc);
        case 'sub_firstname':
        case 'sub_lastname':
        case 'sub_title':
          const key1 = sort.active.split('sub_')[1];
          const v1 = a.adInfo_substituter ? a.adInfo_substituter[key1] : '';
          const v2 = b.adInfo_substituter ? b.adInfo_substituter[key1] : '';
          return this.compare(v1, v2, isAsc);
        default: return this.compare(a[sort.active], b[sort.active], isAsc);
      }
      });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  saveExcel() {
    this.exportservice.exportTable('excel-table', 'SubstituteReport.xlsx');
  }

  reset() {
    this.searchForm.reset();
    this.searchForm.patchValue({
      showActive: true
    });
  }

  displayRange(levelm,mgNum): string {
    try {

      console.log('mgNum--'+mgNum);
      console.log('level is--'+levelm);
      let materialGroup =mgNum;
      // tslint:disable-next-line: triple-equals
      let  level;
      if(materialGroup)
      level= this.findObjLevelOptions.find(obj => (obj.materialGroup == materialGroup && obj.level==levelm));
     // else
      //level= this.findObjLevelOptions.find(obj => (obj.level==levelm));
      let newUser = '';
      if (level) {
      const value = this.customCurrencyPipe.transform(level.endRange, 'USD' , this.numberFormat);
      newUser =  this.errTransService.returnMsg('upto') + ' ' + value;
      }
      console.log('newUser is --->' + newUser);

      return newUser;

    } catch {

      return ''; }
  }

}
