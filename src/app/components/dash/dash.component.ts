import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OktaAuthService } from '@okta/okta-angular';
import { PODetailsService } from 'src/app/services/approval-details/podetails.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { BudgetRequestService } from 'src/app/services/budget-request/budget-request.service';
import { AlertService } from 'src/app/_alert/alert.service';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit {

  itemsPerPage = [10, 10, 10, 10, 10, 10, 10, 10, 10]; // initial items per page for all table
  dateFormat = '';
  showSettings = false;

  // Variables related to POR
  porRequestion: Array<any> = [];
  requestionBycreatedBy: Array<any> = [];
  porWaiting: Array<any> = [];
  porSubWaiting: Array<any> = [];
  porApprovedRejected: Array<any> = [];

  // Variables related to Budget Request
  brWaiting: Array<any> = [];
  brSubWaiting: Array<any> = [];
  brCreatedBy: Array<any> = [];
  brRequester: Array<any> = [];
  brApprovedRejected: Array<any> = [];

  // Other variables that store data from DB
  adUsers: Array<any> = [];
  allPrefs;

  // Variables that store information on the user
  userFullName: Array<any> = ['loading', '...'];
  userInfo = {adId: null, eaId: null};

  // Variables that manipulate the view
  poBRtoggle: FormGroup;
  poBRSectionsToggle = 'por';
  porInboxPref = [
    {id: 1, column: 'Company Code', visible: false, position: 2},
    {id: 2, column: 'Purchase Category', visible: false, position: 3},
    {id: 3, column: 'POR Brief Description', visible: false, position: 4},
    {id: 4, column: 'Creator', visible: true, position: 5},
    {id: 5, column: 'Requester', visible: true, position: 6},
    {id: 6, column: 'Created On', visible: true, position: 7},
    {id: 7, column: 'Vendor Name', visible: false, position: 8},
    {id: 8, column: 'Currency', visible: false, position: 9},
    {id: 9, column: 'Total Cost', visible: false, position: 10},
    {id: 10, column: 'Total Cost USD', visible: false, position: 11},
    {id: 11, column: 'Pending With', visible: false, position: 12},
    {id: 12, column: 'Pending Since', visible: false, position: 13},
    {id: 13, column: 'Status', visible: true, position: 14}
  ];
  d; z; r; m; x; brw; brs; brr; brc; bar; /* prevent tslint from giving errors */
  budgetTotal: number;

  // Variables that help with logic flow only
  hasSeen = {por: false};

  // Variables related to user preferences
  orderPrefPOR = [{order: 1, array: 'porRequestion', display: 'Your Requests', visible: true},
    {order: 2, array: 'requestionBycreatedBy', display: 'Requests Created for Others', visible: true},
    {order: 3, array: 'porWaiting', display: 'Waiting for your Approval', visible: true},
    {order: 4, array: 'porSubWaiting', display: 'Waiting for your Approval as a Substitute', visible: true},
    {order: 5, array: 'porApprovedRejected', display: 'Approved or Rejected Requests', visible: true}];
  orderPrefBr = [{order: 1, array: 'brRequester', display: 'Your Requests', visible: true},
    {order: 2, array: 'brCreatedBy', display: 'Requests Created for Others', visible: true},
    {order: 3, array: 'brWaiting', display: 'Waiting for your Approval', visible: true},
    {order: 4, array: 'brSubWaiting', display: 'Waiting for your Approval as a Substitute', visible: true},
    {order: 5, array: 'brApprovedRejected', display: 'Approved or Rejected Requests', visible: true}];
  orderPrefPORref = [];
  orderPrefBrRef = [];
  numberPref: any;

  constructor(private router: Router, private formBuilder: FormBuilder,
              public oktaAuth: OktaAuthService, private poDetailsService: PODetailsService,
              private alertService: AlertService, private dateTimeService: DateTimeService,
              private adUserService: AdusersService, private spinner: NgxSpinnerService, private brService: BudgetRequestService,
              private userPrefService: UserPrefService, public errTransService: ErrorTranslationService) {
    this.poBRtoggle = formBuilder.group({
      typeToggle: 'por'
    });
  }

  async ngOnInit() {
    this.spinner.show();
    this.dateFormat = await this.dateTimeService.getDateFormat();
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    this.orderPrefPORref = JSON.parse(JSON.stringify(this.orderPrefPOR));
    this.orderPrefBrRef = JSON.parse(JSON.stringify(this.orderPrefBr));
    const userClaims = await this.oktaAuth.getUser();
    console.log(userClaims.preferred_username);
    console.log(userClaims.email);
    this.userInfo.eaId = localStorage.getItem('proxyEmployeeID') || userClaims.preferred_username;
    this.userFullName = [userClaims.given_name, userClaims.family_name];
    if (localStorage.getItem('proxyUsername')) {
      this.userFullName = localStorage.getItem('proxyUsername').split(' ');
    }
    this.adUsers = await this.adUserService.getAll().toPromise();
    const myId = this.getUserID(userClaims.preferred_username);
    this.userInfo.adId = myId;
    await this.loadPreferences();
    await this.loadPor();
    await this.getBudgetOptions().then(res => {
      this.budgetTotal = this.brWaiting.length + this.brSubWaiting.length/*  + this.brCreatedBy.length +
        this.brRequester.length + this.brApprovedRejected.length */;
    });
    this.spinner.hide();
  }

  async loadPor() {
    this.spinner.show('porInboxSpinner', {type: 'line-scale', fullScreen: false});
    const myId = this.userInfo.adId;
    await this.poDetailsService.getPORWaiting(myId, 1 , 10).toPromise().then(data =>
      this.porWaiting = this.inboxDataPush(data, 10, 1)).catch(e => console.log(e));
    await this.poDetailsService.getPORApprovedRejected(myId, 1 , 10)
     .toPromise().then(data => this.porApprovedRejected = this.inboxDataPush(data, 10, 1)).catch(e => console.log(e));
    await this.poDetailsService.getuserRequistionDetials(myId, 1, 10)
    .toPromise().then(data => this.porRequestion = this.inboxDataPush(data, 10, 1)).catch(e => console.log(e));
    await this.poDetailsService.getrequestionBycreatedBy(myId, 1, 10)
    .toPromise().then(data => this.requestionBycreatedBy = this.inboxDataPush(data, 10, 1)).catch(e => console.log(e));
    await this.poDetailsService.getPORSubWaiting(myId, 1, 10).toPromise().then
      (data => this.porSubWaiting = this.inboxDataPush(data, 10, 1)).catch(e => console.log(e));
    this.spinner.hide('porInboxSpinner');
  }

  private async loadPreferences() {
    await this.userPrefService.getProfileFromCache().then(x => {
      console.log(x);
      for (const item of x.userPref) {
        if (item.type === 'userPreference') {
          this.porInboxPref = item.value.inboxPrefs || this.porInboxPref;
          this.orderPrefPOR = item.value.porInboxOrder || this.orderPrefPOR;
          this.orderPrefBr = item.value.brInboxOrder || this.orderPrefBr;
          this.numberPref = item.value.numberFormat || '1,234,567.89';
          this.orderPrefPORref = JSON.parse(JSON.stringify(this.orderPrefPOR));
          this.orderPrefBrRef = JSON.parse(JSON.stringify(this.orderPrefBr));
          console.log(this.porInboxPref);
          this.allPrefs = item;
          break;
        } else {
          continue;
        }
      }
    }).catch(e => {
      console.log(e);
      this.alertService.warn('Unable to load user preferences. Continuing with default settings.');
    });
  }

  returnStatus(code: number): string {
    // Pending-1/Active-2/Approved-3/Rejected-4
    switch (code) {
      case 1:
        return 'Pending';
      case 2:
        return 'Active';
      case 3:
        return 'Approved';
      case 4:
        return 'Rejected';
      default:
        return 'Error';
    }
  }
  returnBrWaitingStatus(code: number): string {
    switch (code) {
      case 1:
        return 'Not Started';
      case 2:
        return 'Approval in Progress';
      case 3:
        return 'Approved';
      case 4:
        return 'Rejected';
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

  getUserID(employeeId): number {
    let myId = 0;
    try {
      const varName = employeeId;
      // tslint:disable-next-line: triple-equals
      myId = this.adUsers.find(obj => obj.employeeId == varName).ID;

    } catch (e) {
      console.log('Unauthorized user. See error: ' + e);
      myId = 0; // this means there is no authorized user
    }
    if (localStorage.getItem('proxyUserID')) {
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    console.log(this.userFullName[0]);
    console.log('dashboard--deploy--' + this.userFullName[1]);
    console.log(myId);
    return myId;
  }

  async getBudgetOptions() {
    this.spinner.show();
    await this.brService.getBRCreatedBy(this.userInfo.adId).toPromise().then(res => {
      this.brCreatedBy = res;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('usrBudget'));
    });
    await this.brService.getBRWaiting(this.userInfo.adId).toPromise().then(res => {
      this.brWaiting = res;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('usrBrWait'));
    });
    await this.brService.getBrByRequester(this.userInfo.eaId).toPromise().then(res => {
      this.brRequester = res;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('usrReq'));
    });
    await this.brService.getBRApprovedRejected(this.userInfo.adId).toPromise().then(res => {
      this.brApprovedRejected = res;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('appRejReq'));
    });
    await this.brService.getBRSubWaiting(this.userInfo.adId).toPromise().then(res => {
      this.brSubWaiting = res;
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('errorFindingbudgetSub'));
    });
    this.hasSeen.por = true;
    this.spinner.hide();
  }

  onTypeToggle() {
    const val = this.poBRtoggle.controls.typeToggle.value;
    switch (val) {
      case 'por':
        this.loadPor();
        break;
      case 'br':
        if (!this.hasSeen.por) {
          this.getBudgetOptions();
        }
        break;
      default:
        break;
    }
  }

  returnPORTotal(): string {
    const val = /* (isNaN(this.porRequestion.length) ? 0 : this.porRequestion.length) + */
      /* (isNaN(this.requestionBycreatedBy.length) ? 0 : this.requestionBycreatedBy.length) + */
      (isNaN(this.porWaiting.length) ? 0 : this.porWaiting.length) +
      (isNaN(this.porSubWaiting.length) ? 0 : this.porSubWaiting.length)/*  +
      (isNaN(this.porApprovedRejected.length) ? 0 : this.porApprovedRejected.length) */;
    return val ? '(' + val + ')' : null;
  }

  reOrderOrderPref(oldPosition: number, i: number) {
    this.orderPrefPOR[i].order = Number(this.orderPrefPOR[i].order); // forced string issue fix
    const needsChange = this.orderPrefPORref.find(x => x.order === this.orderPrefPOR[i].order);
    const changeIndex = this.orderPrefPOR.indexOf(this.orderPrefPOR.find(x => x.array === needsChange.array));
    if (changeIndex > -1) {
      this.orderPrefPOR[changeIndex].order = oldPosition;
    }
    this.sortOrderPrefPOR();
    this.orderPrefPORref = JSON.parse(JSON.stringify(this.orderPrefPOR));
  }

  reOrderBrPref(oldPosition: number, i: number) {
    this.orderPrefBr[i].order = Number(this.orderPrefBr[i].order); // forced string issue fix
    const needsChange = this.orderPrefBrRef.find(x => x.order === this.orderPrefBr[i].order);
    const changeIndex = this.orderPrefBr.indexOf(this.orderPrefBr.find(x => x.array === needsChange.array));
    if (changeIndex > -1) {
      this.orderPrefBr[changeIndex].order = oldPosition;
    }
    this.sortOrderPrefBr();
    this.orderPrefBrRef = JSON.parse(JSON.stringify(this.orderPrefBr));
  }

  private sortOrderPrefPOR() {
    this.orderPrefPOR.sort((a, b) => a.order - b.order);
  }

  private sortOrderPrefBr() {
    this.orderPrefBr.sort((a, b) => a.order - b.order);
  }

  async saveOrderPrefPOR() {
    const data: any = this.allPrefs;
    data.value.porInboxOrder = this.orderPrefPOR;
    data.value.brInboxOrder = this.orderPrefBr;
    const savedPref = await this.userPrefService.saveUserPreference(this.userInfo.eaId, data).toPromise();
    this.userPrefService.cachedUserPrefEntity = {
      EID: this.userInfo.eaId,
      userPreference: savedPref.value
    };
    this.showSettings = false;
  }

  togglePoBrSection() {
    if (this.poBRSectionsToggle === 'por') {
      this.poBRSectionsToggle = 'br';
    } else {
      this.poBRSectionsToggle = 'por';
    }
  }

  private inboxDataPush(dataSet: any[], pageSize: number, pageNumber: number): any[] {
    // In order for the pagniation tools to work properly with this API change, we need to push empty data to the surrounding pages.
    // The total length of each array must match the "totalrow" property in JSON, and must be surrounded by pages of equal length.
    // The page that we are on when we call the API must be accounted for.
    // page size = 5 items, page number = 2. We need to push 5 items to the beginning, and then totalrow - 10 afterward.

    const dataExists = dataSet.find(x => x.totalrow && x.totalrow > 0);
    if (!dataExists) { // Find an entry with the totalrow property, should one exist.
      return dataSet; // The data we received was incorrect or empty already if we reach this line.
    }
    for (let i = 1; i < pageNumber; i++) {
      // We want to start at 1, because if we are on page 1, we do not want this to run. If we are on page 2, run one time.
      for (let j = 0; j < pageSize; j++) {
        // push the appropriate number of empty objects into the dataSet.
        dataSet.unshift({});
      }
    }
    // At this point, we have the proper number of entries before the current page. Now, we must fill the empty spaces afterward.
    const iterateMe = dataSet[0] ? dataExists.totalrow - dataSet.length : 0; // don't throw an error if dataSet is empty
    console.log(dataExists.totalrow - dataSet.length + ', ' + dataSet.length);
    for (let i = 0; i < iterateMe; i++) {
      dataSet.push({});
    }
    return dataSet;
  }
  // Every single time the page is changed, we will need a completely new array from scratch and perform this function.
  // Child inbox-section components will emit an event that will trigger this function.

  async onPageNoChange(arrayName: string, pageInfo: {pageNo: number, itemsPerPage: number}) {
   this.spinner.show('porInboxSpinner', {type: 'line-scale', fullScreen: false});
    /*
      The 'startIndex' property of each of the below functions is not the starting page, but rather,
      the index of the master data set. So, we need to calculate the page number multiplied by the number
      of entries in each page, and then subtract the result by the number of entries in each page:
      formula -> ((pageNo * noItems) - noItems) + 1
      'startIndex' begins at 1 instead of zero.
    */
   let funcToCall;
   switch (arrayName) {
     case 'porRequestion':
       funcToCall = 'getuserRequistionDetials';
       break;
    case 'requestionBycreatedBy' :
      funcToCall = 'getrequestionBycreatedBy';
      break;
    case 'porWaiting':
      funcToCall = 'getPORWaiting';
      break;
    case 'porSubWaiting':
      funcToCall = 'getPORSubWaiting';
      break;
    case 'porApprovedRejected':
      funcToCall = 'getPORApprovedRejected';
      break;
    default:
      return;
   }
   await this.poDetailsService[funcToCall](this.userInfo.adId, ((pageInfo.pageNo * pageInfo.itemsPerPage)
    - pageInfo.itemsPerPage) + 1, pageInfo.itemsPerPage).toPromise().then(x => {
     this[arrayName] = this.inboxDataPush(x, pageInfo.itemsPerPage, pageInfo.pageNo);
   }).catch(err => console.log(err));
   this.spinner.hide('porInboxSpinner');
  }
}
