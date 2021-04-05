import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';
import * as OktaSignIn from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm;
  configuration: any = this.oktaAuth.getOktaConfig();
  isAuthenticated: boolean;
  // cars: Array<any>;
  signIn;
  widget = new OktaSignIn({
    baseUrl: this.configuration.baseUrl,
    authParams: {
      pkce: this.configuration.pkce
    },
    logo: '../../../assets/images/logo_ameri.png'
  });

  constructor(private formBuilder: FormBuilder, private router: Router, public oktaAuth: OktaAuthService) {
    this.loginForm = this.formBuilder.group({
      email: '',
      password: '',
      stayIn: false
    });

    this.signIn = oktaAuth;
  }

  async ngOnInit() {
    const browserWindow = window || {};
    const browserWindowEnv = browserWindow['__env'] || {};

    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    // Subscribe to authentication state changes
    this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean) => this.isAuthenticated = isAuthenticated
    );
    if (this.isAuthenticated) {
      let path = localStorage.getItem('path');

      if (path) {
        this.router.navigateByUrl(path);
      } else {
        this.router.navigateByUrl('home');
      }

    } else {
      this.signIn.oktaAuth.token.getWithoutPrompt({
        responseType: ['token', 'id_token'],
        scopes: ['openid', 'profile', 'email']
      })
      .then((res) => {
        this.signIn.oktaAuth.tokenManager.add('idToken', res[1]);
        this.signIn.oktaAuth.tokenManager.add('accessToken', res[0]);

        let path = localStorage.getItem('path');
        if (path) {
          this.signIn.loginRedirect(path);
        } else {
          this.signIn.loginRedirect('home');
        }
      })
      .catch((err) => {
        // Redirect to Okta
        this.signIn.oktaAuth.token.getWithRedirect({
            responseType: ['token', 'id_token'],
            scopes: ['openid', 'profile', 'email']
        });
      });
    }
  }

  onLoginClick() {
    alert('Welcome, ' + this.loginForm.value.email +
      '. Login validation is not yet implemented. Your password is: "' + this.loginForm.value.password +
      '". Also, your checkbox value is: ' + this.loginForm.value.stayIn);
    this.router.navigateByUrl('home');
    /*// tslint:disable-next-line: forin prefer-const
    console.log(this.cars);
  */}

  onRedirectClick() {
    this.router.navigateByUrl('home');
  }
}
