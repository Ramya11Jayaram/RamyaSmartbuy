import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
import { OktaAuthService } from '@okta/okta-angular';

@Injectable({
  providedIn: 'root'
})
export class LangCheckService implements CanActivate {
  isAuthenticated: boolean;
  constructor(private prefService: UserPrefService, private router: Router, public oktaAuth: OktaAuthService) { }
  async canActivate() {
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    if (!this.isAuthenticated) {
      // this.router.navigateByUrl('home');
      return false;
    } else {
      await this.prefService.loadLangSpecificApp();
      return true;
    }
  }
}
