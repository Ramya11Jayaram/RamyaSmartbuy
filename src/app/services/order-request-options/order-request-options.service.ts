import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EnvService } from '../environments/env.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

const httpOptionsFile = {
  headers: new HttpHeaders({
    /* 'Content-Type': 'multipart/form-data', */
  })
}; // change!

const httpOptions2 = {
  headers: new HttpHeaders({}),
  responseType: 'blob' as 'json'
};
const httpOptions3 = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
  responseType: 'text' as 'json'
};

@Injectable({
  providedIn: 'root'
})
export class OrderRequestOptionsService {
  private apiUrl: string;
  private apiUrl2: string;
  private apiUrl3: string;
  private apiUrl4: string;
  constructor(private http: HttpClient, private env: EnvService) {
    this.apiUrl2 = env.apiUrl;
    this.apiUrl = env.apiUrl.concat('/orderRequest');
    this.apiUrl3 = env.apiUrl.concat('/purchaseRequest');
    this.apiUrl4 = env.apiUrl.concat('/budgetRequest');
    /* console.log(this.apiUrl); */
  }
  /*   public findAll(): Observable<SidebarLink[]> { // dont use this method yet lol
    return this.http.get<SidebarLink[]>(this.linksUrl);
  }

  public save(tile: SidebarLink) { // dont use this method yet lol
    return this.http.post<SidebarLink>(this.linksUrl, tile);
  } */

  /*   public getAll(): Observable<any> {
      return this.http.get(this.apiUrl.concat('/getOrderRequestOptions')).pipe(catchError(this.handleError));
    } */
  public getCategories(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/orderRequestPurchaseCategory')).pipe(catchError(this.handleError));
  }
  public getSelectedCategories(list): Observable<any> {
    return this.http.get(this.apiUrl.concat('/orderRequestPurchaseCategory'), {params: {
      orderList: list
    }}).pipe(catchError(this.handleError));
  }

  public getRequesters(): Observable<any> {

    return this.http.get(this.apiUrl.concat
      (/* '/orderRequestRequester' */'/hRUserAdInfoUsers')).pipe(catchError(this.handleError));
  }
  public getSelectedRequesters(list): Observable<any> {

    return this.http.get(this.apiUrl.concat('/hRUserAdInfoUsers'), {params: {
        empList: list
    }}).pipe(catchError(this.handleError));
  }

  public getVendors(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/vendor')).pipe(catchError(this.handleError));
  }

  public getSpecificVendors(purchaseOrg): Observable<any> {
    return this.http.get
    (this.apiUrl.concat('/vendor/purchaseOrg/' + purchaseOrg)).pipe(catchError(this.handleError));
  }
  public getSelectedVendors(purchaseOrg, vendorList): Observable<any> {
    return this.http.get
    (this.apiUrl.concat('/vendorlist/purchaseOrg/' + purchaseOrg + '/vendorList/' +vendorList ))
    .pipe(catchError(this.handleError));
  }
  public getVendorsByList(purchaseOrgList): Observable<any> {
    return this.http.get
    (this.apiUrl.concat('/vendor/purchaseOrgList/' + purchaseOrgList )).pipe(catchError(this.handleError));
  }
  public getGLAccountByList(companyCode, purchaseOrg): Observable<any> {
    return this.http.get
    (this.apiUrl.concat('/glaccountbycompanycodeList/purchaseOrderlist/' + purchaseOrg + '/companylist/' + companyCode))
    .pipe(catchError(this.handleError));
  }
  public getCostCenterByList(companyCode): Observable<any> {
    return this.http.get
    (this.apiUrl.concat('/costcenter/company/' + companyCode)).pipe(catchError(this.handleError));
  }

  public getCurrency(): Observable<any> {

    return this.http.get(this.apiUrl.concat('/orderRequestCurrency')).pipe(catchError(this.handleError));
  }


  public getPOR(): Observable<any> { // TODO: change back to api data once api data is returned

    return this.http.get(this.apiUrl.concat('/accountAssignmentCategory')).pipe(catchError(this.handleError));
  }

  public getGlAccount(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/glaccountmaster')).pipe(catchError(this.handleError));
  }

  /* public getSpecificGlAccount(companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/glaccountmaster/company/' + companyCode)).pipe(catchError(this.handleError));
  } */

  public getSpecificGlAccount(catId, companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/glaccount/' + catId + '/' + companyCode)).pipe(catchError(this.handleError));
  }
// http://localhost:8080/api/orderRequest/glaccountbyListId/16554/purchaseOrder/1/company/1000
  public getSelectedGlAccount(catId, companyCode, glList): Observable<any> {
    return this.http.get(this.apiUrl.concat('/glaccountbyListId/' + glList + '/purchaseOrder/' + catId + '/company/' + companyCode))
    .pipe(catchError(this.handleError));
  }

  public getCostCenter(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/costcenter')).pipe(catchError(this.handleError));
  }

  public getSpecificCostCenter(companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/costcenter/company/' + companyCode)).pipe(catchError(this.handleError));
  }
  public getSelectedCostCenter(companyCode, costCenterList): Observable<any> {
    return this.http.get(this.apiUrl.concat('/costcenterbylist/company/' + companyCode + '/costcenterlist/' + costCenterList)).pipe(catchError(this.handleError));
  }
  public getSpecificMaterial(companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/material/company/' + companyCode)).pipe(catchError(this.handleError));
  }
  public getAssetClass(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/assetclass')).pipe(catchError(this.handleError));
  }

  public getSpecificAssetClass(companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/assetclass/company/' + companyCode)).pipe(catchError(this.handleError));
  }

  public getSpecificInternalOrder(companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/internalorder/company/' + companyCode)).pipe(catchError(this.handleError));
  }

  public getIoWithGLAccount(glId, costCenterId, companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/internalorders/' + glId + '/' + costCenterId + '/' + companyCode))
      .pipe(catchError(this.handleError));
  }

  public getInternalOrder(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/internalorder')).pipe(catchError(this.handleError));
  }

  public getAssetNumber(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/asset')).pipe(catchError(this.handleError));
  }

  public getSpecificAssetNumber(companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/asset/company/' + companyCode)).pipe(catchError(this.handleError));
  }

  public getProfitCenter(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/profitCenter')).pipe(catchError(this.handleError));
  }


  public getCompany(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/company')).pipe(catchError(this.handleError));
  }

  public getCompanyByRegion(userRegion): Observable<any> {
    return this.http.get(this.apiUrl.concat('/getcompanybyregion'), {params: {
      region: userRegion
    }}).pipe(catchError(this.handleError));
  }

  public getSelectedCompanies(list): Observable<any> {
    return this.http.get(this.apiUrl.concat('/companybylistid'), {params: {
      companyId: list
    }}).pipe(catchError(this.handleError));
  }
  public getUom(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/uom')).pipe(catchError(this.handleError));
  }
  public getSelectedUom(uomlist): Observable<any> {
    return this.http.get(this.apiUrl.concat('/uomlist/' + uomlist)).pipe(catchError(this.handleError));
  }
  public getMaterial(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/material')).pipe(catchError(this.handleError));
  }

  public sendForm(data: any, mode: string): Observable<any> {
    console.log(this.apiUrl3.concat('/createPOR?mode=' + mode));
    console.log(data);
    return this.http.post(this.apiUrl3.concat('/createPOR?mode=' + mode), data, httpOptions).pipe(catchError(this.handleError));

  }

  public deleteAdditionalApprover(prId: number, data: number[]): Observable<any> {
    return this.http.post(this.apiUrl3.concat('/deleteAditionalApprover?prId=' + prId), data, httpOptions)
      .pipe(catchError(this.handleError));
  }

  public getSavedAdditionalApprovers(prId: number): Observable<any> {
    return this.http.get(this.apiUrl3.concat('/retriveAdditionalApprovers?prId=' + prId))
      .pipe(catchError(this.handleError));
  }

  public saveAdditionalApprovers(prId: number, data: number[]): Observable<any> {
    return this.http.post(this.apiUrl3.concat('/addAditionalApprover?prId=' + prId), data, httpOptions).pipe(catchError(this.handleError));

  }

  public getAdditionalApprovers(prId: number, restrict: boolean): Observable<any> {
    return this.http.get(this.apiUrl3.concat('/getAdditionalApproversList?prId=' + prId))
      .pipe(catchError(this.handleError));
  }

  public getInUsd(currency: any, amount: number): Observable<any> {
    return this.http.get(this.apiUrl.concat('/exchangeRate/' + currency + '/' + amount)).pipe(catchError(this.handleError));
  }
  public sendOnApprove(purchaseOrderId: number, approverId: number, approved: boolean): Observable<any> {
    // tslint:disable: max-line-length
    console.log('===sendOnApprove==' + this.apiUrl3.concat('/validatePOR?purchaseOrderId=' + purchaseOrderId + '&approverId=' + approverId + '&approved=' + approved));
    return this.http.put<any>(this.apiUrl3.concat('/validatePOR?purchaseOrderId=' + purchaseOrderId + '&approverId=' + approverId + '&approved=' + approved), httpOptions).pipe(catchError(this.handleError));

  }

  public sendOnReject(purchaseOrderId: number, approverId: number, approved: boolean): Observable<any> {
    return this.http.post<any>(this.apiUrl3.concat('/validatePOR?purchaseOrderId=' + purchaseOrderId + '&approverId=' + approverId + '&approved=' + approved), httpOptions).pipe(catchError(this.handleError));
  }

  public sendForConfirmation(purchaseOrderId: number, approverId: number, approved: boolean): Observable<any> {
    console.log('pending for confirmation is--->' + approverId);
    console.log('pending for confirmation is--->' + this.apiUrl3.concat('/clarificationPOR?purchaseOrderId=' + purchaseOrderId + '&approverId=' + approverId + '&approved=' + approved));
    return this.http.put<any>(this.apiUrl3.concat('/clarificationPOR?purchaseOrderId=' + purchaseOrderId + '&approverId=' + approverId + '&approved=' + approved), httpOptions).pipe(catchError(this.handleError));
  }
  public getDocumentStatus(purchaseOrderId: number): Observable<any> { 
   
    console.log('URL is--->' + this.apiUrl3.concat('/getdocstatus?purchaseOrderId=' + purchaseOrderId));
    return this.http.get(this.apiUrl3.concat('/getdocstatus?purchaseOrderId=' + purchaseOrderId)).pipe(catchError(this.handleError));
  }
  public getWatcher(purchaseOrderId: number): Observable<any> {
    console.log('URL is--->' + this.apiUrl3.concat('/viewWatcher?prid=' + purchaseOrderId));
    return this.http.get(this.apiUrl3.concat('/viewWatcher?prid=' + purchaseOrderId)).pipe(catchError(this.handleError));
  }

  public getHighestLevelApprover(): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/gp/hilvlapprover')).pipe(catchError(this.handleError));
  }

  public getVpOptions(prid, tf: boolean): Observable<any> {
    return this.http.get(this.apiUrl3.concat('/getVPApprovers?prId= ' + prid + '&restrictByCCRegion=' + tf))
      .pipe(catchError(this.handleError));
  }

  public sendComment(data: any): Observable<any> {
    console.log(this.apiUrl.concat('/comment') + '\n data is==>' + data);
    return this.http.post<any>(this.apiUrl.concat('/comment'), data, httpOptions).pipe(catchError(this.handleError));
  }

  public uploadFile(data: any, prid: any): Observable<any> {
    /* console.error('function not properly implemented yet' + data); */
    return this.http.post(this.apiUrl3.concat('/attachment?prid=' + prid), data, httpOptionsFile).pipe(catchError(this.handleError));
  }

  public updateForm(data: any): Observable<any> {
    console.log(this.apiUrl3.concat('/updatePOR'));
    console.log(data);
    return this.http.patch(this.apiUrl3.concat('/UpdatePOR'), data, httpOptions).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return observable with user-facing error message
    return throwError(error);
  }

  public cancelDraft(purchaseOrderId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl3.concat('/cancelDraft?purchaseOrderId=' + purchaseOrderId), null, httpOptions3 ).pipe(catchError(this.handleError));
  }

  public askQuestion(data, poId: number, eid: string): Observable<any> {
    return this.http.post((this.apiUrl3 + '/askQuestion?purchaseOrderId=' + poId + '&requesterId=' + eid), data, httpOptions).pipe(catchError(this.handleError));
  }
  public verifyAddress(data: any): Observable<any> {

    console.log(this.apiUrl3.concat('/addressverification'));
    console.log(data);
    return this.http.post(this.apiUrl3.concat('/addressverification'), data, httpOptions).pipe(catchError(this.handleError));

  }

  public downloadFile(prid: number, filename: string): Observable<any> {
    return this.http.get(this.apiUrl3.concat('/getAttachment?prid=' + prid + '&filename=' + filename), {responseType: 'blob'}).pipe(catchError(this.handleError));
  }

  public deleteFile(prid: number, filename: string): Observable<any> {
    return this.http.get(
      this.apiUrl3.concat('/deleteAttachment?prid=' + prid + '&filename=' + filename), {responseType: 'text'}
      ).pipe(catchError(this.handleError));
  }
  public getRegion(): Observable<any> {
    console.log(this.http.get(this.apiUrl4.concat('/regions')))
    return this.http.get(this.apiUrl4.concat('/regions')).pipe(catchError(this.handleError));

  }
  public getdistinctLevel(): Observable<any> {
    return this.http.get(this.apiUrl3.concat('/grouplevel')).pipe(catchError(this.handleError));
  }
  public getlevelObj(): Observable<any> {
    return this.http.get(this.apiUrl3.concat('/alllevel')).pipe(catchError(this.handleError));
  }
  public getLevelOnMaterialGp(mg:number): Observable<any> {
    return this.http.get(this.apiUrl3.concat('/getlevelforMg?mg='+mg)).pipe(catchError(this.handleError));
  }
  /*public getBuyers(code:number): Observable<any> {
    return this.http.get(this.apiUrl.concat('/buyerall?code='+code)).pipe(catchError(this.handleError));
  }*/
  public getBuyers(companyCode): Observable<any> {
    return this.http.get(this.apiUrl.concat('/buyerall/company/' + companyCode)).pipe(catchError(this.handleError));
  }
  public getPreviewList(prId: number, data: any): Observable<any> {
    return this.http.post(this.apiUrl3.concat('/getEditedapprovers?prId='+prId),data,httpOptions).pipe(catchError(this.handleError));

  }

  public getCountryList(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/countrylist')).pipe(catchError(this.handleError));
  }

  public getGlobalStateList(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/statelist')).pipe(catchError(this.handleError));
  }

  public getCountryStates(code: string): Observable<any> {
    return this.http.get(this.apiUrl.concat('/states/' + code)).pipe(catchError(this.handleError));
  }
}
