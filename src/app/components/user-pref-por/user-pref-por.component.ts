import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { environment } from 'src/environments/environment';
import { HrUser } from 'src/app/models/hrUser';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from 'src/app/_alert/alert.service';
import { OktaAuthService } from '@okta/okta-angular';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';


@Component({
  selector: 'app-user-pref-por',
  templateUrl: './user-pref-por.component.html',
  styleUrls: ['./user-pref-por.component.css']
})
export class UserPrefPorComponent implements OnInit {
  pref;
  EID;
  categoryOptions = [];
  companyOptions = [];
  isCompanyChanged = false;
  isCategoryChanged = false;
  costCenterOptions = [];
  glAccountOptions = [];
  stateByCountryOptions;
  countryOptions = [];
  uomOptions = [];
  uomFav = [];
  vendorOptions;
  vendorOptionsObservable: Observable<any>;
  loadingVendor = false;
  languageOptions = [
  {lang: 'EN'},
  {lang: 'ES'},
  {lang: 'PT'}

];//['EN', 'ES', 'PT'];
numberFormats = [
  {format: '1,234,567.89'},
  {format: '1.234.567,89'}
];
dateFormats =  [
  {format: 'MM/DD/YYYY'},
  {format: 'DD.MM.YYYY'},
  {format: 'DD/MM/YYYY'},
  {format: 'YYYY-MM-DD'},
  {format: 'Month DD, YYYY'}
];
timeFormats = [
  {format: '12 Hour Format'},
  {format: '24 Hour Format'}
];
dataToSend = {
  type: 'userPreference',
  value: {}
};
genericData = {
  type: 'genericPreference',
  value: {}
};

inboxColumns: {id: number, column: string, visible: boolean, position: number}[] = [
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
inboxColReference = [];
inboxOrderNums: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];



  porForm;
  adusers: AdUser[];

  @Output() refresh = new EventEmitter<string>();


  constructor(private optionsService: OrderRequestOptionsService,
              private oktaAuth: OktaAuthService,
              private formBuilder: FormBuilder,
              private aduserService: AdusersService,
              private prefService: UserPrefService,
              private spinner: NgxSpinnerService,
              private alertService: AlertService,
              public errTransService: ErrorTranslationService) {

                this.porForm = this.formBuilder.group({
                  currentCategory: [],
                  currentVendor: [],
                  currentCompany: [],
                  currentCostCenter: [],
                  currentRequester: [],
                  specialInstructions: null,
                  currentGLAccount: [],
                  currentUOM: [],
                  shipToName: null,
                  shipToStreet: null,
                  shipToCity: null,
                  shipToState: null,
                  shipToZip: null,
                  shipToCountry: null,
                  language: null,
                  numberFormat: null,
                  dateFormat: null,
                  timeFormat: null
                });
               }

  async ngOnInit() {
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    const userClaims = await this.oktaAuth.getUser();
    this.EID = userClaims.preferred_username;
    if (localStorage.getItem('proxyUsername')) {
      this.EID = localStorage.getItem('proxyEmployeeID');
    }
    this.loadData();
    this.setInboxReference();
  }
  private setInboxReference() {
    this.inboxColReference = JSON.parse(JSON.stringify(this.inboxColumns));
  }
  uomExpand() {
    this.uomFav = this.uomOptions;
  }
  uomUnexpand() {
    this.uomFav = this.uomOptions.slice(0, 5);
  }
  async loadData() {
    this.spinner.show('prefSpinner', {fullScreen: false});
    const userProfile = await this.prefService.getProfileFromCache();
    // Check if user pref is already available in service cache , if not get and save to cache
    if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.EID === this.EID) {
      this.pref = this.prefService.cachedUserPrefEntity.userPreference;
    } else {
      const pref = await this.prefService.getUserPreference('EAI23598', 'userPreference').toPromise();
      this.pref = pref && pref.value ? pref.value : {} ;
    }
    // const pref = await this.prefService.getUserPreference(this.EID, 'userPreference').toPromise();
    // this.pref = pref.value;

    this.categoryOptions = await this.optionsService.getCategories().toPromise();
    const region = (userProfile.hrUser && userProfile.hrUser.region) ? userProfile.hrUser.region : null;
    this.companyOptions = await this.optionsService.getCompanyByRegion(region).toPromise();
    this.porForm.patchValue({
      currentCategory: this.pref.purchaseCategory || [],
      currentCompany: this.pref.companyCode || [],
      currentRequester: this.pref.requester || []
    });
    this.loadVendor(true);
    this.loadCostCenter(true);
    this.loadGLAccount(true);

    this.adusers = await this.aduserService.getAll().toPromise();
    this.adusers.sort((a, b) => (a.firstname > b.firstname) ? 1 : -1);
    this.uomOptions = await this.optionsService.getUom().toPromise();
    this.uomFav = this.uomOptions.slice(0, 5);
    this.countryOptions = await this.optionsService.getCountryList().toPromise();
    this.porForm.patchValue({

                  currentRequester: this.pref.requester || [],
                  specialInstructions: this.pref.specialInstructions || null,
                  currentUOM: this.pref.UOM || null,
                  shipToName: this.pref.shipToName || null,
                  shipToStreet: this.pref.shipToStreet || null,
                  shipToCity: this.pref.shipToCity || null,
                  shipToState: this.pref.shipToState || null,
                  shipToZip: this.pref.shipToZip || null,
                  shipToCountry: this.pref.shipToCountry || null,
                  language: this.pref.language || 'EN',
                  numberFormat: this.pref.numberFormat || '1,234,567.89',
                  dateFormat: this.pref.dateFormat || 'MM/DD/YYYY',
                  timeFormat: this.pref.timeFormat || '12 Hour Format'
    });
    this.onCountryChange();
    this.porForm.patchValue({
      shipToState: this.pref.shipToState || null
    });
    if (this.pref.inboxPrefs) {
      this.inboxColumns = JSON.parse(JSON.stringify(this.pref.inboxPrefs));
      if (!this.inboxColumns.find(x => x.id === 13)) {
        this.inboxColumns.push( // PREVENT PREVIOUS USER'S APPLICATION FROM BREAKING WHEN ADDING NEW COLUMN
          {id: 13, column: 'Status', visible: true, position: 14}
        );
      }
      this.inboxColumns.sort((a, b) => a.position - b.position);
    }
    this.spinner.hide("prefSpinner");
  }

  async onCountryChange() {
    this.porForm.controls.shipToState.reset();
    if (!this.porForm.controls.shipToCountry.value) {
      this.stateByCountryOptions = undefined;
      return;
    }
    this.stateByCountryOptions =
      await this.optionsService.getCountryStates(this.porForm.controls.shipToCountry.value).toPromise();
  }
  async loadVendor(onInit?: boolean) {
    this.porForm.controls.currentVendor.setValue(null);
    if (!(this.porForm.controls.currentCompany.value.length)) {
      this.vendorOptions = [];
      this.porForm.patchValue({
        currentVendor: []
      });
      return;
    }
    this.vendorOptions = await this.optionsService.getVendorsByList(this.porForm.controls.currentCompany.value).toPromise();
    if (onInit) {
      this.porForm.controls.currentVendor.setValue(this.pref.vendor);
    }
  }
  async loadGLAccount(onInit?: boolean) {
    this.porForm.controls.currentGLAccount.setValue(null);
    if (!this.porForm.controls.currentCategory.value.length || !this.porForm.controls.currentCompany.value.length) {
      this.glAccountOptions = [];
      this.porForm.patchValue({
        currentGLAccount: []
      });
      return;
    }
    this.glAccountOptions = await this.optionsService.getGLAccountByList(this.porForm.controls.currentCompany.value,
      this.porForm.controls.currentCategory.value).toPromise();
    if (onInit) {
        this.porForm.controls.currentGLAccount.setValue(this.pref.GLAccount);
      }

  }
  async loadCostCenter(onInit?: boolean) {
    this.porForm.controls.currentCostCenter.setValue(null);
    if (!this.porForm.controls.currentCompany.value.length) {
      this.costCenterOptions = [];
      this.porForm.patchValue({
        currentCostCenter: []
      });
      return;
    }
    this.costCenterOptions = await this.optionsService.getCostCenterByList(this.porForm.controls.currentCompany.value).toPromise();
    if (onInit) {
      this.porForm.controls.currentCostCenter.setValue(this.pref.costCenter);
    }

  }

  onCategoryChange() {
    if (!this.isCategoryChanged) {
      return;
    }
    this.isCategoryChanged = false;
    this.loadGLAccount();
  }

  updateCategoryChangeFlag() {
    this.isCategoryChanged = true;
    if (!(this.porForm.controls.currentCategory.value.length)) {
      this.onCategoryChange();
    }
  }
  updateCompanyChangeFlag() {
    this.isCompanyChanged = true;
    if (!(this.porForm.controls.currentCompany.value.length)) {
      this.onCompanyChange();
    }
  }

  onCompanyChange() {
    if (!this.isCompanyChanged) {
      return;
    }
    this.isCompanyChanged = false;

    this.loadVendor();
    this.loadCostCenter();
    this.loadGLAccount();
    const temp = this.porForm.controls.currentCompany.value;
    if (!(this.porForm.controls.shipToName.value || this.porForm.controls.shipToStreet.value ||
      this.porForm.controls.shipToCity.value || this.porForm.controls.shipToState.value ||
      this.porForm.controls.shipToZip.value || this.porForm.controls.shipToCountry.value)) {
        const item = this.porForm.controls.currentCompany.value[0];
        const temp = this.companyOptions.find(x => x.companyCode === item);

        if (temp && temp.country) {
          this.porForm.patchValue({
            shipToName: temp.name,
            shipToStreet: temp.street,
            shipToCity: temp.city,
            shipToZip: temp.postalCode,
            shipToCountry: temp.countryCode
          });
          this.onCountryChange();
          this.porForm.patchValue({ shipToState: temp.stateCode });
        }
    }
  }

  validatePref() {
    let status = true;
    let msg = this.errTransService.returnMsg('errsInReq') + '\n';
    if (!this.porForm.controls.language.value) {
      status = false;
      msg += '\n' + this.errTransService.returnMsg('Language');
    }
    if (!this.porForm.controls.numberFormat.value) {
      status = false;
      msg += '\n' + this.errTransService.returnMsg('Numbering Format');
    }
    if (!this.porForm.controls.dateFormat.value) {
      status = false;
      msg += '\n' + this.errTransService.returnMsg('Date Format');
    }
    if (!this.porForm.controls.timeFormat.value) {
      status = false;
      msg += '\n' + this.errTransService.returnMsg('Time Format');
    }
    if (status === false) {
      this.alertService.clear();
      this.alertService.error(this.replaceNewline(msg));
    }
    return status;
  }

  replaceNewline(msg: string): string {
    return msg.replace(/\n/g, '<br>&nbsp;');
  }

  async onPrefSave() {
    this.alertService.clear();
    if (!this.validatePref()) {
      return;
    }

    const formData = {
                  purchaseCategory: this.porForm.controls.currentCategory.value || [],
                  vendor: this.porForm.controls.currentVendor.value || [],
                  companyCode: this.porForm.controls.currentCompany.value || [],
                  companyId: [],
                  costCenter: this.porForm.controls.currentCostCenter.value || [],
                  requester: this.porForm.controls.currentRequester.value || [],
                  specialInstructions: this.porForm.controls.specialInstructions.value || null,
                  GLAccount: this.porForm.controls.currentGLAccount.value || [],
                  UOM: this.porForm.controls.currentUOM.value || [],
                  shipToName: this.porForm.controls.shipToName.value || null,
                  shipToStreet: this.porForm.controls.shipToStreet.value || null,
                  shipToCity: this.porForm.controls.shipToCity.value || null,
                  shipToState: this.porForm.controls.shipToState.value || null,
                  shipToZip: this.porForm.controls.shipToZip.value || null,
                  shipToCountry: this.porForm.controls.shipToCountry.value || null,
                  inboxPrefs: this.inboxColumns || null
    };
    const systemSettings = {
      language: this.porForm.controls.language.value || null,
      numberFormat: this.porForm.controls.numberFormat.value || null,
      dateFormat: this.porForm.controls.dateFormat.value || null,
      timeFormat: this.porForm.controls.timeFormat.value || null
    };
    let temp = this.porForm.controls.currentCompany.value;
    let companyId = [];
    temp.forEach(code => {
      let cmp = this.companyOptions.find(x => x.companyCode === code);
      if (cmp && cmp.id ) {
        companyId.push(cmp.id);
      }
    });
    formData.companyId = companyId;
    this.dataToSend.value = formData;
    this.genericData.value = systemSettings;
    this.spinner.show('prefSpinner', {fullScreen: false});
    const savedPref = await this.prefService.saveUserPreference(this.EID, this.dataToSend).toPromise();
    const savedGenericPref = await this.prefService.saveUserPreference(this.EID, this.genericData).toPromise();
    this.copySystemSettingsToPref(savedPref, savedGenericPref);
    this.prefService.cachedUserPrefEntity = {
      EID: this.EID,
      userPreference: savedPref.value
    };
    if (this.prefService.cachedUserProfile && this.prefService.cachedUserProfile.EID === this.EID) {
      if (this.prefService.cachedUserProfile.value && this.prefService.cachedUserProfile.value.userPref) {
        this.prefService.cachedUserProfile.value.userPref.forEach(entity => {
          if (entity.type === 'userPreference') {
            entity.value = savedPref.value;
          }
          if (entity.type === 'genericPreference') {
            entity.value = savedGenericPref.value;
          }
        });
      }
    }
    this.inboxColumns.sort((a, b) => a.position - b.position);
    await this.prefService.loadLangSpecificApp();
    this.refresh.emit();
    this.spinner.hide('prefSpinner');
  }

  copySystemSettingsToPref(savedPref, savedGenericPref) {
    // generic system settings are saved as seperte entity.
    // generic settings are copied to userpref cache, so component reference are not broken
    savedPref.value.language = savedGenericPref.value.language;
    savedPref.value.numberFormat = savedGenericPref.value.numberFormat;
    savedPref.value.dateFormat = savedGenericPref.value.dateFormat;
    savedPref.value.timeFormat = savedGenericPref.value.timeFormat;
  }

  checkInboxColumns(prop?) {
    console.log(this.inboxColumns, prop);
  }

  onInboxColumnChange(column: string, oldPosition: number, newPosition: number, i: number) {
    this.inboxColumns[i].position = Number(this.inboxColumns[i].position); // forced string issue fix
    const needsChange = this.inboxColReference.find(x => x.position === this.inboxColumns[i].position);
    const changeIndex = this.inboxColumns.indexOf(this.inboxColumns.find(x => x.id === needsChange.id));
    if (changeIndex > -1) {
      this.inboxColumns[changeIndex].position = oldPosition;
    }
    this.setInboxReference();
  }
  onCheckboxChange() {
    this.setInboxReference();
  }
}
