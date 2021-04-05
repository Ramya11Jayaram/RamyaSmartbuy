import { Component, OnInit, ViewChild, DoCheck } from '@angular/core';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { OktaAuthService } from '@okta/okta-angular';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
import { HrUser } from 'src/app/models/hrUser';
import { BudgetRequestService } from 'src/app/services/budget-request/budget-request.service';
import { AlertService } from 'src/app/_alert/alert.service';
import { AuthTitle } from 'src/app/services/budget-request/models/auth-title';
import { NgxSpinnerService } from 'ngx-spinner';
import { GenericUser } from 'src/app/models/genericUser';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';

@Component({
  selector: 'app-budget-approver-request',
  templateUrl: './budget-approver-request.component.html',
  styleUrls: ['./budget-approver-request.component.css']
})
export class BudgetApproverRequestComponent implements OnInit, DoCheck {
  // List of imported data from DB
  hrUsers: HrUser[];
  adUsers: AdUser[];
  costCenterOptions;
  companyOptions;
  categoryOptions;
  regionOptions;
  titleOptions: AuthTitle[];
  rangeOptions: AuthTitle[] = [];

  // Data important for display purposes
  date = Date.now();
  dateFormat = 'MM/dd/yyyy';
  numberFormat = '';
  selectedUserCompany;
  selectedUserCostCenter;
  selectedUserDefaultLevel;
  selectedUserRegion;
  // selectedUserDisplay;
  @ViewChild('budgetUserSelect', {static: false}) public ngSelect: NgSelectComponent;
  reportingManagerCompany;
  reportingManagerRegion;
  reportingManagerLevel;
  hierarchy = [];
  yesNoDisplay = [{label: 'Yes', value: true}, {label: 'No', value: false}];
  authDisplayOpts = [{label: this.errTransService.returnMsg('Create Request Only', true), value: 'X',
   desc: this.errTransService.returnMsg('Admin Access', true)},
    {label: this.errTransService.returnMsg('Create and Approve Request', true), value: 'A',
    desc: this.errTransService.returnMsg('Budget Authority Approver Request', true)},
    {label: this.errTransService.returnMsg('Display Only', true), value: 'D'}, /* {label: 'No Authorization', value: 0} */];
  authDisplayOptsRequired;
  userCurrentLevels;
  specialAuths: {category: any, level: any, reasons: string, currentLv?: any}[]
    = [{category: null, level: null, reasons: null}];
  requestId = '';

  // Items that exist via Okta
  userFullName; // Replace with EAI ID eventually...
  userEid: string; // !important! - this is the logged-in user, use getUserEid(); to detect for proxyUser

  // Form-related data
  selectedUser: GenericUser;
  reportingManager: GenericUser;
  porCreationForm: FormGroup;
  authorityRequestForm: FormGroup;
  creationAuthForm: FormGroup;
  /* specialAuths: {category: any, level: any, reasons: string, currentLv?: any}[]
    = [{category: null, level: null, reasons: null}]; */
  chosenLevels = [];

  constructor(private adService: AdusersService, private oktaAuth: OktaAuthService, private formBuilder: FormBuilder,
              private optionsService: OrderRequestOptionsService, private budgetService: BudgetRequestService,
              private alertService: AlertService, private spinner: NgxSpinnerService, private router: Router,
              public errTransService: ErrorTranslationService,
              private dateTimeService: DateTimeService,
              private userPrefService: UserPrefService) {
    this.authorityRequestForm = this.formBuilder.group({
      authType: null, // yes 1, new 2, change 3
      authRegion: 'All',
      authComments: '',
      levelNeeded: null,

      needRegion: '2',

      budgetAuthority: false,
      createAccess: false,
      authForDisplay: 'X',
      needExceptional: '2',
    });

    /* this.creationAuthForm = this.formBuilder.group({
      creationAuth: {value: true, disabled: false}
    }); */
  }

  async ngOnInit() {
    this.spinner.show();
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    this.dateFormat = await this.dateTimeService.getDateFormat();
    await this.userPrefService.getProfileFromCache();
    if (this.userPrefService.cachedUserPrefEntity && this.userPrefService.cachedUserPrefEntity.userPreference) {
      this.numberFormat = this.userPrefService.cachedUserPrefEntity.userPreference.numberFormat;
    }
    const userClaims = await this.oktaAuth.getUser();
    this.userEid = userClaims.preferred_username;
    this.hrUsers = await this.adService.getHr().toPromise();
    this.adUsers = await this.adService.getAll().toPromise();
    if (localStorage.getItem('proxyUsername')) {
      try {
        this.userFullName = [this.adUsers.find(obj => obj.ID === Number(localStorage.getItem('proxyUserID'))).firstname,
        this.adUsers.find(obj => obj.ID === Number(localStorage.getItem('proxyUserID'))).lastname];
      } catch (error) {
        this.alertService.error(this.errTransService.returnMsg('cantFindADProxy'));
      }
    } else {
      this.userFullName = [userClaims.given_name, userClaims.family_name];
    }
    this.costCenterOptions = await this.optionsService.getCostCenter().toPromise();
    this.companyOptions = await this.optionsService.getCompany().toPromise();
    this.categoryOptions = await this.optionsService.getCategories().toPromise();
    this.titleOptions = await this.budgetService.getTitles().toPromise();
    this.constructAuthOptions();
    this.titleOptions.unshift({
      id: 0,
      title: this.errTransService.returnMsg('noAuth'),
      region: 'N/A',
      startrange: 0,
      endrange: 0,
      level: 0
    });
    this.regionOptions = await this.budgetService.getRegions().toPromise();
    this.initializeChosenCategories();
    this.spinner.hide();
  }

  constructAuthOptions() {
    for (const title of this.titleOptions) { // only push first of each endrange
      if (title === this.titleOptions.find(x => x.endrange === title.endrange)) {
        this.rangeOptions.push(title);
      }
    }
  }

  ngDoCheck(): void {

  }

  initializeChosenCategories() {
    this.chosenLevels = [];
    for (const category of this.categoryOptions) {
      this.chosenLevels.push(0);
    }
  }

  private resetUserForms() {
    this.authorityRequestForm.patchValue({
      needExceptional: '2',
      authRegion: 'All',
      authComments: '',
      levelNeeded: null
    });
    this.specialAuths = [{category: null, level: null, reasons: null}];
    this.initializeChosenCategories();
  }

  async onRequesterChange(selected: any) {
    this.alertService.clear();
    this.resetUserForms();
    this.onFormChange(); // We can call it first here, too many return early scenarios
    if (!selected) {
      this.nullifyUser();
      return;
    }
    const id = new GenericUser(selected);
    if (this.authorityRequestForm.controls.authType.value === '3') {
      // populate missing fields from AD table since they were removed from HR table
      try {
        const tempAdUser = this.adUsers.find(obj => obj.employeeId === id.employeeID);
        id.managerID = tempAdUser.supervisorId;
        id.costCenterCode = tempAdUser.costCenterCode;
        id.companyCode = tempAdUser.companyCode;
      } catch (error) {
        console.log(error);
        this.alertService.error(this.errTransService.returnMsg('cantFindAD'));
        this.nullifyUser();
        return;
      }
    }
    let selectedUserAdminAccess;
    const validStatus  = 'success';
    await this.budgetService.validateUser(id.employeeID/* , this.authorityRequestForm.controls.authType.value */).toPromise().then(res => {
      selectedUserAdminAccess = res.adminAccess;
     }).catch(err => {
      console.log(err);
     });
    await this.budgetService.getUserCurrentLevels(id.employeeID).toPromise().then(x => {
       console.log(x);
       this.userCurrentLevels = x;
     }).catch(err => {
       this.userCurrentLevels = undefined;
       // this.alertService.error('Unable to find current levels for the selected user.');
       console.log(err);
     });

    if (validStatus.toLowerCase() !== 'success') {
      this.alertService.error(validStatus);
      this.nullifyUser();
      return;
    }

    await this.userPrefService.getRegion(id.employeeID).toPromise().then(res => {
      if (res) {
        this.authorityRequestForm.patchValue({authRegion: res});
        this.selectedUserRegion = res;
      }
    }).catch(err => {
      console.log(err);
      this.alertService.warn(this.errTransService.returnMsg('cantRegion'), {autoClose: true});
    });

    this.selectedUser = id;
    this.selectedUser.adminAccess = selectedUserAdminAccess;
    const temp = id.managerID;
    const temp2 = this.adUsers.find(usr => usr.employeeId === temp);
    if (!temp2) {
      this.alertService.error(this.errTransService.returnMsg('noMgr'));
      this.nullifyUser();
      return;
    }
    this.reportingManager = new GenericUser(temp2);
    // tslint:disable-next-line: triple-equals
    this.reportingManagerCompany = this.companyOptions.find(obj => obj.companyCode == this.reportingManager.companyCode).name;
    const tempHRManager = this.hrUsers.find(obj => obj.employeeID === this.reportingManager.employeeID);
    if (tempHRManager) {
      await this.budgetService.getRequesterAuthority(tempHRManager.employeeID).toPromise().then(res => {
        if (res === null) {
          this.reportingManagerLevel = 0;
        } else {
          this.reportingManagerLevel = res.level;
        }
      }).catch(err => {
        console.log(err);
        this.reportingManagerLevel = 0;
      });
    }
    await this.userPrefService.getRegion(this.reportingManager.employeeID).toPromise().then(res => {
      if (res) {
        this.reportingManagerRegion = res;
      }
    }).catch(err => {
      console.log(err);
      this.reportingManagerRegion = null;
    });
    // tslint:disable-next-line: triple-equals
    this.selectedUserCompany = this.companyOptions.find(obj => obj.companyCode == this.selectedUser.companyCode).name;
    // tslint:disable-next-line: triple-equals
    const temp4 = this.costCenterOptions.find(obj => obj.code == this.selectedUser.costCenterCode);
    this.selectedUserCostCenter = temp4.name + ' - ' + temp4.code;
    /* const temp3 = this.hrUsers.find(obj => obj.employeeID === this.selectedUser.employeeID);
    this.selectedUserDefaultLevel = temp3 && temp3.defaultLevel || 0; */
    // tslint:disable-next-line: triple-equals
    await this.budgetService.getRequesterAuthority(id.employeeID).toPromise().then(res => {
        if (res === null) {
          this.selectedUserDefaultLevel = 0;
        } else {
          this.selectedUserDefaultLevel = res.level;
        }
      }).catch(err => {
        console.log(err);
        this.selectedUserDefaultLevel = 0;
      });
    if (this.hrUsers.find(obj => obj.employeeID === id.employeeID)) {
      this.handleDefaultsHR(this.hrUsers.find(obj => obj.employeeID === id.employeeID));
    } else {
      this.handleDefaultsNotHR();
    }
  }

  handleDefaultsNotHR() {
    this.authorityRequestForm.controls.authRegion.patchValue(this.regionOptions[0]);
    this.authorityRequestForm.controls.budgetAuthority.patchValue(false);
    this.authorityRequestForm.controls.levelNeeded.patchValue(this.titleOptions[0]);
    this.onAuthLevelChange();
    this.authorityRequestForm.controls.needExceptional.patchValue('2');
    this.authorityRequestForm.controls.authForDisplay.patchValue('X');
  }

  handleDefaultsHR(hrUser: HrUser) {
    const spcFuncCheck = this.userCurrentLevels[0].endRange;
    for (const level of this.userCurrentLevels) { // must be defined by now
      if (level.endRange) {
        this.authorityRequestForm.controls.budgetAuthority.patchValue(true);
        if (level.endRange !== spcFuncCheck) {
          this.authorityRequestForm.controls.needExceptional.patchValue('2');
        }
      }
      if (this.authorityRequestForm.controls.budgetAuthority.value === true) {
        this.authorityRequestForm.controls.levelNeeded.patchValue(this.defaultLevelFromCat1(this.userCurrentLevels[0]));
      } else {
        this.authorityRequestForm.controls.levelNeeded.patchValue(this.titleOptions[0]);
      }
    }
    this.authorityRequestForm.controls.authForDisplay.patchValue('A');
  }

  defaultLevelFromCat1(currentLv1): any {
    if (currentLv1.endRange) {
      const obj = this.titleOptions.find(x => x.endrange === currentLv1.endRange);
      if (obj) {
        return obj;
      } else {
        return null;
      }
    } else {
      return this.titleOptions[0];
    }
  }

  /* async validateUser() {

  } */

  private nullifyUser() {
    this.selectedUser = null;
    this.reportingManager = null;
    this.reportingManagerCompany = null;
    this.reportingManagerRegion = null;
    this.reportingManagerLevel = null;
    this.selectedUserCompany = null;
    this.selectedUserDefaultLevel = null;
    this.selectedUserCostCenter = null;
    if (this.ngSelect) {
      this.ngSelect.writeValue(null);
    }
  }

  onAddSpecialRow() {
    this.onFormChange();
    this.specialAuths.push(
      {category: null, level: null, reasons: null}
    );
  }

  onRemoveSpecialRow(rowIndex) {
    this.onFormChange();
    this.specialAuths.splice(rowIndex, 1);
  }

  returnUserList(): Array<any> {
    // tslint:disable-next-line: triple-equals
    switch (this.authorityRequestForm.controls.authType.value) {
      case '1':
        return this.adUsers;
      case '2':
        return this.adUsers;
      case '3':
        return this.hrUsers;
      default:
        return this.adUsers;
    }
  }

  returnBindId(): string {
    // tslint:disable-next-line: triple-equals
    if (this.authorityRequestForm.controls.authType.value == 3) {
      return 'id';
    } else {
      return 'ID';
    }
  }

  returnBindLabel(): string {
    // tslint:disable-next-line: triple-equals
    if (this.authorityRequestForm.controls.authType.value == 3) {
      return 'firstName';
    } else {
      return 'firstname';
    }
  }

  onAuthLevelChange() {
    let index = 0;
    for (const auth of this.chosenLevels) {
      this.chosenLevels[index] = this.authorityRequestForm.controls.levelNeeded.value.id;
      index ++;
    }
    this.onFormChange();
  }

  userSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    const searchMe = new RegExp(term);
    // tslint:disable-next-line: triple-equals
    if (this.authorityRequestForm.controls.authType.value == 3) {
      if (item) {
        const searchable = '' + item.firstName + ' ' + item.lastName + ' - ' + item.employeeID;
        return String(searchable.toLowerCase()).match(searchMe) !== null;
      }
    } else {
      if (item) {
        const searchable = '' + item.firstname + ' ' + item.lastname + ' - ' + item.employeeId;
        return String(searchable.toLowerCase()).match(searchMe) !== null;
      }
    }
  }

  async onReviewClick() {
    this.alertService.clear();
    if (!this.validateForm()) {
      return;
    }
    const data = this.constructRequestDetails('REVIEW');
    /* const region = this.authorityRequestForm.controls.authRegion.value; */
    this.spinner.show();
    await this.budgetService.reviewRequest(this.selectedUser.employeeID, /* region , */ data).toPromise().then(res => {
      this.hierarchy = res.hierarchy;
      this.requestId = res.budgetReqId;
    }).catch(err => {
      console.log(err);
      this.alertService.error(err && err.error && err.error.message || this.errTransService.returnMsg('reqProcessErr'));
    });
    this.spinner.hide();
  }

  constructRequestDetails(mode?: string): any {
    const dateTime = new Date(Date.now()).toUTCString();
    // tslint:disable-next-line: triple-equals
    const costCenterTemp = this.costCenterOptions.find(obj => obj.code == this.selectedUser.costCenterCode);
    const sendData: any = {
      /* authorizationLevel: this.authorityRequestForm.controls.levelNeeded.value &&
        this.authorityRequestForm.controls.levelNeeded.value.id || 0, */
      // budgetAuthority: this.authorityRequestForm.controls.budgetAuthority.value ? 'yes' : 'no',
      authorizationAccess: this.authorityRequestForm.controls.authForDisplay.value === 0 ? null :
        this.authorityRequestForm.controls.authForDisplay.value.toUpperCase(),
      changedBy: this.getUserAdId(),
      comments: [
        {
          adddate: dateTime,
          addwho: this.getUserAdId(),
          comment: this.authorityRequestForm.controls.authComments.value
        }
      ],
      company: this.selectedUser.companyCode,
      costcenterId: costCenterTemp ? costCenterTemp.id : 0,
      createdBy: this.getUserAdId(),
      creationDate: dateTime,
      creationTime: dateTime,
      currentLevel: this.selectedUserDefaultLevel || 0,
      mode,
      region: this.authorityRequestForm.controls.authForDisplay.value &&
        this.authorityRequestForm.controls.needRegion.value === '1' ?
        this.authorityRequestForm.controls.authRegion.value : /* this.selectedUserRegion || */ null,
      spclFunctionality: this.authorityRequestForm.controls.authForDisplay.value === 'A' &&
        this.authorityRequestForm.controls.needExceptional.value === '1' ? true : false
    };
    if (this.authorityRequestForm.controls.needExceptional.value === '1') {
      sendData.purchaseCategory = this.constructSpecialAuthJSON();
    }
    if (this.requestId) {
      sendData.brId = this.requestId;
    }
    return sendData;
  }

  constructPurchaseCategoryJSON(): any[] {
    const sendData = [];
    let index = 0;
    const eid = this.getUserEid();
    for (const level of this.chosenLevels) {
      sendData.push({
        comment: 'Chosen By: ' + eid,
        levelId: level,
        pcId: this.categoryOptions[index].ID
      });
      index++;
    }
    return sendData;
  }

  async onSubmitClick() {
    if (!this.validateForm()) {
      return;
    }
    this.spinner.show();
    /* const region = this.authorityRequestForm.controls.authRegion.value; */
    await this.budgetService.submitRequest(this.selectedUser.employeeID, /* region, */ this.requestId,
     'SUBMIT').toPromise().then(success => {
      /* if (success.toLowerCase() !== 'success') {
        this.alertService.warn(success, {keepAfterRouteChange: true});
      } */
      this.router.navigateByUrl('/barequestview/' + this.requestId);
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('reqProcessErr'));
    });
    this.spinner.hide();
  }

  determineSpecialFunctionality() {
    if (this.authorityRequestForm.controls.needExceptional.value === '1') {
      for (const auth of this.chosenLevels) {
        if (auth !== this.authorityRequestForm.controls.levelNeeded.value.id) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

/*   determineLegacyRequestType(): number {
    // 1 = admin, 2 = new, 3 = change???
    return 0;
  } */

  private constructSpecialAuthJSON(): Array<any> {
    const returnArr = [];
    for (const auth of this.specialAuths) {
      returnArr.push({
        comment: 'Selected by: ' + this.getUserEid(),
        levelId: auth.level.id,
        pcId: auth.category
      });
    }
    return returnArr;
  }

  private getUserEid(): string {
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    const temp = localStorage.getItem('proxyEmployeeID');
    if (temp) {
      return temp;
    } else {
      return this.userEid;
    }
  }

  private getUserAdId(): number {
    const eid = this.getUserEid();
    const returnMe = this.adUsers.find(obj => obj.employeeId === eid);
    if (returnMe) {
      return returnMe.ID;
    } else {
      console.log('User not found in AD table.');
      return 0;
    }
  }

  displayTitleFromLevel(num): string {
    // tslint:disable-next-line: triple-equals
    const temp = this.titleOptions.find(obj => obj.level == num);
    if (!temp) {
      return 'Not found.';
    }
    return temp.title || 'Not found.';
  }

  displayEndRangeFromLevel(num): string {
    if (!this.titleOptions) {
      return 'Loading...';
    }
    // tslint:disable-next-line: triple-equals
    const temp = this.titleOptions.find(obj => obj.level == num);
    if (!temp) {
      return 'Not found.';
    }
    return String(temp.endrange || temp.endrange === 0 ? temp.endrange : 'Not found.');
  }

  private returnLevelFromLevelStr(str: string): number {
    if (!str) {
      return null;
    }
    const num = Number(str.split('L')[1]);
    return num;
  }

  displayUserCurrentCatLevel(category: number): string {
    if (!this.titleOptions || !category || !this.userCurrentLevels) {
      return null;
    }
    const usrCat = this.userCurrentLevels.find(obj => obj.category === category);
    if (usrCat && usrCat.level) {
      const num = Number(usrCat.level.split('L')[1]);
      // tslint:disable-next-line: triple-equals
      const temp = this.titleOptions.find(obj => obj.level == num);
      if (!temp) {
        return 'Not found.';
      }
      return String(temp.endrange || temp.endrange === 0 ? temp.endrange : 'Not found.');
    } else {
      return null;
    }
  }

  handleTitleDisplay(entry): string {
    // console.log('handling!'); console.log(entry);
    if (!entry.currentLv) {
      return;
    }
    if (!entry.currentLv.level && entry.currentLv.message) {
      return entry.currentLv.message;
    }
    return this.displayTitleFromLevelStr(entry.currentLv.level);
  }

  private displayTitleFromLevelStr(str): string {
    if (!str) { return ''; }
    const num = str.substring(1);
    return this.displayTitleFromLevel(num);
  }

  async getCurrentLevelFromCategory(authObj, event) {
    /* this.spinner.show();
    this.onFormChange();
    console.log(event);
    if (!event) {
      authObj.currentLv = null;
      return;
    }
    // tslint:disable-next-line: triple-equals
    if (this.authorityRequestForm.controls.authType.value == 3) {
      await this.budgetService.checkCurrentLevel(event.ID, this.selectedUser.employeeID).toPromise().then(res => {
        authObj.currentLv = res;
      }).catch(err => {
        console.log(err);
        this.alertService.error('Unable to retireve current authority level from API.');
        authObj.currentLv = null;
      });
    } else {
      authObj.currentLv = null;
    }
    this.spinner.hide(); */
  }

  /* hideLevelDuplicates(item): boolean { // Only returns true for first item w/ listed endrange in the list
    if (item === this.titleOptions.find(obj => obj.endrange === item.endrange)) {
      return true;
    }
    return false;
  } */


  private validateForm(): boolean {
    let errMsg = this.errTransService.returnMsg('errinReq');
    let flag = true;
    if (!this.authorityRequestForm.controls.authForDisplay.value) {
      errMsg += '\n' + this.errTransService.returnMsg('chooseReqType');
      flag = false;
    }
    if (this.selectedUserRegion && this.authorityRequestForm.controls.needRegion.value !== '2') {
      if (this.selectedUserRegion === this.authorityRequestForm.controls.authRegion.value) {
        flag = false;
        errMsg += '\n' + this.errTransService.returnMsg('sameAccess');
      }
      if (!this.authorityRequestForm.controls.authRegion.value) {
        flag = false;
        errMsg += '\n' + this.errTransService.returnMsg('selReg');
      }
    }
    if (this.authorityRequestForm.controls.authForDisplay.value === 'X' && this.selectedUser.adminAccess) {
      if (this.authorityRequestForm.controls.needRegion.value === '2' ||
        (this.authorityRequestForm.controls.needRegion.value !== '2' && this.selectedUserRegion
        === this.authorityRequestForm.controls.authRegion.value)) {
        flag = false;
        errMsg += '\n' + this.errTransService.returnMsg('haveAuth');
      }
    }
    if (this.authorityRequestForm.controls.needExceptional.value === '1') {
      for (const auth of this.specialAuths) {
        if (!auth.level || !auth.level.level || !auth.category) {
          errMsg += '\n' + this.errTransService.returnMsg('spclFuncBlank');
          flag = false;
          continue;
        }
        const currentLv = this.userCurrentLevels.find(obj => obj.category === auth.category);
        if (currentLv && currentLv.level) {
          if (auth.level.level === this.returnLevelFromLevelStr(currentLv.level)) {
            flag = false;
            errMsg += '\n' +  this.errTransService.returnMsgWithParam('sameCat',
            [ this.categoryOptions.find(obj => obj.ID === auth.category).Category]);
          }
        }
      }
    }
    if (!flag) {
      this.alertService.error(this.replaceNewline(errMsg));
    }
    return flag;
  }

  replaceNewline(msg: string): string {
    return msg.replace(/\n/g, '<br>&nbsp;');
  }

  onBudgetAuthChange() {
    if (this.authorityRequestForm.controls.budgetAuthority.value) {
      this.authDisplayOptsRequired = [{label: this.errTransService.returnMsg('Create/Change', true), value: 'A'},
      {label: this.errTransService.returnMsg('Display Only', true), value: 'D'}];
      this.authorityRequestForm.controls.authForDisplay.patchValue('A');
      this.authorityRequestForm.controls.levelNeeded.enable();
      this.authorityRequestForm.controls.needExceptional.enable();
    } else {
      this.authDisplayOptsRequired = undefined;
      this.authorityRequestForm.controls.authForDisplay.patchValue(0);
      this.authorityRequestForm.controls.levelNeeded.patchValue(this.titleOptions[0]);
      this.authorityRequestForm.controls.levelNeeded.disable();
      this.authorityRequestForm.controls.needExceptional.patchValue('2');
      this.authorityRequestForm.controls.needExceptional.disable();
    }
    this.onFormChange();
  }

  async onCancelClick() {
    const x = confirm(this.errTransService.returnMsg('cancelbudget') + '#' + this.requestId + '?');
    if (x) {
      await this.budgetService.cancelRequest(this.requestId).toPromise().then(res => {
        console.log(res);
        this.router.navigateByUrl('home');
      }).catch(err => {
        console.log(err);
        this.alertService.error(this.errTransService.returnMsg('problemToDelete'));
      });
    }
  }

  onFormChange() {
    this.hierarchy = []; // Force users to re-review their order before submission
  }

}
