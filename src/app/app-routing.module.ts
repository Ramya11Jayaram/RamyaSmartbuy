import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ShopComponent } from './components/shop/shop.component';
import { DashComponent } from './components/dash/dash.component';
import { AnaltyicsComponent } from './components/analtyics/analtyics.component';
import { RuleEngineComponent } from './components/rule-engine/rule-engine.component';
import { RuleChangeRequestComponent } from './components/rule-change-request/rule-change-request.component';
import { OktaCallbackComponent } from '@okta/okta-angular';
import { OktaAuthGuard as AuthGuard } from '@okta/okta-angular';
import { NcrequestNewComponent } from './components/ncrequest-new/ncrequest-new.component';
import { NcrequestViewComponent } from './components/ncrequest-view/ncrequest-view.component';
import { UserPrefComponent } from './components/user-pref/user-pref.component';
import { BudgetApproverRequestComponent } from './components/budget-approver-request/budget-approver-request.component';
import { StatusReportComponent } from './components/status-report/status-report.component';
import { ViewBudgetRequestComponent } from './components/view-budget-request/view-budget-request.component';
import { UnAuthorizedComponent } from './components/un-authorized/un-authorized.component';
import { CreateporOptionsComponent } from './components/createpor-options/createpor-options.component';
import { BudgetReportComponent } from './components/budget-report/budget-report.component';
import { DisplayPorComponent } from './components/display-por/display-por.component';
import { ReprocessComponent } from './components/reprocess/reprocess.component';
import { RoleGuardService } from './services/role-guard/role-guard.service';
import {SubstituteReportComponent} from './components/substitute-report/substitute-report.component';
import { LangCheckService } from './services/lang-check/lang-check.service';
import { OktaCallbackCustomComponent } from './components/login/oktaCallBackCustom.component';


const routes: Routes = [
  { path: 'implicit/callback', component: OktaCallbackCustomComponent },
  { path: 'login', component: LoginComponent},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'shop', component: ShopComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'dash', component: DashComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'analytics', component: AnaltyicsComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'apprrole', component: RuleEngineComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'apprroleedit', component: RuleChangeRequestComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'ncrequest', component: CreateporOptionsComponent, canActivate: [AuthGuard, RoleGuardService, LangCheckService] },
  { path: 'ncrequestnew', component: NcrequestNewComponent, canActivate: [AuthGuard, RoleGuardService, LangCheckService] },
  { path: 'ncrequestview/:id', component: NcrequestViewComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'userpref', component: UserPrefComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'displaypo', component: DisplayPorComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'barequest', component: BudgetApproverRequestComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'barequestview/:id', component: ViewBudgetRequestComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'statusreport', component: StatusReportComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'substitutereport', component: SubstituteReportComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'draft/:id', component: NcrequestNewComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'unauthorized/:val', component: UnAuthorizedComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'budgetreport', component: BudgetReportComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: 'reprocess', component: ReprocessComponent, canActivate: [AuthGuard, LangCheckService] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
