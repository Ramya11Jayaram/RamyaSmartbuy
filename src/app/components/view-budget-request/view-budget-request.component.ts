import { Component, OnInit } from '@angular/core';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BudgetRequestService } from 'src/app/services/budget-request/budget-request.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from 'src/app/_alert/alert.service';
import { BudgetRequest } from 'src/app/services/budget-request/models/budget-request';
import { OktaAuthService } from '@okta/okta-angular';
import { environment } from 'src/environments/environment';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { AuthTitle } from 'src/app/services/budget-request/models/auth-title';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';

@Component({
  selector: 'app-view-budget-request',
  templateUrl: './view-budget-request.component.html',
  styleUrls: ['./view-budget-request.component.css']
})
export class ViewBudgetRequestComponent implements OnInit {
  // variables that store information on the request being viewed
  requestId: string;
  requestInfo: BudgetRequest;
  needExceptional = 2;
  specialAuths: {category: any, level: any}[] = [];
  userCurrentLevels;
  hierarchy: Array<any> = [];
  loadGrid = []; // comments (copied format from view budget request component)
  uneditedRequest: any;
  uneditedLevels: {category: number, level: number, oldLevel?:
    {startRange: string, endRange: string, level: any, message?: string}, validated?: boolean}[] = [];
  uneditedExceptional = 1;
  uneditedHeaderAuthLevel;

  // variables that exist for display purposes
  headerAuthLevel;
  userLevels: {category: number, level: number, oldLevel?:
      {startRange: string, endRange: string, level: any, message?: string}, endrange?: number, validated?: boolean}[] = [];
  editing = {table: false, details: false};
  contentEdited = false;
  createdBy: {title: string, company: string, costCenter: string, region: string} =
    {title: undefined, company: undefined, costCenter: undefined, region: undefined};
  createdForRegion: string;
  chooseRegion = '2';
  levelNotErrorFlag = false;

  /* Note: userLevels, uneditedLevels, etc... Exist for F1/F2 view ONLY. Managager view, etc.
      will instead make use of specialAuths[]. */

  // Variables that store form-related data to be submitted:
  sendEmailForm: FormGroup;
  internalNotes: string;
  hierarchyId: number;
  substitutor;
  actualApproverAdid: number;
  selectedUserDefaultLevel;

  // Variables that store information on the current logged-in user:
  userClaims;
  userPermissions = {canApproveReject: false, canAskQuestion: false, canEdit: false, canSeeTable: false};

  // Lists of options from API
  adUsers: AdUser[] = [];
  costCenterOptions: any;
  companyOptions: any;
  categoryOptions: any;
  titleOptions: any;
  rangeOptions: AuthTitle[] = [];
  regionOptions: any;

  dateFormat = '';
  numberFormat = '';
  dateTime = 'MM/dd/yyyy, h:mm:ss a z';

  // Variables that help with edit() functions
  cachedUserLevels: {category: number, level: number, oldLevel?:
    {startRange: string, endRange: string, level: any, message?: string}, endrange?: number, validated?: boolean}[] = [];

  // Error flags to manually resolve exception handling issues
  reloadErr = false;


  constructor(private formBuilder: FormBuilder, private budgetService: BudgetRequestService, private route: ActivatedRoute,
              private spinner: NgxSpinnerService, private alertService: AlertService, private oktaAuth: OktaAuthService,
              private userService: AdusersService, private router: Router, private optionsService: OrderRequestOptionsService,
              public errTransService: ErrorTranslationService,
              private userPrefService: UserPrefService, private dateTimeService: DateTimeService) {
    this.sendEmailForm = this.formBuilder.group({
      emailTo: ['', Validators.required],
      emailCc: null,
      emailSubject: ['', Validators.required],
      emailMsg: ['', Validators.required]
    });
   }

  async ngOnInit() {
    this.spinner.show();
    this.dateFormat = await this.dateTimeService.getDateFormat();
    await this.userPrefService.getProfileFromCache();
    if (this.userPrefService.cachedUserPrefEntity && this.userPrefService.cachedUserPrefEntity.userPreference) {
      this.numberFormat = this.userPrefService.cachedUserPrefEntity.userPreference.numberFormat;
    }
    this.dateTime = this.dateFormat + ', ' + await this.dateTimeService.getTimeFormat();
    this.userClaims = await this.oktaAuth.getUser();
    this.requestId = this.route.snapshot.params.id;
    this.sendEmailForm.controls.emailSubject.setValue('Need clarification on Budget Authority Request #' + this.requestId);
    await this.loadRequest();
    await this.loadComments();
    await this.getUsers();
    this.determineUserStatus();
    this.chooseRegion = this.requestInfo.region === this.createdForRegion ? '2' : '1';
    await this.loadOptions();
    await this.loadCreatedByInfo();
    if (this.userPermissions.canSeeTable) {
      await this.calculateRequesterLevels();
    } else {
      await this.generateFormForManagerAccess();
    }
    await this.budgetService.getRequesterAuthority(this.requestInfo.employeeId).toPromise().then(res => {
      if (res === null) {
        this.selectedUserDefaultLevel = 0;
      } else {
        this.selectedUserDefaultLevel = res.level;
      }
    }).catch(err => {
      console.log(err);
      this.selectedUserDefaultLevel = 0;
    });
    this.constructAuthOptions();
    this.spinner.hide();
  }

  constructAuthOptions() {
    for (const title of this.titleOptions) { // only push first of each endrange
      if (title === this.titleOptions.find(x => x.endrange === title.endrange)) {
        this.rangeOptions.push(title);
      }
    }
  }

  private async loadCreatedByInfo() {
    await this.userPrefService.getRegion(this.getEidFromAdId(this.requestInfo.createdById)).toPromise().then(res => {
      if (res) {
        this.createdBy.region = res;
      }
    }).catch(err => {
      console.log(err);
      this.createdBy.region = 'Not found';
      // this.alertService.warn('Unable to determine region for the selected user.', {autoClose: true});
    });

    await this.userPrefService.getRegion(this.requestInfo.employeeId).toPromise().then(res => {
      if (res) {
        this.createdForRegion = res;
      }
    }).catch(err => {
      console.log(err);
      this.createdForRegion = 'Not found';
      // this.alertService.warn('Unable to determine region for the selected user.', {autoClose: true});
    });

    const tmp = this.adUsers.find(x => x.ID === this.requestInfo.createdById);
    if (tmp) {
      this.createdBy.title = tmp.title || 'Not found';
      this.createdBy.costCenter = this.costCenterCodeToCcDisplay(tmp.costCenterCode) || 'Not found';
      this.createdBy.company = this.companyCodeToCompanyString(tmp.companyCode) || 'Not found';
    }
  }

  private async loadComments() {
    this.budgetService.getComments(this.requestId).toPromise().then(res => {
      this.loadGrid = res;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('reqComment'));
    });
  }

  private determineUserStatus() {
    const myId = this.getUserAdId();
    for (const item of this.hierarchy) {
      if ((myId === item.adId && this.requestInfo.docStatus !== 'Approved') ||
        (item.substitutor && myId === item.substitutor.adId && this.requestInfo.docStatus !== 'Approved')) {
        console.log('Approver.');
        if (item.name.includes('#')) {
          console.log('Active approver');
          this.userPermissions.canApproveReject = true;
          this.userPermissions.canAskQuestion = true;
          this.userPermissions.canEdit = true;
        }
        this.hierarchyId = item.hierarchyId;
        this.substitutor = item.substitutor;
        this.actualApproverAdid = item.actual_approver_adId;
      }
      if ((myId === item.adId && item.fieldName) || (item.substitutor && myId === item.substitutor.adId && item.fieldName)) {
        if (item.fieldName.toLowerCase().includes('finance')) {
          console.log('f1/f2');
          this.userPermissions.canSeeTable = true;
        }
      }
    }
  }

  async loadOptions() {
    this.costCenterOptions = await this.optionsService.getCostCenter().toPromise();
    this.companyOptions = await this.optionsService.getCompany().toPromise();
    this.categoryOptions = await this.optionsService.getCategories().toPromise();
    this.titleOptions = await this.budgetService.getTitles().toPromise();
    this.titleOptions.unshift({
      id: 0,
      title: this.errTransService.returnMsg('noAuth'),
      region: 'N/A',
      startrange: 0,
      endrange: 0,
      level: 0
    });
    this.regionOptions = await this.budgetService.getRegions().toPromise();
  }

  async loadRequest() {
    this.reloadErr = false;
    await this.budgetService.viewRequest(this.requestId).toPromise().then(res => {
      console.log(res);
      res.budgetRequest.spclFunctionalAuthorityRequested = res.budgetRequest.spclFunctionalAuthorityRequested === 'true' ?
        true : false;
      if (!res.budgetRequest.purchaseCategory || !res.budgetRequest.purchaseCategory[0]) {
        this.needExceptional = 2;
        this.uneditedExceptional = 2;
      }
      this.uneditedRequest = res;
      this.hierarchy = res.hierarchy.hierarchy;
      this.requestInfo = res.budgetRequest;
      if (this.requestInfo.purchaseCategory && this.requestInfo.purchaseCategory[0]) {
        if (this.requestInfo.purchaseCategory.find(obj => obj.levelId !== 0)
          && this.requestInfo.spclFunctionalAuthorityRequested === true) {
          this.needExceptional = 1;
        } else {
          this.needExceptional = 2;
        }
      }
      this.headerAuthLevel = Number(this.requestInfo.authorizationLevel); // API returns this as a string
      this.uneditedHeaderAuthLevel = this.headerAuthLevel;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('cantFindReq') + ' ' + this.requestId);
      this.reloadErr = true;
      this.spinner.hide();
    });
  }

  async getUsers() {
    await this.userService.getAll().toPromise().then(res => {
      this.adUsers = res;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('adAPI'));
    });
  }

  async onSendEmail(modal) {
    if (!this.emailValidate()) {
      this.alertService.error(this.errTransService.returnMsg('validDetails'));
      return;
    }
    const emailData = {
      content: this.sendEmailForm.controls.emailMsg.value,
      from: this.getUserEmail(),
      mailArray: this.sendEmailForm.controls.emailTo.value,
      mailCCArray: this.sendEmailForm.controls.emailCc.value,
      model: {}, // TODO: what is this? what does it mean?
      subject: this.sendEmailForm.controls.emailSubject.value,
      to: this.sendEmailForm.controls.emailTo.value[0] // TODO: Why is this here when mailArray is already taking care of the 'to' job?
    };
    await this.budgetService.askQuestion(this.requestId, this.getUserEid(), JSON.stringify(emailData)).toPromise().then(res => {
      modal.close();
    }).catch(err => {
      this.alertService.error(this.errTransService.returnMsg('errAPI'));
      console.log(err);
    });
  }

  emailValidate(): boolean { // validate email
    return this.sendEmailForm.valid;
  }

  private transformRequestToEditData(): any {
    const tmp = this.requestInfo;
    const sendData: any = {
      authorizationLevel: Number(this.headerAuthLevel),
      changedBy: this.getUserAdId(),
      comments: {
        comment: this.internalNotes ? this.internalNotes : 'Updated by ' + this.getUserEid(),
        adddate: new Date(Date.now()).toUTCString(), // .toISOString(),
        addwho: this.getUserAdId(),
        brId: this.requestId
      },
      currentLevel: this.selectedUserDefaultLevel,
      authorizationAccess: tmp.authorizationAccess,
      requestType: tmp.requestType,
      purchaseCategory: !this.userPermissions.canSeeTable ? this.constructSpecialAuthJSON() : this.constructUserLevelsJSON(),
      region: this.chooseRegion !== '1' ? this.createdForRegion : tmp.region,
      requester: tmp.employeeId,
      spclFunctionality: String(this.userPermissions.canSeeTable ? this.needExceptionalToBoolean() :
        this.requestInfo.spclFunctionalAuthorityRequested)
    };
    sendData.changedate = new Date(Date.now()).toUTCString(); // .toISOString();
    sendData.changetime = new Date(Date.now()).toUTCString(); // .toISOString();
    sendData.id = this.requestId;
    sendData.currentHierarchy = this.hierarchy;
    return sendData;
  }

  private transformRequestToSendData(): any {
    const tmp = this.requestInfo;
    const sendData: any = {
      actual_approver_adId: this.actualApproverAdid || this.getUserAdId(),
      comments: [{
        comment: this.internalNotes,
        adddate: new Date(Date.now()).toUTCString(), // .toISOString(),
        addwho: this.getUserAdId(),
        brId: this.requestId
      }],
      hierarchyId: this.hierarchyId,
      option: tmp.requestType,
      purchaseCategory: tmp.purchaseCategory,
      substitutor: this.substitutor
    };
    return sendData;
  }

  private constructUserLevelsJSON(): Array<any> {
    const returnArr = [];
    for (const level of this.userLevels) {
      returnArr.push({
        comment: 'Reviewed/Selected by: ' + this.getUserEid(),
        levelId: level.level,
        pcId: level.category
      });
    }
    return returnArr;
  }

  private constructSpecialAuthJSON(): Array<any> {
    const returnArr = [];
    if (!this.requestInfo.spclFunctionalAuthorityRequested) {
      return returnArr;
    }
    for (const auth of this.specialAuths) {
      returnArr.push({
        comment: 'Selected by: ' + this.getUserEid(),
        levelId: auth.level.id,
        pcId: auth.category
      });
    }
    return returnArr;
  }

  private companyCodeFromName(str: string): number {
    const tmp = this.companyOptions.find(x => x.name === str);
    if (tmp) {
      return tmp.companyCode;
    } else {
      return 0;
    }
  }

  private needExceptionalToBoolean(): boolean {
    // tslint:disable-next-line: triple-equals
    if (this.needExceptional == 1) {
      return true;
    } else {
      return false;
    }
  }

  private costCenterNameToId(str: string): number {
    const tmp = this.costCenterOptions.find(x => x.name === str);
    if (tmp) {
      return tmp.id;
    } else {
      return 0;
    }
  }

  costCenterNameToCcDisplay(str: string): string {
    if (!this.costCenterOptions) { return; }
    const tmp = this.costCenterOptions.find(x => x.name === str);
    if (tmp) {
      return tmp.name + ' - ' + tmp.code;
    }
  }

  costCenterCodeToCcDisplay(code: number): string {
    if (!this.costCenterOptions) { return; }
    const tmp = this.costCenterOptions.find(x => x.code === code);
    if (tmp) {
      return tmp.name + ' - ' + tmp.code;
    }
  }

  companyCodeToCompanyString(code: number): string {
    if (!this.companyOptions) { return; }
    const tmp = this.companyOptions.find(x => x.companyCode === code);
    if (tmp) {
      return tmp.name;
    }
  }

  async onApproveClick() {
    this.spinner.show();
    await this.budgetService.validateRequest
      (this.requestInfo.employeeId, this.requestId, true, this.transformRequestToSendData())
      .toPromise().then(success => {
        this.spinner.hide();
        /* if (success.toLowerCase() !== 'success') {
          this.alertService.warn(success, {keepAfterRouteChange: true});
        } */
        this.router.navigateByUrl('/dash');
      }).catch(err => {
        console.log(err);
        this.spinner.hide();
        this.alertService.error(this.errTransService.returnMsg('apprErr'));
      });
  }

  async onRejectClick() {
    this.spinner.show();
    await this.budgetService.validateRequest(this.requestInfo.employeeId, this.requestId, false,
       this.transformRequestToSendData())
      .toPromise().then(success => {
        this.spinner.hide();
        this.router.navigateByUrl('/dash');
      }).catch(err => {
        console.log(err);
        this.spinner.hide();
        this.alertService.error(this.errTransService.returnMsg('errRejecting'));
      });
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
      return this.userClaims.preferred_username;
    }
  }

  private getEidFromAdId(usrId): string {
    if (!this.adUsers) {
      return null;
    }
    const tmp = this.adUsers.find(x => x.ID === usrId);
    if (tmp) {
      return tmp.employeeId;
    } else { return null; }
  }

  getAdIdFromEid(usrId): number {
    if (!this.adUsers) {
      return null;
    }
    const tmp = this.adUsers.find(x => x.employeeId === usrId);
    if (tmp) {
      return tmp.ID;
    } else { return null; }
  }

  private getUserAdId(): number {
    const eid = this.getUserEid();
    return this.adUsers.find(obj => obj.employeeId === eid).ID;
  }

  private getUserEmail(): string {
    const eid = this.getUserEid();
    return this.adUsers.find(obj => obj.employeeId === eid).email;
  }

  returnAuthRange(id): string {
    // console.log(id + typeof id);
    try {
      const title = this.titleOptions.find(obj => obj.id === id);
      return this.errTransService.returnMsg('upto') + ' $' + (title.endrange || 0);
    } catch (error) {
      return 'Error finding range.';
    }
  }

  returnRequestType(num: number): string {
    switch (num) {
      case 1:
        return this.errTransService.returnMsg('Create Request', true);
      case 2:
        return this.errTransService.returnMsg('Create and Approve Request', true);
      case 3:
        return this.errTransService.returnMsg('Create and Approve Request', true);
      case 4:
        return this.errTransService.returnMsg('Display Access', true);
      default:
        return this.errTransService.returnMsg('Loading...', true);
    }
  }

  returnCategoryName(ID: number): string {
    const temp = this.categoryOptions.find(obj => obj.ID === ID);
    if (temp) {
      return temp.Category;
    } else {
      return 'Error';
    }
  }

  private async calculateRequesterLevels() {
    for (const category of this.categoryOptions) {
      let exists;
      if (this.requestInfo.purchaseCategory) { // prevent application from hanging
        exists = this.requestInfo.purchaseCategory.find(obj => obj.pcId === category.ID);
      }
      if (exists) {
        this.userLevels.push({
          category: category.ID,
          level: Number(exists.levelId),
          endrange: this.convertLevelIdToEndrange(exists.levelId)
        });
      } else {
        this.userLevels.push({
          category: category.ID,
          level: null,
          endrange: null
        });
      }
    }
    await this.validateRequesterLevels();
    this.cachedUserLevels = JSON.parse(JSON.stringify(this.userLevels));
  }

  private async generateFormForManagerAccess() {
    let hasError = false;
    await this.budgetService.getUserCurrentLevels(this.requestInfo.employeeId).toPromise().then(x => {
      this.userCurrentLevels = x;
    }).catch(err => {
      console.log(err);
      this.userCurrentLevels = null;
      hasError = true;
    });
    for (const category of this.categoryOptions) {
      let exists;
      if (this.requestInfo.purchaseCategory) { // prevent application from hanging
        exists = this.requestInfo.purchaseCategory.find(obj => obj.pcId === category.ID);
      }
      if (exists) {
        this.specialAuths.push({
          category: category.ID,
          level: this.titleOptions.find(x => x.id === exists.levelId)
        });
      }
    }
    if (this.specialAuths.length < 1) {
      this.specialAuths.push(
        {category: null, level: null}
      );
    }
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

  convertLevelIdToEndrange(lId: number): number {
    const temp = this.titleOptions.find(obj => obj.id === lId);
    if (temp) {
      return temp.endrange || 0;
    } else {
      return 0;
    }
  }

  private async validateRequesterLevels() {
    console.log(this.userLevels);
    // this.spinner.show('brViewSpinner', {fullScreen: false});
    let hasError = false;
    let currentLevels;
    await this.budgetService.getUserCurrentLevels(this.requestInfo.employeeId).toPromise().then(x => {
      if (x && x.length === 1 && x[0].category === 0) {
        this.levelNotErrorFlag = true;
        currentLevels = [];
      } else {
        currentLevels = x;
      }
    }).catch(err => {
      console.log(err);
      currentLevels = [];
      hasError = true;
    });
    for (const level of this.userLevels) {
        level.oldLevel = currentLevels.find(x => x.category === level.category);
        // console.log (level.oldLevel, level.oldLevel.endRange, level.oldLevel.endRange.substring(1), level.endrange)
        // tslint:disable-next-line: triple-equals
        if ((level.oldLevel && level.oldLevel.endRange) && (Number(level.oldLevel.endRange.substring(1)) == level.endrange)) {
          level.validated = false; // 'Validated' means 'was changed' in this context... true will apply highlight
        } else {
          level.validated = true;
        }
    }
    if (hasError) {
      this.alertService.error(this.errTransService.returnMsg('levelVal'));
    }
    // this.spinner.hide('brViewSpinner');
    this.copyUneditedLevels();
  }

  private copyUneditedLevels() {
    this.uneditedLevels = JSON.parse(JSON.stringify(this.userLevels));
  }

  resetEdits() {
    this.spinner.show();
    this.userLevels = JSON.parse(JSON.stringify(this.uneditedLevels));
    this.hierarchy = this.uneditedRequest.hierarchy.hierarchy;
    this.requestInfo = JSON.parse(JSON.stringify(this.uneditedRequest.budgetRequest));
    this.contentEdited = false;
    this.needExceptional = this.uneditedExceptional;
    this.headerAuthLevel = this.uneditedHeaderAuthLevel;
    this.cachedUserLevels = JSON.parse(JSON.stringify(this.uneditedLevels));
    // tslint:disable-next-line: forin
    for (const prop in this.editing) {
      this.editing[prop] = false;
    }
    this.spinner.hide();
  }

  toggleEdit(what: string) {
    this.editing[what] = !this.editing[what];
  }

  /* onEditBaseLevel() {
    console.log(this.uneditedLevels);
    for (const level of this.userLevels) {
      if (level.level === this.headerAuthLevelSnapshot) { // Previous value, before change
        level.level = this.headerAuthLevel; // edit if not special functional authority
      }
    }
    this.headerAuthLevelSnapshot = this.headerAuthLevel; // Update snapshot now that logic is done
    this.onEdit();
  } */

  onEditTableLevel() {
    const cat1Level = this.userLevels.find(x => x.category === 1);
    const cat1OldLevel = this.cachedUserLevels.find(x => x.category === 1);
    if (cat1Level.level !== cat1OldLevel.level) {
      for (const entry of this.userLevels) {
        if (entry.level === cat1OldLevel.level || !entry.level) {
          entry.level = cat1Level.level;
        }
      }
    }
    this.cachedUserLevels = JSON.parse(JSON.stringify(this.userLevels));
    this.onEdit();
  }

  onEdit() {
    this.contentEdited = true;
    console.log(this.userLevels);
  }

  async submitUpdate() {
    this.validateEdits();
    console.log(this.userLevels);
    // this.requestInfo.changedBy = this.getUserAdId();
    const data: any = this.transformRequestToEditData();
    /* for (const prop in this.requestInfo) { // populate mising fields form transformrequest
      if (!data.hasOwnProperty(prop)) {
        data[prop] = this.requestInfo[prop];
      }
    } */
    await this.budgetService.updateRequest(data).toPromise().then(res => {
      this.resetEdits();
      this.reInit();
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('reqUpdateErr'));
    });
  }

  private async reInit() {
    this.levelNotErrorFlag = false;
    this.spinner.show();
    await this.loadRequest().catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('reqRetrieveErr'));
    });
    if (this.reloadErr) {
      this.resetEdits();
      return;
    }
    await this.loadComments();
    this.determineUserStatus();
    if (this.userPermissions.canSeeTable) {
      this.userLevels = [];
      await this.calculateRequesterLevels();
    } else {
      this.specialAuths = [];
      await this.generateFormForManagerAccess();
    }
    this.chooseRegion = this.requestInfo.region === this.createdForRegion ? '2' : '1';
    this.spinner.hide();
  }

  validateEdits() {
    this.needExceptional = 2;
    for (const level of this.userLevels) {
      if (level.level !== this.userLevels[0].level && level.level !== 0) {
        this.needExceptional = 1;
        break;
      }
    }
    this.requestInfo.purchaseCategory = [];
    for (const level of this.userLevels) {
          this.requestInfo.purchaseCategory.push({
            pcId: level.category,
            levelId: level.level || 0,
            comment: 'Updated by: ' + this.getUserEid()
          });
      }
  }

  enableAuthLevelSelect(): boolean {
    if (!this.headerAuthLevel) {
      return (this.headerAuthLevel === 0);
    } else {
      return true;
    }
  }

  sendHierarchyApprovalString(name): string {
    if (!name.name.includes('^') && name.name.includes('@')) {
      return 'Approved';
    } else if (name.name.includes('^') && !name.name.includes('@')) {
      return 'Rejected';
    } else if (name.name.includes('#') && !name.name.includes('^') &&
              !name.name.includes('@')) {
                return 'Pending Approval';
              }
  }

  onRemoveSpecialRow(rowIndex) {
    this.onEdit();
    this.specialAuths.splice(rowIndex, 1);
  }

  onAddSpecialRow() {
    this.onEdit();
    this.specialAuths.push(
      {category: null, level: null}
    );
  }

}
