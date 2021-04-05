import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EnvService } from '../environments/env.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class BudgetRequestService {
  private brUrl: string;

  constructor(private http: HttpClient, private env: EnvService) {
    this.brUrl = env.apiUrl.concat('/budgetRequest');
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

  // API CALLS FOR CREATE PAGE

  public getRegions(): Observable<any> {
    return this.http.get(this.brUrl.concat('/regions')).pipe(catchError(this.handleError));
  }

  public reviewRequest(eid: string, /* region: string, */ data): Observable<any> {
    return this.http.post(this.brUrl.concat('/createBudgetRequest/' + eid /* + '/' + region */), data).pipe(catchError(this.handleError));
  }

  public submitRequest(eid: string, /* region: string,  */reqId: string, mode: string): Observable<any> {
    return this.http.post(this.brUrl.concat('/submitBudgetRequest/' + eid + /* '/' + region + */ '?budgetRequestId=' + reqId +
      '&mode=' + mode), null,
     {responseType: 'text'})
      .pipe(catchError(this.handleError));
  }

  public getTitles(): Observable<any> {
    return this.http.get(this.brUrl.concat('/titleAndRange')).pipe(catchError(this.handleError));
  }

  public validateUser(eid: string/* , option */): Observable<any> {
    return this.http.get(this.brUrl.concat('/ispresent/' + eid/*  + '?option=' + option */),
      {responseType: 'json'}).pipe(catchError(this.handleError));
  }

  public getCurrentLevel(categoryId, level: number, requesterEid: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('level', String(level));
    params = params.append('requester', requesterEid);
    return this.http.get(
      this.brUrl.concat('/getcurrentlevel/' + categoryId), {params, responseType: 'text'}
    ).pipe(catchError(this.handleError));
  }

  public checkCurrentLevel(catId, employeeId): Observable<any> {
    const params = new HttpParams().append('requester', employeeId);
    return this.http.get(
      this.brUrl.concat('/getcurrentlevelDetails/' + catId), {params}
    ).pipe(catchError(this.handleError));
  }

  getRequesterAuthority(eid): Observable<any> {
    return this.http.get(
      this.brUrl.concat('/getAuthorityLevel/' + eid)
    ).pipe(catchError(this.handleError));
  }

  getCategoryLevels(catId): Observable<any> {
    return this.http.get(
      this.brUrl.concat('/getLevel/' + catId)
    ).pipe(catchError(this.handleError));
  }

  getNewRequestList(): Observable<any> {
    return this.http.get(
      this.brUrl.concat('/getNewList')
    ).pipe(catchError(this.handleError));
  }

  getUserCurrentLevels(eid: string): Observable<any> {
    return this.http.get(
      this.brUrl.concat('/getCurrentLevelInfo/' + eid)
    ).pipe(catchError(this.handleError));
  }

  cancelRequest(reqId): Observable<any> {
    return this.http.delete(this.brUrl.concat('/cancelBA/' + reqId)
    ).pipe(catchError(this.handleError));
  }

  // API CALLS FOR VIEW PAGE

  viewRequest(reqId: string): Observable<any> {
    return this.http.get(this.brUrl.concat('/viewBudgetForm?budgetRequestId=' + reqId)).pipe(catchError(this.handleError));
  }

  validateRequest(requesterEid, budgetRequestId, approved: boolean, data): Observable<any> {
    return this.http.post(
      this.brUrl.concat('/validateBudgetRequest/' + requesterEid + '?budgetRequestId=' + budgetRequestId + '&approved=' + approved
      ), data, {responseType: 'text'}).pipe(catchError(this.handleError));
  }

  askQuestion(requestId: string, requesterId: string /* eid */, data): Observable<any> {
    let params = new HttpParams();
    params = params.append('budgetRequestId', requestId);
    params = params.append('requesterId', String(requesterId));
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(
      this.brUrl.concat('/askQuestion'), data, {params, headers, responseType: 'text'}
    ).pipe(catchError(this.handleError));
  }

  getComments(reqId: string): Observable<any> { // userbudgetcomments?budgetRequestId=A250
    let params = new HttpParams();
    params = params.append('budgetRequestId', reqId);
    return this.http.get(
      this.brUrl.concat('/userbudgetcomments'), {params}
    ).pipe(catchError(this.handleError));
  }

  updateRequest(data: any): Observable<any> {
    return this.http.post(this.brUrl.concat('/updateBudgetRequest'), data)
      .pipe(catchError(this.handleError));
  }

  // API CALLS FOR DASH PAGE

  getBRWaiting(apprId): Observable<any> {
    let params = new HttpParams();
    params = params.append('approverId', apprId);
    return this.http.get(this.brUrl.concat('/getBRWaiting'), {params}).pipe(catchError(this.handleError));
  }

  getBRCreatedBy(adId): Observable<any> {
    let params = new HttpParams();
    params = params.append('createdBy', adId);
    return this.http.get(this.brUrl.concat('/viewbudgetrequest'), {params}).pipe(catchError(this.handleError));
  }

  getBrByRequester(eaId: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('requester', eaId);
    return this.http.get(this.brUrl.concat('/viewbudgetRequestions'), {params}).pipe(catchError(this.handleError));
  }

  getBRApprovedRejected(adId): Observable<any> {
    let params = new HttpParams();
    params = params.append('approverId', adId);
    return this.http.get(this.brUrl.concat('/getBR'), {params}).pipe(catchError(this.handleError));
  }

  getBRSubWaiting(adId): Observable<any> {
    let params = new HttpParams();
    params = params.append('approverId', adId);
    return this.http.get(this.brUrl.concat('/getBRSubWaiting'), {params}).pipe(catchError(this.handleError));
  }

}
