import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TileService } from 'src/app/services/tile/tile.service';
import { Tile } from 'src/app/services/tile/tile';
import { AdusersService } from 'src/app/services/approval-users/adusers.service';
import { AdUser } from 'src/app/services/approval-users/ad-user';
import { OktaAuthService } from '@okta/okta-angular';
import { forkJoin } from 'rxjs';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  debug = false;
  userTiles: Array<Tile>;
  adUsers: Array<AdUser>;
  username: any;
  badges: any = {};

  constructor(
    private router: Router, private tileService: TileService,
    private userPrefService: UserPrefService, private adusersService: AdusersService, public oktaAuth: OktaAuthService
  ) { }

  async ngOnInit() {
    const userProfile = await this.userPrefService.getProfileFromCache();
    const profile = userProfile.hrUser || {};
    this.tileService.getAll(profile.adminAccess || null).subscribe(data => {
      data.sort((a, b) => (a.displayorder > b.displayorder) ? 1 : -1);
      this.userTiles = data;
      this.getUserID();
    });
  }

  getBadgeCount(userTiles, myId) {
    userTiles.forEach((item) => {
      if (item.badgeUrl) {
        const urlList = item.badgeUrl.split(';');
        urlList.forEach(async url => {
          await this.tileService.getBadgeCount(url, myId).subscribe((data) => {
            this.badges[item.id] = this.badges[item.id] || '';
            if (this.badges[item.id]) {
              this.badges[item.id] += '/';
            }
            this.badges[item.id] += data;
        });
        });
      }
    });
  }

  getUserID() {
    const userClaims = this.oktaAuth.getUser();
    const aduser = this.adusersService.getAll();

    forkJoin(userClaims, aduser).subscribe(data => {
      console.log(data);
      this.username = data[0].preferred_username;
      this.adUsers = data[1];
      //needed to remove after okta employeeid setup
      this.username='EAI23598';
      //
      let myId = 0;
      try {
        // tslint:disable-next-line: triple-equals
        myId = this.adUsers.find(obj => obj.employeeId == this.username).ID;

      } catch (e) {
        console.log('Unauthorized user. See error: ' + e);
        myId = 0; // this means there is no authorized user
      }
      if (localStorage.getItem('proxyUserID')) {
        myId = Number(localStorage.getItem('proxyUserID'));
      }
      this.getBadgeCount(this.userTiles, myId);
    });

  }

  onShopClick() {
    this.router.navigateByUrl('shop');
  }

  onInboxClick() {
    this.router.navigateByUrl('dash');
  }

  // TEST
  onTestClick() {
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.userTiles.length; index++) {
      const element = this.userTiles[index];
      console.log(element.id, element.header, element.subtitle, element.url, element.color);
    }
  }

  onAppClick(appUrl) {
    this.router.navigateByUrl(appUrl);
  }

  styleApp(appTile) {
    if (appTile.color) {
      return appTile.color;
    } else {
      return '#003399';
    }
  }

}
