import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EnvService } from '../environments/env.service';

@Injectable({
  providedIn: 'root'
})
export class ReprocessService {
  private apiUrl: string;

  constructor(private http: HttpClient, private env: EnvService) {
    this.apiUrl = env.apiUrl.concat('/message');
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

  public getAll(): Observable<any> {
    return this.http.get(this.apiUrl.concat('/messages')).pipe(catchError(this.handleError));
  }

  public getOne(id: number): Observable<any> {
    return this.http.get(this.apiUrl.concat('/message/' + id)).pipe(catchError(this.handleError));
  }

  public reprocess(id: number): Observable<any> {
    return this.http.get(this.apiUrl.concat('/reprocess/' + id)).pipe(catchError(this.handleError));
  }
}
