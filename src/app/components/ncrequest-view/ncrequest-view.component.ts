import { Component, OnInit, DoCheck, SystemJsNgModuleLoader } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OktaAuthService } from '@okta/okta-angular';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';


import { element } from 'protractor';
import { map, isEmpty } from 'rxjs/operators';
import { PODetailsService } from 'src/app/services/approval-details/podetails.service';
import { Podetails } from 'src/app/services/approval-details/model/po-detail';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { ThemeService } from 'ng2-charts';
import { ItemDetails } from 'src/app/services/approval-details/model/ItemDetails';
import { Distribution } from 'src/app/services/approval-details/model/Distribution';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { AlertService } from 'src/app/_alert/alert.service';
import { DatePipe } from '@angular/common';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { CustomCurrencyPipe } from 'src/app/pipes/customCurrency/custom-currency.pipe';
import { CustomNumberPipe } from 'src/app/pipes/customNumber/custom-number.pipe';

let userClaims;
// import { ConsoleReporter } from 'jasmine';
@Component({
  selector: 'app-ncrequest-view',
  templateUrl: './ncrequest-view.component.html',
  styleUrls: ['./ncrequest-view.component.css']
  // providers: [PurchaseOrder]
})
export class NcrequestViewComponent implements OnInit {
  [x: string]: any;
  dateFormat = '';
  numberFormat = '';
  dateTime = 'MM/dd/yyyy, h:mm:ss a z';

  debug = false;
  phase1 = true; // I am not re-typing code when we get past phase 1, just change this to false
  someBoolean = true;
  showEdit = true;
  showAsset = false;
  assetInfo = '';
  vpOptions = [];
  showVP = false;
  selectedVP = null;
  hasApprovalAccess = false;
  activeUserId = 0;

  retrieveNewPoOptions = true;
  vendorEditable = false;
  editable = false;
  editableChecked = { docApproved: false, costObjectInfo: [], startDate: false, endDate: false, attentionTo: false, referenceNumber: false,
                      shipTo: false, emailFax: false, specialInstructions: false, UOM: [], deliveryDate: [] , budgetNotApproved: false ,
                      budgetApproved: false, vendor: false };
  poUpdateChecked = false; // I'm not sure we will keep using this requirement so I have it separated
  // costObjectInfo is an array of falses created during the table parsing in ngOnInit.
  // docApproved states if the doc has been approved. If true, nothing can be edited, regardless of the other fields.
  contentEdited = false;

  // Values that need to be set to FALSE before the user can approve...
  needs: { assetNumber: boolean } =
          { assetNumber: true};

  // Data that needs to be sent...
  sendData: any = {itemDetails: []};

  userClaims;

  poItem: Array<ItemDetails>;
  itemDetailsrow: ItemDetails;
  poDetailsList: Array<Podetails>;
  distribution: Array<Distribution>;
  poDetails: Podetails;
  adUsers: Array<AdUser>; // Used to get users for dropdown boxes
  watchers: Array<AdUser> = []; chosenWatcher = null;
  typeForm;
  requestDetailsForm;
  requistionItemForm: FormGroup;
  isApprovedForm;
  updatePoForm: FormGroup;
  sendEmailForm: FormGroup;
  tableForm: Array<any> = []; // Easier not to use formGroup here
  nA: any = {};
  commentsForm;
  userFullName: Array<any> = ['loading', '...'];
  date: number = Date.now();
  aduserForm;
  hierarchy;
  prItemComments;
  showFullList = {
    purchaseCategory: false,
    company: false,
    costCenter: false,
    requester: false,
    vendor: false,
    glaccount: false,
    uom: false
  };
  purchaseCategoryOptions = [{ ID: -1, Category: 'Loading options...', category1: '' }];
  purchaseCategoryOptionsPref = [];
  purchaseCategoryOptionsAll = [];
  companyOptions: any = [{ ID: -1, name: 'Loading...' }];
  companyOptionsPref = [];
  companyOptionsAll = [];
  requesterOptions = [{ firstname: 'Loading options...', lastname: '', fullname: 'Loading options...' }];
  requesterOptionsPref = [];
  requesterOptionsAll = [];
  vendorOptions = [{ Address: 'Loading available options...', Phone: '', Email: '', searchable: 'Loading options...', id: -1 }];
  vendorOptionsPref = [];
  vendorOptionsAll = [];
  currencyOptions: any = [{ ID: -1, name: 'Loading options...' }];
  porOptions = [{
    id: -1, reference: '-1', name: 'Loading options...', glAccountNumber: '-1', costCenterCode: '', assetClass: '',
    assetNumber: '', ioNumber: '', profitCenter: ''
  }];
  chosenPor = {
    id: 0, reference: '', name: '', glAccountNumber: '', costCenterCode: '', assetClass: '', assetNumber: '',
    ioNumber: '', profitCenter: ''
  };
  errorList: any = {
    invalidCostCenter: false,
    invalidVendor: false,
    invalidItemCC: [],
    invalidItemAsset: [],
    invalidItemGlAccount: [],
    invalidItemIO: [],
    invalidItemPC: [],
    invalidItemAssetNo: []
  };
  costObjectInfoForm;
  glAccountOptions;
  glAccountOptionsPref = [];
  glAccountOptionsAll = [];
  costCenterOptions;
  costCenterOptionsAll = [];
  costCenterOptionsPref = [];
  assetClassOptions;
  internalOrderOptions;
  assetNumberOptions;
  profitCenterOptions;
  uomOptions;
  uomOptionsPref = [];
  uomOptionsAll = [];
  approverOptions: any = { approvers: [], additionalapprovers: [] };
  approverFormInfo: any = {};
  countryOptions = [];
  stateByCountryOptions = undefined;
  stateOptions = [];
  canSeeApprovers = false;
  canSeeHierarchy = false; // toggles hierarchy view
  commtTbl;
  checkcomment = false; // boolean that tells us if we are the active approver
  loadGrid: Array<any> = []; // Easier not to use formGroup here
  documentStatus;
  watchersView: Array<any> = [];
  createdBy; reqBy; createdOn; needsClarification = false;
  fileList = [];
  fileLinkList = [];
  filesToUpload = new FormData();
  filesToDisplay: string[] = [];
  sappono: string;
  additionalApprover: { value: number }[] = [];
  savedAdditionalApprovers = [];
  additionalApproverListToSend = [];
  chosenApprover;
  showAdditional = false;
  warnId: number; // Warn if selected
  brazil = /4.*/;
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
    shipToAttentionTo: null,
    shipToCountry: null,
    language: null,
    numberFormat: null,
    dateFormat: null,
    timeFormat: null
  };
  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder, public oktaAuth: OktaAuthService,
              private adusersService: AdusersService,
              private dateTimeService: DateTimeService,
              private customCurrencyPipe: CustomCurrencyPipe,
              public customNumberPipe: CustomNumberPipe,
              private pODetailsService: PODetailsService,
              private userPrefService: UserPrefService,
              private optionsService: OrderRequestOptionsService,
              private spinner: NgxSpinnerService,
              private alertService: AlertService, private datePipe: DatePipe,
              public errTransService: ErrorTranslationService) {

    // const purchaseOrder= {id: Number,commsredio:Number,orderType:Number};
    this.typeForm = this.formBuilder.group({
      /* reqGoods: false,
      reqServices: false */
      reqRadios: ''
    });
    this.isApprovedForm = this.formBuilder.group({
      budgetApproved: {value: '', disabled: true},
      budgetNotApproved: {value: '', disabled: true},
      contractInPlace: {value: '', disabled: true}

    });
    this.requistionItemForm = this.formBuilder.group({
      requistionfrNumber: '12',
      requistionfrCost: '',
      requistionfrStatus: '',
      requistionfrOrderId: '',
      requistionfrOrderDetail: '',
      requistionfrComments: '',
      clarifications: ''
    });
    this.requestDetailsForm = this.formBuilder.group({
      purchaseCategory: null,
      company: '',
      porType: '',
      requesterCostCenter: '',
      requester: '',
      vendor: {value: '', disabled: true},
      currency: '',
      detailsField: 'Loading...',
      dateRule: '',
      sendEmail: {value: false, disabled: true},
      sendFax: {value: false, disabled: true},
      // commsRadio: '',
      email: {value: '', disabled: true},
      fax: {value: '', disabled: true},
      /* glAccount: '' */
      startDate: {value: null, disabled: true},
      endDate: {value: null, disabled: true},
      shipToName: {value: '', disabled: true},
      shipToStreet: {value: '', disabled: true},
      shipToCity: {value: '', disabled: true},
      shipToState: {value: '', disabled: true},
      shipToZip: {value: '', disabled: true},
      shipToCountry: {value: '', disabled: true},
      shipToAttentionTo: {value: '', disabled: true},
      attentionTo: {value: 'bind later', disabled: true},
      referenceNumber: {value: 'bind later', disabled: true},
      contractFlag: null
    });
    this.commentsForm = this.formBuilder.group({
      comments: '',
      specialInstructions: {value: '', disabled: true},
      uploadFile: File = null
    });
    this.aduserForm = this.formBuilder.group({
      f1f2: '',
      cfo: '',
      appr1: '',
      appr2: ''
    });
    this.costObjectInfoForm = this.formBuilder.group({
      gl_account_number: '',
      cost_center_code: '',
      asset_class: '',
      asset_number: '',
      io_number: '',
      profit_center: ''
    });
    this.updatePoForm = this.formBuilder.group({
      newNumber: {value: null, disabled: true},
      newExplanation: {value: null, disabled: true}
    });
    this.sendEmailForm = this.formBuilder.group({
      emailTo: ['', Validators.required],
      emailCc: null,
      emailSubject: ['', Validators.required],
      emailMsg: ['', Validators.required]
    });
  }
// cachedData gets set on intial component load and reused for susequent resets
 cachedData: any = {};

  async ngOnInit() {
    this.spinner.show();
    if (environment.production) {
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyEmployeeID');
    }
    this.needs = { assetNumber: true};
    const paramId = +this.route.snapshot.params.id;
    this.requistionItemForm.controls.requistionfrNumber.setValue(paramId);
    this.sendData.id = paramId;
    userClaims = this.cachedData.userClaims || await this.oktaAuth.getUser();
    await this.userPrefService.getProfileFromCache();
    await this.loadFormats();
    this.userClaims = userClaims;
    let eid = this.userClaims.preferred_username;
    if (localStorage.getItem('proxyEmployeeID')) {
      console.log('Using Proxy user ID');
      eid = localStorage.getItem('proxyEmployeeID');
    }
    // Check if user pref is already available in service cache , if not get and save to cache
    if (this.userPrefService.cachedUserPrefEntity && this.userPrefService.cachedUserPrefEntity.EID === eid) {
      this.pref = this.userPrefService.cachedUserPrefEntity.userPreference;
    } else {
      const pref = await this.userPrefService.getUserPreference(eid, 'userPreference').toPromise();
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
    this.documentStatus = this.cachedData.documentStatus || await this.optionsService.getDocumentStatus(paramId).toPromise();
    this.showEditIcon();
    this.populateFileList(paramId);
    this.purchaseCategoryOptions = this.cachedData.purchaseCategoryOptions || await this.optionsService.getCategories().toPromise();
    // this.vendorOptions = await this.optionsService.getVendors().toPromise();
    this.countryOptions = this.cachedData.countryOptions || await this.optionsService.getCountryList().toPromise();
    this.stateOptions = this.cachedData.stateOptions || await this.optionsService.getGlobalStateList().toPromise();
    this.porOptions = this.cachedData.porOptions || await this.optionsService.getPOR().toPromise();
    this.profitCenterOptions = await this.optionsService.getProfitCenter().toPromise();
    this.costCenterOptions = this.cachedData.costCenterOptions || await this.optionsService.getCostCenter().toPromise();
    // TODO : check if this is required sm1
    /* let y = await this.pODetailsService.getRequestionById2(paramId).toPromise();
    console.log('approverOptions-->' + y);
    this.approverOptions = y.approvers;
    console.log('approverOptions-->'+this.approverOptions); */
      // Ensure this needs to be re-fetched each time the order is changed
    this.canSeeApprovers = true;
    console.log(this.approverOptions);
    this.warnId = await this.optionsService.getHighestLevelApprover().toPromise();

    // console.log('additional approvers are--->' + this.approverOptions.additionalapprovers);
    console.log('PO OPTIONS NEEDED: ' + this.retrieveNewPoOptions);
    if (this.cachedData && this.cachedData.hasOwnProperty('poDetails') && !this.retrieveNewPoOptions) {
      this.poDetails = this.cachedData.poDetails;
      this.handlePODetails(this.poDetails);
    } else {
      // tslint:disable-next-line: no-shadowed-variable
      await this.pODetailsService.getRequestionById2Test(paramId).subscribe((data) => {
        this.poDetails = data;
        this.cachedData.poDetails = data;
        this.handlePODetails(data);
      },
      (err) => {
        console.log(err);
        this.alertService.error(this.errTransService.returnMsg('errAPI'));
      },
      () => {
      });
    }
    this.adUsers = this.cachedData.adUsers || await this.adusersService.getAll().toPromise();


    if (!this.cachedData.watchers || this.retrieveNewPoOptions) {
      await this.optionsService.getWatcher(paramId).subscribe((data) => {
        // tslint:disable: prefer-const
        let objData: any = {};
        let objUser = this.adUsers;
        let objArrr: Array<AdUser> = [];
        // tslint:disable-next-line: only-arrow-functions
        data.forEach(function(arrayItem) {

          console.log('arrayItem  is--' + arrayItem.employeeId);
          let obj2;
          // tslint:disable: triple-equals
          obj2 = objUser.find(obj => obj.employeeId == arrayItem.employeeId);
          objArrr.push(obj2);
        });

        this.cachedData.watchers = [...objArrr];
        this.watchers = objArrr;
        this.chosenWatcher = null;
        objArrr = [];
      });
  } else {
      this.watchers = [...this.cachedData.watchers];
      this.chosenWatcher = null;
  }

    let index = 0;
    let commentArray: Array<any> = [];
    let prId = +this.route.snapshot.params.id;
    if (!this.cachedData.commentArray) {
      // tslint:disable-next-line: only-arrow-functions
      await this.userPrefService.getComment(prId).forEach(function(arrayItem) {
        // tslint:disable-next-line: only-arrow-functions
        arrayItem.forEach(function(arrayItem2) {

          let formObj: any = {};
          formObj.requestid = arrayItem2.requestid,
            formObj.addwho = arrayItem2.addwho,
            formObj.adddate = arrayItem2.adddate,
            formObj.comment = arrayItem2.comment;
          formObj.displayDate = arrayItem2.displayDate;
          commentArray.push(formObj);
          formObj = {};
        });
      });
      this.cachedData.commentArray = [...commentArray];
    }
    commentArray = [...this.cachedData.commentArray];
    console.log('commentArray==>' + commentArray);
    // loadGrid
    this.loadGrid = commentArray;
    console.log('loadGrid==>' + this.loadGrid);
    this.spinner.hide();

    this.sendEmailForm.patchValue({
      emailSubject: ('Need clarification on Purchase Order Request # ' + this.requistionItemForm.value.requistionfrNumber)
    });
    this.loadAdditionalApprovers(prId);
    this.spinner.hide();
    this.setCachedData();
    this.displayAsset();
    // if (!this.cachedData.length) {
    //   this.setCachedData();
    // }
    this.retrieveNewPoOptions = false;
  }

  displayUser(val): string {
    try {
      // tslint:disable-next-line: triple-equals
      let user = this.adUsers.find(obj => obj.ID == val);
      return user.firstname + ' ' + user.lastname;
    } catch {
      return 'Error displaying user with ID: ' + val;
    }
  }

  loadAdditionalApprovers(prId: number) {
    this.spinner.show('additionalApprover', {type: 'ball-spin-clockwise'});
    this.optionsService.getSavedAdditionalApprovers(prId).subscribe((data) => {
           this.savedAdditionalApprovers = data;
           this.spinner.hide('additionalApprover');
    },
    err => {
      this.spinner.hide('additionalApprover');
    }
    );
  }

  vendorSearchFn = (term: string, item: any) => {
    term = this.customSearchEscape(term.toLowerCase());
    const searchMe = new RegExp(term);
    if (item) {
      return String(item.searchable.toLowerCase()).match(searchMe) !== null;
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

  // tslint:disable-next-line: use-lifecycle-interface
  ngDoCheck(): void {
    /* if (this.uomOptions) { // uomOptions is the last data from DB: check if DB data was loaded
      // console.log(JSON.stringify(this.purchaseCategoryOptions));
      if (this.purchaseCategoryOptions.length === 1) {
        if (this.purchaseCategoryOptions[0].ID !== -1) {
          this.selectOnlyValue(this.requestDetailsForm, 'purchaseCategory', this.purchaseCategoryOptions[0].ID);
        }
      }
      if (this.requesterOptions.length === 1) {
        if (this.requesterOptions[0].firstname !== 'Loading options...') {
          this.selectOnlyValue(this.requestDetailsForm, 'requester', this.requesterOptions[0]);
        }
      }
      if (this.vendorOptions.length === 1) {
        if (this.vendorOptions[0].Address !== 'Loading available options...') {
          this.selectOnlyValue(this.requestDetailsForm, 'vendor', this.vendorOptions[0]);
        }
      }
      if (this.currencyOptions.length === 1) {
        if (this.currencyOptions[0].ID !== -1) {
          this.selectOnlyValue(this.requestDetailsForm, 'currency', this.currencyOptions[0].ID);
        }
      }
      if (this.companyOptions.length === 1) {
        if (this.companyOptions[0].ID !== -1) { this.selectOnlyValue(this.requestDetailsForm, 'company', this.companyOptions[0]); }
      }
      if (this.costCenterOptions.length === 1) {
        this.selectOnlyValue(this.requestDetailsForm, 'requesterCostCenter', this.costCenterOptions[0].id);
      }
      for (const row of this.tableForm) {
        if (this.uomOptions.length === 1) {
          row.uom = this.companyOptions[0].id;
        }
        if (this.glAccountOptions.length === 1) {
          row.glAccountMasterId = this.glAccountOptions[0].id;
         }
        if (this.costCenterOptions.length === 1) {
          row.costCenterId = this.costCenterOptions[0].id;
        }
        if (this.assetClassOptions.length === 1) {
          row.assetClass = this.assetClassOptions[0].id;
        }
        if (row.ioOptions && row.ioOptions.length === 1) {
          row.ioNumber = row.ioOptions[0].id;
        } else if (this.internalOrderOptions.length === 1) {
          row.ioNumber = this.internalOrderOptions[0].id;
        }
        if (this.profitCenterOptions.length === 1) {
          row.profitCenter = this.profitCenterOptions[0].id;
        }
        if (this.assetNumberOptions.length === 1) {
          row.assetNumber = this.assetNumberOptions[0].id;
        }
      }
      if (this.canSeeApprovers) {
        for (const entry of this.approverOptions.approvers) {
          if (entry.users.length === 1) {
            this.approverFormInfo[entry.fieldname] = entry.users[0].id;
          }
        }
      }
    } */
    if (this.debug) { // We currently do not need doCheck, but might later.
      this.selectOnlyValue('', '', '');
    }
  }

  private showEditIcon() {
    const statusList = ['Approved', 'PO under review', 'SAP PO In Error', 'Processed'];
    const index = statusList.indexOf( this.documentStatus.status);
    this.showEdit = (index < 0) ? true : false;
   }

  private async collectCompanyOpts() {
    await this.optionsService.getCompany().toPromise().then(res => {
      this.companyOptions = res;
      this.processCompanyOptions(this.poDetails.porRequest.company.id);
    }).catch(err => this.alertService.error(this.errTransService.returnMsg('errorCompanyOpt')));
  }

  private async processCompanyOptions(companyId: number) {
    this.requestDetailsForm.patchValue({
      company: this.companyOptions.find(x => x.id == companyId)
    });
    this.initializeIO(); // user less likely to feel like program is having an issue if called here

    /* console.log(this.requestDetailsForm.value.company); */
    const temp = this.requestDetailsForm.value.company;
    const code = temp.companyCode;
    const org =  temp.purchaseOrg;
    if (code && org) {
      /* this.glAccountOptions = await this.optionsService.getSpecificGlAccount(code).toPromise(); */
      console.log('GL Account ID  -  ' + this.requestDetailsForm.value.purchaseCategory + '  ' +
      this.poDetails.porRequest.purchaseCategory.id);

      this.glAccountOptionsPref = this.pref.GLAccount && this.pref.GLAccount.length ?
      (await this.optionsService.getSelectedGlAccount(this.poDetails.porRequest.purchaseCategory.id, code, this.pref.GLAccount).toPromise()
      .catch(err => console.log(err))) : [];
      if (this.glAccountOptionsPref.length) {
        this.glAccountOptions = this.glAccountOptionsPref;
      } else {
        this.glAccountOptions = [];
        this.glAccountOptionsAll = [];
        this.showMore('glaccount');
      }

      this.vendorOptionsPref = this.pref.vendor && this.pref.vendor.length ?
      await this.optionsService.getSelectedVendors(org, this.pref.vendor).toPromise() : [];
      if (this.vendorOptionsPref.length) {
      this.vendorOptions = this.vendorOptionsPref;
      } else {
        this.vendorOptions = [];
        this.vendorOptionsAll = [];
        await this.showMore('vendor');
      }

      this.requestDetailsForm.patchValue({
        vendor: this.vendorOptions.find(x => x.id == this.poDetails.porRequest.vendor.id),
      });
      if (this.requestDetailsForm.controls.vendor.value) {
        this.requestDetailsForm.patchValue({
          detailsField: String(this.requestDetailsForm.controls.vendor.value.searchable).replace(/, /g, ',').split(',').join('\n')
         });
      }
      this.assetClassOptions = this.cachedData.assetClassOptions || await this.optionsService.getSpecificAssetClass(code).toPromise();
      this.displayAsset();
      this.assetNumberOptions = this.cachedData.assetNumberOptions || await this.optionsService.getSpecificAssetNumber(code).toPromise();
      /* this.costCenterOptions = await this.optionsService.getSpecificCostCenter(code).toPromise(); */
    }
  }

  private async initializeIO() {
    this.spinner.show();
    for (const row of this.tableForm) {
      if (row.distribution && row.distribution[0]) {
        this.loadIOOptions(row.glAccountMasterId, row);
        /* for (const extraRow of row.distribution) { // once distribution is added switch to this
          this.loadIOOptions(extraRow.extraRowGlAccount, row);
        } */
      }
    }
    this.spinner.hide();
  }

  async populateFileList(paramId) {
    await this.pODetailsService.getPorAttachments(paramId).toPromise().then(
      res => this.fileList = this.cachedData.fileList || res
    ).catch(
      err => console.log(err)
    );
  }

  async showMore(fieldname) {
    switch (fieldname) {
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
      case 'uom':
        if (this.uomOptionsAll.length === 0) {
          this.spinner.show('uomBox', {type: 'ball-fall', fullScreen: false} );
          this.uomOptionsAll = await this.optionsService.getUom().toPromise();
          this.spinner.hide('uomBox');
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
      case 'vendor':
        this.vendorOptions = this.vendorOptionsPref;
        this.showFullList.vendor = false;
        return;
      case 'glaccount':
        this.glAccountOptions = this.glAccountOptionsPref;
        this.showFullList.glaccount = false;
        return;
    case 'uom':
      this.uomOptions = this.uomOptionsPref;
      this.showFullList.uom = false;
      return;
      default:
        return;
    }

  }

  setCachedData() {
    this.cachedData.userClaims = userClaims;
    this.cachedData.documentStatus = this.documentStatus;
    this.cachedData.fileList = this.fileList;
    this.cachedData.purchaseCategoryOptions = this.purchaseCategoryOptions;
    this.cachedData.porOptions = this.porOptions;
    this.cachedData.costCenterOptions = this.costCenterOptions;
    this.cachedData.adUsers = this.adUsers;
    this.cachedData.countryOptions = this.countryOptions;
    this.cachedData.stateOptions = this.stateOptions;
   }
   setPref () {
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
    if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.itemDetails) {
      this.poDetails.porRequest.itemDetails.forEach(item => {
        if (this.pref.UOM && !this.pref.UOM.includes(item.uom.id)) {
          this.pref.UOM.push(item.uom.id);
        }
      });
    }
   }
  private async handlePODetails(data) {
    this.setPref();
    this.sendData.shipToId = this.poDetails.porRequest.shipToId;
    console.log(data);
    let purchaseRequestObj: any = {};
    let approversObj: any = {};
    let hierarchyObj: any = {};
    purchaseRequestObj = data.porRequest;
    this.createdBy = purchaseRequestObj.createdBy.displayname;
    this.reqBy = purchaseRequestObj.requester.displayname;
    this.createdOn = purchaseRequestObj.createdat;
    this.sappono = purchaseRequestObj.sapOrder;

    this.updatePoForm.value.newNumber = this.poDetails.porRequest.newPoValue;
    this.updatePoForm.value.newExplanation = this.poDetails.porRequest.newPoComments;

    this.requestDetailsForm.controls.shipToName.setValue(purchaseRequestObj.shipToName);
    this.requestDetailsForm.controls.shipToStreet.setValue(purchaseRequestObj.shipToStreet);
    this.requestDetailsForm.controls.shipToCity.setValue(purchaseRequestObj.shipToCity);
    this.requestDetailsForm.controls.shipToZip.setValue(purchaseRequestObj.shipToZip);
    this.requestDetailsForm.controls.shipToCountry.setValue(purchaseRequestObj.shipToCountry);
    this.requestDetailsForm.controls.shipToAttentionTo.setValue(purchaseRequestObj.shipToAttentionTo);
    await this.onCountryChange();
    this.requestDetailsForm.controls.shipToState.setValue(purchaseRequestObj.shipToState);

    this.requestDetailsForm.controls.contractFlag.setValue(purchaseRequestObj.contractFlag);
    this.requestDetailsForm.patchValue({contractFlag: purchaseRequestObj.contractFlag});
    console.log('CONTRACT:', purchaseRequestObj.contractFlag, this.requestDetailsForm.value.contractFlag);

    console.log('===purchaseRequestObj.referenceNumber==' + purchaseRequestObj.referenceNumber);
    this.requestDetailsForm.controls.referenceNumber.setValue(purchaseRequestObj.referenceNumber);
    this.requestDetailsForm.controls.attentionTo.setValue(purchaseRequestObj.quotationNumber);
    console.log('purchaseRequestObj==>' + purchaseRequestObj.sapOrder);
    approversObj = data.approvers;
    hierarchyObj = data.hierarchy;
    const z = purchaseRequestObj.orderType + '';
    this.typeForm.patchValue({ reqRadios: z });
    // tslint:disable: no-string-literal
    this.requistionItemForm.controls['requistionfrComments'].setValue(purchaseRequestObj.comments);
    this.requistionItemForm.controls['requistionfrCost'].setValue(purchaseRequestObj.cost);

    this.requistionItemForm.controls['requistionfrOrderId'].setValue(purchaseRequestObj.sapOrder);
    this.requestDetailsForm.controls.purchaseCategory.setValue(purchaseRequestObj.purchaseCategory.id);
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

    this.requestDetailsForm.controls.company.setValue(purchaseRequestObj.company);
    this.requestDetailsForm.controls.requesterCostCenter.setValue(purchaseRequestObj.costCenter.id);
    this.requestDetailsForm.controls.requester.setValue(purchaseRequestObj.requester.displayname);
    this.requestDetailsForm.controls.currency.setValue(purchaseRequestObj.orderCurrency.id);

    this.currencyOptions =
      [{ ID: Number(purchaseRequestObj.orderCurrency.id), name: String(purchaseRequestObj.orderCurrency.displayname) }];
    const odt =
      // tslint:disable: triple-equals
      (purchaseRequestObj.orderDate != ''
        && purchaseRequestObj.orderDate != null
        && purchaseRequestObj.orderDate != 'undefined') ? purchaseRequestObj.orderDate : '';

    this.requestDetailsForm.controls.dateRule.setValue(odt);
    this.requestDetailsForm.controls.email.setValue(purchaseRequestObj.email);
    this.requestDetailsForm.controls.fax.setValue(purchaseRequestObj.fax);
    //

    if (purchaseRequestObj.email) {
      // emailVal.enable();
      this.requestDetailsForm.controls.sendEmail.setValue(1);
      // this.requestDetailsForm.get('sendEmail').value = 1;
      // this.requestDetailsForm.get('sendEmail').enable();

    } else if (purchaseRequestObj.fax) {
      // faxVal.enable();
      this.requestDetailsForm.controls.sendFax.setValue(2);
      // this.requestDetailsForm.get('sendFax').value = 2;
      // this.requestDetailsForm.get('sendFax').enable();
      console.log('inside else if' + purchaseRequestObj.email);
      console.log('inside else if' + purchaseRequestObj.fax);
    } else {

      console.log('inside else' + purchaseRequestObj.email);
      console.log('inside else' + purchaseRequestObj.fax);
      this.requestDetailsForm.get('sendFax').disable();
      this.requestDetailsForm.get('sendEmail').disable();
    }
    // this.requestDetailsForm.get('vendor').value=purchaseRequestObj.vendor;


    // tslint:disable-next-line: no-unused-expression
    purchaseRequestObj.vendor;
    // tslint:disable-next-line: no-shadowed-variable
    const obj = data.porRequest.vendor; // this.vendorOptions.find(obj => obj.id == purchaseRequestObj.vendor.id);
    const vendorJson = obj;
    console.log(vendorJson);
    // console.log(vendorJson.length)
    // alert(vendorJson.length)
    /* let address;
    let phone;
    let email; */
    // tslint:disable-next-line: prefer-const
    let searchable = vendorJson.displayname;

    /* address = vendorJson['address'];
    console.log(address);
    email = vendorJson['email'];
    console.log(email);
    phone = vendorJson['phone'];
    console.log(phone); */

    const x = searchable; // address + email + phone;
    this.requestDetailsForm.controls.vendor.setValue(x);
    // this.requestDetailsForm.get('vendor').value = x; // commsRadio
    try {
      let sDt = (purchaseRequestObj.contractStartDate != ''
      && purchaseRequestObj.contractStartDate != null
      && purchaseRequestObj.contractStartDate != 'undefined') ? purchaseRequestObj.contractStartDate : '';
      if (sDt) {
          sDt = new Date(sDt.split('+')[0]).toISOString().slice(0, 10);
      }
      this.requestDetailsForm.controls.startDate.setValue(sDt);
      // this.requestDetailsForm.get('startDate').value = sDt;
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
    // this.requestDetailsForm.get('endDate').value = eDt; // new Date(purchaseRequestObj.contractEndDate);
    this.commentsForm.controls.comments.setValue(purchaseRequestObj.comments);
    this.commentsForm.controls.specialInstructions.setValue(purchaseRequestObj.specialInstructions);
    // this.commentsForm.get('comments').value = purchaseRequestObj.comments;
    // this.commentsForm.get('specialInstructions').value = purchaseRequestObj.specialInstructions;
    // this.hierarchy = hierarchyObj

    this.hierarchy =
        hierarchyObj.hierarchy || [{name: 'Hierarchy Not Found', title: '', date: '', time: '', displayDt: '', fieldName: ''}];
    let stats = 'Not an Approver';
    let canPendClarification = false;
    let needsAssetNumber = false;
    // tslint:disable-next-line: no-shadowed-variable
    this.hierarchy.forEach(element => { // TODO: See what might cause an error here with validation

      console.log(element.name);
      console.log(userClaims.name);
      // let firstLastName;
      let userEID;
      let isActiveUser;
      this.userFullName = [userClaims.given_name, userClaims.family_name];
      if (localStorage.getItem('proxyUsername')) {
        this.userFullName = localStorage.getItem('proxyUsername').split(' ');
        // firstLastName = localStorage.getItem('proxyUsername');
        userEID = localStorage.getItem('proxyEmployeeID');
      } else {
        // firstLastName = userClaims.name;
        userEID = userClaims.preferred_username;
      }
      isActiveUser = (userEID === element.employeeId || userEID === element.substituteEmpId);
      if (!element.name.includes('^') && element.name.includes('@')) {
        if (isActiveUser) {
          stats = 'Approved';
        }
        // this.requistionItemForm.controls['requistionfrStatus'].setValue("Approved");
      } else if (element.name.includes('^') && !element.name.includes('@')) {
        // this.requistionItemForm.controls['requistionfrStatus'].setValue("Reject");
        if (isActiveUser) {
          stats = 'Reject';
        }
      } else if (element.name.includes('#') &&
        !element.name.includes('^')) {
          this.checkAccess(element);
          if (isActiveUser) {
            canPendClarification = true;
            this.checkcomment = true;
            // this.requistionItemForm.controls['requistionfrStatus'].setValue("Not Started");
            stats = 'Not Started';
            if (element.fieldName) {
              if (element.fieldName.toLowerCase() === 'asset review' && !this.verifyAssetNumber(purchaseRequestObj.itemDetails)) {
                needsAssetNumber = true;
              }
              if (element.fieldName.toLowerCase() === 'buyer review') {
                this.vendorEditable = true;
              }
            }
          }
      } else {
        if (isActiveUser) {
          // canPendClarification = true; Don't enable for every approver, only active.
          if (element.fieldName) {
            if (element.fieldName.toLowerCase() === 'asset review' && !this.verifyAssetNumber(purchaseRequestObj.itemDetails)) {
              needsAssetNumber = true;
            }
          }
        }
      }

    });
    if (needsAssetNumber) {
      document.getElementById('needsAssetNumber').innerHTML = '<strong>* Asset Number must be chosen before approval.</strong><br><br>';
    } else {
      document.getElementById('needsAssetNumber').innerHTML = '';
      this.needs.assetNumber = false;
    }
    console.log('status is==>' + stats);
    if (stats === 'Approved' || stats === 'Reject') {
      this.editableChecked.docApproved = true;
    }
    if (stats !== 'Approved' && canPendClarification) {
      (document.getElementById('pendingClarification') as HTMLInputElement).disabled = false;
    }
    this.requistionItemForm.controls['requistionfrStatus'].setValue(stats);
    // });
    console.log('=purchaseRequestObj=>' + purchaseRequestObj.costObjectGlAccount.id);
    console.log('=cost_center_code=>' + purchaseRequestObj.costObjectCostCenter.id);
    console.log('=asset_class=>' + purchaseRequestObj.costObjectAssetClass.id);
    console.log('=asset_number=>' + purchaseRequestObj.costObjectAssetNumber.id);
    console.log('=io_number=>' + purchaseRequestObj.costObjectInternalOrder.id);
    console.log('=profit_center=>' + purchaseRequestObj.costObjectProfitCenter.id);

    this.costObjectInfoForm.patchValue(
      {
        gl_account_number: Number(purchaseRequestObj.costObjectGlAccount.id),
        cost_center_code: Number(purchaseRequestObj.costObjectCostCenter.id),
        asset_class: Number(purchaseRequestObj.costObjectAssetClass.id),
        asset_number: Number(purchaseRequestObj.costObjectAssetNumber.id),
        io_number: Number(purchaseRequestObj.costObjectInternalOrder.id),
        profit_center: Number(purchaseRequestObj.costObjectProfitCenter.id)
      });

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
      this.editableChecked.costObjectInfo.push(false);
      this.editableChecked.UOM.push(false);
      this.editableChecked.deliveryDate.push(false);
      const itemDetailsPushVal: any = {id: arrayItem.id};
      this.sendData.itemDetails.push(itemDetailsPushVal);
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
      myObj.totalCost = Number(Number(arrayItem.totalCost).toFixed(2));
      myObj.totalUsd = Number(Number(arrayItem.totalCostUsd).toFixed(2));
      myObj.extraText = arrayItem.additionalText;
      if (arrayItem.distribution) {
        const distr = arrayItem.distribution[0];
        if (distr.glAccountMasterId) {
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
    // These calls must be made after tableForm is set for IO to load
    if (this.poDetails) {
    // if (!this.retrieveNewPoOptions && this.cachedData.companyOptions) {
    //   this.companyOptions = this.cachedData.companyOptions;
    //   this.processCompanyOptions(this.poDetails.porRequest.company.id);
    // } else {
      this.collectCompanyOpts();
    // }
  }
    console.log('TABLE FORM ==>' + this.tableForm + '<==== TABLE FORM');
  }
  private selectOnlyValue(form, property, desiredValue) {
    /* // tslint:disable-next-line: prefer-const
    let temp: any = {};
    temp[property] = desiredValue;
    form.patchValue(temp); */
    if (this.debug) {
      console.log('This feature shouldn\'t be used in VIEW. Only in NEW.');
    }
  }

  private verifyAssetNumber(items): boolean {
    for (const item of items) {
      const distr = item.distribution;
      if (distr) {
        for (const distrow of distr) {
          if (!distrow.assetNumber) {
            return false;
          }
        }
      }
    }
    return true;
  }

  editCostObject(index: number) {
    this.editableChecked.costObjectInfo[index] = !this.editableChecked.costObjectInfo[index];
  }

  editItemUOM(index: number) {
    if (!this.uomOptions) {
      this.getUomOptions();
    }
    this.editableChecked.UOM[index] = !this.editableChecked.UOM[index];
  }

  editItemDetail(prop: string, index: number) {
    this.editableChecked[prop][index] = !this.editableChecked[prop][index];
  }

  async getUomOptions() {
    this.spinner.show('itemSpinner', { type: 'ball-spin-clockwise', fullScreen: false} );
    this.uomOptionsPref = this.pref.UOM && this.pref.UOM.length ?
    await this.optionsService.getSelectedUom(this.pref.UOM).toPromise() : [];
    if (this.uomOptionsPref.length) {
      this.uomOptions = this.uomOptionsPref;
      } else {
        this.showMore('uom');
      }
    this.spinner.hide('itemSpinner');
  }

  editVendor() {
    this.editableChecked.vendor = !this.editableChecked.vendor;
    if (this.editableChecked.vendor) {
      this.requestDetailsForm.get('vendor').enable();
    } else {
      this.requestDetailsForm.get('vendor').disable();
    }
  }

  editShipTo() {
    this.editableChecked.shipTo = !this.editableChecked.shipTo;
    const myFields = ['shipToName', 'shipToStreet', 'shipToCity', 'shipToState', 'shipToZip', 'shipToCountry', 'shipToAttentionTo'];
    if (this.editableChecked.shipTo) {
      for (const field of myFields) {
        this.requestDetailsForm.get(field).enable();
      }
    } else {
      for (const field of myFields) {
        this.requestDetailsForm.get(field).disable();
      }
    }
  }

  editEmailFax() {
    this.editableChecked.emailFax = !this.editableChecked.emailFax;
    if (this.editableChecked.emailFax) {
      this.requestDetailsForm.get('sendEmail').enable();
      this.requestDetailsForm.get('sendFax').enable();
      this.requestDetailsForm.get('email').enable();
      this.requestDetailsForm.get('fax').enable();
      this.onCommsChange(); // this will handle smart enabling and disabling...
    } else {
      this.requestDetailsForm.get('sendEmail').disable();
      this.requestDetailsForm.get('sendFax').disable();
      this.requestDetailsForm.get('email').disable();
      this.requestDetailsForm.get('fax').disable();
    }
  }

  editHeaderDetail(prop: string) {
    try {
      this.editableChecked[prop] = !this.editableChecked[prop];
      if (this.editableChecked[prop]) {
        this.requestDetailsForm.get(prop).enable();
      } else {
        this.requestDetailsForm.get(prop).disable();
      }
    } catch (e) {
      console.error('Invalid property name: ' + prop + '. Error below.');
      console.log(e);
    }
  }

  editCommentsDetail(prop: string) {
    try {
      this.editableChecked[prop] = !this.editableChecked[prop];
      if (this.editableChecked[prop]) {
        this.commentsForm.get(prop).enable();
      } else {
        this.commentsForm.get(prop).disable();
      }
    } catch (e) {
      console.error('Invalid property name: ' + prop + '. Error below.');
      console.log(e);
    }
  }

  editBudgetNotApproved(prop: string) {
    try {
      this.editableChecked[prop] = !this.editableChecked[prop];
      if (this.editableChecked[prop]) {
        this.isApprovedForm.get(prop).enable();
      } else {
        this.isApprovedForm.get(prop).disable();
      }
    } catch (e) {
      console.error('Invalid property name: ' + prop + '. Error below.');
      console.log(e);
    }
  }
  async onApproveClick() {
    if (environment.production) {
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyEmployeeID');
    }
    if ((!this.requestDetailsForm.controls.vendor.value || this.requestDetailsForm.controls.vendor.value == 'unknown')
        && this.vendorEditable) {
        this.alertService.error(this.errTransService.returnMsg('Select a vendor!'));
        return;
    }
    const prId = +this.route.snapshot.params.id;


    let myId = 0;

    let comments = this.requistionItemForm.value.requistionfrComments;

    userClaims = await this.oktaAuth.getUser();
    myId = this.getUserID(userClaims.preferred_username);
    let temp;
    temp = myId;
    if (this.hasApprovalAccess) {
      myId = this.activeUserId;
    }

    let approval = this.optionsService.sendOnApprove(prId, myId, true).subscribe(x => {

    });
    myId = temp;
    const d = new Date();
    const data = {
      requestid: prId,
      comment: comments,
      addwho: myId,
      adddate: String(d.toUTCString()) // toISOString())
    }; // JSON.stringify(data)
    console.log(data);
    let commentStatus =
      this.optionsService.sendComment(JSON.stringify(data)).subscribe(x => {
        console.log(x);
      });
    this.router.navigateByUrl('dash');
    // this.ngOnInit();

  }

  async onRejectClick() {
    if (environment.production) {
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyEmployeeID');
    }
    const prId = +this.route.snapshot.params.id;

    console.log(this.requistionItemForm.value.requistionfrComments);
    let myId = 0;

    let comments = this.requistionItemForm.value.requistionfrComments;
    // tslint:disable-next-line: no-shadowed-variable
    const userClaims = await this.oktaAuth.getUser();
    myId = this.getUserID(userClaims.preferred_username);
    if (localStorage.getItem('proxyUserID')) {
      console.log('Using Proxy user ID');
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    console.log(this.userFullName[0]);
    console.log(this.userFullName[1]);
    console.log(myId);
    let temp;
    temp = myId;
    if (this.hasApprovalAccess) {
      myId = this.activeUserId;
    }
    let approval = this.optionsService.sendOnApprove(prId, myId, false).subscribe(x => {

    });
    myId = temp;
    const d = new Date();
    const data = {
      requestid: prId,
      comment: comments,
      addwho: myId,
      adddate: String(d.toUTCString()) // toISOString().split('T')[0])
    }; // JSON.stringify(data)
    console.log(data);
    let commentStatus =
      this.optionsService.sendComment(JSON.stringify(data)).subscribe(x => {

      });

    // this.ngOnInit();
    this.router.navigateByUrl('dash');

  }

  addToComments(comments) {
    const prId = +this.route.snapshot.params.id;
    let myId = 0;
    myId = this.getUserID(this.userClaims.preferred_username);
    if (localStorage.getItem('proxyUserID')) {
      console.log('Using Proxy user ID');
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    const d = new Date();
    const data = {
      requestid: prId,
      comment: comments,
      addwho: myId,
      adddate: String(d.toUTCString()) // toISOString())
    };
    this.optionsService.sendComment(JSON.stringify(data)).subscribe(newComment => {
      console.log(newComment);
      let newList = [];
      newList.push(newComment);
      this.loadGrid = newList.concat(this.loadGrid);
    });
  }

  needsClarificationClick() {
    this.needsClarification = true;
  }

  async onClarificationClick() {
    if (environment.production) {
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyEmployeeID');
    }
    const prId = +this.route.snapshot.params.id;
    console.log(this.requistionItemForm.value.clarifications);
    let myId = 0;
    let comments = this.requistionItemForm.value.clarifications;
    // tslint:disable-next-line: no-shadowed-variable
    const userClaims = await this.oktaAuth.getUser();
    myId = this.getUserID(userClaims.preferred_username);
    if (localStorage.getItem('proxyUserID')) {
      console.log('Using Proxy user ID');
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    console.log(this.userFullName[0]);
    console.log(this.userFullName[1]);
    console.log(myId);
    let approval = this.optionsService.sendForConfirmation(prId, myId, false).subscribe(x => {
    });
    const d = new Date();
    const data = {
      requestid: prId,
      comment: comments,
      addwho: myId,
      adddate: String(d.toUTCString()) // toISOString().split('T')[0])
    }; // JSON.stringify(data)
    console.log(data);
    let commentStatus =
      this.optionsService.sendComment(JSON.stringify(data)).subscribe(x => {

      });

    // this.ngOnInit();
    this.router.navigateByUrl('dash');

  }
  /*onCommsChange() {
    //console.log('hi');
    const emailVal = this.requestDetailsForm.get('email');
    const faxVal = this.requestDetailsForm.get('fax');
    switch (this.requestDetailsForm.value.commsRadio) {
      case '1':
        faxVal.disable();
        emailVal.enable();
        break;
      case '2':
        emailVal.disable();
        faxVal.enable();
        break;
      default:
        faxVal.disable();
        emailVal.disable();
        break;
    }
  }*/
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

  onCompanyChange() {
    this.clearCostObject();
    const temp = this.requestDetailsForm.value.company;
    if (temp && temp.country) {
      this.requestDetailsForm.patchValue({
        shipToName: temp.name,
        shipToStreet: temp.street,
        shipToCity: temp.city,
        shipToZip: temp.postalCode,
        shipToCountry: temp.countryCode,
        shipToAttentionTo: temp.shipToAttentionTo,
        requesterCostCenter: null
      });
      this.onCountryChange();
      this.requestDetailsForm.patchValue({ shipToState: temp.stateCode });
      this.requestDetailsForm.get('requesterCostCenter').enable();
    } else {
      this.requestDetailsForm.patchValue({
        shipToName: '',
        shipToStreet: '',
        shipToCity: '',
        shipToState: null,
        shipToZip: '',
        shipToCountry: null,
        shipToAttentionTo: null,
        requesterCostCenter: null,
        vendor: null,
        vendorDetails: this.errTransService.returnMsg('Select a vendor!')
      });
      this.onCountryChange();
      this.requestDetailsForm.get('requesterCostCenter').disable();
      this.onFormChange();
      return;
    }
    this.getCompanyBasedOptions(temp.companyCode, temp.purchaseOrg);

    this.onFormChange();
  }

  onFormChange() { if (this.debug) {console.log('I\'m not sure this fucntion has to do anything yet, and it doesn\'t.'); } }

  onFileUpload(files: FileList) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < files.length; i++) {
      this.filesToUpload.append('fileArray', files[i], files[i].name);
      this.filesToDisplay.push(files[i].name);
    }
    console.log(this.filesToUpload);
    /* this.filesToUpload = files; */
    /* document.getElementById('uploadFileLabel').innerText = Array.from(files).map(f => f.name).join(', '); */
    // this.onFormChange();
    this.prepareFileUpload();
  }

  onRemoveSelectedFile(name) {
    this.filesToUpload.delete(name);
    this.filesToDisplay.splice(this.filesToDisplay.indexOf(name), 1);
  }

  async prepareFileUpload() { // To be called when user clicks to Upload files.
    if (this.filesToUpload) {
      this.optionsService.uploadFile(this.filesToUpload, this.route.snapshot.params.id).
        toPromise().then(data => {
          console.log(data);
          this.filesToUpload = new FormData();
          this.filesToDisplay = [];
          this.updateAttachmentList();
        }).catch(err => {
          this.alertService.error(this.errTransService.returnMsg('fileLoad'));
          // better to reset since there isn't a retry button, just let them re-pick the files.
          this.filesToUpload = new FormData();
          this.filesToDisplay = [];
        });
      }
  }

  async updateAttachmentList() {
    this.fileList = /* this.cachedData.fileList || */ // NEVER call cached data when we're expecting to update!
     await this.pODetailsService.getPorAttachments(this.route.snapshot.params.id).toPromise();
  }

  onPorTypeChange() {
    this.costObjectInfoForm.patchValue({ gl_account_number: '', cost_center_code: '', asset_class: '', asset_number: '', io_number: '' });
    const porId = Number(this.requestDetailsForm.value.porType);
    for (const item of this.porOptions) {
      if (item.id === porId) {
        this.chosenPor = item;
      }
    }
  }
  async onCategoryChange() {
    this.requestDetailsForm.get('company').enable();
    const temp = this.requestDetailsForm.value.company;
    if (temp) {
      const code = temp.companyCode;
      this.glAccountOptionsPref = this.pref.GLAccount && this.pref.GLAccount.length ?
        (await this.optionsService.getSelectedGlAccount(this.requestDetailsForm.value.purchaseCategory, code, this.pref.GLAccount).toPromise()
        .catch(err => console.log(err))) : [];
      if (this.glAccountOptionsPref.length) {
        this.glAccountOptions = this.glAccountOptionsPref;
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

  onCostCenterChange() {
    for (const row of this.tableForm) {
      if (!row.costCenterId) {
        row.costCenterId = this.requestDetailsForm.value.requesterCostCenter;
      }
    }
    this.onFormChange();
  }

  async onGlAccountChange(row, glObj, index: number) {
    this.alertService.clear('glAccountMasterIdLocked' + index);
    this.errorList.invalidItemGlAccount[index] = false;
    row.ioNumber = null;
    if (!glObj) {
      row.ioOptions = null;
      this.onCostObjectUpdated('glAccountMasterId', index, glObj);
      return;
    }
    if (glObj.locked) {
      this.errorList.invalidItemGlAccount[index] = true;
      this.alertService.error(this.errTransService.returnMsg('glLock'), {id: ('glAccountMasterIdLocked' + index)});
    }
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

    this.onCostObjectUpdated('glAccountMasterId', index, glObj);
  }

  async loadIOOptions(glId, row) {
    console.log(glId);
    console.log('row: ', row);
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
    // console.log(this.typeForm.value);
    // console.log(this.requestDetailsForm.value);
    // console.log(this.tableForm); //console.log('CHECK THESE: ', this.tableForm[0].totalCost, this.tableForm[0].totalUsd);
    // console.log(this.costObjectInfoForm.value);
    // console.log(this.commentsForm.value);
    // console.log(this.aduserForm.value);
    for (const watcher of this.watchers) {
      console.log(watcher.ID, watcher.firstname, watcher.lastname);
    }
  }

  onCurrencyChange() {
    for (const row of this.tableForm) {
      if (!row.orderCurrency) {
        row.orderCurrency = this.requestDetailsForm.value.currency;
      }
    }
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
      row.extraTable.push(this.nA);
      this.nA = {};
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
    if (row.unitCost && row.qty) {
      row.totalCost = row.qty * row.unitCost;
      row.totalUsd = this.calculateUsdCost(row);
    }
  }

  async calculateUsdCost(row) {
    // tslint:disable-next-line: triple-equals
    const sendCurrency = this.currencyOptions.find(obj => obj.ID == row.orderCurrency).currency;
    console.log('sendCurrency==>' + sendCurrency);
    const returnme = await this.optionsService.getInUsd(sendCurrency, row.totalCost).toPromise();
    console.log('returnme==>' + returnme);
    row.totalUsd = JSON.stringify(returnme);
  }

  onReviewClick() {
    if (this.debug) {
      console.log('you clicked the button');
    }
    const isValidated = this.validateForms();
    this.sendAllData('Review', isValidated);

    if (isValidated) {
      this.canSeeApprovers = true;
    }
  }

  onHomeClick() {
    this.router.navigateByUrl('home');
  }



  onVendorChange(item) {
    this.onContentEdited();
    let vendorVal = this.requestDetailsForm.value.vendor;
    if (vendorVal) {
        vendorVal = vendorVal.id || null;
    }
    this.sendData.vendor = vendorVal;
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
          (item.searchable).replace(/, /g, ',').split(',').join('\n')
      });
    } else {
      console.log('the user entered a value that is not in the vendor DB table.');
    }
  }

  onVendorClear(event) {
    this.requestDetailsForm.patchValue({ detailsField: '' });
  }

  onAddWatcher() {
    // Duplicates are prevented in HTML with *ngIf hiding users already in watchers array
    if (!this.chosenWatcher) { return; }
    this.onContentEdited();
    // tslint:disable-next-line: triple-equals
    const pushVal = this.adUsers.find(obj => obj.ID == this.chosenWatcher);
    if (this.watchers.indexOf(pushVal) > -1) {
      return;
    }
    this.watchers.push(pushVal);
    this.chosenWatcher = null;
  }

  onRemoveWatcher(watcher: AdUser) {
    this.onContentEdited();
    this.watchers.splice(this.watchers.indexOf(watcher), 1);
  }

  getCostCenterDisplay(): string {
    if (this.costCenterOptions && this.requestDetailsForm.value.requesterCostCenter) {
      let nam = this.costCenterOptions.find(obj => (obj.id === this.requestDetailsForm.value.requesterCostCenter));
      return nam.code + ' - ' + nam.name;
    }
  }

  onSumbit() {
    const isValid = this.validateForms();
    this.sendAllData('Submit', isValid);
    console.log('pr id is -->' + this.approverOptions.id);
    this.router.navigateByUrl('ncrequestview/' + this.approverOptions.id);
  }

 validateForms(): boolean {
    let status = true;

    let notValid = this.errTransService.returnMsg('errsInReq') + '\n';

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
    if (this.errorList.invalidVendor) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('vendorLock');
    }

    // tslint:disable-next-line: prefer-for-of
    const headerCC = this.requestDetailsForm.controls.requesterCostCenter.value;
    let ccMatchFlag = false;
    for (let index = 0; index < this.tableForm.length; index++) {

      const row = this.tableForm[index];

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
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('closedIO');
      }
      if (this.errorList.invalidItemPC[index]) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('pcLock');
      }
      if (this.errorList.invalidItemAssetNo[index]) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('assetNoLock');
      }
      if (this.errorList.invalidItemGlAccount[index]) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('glLock');
      }
      if (!row.shortText) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('Description');
      }
      if (!row.qty) {
        status = false;
        notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('Qty');
      } else {
        if (row.qty > 9999999999999) {
          status = false;
          notValid +=  '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + this.errTransService.returnMsg('largeQty');
        }
      }
      if (!row.uom) {
        status = false;
        notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('UOM');
      }
      if (!row.deliveryDate) {
        status = false;
        notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('Delivery Date');
       }
      if (!row.unitCost && !row.isFree) {
        status = false;
        notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
        this.errTransService.returnMsg('Unit Cost');
      } else {
        if (row.unitCost > 9999999999999) {
          status = false;
          notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
          this.errTransService.returnMsg('largeUnitCost');
        }
      }
      if (!row.orderCurrency) {
        status = false;
        notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' +
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
            notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ': ' + 'Material';
          }
        }
        /* if (true) {
          if (!row.vendorMaterialNo) {
            status = false;
            notValid += '\nLine Item ' + (index + 1) + ': ' + 'Vendor Material No.';
          }
        } */
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
            notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + '\'s ' +this.errTransService.returnMsg('subNotEq');
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
            notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + '\'s ' + this.errTransService.returnMsg('fullPercent');
            if (this.debug) { console.log('Total percentage at this line item is: ' + grandTotal); }
          }
        }
      }
      if (this.chosenPor.glAccountNumber) {
        if (!row.glAccountMasterId) {
          status = false;
          notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('GL Account');
        }
      }
      if (this.chosenPor.costCenterCode) {
        if (!row.costCenterId) {
          status = false;
          notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
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
          notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('Asset Type');
        }
      }
      console.log(row.ioOptions);
      if (this.chosenPor.ioNumber && row.ioOptions && row.ioOptions.internalOrderFlag) {
        if (!row.ioNumber) {
          status = false;
          notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('Internal Order');
        }
      }
      if (this.chosenPor.profitCenter) {
        if (Number(this.requestDetailsForm.value.purchaseCategory) === 10 && !row.profitCenter) {
          status = false;
          notValid += '\n' + this.errTransService.returnMsg('Line Item') + (index + 1) + ' ' +
          this.errTransService.returnMsg('Cost Object Information') + ' : ' + this.errTransService.returnMsg('Profit Center');
        }
      }
    }
    if (!ccMatchFlag) {
      status = false;
      notValid += '\n' + this.errTransService.returnMsg('ccHeaderErr');
    }


    console.log(this.tableForm);
   // this.alertService.clear();
    if (status === false) {
      this.alertService.error(this.replaceNewline(notValid));
    }
    return status;
  }

  private async sendAllData(buttonNo: string, canSend: boolean) {
    if (environment.production) {
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyEmployeeID');
    }
    let myId = 0;
    // tslint:disable-next-line: no-shadowed-variable
    const userClaims = await this.oktaAuth.getUser(); // TODO: FIX THIS IF WE'RE GONNA USE THIS FUNCTION HERE
    myId = this.getUserID(userClaims.preferred_username);
    if (localStorage.getItem('proxyUserID')) {
      console.log('Using Proxy user ID');
      myId = Number(localStorage.getItem('proxyUserID'));
    }
    if (canSend === true) {
      // TODO: Put JSON here!!
      const d = new Date();
      const sendMe = {
        orderType: Number(this.typeForm.value.reqRadios),
        orderDate: d.toUTCString(),
        // tslint:disable-next-line: triple-equals
        createdBy: myId,
        purchaseCategory: Number(this.requestDetailsForm.value.purchaseCategory),
        company: this.requestDetailsForm.value.company.id,
        porType: Number(this.requestDetailsForm.value.porType),
        requester: this.requestDetailsForm.value.requester.ID,
        costCenter: Number(this.requestDetailsForm.value.requesterCostCenter),
        vendor: this.requestDetailsForm.value.vendor.id,
        vendorDetails: this.requestDetailsForm.value.vendorDetails,
        orderCurrency: Number(this.requestDetailsForm.value.currency),
        referenceNumber: this.requestDetailsForm.value.referenceNumber, // TODO: figure this out
        quotationNumber: this.requestDetailsForm.value.attentionTo, // TODO: figure this out
        contractStartDate: this.requestDetailsForm.value.startDate,
        contractEndDate: this.requestDetailsForm.value.endDate,
        email: this.requestDetailsForm.value.email,
        fax: this.requestDetailsForm.value.fax,
        costObjectGlAccount: Number(this.costObjectInfoForm.value.gl_account_number),
        costObjectCostCenter: Number(this.costObjectInfoForm.value.cost_center_code),
        costObjectAssetClass: Number(this.costObjectInfoForm.value.asset_class),
        costObjectAssetNumber: Number(this.costObjectInfoForm.value.asset_number),
        costObjectInternalOrder: Number(this.costObjectInfoForm.value.io_number),
        costObjectProfitCenter: Number(this.costObjectInfoForm.value.profit_center),
        itemDetails: this.constructItemDetails(),
        comments: this.commentsForm.value.comments,
        specialInstructions: this.commentsForm.value.specialInstructions,
        fileUpload: this.commentsForm.value.uploadFile,
        watchers: this.constructWatchersJSON(),
        approvers: this.constructApproversJSON(),
        mode: buttonNo
        // TODO: add new hierarchy info...
      };

      if (this.debug) {
        console.log(sendMe);
      }

      this.optionsService.sendForm(JSON.stringify(sendMe), buttonNo.toLowerCase()).subscribe(x => {
        if (buttonNo === 'Review') {
          if (this.debug) {
            this.approverOptions = {
              approvers: [
                {
                  fieldname: 'f1f2',
                  users: [{
                    id: 1,
                    displayname: 'Gina Van De Vort'
                  },
                  {
                    id: 2,
                    displayname: 'XYz ljk'
                  }],
                },
                {
                  fieldname: 'cfo',
                  users: [{
                    id: 3,
                    displayname: 'Srini'
                  },
                  {
                    id: 4,
                    displayname: 'Senthil'
                  }]
                }
              ]
            };
          } else {
            this.approverOptions = x;
          }
        }
        if (buttonNo === 'Preview') {
          if (this.debug) {
            this.hierarchy = [
              {
                Name: 'John Doe'
              },
              {
                Name: 'Jane Doe / @John Appleseed'
              },
              {
                Name: '@Jerry Appleseed'
              }
            ];
          } else {
            this.hierarchy = x;
          }
        }
      });

    } else {
      return;
    }
  }


  private constructItemDetails(): any[] {
    // tslint:disable-next-line: prefer-const
    let returnVal = []; let subtable = [];
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.tableForm.length; index++) {
      const row = this.tableForm[index];
      if (row.extra) {
        // tslint:disable-next-line: prefer-for-of
        for (let subIndex = 0; subIndex < row.extraTable.length; subIndex++) {
          const subRow = row.extraTable[subIndex];
          subtable.push({
            qty: subRow.extraRowQty,
            percentage: subRow.extraRowPercentage,
            costCenter: subRow.extraRowCostCenter,
            glAccount: subRow.extraRowGlAccount
          });
        }
        returnVal.push({
          line: (index + 1),
          material: row.material,
          description: row.shortText,
          vendorMaterialNo: row.vendorMaterialNo,
          qty: row.qty,
          uom: row.uom,
          deliveryDate: row.deliveryDate,
          isFree: row.isFree,
          unitCost: Number(row.unitCost),
          priceUnit: Number(row.priceUnit),
          orderCurrency: Number(row.orderCurrency),
          totalCost: row.totalCost,
          totalCostUsd: Number(row.totalUsd),
          additionalText: row.extraText,
          distributionBasis: Number(row.tableExtraDistributionBasis),
          distribution: subtable
        });
      }
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
      let returnVal = this.errTransService.returnMsg('Total Cost') + ' (USD): '
      + (this.customCurrencyPipe.transform(returnMe.toFixed(2), 'USD' , this.numberFormat));
      const currencyType = this.getCurrencyType().toUpperCase();
      if (currencyType.toLowerCase() !== 'usd') {
        returnVal += ' | ' + this.errTransService.returnMsg('Total Cost') + ' (' + currencyType + '): ' +
        this.customCurrencyPipe.transform(notUsd.toFixed(2), currencyType , this.numberFormat);
      }
      return returnVal;
    }
  }

  private getOnlyNotUsdCost(): string { // should run only during oninit
    let returnMe = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.tableForm.length; index++) {
      const row = this.tableForm[index];
      returnMe += Number(row.totalCost);
    }
    if (isNaN(returnMe)) {
      return '';
    } else {
      let returnVal = (returnMe.toFixed(2));
      const currencyType = this.getCurrencyType().toUpperCase();
      return returnVal;
    }
  }

  getCurrencyType(): string {
    if (this.requestDetailsForm.value.currency) {
      return this.poDetails.porRequest.orderCurrency.displayname.split(' - ')[0].toLowerCase();
    }
    return '';
  }

  private constructApproversJSON(): number[] {
    // tslint:disable-next-line: prefer-const
    if (this.additionalApprover) {
      this.additionalApprover.forEach((element, index) => {
        const temp = 'additionalApprover' + (index + 1);
        this.approverFormInfo[temp] = element.value;
      });
    }

    let returnMe = [];
    for (const item of this.approverOptions.approvers) {
        const check = /Approver *\d*/;
        if (item.fieldname.match(check)) {
          returnMe.push(Number(this.approverFormInfo[item.fieldname] * -1));
        } else { returnMe.push(Number(this.approverFormInfo[item.fieldname])); }
      }
    if (this.additionalApprover) {
        this.additionalApprover.forEach((element) => {
          returnMe.push(Number(element.value) * -1);
        });
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

  returnStatus(code: number): string {
    console.log('status in pr is ==>' + code);
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

  hideIfUsd(): boolean {
    if (this.currencyOptions[0].currency) {
      if (this.currencyOptions.find(obj => obj.ID === Number(this.requestDetailsForm.get('currency').value)).currency === 'USD') {
        return true;
      } else {
        return false;
      }
    } else if (this.currencyOptions[0].ID !== -1) {
      if (this.currencyOptions.find
        (obj => obj.ID === Number(this.requestDetailsForm.get('currency').value)).name === 'USD - United States Dollar') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /* async deconvertFromUsd(val: number): Promise<string> {
    const sendCurrency =
      this.poDetails.porRequest.orderCurrency.displayname.split(' - ')[0].toLowerCase();
    let conversionVal: number;
    await this.optionsService.getInUsd(sendCurrency,
      1).toPromise().then(
        x => conversionVal = Number(Number(x).toFixed(2))
      ).catch(
        err => { console.log(err); return 'API Error'; }
      );
    const returnMe = this.requistionItemForm.value.requistionfrCost / conversionVal;
    return String(returnMe.toFixed(2));
  } */

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
    console.log(this.userFullName[1]);
    console.log(myId);
    return myId;
  }

  onCostObjectUpdated(name: string, rowNum: number, value) {
    // console.log(this.sendData); console.log(rowNum); console.log(this.sendData.itemDetails[rowNum]);
    if (this.phase1) {
      if (!this.sendData.itemDetails[rowNum].distribution) {
        this.sendData.itemDetails[rowNum].distribution = [{id: this.tableForm[rowNum].distribution[0].id}];
      }
      if (value) {
        this.sendData.itemDetails[rowNum].distribution[0][name] = value.id;
      } else {
        this.sendData.itemDetails[rowNum].distribution[0][name] = null;
        if (name === 'ioNumber') {
          this.sendData.itemDetails[rowNum].distribution[0][name] = 0;
        }
      }
      this.onContentEdited();
    } else {
      console.error('this functionality must be changed after phase 1');
    }
  }

  onItemDetailUpdated(name: string, rowNum: number, value) {
    // console.log(name); console.log(rowNum); console.log(value);
    if (value) {
      if (value.id) {
        value = value.id;
      }
      console.log(value);
      this.sendData.itemDetails[rowNum][name] = value;
    } else {
      this.sendData.itemDetails[rowNum][name] = null;
    }
    this.onContentEdited();
  }

  checkDeliveryDate(row, rowNum: number, value) {
    this.alertService.clear('DeliveryDate' + rowNum);
    this.onItemDetailUpdated('deliveryDate', rowNum, new Date(value).toUTCString() );
    this.onItemDetailUpdated('offset', rowNum, new Date(Date.now()).getTimezoneOffset());
    if (row.deliveryDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const chosen = new Date(row.deliveryDate.replace(/-/g, '/'));
      console.log(now, chosen);
      if (chosen < now) {
        this.alertService.warn(this.errTransService.returnMsg('ddPast'), {id: 'DeliveryDate' + rowNum});
      }
    }
    this.onFormChange();
  }

  onHeaderUpdated(name: string, value) {
    if (value.target && value.target.value) {
      value = value.target.value;
      console.log('value is --->' + value);
    }
    if (value && name === 'startDate' || name === 'endDate') {
      if (this.requestDetailsForm.controls.startDate.value > this.requestDetailsForm.controls.endDate.value) {
        this.alertService.error(this.errTransService.returnMsg('startBefore'));
      }
    }
    if (value) {
      this.sendData[name] = value;
    } else {
      this.sendData[name] = null;
    }
    this.onContentEdited();
  }

  onStateCountryEdited(name: string) {
    let val = this.requestDetailsForm.controls[name].value;
    this.sendData[name] = val;
    if (name === 'shipToCountry') {
      this.onCountryChange();
    }
    this.onContentEdited();
  }

  onContentEdited() {
    this.contentEdited = true;
    this.onFormChange();
  }

  resetPage() {
    this.contentEdited = false;
    this.resetCheckedFields();
    this.sendData = {itemDetails: []};
    this.ngOnInit();
  }

  async validateUpdate(): Promise<boolean> {
    let obj = this.sendData;
    let flag = true;
    let returnAlert = this.errTransService.returnMsg('errsInReq') + '\n';

    let shiptoEdited = false;
    const simpleProps = ['shipToCity', 'shipToCountry', /* 'shipToId', SHIP TO ID is never changed by user!! */ 'shipToName', 'shipToState',
      'shipToStreet', 'shipToZip',
      'shipToAttentionTo']; // Properties that must be present if they were modified, but have no other restrictions
    for (const prop of simpleProps) {
      if (obj.hasOwnProperty(prop)) {
        shiptoEdited = true;
        console.log(prop);
        if (!obj[prop] && obj[prop] !== 0) {
          flag = false;
          returnAlert += '\n' + prop + '\n';
        }
      }
    }
    if (this.requestDetailsForm.controls.company.value && this.requestDetailsForm.controls.company.value.companyCode.match(this.brazil)
      && this.requestDetailsForm.controls.contractFlag.value) {
        console.log('START DATE', this.requestDetailsForm.controls, this.requestDetailsForm.controls.startDate.value);
        if (!this.requestDetailsForm.controls.startDate.value) {
          flag = false;
          // tslint:disable-next-line: triple-equals
          if (this.typeForm.value.reqRadios != 2) {
            returnAlert += '\n' + this.errTransService.returnMsg('Contract Start Date');
          } else {
            returnAlert += '\n' + this.errTransService.returnMsg('Purchase Start Date');
          }
        }
        if (!this.requestDetailsForm.controls.endDate.value) {
          flag = false;
          // tslint:disable-next-line: triple-equals
          if (this.typeForm.value.reqRadios != 2) {
            returnAlert += '\n' + this.errTransService.returnMsg('Contract End Date');
          } else {
            returnAlert += '\n' + this.errTransService.returnMsg('Purchase End Date');
          }
        }
      }

    // Address validation

    if (shiptoEdited) {
      this.sendData.shipToStreet = this.requestDetailsForm.controls.shipToStreet.value;
      this.sendData.shipToCity = this.requestDetailsForm.controls.shipToCity.value;
      this.sendData.shipToState = this.requestDetailsForm.controls.shipToState.value;
      this.sendData.shipToZip = this.requestDetailsForm.controls.shipToZip.value;
      this.sendData.shipToCountry = this.requestDetailsForm.controls.shipToCountry.value;
      this.sendData.shipToName = this.sendData.shipToName || this.requestDetailsForm.controls.shipToName.value;
      this.sendData.shipToAttentionTo = this.sendData.shipToAttentionTo ||
            this.requestDetailsForm.controls.shipToAttentionTo.value;
      const verifyAddress: any = {
        SHIPTO_STREET: this.requestDetailsForm.controls.shipToStreet.value,
        SHIPTO_CITY: this.requestDetailsForm.controls.shipToCity.value,
        SHIPTO_STATE: this.requestDetailsForm.controls.shipToState.value,
        SHIPTO_POSTAL_CODE: this.requestDetailsForm.controls.shipToZip.value,
        SHIPTO_COUNTRY_CODE: this.requestDetailsForm.controls.shipToCountry.value
      };

      // alert(JSON.stringify(verifyAddress))
      console.log('json is --->' + JSON.stringify(verifyAddress));
      let response: any = {};
      this.spinner.show();
      console.log('company code is==>'+this.requestDetailsForm.controls.company.value.companyCode)
      if(this.requestDetailsForm.controls.company.value.companyCode==1000 || this.requestDetailsForm.controls.company.value.companyCode==2000){
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

          this.sendData.shipToStreet = x.STREET;
          this.sendData.shipToCity = x.CITY;
          this.sendData.shipToState = x.STATE;
          this.sendData.shipToZip = x.POSTAL_CODE;
          this.sendData.shipToCountry = x.COUNTRY;
          this.sendData.shipToName = this.sendData.shipToName || this.requestDetailsForm.controls.shipToName.value; // CHECK
          this.sendData.shipToAttentionTo = this.sendData.shipToAttentionTo ||
            this.requestDetailsForm.controls.shipToAttentionTo.value; // PLEASE TEST FOR POSSIBLE ERRORS
        } else {
          flag = false;
          returnAlert += x.WARNING;
        }
        console.log(x.STREET);
        console.log(x.CITY);
        console.log(x.STATE);
        console.log(x.COUNTRY);
        console.log(x.POSTAL_CODE);
      }).catch( err => {
        returnAlert += '\n' + this.errTransService.returnMsg('addressAPI');
        console.log(err);
        flag = false;
      });
    }

      this.spinner.hide();
      // End of address validation code
    }

    if (!this.requestDetailsForm.controls.vendor.value && this.vendorEditable) {
      flag = false;
      returnAlert += '\n' + this.errTransService.returnMsg('Vendor');
    }
    if (!this.requestDetailsForm.controls.shipToAttentionTo.value) {
      flag = false;
      returnAlert += '\n' + this.errTransService.returnMsg('Attention To');
    }

    this.alertService.clear();
    if (!flag) {
      this.alertService.error(this.replaceNewline(returnAlert));
    }
    let otherValidations = this.validateForms();

    return (flag && otherValidations);
  }

  async submitUpdate() {
    this.sendData.watchers = [];
    let returnVal = [];
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.watchers.length; index++) {
      const person = this.watchers[index];
      returnVal.push({
        id: person.ID
      });
    }
    this.sendData.watchers = returnVal;
   // return returnVal;
    /*this.watchers.forEach(watcher => {
      this.sendData.watchers.push(
        {
          id: watcher.employeeId
        }
        );
    });*/
    this.sendData.quotationNumber = this.requestDetailsForm.value.attentionTo;
    if (this.requestDetailsForm.value.startDate) {
      this.sendData.contractStartDate = new Date(this.requestDetailsForm.value.startDate).toUTCString();
    }
    if (this.requestDetailsForm.value.endDate) {
      this.sendData.contractEndDate = new Date(this.requestDetailsForm.value.endDate).toUTCString();
    }
    this.sendData.offset = new Date(Date.now()).getTimezoneOffset();
    this.sendData.approvers = this.constructApproversJSON();
    console.log(this.sendData);
    /*
    if (this.validateUpdate()) {
      await this.optionsService.updateForm(JSON.stringify(this.sendData)).toPromise().then(res => {
        this.sendData = {itemDetails: []};
        this.resetCheckedFields();
        alert('Changes are sumbitted');
        this.ngOnInit(); // reload the form and hopefully get the new updated values!
      }).catch(err => {
        alert('Api error posting update!');
        console.log(err);
      });
    } */
    /* console.error('Submit functionality not yet implemented'); */
    let valid = false;
    await this.validateUpdate().then( res => {
      valid = res;
      if (valid) {
        this.finishUpdate();
      }
    }).catch(err => console.log(this.errTransService.returnMsg('cantValidateErr') + ' ' + err));
    if (!valid) {
      return;
    }
  }

  private async finishUpdate() {
    this.spinner.show();
    this.assetInfo = 'Loading...';
    let onupdae =  await this.pODetailsService.editViewForm(this.sendData).toPromise().then(x => {
      this.resetCheckedFields();
      this.resetSubmitForm();
      console.log(x);
      if (x) {
        /* this.router.navigateByUrl('ncrequestview/' + this.sendData.id); */
        this.retrieveNewPoOptions = true;
        this.ngOnInit();
      }
    }).catch(x => {
      this.alertService.clear();
      this.alertService.error(this.errTransService.returnMsg('errAPI'));
      console.log(x);
     } );

    this.spinner.hide();
  }

  private resetCheckedFields() {
    this.editableChecked = { docApproved: false, costObjectInfo: [], startDate: false, endDate: false, attentionTo: false,
      shipTo: false, emailFax: false, specialInstructions: false, budgetNotApproved: false,
      budgetApproved: false , UOM: [], deliveryDate: [], referenceNumber: false, vendor: false };
    Object.keys(this.requestDetailsForm.controls).forEach(key => {
      this.requestDetailsForm.controls[key].disable();
    });
  }

  private resetSubmitForm() {
    this.sendData = {itemDetails: []};
    this.contentEdited = false;
  }

  togglePoUpdate() {
    this.poUpdateChecked = !this.poUpdateChecked;
    if (this.poUpdateChecked) {
      this.updatePoForm.get('newNumber').enable();
      this.updatePoForm.get('newExplanation').enable();
    } else {
      this.updatePoForm.get('newNumber').disable();
      this.updatePoForm.get('newExplanation').disable();
    }
  }

  async submitPoNumberUpdate() {
    const sendMe = JSON.stringify({
      newPoComments: this.updatePoForm.value.newExplanation,
      newPoValue: this.updatePoForm.value.newNumber
    });
    let nothing = await this.pODetailsService.putPOUpdate(this.requistionItemForm.value.requistionfrNumber, sendMe).toPromise().then(x => {
      document.getElementById('newPoValue').innerHTML = '<strong>Revised Po Value: </strong>' + x.newPoValue;
      document.getElementById('newPoComments').innerHTML = '<strong>Revision Comments: </strong>' + x.newPoComments;
      this.addToComments(x.newPoValue + '-' + x.newPoComments);
      this.poUpdateChecked = false;

    }).catch(x => {this.alertService.error('Error contacting api'); console.log(x); } );
    console.log(nothing);
  }

  emailValidate(): boolean { // validate email
    return this.sendEmailForm.valid;
  }

  async onSendEmail(closeModal) { // closeModal is the modal element which can be dismissed by calling .close()
    if (!this.emailValidate()) {
      this.alertService.error(this.errTransService.returnMsg('validDetails'));
      return;
    }
    const emailData = JSON.stringify({ // TODO: add ID somewhere
      /* from: this.userClaims.email, */
      mailArray: this.sendEmailForm.value.emailTo,
      mailCCArray: this.sendEmailForm.value.emailCc,
      subject: this.sendEmailForm.value.emailSubject,
      content: this.sendEmailForm.value.emailMsg
    });
    await this.optionsService.askQuestion(emailData, this.route.snapshot.params.id,
      this.getUserEid()).toPromise().then(res => {
      this.updateDocStatus();
      closeModal.close();
    }).catch(err => {
      this.alertService.error(this.errTransService.returnMsg('errAPI'));
      console.log(err);
    });
  }

  private async updateDocStatus() {
    const paramId = +this.route.snapshot.params.id;
    this.documentStatus = await this.optionsService.getDocumentStatus(paramId).toPromise();
  }

  private getUserEid(): string {
    if (environment.production) {
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyEmployeeID');
    }
    if (localStorage.getItem('proxyEmployeeID')) {
      return localStorage.getItem('proxyEmployeeID');
    } else {
      return this.userClaims.preferred_username;
    }
  }

  ioDisabledHelper(one, two): boolean { // Using this logic inline in HTML causes it to fail to return false in some cases
    if (one && !two) {
      return true;
    }
    return false;
  }

  onFileDownloadClick(filename) {
    this.optionsService.
      downloadFile(this.requistionItemForm.value.requistionfrNumber, filename).subscribe(data => {
        let thefile = new Blob([data], {type: 'application/octet-stream'});
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
      deleteFile(this.requistionItemForm.value.requistionfrNumber, filename).toPromise().then(res => {
        this.updateAttachmentList();
      }).catch(err => {
        console.log(err);
        this.alertService.error(this.errTransService.returnMsgWithParam('cantDelFile', [filename]));
      });
  }

  replaceNewline(msg: string): string {
    return msg.replace(/\n/g, '<br>&nbsp;');
  }

  displayAsset() {
    let dist;
    let idVal;
    let returnVal;
    if (this.poDetails && this.poDetails.porRequest && this.poDetails.porRequest.itemDetails[0]) {
      dist = this.poDetails.porRequest.itemDetails.find(obj => obj.line === 1).distribution;
    }
    if(dist[0] && dist[0].assetClass) {
      this.showAsset = true;
      idVal = dist[0].assetClass;
      try {
        this.assetInfo = returnVal = this.assetClassOptions.find(obj => obj.id == idVal).searchable;
      } catch (e) {
        this.assetInfo = 'Loading...';
      }
    }
    if (!returnVal) {
      this.assetInfo = 'Loading...';
    }
  }


  displayGlAccount(idVal): string {
    let returnVal;
    try {
      returnVal = this.glAccountOptions.find(obj => obj.id == idVal).searchable;
    } catch (e) {
      return 'Loading...';
    }
    if (!returnVal) {
      return 'Loading...';
    }
    if (returnVal.startsWith('000')) {
      returnVal = returnVal.substr(3);
    }
    return returnVal;
  }

  onItemDetailCCChange(newVal, i) {
    this.alertService.clear('costCenterLocked' + i);
    this.errorList.invalidItemCC[i] = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidItemCC[i] = true;
      this.alertService.error(this.errTransService.returnMsg('costcenterLock'), {id: ('costCenterLocked' + i)});
    }
    this.onCostObjectUpdated('costCenterId', i, newVal);
  }

  onItemDetailAssetChange(newVal, i) {
    this.alertService.clear('assetClassLocked' + i);
    this.errorList.invalidItemAsset[i] = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidItemAsset[i] = true;
      this.alertService.error(this.errTransService.returnMsg('assetclassLock'), {id: ('assetClassLocked' + i)});
    }
    this.onCostObjectUpdated('assetClass', i, newVal);
  }

  onItemDetailsIOChange(newVal, i) {
    this.alertService.clear('ioNumberLocked' + i);
    this.errorList.invalidItemIO[i] = false;
    if (newVal && newVal.closed) {
      this.errorList.invalidItemIO[i] = true;
      this.alertService.error(this.errTransService.returnMsg('IOClose'), {id: ('ioNumberLocked' + i)});
    }
    this.onCostObjectUpdated('ioNumber', i, newVal);
  }

  onItemDetailsPCChange(newVal, i) {
    this.alertService.clear('profitCenterLocked' + i);
    this.errorList.invalidItemPC[i] = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidItemPC[i] = true;
      this.alertService.error(this.errTransService.returnMsg('pcLock'), {id: ('profitCenterLocked' + i)});
    }
    this.onCostObjectUpdated('profitCenter', i, newVal);
  }

  onItemDetailsANChange(newVal, i) {
    this.alertService.clear('assetNumberLocked' + i);
    this.errorList.invalidItemAssetNo[i] = false;
    if (newVal && newVal.locked) {
      this.errorList.invalidItemAssetNo[i] = true;
      this.alertService.error(this.errTransService.returnMsg('assetNoLock'), {id: ('assetNumberLocked' + i)});
    }
    this.onCostObjectUpdated('assetNumber', i, newVal);
  }
  async addAdditional() {
    let prId = +this.route.snapshot.params.id;
    if (!this.approverOptions.additionalapprovers.length) {
      await this.getAdditionalApprovers(prId);
    }
    this.showAdditional = true;
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


  async deleteAdditionalApprover(approver) {
    let prId = +this.route.snapshot.params.id;
    let data = [];
    if (!this.checkForVPBeforeDelete(approver.userId)) {
      this.alertService.error(this.errTransService.returnMsg('cantDelAppr'));
      return;
    }
    if (!confirm(this.errTransService.returnMsg('sureDelete', true) + this.displayUser(approver.userId) + '?')) {
      return;
    }
    data.push(approver.userId);
    this.spinner.show();
    await this.optionsService.deleteAdditionalApprover(prId, data).subscribe((res) => {
      this.hierarchy = res.hierarchy;
      // this.savedAdditionalApprovers = this.savedAdditionalApprovers.filter(obj => obj.userId !== approver.userId);
      this.loadAdditionalApprovers(prId);
      this.reloadComments();
    },
    err => {
      console.log(err);
    },
    () => {
      this.spinner.hide();
    });
  }

  private checkForVPBeforeDelete(deleteID) {
    const hasHighest = this.savedAdditionalApprovers.filter(x => x.userId === this.warnId);
    let valid = false;
    if (hasHighest[0]) {
      this.hierarchy.forEach(e => {
        if (e.level >= 5 && e.fieldName.toLowerCase() === 'functional approver') {
         valid = true;
        }
      });
      this.savedAdditionalApprovers.forEach(e => {
        if (e.level >= 5 && e.userId !== this.warnId && e.userId !== deleteID) {
          valid = true;
        }
      });

    } else {
        valid = true;;
    }
    return valid;
  }

  private checkForVp() {
    console.log('checkforvp');
    const hasHighest1 = this.additionalApproverListToSend.filter(x => x === this.warnId);
    // const hasHighest2 = this.savedAdditionalApprovers.filter(x => x.userId === this.warnId);
    let showVP = true;
    if (hasHighest1[0]) {
      this.hierarchy.forEach(e => {
        if (e.level >= 5 && e.fieldName.toLowerCase() === 'functional approver') {
          showVP = false;
        }
      });
      this.savedAdditionalApprovers.forEach(e => {
        if (e.level >= 5 && e.userId !== this.warnId) {
          showVP = false;
        }
      });
      if (showVP) {
        this.approverOptions.additionalapprovers[0].users.forEach(e => {
          if (this.additionalApproverListToSend.indexOf(e.id)  > -1 && e.level >= 5 && e.id !== this.warnId) {
            showVP = false;
          }
        });
      }
      } else {
        showVP = false;
      }
    this.showVP = showVP;
    if (showVP) {
      this.enableVpSelect();
      this.showAdditional = true;
    }
  }

  private async enableVpSelect() {
    console.log('enablevpselect');
    let prId = +this.route.snapshot.params.id;
    if (!this.vpOptions[0]) {
      this.spinner.show();
      await this.optionsService.getVpOptions(prId, true).toPromise().then(res => {
        res.sort((a, b) => (a.displayname > b.displayname) ? 1 : -1);
        this.vpOptions = res;
      }).catch(err => {
        console.log(err);
        this.alertService.error(this.errTransService.returnMsg('vpOpts'));
      });
      this.spinner.hide();
    }
    this.vpOptions = this.vpOptions.filter(x => x.id !== this.warnId);
  }

  async SubmitAdditionalApprovers() {
    this.alertService.clear();
    if (this.showVP && !this.selectedVP) {
      this.alertService.error(this.errTransService.returnMsg('lv5Err'));
      return;
    }
    if (!this.additionalApproverListToSend.length) { return; }
    if (this.showVP) {
      this.additionalApproverListToSend.push(this.selectedVP);
    }
    let prId = +this.route.snapshot.params.id;
    this.spinner.show();
    await this.optionsService.saveAdditionalApprovers(prId, this.additionalApproverListToSend).subscribe((res) => {
      this.hierarchy = res.hierarchy;
      // TODO: reload hierarchy related permissions
      this.reassessHierarchy(res);
      this.showAdditional = false;
      this.additionalApproverListToSend = [];
      this.loadAdditionalApprovers(prId);
      this.reloadComments();
      this.showVP = false;
      this.selectedVP = null;
    },
    err => {
      console.log(err);
    },
    () => {
      this.spinner.hide();
    });
  }

   addApprover(item) {
     let alreadyInHierarchy = false;
     this.hierarchy.forEach(e => {
      if (e.name.includes(item.displayname)) {
        this.alertService.clear();
        this.alertService.error(this.errTransService.returnMsg('selApprAlready'));
        alreadyInHierarchy = true;
      }
     });
     if (alreadyInHierarchy || this.additionalApproverListToSend.indexOf(item.id)  > -1) {
        this.chosenApprover = null;
        return;
      }
     this.additionalApproverListToSend.push(item.id);
     this.chosenApprover = null;
    }
    onRemoveApprover(id) {
      console.log(id);
      this.additionalApproverListToSend.splice(this.additionalApproverListToSend.indexOf(id), 1);
      console.log(this.additionalApproverListToSend);
      this.checkForVp();
    }
    approverFieldDisplay(fieldname) {
      const check = /Approver * \d*/;
      if (fieldname.match(check)) {
        return this.errTransService.returnMsg('Approver', true);
      }
      return this.errTransService.returnMsg(fieldname, true);
    }

    onApproversChange(item?, additional?) {

      console.log(item);
      console.log('this.requestDetailsForm.value.requester.ID---' + this.requestDetailsForm.value.requester.ID);
      console.log('--this.canSeeHierarchy--' + this.canSeeHierarchy);
     // if (this.canSeeHierarchy) { this.canSeeHierarchy = false; this.hierarchy = []; }
     // this.canSeeHierarchy = false; this.hierarchy = [];
      if (item) {
        this.addApprover(item);
        this.checkForVp();
        if (Number(item.id) === this.warnId) {
          this.alertService.warn(this.errTransService.returnMsg('hiLvAppr'));
        }
        console.log(this.poDetails)
        if (Number(item.id) === this.poDetails.porRequest.requester.id) {
          this.alertService.error(this.errTransService.returnMsg('reqApprSame'));
        }
      }
      if (additional) {
        if (additional.id === this.warnId) {
          this.alertService.warn(this.errTransService.returnMsg('hiLvAppr'));
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

    async reloadComments() {
      this.spinner.show();
      let commentArray: Array<any> = [];
      let prId = +this.route.snapshot.params.id;
      // tslint:disable-next-line: only-arrow-functions
      await this.userPrefService.getComment(prId).forEach(function(arrayItem) {
        // tslint:disable-next-line: only-arrow-functions
        arrayItem.forEach(function(arrayItem2) {

          let formObj: any = {};
          formObj.requestid = arrayItem2.requestid,
            formObj.addwho = arrayItem2.addwho,
            formObj.adddate = arrayItem2.adddate,
            formObj.comment = arrayItem2.comment;
          formObj.displayDate = arrayItem2.displayDate;
          commentArray.push(formObj);
          formObj = {};
        });
      });
      this.cachedData.commentArray = [...commentArray];
      commentArray = [...this.cachedData.commentArray];
      console.log('commentArray==>' + commentArray);
      // loadGrid
      this.loadGrid = commentArray;
      console.log('loadGrid==>' + this.loadGrid);
      this.spinner.hide();

    }

    async checkAccess (item) {
      const userProfile = await this.userPrefService.getProfileFromCache();
      const profile = userProfile.hrUser || {};
      if ((item.approverType === 'F1' && profile.f1 === 'X') ||
      (item.approverType === 'F2' && profile.f2 === 'X') ||
      (item.approverType === 'A1' && profile.a1 === 'X') ||
      (item.approverType === 'IT' && profile.it === 'X')
      ) {
        this.hasApprovalAccess = true;
        this.activeUserId = item.adId;
      }
    }

    private reassessHierarchy(hierarchyObj) {
      this.checkcomment = false; // disallow certain things if user is no longer active approver
      this.hierarchy =
        hierarchyObj.hierarchy || [{name: 'Hierarchy Not Found', title: '', date: '', time: '', displayDt: '', fieldName: ''}];
      let stats = 'Not an Approver';
      let canPendClarification = false;
      /* let needsAssetNumber = false; */ // Asset number reverification not relevant in the case that the user is no longer active approver
      // tslint:disable-next-line: no-shadowed-variable
      this.hierarchy.forEach(element => { // TODO: See what might cause an error here with validation

      console.log(element.name);
      console.log(this.userClaims.name);
      // let firstLastName;
      let userEID;
      let isActiveUser;
      this.userFullName = [this.userClaims.given_name, this.userClaims.family_name];
      if (localStorage.getItem('proxyUsername')) {
        this.userFullName = localStorage.getItem('proxyUsername').split(' ');
        // firstLastName = localStorage.getItem('proxyUsername');
        userEID = localStorage.getItem('proxyEmployeeID');
      } else {
        // firstLastName = this.userClaims.name;
        userEID = userClaims.preferred_username;
      }
      isActiveUser = (userEID === element.employeeId || userEID === element.substituteEmpId);
      if (!element.name.includes('^') && element.name.includes('@')) {
        if (isActiveUser) {
          stats = 'Approved';
        }
        // this.requistionItemForm.controls['requistionfrStatus'].setValue("Approved");
      } else if (element.name.includes('^') && !element.name.includes('@')) {
        // this.requistionItemForm.controls['requistionfrStatus'].setValue("Reject");
        if (isActiveUser) {
          stats = 'Reject';
        }
      } else if (element.name.includes('#') &&
        !element.name.includes('^')) {
          this.checkAccess(element);
          if (isActiveUser) {
            canPendClarification = true;
            this.checkcomment = true;
            // this.requistionItemForm.controls['requistionfrStatus'].setValue("Not Started");
            stats = 'Not Started';
            if (element.fieldName) {
              /* if (element.fieldName.toLowerCase() === 'asset review' && !this.verifyAssetNumber(purchaseRequestObj.itemDetails)) {
                needsAssetNumber = true;
              } */ // asset reverification not relevant
              if (element.fieldName.toLowerCase() === 'buyer review') {
                this.vendorEditable = true;
              }
            }
          }
      } else {
        if (isActiveUser) {
          // canPendClarification = true; Don't enable for every approver, only active.
          if (element.fieldName) {
            /* if (element.fieldName.toLowerCase() === 'asset review' && !this.verifyAssetNumber(purchaseRequestObj.itemDetails)) {
              needsAssetNumber = true;
            } */ // asset reverification not relevant
          }
        }
      }

    });
      /* if (needsAssetNumber) {
      document.getElementById('needsAssetNumber').innerHTML = '<strong>* Asset Number must be chosen before approval.</strong><br><br>';
    } else {
      document.getElementById('needsAssetNumber').innerHTML = '';
      this.needs.assetNumber = false;
    } */ // asset reverification not relevant
      console.log('status is==>' + stats);
      if (stats === 'Approved' || stats === 'Reject') {
      this.editableChecked.docApproved = true;
    }
      if (stats !== 'Approved' && canPendClarification) {
      (document.getElementById('pendingClarification') as HTMLInputElement).disabled = false;
    }
      this.requistionItemForm.controls['requistionfrStatus'].setValue(stats);
    }

    getUserAdId(): number {
      const eid = this.getUserEid();
      try {
        return this.adUsers.find(x => x.employeeId === eid).ID;
      } catch (error) {
        return 0;
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

    async loadFormats() {
      // await this.userPrefService.getProfileFromCache();
      if (this.userPrefService.cachedUserPrefEntity && this.userPrefService.cachedUserPrefEntity.userPreference) {
       this.numberFormat = this.userPrefService.cachedUserPrefEntity.userPreference.numberFormat;
      }
      this.dateFormat = await this.dateTimeService.getDateFormat();
      this.dateTime = this.dateFormat + ', ' + await this.dateTimeService.getTimeFormat();
    }


}
