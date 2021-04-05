import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { OktaAuthService } from '@okta/okta-angular';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {
  isAuthenticated: boolean;
  profile;
  EID;
  constructor(private prefService: UserPrefService, public oktaAuth: OktaAuthService) { }
  async canActivate() {
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    if (!this.isAuthenticated) {
      return false;
    } else {
      const userClaims = await this.oktaAuth.getUser();
      this.EID = userClaims.preferred_username;
      if (localStorage.getItem('proxyEmployeeID')) {
        this.EID = localStorage.getItem('proxyEmployeeID');
      }
      if (this.prefService.cachedUserProfile && this.prefService.cachedUserProfile.EID === this.EID) {
        this.profile = this.prefService.cachedUserProfile.value;
      } else {
        const profile = await this.prefService.getProfile(this.EID).toPromise();
        this.profile = profile ? profile : {} ;
        this.prefService.cachedUserProfile = {
          EID: this.EID,
          value: this.profile
        };
      }
      if(this.profile.hrUser && this.profile.hrUser.adminAccess === 'X' ) {
        return true;
      } else {
        return false;
      }
    }
  }
}
