import { Component } from '@angular/core';
import { SidebarService } from './services/sidebar/sidebar.service';
import { OktaAuthService } from '@okta/okta-angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAuthenticated: boolean;
  title = 'smartbuy-app';
  production = true;

  constructor(public sidebarService: SidebarService, private userPrefService: UserPrefService,
              public oktaAuth: OktaAuthService, public spinner: NgxSpinnerService) {
    this.oktaAuth.$authenticationState.subscribe(
    (isAuthenticated: boolean)  => this.isAuthenticated = isAuthenticated
  ); }

  // tslint:disable-next-line: use-lifecycle-interface
  async ngOnInit() {
    // Get the authentication state for immediate use
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    if (!environment.production) {
      this.production = false;
    }
    // await this.userPrefService.loadLangSpecificApp();

    if ( window.location.href.indexOf('login') === -1 && window.location.href.indexOf('implicit') === -1) {
      let app = window.location.href.split('/')[2];
      let route = window.location.href.split(app)[1];
      route = route.replace('/en/', (''));
      route = route.replace('/es/', (''));
      route = route.replace('/pt/', (''));
      localStorage.setItem('path', route);
    }

  }

  login() {
    this.oktaAuth.loginRedirect('home');
  }
  logout() {
    this.oktaAuth.logout('');
  }

  onActivate(event) {
    window.scroll(0, 0);
  }
}
