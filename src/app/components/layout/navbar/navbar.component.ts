import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';
import { SidebarService } from 'src/app/services/sidebar/sidebar.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userName: string;
  isProd = true;

  constructor(
    private router: Router, public oktaAuth: OktaAuthService, public sidebarService: SidebarService
  ) { }

  async ngOnInit() {
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    } else {
      this.isProd = false;
    }
    const userClaims = await this.oktaAuth.getUser();
//	alert(userClaims)
    this.userName = 'Devandra Yadav';//userClaims.name;
//	alert(this.userName)
    /* console.log(userClaims); */
  }

  onUserClick() {
    this.router.navigateByUrl('userpref');
  }

  onLogoutClick() {
    localStorage.removeItem('path');
    if (!this.sidebarService.hideSidebar) {
      this.sidebarService.toggleSidebar();
    }
    this.oktaAuth.logout('');
    this.router.navigateByUrl('login');
  }

  getProxy(): string {
    if (environment.production) {
      localStorage.removeItem('proxyUsername');
      localStorage.removeItem('proxyUserID');
      localStorage.removeItem('proxyEmployeeID');
    }
    return localStorage.getItem('proxyUsername');
  }

}
