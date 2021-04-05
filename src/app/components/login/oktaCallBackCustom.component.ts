
import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { Router } from '@angular/router';

@Component({
  template: `<div *ngIf="error?.errorCode ==='access_denied'" class="alert alert-danger"
   role="alert" style="font-weight: bold; padding-top: 30px">
  <span i18n="@@oktaNoAppAccess">
  Your User has not been setup for this application,
  please reach IS support team or request access by sending an email to service_desk@ameri100.com
  </span>
</div>`
})
export class OktaCallbackCustomComponent implements OnInit {
  error: any;

  constructor(private okta: OktaAuthService, private router: Router) {}

  async ngOnInit() {
    // Handles the response from Okta and parses tokens.
    return this.okta.handleAuthentication()
      .then(() => {
        // Navigate back to the saved uri, or root of application.
        const fromUri = this.okta.getFromUri();
        window.location.replace(fromUri.uri);
      })
      .catch(e => {
        this.error = e;
        if (e.errorCode === 'access_denied') {
          console.log('access_denied error', e);
        }
      });
  }
}
