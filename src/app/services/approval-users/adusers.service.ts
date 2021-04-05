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
export class AdusersService {
  private usersUrl: string;
  private usersUrl2: string;

  constructor(private http: HttpClient, private env: EnvService) {
    this.usersUrl = env.apiUrl;
    this.usersUrl2 = env.apiUrl.concat('/orderRequest');
  }
/*   public findAll(): Observable<SidebarLink[]> { // dont use this method yet lol
    return this.http.get<SidebarLink[]>(this.linksUrl);
  }

  public save(tile: SidebarLink) { // dont use this method yet lol
    return this.http.post<SidebarLink>(this.linksUrl, tile);
  } */

  public getAll(): Observable<any> {
    return this.http.get(this.usersUrl2.concat('/adusers')).pipe(catchError(this.handleError));
  }

  public getHr(): Observable<any> {
    return this.http.get(this.usersUrl2.concat('/hrUsers')).pipe(catchError(this.handleError));
  }

  public getHrUserByRegion(userRegion): Observable<any> {
    return this.http.get(this.usersUrl2.concat('/hrUsersbyRegion'), {params: {
      region : userRegion
    }}).pipe(catchError(this.handleError));
  }

/*   public sendData(data: any): Observable<any> { // not used anymore
    return this.http.post(this.usersUrl.concat('/approverhierarchy'), data, httpOptions)
    .pipe(catchError(this.handleError));
  } */

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
