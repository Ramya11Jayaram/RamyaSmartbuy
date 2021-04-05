import { Component, OnInit, DoCheck } from '@angular/core';
import { Router , ActivatedRoute, Params} from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { OktaAuthService } from '@okta/okta-angular';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { Podetails } from 'src/app/services/approval-details/model/po-detail';
import { PODetailsService } from 'src/app/services/approval-details/podetails.service';
import { AlertService } from 'src/app/_alert/alert.service';
import { stringify } from 'querystring';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { CustomNumberPipe } from 'src/app/pipes/customNumber/custom-number.pipe';
import { CustomCurrencyPipe } from 'src/app/pipes/customCurrency/custom-currency.pipe';


@Component({
  selector: 'app-ncrequest-new',
  templateUrl: './ncrequest-new.component.html',
  styleUrls: ['./ncrequest-new.component.css']
})
export class NcrequestNewComponent implements OnInit, DoCheck {

  debug = false;
  disableSubmit = false;
  phase1 = true; // I am not re-typing code when we get past phase 1, just change this to false

  poErrorFlag = false; // handles one particular issue in preview - hopefully won't be needed in the future

  hideBuyer = false;

  needs: { assetNumber: boolean } =
  { assetNumber: true};
  poDetails: Podetails;
  userClaims;
  adUsers: Array<AdUser>; // Used to get users for dropdown boxes
  watchers: Array<AdUser> = []; chosenWatcher: number = null;
  typeForm;
  isApprovedForm;
  requestDetailsForm;
  tableForm: Array<any> = []; // Easier not to use formGroup here
  nA: any = {};
  commentsForm;
  userFullName: Array<any> = ['loading', '...'];
  userEmail: string;
  date = Date.now();
  aduserForm;
  hierarchy = [];
  showFullList = {
    purchaseCategory: false,
    company: false,
    costCenter: false,
    requester: false,
    vendor: false,
    glaccount: false,
    uom: false
  };
  isSingleValueSet = {
    pc: false,
    gl: false,
    vendor: false,
    company: false,
    cc: false,
    attentionTo: false
  };
  purchaseCategoryOptions = [{ ID: -1, Category: 'Loading options...', category1: '' }];
  purchaseCategoryOptionsPref = [];
  purchaseCategoryOptionsAll = [];

  companyOptions: any = [{ ID: -1, name: 'Loading...' }];
  companyOptionsPref = [];
  companyOptionsAll = [];
  requesterOptions = [{ displayname: 'Loading options...', level: -1, id: -1 }];
  requesterOptionsPref = [];
  requesterOptionsAll = [];
  vendorOptions = [{ Address: 'Loading available options...', Phone: '', Email: '', searchable: 'Loading options...' , id: -1}];
  vendorOptionsPref = [];
  vendorOptionsAll = [];
  currencyOptions = [{ ID: -1, name: 'Loading options...', currency: 'Loading...' }];
  porOptions = [{
    id: -1, reference: '-1', name: 'Loading options...', glAccountNumber: '-1', costCenterCode: '', assetClass: '',
    assetNumber: '', ioNumber: '', profitCenter: ''
  }];
  chosenPor = {
    id: 0, reference: '', name: '', glAccountNumber: '', costCenterCode: '', assetClass: '', assetNumber: '',
    ioNumber: '', profitCenter: ''
  };
  buyerOptions = [{ buyerCode: 'Loading available options...', companyCode: '', employeeId: '', searchable: 'Loading options...' , id: -1}];

  countryOptions = [];
  stateOptions = [];
  stateByCountryOptions = undefined;
  glAccountOptions = [];
  glAccountOptionsPref = [];
  glAccountOptionsAll = [];
  costCenterOptions = [];
  costCenterOptionsAll = [];
  costCenterOptionsPref = [];
  assetClassOptions = [];
  internalOrderOptions = [];
  assetNumberOptions = [];
  profitCenterOptions = [];
  uomOptions = [];
  uomOptionsPref = [];
  uomOptionsAll = [];
  materialOptions = [];
  approverOptions: any = { approvers: [] };
  approverFormInfo: any = {};
  filesToUpload = new FormData();
  filesToDisplay: string[] = [];
  errorList: any = {
    invalidCostCenter: false,
    invalidVendor: false,
    invalidItemCC: [],
    invalidItemAsset: [],
    invalidItemGlAccount: [],
    invalidItemIO: [],
    invalidItemPC: []
  };

  uploadedFiles = [];
  vpOptions = [];
  pref = {
    purchaseCategory: [],
    vendor: [],
    companyCode: [],
    companyId: [],
    costCenter: [],
    requester: [],
    specialInstructions: null,
    GLAccount: [],
    UOM: [],
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
  };

  orderId = 0;
  documentStatus;
  cachedData: any = {};
  /* additionalApprovers = 0; */
  /* additionalApprover1: number = undefined;
  additionalApprover2: number = undefined; */
  additionalApprover: any = [];

  canSeeApprovers = false; // toggles approver view
  canSeeHierarchy = false; // toggles hierarchy view

  warnId: number; // Warn if selected

  brazil = /4.*/;
  draft = true;
  buyer_code;
  buyer_id;
  buyer_checked = false;
  filesUploading = false;
  dateFormat = '';
  numberFormat = '';
  hiddenList = ['IT', 'A1', 'F1', 'F2', 'CFO', 'TAX/OTHERS', 'FG'];
  constructor(private router: Router, private formBuilder: FormBuilder, public oktaAuth: OktaAuthService,
              private adusersService: AdusersService,
              private route: ActivatedRoute,
              private dateTimeService: DateTimeService,
              public customNumberPipe: CustomNumberPipe,
              private customCurrencyPipe: CustomCurrencyPipe,
              private pODetailsService: PODetailsService,
              private prefService: UserPrefService,
              private optionsService: OrderRequestOptionsService,
              private spinner: NgxSpinnerService,
              private poDetailsService: PODetailsService,
              private alertService: AlertService,
              public errTransService: ErrorTranslationService) {
    this.typeForm = this.formBuilder.group({
      /* reqGoods: false,
      reqServices: false */
      reqRadios: ''
    });
    this.requestDetailsForm = this.formBuilder.group({
      purchaseCategory: null,
      company: {value: null, disabled: true},
      // porType: '',
      requesterCostCenter: null,
      requester: null,
      vendor: null,
      currency: null,
      detailsField: this.errTransService.returnMsg('Select a vendor!'),
      dateRule: '',
      sendEmail: false,
      sendFax: false,
      email: this.errTransService.returnMsg('emailHere'),
      fax: this.errTransService.returnMsg('faxHere'),
      referenceNumber: '',
      quotationNumber: '',
      startDate: null,
      endDate: null,
      shipToName: '',
      shipToStreet: '',
      shipToCity: '',
      shipToState: null,
      shipToZip: '',
      shipToCountry: null,
      shipToAttentionTo: null,
      isbuyer: false,
      buyer: null,
      contractFlag: false
    });
    this.isApprovedForm = this.formBuilder.group({
      budgetApproved: 0,
      contractInPlace: 0,
      budgetNotApproved: ''
    });
    this.commentsForm = this.formBuilder.group({
      comments: '',
      specialInstructions: '',
      uploadFile: File = null
    });
    this.aduserForm = this.formBuilder.group({
      f1f2: '',
      cfo: '',
      appr1: '',
      /* finalAppr: */
      appr2: ''
    });

  }

  async ngOnInit() {
    const currentRoute = this .router.url;
    if (currentRoute.indexOf('draft') >= 0) {
        this.loadDraft();
    }
    this.spinner.show();
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    this.onCommsChange();
    this.addTableValue();
    this.userClaims = await this.oktaAuth.getUser();
    await this.loadFormats();
    console.log(this.userClaims);
    this.userFullName = [this.userClaims.given_name, this.userClaims.family_name];
    let userId = this.userClaims.preferred_username;
    if (localStorage.getItem('proxyUsername')) {
      this.userFullName = localStorage.getItem('proxyUsername').split(' ');
      userId = localStorage.getItem('proxyEmployeeID');
    }
    // Check if user pref is already available in service cache , if not get and save to cache
    if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.EID === userId) {
      this.pref = this.prefService.cachedUserPrefEntity.userPreference;
    } else {
      const pref = await this.prefService.getUserPreference(userId, 'userPreference').toPromise();
      this.pref = pref && pref.value ? pref.value : {} ;

      this.pref.purchaseCategory = this.pref.purchaseCategory || [];
      this.pref.vendor = this.pref.vendor || [];
      this.pref.companyId = this.pref.companyId || [];
      this.pref.companyCode = this.pref.companyCode || [];
      this.pref.costCenter = this.pref.costCenter || [];
      this.pref.requester = this.pref.requester || [];
      this.pref.GLAccount = this.pref.GLAccount || [];
      this.pref.UOM = this.pref.UOM || [];
    }
    this.adusersService.getAll().subscribe(data => {
      this.adUsers = data;
      if (currentRoute.indexOf('draft') < 0) {
        this.getRequesterPref();
      }
    });

    this.requestDetailsForm.get('requesterCostCenter').disable();
    this.requestDetailsForm.get('vendor').disable();
    this.requestDetailsForm.get('company').disable();
    this.porOptions = await this.optionsService.getPOR().toPromise();
    // get list based on user pref
    if (currentRoute.indexOf('draft') < 0) {
      this.getListBasedOnPreference();
    }
    this.countryOptions = await this.optionsService.getCountryList().toPromise();
    this.stateOptions = await this.optionsService.getGlobalStateList().toPromise();
    // this.purchaseCategoryOptions = await this.optionsService.getCategories().toPromise();
    // this.requesterOptions = await this.optionsService.getRequesters().toPromise();
    this.currencyOptions = await this.optionsService.getCurrency().toPromise();
    // this.porOptions = await this.optionsService.getPOR().toPromise();
    this.profitCenterOptions = await this.optionsService.getProfitCenter().toPromise();
    // this.companyOptions = await this.optionsService.getCompany().toPromise();
    // this.uomOptions = await this.optionsService.getUom().toPromise();
    // this.uomFav = this.uomOptions.slice(0, 5);
    this.materialOptions = await this.optionsService.getMaterial().toPromise();
    this.warnId = await this.optionsService.getHighestLevelApprover().toPromise();
    console.log('MATERIAL OPTIONS!!! vvvv');
    console.log(this.materialOptions);


    let myId = 0;
    try {
      const varName = this.userClaims.preferred_username;
      // tslint:disable-next-line: triple-equals
      myId = this.adUsers.find(obj => obj.employeeId == varName).ID;

    } catch (e) {
      console.log('Unauthorized user. See error: ' + e);
      myId = 0; // This means there is no authorized user
    }

    if (localStorage.getItem('proxyUserID')) {
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    console.log(this.userFullName[0]);
    console.log(this.userFullName[1]);
    console.log(myId);

    const paramId =  this.route.snapshot.params.id;
    this.pODetailsService.getRequestionById2Test(paramId).subscribe((data) => {
      this.poDetails = data;
      if (currentRoute.indexOf('draft') >= 0) {
        this.getListBasedOnPreference(true);
      } else {
        this.handlePODetails(data);
      }
    });
    this.spinner.hide();
  }

  ngDoCheck(): void {
    if (this.uomOptions) { // uomOptions is the last data from DB: check if DB data was loaded
      /* console.log(JSON.stringify(this.purchaseCategoryOptions)); */
      if (this.purchaseCategoryOptions.length === 1 && !this.isSingleValueSet.pc ) {
        if (this.purchaseCategoryOptions[0].ID !== -1) {
          this.isSingleValueSet.pc = true;
          this.selectOnlyValue(this.requestDetailsForm, 'purchaseCategory', this.purchaseCategoryOptions[0].ID);
          this.onCategoryChange();
        }
      }
      if (this.requesterOptions.length === 1) {
        if (this.requesterOptions[0].displayname !== 'Loading options...') {
          this.selectOnlyValue(this.requestDetailsForm, 'requester', this.requesterOptions[0]);
          if (!this.isSingleValueSet.attentionTo && this.router.url.indexOf('draft') === -1) {
            this.requestDetailsForm.controls.shipToAttentionTo.setValue(this.requestDetailsForm.value.requester.displayname);
            this.isSingleValueSet.attentionTo = true;
          }
        }
      }
      if (this.vendorOptions.length === 1 && !this.isSingleValueSet.vendor) {
        if (this.vendorOptions[0].Address !== 'Loading available options...') {
          this.onVendorChange(this.vendorOptions[0]);
          this.selectOnlyValue(this.requestDetailsForm, 'vendor', this.vendorOptions[0]);
          this.isSingleValueSet.vendor = true;
        }
      }
      if (this.currencyOptions.length === 1) {
        if (this.currencyOptions[0].ID !== -1) {
          this.selectOnlyValue(this.requestDetailsForm, 'currency', this.currencyOptions[0].ID);
        }
      }
      if (this.companyOptions.length === 1 && !this.isSingleValueSet.company &&
         this.requestDetailsForm.controls.purchaseCategory.value ) {
        if (this.companyOptions[0].ID !== -1) {
          this.isSingleValueSet.company = true;
          this.selectOnlyValue(this.requestDetailsForm, 'company', this.companyOptions[0]);
          this.onCompanyChange();
        }
      }
      if (this.costCenterOptions.length === 1 && !this.isSingleValueSet.cc) {
        this.isSingleValueSet.cc = true;
        this.selectOnlyValue(this.requestDetailsForm, 'requesterCostCenter', this.costCenterOptions[0].id);
        this.onCostCenterChange();
      }
      let index = 0;
      for (const row of this.tableForm) {
        if (this.uomOptions.length === 1) {
          row.uom = this.uomOptions[0].id;
        }
        if (this.glAccountOptions && this.glAccountOptions.length === 1 && !this.isSingleValueSet.gl) {
          if (!row.glAccountMasterId && this.requestDetailsForm.value.requesterCostCenter) {
            this.isSingleValueSet.gl = true;
            row.glAccountMasterId = this.glAccountOptions[0].id;
            this.onGlAccountChange(row, this.glAccountOptions[0], index);
          }
         }
        if (this.costCenterOptions.length === 1) {
          row.costCenterId = this.costCenterOptions[0].id;
        }
        if (this.assetClassOptions.length === 1) {
          row.assetClass = this.assetClassOptions[0].id;
        }
        if (row.ioOptions && row.ioOptions.length === 1) {
          row.ioNumber = row.ioOptions[0].id;
        }
        if (this.profitCenterOptions.length === 1) {
          row.profitCenter = this.profitCenterOptions[0].id;
        }
        if (this.assetNumberOptions.length === 1) {
          row.assetNumber = this.assetNumberOptions[0].id;
        }
        index ++;
      }
      if (this.canSeeApprovers) {
        for (const entry of this.approverOptions.approvers) {
          if (entry.users && entry.users.length === 1) {
            this.approverFormInfo[entry.fieldname] = entry.users[0].id;
          }
          if (this.requestDetailsForm.controls.requester.value && !this.approverFormInfo[entry.fieldname]) {
            if (entry.users && entry.users.filter(obj => obj.id === this.requestDetailsForm.controls.requester.value.id)[0]) {
              this.approverFormInfo[entry.fieldname] = this.requestDetailsForm.controls.requester.value.id;
            }
          }
          const userAdId = this.getUserAdId();
          if (entry.users && entry.users.filter(obj => obj.id === userAdId)[0] && !this.approverFormInfo[entry.fieldname]) {
            this.approverFormInfo[entry.fieldname] = userAdId;
          }
        }
      }
    }
  }

  setPrefValues() {
    this.requestDetailsForm.patchValue({
      shipToName: this.pref.shipToName || null,
      shipToStreet: this.pref.shipToStreet || null,
      shipToCity: this.pref.shipToCity || null,
      shipToZip: this.pref.shipToZip || null,
      shipToCountry: this.pref.shipToCountry || null,
      shipToState: this.pref.shipToState || null
    });
    this.onCountryChange();
    this.requestDetailsForm.patchValue({ shipToState: this.pref.shipToState || null }); // countryChange resets state
    this.commentsForm.controls.specialInstructions.setValue(this.pref.specialInstructions || null);
  }

  async getListBasedOnPreference(isCopy: boolean = false) {
    this.spinner.show();
    if (isCopy) {
      if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.purchaseCategory.id && this.pref.purchaseCategory &&
        !this.pref.purchaseCategory.includes(this.poDetails.porRequest.purchaseCategory.id)) {
          this.pref.purchaseCategory.push(this.poDetails.porRequest.purchaseCategory.id);
      }
      if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.company.id && this.pref.companyId &&
        !this.pref.companyId.includes(this.poDetails.porRequest.company.id)) {
          this.pref.companyId.push(this.poDetails.porRequest.company.id);
      }

      if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.itemDetails) {
        this.poDetails.porRequest.itemDetails.forEach(item => {
          if (this.pref.UOM && !this.pref.UOM.includes(item.uom.id)) {
            this.pref.UOM.push(item.uom.id);
          }
        });
      }
      // clear default values for copy
      this.pref.shipToName = null;
      this.pref.shipToStreet = null;
      this.pref.shipToCity = null;
      this.pref.shipToZip = null;
      this.pref.shipToState = null;
      this.pref.shipToCountry = null;
    }
    this.purchaseCategoryOptionsPref = this.pref.purchaseCategory && this.pref.purchaseCategory.length ?
    await this.optionsService.getSelectedCategories(this.pref.purchaseCategory).toPromise() : [];
    if (this.purchaseCategoryOptionsPref.length) {
      this.purchaseCategoryOptions = this.purchaseCategoryOptionsPref;
    } else {
      this.showMore('purchaseCategory');
    }

    this.companyOptionsPref = this.pref.companyId && this.pref.companyId.length ?
     await this.optionsService.getSelectedCompanies(this.pref.companyId).toPromise() : [];
    if (this.companyOptionsPref.length) {
      this.companyOptions = this.companyOptionsPref;
    } else {
      this.showMore('company');
    }

    this.uomOptionsPref = this.pref.UOM && this.pref.UOM.length ?
    await this.optionsService.getSelectedUom(this.pref.UOM).toPromise() : [];
    if (this.uomOptionsPref.length) {
      this.uomOptions = this. uomOptionsPref;
    } else {
      this.showMore('uom');
    }

    this.spinner.hide();
    if (isCopy) {
      this.getRequesterPref(true);
    } else {
      this.setPrefValues();
    }
  }

  async getRequesterPref(isCopy: boolean = false) {
    let requesters = [];
    if (isCopy) {
      if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.requester.id && this.pref.requester &&
        !this.pref.requester.includes(this.poDetails.porRequest.requester.id)) {
          this.pref.requester.push(this.poDetails.porRequest.requester.id);
      }
    }
    if (this.pref.requester && this.pref.requester.length) {
      this.pref.requester.forEach(id => {
        let temp = this.adUsers.find(obj => obj.ID === id);
        if(temp && temp.employeeId) {
          requesters.push(temp.employeeId);
        }
      });
      this.requesterOptionsPref = await this.optionsService.getSelectedRequesters(requesters).toPromise();
    } else {
      this.requesterOptionsPref = [];
    }
    if (this.requesterOptionsPref.length) {
      this.requesterOptions = this.requesterOptionsPref;
      this.requesterOptions.sort((a, b) => (a.displayname > b.displayname) ? 1 : -1);
    } else {
      this.showMore('requester');
    }
    if (isCopy) {
      this.handlePODetails(this.poDetails);
    }
  }

  async showMore(fieldname) {
    switch (fieldname) {
      case 'purchaseCategory':
        if (this.purchaseCategoryOptionsAll.length === 0) {
          this.spinner.show();
          this.purchaseCategoryOptionsAll = await this.optionsService.getCategories().toPromise();
          this.spinner.hide();
        }
        this.purchaseCategoryOptions = this.purchaseCategoryOptionsAll;
        this.showFullList.purchaseCategory = true;
        return;
      case 'company':
        if (this.companyOptionsAll.length === 0) {
          this.spinner.show();
          const userProfile = await this.prefService.getProfileFromCache();
          const region = (userProfile.hrUser && userProfile.hrUser.region) ? userProfile.hrUser.region : null;
          this.companyOptionsAll = await this.optionsService.getCompanyByRegion(region).toPromise();
          this.spinner.hide();
        }
        this.companyOptions = this.companyOptionsAll;
        this.showFullList.company = true;
        return;
      case 'costCenter':
        if (this.costCenterOptionsAll.length === 0) {
          this.spinner.show();
          this.costCenterOptionsAll = await this.optionsService.getSpecificCostCenter
            (this.requestDetailsForm.controls.company.value.companyCode).toPromise();
          this.spinner.hide();
        }
        this.costCenterOptions = this.costCenterOptionsAll;
        this.showFullList.costCenter = true;
        return;
      case 'vendor':
        if (this.vendorOptionsAll.length === 0) {
          this.spinner.show();
          const temp = this.requestDetailsForm.controls.company.value;
          this.vendorOptionsAll = await this.optionsService.getSpecificVendors(temp.purchaseOrg).toPromise();
          this.spinner.hide();
        }
        this.vendorOptions = this.vendorOptionsAll;
        this.showFullList.vendor = true;
        return;
      case 'glaccount':
      if (this.glAccountOptionsAll.length === 0) {
        this.spinner.show();
        const temp = this.requestDetailsForm.controls.company.value;
        this.glAccountOptionsAll = await this.optionsService.getSpecificGlAccount
        (this.requestDetailsForm.value.purchaseCategory, temp.companyCode).toPromise()
        .catch(err => console.log(err));
        this.spinner.hide();
      }
      this.glAccountOptions = this.glAccountOptionsAll;
      this.showFullList.glaccount = true;
      return;
      case 'requester':
        if (this.requesterOptionsAll.length === 0) {
          this.spinner.show();
          this.requesterOptionsAll = await this.optionsService.getRequesters().toPromise();
          this.spinner.hide();
        }
        this.requesterOptions = this.requesterOptionsAll;
        this.requesterOptions.sort((a, b) => (a.displayname > b.displayname) ? 1 : -1);
        this.showFullList.requester = true;
        return;
      case 'uom':
        if (this.uomOptionsAll.length === 0) {
          this.spinner.show();
          this.uomOptionsAll = await this.optionsService.getUom().toPromise();
          this.spinner.hide();
        }
        this.uomOptions = this.uomOptionsAll;
        this.showFullList.uom = true;
        return;

      default:
        return;
    }


  }

  showLess(fieldName) {

    switch (fieldName) {
      case 'purchaseCategory':
        this.purchaseCategoryOptions = this.purchaseCategoryOptionsPref;
        this.showFullList.purchaseCategory = false;
        return;
      case 'company':
        this.companyOptions = this.companyOptionsPref;
        this.showFullList.company = false;
        return;
      case 'costCenter':
        this.costCenterOptions = this.costCenterOptionsPref;
        this.showFullList.costCenter = false;
        return;
      case 'vendor':
        this.vendorOptions = this.vendorOptionsPref;
        this.showFullList.vendor = false;
        return;
      case 'glaccount':
        this.glAccountOptions = this.glAccountOptionsPref;
        this.showFullList.glaccount = false;
        return;
      case 'requester':
        this.requesterOptions = this.requesterOptionsPref;
        this.showFullList.requester = false;
        return;
    case 'uom':
      this.uomOptions = this.uomOptionsPref;
      this.showFullList.uom = false;
      return;
      default:
        return;
    }

  }

  private disableVpSelect() {
    if (!this.vpOptions[0]) {
      return;
    }
    this.approverOptions.approvers = this.approverOptions.approvers.filter(obj => obj.fieldname !== 'Approver 999');
  }

  private async enableVpSelect() {
    console.log('enablevpselect');
    if (!this.vpOptions[0]) {
      this.spinner.show();
      await this.optionsService.getVpOptions(this.orderId, true).toPromise().then(res => {
        res.sort((a, b) => (a.displayname > b.displayname) ? 1 : -1);
        this.vpOptions = res;
      }).catch(err => {
        console.log(err);
        this.alertService.error(this.errTransService.returnMsg('vpOpts'));
      });
      this.spinner.hide();
    }
    console.log('approver option check');
    console.log(this.approverOptions.approvers);
    console.log(this.vpOptions);
    this.vpOptions = this.vpOptions.filter(x => x.id !== this.warnId);
    this.approverOptions.approvers = this.approverOptions.approvers.concat({
      fieldname: 'Approver 999',
      users: this.vpOptions
    });
    const temp = this.approverOptions.approvers;
    this.approverOptions.approvers = [];
    this.canSeeApprovers = false;
    setTimeout(() => { this.approverOptions.approvers = temp; this.canSeeApprovers = true; });
    // force reload ngfor
    // Force the display to update by modifying the object
    /*  += [{
      fieldname: 'Approver 999',
      users: this.vpOptions
    }]; */
    console.log(this.approverOptions.approvers);
  }

  private selectOnlyValue(form, property, desiredValue) {
    // tslint:disable-next-line: prefer-const
    let temp: any = {};
    temp[property] = desiredValue;
    form.patchValue(temp);
  }

  private applyPrefs(prefs: any): any { // set preferences from gathered user info
    console.log('---applyPrefs---');
    console.log(prefs);

    this.requestDetailsForm.patchValue({
      /* company: this.companyOptions.find(obj => obj.id === prefs.company), TODO: fix UI result */
      purchaseCategory: prefs.purchaseCategory,
      // porType: prefs.porType,
      requesterCostCenter: prefs.requesterCostCenter
    });
    this.onCategoryChange();
  }

  onCommsChange() {
    if (this.debug) { console.log('hi'); }
    const emailVal = this.requestDetailsForm.get('email');
    const faxVal = this.requestDetailsForm.get('fax');
    if (!this.requestDetailsForm.value.sendEmail) {
      emailVal.disable();
      this.requestDetailsForm.get('sendFax').enable();
    } else {
      emailVal.enable();
      this.requestDetailsForm.get('sendFax').disable();
    }
    if (!this.requestDetailsForm.value.sendFax) {
      faxVal.disable();
      this.requestDetailsForm.get('sendEmail').enable();
    } else {
      faxVal.enable();
      this.requestDetailsForm.get('sendEmail').disable();
    }
    this.onFormChange();
  }
  async onCategoryChange() {
    if (this.requestDetailsForm.value.purchaseCategory) {
      this.requestDetailsForm.get('company').enable();
    }
    const temp = this.requestDetailsForm.value.company;
    if (temp) {
      const code = temp.companyCode;
      if (this.router.url.indexOf('draft') >= 0) {
        if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.itemDetails) {
          this.poDetails.porRequest.itemDetails.forEach(item => {
            if (this.pref.GLAccount && !this.pref.GLAccount.includes(item.distribution[0].glAccountMasterId)) {
              this.pref.GLAccount.push(item.distribution[0].glAccountMasterId);
            }
          });
        }
      }
      this.glAccountOptionsPref = this.pref.GLAccount && this.pref.GLAccount.length && this.requestDetailsForm.value.purchaseCategory ?
      (await this.optionsService.getSelectedGlAccount(this.requestDetailsForm.value.purchaseCategory, code, this.pref.GLAccount).toPromise()
      .catch(err => console.log(err))) : [];
      if (this.glAccountOptionsPref && this.glAccountOptionsPref.length > 0) {
        this.glAccountOptions = this.glAccountOptionsPref;
        this.glAccountOptionsAll = [];
        this.showFullList.glaccount = false;
      } else {
        this.glAccountOptions = [];
        this.glAccountOptionsAll = [];
        this.showMore('glaccount');
      }

    }
    // tslint:disable-next-line: max-line-length
    // this.costObjectInfoForm.patchValue({ gl_account_number: '', cost_center_code: '', asset_class: '', asset_number: '', io_number: '' });
    let category1;
    const categoryId = Number(this.requestDetailsForm.value.purchaseCategory);
    for (const category of this.purchaseCategoryOptions) {
      if (category.ID === categoryId) {
        category1 = category.category1;
      }
    }
    console.log('category value is ===>' + category1);
    this.onPorTypeChange1(category1);
  }
  onPorTypeChange1(category) {
    // this.onFormChange();
    console.log('got catagory value is ' + category);
    for (const row of this.tableForm) {
      row.glAccountMasterId = null;
      row.costCenterId = null;
      row.assetClass = null;
      row.assetNumber = null;
      row.ioNumber = null;
      row.profitCenter = null;
    }
    /* this.costObjectInfoForm.patchValue
      ({ gl_account_number: null, cost_center_code: null, asset_class: null, asset_number: null, io_number: null, profit_center: null }); */

    for (const item of this.porOptions) {
      if (item.reference === category) {
        this.chosenPor = item;
      }
    }
    this.onCostCenterChange();
  }
  /*onPorTypeChange() {
    this.costObjectInfoForm.patchValue({ gl_account_number: '', cost_center_code: '', asset_class: '', asset_number: '', io_number: '' });
    const porId = Number(this.requestDetailsForm.value.porType);
    for (const item of this.porOptions) {
      if (item.id === porId) {
        this.chosenPor = item;
      }
    }

    this.onCostCenterChange(); // will call onFormChange in onCostCenterChagne();
  }*/

  clearCostObject() {
    const coProps = ['glAccountMasterId', 'costCenterId', 'assetClass', 'assetNumber', 'ioNumber', 'profitCenter'];
    for (const row of this.tableForm) {
      for (const prop of coProps) {
        if (row[prop]) {
          row[prop] = null;
        }
      }
    }
  }

  checkBuyerOptions(code) {
    if (code && (code.toString() === '1000' || code.toString() === '2000')) {
      this.hideBuyer = true;
      this.buyer_code = null;
      this.buyer_id = null;
    } else {
      this.hideBuyer = false;
    }
  }

  onCompanyChange() {
    this.clearCostObject();
    const temp = this.requestDetailsForm.value.company;
    this.checkBuyerOptions(temp ? temp.companyCode : null);
    if (temp && temp.country) {
      this.requestDetailsForm.patchValue({
        shipToName: this.pref.shipToName || temp.name,
        shipToStreet: this.pref.shipToStreet || temp.street,
        shipToCity: this.pref.shipToCity || temp.city,
        shipToZip: this.pref.shipToZip || temp.postalCode,
        shipToCountry: this.pref.shipToCountry || temp.countryCode,
        requesterCostCenter: null,
        buyer: null,
        vendor: null,
        vendorDetails: this.errTransService.returnMsg('Select a vendor!')
      });
      if (this.pref.shipToCountry) {
        this.requestDetailsForm.patchValue({ shipToState: this.pref.shipToState || null });
      } else {
      this.onCountryChange();
      this.requestDetailsForm.patchValue({ shipToState: temp.stateCode }); // countryChange resets state
      }
      this.onVendorClear(null);
      this.requestDetailsForm.get('requesterCostCenter').enable();
      this.requestDetailsForm.get('vendor').enable();
    } else {
      this.requestDetailsForm.patchValue({
        shipToName: '',
        shipToStreet: '',
        shipToCity: '',
        shipToState: null,
        shipToZip: '',
        shipToCountry: null,
        requesterCostCenter: null,
        vendor: null,
        vendorDetails: this.errTransService.returnMsg('Select a vendor!'),
        buyer: null
      });
      this.onCountryChange();
      this.onVendorClear(null);
      this.requestDetailsForm.get('requesterCostCenter').disable();
      this.requestDetailsForm.get('vendor').disable();
      this.onFormChange();
      return;
    }
    this.getCompanyBasedOptions(temp.companyCode, temp.purchaseOrg);

    this.onFormChange();
  }

  onSelectedMaterialOption() {
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.tableForm.length; index++) {
      const row = this.tableForm[index];
      if (row.material) {
        console.log('---' + row.material.uom);
        row.shortText = row.material.description;
        row.vendorMaterialNo = row.material.vendorMaterialNum;
        // tslint:disable-next-line: triple-equals
        row.uom = this.uomOptions.find(x => x.unit == row.material.uom).id;
      }
    }
    this.onFormChange();
    return;
  }

  async getCompanyBasedOptions(code, org) {
    this.spinner.show('detailsSpinner', {fullScreen: false});
    if (code && org) {
      /* this.glAccountOptions = await this.optionsService.getSpecificGlAccount(code).toPromise(); */
      if (this.router.url.indexOf('draft') >= 0) {
        if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.itemDetails) {
          this.poDetails.porRequest.itemDetails.forEach(item => {
            if (this.pref.GLAccount && !this.pref.GLAccount.includes(item.distribution[0].glAccountMasterId)) {
              this.pref.GLAccount.push(item.distribution[0].glAccountMasterId);
            }
          });
        }
        if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.vendor.id && this.pref.vendor &&
          !this.pref.vendor.includes(this.poDetails.porRequest.vendor.id)) {
            this.pref.vendor.push(this.poDetails.porRequest.vendor.id);
        }
        if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.costCenter.id && this.pref.costCenter &&
          !this.pref.costCenter.includes(this.poDetails.porRequest.costCenter.id)) {
            this.pref.costCenter.push(this.poDetails.porRequest.costCenter.id);
        }
      }

      this.glAccountOptionsPref = this.pref.GLAccount && this.pref.GLAccount.length ?
      (await this.optionsService.getSelectedGlAccount(this.requestDetailsForm.value.purchaseCategory, code, this.pref.GLAccount).toPromise()
      .catch(err => console.log(err))) : [];
      this.showFullList.glaccount = false;
      if (this.glAccountOptionsPref.length) {
        this.glAccountOptions = this.glAccountOptionsPref;
        this.glAccountOptionsAll = [];
        this.showFullList.glaccount = false;
      } else {
        this.glAccountOptions = [];
        this.glAccountOptionsAll = [];
        this.showMore('glaccount');
      }

      this.vendorOptionsPref = this.pref.vendor && this.pref.vendor.length ?
      await this.optionsService.getSelectedVendors(org, this.pref.vendor).toPromise() : [];
      if (this.vendorOptionsPref.length) {
        this.vendorOptions = this.vendorOptionsPref;
        this.vendorOptionsAll = [];
        this.showFullList.vendor = false;
      } else {
        this.vendorOptions = [];
        this.vendorOptionsAll = [];
        this.showMore('vendor');
      }

      this.assetClassOptions = await this.optionsService.getSpecificAssetClass(code).toPromise();
      this.assetNumberOptions = await this.optionsService.getSpecificAssetNumber(code).toPromise();

      this.costCenterOptionsPref = this.pref.costCenter && this.pref.costCenter.length ?
      await this.optionsService.getSelectedCostCenter(code, this.pref.costCenter).toPromise() : [];
      if (this.costCenterOptionsPref.length) {
        this.costCenterOptions = this.costCenterOptionsPref;
        this.costCenterOptionsAll = [];
        this.showFullList.costCenter = false;
      } else {
        this.costCenterOptions = [];
        this.costCenterOptionsAll = [];
        this.showMore('costCenter');
      }

      this.materialOptions = await this.optionsService.getSpecificMaterial(code).toPromise()
        .catch(err => {
           console.log(err);
           if (code.match(this.brazil)) {
             this.alertService.error(this.errTransService.returnMsg('matOpts'));
           }
          });
      this.checkBuyerOptions(code);
      if (!this.hideBuyer) {
        await this.optionsService.getBuyers(code).toPromise().then(res => {
          this.buyerOptions = res;
          if (res && res.length === 1) {
            this.requestDetailsForm.patchValue({ buyer: res[0] });
            this.onBuyerChange(res[0]);
          }
        }).catch(err => {
          this.alertService.error(this.errTransService.returnMsg('cantFindBuyer'));
          console.log(err);
        });
        console.log('buyer code is-->' + this.buyerOptions);
      }

    }
    this.spinner.hide('detailsSpinner');
  }

  onCostCenterChange(newVal?) {
    this.alertService.clear('costCenterHeaderAlert');
    this.errorList.invalidCostCenter = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidCostCenter = true;
      this.alertService.error(this.errTransService.returnMsg('costcenterLock'), {id: 'costCenterHeaderAlert'});
    }
    let index = 0;
    for (const row of this.tableForm) {
      if (!row.costCenterId) {
        row.costCenterId = this.requestDetailsForm.value.requesterCostCenter;
        this.onItemDetailCCChange(newVal, index);
      }
      row.ioNumber = null;
      row.ioOptions = null;
      if (this.requestDetailsForm.value.requesterCostCenter && row.glAccountMasterId) {
        this.loadIOOptions(row.glAccountMasterId, row);
      }
      index ++;
    }
    this.onFormChange();
  }

  onItemDetailCCChange(newVal, i) {
    this.alertService.clear('costCenterLocked' + i);
    this.errorList.invalidItemCC[i] = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidItemCC[i] = true;
      this.alertService.error(this.errTransService.returnMsg('costcenterLock'), {id: ('costCenterLocked' + i)});
    }
    this.onFormChange();
  }

  onItemDetailAssetChange(newVal, i) {
    this.alertService.clear('assetClassLocked' + i);
    this.errorList.invalidItemAsset[i] = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidItemAsset[i] = true;
      this.alertService.error(this.errTransService.returnMsg('assetclassLock'), {id: ('assetClassLocked' + i)});
    }
    this.onFormChange();
  }

  onItemDetailsIOChange(newVal, i) {
    this.alertService.clear('ioNumberLocked' + i);
    this.errorList.invalidItemIO[i] = false;
    if (newVal && newVal.closed) {
      this.errorList.invalidItemIO[i] = true;
      this.alertService.error(this.errTransService.returnMsg('IOClose'), {id: ('ioNumberLocked' + i)});
    }
    this.onFormChange();
  }

  onItemDetailsPCChange(newVal, i) {
    this.alertService.clear('profitCenterLocked' + i);
    this.errorList.invalidItemPC[i] = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidItemPC[i] = true;
      this.alertService.error(this.errTransService.returnMsg('pcLock'), {id: ('profitCenterLocked' + i)});
    }
    this.onFormChange();
  }

  async onGlAccountChange(row, glObj, i) {
    this.alertService.clear('glAccountMasterIdLocked' + i);
    this.errorList.invalidItemGlAccount[i] = false;
    row.ioNumber = null;
    if (!glObj) {
      row.ioOptions = null;
      this.onFormChange();
      return;
    }
    if (glObj.locked) {
      this.errorList.invalidItemGlAccount[i] = true;
      this.alertService.error(this.errTransService.returnMsg('glLock'), {id: ('glAccountMasterIdLocked' + i)});
    }

    this.spinner.show('itemSpinner', {fullScreen: false, type: 'ball-spin-clockwise'});
    const glId = glObj.id;
    console.log(glId);
    const cmp = this.requestDetailsForm.value.company;
    const cct = this.requestDetailsForm.value.requesterCostCenter;
    row.ioOptions = null;
    await this.optionsService.getIoWithGLAccount(glId, cct, cmp.companyCode).toPromise().then(x => {
      if (x.internalOrder[0]) {
        row.ioOptions = x;
      }
    }).catch(x => { console.log(x.message + '| Failed to find options for this GL account'); });

    this.onFormChange();
    this.spinner.hide('itemSpinner');
  }

  async loadIOOptions (glId, row) {
    console.log(glId);
    const cmp = this.requestDetailsForm.value.company;
    const cct = this.requestDetailsForm.value.requesterCostCenter;
    row.ioOptions = null;
    await this.optionsService.getIoWithGLAccount(glId, cct, cmp.companyCode).toPromise().then(x => {
      if (x.internalOrder[0]) {
        row.ioOptions = x;
      }
    }).catch(x => { console.log(x.message + '| Failed to find options for this GL account'); });

    this.onFormChange();

  }

  checkForms() {
    console.log(this.typeForm.value);
    console.log(this.requestDetailsForm.value);
    console.log(this.tableForm); console.log('CHECK THESE: ', this.tableForm[0].totalCost, this.tableForm[0].totalUsd);
    /* console.log(this.costObjectInfoForm.value); */
    console.log(this.commentsForm.value);
    console.log(this.aduserForm.value);
    for (const watcher of this.watchers) {
      console.log(watcher.ID, watcher.firstname, watcher.lastname);
    }
  }

  onCurrencyChange() {
    for (const row of this.tableForm) {
      row.orderCurrency = this.requestDetailsForm.value.currency;
      if (row.totalCost) {
        this.calculateUsdCost(row);
      }
    }
    this.onFormChange();
  }

  addTableValue() {
    this.nA = {};
    if (this.tableForm[0]) {
      if (this.tableForm[0].glAccountMasterId) {
        this.nA.glAccountMasterId = this.tableForm[0].glAccountMasterId;
        if (this.tableForm[0].ioOptions) {
          this.nA.ioOptions = this.tableForm[0].ioOptions;
        }
      }
      if (this.tableForm[0].costCenterId) {
        this.nA.costCenterId = this.tableForm[0].costCenterId;
      }
      if (this.tableForm[0].assetClass) {
        this.nA.assetClass = this.tableForm[0].assetClass;
      }
      if (this.tableForm[0].assetNumber) {
        this.nA.assetNumber = this.tableForm[0].assetNumber;
      }
      if (this.tableForm[0].ioNumber) {
        this.nA.ioNumber = this.tableForm[0].ioNumber;
      }
      if (this.tableForm[0].profitCenter) {
        this.nA.profitCenter = this.tableForm[0].profitCenter;
      }
    }
    if (this.phase1) { this.nA.tableExtraDistributionBasis = 1; }
    this.nA.priceUnit = 1; // Bi default value
    if (this.requestDetailsForm.value.currency) { this.nA.orderCurrency = this.requestDetailsForm.value.currency; }
    this.tableForm.push(this.nA);
    this.nA = {};
  }

  deleteTableValue(i) {
    this.tableForm.splice(i, 1);
  }

  toggleTableExtra(row) {
    if (!row.extra) {
      row.extra = true;
      row.extraOpen = true;
      row.extraTable = [];
      row.tableExtraDistributionBasis = 1;
      this.addTableExtra(row);
    } else {
      row.extraOpen = !row.extraOpen;
    }
  }

  removeTableExtra(row) {
    row.extra = false;
    row.extraOpen = false;
    row.extraText = '';
    row.extraTable = [];
  }

  addTableExtra(row) {
    // if (this.requestDetailsForm.value.requesterCostCenter) {
    // this.nA.extraRowCostCenter = this.requestDetailsForm.value.requesterCostCenter;
    if (row.costCenterId) {
      this.nA.extraRowCostCenter = row.costCenterId;
    }
    if (row.glAccountMasterId) {
      this.nA.extraRowGlAccount = row.glAccountMasterId;
    }
    if (row.assetClass) {
      this.nA.extraRowAssetclass = row.assetClass;
    }
    if (row.assetNumber) {
      this.nA.extraRowAssetnumber = row.assetNumber;
    }
    if (row.ioNumber) {
      this.nA.extraInternalOrder = row.ioNumber;
    }
    if (row.profitCenter) {
      this.nA.extraProfitCenter = row.profitCenter;
    }
    if (row.qty) {
      this.nA.extraRowQty = row.qty;
    }

    row.extraTable.push(this.nA);
    this.nA = {};
  }

  deleteExtraValue(row, i) {
    /* row.extraTable.splice(i, 1); */
    if (row.extraTable.length === 1) {
      this.removeTableExtra(row);
    } else {
      row.extraTable.splice(i, 1);
    }
  }

  onRowUpdate(row) {
    if (row.unitCost && row.qty && row.priceUnit) {
      const costCalculate = row.unitCost / row.priceUnit;
      row.totalCost = Number((row.qty * costCalculate).toFixed(2));
      if (row.orderCurrency) {
        this.calculateUsdCost(row);
      }
    }
    this.onFormChange();
  }

  async calculateUsdCost(row) {
    // tslint:disable-next-line: triple-equals
    const sendCurrency = this.currencyOptions.find(obj => obj.ID == row.orderCurrency).currency;
    console.log('sendCurrency==>' + sendCurrency);
    const returnme = await this.optionsService.getInUsd(sendCurrency, row.totalCost).toPromise().catch(err => {
      this.alertService.error(this.errTransService.returnMsg('currencyFail'));
      console.log(err);
      this.requestDetailsForm.patchValue({currency: null});
    });
    console.log('returnme==>' + returnme);
    row.totalUsd = Number(JSON.stringify(returnme)).toFixed(2);
  }

  onCheckFree(row) {
    if (row.isFree) {
        row.unitCost = 0;
        row.totalCost = 0;
        row.totalUsd = 0;
    }
  }

  onReviewClick() {
    this.draft = true;
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }


    let myId = 0;
    try {
      const varName = this.userClaims.preferred_username;
      // tslint:disable-next-line: triple-equals
      myId = this.adUsers.find(obj => obj.employeeId == varName).ID;

    } catch (e) {
      console.log('Unauthorized user. See error: ' + e);
      myId = 0; // This means there is no authorized user
    }

    if (localStorage.getItem('proxyUserID')) {
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    console.log(this.userFullName[0]);
    console.log(this.userFullName[1]);
    console.log(myId);


    if (this.debug) {
      console.log('you clicked the button');
    }
    this.validateForms().then( res => {
      this.sendAllData('Review', res);
     }).catch(err => console.log(this.errTransService.returnMsg('cantValidateErr') + ' ' + err));
  }

  private initialAutoSelectApprovers() {
    let edited = false;
    if (this.canSeeApprovers) {
      for (const entry of this.approverOptions.approvers) {
        if (entry.users && entry.users.length === 1) {
          this.approverFormInfo[entry.fieldname] = entry.users[0].id;
          edited = true;
        }
        if (this.requestDetailsForm.controls.requester.value && !this.approverFormInfo[entry.fieldname]) {
          if (entry.users && entry.users.filter(obj => obj.id === this.requestDetailsForm.controls.requester.value.id)[0]) {
            this.approverFormInfo[entry.fieldname] = this.requestDetailsForm.controls.requester.value.id;
            edited = true;
          }
        }
        const userAdId = this.getUserAdId();
        if (entry.users && entry.users.filter(obj => obj.id === userAdId)[0] && !this.approverFormInfo[entry.fieldname]) {
          this.approverFormInfo[entry.fieldname] = userAdId;
          edited = true;
        }
      }
    }
    if (edited) {
      this.onApproversChange();
    }
  }


  onHomeClick() {
    this.router.navigateByUrl('home');
  }

  onFormChange(field?: string) {
    if (field && field === 'requester' && this.requestDetailsForm &&
     this.requestDetailsForm.value.requester && this.requestDetailsForm.value.requester.displayname) {
      this.requestDetailsForm.controls.shipToAttentionTo.setValue(this.requestDetailsForm.value.requester.displayname);
    }
    if (this.canSeeApprovers) {
      this.canSeeApprovers = false;
      this.approverFormInfo = {};
      this.approverOptions = { approvers: [] };
      /* this.additionalApprovers = 0; */
      this.additionalApprover = [];
      this.canSeeHierarchy = false;
      this.hierarchy = [];
    }
  }

  onContractDateChange(control: string) {
    if (this.requestDetailsForm.controls.startDate.value > this.requestDetailsForm.controls.endDate.value) {
      this.alertService.error(this.errTransService.returnMsg('startBefore'));
      this.requestDetailsForm.controls[control].reset();
    }
    this.onFormChange();
  }

  onApproversChange(item?, additional?) {
    console.log('onapproverschange');
    this.checkForVp();
    console.log(item);
    if (this.canSeeHierarchy) { this.canSeeHierarchy = false; this.hierarchy = []; }
    if (item) {
      if (Number(item.id) === this.warnId) {
        this.alertService.warn(this.errTransService.returnMsg('hiLvAppr'));
      }
      if (Number(item.id) === this.requestDetailsForm.value.requester.id) {
        this.alertService.error(this.errTransService.returnMsg('reqApprSame'));
      }
    }
    if (additional) {
      if (additional.id === this.warnId) {
        this.alertService.warn(this.errTransService.returnMsg('hiLvAppr'));
      }
    }
  }

  private checkForVp() {
    console.log('checkforvp');
    const checkForHLA = this.constructCurrentApproverData(this.hiddenList);
    /* for (const num of checkForHLA) { */
    const num = checkForHLA.filter(x => x.id === this.warnId);
    if (num[0] && !checkForHLA.filter(obj => obj.level >= 5 && obj.id !== this.warnId)[0] &&
          !this.approverOptions.approvers.filter(obj => obj.fieldname === 'Approver 999')[0]) {
        this.enableVpSelect();
        } else if ((!num[0] || checkForHLA.filter(obj => obj.level >= 5 && obj.id !== this.warnId)[0])) {
          this.disableVpSelect();
        } else {
          return;
        }
      /* } */
  }

  approverFieldDisplay(fieldname) {
    const check = /Approver * \d*/;
    if (fieldname.match(check)) {
      return this.errTransService.returnMsg('Approver', true);
    }
    return this.errTransService.returnMsg(fieldname, true);
  }

  async onAddApprover() {
    if (!this.approverOptions.additionalapprovers) {
      await this.getAdditionalApprovers(this.orderId);
    }
    this.additionalApprover.push({
      value: null,
      users: [...this.approverOptions.additionalapprovers[0].users]
     });
    this.constructCurrentApproverData();
    console.log(this.additionalApprover);
  }

  onRemoveApprover(approver: { value: number }) {
    console.log(this.additionalApprover);
    console.log(this.adUsers.find(usr => usr.ID === approver.value));
    this.additionalApprover.splice(this.additionalApprover.indexOf(approver), 1);
    this.canSeeHierarchy = false; this.hierarchy = [];
  }

  async onApproverPreviewClick() {
    this.draft = false;
    let isValidated;
    await this.validateForms().then( res => {
      isValidated = res;
      this.sendAllData('Preview', isValidated);
     }).catch(err => console.log(this.errTransService.returnMsg('cantValidateErr') + ' ' + err));

    if (isValidated && !this.poErrorFlag) {
      if (!this.hierarchy) {
        this.hierarchy = [{ Name: 'Loading...' }];
      }
      this.canSeeHierarchy = true;
    }
    if (this.poErrorFlag) {
      this.onApproversChange();
      this.poErrorFlag = false;
    }
  }

  onVendorChange(item) {
    this.alertService.clear('vendorLocked');
    this.errorList.invalidVendor = false;
    if (!item) {
      this.onVendorClear(null);
      return;
    }
    if (item.deletedCompany || item.blockedPurchasingOrg || item.blockedCompany || item.deletedPurchasingOrg) {
      this.errorList.invalidVendor = true;
      this.alertService.error(this.errTransService.returnMsg('vendorLock'), {id: 'vendorLocked'});
    }
    if (item.searchable) {
      this.requestDetailsForm.patchValue({
        detailsField: String
          /* (document.getElementById('vendor#' + this.requestDetailsForm.value.vendor).innerText).split(', ').join('\n') */
          (item.searchable).replace(/, /g, ',').split(',').join('\n'),
        fax: item.phone, /* TODO: find the fax number?? Idk */
        email: item.email
      });
    } else {
      console.log('the user entered a value that is not in the vendor DB table.');
    }
    if (item.orderCurrency) {
      const temp = this.currencyOptions.find(curr => curr.currency === item.orderCurrency).ID;
      if (temp) {
        this.requestDetailsForm.patchValue({ currency: temp });
        this.onCurrencyChange();
      }
    }
  }

  onVendorClear(event) {
    this.requestDetailsForm.patchValue({ detailsField: this.errTransService.returnMsg('Select a vendor!') });
  }
  onBuyerChange(item) {

    if (!item) {
      return;
    }
    const userInfo = this.adUsers.find(obj => obj.employeeId == item.employeeId);
    this.buyer_code = item.buyerCode;
    this.buyer_id = userInfo.ID;
    console.log('--buyer code is--' + this.buyer_code);
    console.log('--buyer id is--' + this.buyer_id);
  }

  onFileUpload(files: FileList) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.filesToUpload.append('fileArray', files[i], files[i].name);
      this.filesToDisplay.push(files[i].name);
    }
    console.log(this.filesToUpload);
    /* this.filesToUpload = files; */
    /* document.getElementById('uploadFileLabel').innerText = Array.from(files).map(f => f.name).join(', '); */
    if (this.orderId !== 0) {
      this.prepareFileUpload();
    }
    // this.onFormChange();
  }

  async onRemoveSelectedFile(name) {
    if (this.orderId === 0) { // files not uploaded yet in this case
      this.filesToUpload.delete(name);
      this.filesToDisplay.splice(this.filesToDisplay.indexOf(name), 1);
      return;
    }
    await this.optionsService.deleteFile(this.orderId, name).toPromise().then(res => {
      this.filesToUpload.delete(name);
      this.filesToDisplay.splice(this.filesToDisplay.indexOf(name), 1);
    }).catch(err => {
      this.alertService.error(this.errTransService.returnMsg('fileDelErr') + ': ' + name);
      console.log(err);
    });
  }

  async updateAttachmentList() {
    this.uploadedFiles = this.cachedData.fileList ||
     await this.poDetailsService.getPorAttachments(this.orderId).toPromise();
  }

  onAddWatcher() {
    // Duplicates are prevented in HTML with *ngIf hiding users already in watchers array
    if (!this.chosenWatcher) { return; }
    // tslint:disable-next-line: triple-equals
    const pushVal = this.adUsers.find(obj => obj.ID == this.chosenWatcher);
    if (this.watchers.indexOf(pushVal) > -1) {
      return;
    }
    this.watchers.push(pushVal);
    this.chosenWatcher = null;
  }

  onRemoveWatcher(watcher: AdUser) {
    this.watchers.splice(this.watchers.indexOf(watcher), 1);
  }

  onSumbit() {
    this.prepareFileUpload();
    this.validateForms().then( res => {
      this.sendAllData('Submit', res);
     }).catch(err => console.log(this.errTransService.returnMsg('cantValidateErr') + ' ' + err));

    console.log('pr id is -->' + this.approverOptions.id);
  }

  private async prepareFileUpload() { // Only call in onSubmit() or onNoPreviewSumbit() !!
    this.filesUploading = true;
    if (this.filesToUpload) {
       await this.optionsService.uploadFile(this.filesToUpload, this.orderId).toPromise()
        .then(res => {
          this.filesUploading = false;
          console.log(res);
          this.updateAttachmentList();
          this.filesToUpload = new FormData();
          this.filesToDisplay = [];
        }).catch(err => {
          this.alertService.error(this.errTransService.returnMsg('fileProblem'));
          console.log(err);
          this.filesUploading = false;
          this.filesToUpload = new FormData(); // better to reset since there isn't a retry button, just let them re-pick the files.
          this.filesToDisplay = [];
        });
    }
  }

  onCancelDraft() {
    console.log('pr id is -->' + this.approverOptions.id);
    const id = this.approverOptions.id;
    if (!id) {
      this.alertService.info(this.errTransService.returnMsg('noDraft'));
      return false;
    }
    if (confirm(this.errTransService.returnMsg('sureRemovePR', true) + id + '?')) {
      console.log('Implement delete functionality here');
      this.optionsService.cancelDraft(id).subscribe(x => {
        this.draft = false;
        this.router.navigateByUrl('ncrequest');
      },
      e => {
        this.router.navigateByUrl('ncrequest');
      });
    }

  }

  async onNoPreviewSubmit() {
    let isValid;
    await this.validateForms().then( res => {
      isValid = res;
      this.sendAllData('Preview', isValid);
     }).catch(err => console.log(this.errTransService.returnMsg('cantValidateErr') + ' ' + err));

    if (isValid && !this.poErrorFlag) {
      if (!this.hierarchy) {
        this.hierarchy = [{ Name: 'Loading...' }];
      }
      this.canSeeHierarchy = true;
    }
    if (this.poErrorFlag) {
      this.onApproversChange();
      this.poErrorFlag = false;
      return;
    }
    // TODO: add wait for hierarchy to be displayed if that's still a concern
    this.prepareFileUpload();
    this.sendAllData('Submit', isValid);
    console.log('pr id is -->' + this.approverOptions.id);
  }

  async validateAddress() : Promise<any> {
    // let flag = true;
    let addressValidation = {isValid : true, msg : null};
    const verifyAddress: any = {
      SHIPTO_STREET: this.requestDetailsForm.value.shipToStreet,
      SHIPTO_CITY: this.requestDetailsForm.value.shipToCity,
      SHIPTO_STATE: this.requestDetailsForm.value.shipToState,
      SHIPTO_POSTAL_CODE: this.requestDetailsForm.value.shipToZip,
      SHIPTO_COUNTRY_CODE: this.requestDetailsForm.value.shipToCountry
    };
    await this.optionsService.verifyAddress(JSON.stringify(verifyAddress)).toPromise().then( x => {
      console.log('inside method validation');
      console.log('--respnse is ----' + x);
      console.log(x.VALID);
      if (x.VALID === 'TRUE') {
        // if valid set the address returned by api
        this.requestDetailsForm.controls.shipToStreet.setValue(x.STREET);
        this.requestDetailsForm.controls.shipToCity.setValue(x.CITY);
        this.requestDetailsForm.controls.shipToState.setValue(x.STATE);
        this.requestDetailsForm.controls.shipToZip.setValue(x.POSTAL_CODE);
        this.requestDetailsForm.controls.shipToCountry.setValue(x.COUNTRY);

      } else {
        addressValidation.isValid = false;
        addressValidation.msg = x.WARNING;
      }
    });
    return addressValidation;
  }


  async validateForms(): Promise<boolean> {
    let status = true;

    let notValid = this.errTransService.returnMsg('errsInReq') + '\n';
    /*if(this.requestDetailsForm.value.company.companyCode==1000 || this.requestDetailsForm.value.company.companyCode==2000){
    await this.validateAddress().then( res => {
      status = res.isValid;
      if (!status) {
        notValid += res.msg;
      }
    }).catch(err => console.log(this.errTransService.returnMsg('cantValidateErr') + ' ' + err));
  }*/
    if (!this.typeForm.value.reqRadios) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('reqType');
    }
    if (!this.commentsForm.value.comments) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('enterDesc');

    }
    if (!this.requestDetailsForm.value.purchaseCategory) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('Purchase Category');
    }
    if (!this.requestDetailsForm.value.company) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('Company Code');
    }
    // port type needed to be removed according to new reqirement
    /* if (!this.requestDetailsForm.value.porType) {
       status = false;
       notValid += '\nPOR Type';
     }*/
    if (!this.requestDetailsForm.value.requester) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('Requester');
    }
    if (!this.requestDetailsForm.value.shipToAttentionTo) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('Attention To');
    }
    if (!this.requestDetailsForm.value.requesterCostCenter) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('detailsCC');
    }
    if (!this.requestDetailsForm.value.buyer && !this.hideBuyer) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('Buyer');
    }
    if (!this.requestDetailsForm.value.vendor && this.hideBuyer) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('Vendor');
    }
    if (!this.requestDetailsForm.value.currency) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('Order Currency');
    }
    // if (!this.requestDetailsForm.value.endDate) {
    //   status = false;
    //   notValid += '\nContract End Date';
    // }
    // if (!this.requestDetailsForm.value.startDate) {
    //   status = false;
    //   notValid += '\nContract Start Date';
    // }
    if (this.requestDetailsForm.value.sendEmail) {
      if (!this.requestDetailsForm.controls.email.value) {
        status = false;
        notValid += '\nEmail';
      }
    }
    if (this.requestDetailsForm.value.sendFax) {
      if (!this.requestDetailsForm.controls.fax.value) {
        status = false;
        notValid += '\nFax';
      }
    }

    if (this.errorList.invalidCostCenter) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('lockedCC');
    }
    if (this.errorList.invalidVendor) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('vendorLock');
    }

    if (this.requestDetailsForm.value.company && this.requestDetailsForm.value.company.companyCode.match(this.brazil)
        && this.requestDetailsForm.value.contractFlag) {
      if (!this.requestDetailsForm.value.startDate) {
        status = false;
        // tslint:disable-next-line: triple-equals
        if (this.typeForm.value.reqRadios != 2) {
          notValid += '\n' + this.errTransService.returnMsg('Contract Start Date');
        } else {
          notValid += '\n' + this.errTransService.returnMsg('Purchase Start Date');
        }
      }
      if (!this.requestDetailsForm.value.endDate) {
        status = false;
        // tslint:disable-next-line: triple-equals
        if (this.typeForm.value.reqRadios != 2) {
          notValid += '\n' + this.errTransService.returnMsg('Contract End Date');
        } else {
          notValid += '\n' + this.errTransService.returnMsg('Purchase End Date');
        }
      }
    }

    // tslint:disable-next-line: prefer-for-of
    let totalCost = 0;
    const headerCC = this.requestDetailsForm.controls.requesterCostCenter.value;
    let ccMatchFlag = false;
    for (let index = 0; index < this.tableForm.length; index++) {

      const row = this.tableForm[index];
      if (row.totalCost) {
        totalCost += row.totalCost;
        if (totalCost > 9999999999999) {
          status = false;
          if (!notValid.includes('Total Cost')) {
            notValid += '\n' + this.errTransService.returnMsg('largeTotalCost');
          }
        }
      }
      if (this.errorList.invalidItemCC[index]) {
        status = false;
        notValid += '\n' + this.errTransService.returnMsgWithParam('ccLock', [(index + 1)]);
      }
      if (this.errorList.invalidItemAsset[index]) {
        status = false;
        notValid += '\n' + this.errTransService.returnMsgWithParam('assetLock', [(index + 1)]);
      }
      if (this.errorList.invalidItemIO[index]) {
        status = false;
        notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('closedIO');
      }
      if (this.errorList.invalidItemPC[index]) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('pcLock');
      }
      if (this.errorList.invalidItemGlAccount[index]) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('glLock');
      }


      if (!row.shortText) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') +
        (index + 1) + ': ' + this.errTransService.returnMsg('Description');
      }
      if (!row.qty) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('Qty');
      } else {
        if (row.qty > 9999999999999) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('largeQty');
        }
      }
      if (!row.uom) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('UOM');
      }
      if (!row.deliveryDate) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('Delivery Date');
       } // else if (row.deliveryDate) {
      //   const now = new Date();
      //   now.setHours(0, 0, 0, 0);
      //   const chosen = new Date(row.deliveryDate.replace(/-/g, '/'));
      //   if (chosen < now) {
      //     status = false;
      //     notValid += '\nLine Item ' + (index + 1) + ': ' + 'Delivery Date must not be in the past.';
      //   }
      // }
      if (!row.unitCost && !row.isFree) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('Unit Cost');
      } else {
        if (row.unitCost > 9999999999999) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': '
          + this.errTransService.returnMsg('largeUnitCost');
        }
      }
      if (!row.orderCurrency) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('Order Currency');
      }
      if (row.extra && !this.phase1) {
        // tslint:disable-next-line: prefer-for-of
        for (let subIndex = 0; subIndex < row.extraTable.length; subIndex++) {
          const subRow = row.extraTable[subIndex];
          console.log('subrow is--->' + subRow);
          if (row.costCenterId && !subRow.extraRowCostCenter) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'Cost Center';
          }
          if (row.glAccountMasterId && !subRow.extraRowGlAccount) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'GL Account';
          }
          if (row.assetClass && !subRow.extraRowAssetclass) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'Asset Type';
          }
          if (row.assetNumber && !subRow.extraRowAssetnumber) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'Asset Number';
          }
          if (row.ioNumber && !subRow.extraInternalOrder) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'Internal Order';
          }
          if (row.profitCenter && !subRow.extraProfitCenter) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'Profit Center';
          }

          // tslint:disable-next-line: triple-equals
          if (row.tableExtraDistributionBasis == 1) {
            if (!subRow.extraRowQty) {
              status = false;
              notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'Qty';
              // tslint:disable-next-line: triple-equals
            } else if (row.tableExtraDistributionBasis == 2) {
              if (!subRow.extraRowPercentage) {
                status = false;
                notValid += '\nLine Item ' + (index + 1) + ', ' + this.errTransService.returnMsg('distrRow') + ' ' + (subIndex + 1) + ': ' + 'Percentage';
              }
            }
          }
        }
      }
      if (this.requestDetailsForm.value.company) {
        if (this.requestDetailsForm.value.company.companyCode.match(this.brazil)) {
          if (!row.material) {
            status = false;
            notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + 'Material';
          }
        }
        /* if (true) {
          if (!row.vendorMaterialNo) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ': ' + 'Vendor Material No.';
          }
        } */
      }
      // tslint:disable-next-line: triple-equals
      if (this.typeForm.value.reqRadios != 2) {
        if (!row.priceUnit) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
          this.errTransService.returnMsg('Price Unit');
        } else {
          if (row.priceUnit > 99999) {
            status = false;
            notValid +=  '\n' + this.errTransService.returnMsg('Line Item') +
            (index + 1) + ': ' + this.errTransService.returnMsg('largePU');
          }
        }
      }
      if (row.extra && !this.phase1) {
        let grandTotal = 0;
        // tslint:disable-next-line: triple-equals
        if (row.tableExtraDistributionBasis == 1) {
          // tslint:disable-next-line: prefer-for-of
          for (let subIndex = 0; subIndex < row.extraTable.length; subIndex++) {
            const subRow = row.extraTable[subIndex];
            grandTotal += Number(subRow.extraRowQty);
          }
          // tslint:disable-next-line: triple-equals
          if (grandTotal != row.qty) {
            status = false;
            notValid +=  '\n' + this.errTransService.returnMsg('Line Item')
            + (index + 1) + '\'s ' + this.errTransService.returnMsg('subNotEq');
          }
        } else {
          // tslint:disable-next-line: prefer-for-of
          for (let subIndex = 0; subIndex < row.extraTable.length; subIndex++) {
            const subRow = row.extraTable[subIndex];
            grandTotal += Number(subRow.extraRowPercentage);
          }
          // tslint:disable-next-line: triple-equals
          if (grandTotal != 100) {
            status = false;
            notValid +=  '\n' + this.errTransService.returnMsg('Line Item')
            + (index + 1) + '\'s ' + this.errTransService.returnMsg('fullPercent');
            if (this.debug) { console.log('Total percentage at this line item is: ' + grandTotal); }
          }
        }
      }
      if (this.chosenPor.glAccountNumber) {
        if (!row.glAccountMasterId) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('GL Account');
        }
      }
      if (this.chosenPor.costCenterCode) {
        if (!row.costCenterId) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('Cost Center');
        } else if (row.costCenterId === headerCC) {
          ccMatchFlag = true;
        }
      } else {
        ccMatchFlag = true; // don't throw an error if cost center is not mandatory
      }
      if (this.chosenPor.assetClass) {
        if (!row.assetClass) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('Asset Type');
        }
      }
      console.log(row.ioOptions);
      if (this.chosenPor.ioNumber && row.ioOptions && row.ioOptions.internalOrderFlag) {
        if (!row.ioNumber) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('Internal Order');
        }
      }
      if (this.chosenPor.profitCenter) {
        if (Number(this.requestDetailsForm.value.purchaseCategory) === 10 && !row.profitCenter) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('Profit Center');
        }
      }
    }
    if (!ccMatchFlag) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('ccHeaderErr');
    }

    if (this.canSeeApprovers) {
      if (this.additionalApprover) {
        this.additionalApprover.forEach((item, index) => {
          if (Number(item.value) === this.requestDetailsForm.value.requester.id) {
            status = false;
            notValid += '\n' +  this.errTransService.returnMsgWithParam('addlApprSame', [(index + 1)]);
          }
          if (!item.value) {
            status = false;
            notValid += '\n' +  this.errTransService.returnMsgWithParam('addlApprBl', [(index + 1)]);
          }
        });
      }
      if (this.approverOptions.approvers) {
        for (const entry of this.approverOptions.approvers) {
          if (!this.approverFormInfo[entry.fieldname]) {
            status = false;
            notValid += '\n' + this.errTransService.returnMsgWithParam('apprNot', [entry.fieldname]);
          }
        }
      }
    }


    console.log(this.tableForm);
    this.alertService.clear();
    if (status === false) {
      this.alertService.error(this.replaceNewline(notValid));
    }
    return status;
  }

  validateApproverSelection(): boolean {
    if (!this.canSeeApprovers) {
      return false;
    } else {
      let status = false;
      if (this.approverOptions.approvers) {
        for (const entry of this.approverOptions.approvers) {
          if (!this.approverFormInfo[entry.fieldname]) {
            status = true;
          }
        }
      }
      if (this.additionalApprover) {
        this.additionalApprover.forEach((item, index) => {
          if (Number(item.value) === this.requestDetailsForm.value.requester.id || !item.value) {
            status = true;
          }
        });
      }
      return status;
    }
  }

  // NEVER CALL THE BELOW FUNCTIONS FROM THE UI, ONLY CALL FROM OTHER FUNCTIONS

  private async sendAllData(buttonNo: string, canSend: boolean) {
    this.spinner.show();
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }


    let myId = 0;
    try {
      const varName = this.userClaims.preferred_username;
      // tslint:disable-next-line: triple-equals
      myId = this.adUsers.find(obj => obj.employeeId == varName).ID;

    } catch (e) {
      console.log('Unauthorized user. See error: ' + e);
      myId = 0; // This means there is no authorized user
    }

    if (localStorage.getItem('proxyUserID')) {
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    console.log(this.userFullName[0]);
    console.log(this.userFullName[1]);
    console.log(myId);

    if (this.additionalApprover) {
      this.additionalApprover.forEach((element, index) => {
        const temp = 'additionalApprover' + (index + 1);
        this.approverFormInfo[temp] = element.value;
      });
    }

    if (canSend === true) {
      const d = new Date();
      let vendorVal = this.requestDetailsForm.value.vendor;
      if (vendorVal) {
        vendorVal = vendorVal.id || null;
      }
      const sendMe: any = {
        orderType: Number(this.typeForm.value.reqRadios),
        orderDate: d.toUTCString(),
        // tslint:disable-next-line: triple-equals
        createdBy: myId,
        purchaseCategory: Number(this.requestDetailsForm.value.purchaseCategory),
        company: this.requestDetailsForm.value.company.id,
        // porType: Number(this.requestDetailsForm.value.porType),
        requester: this.requestDetailsForm.value.requester.id,
        costCenter: Number(this.requestDetailsForm.value.requesterCostCenter),
        vendor: vendorVal,
        vendorDetails: this.requestDetailsForm.value.vendorDetails,
        orderCurrency: Number(this.requestDetailsForm.value.currency),
        referenceNumber: this.requestDetailsForm.value.referenceNumber, // TODO: figure this out
        quotationNumber: this.requestDetailsForm.value.quotationNumber, // TODO: find out what renaming to Attention Number does
        offset: new Date(Date.now()).getTimezoneOffset(),
        budgetApproved: this.isApprovedForm.value.budgetApproved,
        budgetNotApproved: this.isApprovedForm.value.budgetNotApproved,
        contractInPlace: this.isApprovedForm.value.contractInPlace,
        email: this.requestDetailsForm.controls.email.value,
        fax: this.requestDetailsForm.controls.fax.value,
        /* costObjectGlAccount: Number(this.costObjectInfoForm.value.gl_account_number),
        costObjectCostCenter: Number(this.costObjectInfoForm.value.cost_center_code),
        costObjectAssetClass: Number(this.costObjectInfoForm.value.asset_class),
        costObjectAssetNumber: Number(this.costObjectInfoForm.value.asset_number),
        costObjectInternalOrder: Number(this.costObjectInfoForm.value.io_number),
        costObjectProfitCenter: Number(this.costObjectInfoForm.value.profit_center), */
        itemDetails: this.constructItemDetails(),
        comments: this.commentsForm.value.comments,
        commentList: this.constructCommentsJSON(myId),
        specialInstructions: this.commentsForm.value.specialInstructions,
        /* fileUpload: this.commentsForm.value.uploadFile, */
        watchers: this.constructWatchersJSON(),
        approvers: /* this.approverFormInfo */ this.constructApproversJSON(),
        additonalApprovers: this.constructAdditionalApproversList(),
        mode: buttonNo,
        cost: this.getFinalCost() || 0,
        status: 1,
        createdon: d.toUTCString(), // date
        createdat: d.toUTCString(), // time
        shipToName: this.requestDetailsForm.value.shipToName,
        shipToStreet: this.requestDetailsForm.value.shipToStreet,
        shipToCity: this.requestDetailsForm.value.shipToCity,
        shipToState: this.requestDetailsForm.value.shipToState,
        shipToZip: this.requestDetailsForm.value.shipToZip,
        shipToCountry: this.requestDetailsForm.value.shipToCountry,
        shipToAttentionTo: this.requestDetailsForm.value.shipToAttentionTo,
        buyerCode: this.buyer_code,
        buyerId: this.buyer_id,

      };
      if (this.requestDetailsForm.value.startDate) {
        sendMe.contractStartDate = new Date(this.requestDetailsForm.value.startDate).toUTCString();
      }
      if (this.requestDetailsForm.value.endDate) {
        sendMe.contractEndDate = new Date(this.requestDetailsForm.value.endDate).toUTCString();
      }
      sendMe.contractFlag = (this.requestDetailsForm.value.contractFlag ? 1 : 0);

      if (this.orderId !== 0) { sendMe.id = this.orderId; }
      if (!this.requestDetailsForm.value.sendEmail) {
        sendMe.email = '';
      }
      if (!this.requestDetailsForm.value.sendFax) {
        sendMe.fax = '';
      }

      if (this.debug) {
        console.log(sendMe);
      }

      if (sendMe.cost > 50000) {
        let found = 0;
        for (const item of new Set(sendMe.approvers)) {
          if (item < 0) {
            found ++;
          }
        }
        if (found < 2 && buttonNo === 'Preview') {
          this.alertService.error(this.errTransService.returnMsg('addlApprAdd'));
          this.poErrorFlag = true;
          this.spinner.hide();
          return;
        }
      }

      await this.optionsService.sendForm(JSON.stringify(sendMe), buttonNo.toLowerCase()).toPromise().then(x => {
        console.log('x is --' + x);
        console.log('pr id is--' + x.id);
        if (buttonNo === 'Review') {
          if (x && x.approvers) {
            x.approvers.forEach(approver => {
              approver.users.sort((a, b) => (a.displayname > b.displayname) ? 1 : -1);
            });
          }
          this.approverOptions = x;
          this.approverOptions.additionalapprovers = null; // Ensure this needs to be re-fetched each time the order is changed
          this.additionalApprover = []; // if user somehow resubmits without form change we need to force this to be empty
          this.canSeeApprovers = true;
          if (this.orderId === 0) {
            this.orderId = x.id;
          }
          this.documentStatus = 'DRAFT';
          if (!this.filesToDisplay[0] && !this.uploadedFiles[0]) {
            this.alertService.warn(this.errTransService.returnMsg('noFiles'));
          }
          if (!this.filesUploading) { this.prepareFileUpload(); }
          this.initialAutoSelectApprovers();
        }
        if (buttonNo === 'Preview') {
          this.hierarchy = x.hierarchy;
          if (this.hierarchy.length === 1) {
            this.onApproversChange();
            this.poErrorFlag = true;
            this.alertService.error(this.errTransService.returnMsg('addlApprAdd'));
            return;
          }
        }
        if (buttonNo === 'Submit') {
          this.spinner.hide();
          this.router.navigateByUrl('ncrequestview/' + this.approverOptions.id);
        } else {
          this.spinner.hide();
        }
      }).catch (err => {
        console.log(err);
        if (buttonNo === 'Review') {
          this.canSeeApprovers = false;
          let errMsg;
          if (err.error && err.error.message !== null) {
            errMsg = err.error.message;
          } else if (err.error && err.error.message === null) { // Apparently this is a condition for the 'datamine approvers' issue.
            errMsg = this.errTransService.returnMsg('cantDatamine');
          }
          this.alertService.error(this.errTransService.returnMsg('reqProcessErr') + ': ' + errMsg || err.message);
        } else {
          this.alertService.error(this.errTransService.returnMsg('reqProcessErr'));
        }
        this.spinner.hide();
      });
    } else {
      this.spinner.hide();
      this.disableSubmit = false;
      return;
    }
    this.spinner.hide();
    return; // in case PO error flag is inside the sendForm then function
  }
  private async getAdditionalApprovers(prId: number) {
    this.spinner.show();
    await this.optionsService.getAdditionalApprovers(prId, false).toPromise().then(res => {
      this.approverOptions.additionalapprovers = [];
      res.sort((a, b) => (a.displayname > b.displayname) ? 1 : -1);
      this.approverOptions.additionalapprovers.push( // Keep original data structure
        {
          users: res
        }
      );
      if (!this.approverOptions.additionalapprovers[0].users[0]) {
        this.alertService.error(this.errTransService.returnMsg('cantGetAdlApr'));
      }
    }).catch(err => {
      console.log(err);
      this.approverOptions.additionalapprovers = [].push({users: []}); // prevent ui error
      this.alertService.error(this.errTransService.returnMsg('cantGetAdlApr'));
    });
    this.spinner.hide();
  }

  private constructItemDetails(): any[] {
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    let myId = 0;
    const d = new Date();
    try {
      const varName = this.userClaims.preferred_username;
      // tslint:disable-next-line: triple-equals
      myId = this.adUsers.find(obj => obj.employeeId == varName).ID;
    } catch (e) {
      console.log('Unauthorized user. See error: ' + e);
      myId = 0; // this means there is no authorized user
    }
    if (localStorage.getItem('proxyUserID')) {
      console.log('using proxy user ID');
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    // tslint:disable-next-line: prefer-const
    let returnVal = []; let subtable = [];
    // tslint:disable-next-line: prefer-for-of
    if (this.debug) { console.log('entered constructItemDetails()... tableForm length is: ' + this.tableForm.length); }
    for (let index = 0; index < this.tableForm.length; index++) {
      const row = this.tableForm[index];
      if (this.phase1) {
        subtable.push({
          qty: row.qty,
          percentage: 100,
          costCenter: row.costCenterId,
          glAccount: row.glAccountMasterId,
          assetClass: row.assetClass,
          assetNumber: row.assetNumber,
          ioNumber: row.ioNumber,
          profitCenter: row.profitCenter,
          createdby: myId,
          createdon: d.toUTCString(), // date
          createdat: d.toUTCString() // time
        });
      } else if (row.extra) {
        // tslint:disable-next-line: prefer-for-of
        for (let subIndex = 0; subIndex < row.extraTable.length; subIndex++) {
          const subRow = row.extraTable[subIndex];
          subtable.push({
            qty: subRow.extraRowQty,
            percentage: subRow.extraRowPercentage,
            costCenter: subRow.extraRowCostCenter,
            glAccount: subRow.extraRowGlAccount,
            assetClass: subRow.extraRowAssetclass,
            assetNumber: subRow.extraRowAssetnumber,
            ioNumber: subRow.extraInternalOrder,
            profitCenter: subRow.extraProfitCenter,
            createdby: myId,
            createdon: d.toUTCString(), // date
            createdat: d.toUTCString()// time
          });
        }

        if (this.debug) { console.log('ReturnVal should be building...'); }
      }
      let temp;
      if (!row.material) {
        temp = '';
      } else {
        temp = row.material.materialNum;
      }
      returnVal.push({
        line: (index + 1),
        material: temp,
        description: row.shortText,
        vendorMaterialNo: row.vendorMaterialNo,
        qty: row.qty,
        uom: row.uom,
        deliveryDate: new Date(row.deliveryDate).toUTCString(),
        offset: new Date(Date.now()).getTimezoneOffset(),
        unitCost: Number(row.unitCost) || 0,
        priceUnit: Number(row.priceUnit),
        orderCurrency: Number(row.orderCurrency),
        totalCost: row.totalCost || 0,
        totalCostUsd: Number(row.totalUsd) || 0,
        isFree: row.isFree,
        additionalText: row.extraText,
        distributionBasis: Number(row.tableExtraDistributionBasis),
        distribution: subtable,
        createdby: myId,
        createdon: d.toUTCString(), // date
        createdat: d.toUTCString(), // time
        glAccountMasterId: row.glAccountMasterId,
        costCenterId: row.costCenterId,
        assetClass: row.assetClass,
        assetNumber: row.assetNumber,
        ioNumber: row.ioNumber,
        profitCenter: row.profitCenter
      });
      subtable = [];
    }

    return returnVal;
  }

  displayTotalCost(): string {
    let returnMe = 0;
    let notUsd = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.tableForm.length; index++) {
      const row = this.tableForm[index];
      returnMe += Number(row.totalUsd);
      notUsd += Number(row.totalCost);
    }
    if (isNaN(returnMe)) {
      return '';
    } else {
      let returnVal = this.errTransService.returnMsg('Total Cost') +  ' (USD): ' +
      (this.customCurrencyPipe.transform(returnMe.toFixed(2), 'USD' , this.numberFormat));
      const currencyType = this.getCurrencyType();
      if (currencyType.toLowerCase() !== 'usd') {
        returnVal += ' | ' + this.errTransService.returnMsg('Total Cost') + ' (' + currencyType + '): ' +
        (this.customCurrencyPipe.transform(notUsd.toFixed(2), currencyType , this.numberFormat));
      }
      return returnVal;
    }
  }

  getCurrencyType(): string {
    if (this.requestDetailsForm.value.currency) {
      return this.currencyOptions.find(x => x.ID === Number(this.requestDetailsForm.value.currency)).currency;
    }
    return '';
  }

  hideIfUsd(): boolean {
    try {
      if (this.currencyOptions.find(obj => obj.ID === Number(this.requestDetailsForm.get('currency').value)).currency === 'USD') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  private getFinalCost(): number {
    let returnMe = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.tableForm.length; index++) {
      const row = this.tableForm[index];
      returnMe += Number(row.totalUsd);
    }
    return returnMe;
  }

  private constructWatchersJSON(): any[] {
    // tslint:disable-next-line: prefer-const
    let returnVal = [];
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.watchers.length; index++) {
      const person = this.watchers[index];
      returnVal.push({
        id: person.ID
      });
    }
    return returnVal;

  }

  private constructCommentsJSON(myId: number): any[] {
    // tslint:disable-next-line: prefer-const
    let commentVal = [];
    const d = new Date();
    commentVal.push({
      comment: this.commentsForm.value.comments,
      addwho: myId
      // adddate: String(d.toISOString())
    });
    console.log('comments are--->' + commentVal);
    return commentVal;
  }
  private constructApproversJSON(): number[] {
    // tslint:disable-next-line: prefer-const
    let returnMe = [];
    for (const item of this.approverOptions.approvers) {
      /* if (!this.approverFormInfo[item.fieldname]) {
        status = false;
        notValid += '\nApprover Field: ' + item.fieldname;
      } */
      const check = /Approver *\d*/;
      if (item.fieldname.match(check)) {
        returnMe.push(Number(this.approverFormInfo[item.fieldname] * -1));
      } else { returnMe.push(Number(this.approverFormInfo[item.fieldname])); }
    }

    return returnMe;
  }

  private constructAdditionalApproversList(): number[] {
    // tslint:disable-next-line: prefer-const
    let returnMe = [];
    if (this.additionalApprover) {
      this.additionalApprover.forEach((element) => {
        returnMe.push(Number(element.value));
      });
    }
    return returnMe;
  }

  private filterApproverList(selectedApprovers) {
    this.additionalApprover.forEach((addApp) => {
      addApp.users = this.approverOptions.additionalapprovers[0].users.filter(
        (e) => {
          return !(selectedApprovers.find(o => o.id === e.id)) || e.id === addApp.value;
        },  selectedApprovers
      );
    });
  }

  private constructCurrentApproverData(hiddenList = []): {id: number, level?: number}[] {
    const returnMe = []; // contains only visible list of selected approvers
    const fullList = []; // contains list of approvers including hidden values (F1,F2 etc)
    for (const item of this.approverOptions.approvers) {
      const approverNum =  this.approverFormInfo[item.fieldname];
      const apprObj = item.users.find(x => x.id === approverNum);
      if (!hiddenList.includes(item.fieldname)) {
        returnMe.push({
          id: approverNum,
          level: apprObj && apprObj.level
        });
      }
      fullList.push({
        id: approverNum,
        level: apprObj && apprObj.level
      });
    }
    if (this.additionalApprover) {
      this.additionalApprover.forEach((element) => {
        const person = this.approverOptions.additionalapprovers[0].users.find(x => x.id === element.value);
        returnMe.push({
          id: element.value,
          level: person && person.level
        });
        fullList.push({
          id: element.value,
          level: person && person.level
        });
      });
    }
    console.log('current approver data vvv');
    console.log(returnMe);
    this.filterApproverList(fullList);
    return returnMe;
  }

  vendorSearchFn = (term: string, item: any) => {
    term = this.customSearchEscape(term.toLowerCase());
    const searchMe = new RegExp(term);
    if (item) {
      return String(item.searchable.toLowerCase()).match(searchMe) !== null;
    }
  }

  materialSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    const searchMe = new RegExp(term);
    if (item) {
      const searchable = item.materialNum + ' ' + item.description;
      return String(searchable.toLowerCase()).match(searchMe) !== null;
    }
  }

  watcherSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    const searchMe = new RegExp(term);
    if (item) {
      const searchable = item.firstname + ' ' + item.lastname;
      return String(searchable.toLowerCase()).match(searchMe) !== null;
    }
  }

  private customSearchEscape(myString: string): string {
    return '^' + myString.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'); // force start of string, force * wildcard
  }

  ioDisabledHelper(one, two): boolean { // Using this logic inline in HTML causes it to fail to return false in some cases
    if (one && !two) {
      return true;
    }
    return false;
  }

  checkDeliveryDate(row, i) {
    this.alertService.clear('DeliveryDate' + i);
    if (row.deliveryDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const chosen = new Date(row.deliveryDate.replace(/-/g, '/'));
      console.log(now, chosen);
      if (chosen < now) {
        this.alertService.warn(this.errTransService.returnMsg('ddPast'), {id: 'DeliveryDate' + i});
      }
    }
    this.onFormChange();
  }

  onFileDownloadClick(filename) {
    this.optionsService.
      downloadFile(this.orderId, filename).subscribe(data => {
        const thefile = new Blob([data], {type: 'application/octet-stream'});
        saveAs(thefile, filename);
        /* let url = window.URL.createObjectURL(thefile);
        const a = document.createElement('a');
        a.href = 'data:application/octet-stream;base64,' + data;
        a.target = '_self';
        a.download = filename;
        document.body.appendChild(a); // create the link "a"
        a.click(); // click the link "a"
        document.body.removeChild(a); // remove the link "a" */
      }, error => console.log(error), () => console.log('complete'));
  }

  async onFileDeleteClick(filename) {
    await this.optionsService.
      deleteFile(this.orderId, filename).toPromise().then(res => {
        this.updateAttachmentList();
      }).catch(err => {
        this.alertService.error(this.errTransService.returnMsgWithParam('cantDelFile', [filename]));
        console.log(err);
      });
  }
  private loadDraft() {
    const paramId = +this.route.snapshot.params.id;
    this.orderId = paramId;
    this.optionsService.getDocumentStatus(paramId).toPromise().then ((data) => {
      this.documentStatus = data.status;
      if (this.documentStatus.toLowerCase() !== 'draft') {
        this.router.navigateByUrl('ncrequestview/' + paramId);
      } else {
        this.updateAttachmentList();
      }
    });
  }

  private async handlePODetails(data) {
    console.log(data);
    let purchaseRequestObj: any = {};
    let approversObj: any = {};
    let hierarchyObj: any = {};
    purchaseRequestObj = data.porRequest;
    console.log('por reord data is---->' + purchaseRequestObj);
    this.requestDetailsForm.controls.shipToName.setValue(purchaseRequestObj.shipToName);
    this.requestDetailsForm.controls.shipToStreet.setValue(purchaseRequestObj.shipToStreet);
    this.requestDetailsForm.controls.shipToCity.setValue(purchaseRequestObj.shipToCity);
    this.requestDetailsForm.controls.shipToZip.setValue(purchaseRequestObj.shipToZip);
    this.requestDetailsForm.controls.shipToCountry.setValue(purchaseRequestObj.shipToCountry);
    this.requestDetailsForm.controls.shipToAttentionTo.setValue(purchaseRequestObj.shipToAttentionTo);
    await this.onCountryChange();
    this.requestDetailsForm.controls.shipToState.setValue(purchaseRequestObj.shipToState);
    console.log('===purchaseRequestObj.referenceNumber==' + purchaseRequestObj.referenceNumber);
    this.requestDetailsForm.controls.referenceNumber.setValue(purchaseRequestObj.referenceNumber);
    this.requestDetailsForm.controls.quotationNumber.setValue(purchaseRequestObj.quotationNumber);
    this.requestDetailsForm.get('requesterCostCenter').enable();
    this.requestDetailsForm.get('vendor').enable();
    this.requestDetailsForm.get('company').enable();
    approversObj = data.approvers;
    hierarchyObj = data.hierarchy;
    const z = purchaseRequestObj.orderType + '';
    this.typeForm.patchValue({ reqRadios: z });
    this.requestDetailsForm.get('purchaseCategory').value = purchaseRequestObj.purchaseCategory.id;
    // const porId = Number(this.requestDetailsForm.value.porType);
    let category1;
    const categoryId = purchaseRequestObj.purchaseCategory.id; // Number(this.requestDetailsForm.value.purchaseCategory);
    console.log('catagory id is==>' + categoryId);
    // purchaseRequestObj.purchaseCategory
    for (const category of this.purchaseCategoryOptions) {
      if (category.ID === categoryId) {
        category1 = category.category1;
      }
    }

    this.onPorTypeChange1(category1);
    console.log('---purchaseRequestObj.company---' + purchaseRequestObj.company.id);
   // this.requestDetailsForm.get('company').value = purchaseRequestObj.company.name;
    this.requestDetailsForm.patchValue({
      company: this.companyOptions.find(x => x.id == purchaseRequestObj.company.id),
    });
   // this.onCompanyChange();
   // this.requestDetailsForm.controls.company.setValue(purchaseRequestObj.company);
    this.requestDetailsForm.controls.requesterCostCenter.setValue(purchaseRequestObj.costCenter.id);

    this.requestDetailsForm.patchValue({
      requester: this.requesterOptions.find(x => x.id == purchaseRequestObj.requester.id),
    });
    // this.requestDetailsForm.controls.requester.setValue(purchaseRequestObj.requester.displayname);
    console.log('requester is -->' + purchaseRequestObj.requester.name);


    const temp = this.requestDetailsForm.controls.company.value;
    console.log('==temp is==' + temp);
    console.log('==temp.compan yCode is==' + temp.companyCode);
    console.log('==temp.companyCode is==' + temp.purchaseOrg);
    this.getCompanyBasedOptions(temp.companyCode, temp.purchaseOrg).then (() => {
      this.requestDetailsForm.patchValue({
        vendor: this.vendorOptions.find(x => x.id == purchaseRequestObj.vendor.id),
      });
      if (this.requestDetailsForm.controls.vendor.value) {
        this.requestDetailsForm.patchValue({
          detailsField: String(this.requestDetailsForm.controls.vendor.value.searchable).replace(/, /g, ',').split(',').join('\n')
         });
      }
      this.requestDetailsForm.controls.requesterCostCenter.setValue(purchaseRequestObj.costCenter.id);
    });

    this.requestDetailsForm.controls.currency.setValue(purchaseRequestObj.orderCurrency.id);
    // this.requestDetailsForm.controls.detailsField.setValue(purchaseRequestObj.vendorDetails);
    const odt =
      // tslint:disable: triple-equals
      (purchaseRequestObj.orderDate != ''
        && purchaseRequestObj.orderDate != null
        && purchaseRequestObj.orderDate != 'undefined') ? purchaseRequestObj.orderDate : '';
    this.requestDetailsForm.controls.dateRule.setValue(odt);
    this.requestDetailsForm.controls.email.setValue(purchaseRequestObj.email);
    this.requestDetailsForm.controls.fax.setValue(purchaseRequestObj.fax);

    if (purchaseRequestObj.email) {
      // emailVal.enable();
      this.requestDetailsForm.controls.sendEmail.setValue(1);
      // this.requestDetailsForm.get('sendEmail').enable();

    } else if (purchaseRequestObj.fax) {
      // faxVal.enable();
      this.requestDetailsForm.controls.sendFax.setValue(2);
      // this.requestDetailsForm.get('sendFax').enable();1
      console.log('inside else if' + purchaseRequestObj.email);
      console.log('inside else if' + purchaseRequestObj.fax);
    } else {

      console.log('inside else' + purchaseRequestObj.email);
      console.log('inside else' + purchaseRequestObj.fax);
      this.requestDetailsForm.get('sendFax').disable();
      this.requestDetailsForm.get('sendEmail').disable();
    }
    this.onCommsChange();
  // tslint:disable-next-line: no-unused-expression
    const obj = data.porRequest.vendor;
    const vendorJson = obj;
    console.log('--devendra testing for vendor details-->' + vendorJson);
     // tslint:disable-next-line: prefer-const
    let searchable = vendorJson.displayname;
    const x = searchable;
    this.requestDetailsForm.controls.detailsField.setValue(x);
    this.requestDetailsForm.controls.vendor.setValue(x);

    try {
      let sDt = (purchaseRequestObj.contractStartDate != ''
      && purchaseRequestObj.contractStartDate != null
      && purchaseRequestObj.contractStartDate != 'undefined') ? purchaseRequestObj.contractStartDate : '';
      if (sDt) {
          sDt = new Date(sDt.split('+')[0]).toISOString().slice(0, 10);
      }
      this.requestDetailsForm.controls.startDate.setValue(sDt);
      let eDt = (purchaseRequestObj.contractEndDate != ''
        && purchaseRequestObj.contractEndDate != null
        && purchaseRequestObj.contractEndDate != 'undefined') ? purchaseRequestObj.contractEndDate : '';
      if (eDt) {
        eDt = new Date(eDt.split('+')[0]).toISOString().slice(0, 10);
      }
      this.requestDetailsForm.controls.endDate.setValue(eDt);
    } catch (e) {
      console.log('contract date error ' + e);
    }
    this.commentsForm.controls.comments.setValue(purchaseRequestObj.comments);
    this.commentsForm.controls.specialInstructions.setValue(purchaseRequestObj.specialInstructions);
    // this.hierarchy = hierarchyObj

    console.log('=purchaseRequestObj=>' + purchaseRequestObj.costObjectGlAccount.id);
    console.log('=cost_center_code=>' + purchaseRequestObj.costObjectCostCenter.id);
    console.log('=asset_class=>' + purchaseRequestObj.costObjectAssetClass.id);
    console.log('=asset_number=>' + purchaseRequestObj.costObjectAssetNumber.id);
    console.log('=io_number=>' + purchaseRequestObj.costObjectInternalOrder.id);
    console.log('=profit_center=>' + purchaseRequestObj.costObjectProfitCenter.id);

    const budgetRedio = purchaseRequestObj.budgetApproved + '';
    const contractRedio = purchaseRequestObj.contractInPlace + '';
    console.log('budgetRedio--' + budgetRedio);
    this.isApprovedForm.patchValue({
        budgetApproved: budgetRedio,
        budgetNotApproved: purchaseRequestObj.budgetNotApproved,
        contractInPlace: contractRedio
      });

    // console.log('==================');
    let tablrow1: Array<any> = [];
    tablrow1 = purchaseRequestObj.itemDetails;
    // console.log(tablrow1);
    // this.requistionItemForm.controls['requistionfrComments'].setValue(purchaseRequestObj.comments);

    // tslint:disable-next-line: no-shadowed-variable
    let index = 0;
    // tslint:disable-next-line: no-shadowed-variable prefer-const
    let tableForm2: Array<any> = [];
    // tslint:disable-next-line: only-arrow-functions
    for (const arrayItem of tablrow1) {

      let myObj: any = {};
      myObj.material = arrayItem.material;
      myObj.shortText = arrayItem.description;
      myObj.vendorMaterialNo = arrayItem.vendorMaterialNo;
      myObj.qty = arrayItem.qty;
      myObj.uom = arrayItem.uom.id;
      const dt = arrayItem.deliveryDate;
      // console.log("=========>"+dt)
      myObj.deliveryDate = dt; // new Date(dt.split[2]+'/'+dt.split[1]+'/'+dt.split[0]);
      // console.log("=========>"+myObj.deliveryDate)
      myObj.unitCost = arrayItem.unitCost;
      myObj.priceUnit = arrayItem.priceUnit;
      myObj.isFree = arrayItem.isFree;
      myObj.orderCurrency = arrayItem.orderCurrency.id;
      myObj.totalCost = arrayItem.totalCost;
      myObj.totalUsd = arrayItem.totalCostUsd;
      myObj.extraText = arrayItem.additionalText;
      if (arrayItem.distribution) {
        const distr = arrayItem.distribution[0];
        if (distr.glAccountMasterId) {
          this.loadIOOptions(distr.glAccountMasterId, myObj);
          myObj.glAccountMasterId = distr.glAccountMasterId;
        }
        if (distr.costCenterId) {
          myObj.costCenterId = distr.costCenterId;
        }
        if (distr.assetClass) {
          myObj.assetClass = distr.assetClass;
        }
        if (distr.assetNumber) {
          myObj.assetNumber = distr.assetNumber;
        }
        if (distr.ioNumber) {
          myObj.ioNumber = distr.ioNumber;
        } else if (distr.ioMasterId) {
          myObj.ioNumber = distr.ioMasterId;
        }
        if (distr.profitCenter) {
          myObj.profitCenter = distr.profitCenter;
        }
      }
      myObj.tableExtraDistributionBasis = arrayItem.distributionBasis;
      if (arrayItem.distributionBasis) {
        myObj.extra = true; myObj.extraOpen = true;
      }
      // tslint:disable-next-line: prefer-const
      let rowForm: Array<any> = [];
      // tslint:disable-next-line: only-arrow-functions
      arrayItem.distribution.forEach(function(arrayItem2) {

        // tslint:disable-next-line: prefer-const
        let myObj2: any = {};
        myObj2.id = arrayItem2.id;
        myObj2.extraRowQty = arrayItem2.qty;
        myObj2.extraRowPercentage = arrayItem2.percentage;
        myObj2.extraRowGlAccount = arrayItem2.glAccount;
        myObj2.extraRowCostCenter = arrayItem2.costCenter;
        rowForm.push(myObj2);
        myObj2 = {};
      });
      myObj.distribution = rowForm;
      rowForm = [];

      tableForm2.push(myObj);
      myObj = {};

      index++;

    }
    this.tableForm = tableForm2;
    console.log('TABLE FORM ==>' + this.tableForm + '<==== TABLE FORM');
  }

  replaceNewline(msg: string): string {
    return msg.replace(/\n/g, '<br>&nbsp;');
  }
  displayUser(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      return this.adUsers.find(obj => obj.employeeId == val).firstname + ' ' +
           // tslint:disable-next-line: triple-equals
           this.adUsers.find(obj => obj.employeeId == val).lastname;
    } catch {
      return 'Error displaying user with ID: ' + val;
    }
  }

  getUserAdId(): number {
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    const temp = localStorage.getItem('proxyUserID');
    if (temp) {
      return Number(temp);
    } else {
      const userId = this.adUsers.find(obj => obj.employeeId === this.userClaims.preferred_username).ID;
      if (userId) {
        return userId;
      } else {
        console.error('Cannot find value for user in AD table.');
        return 0;
      }
    }
  }

  async onCountryChange() {
    this.onFormChange();
    this.requestDetailsForm.controls.shipToState.reset();
    if (!this.requestDetailsForm.controls.shipToCountry.value) {
      this.stateByCountryOptions = undefined;
      return;
    }
    this.stateByCountryOptions =
      await this.optionsService.getCountryStates(this.requestDetailsForm.controls.shipToCountry.value).toPromise();
  }

  returnStateBinds(str: string): string {
    if (this.stateByCountryOptions !== undefined) {
      switch (str) {
        case 'label':
          return 'stateName';
        default:
          return 'stateCode';
      }
    } else {
        switch (str) {
          case 'label':
            return 'name';
          default:
            return 'code';
        }
    }
  }
  async loadFormats() {
    await this.prefService.getProfileFromCache();
    if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.userPreference) {
     // this.dateFormat = this.prefService.cachedUserPrefEntity.userPreference.dateFormat;
     this.numberFormat = this.prefService.cachedUserPrefEntity.userPreference.numberFormat;
    }
    this.dateFormat = await this.dateTimeService.getDateFormat();
  }

  onKeyPress(event) {
    let value = event.target.value;
    value = this.customNumberPipe.transform(value, this.numberFormat, '', true);
    if (value > 999999999999) {
      return false;
       }
  }


}
