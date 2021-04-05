import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
export class ReportService {
  private apiUrl: string;
  private testUrl: string;

  constructor(private http: HttpClient, private env: EnvService) {
    this.apiUrl = env.apiUrl; // TODO: concat appropriately
    this.testUrl = 'http://localhost:3000';
  }
  public sendSubstituteReportData(data?: any): Observable<any> {
    return this.http.post(this.apiUrl.concat('/purchaseRequest/report/substitutor'), data, httpOptions).pipe(catchError(this.handleError));
  }

  public sendPostData(data?: any): Observable<any> {
    console.log('data is'+data)
    //return this.http.get(this.testUrl.concat('/statusreport')).pipe(catchError(this.handleError));
    return this.http.post(this.apiUrl.concat('/purchaseRequest/report/fields'), data, httpOptions).pipe(catchError(this.handleError));
  }

  public sendBudgetReportData(data?: any): Observable<any> {
    console.log('data is'+data)
    //return this.http.get(this.testUrl.concat('/statusreport')).pipe(catchError(this.handleError));
    return this.http.post(this.apiUrl.concat('/purchaseRequest/report/budget'), data, httpOptions).pipe(catchError(this.handleError));
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
}
