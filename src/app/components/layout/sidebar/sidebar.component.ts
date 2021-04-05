import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { SidebarLink } from 'src/app/services/sidebar-links/sidebar-link';
import { SidebarLinksService } from 'src/app/services/sidebar-links/sidebar-links.service';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';
/* import { OktaAuthService } from '@okta/okta-angular'; */

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  debug = false;
  userLinks: Array<SidebarLink>;

  constructor(public sidebarService: SidebarService, private router: Router,
              private userPrefService: UserPrefService, private sidebarLinksService: SidebarLinksService
     /* public oktaAuth: OktaAuthService */) { }

  async ngOnInit() {
    const userProfile = await this.userPrefService.getProfileFromCache();
    const profile = userProfile.hrUser || {};
    this.sidebarLinksService.getAll(profile.adminAccess || null).subscribe(data => {
      data.sort((a, b) => (a.displayorder > b.displayorder) ? 1 : -1);
      this.userLinks = data;
    });
    /* console.log(this.userLinks); */
  }

  /* onHomeClick() {
    this.router.navigateByUrl('home');
    this.sidebarService.toggleSidebar();
  }

  // onLogoutClick() {
  //   this.sidebarService.toggleSidebar();
  //   this.oktaAuth.logout('');
  // }

  onShopClick() {
    this.router.navigateByUrl('shop');
    this.sidebarService.toggleSidebar();
  }

  onDashClick() {
    this.router.navigateByUrl('dash');
    this.sidebarService.toggleSidebar();
  }

  // below needs authorization

  onRuleEngineClick() {
    this.router.navigateByUrl('apprrole');
    this.sidebarService.toggleSidebar();
  }

  onRuleChangeRequestClick() {
    this.router.navigateByUrl('apprroleedit');
    this.sidebarService.toggleSidebar();
  }

  onAnalyticsClick() {
    this.router.navigateByUrl('analytics');
    this.sidebarService.toggleSidebar();
  } */

  // Test

  onLinkClick() {
    this.sidebarService.toggleSidebar();
  }

  onTestClick() {
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.userLinks.length; index++) {
      const element = this.userLinks[index];
      console.log(element.id, element.url, element.name);
    }
  }

}
