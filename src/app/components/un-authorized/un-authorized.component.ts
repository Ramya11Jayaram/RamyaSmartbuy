import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';

@Component({
  selector: 'app-un-authorized',
  templateUrl: './un-authorized.component.html',
  styleUrls: ['./un-authorized.component.css']
})
export class UnAuthorizedComponent implements OnInit {
  errCode: string;
  constructor(private router: Router, private route: ActivatedRoute,
              public oktaAuth: OktaAuthService, public errTransService: ErrorTranslationService) {
   this.errCode = this.route.snapshot.params.val.toString();
   }
  data: any;
  ngOnInit() {
   // this.data = history.state.data;
   if (this.errCode === '401') {
    const x = confirm(this.errTransService.returnMsg('sessionExpired'));
    if (x) {
      this.oktaAuth.logout('');
      this.router.navigateByUrl('login');
    }
   }
  }

}
