import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EnvService } from '../environments/env.service';
import { OktaAuthService } from '@okta/okta-angular';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserPrefService {
  apiUrl: string;
  apiUrl2: string;
  apriUrlPref: string;
  cachedUserPrefEntity;
  cachedUserProfile;

  constructor(private http: HttpClient, private env: EnvService, public oktaAuth: OktaAuthService) {
    this.apiUrl = env.apiUrl;
    this.apiUrl2 = env.apiUrl.concat('/orderRequest');
    this.apriUrlPref = env.apiUrlPref;
  }

  getPreferences(userId: number): Observable<any> {
    return this.http.get(this.apiUrl.concat('/orderRequest/viewbyuserid?userid=' + userId)).pipe(catchError(this.handleError));
  }

  public getComment(prId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl.concat('/orderRequest/usercomments?prId=' + prId)).pipe(catchError(this.handleError));
  }
  public sendEprocuserPref(data: any): Observable<any> {
    console.log(this.apiUrl.concat('/orderRequest/userPref') + ' \n data is==> ' + data);
    return this.http.post<any>(this.apiUrl.concat('/orderRequest/userPref'), data, httpOptions).pipe(catchError(this.handleError));
  }
  public getRegion(EID): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/region/employee/' + EID), {responseType: 'text'}).pipe(catchError(this.handleError));
  }
  public getSubstitutors(EID): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/substitutors/employee/' + EID)).pipe(catchError(this.handleError));
  }
  public getAllSubstitutions(EID): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/substitutor/employee/' + EID)).pipe(catchError(this.handleError));
  }
  public getCertainSubstitutors(EID, status): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/substitutor/employee/' + EID + '/status/' + status)).pipe(catchError(this.handleError));
  }
  public createSubstitution(data: any) {
    return this.http.post<any>(this.apiUrl2.concat('/substitutor'), data, httpOptions).pipe(catchError(this.handleError));
  }
  public checkIfAdmin(EID: number): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/financeReviewer/employee/' + EID)).pipe(catchError(this.handleError));
  }
  public getSubsByAdmin(EID: number): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/substitutor/admin/' + EID)).pipe(catchError(this.handleError));
  }
  public getCertainSubsByAdmin(EID, status): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/substitutor/admin/' + EID + '/status/' + status)).pipe(catchError(this.handleError));
  }
  public getSubsForAdmin(EID): Observable<any> {
    return this.http.get(this.apiUrl2.concat('/substitutors/admin/' + EID)).pipe(catchError(this.handleError));
  }

  // user profile related services
  public getProfile(EID): Observable<any> {
    return this.http.get(this.apriUrlPref.concat
      ('userprofile/getProfile'), {params: {
        employeeID : EID
      }})
      .pipe(catchError(this.handleError));
  }
  public async loadLangSpecificApp() {
    let profile = await this.getProfileFromCache();
    let language = 'en';
    if (profile && profile.userPref ) {
      profile.userPref.forEach(entity => {
        if (entity.value && entity.type === 'userPreference') {
          language = entity.value.language.toLowerCase();
        }
      });
    } else {
      language = 'en';
    }
    let loc = window.location.href;
    loc = loc.replace('/en', ('/' + language));
    loc = loc.replace('/es', ('/' + language));
    loc = loc.replace('/pt', ('/' + language));

    if (loc !== window.location.href) {
      window.location.href = loc;
    }
  }
  public async getProfileFromCache() {
    const userClaims = await this.oktaAuth.getUser();
    let userId = userClaims.preferred_username;
	userId='EAI23598';
    if (localStorage.getItem('proxyUsername')) {
      userId = localStorage.getItem('proxyEmployeeID');
    }
    let userProfile;
    if (this.cachedUserProfile && this.cachedUserProfile.EID === userId) {
      userProfile = this.cachedUserProfile.value;
    } else {
      let profile = {};
      try {
        profile = await this.getProfile(userId).toPromise();
      } catch (e) {
        console.log('get profile error: ' + e);
        profile = {};
      }
      userProfile = profile ? profile : {} ;
      this.cachedUserProfile = {
        EID: userId,
        value: userProfile
      };

    }
    let genericSettings;
    if (userProfile && userProfile.userPref) {
      userProfile.userPref.forEach(entity => {
        if (entity.type === 'genericPreference') {
          genericSettings = entity.value;
        }
      });
    }
    if (userProfile && userProfile.userPref) {
      userProfile.userPref.forEach(entity => {
        if (entity.type === 'userPreference') {
          genericSettings = genericSettings || {};
          // generic settings are copied to userpref cache, so component reference are not broken
          entity.value.language = genericSettings.language || 'en';
          entity.value.numberFormat = genericSettings.numberFormat || '1,234,567.89';
          entity.value.dateFormat = genericSettings.dateFormat || 'MM/DD/YYYY';
          entity.value.timeFormat = genericSettings.timeFormat || '12 Hour Format';

          this.cachedUserPrefEntity = {
            EID: userId,
            userPreference: entity.value
          };
        }
      });
    }

    return userProfile;
  }
  public getUserPreference(EID, entityName): Observable<any> {
    return this.http.get(this.apriUrlPref.concat
      ('/api/userpreference/getuserpref'), {params: {
        employeeID : EID,
        entityName: entityName
      }})
      .pipe(catchError(this.handleError));
  }

  public saveUserPreference(EID, data): Observable<any> {
    //alert('EID--'+EID)
    return this.http.post<any>(this.apriUrlPref.concat
      ('/api/userpreference/save/' + EID), data, httpOptions)
      .pipe(catchError(this.handleError));
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
