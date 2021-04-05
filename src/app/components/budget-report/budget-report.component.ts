import { Component, OnInit } from '@angular/core';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { ReportService } from 'src/app/services/report/report.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from 'src/app/_alert/alert.service';
import { ExportService } from 'src/app/services/export/export.service';
import {Sort} from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { CustomCurrencyPipe } from 'src/app/pipes/customCurrency/custom-currency.pipe';

@Component({
  selector: 'app-budget-report',
  templateUrl: './budget-report.component.html',
  styleUrls: ['./budget-report.component.css']
})
export class BudgetReportComponent implements OnInit {
name = '';
m;
m1;
itemsPerPage = 10;
 categoryOptions;
 adusers: AdUser[];
 companyOptions;
 costCenterOptions;
 levelOptions;
 findObjLevelOptions;
 regionOptions: any;
 searchForm: FormGroup;
 // Arrays to submit
 regions: number[] = [];
 companies: number[] = [];
 //categories: number[] = [];
 selectedCat;
 employeesArr:number[]=[];
 costCenters: number[] = [];
 levels: number[]= [];
 reviews: number[]= [];
 reviewers = [
   {value: 'f1', text: 'Finance Reviewer - F1'},
   {value: 'f2', text: 'Finance Reviewer - F2'},
   {value: 'it', text: 'IS Reviewer'},
   {value: 'a1', text: 'Asset Reviewer'},
   {value: 'cfo', text: 'CFO Reviewer'}
 ];
 // Arrays to retrieve
 reports = [];
 initialreports = [];
 filteredReports = [];
 tableColumns =  [
  {col: 'employeeID', val: ''}, {col: 'displayName', val: ''}, {col: 'title', val: ''},
  {col: 'managerName', val: ''}, {col: 'managerID', val: ''}, {col: 'companyCode', val: ''},
  {col: 'costCenterCode'}, {col: 'region', val: ''}, {col: 'mg', val: ''},
  {col: 'f1', val: ''}, {col: 'f2', val: ''}, {col: 'it', val: ''},
  {col: 'a1', val: ''}, {col: 'cfo', val: ''}, {col: 'adminAccess', val: ''},
  {col: 'addDate', type: 'date', val: ''}, {col: 'editDate', type: 'date', val: ''}
  ];
 // Togglers
 searchOpened = true;
 dateFormat = 'MM/dd/yyyy';
 numberFormat = '1,234,567.89';

  constructor(private options: OrderRequestOptionsService, private formBuilder: FormBuilder,
              private aduserService: AdusersService, private reportService: ReportService,
              public errTransService: ErrorTranslationService,
              private datePipe: DatePipe, private dateTimeService: DateTimeService,
              private prefService: UserPrefService, private customCurrencyPipe: CustomCurrencyPipe,
              private spinner: NgxSpinnerService, private alertService: AlertService, private exportservice: ExportService) {
      this.searchForm = this.formBuilder.group({
        currentRegion: null,
        currentCompany: null,
        employee: null,
        reportingManager:null,
        requesterCostCenter:null,
        adminAccess: false,
        activeuser:0,
        currentLevel:null,
        reviewLevel:null,
        currentCategory:null,
        radio: 1
      });
     }

  async ngOnInit() {
    this.categoryOptions = await this.options.getCategories().toPromise();

    this.adusers = await this.aduserService.getAll().toPromise();
    this.companyOptions = await this.options.getCompany().toPromise();
    this.costCenterOptions = await this.options.getCostCenter().toPromise();
    this.findObjLevelOptions = await this.options.getlevelObj().toPromise();
    this.dateFormat = await this.dateTimeService.getDateFormat();
    if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.userPreference) {
      this.numberFormat = this.prefService.cachedUserPrefEntity.userPreference.numberFormat;
    }
    await this.options.getRegion().subscribe((res: Response) => {
      console.log('response is'+res);
      this.regionOptions=res;
    })
    //this.searchForm.get('currentLevel').disable();

    /*await this.options.getdistinctLevel().subscribe((res: Response) => {
      console.log('response level options is'+res);
      this.levelOptions=res;
    });*/

    this.name = document.getElementsByClassName('txt-usr')[0].innerHTML;
  }

  /*async ngDoCheck(): Promise<void> {
    if (this.categoryOptions) {
    }
    console.log('length of dropdown is---'+this.categoryOptions.length)
    if (this.categoryOptions.length === 1) {
          if (this.categoryOptions[0].materialGroup !== -1) {
            //this.selectOnlyValue(this.requestDetailsForm, 'purchaseCategory', this.purchaseCategoryOptions[0].ID);
            await this.options.getdistinctLevel().subscribe((res: Response) => {
              console.log('response level options is'+res);
              this.levelOptions=res;
            });
            //this.levelOptions = await this.options.getCostCenter().toPromise();
          }
        }

  }*/
  async loadLevels(){
    // this.searchForm.get('currentLevel').enable();
    let materialGroup = this.searchForm.value.currentCategory;
    if (!this.searchForm.value.currentCategory) {
      this.searchForm.patchValue({
        currentLevel: null
      });
    }
    console.log('material grop is--'+materialGroup)
    this.levelOptions = await this.options.getLevelOnMaterialGp(materialGroup).toPromise();
    this.levelOptions.forEach(element => {
      console.log('element is=='+element)
      console.log('element is=='+element.level)
      console.log('element is=='+element.startRange)
      console.log('element is=='+element.endRange)
    });
    console.log('material grop is--'+this.levelOptions.level)

  }

  saveExcel() {
    this.exportservice.exportTable('excel-budget-table', 'BudgetReport.xlsx');
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
      case 'title':
        this.reports = temp.filter(x => x.employeeID &&
          this.displayUserTitle(x.employeeID).toString().toLowerCase().includes(filterVal));
        break;
      case 'managerID':
        this.reports = temp.filter(x => x.managerID &&
          this.displayUserTitle(x.managerID).toString().toLowerCase().includes(filterVal));
        break;
      case 'mg':
        this.reports = temp.filter(x => x['mg' + this.selectedCat] &&
          this.displayRange(this.selectedCat, x['mg' + this.selectedCat]).toString().toLowerCase().includes(filterVal));
        break;
      case 'addDate':
      case 'editDate':
        this.reports = temp.filter(x => x[column] &&
          this.datePipe.transform(x[column], 'MMM d, y') === this.datePipe.transform(event.target.value, 'MMM d, y'));
        break;
      default:
        this.reports = temp.filter(x => x[column] && x[column].toString().toLowerCase().includes(filterVal));
        break;
    }
    this.filteredReports = [...this.reports];

  }

  sortData(sort: Sort) {
    this.spinner.show();
    const data = this.reports.slice();
    if (!sort.active || sort.direction === '') {
      this.reports = [...this.filteredReports];
      this.spinner.hide();
      return;
    }
    this.reports = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'title': return this.compare(this.displayUserTitle(a.employeeID), this.displayUserTitle(b.employeeID), isAsc);
        case 'managerID': return this.compare(this.displayUserTitle(a.managerID), this.displayUserTitle(b.managerID), isAsc);
        case 'mg1':
        case 'mg2':
        case 'mg3':
        case 'mg4':
        case 'mg5':
        case 'mg6':
        case 'mg7':
        case 'mg8':
        case 'mg9':
        case 'mg10':
           return this.compare(this.displayRange(this.selectedCat, a[sort.active]),
                              this.displayRange(this.selectedCat, b[sort.active]), isAsc);
        default: return this.compare(a[sort.active], b[sort.active], isAsc);
      }
    });
    this.spinner.hide();
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
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
    return this.categoryOptions.find(obj => obj.materialGroup == val).Category;
  }
  displayCompany(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      return this.companyOptions.find(obj => obj.companyCode == val).name;
    } catch { return ''  }
  }
  displayEmployee(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      let  user = this.adusers.find(obj => obj.employeeId == val);
      const newUser =  user.employeeId + '-' + user.firstname + ' ' + user.lastname + ',' + user.title;
      return newUser;

    } catch { return '' }
  }

  displayCostCenter(val): string {
    try {
      // tslint:disable-next-line: triple-equals

      return this.costCenterOptions.find(obj => obj.code == val).name;
    } catch { return '' }
  }
  displayUser(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      return this.adusers.find(obj => obj.employeeId == val).firstname + ' ' +
           // tslint:disable-next-line: triple-equals
           this.adusers.find(obj => obj.employeeId == val).lastname;
    } catch {
      return '';
    }
  }
  displayUserTitle(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      return this.adusers.find(obj => obj.employeeId == val).title;
    } catch {
      return '';
    }
  }
  showMGName(val,def):string{
    try {
      return this.categoryOptions.find(obj => obj.ID == val).Category;
    } catch {
      return this.categoryOptions.find(obj => obj.ID == def).Category;
    }
  }
  displayRange(mgNum,levelm): string {
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
  displayMgName(mg): string {
    try {
      console.log('mg  is ------'+mg);
      let materialGrp= this.categoryOptions.find(obj => (obj.ID == mg));

      const newUser =  materialGrp.Category ;
      console.log('newUser is --->'+newUser);
      return newUser;

    } catch { return  mg ; }
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
    const sendMe: any = {
      regions: this.searchForm.value.currentRegion,
      companies: this.searchForm.value.currentCompany,
      //categories: this.categories,
      currentCategory:  this.searchForm.value.currentCategory,
      //levels:this.levels,
      //employee: this.searchForm.value.employee,
      employeesArr: this.searchForm.value.employee,
      managerId: this.searchForm.value.reportingManager,
      //requesterCostCenter:this.searchForm.value.requesterCostCenter,
      costCenters: this.searchForm.value.requesterCostCenter,
      adminAccess: this.searchForm.value.adminAccess,
      activeuser: this.searchForm.value.activeuser,
      levels: this.searchForm.value.currentLevel,
      reviews: this.searchForm.value.reviewLevel,
      display: 1
    };

    for (const prop in sendMe) { // Remove -1 vals, they're only for display
      if (sendMe[prop] === -1) {
        sendMe[prop] = '';
      }
    }

    console.log(JSON.stringify(sendMe));
    console.log('data is' + JSON.stringify(sendMe));
    try {
      const temp = await this.reportService.sendBudgetReportData(JSON.stringify(sendMe)).toPromise();
      let filtered = temp.filter((el) => {
        return el != null;
      });
      this.reports = filtered;
      this.initialreports = [...this.reports];
      this.filteredReports = [...this.reports];
      console.log('data is' + JSON.stringify(sendMe));
      this.selectedCat=this.searchForm.value.currentCategory;
      console.log('categories is' + this.selectedCat );
      // console.log(this.reports);
      // console.log(this.hierarchy);
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

  userSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    const searchMe = new RegExp(term);
    if (item) {
      const searchable = '' + item.firstname + ' ' + item.lastname + ' - ' + item.employeeId;
      return String(searchable.toLowerCase()).match(searchMe) !== null;
    }
  }

  onClearFilters() {
    this.regions = [];
    this.companies = [];
    // categories = [];
    this.selectedCat = [];
    this.employeesArr = [];
    this.costCenters = [];
    this.levels = [];
    this.reviews = [];
    this.searchForm.patchValue({
        currentRegion: null,
        currentCompany: null,
        employee: null,
        reportingManager: null,
        requesterCostCenter: null,
        adminAccess: false,
        activeuser: 0,
        currentLevel: null,
        reviewLevel: null,
        currentCategory: null,
        radio: 1
    });
  }

}
