import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ShopComponent } from './components/shop/shop.component';
import { DashComponent } from './components/dash/dash.component';
import { SidebarTogglerComponent } from './components/layout/sidebar-toggler/sidebar-toggler.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { AnaltyicsComponent } from './components/analtyics/analtyics.component';
import { RuleEngineComponent } from './components/rule-engine/rule-engine.component';
import { RuleChangeRequestComponent } from './components/rule-change-request/rule-change-request.component';
import { ChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { NcrequestNewComponent } from './components/ncrequest-new/ncrequest-new.component';
import { ApproverHierarchyPipe } from './pipes/approver-hierarchy.pipe';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NcrequestViewComponent } from './components/ncrequest-view/ncrequest-view.component';
import { PODetailsService } from './services/approval-details/podetails.service';
import { ExportService } from './services/export/export.service';
import { UserPrefComponent } from './components/user-pref/user-pref.component';
import { GlAccountPipe } from './pipes/gl-account.pipe';
import { TimeFormat } from './pipes/TimeFormat';
import { BudgetApproverRequestComponent } from './components/budget-approver-request/budget-approver-request.component';
import { FileDisplayPipe } from './pipes/file-display.pipe';
import { StatusReportComponent } from './components/status-report/status-report.component';
import { EnvServiceProvider } from './services/environments/env.service.provider';
import { NgSelectModule } from '@ng-select/ng-select';
import { RoleGuardService } from './services/role-guard/role-guard.service';


import {NgxPaginationModule} from 'ngx-pagination'; // <-- import the module fro pagination
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ViewBudgetRequestComponent } from './components/view-budget-request/view-budget-request.component';
import { AlertModule } from './_alert/alert.module';
import { UnAuthorizedComponent } from './components/un-authorized/un-authorized.component';
import { CreateporOptionsComponent } from './components/createpor-options/createpor-options.component';
import { BudgetReportComponent } from './components/budget-report/budget-report.component';
import { SearchPorComponent } from './components/search-por/search-por.component';
import { DisplayPorComponent } from './components/display-por/display-por.component';
import { ReprocessComponent } from './components/reprocess/reprocess.component';
import {MatSortModule} from '@angular/material';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { SpyOnInitDirective } from './directive/spy-on-init.directive';
import { UserPrefPorComponent } from './components/user-pref-por/user-pref-por.component';
import { BudgetHierarchyPipe } from './pipes/budget-hierarchy.pipe';
import { InboxSectionComponent } from './components/dash/inbox-section/inbox-section/inbox-section.component';
import { InboxPorHeaderPipe } from './pipes/inbox/inbox-por-header.pipe';
import { InboxPorEntryPipe } from './pipes/inbox/inbox-por-entry.pipe';
import { SubstituteReportComponent } from './components/substitute-report/substitute-report.component';
import { DateTimeService } from './services/date-time/date-time.service';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { CustomCurrencyPipe } from './pipes/customCurrency/custom-currency.pipe';
import { CustomNumberPipe } from './pipes/customNumber/custom-number.pipe';
import { LangCheckService } from './services/lang-check/lang-check.service';
import {MatExpansionModule} from '@angular/material/expansion';
import { environment } from './../environments/environment';
import { OktaCallbackCustomComponent } from './components/login/oktaCallBackCustom.component';
import {
  OKTA_CONFIG,
  OktaAuthModule,
} from '@okta/okta-angular';
const HOST = window.location.host;
const SCOPES = ['openid', 'profile', 'email'];
const REDIRECT_URI = `https://${HOST}${environment.callback_path}`;

const newConfig = {
  clientId: environment.client_id,
  issuer: environment.issuer,
  redirectUri: REDIRECT_URI,
  scopes: SCOPES,
  pkce: true
};
registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    HomeComponent,
    ShopComponent,
    DashComponent,
    SidebarTogglerComponent,
    SidebarComponent,
    AnaltyicsComponent,
    RuleEngineComponent,
    RuleChangeRequestComponent,
    NcrequestNewComponent,
    ApproverHierarchyPipe,
    NcrequestViewComponent,
    UserPrefComponent,
    GlAccountPipe,
    TimeFormat,
    BudgetApproverRequestComponent,
    FileDisplayPipe,
    StatusReportComponent,
    ViewBudgetRequestComponent,
    UnAuthorizedComponent,
    CreateporOptionsComponent,
    BudgetReportComponent,
    SearchPorComponent,
    DisplayPorComponent,
    ReprocessComponent,
    SpyOnInitDirective,
    UserPrefPorComponent,
    BudgetHierarchyPipe,
    InboxSectionComponent,
    InboxPorHeaderPipe,
    InboxPorEntryPipe,
    SubstituteReportComponent,
    CustomCurrencyPipe,
    CustomNumberPipe,
	OktaCallbackCustomComponent
  ],
  imports: [
    BrowserModule,
    MatSortModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    HttpClientModule,
    AutocompleteLibModule,
    NgxPaginationModule,
    NgxSmartModalModule.forRoot(),
    NgxSpinnerModule,
    AlertModule,
	OktaAuthModule
  ],
  providers: [
  { provide: OKTA_CONFIG, useValue: newConfig },
	DatePipe,
    DecimalPipe,
    CurrencyPipe,
    CustomCurrencyPipe,
    CustomNumberPipe,
    EnvServiceProvider,
    
    RoleGuardService,
    LangCheckService,
    DateTimeService
    
  ],
 bootstrap: [AppComponent]
})
export class AppModule { }
