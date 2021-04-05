import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError, of } from 'rxjs';
import { OktaAuthService } from '@okta/okta-angular';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  userClaims;

  constructor(private oktaAuth: OktaAuthService, private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const browserWindow = window || {};
    const browserWindowEnv = browserWindow['__env'] || {};
    const apiUrl = browserWindowEnv.apiUrl;
    const apiUrlPref = browserWindowEnv.apiUrlPref;
    let lang = 'en';
    if (window.location.href.indexOf('/pt') !== -1) {
      lang = 'pt';
    } else if (window.location.href.indexOf('/es') !== -1) {
      lang = 'es';
    }
    request = request.clone({
      setHeaders: {
        'Accept-Language': lang
      }
    });
    if (apiUrl.includes('localhost:')) {
      if (request.urlWithParams.indexOf(apiUrl) > -1) {
        const accessToken = await this.oktaAuth.getAccessToken();
        this.userClaims = await this.oktaAuth.getUser();
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + accessToken,
            'principal-id': localStorage.getItem('proxyEmployeeID') || this.userClaims.preferred_username/* ,
            'x-apigw-api-id': 'ugex7lrqwj' */
            ,"X-Timezone-Offset": this.getTimezoneOffset()
          }
        });
      }
      if (request.urlWithParams.indexOf(apiUrlPref) > -1) {
        const accessToken = await this.oktaAuth.getAccessToken();
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + accessToken
          }
        });
      }
      return next.handle(request).pipe(catchError(err => this.handleAuthError(err))).toPromise();
    }
    // Only add to known domains since we don't want to send our tokens to just anyone.
    // Also, it's possible that an API fails when the request includes a token.
    if (request.urlWithParams.indexOf(apiUrl) > -1) {
      const accessToken = await this.oktaAuth.getAccessToken();
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken/* ,
          'x-apigw-api-id': 'ugex7lrqwj' */
          , "X-Timezone-Offset": this.getTimezoneOffset()
        }
      });
    }
    if (request.urlWithParams.indexOf(apiUrlPref) > -1) {
      const accessToken = await this.oktaAuth.getAccessToken();
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });
    }
    return next.handle(request).pipe(catchError(err => this.handleAuthError(err))).toPromise();
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    // handle your auth error or rethrow
    if (err.status === 403 || err.status === 401) {
      // this.router.navigate(['unauthorized'], { state: { example: err.error } });
      this.router.navigateByUrl('/unauthorized/' + err.status);
      return of(err);
    }
    return throwError(err);
}
private getTimezoneOffset() : string {

  return ( String( new Date(Date.now()).getTimezoneOffset() ) );

}

}
