import { Component, OnInit, ViewChild } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { environment } from 'src/environments/environment';
import { HrUser } from 'src/app/models/hrUser';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from 'src/app/_alert/alert.service';
import { UserPrefPorComponent } from 'src/app/components/user-pref-por/user-pref-por.component';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { ReportService } from 'src/app/services/report/report.service';
import { Sort } from '@angular/material';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-user-pref',
  templateUrl: './user-pref.component.html',
  styleUrls: ['./user-pref.component.css']
})
export class UserPrefComponent implements OnInit {
  username: string;
  dateFormat = 'MM/dd/yyyy';
  existingPrefs;
  globalPrefs: FormGroup;
  eprocurePrefs: FormGroup;
  userFullName: Array<any>;
  userEmployeeId: any;
  options: any = {};
  substituteUserInfo: { region: string, substitutors: any[], activeSubs?: any[], isAdmin?: boolean } = { region: '', substitutors: [] };
  myId = 0;
  adUsers: Array<AdUser>; // Used to get users for dropdown boxes
  hrUsers; // used to get users for hr user dropdowns
  isProd: boolean;
  itemsPerPage = 10;
  m;
  showLegend = false;
  initialList = [];
  initialData: any = {
    substitutorFor: null,
    substitutedBy: null,
    createdBy: null,
    regions: null,
    createdFrom: null,
    createdTo: null,
    updatedFrom: null,
    updatedTO: null,
    validFrom: null,
    validTo: null,
    active: true
  };
  sendMe;
  showAll = false;

  @ViewChild(UserPrefPorComponent, {static: false}) child: UserPrefPorComponent ;

  constructor(private oktaAuth: OktaAuthService, private formBuilder: FormBuilder,
              private prefService: UserPrefService,
              private adusersService: AdusersService,
              private datePipe: DatePipe,
              private optionsService: OrderRequestOptionsService,
              private spinner: NgxSpinnerService,
              public errTransService: ErrorTranslationService,
              private dateTimeService: DateTimeService,
              private reportService: ReportService,
              private alertService: AlertService) {
    this.globalPrefs = this.formBuilder.group({
      dateFormat: '',
      timeFormat: '',
      timeZone: '',
      numberFormat: '',
      output: '',
      proxyUser: null,

      adminSubFor: null,
      substituteAuth: [null, Validators.required],
      subFromDate: ['', Validators.required],
      subToDate: ['', Validators.required]
    });
    this.eprocurePrefs = this.formBuilder.group({
      company: '',
      purchaseCategory: '',
      porType: '',
      costCenter: ''
    });
  }

  async ngOnInit() {
    //this.spinner.show();

    this.isProd = environment.production;
    const userClaims = await this.oktaAuth.getUser();
    this.dateFormat = await this.dateTimeService.getDateFormat();
    this.username = userClaims.name;
    this.userFullName = [userClaims.given_name, userClaims.family_name];
    this.userEmployeeId = userClaims.preferred_username;
    //need to be removed after okta setup
    this.username='Devandra Yadav';
    this.userFullName = ['Devandra', 'Yadav'];
    this.userEmployeeId='EAI23598';
    this.adUsers = await this.adusersService.getAll().toPromise();
    const myId = this.getUserID();

    this.options.companyOptions = await this.optionsService.getCompany().toPromise();
    this.options.porTypeOptions = await this.optionsService.getPOR().toPromise();
    this.options.purchaseCategoryOptions = await this.optionsService.getCategories().toPromise();
    this.options.costCenterOptions = await this.optionsService.getCostCenter().toPromise();

    this.substituteUserInfo.region =
      await this.prefService.getRegion(this.userEmployeeId).toPromise();
    this.substituteUserInfo.isAdmin = await this.prefService.checkIfAdmin(this.userEmployeeId).toPromise().catch(x => {
      console.log(x.message + '| Can\'t determine if the user is an admin.');
    });
    this.spinner.hide();
    this.retrieveSubstitutors();

    let dataPrefrence;

    await this.prefService.getPreferences(myId).subscribe(data => {
      // this.adUsers = data;
      // tslint:disable-next-line: only-arrow-functions
      data.forEach(function(arrayItem) {
        console.log(arrayItem);
        console.log('arrayItem.glaccount=' + arrayItem.glaccount);
        console.log('arrayItem.purchcategory==' + arrayItem.purchcategory);
        console.log('arrayItem.prtype==' + arrayItem.prtype);
        console.log('arrayItem.costcenter==' + arrayItem.costcenter);
        console.log(arrayItem);

        dataPrefrence = {
          company: Number(arrayItem.glaccount),
          purchaseCategory: Number(arrayItem.purchcategory),
          porType: Number(arrayItem.prtype),
          costCenter: Number(arrayItem.costcenter)
        }; //
        console.log(dataPrefrence);

        // this.eprocurePrefs.controls['company'].setValue(arrayItem.glaccount);

      });
      this.applyPrefs(dataPrefrence);
    });
    this.spinner.show('globalPrefSpinner', {fullScreen: false});
    await this.adusersService.getHrUserByRegion(this.substituteUserInfo.region).toPromise().then(res => {
      this.hrUsers = res;
      this.hrUsers.forEach(user => {
        user.displayValue = user.firstName + ' ' + user.lastName ;
      });
      this.hrUsers.sort((a, b) => a.displayValue.localeCompare(b.displayValue));
    }).catch(err => {
      console.log(err);
      this.alertService.error(this.errTransService.returnMsg('hrAPI'));
    });
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('subFromDate').setAttribute('min', today);
    document.getElementById('subToDate').setAttribute('min', today);
    this.spinner.hide('globalPrefSpinner');
  }

  async showAllHRUser() {
    this.substituteUserInfo.substitutors = await this.adusersService.getHr().toPromise().catch(x => {
      console.log(x.message + '| Perhaps there are no available subs for this admin?');
    });
    this.substituteUserInfo.substitutors.forEach(user => {
      user.fullName = user.firstName + ' ' + user.lastName ;
    });
    this.showAll = true;
    this.substituteUserInfo.substitutors.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async onSubFor(person?: HrUser) {
    this.spinner.show('globalPrefSpinner', {fullScreen: false});
    if (!person) {
      // this.substituteUserInfo.region =
      //   await this.prefService.getRegion(this.userEmployeeId).toPromise();
      this.substituteUserInfo.substitutors = [];
      // this.substituteUserInfo.substitutors = await this.prefService.getSubsForAdmin(this.userEmployeeId).toPromise().catch(x => {
      //   console.log(x.message + '| Perhaps there are no available subs for this admin?');
      // });
      this.globalPrefs.patchValue({
        substituteAuth: null
      });
      this.globalPrefs.get('substituteAuth').reset();
      this.substituteUserInfo.activeSubs = null;
    } else {
      // this.substituteUserInfo.region =
      //   await this.prefService.getRegion(person.employeeID).toPromise();
      this.substituteUserInfo.substitutors = await this.prefService.getSubsForAdmin(person.employeeID).toPromise().catch(x => {
        console.log(x.message + '| Perhaps there are no available subs for this user?');
      });
      this.substituteUserInfo.activeSubs = null;
    }
    this.showAll = false;
    this.substituteUserInfo.substitutors.sort((a, b) => a.fullName.localeCompare(b.fullName));
    this.spinner.hide('globalPrefSpinner');
  }

  private async resetRegionAndSubs() { // This will not affect the activeSubs array.
    this.substituteUserInfo.region =
      await this.prefService.getRegion(this.userEmployeeId).toPromise();
    this.substituteUserInfo.substitutors = [];
    // this.substituteUserInfo.substitutors = await this.prefService.getSubsForAdmin(this.userEmployeeId).toPromise().catch(x => {
    //   console.log(x.message + '| Perhaps there are no available subs for this admin?');
    // });
    this.showAll = false;
    this.substituteUserInfo.substitutors.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async onGeneralSave() {
    console.log(this.globalPrefs.value);
    // TODO: POST here
    console.log(this.globalPrefs.value.proxyUser);
    if (!environment.production) {
      if (!this.globalPrefs.value.proxyUser) {
        localStorage.removeItem('proxyUserID');
        localStorage.removeItem('proxyUsername');
        localStorage.removeItem('proxyEmployeeID');
        await this.prefService.loadLangSpecificApp();
        this.child.ngOnInit();
        window.location.reload();
        return;
      }
      localStorage.setItem('proxyUserID', this.globalPrefs.value.proxyUser);
      localStorage.setItem('proxyEmployeeID', this.adUsers.find(obj => obj.ID === Number(this.globalPrefs.value.proxyUser)).employeeId);
      localStorage.setItem('proxyUsername', this.adUsers.find
        (obj => obj.ID === Number(this.globalPrefs.value.proxyUser)).firstname + ' ' + this.adUsers.find
          (obj => obj.ID === Number(this.globalPrefs.value.proxyUser)).lastname);
    }
    await this.prefService.loadLangSpecificApp();
    this.child.ngOnInit();
    window.location.reload();
  }

  validateSubDate() {
    for (const val of ['subFromDate', 'subToDate']) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const chosen = new Date(this.globalPrefs.value[val].replace(/-/g, '/'));
    console.log(now, chosen);
    if (chosen < now) {
      this.alertService.error(this.errTransService.returnMsg('subInPast'));
      this.globalPrefs.controls[val].reset();
      return false;
    }}
    return true;
  }

  async onSubActivate() {

    if (!this.globalPrefs.value.substituteAuth ||
      !this.globalPrefs.value.subFromDate ||
      !this.globalPrefs.value.subToDate || !this.validateSubDate()) {

      const vals = ['adminSubFor',
        'substituteAuth',
        'subFromDate',
        'subToDate'];
      for (const val of vals) {
        this.globalPrefs.get(val).markAsTouched();
      }

      return;
    }

    let idToCheck;
    if (this.globalPrefs.value.adminSubFor) {
      idToCheck = this.globalPrefs.value.adminSubFor.employeeID;
    } else {
      idToCheck = this.userEmployeeId;
    }
    const sendData: any = {
      requesterEid: idToCheck,
      status: 'Active',
      substituteEid: this.globalPrefs.value.substituteAuth.employeeID,
      validFrom: new Date(this.globalPrefs.value.subFromDate).toUTCString(), // toISOString().replace('T', ' ').replace('Z', ''),
      validTo: new Date(this.globalPrefs.value.subToDate).toUTCString(), // .toISOString().replace('T', ' ').replace('Z', '')
      offset: new Date(Date.now()).getTimezoneOffset()
    };
    if (this.globalPrefs.value.adminSubFor) {
      sendData.adminEid = this.userEmployeeId;
    }
    await this.prefService.createSubstitution(JSON.stringify(sendData)).toPromise().then(x => {
      if (this.globalPrefs.value.adminSubFor) {
        this.onShowAdminHistory(true);
        this.resetRegionAndSubs();
      } else {
        this.onShowHistory(true);
      }
      this.globalPrefs.patchValue({
        adminSubFor: null,
        substituteAuth: null,
        subFromDate: '',
        subToDate: ''
      });
      const cleanSet = ['adminSubFor', 'substituteAuth', 'subFromDate', 'subToDate'];
      for (const item of cleanSet) {
        this.globalPrefs.get(item).markAsUntouched();
      }
    }).catch(x => {
      this.alertService.error( this.errTransService.returnMsg('cantActvSub') + ': ' + x.error.message);
    });
  }

  async onSubDeactivate(sub) {
    const sendData: any = {
      id: sub.substituteId,
      status: 'InActive',
      deactivateTo: new Date().toUTCString(), // toISOString().replace('T', ' ').replace('Z', '').split('.')[0],
      requesterEid: sub.requesterEid,
      substituteEid: sub.substituteEid,
      validFrom: sub.validFrom,
      validTo: sub.validTo,
      offset: new Date(Date.now()).getTimezoneOffset()
    };
    if (this.substituteUserInfo.isAdmin) {
      sendData.adminEid = this.userEmployeeId;
    }
    await this.prefService.createSubstitution(JSON.stringify(sendData)).toPromise().then(success => {
      this.substituteUserInfo.activeSubs.splice(this.substituteUserInfo.activeSubs.indexOf(sub), 1);
    }).catch(err => {
      this.alertService.error(this.errTransService.returnMsg('errAPI'));
      console.log(err);
    });
  }

  async onShowHistory(status?: boolean) {
    // this.spinner.show();
    let reqID = [];
    reqID.push(this.userEmployeeId);
    this.sendMe = Object.assign({}, this.initialData);
    this.sendMe.substitutorFor = reqID;
    this.sendMe.active = status ? true : false;
    this.showLegend = status ? false : true;
    try {
      this.alertService.clear();
      const temp = await this.reportService.sendSubstituteReportData(JSON.stringify(this.sendMe)).toPromise();
      this.initialList = [...temp];
      this.substituteUserInfo.activeSubs = temp;
      if (!this.substituteUserInfo.activeSubs[0]) {
        this.spinner.hide();
        // this.alertService.info('The search returned no results.');
        return;
      }
    } catch (error) {
      this.alertService.error(this.errTransService.returnMsg('errAPI'));
      this.spinner.hide();
      return;
    }

    // const idToCheck = this.userEmployeeId;
    // if (status) {
    //   this.prefService.getCertainSubstitutors(idToCheck, status).subscribe(x => {
    //     this.substituteUserInfo.activeSubs = x;
    //   },
    //     err => {
    //       this.displayHistoryError(err);
    //     });
    // } else {
    //   this.prefService.getAllSubstitutions(idToCheck).subscribe(x => {
    //     this.substituteUserInfo.activeSubs = x;
    //   },
    //     err => {
    //       this.displayHistoryError(err);
    //     });
    // }
  }

  async onShowAdminHistory(status?: boolean) {
    this.showLegend = false;
    let regions = [];
    regions.push(this.substituteUserInfo.region);
    this.sendMe = Object.assign({}, this.initialData);
    this.sendMe.regions = regions;
    this.sendMe.active = status ? true : false;
    if (!status) {
      this.showLegend = true;
      this.sendMe.createdTo = new Date().toISOString().split('T')[0];
      let d = new Date();
      this.sendMe.createdFrom = new Date(d.setDate(d.getDate() - 29)).toISOString().split('T')[0];
    }
    try {
      this.alertService.clear();
      const temp = await this.reportService.sendSubstituteReportData(JSON.stringify(this.sendMe)).toPromise();
      temp.sort((a, b) =>  (this.datePipe.transform(b.creationDate) > this.datePipe.transform(a.creationDate) ? 1 :
      this.datePipe.transform(b.creationDate) === this.datePipe.transform(a.creationDate) ? null : -1 ) ||
      a.adInfo_requester.firstname.localeCompare(b.adInfo_requester.firstname) ||
      a.adInfo_requester.lastname.localeCompare(b.adInfo_requester.lastname));
      this.initialList = [...temp];
      this.substituteUserInfo.activeSubs = temp;
      if (!this.substituteUserInfo.activeSubs[0]) {
        this.spinner.hide();
        // this.alertService.info('The search returned no results.');
        return;
      }
    } catch (error) {
      this.alertService.error(this.errTransService.returnMsg('errAPI'));
      this.spinner.hide();
      return;
    }
    // const idToCheck = this.userEmployeeId;
    // if (status) {
    //   this.prefService.getCertainSubsByAdmin(idToCheck, status).subscribe(res => {
    //     this.substituteUserInfo.activeSubs = res;
    //   },
    //     err => {
    //       this.displayHistoryError(err);
    //     });
    // } else {
    //   this.prefService.getSubsByAdmin(idToCheck).subscribe(res => {
    //     this.substituteUserInfo.activeSubs = res;
    //   },
    //     err => {
    //       this.displayHistoryError(err);
    //     });
    // }
  }

  private displayHistoryError(err) {
    this.alertService.error(this.errTransService.returnMsg('apiErr'));
    console.log(err);
    this.substituteUserInfo.activeSubs = null;
  }

  onEprocureSave() {
    const myId = this.getUserID();

    const data = {
      glaccount: Number(this.eprocurePrefs.value.company),
      purchcategory: Number(this.eprocurePrefs.value.purchaseCategory),
      prtype: Number(this.eprocurePrefs.value.porType),
      costcenter: Number(this.eprocurePrefs.value.costCenter),
      userid: myId
    };
    console.log(data);

    // tslint:disable-next-line prefer-const
    let commentStatus =
      this.prefService.sendEprocuserPref(JSON.stringify(data)).subscribe(x => {
      });
  }

  private applyPrefs(prefs: any): any { // set preferences from gathered user info
    console.log('---applyPrefs---');
    console.log(prefs);
    /* this.globalPrefs.patchValue({
       dateFormat: prefs.dateFormat,
       timeFormat: prefs.timeFormat, timeZone: prefs.timeZone, numberFormat: prefs.numberFormat,
       output: prefs.output
     });*/
    this.eprocurePrefs.patchValue({

      company: prefs.company, purchaseCategory: prefs.purchaseCategory,
      porType: prefs.porType, costCenter: prefs.costCenter
    });
  }

  getUserID(): number {
    let myId = 0;
    try {
      const varName = 'EAI23598';//this.userEmployeeId;
      
      // tslint:disable-next-line: triple-equals
      myId = this.adUsers.find(obj => obj.employeeId == varName).ID;

    } catch (e) {
      console.log('Unauthorized user. See error: ' + e);
      myId = 0; // this means there is no authorized user
    }
    console.log(this.userFullName[0]);
    console.log(this.userFullName[1]);
    console.log(myId);
    return myId;
  }

  async retrieveSubstitutors() {
    this.spinner.show();
    if (!this.substituteUserInfo.isAdmin) {
      this.substituteUserInfo.substitutors = await this.prefService.getSubstitutors(this.userEmployeeId).toPromise().catch(x => {
        console.log(x.message + '| Perhaps there are no available subs for this user?');
      });
    } else {
      this.substituteUserInfo.substitutors = [];
      // this.substituteUserInfo.substitutors = await this.prefService.getSubsForAdmin(this.userEmployeeId).toPromise().catch(x => {
      //   console.log(x.message + '| Perhaps there are no available subs for this admin?');
      // });
    }
    this.showAll = false;
    this.substituteUserInfo.substitutors.sort((a, b) => a.fullName.localeCompare(b.fullName));
    this.spinner.hide();
  }

  proxyUserSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    const searchMe = new RegExp(term);
    if (item) {
      const searchable = '' + item.firstname + ' ' + item.lastname + ' - ' + item.employeeId;
      return String(searchable.toLowerCase()).match(searchMe) !== null;
    }
  }

  hrUserSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    const searchMe = new RegExp(term);
    if (item) {
      const searchable = '' + item.firstName + ' ' + item.lastName + ' - ' + item.employeeID;
      return String(searchable.toLowerCase()).match(searchMe) !== null;
    }
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  sortData(sort: Sort) {
    const data = this.substituteUserInfo.activeSubs.slice();
    if (!sort.active || sort.direction === '') {
      this.substituteUserInfo.activeSubs = this.initialList;
      return;
    }
    this.substituteUserInfo.activeSubs = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'req_firstname':
          return this.compare(a.adInfo_requester.firstname + a.adInfo_requester.lasname,
            b.adInfo_requester.firstname + b.adInfo_requester.lasname, isAsc );
        case 'sub_firstname':
          return this.compare(a.adInfo_substituter.firstname + a.adInfo_substituter.lasname,
            b.adInfo_substituter.firstname + b.adInfo_substituter.lasname, isAsc );
        case 'createdBy':
          return this.compare(a.adInfo_created ? (a.adInfo_created.firstname + a.adInfo_created.lasname) : '',
          b.adInfo_created ? (b.adInfo_created.firstname + b.adInfo_created.lasname) : '', isAsc );
        default: return this.compare(a[sort.active], b[sort.active], isAsc);
      }
      });
  }
}
