import { Injectable } from '@angular/core';
import { UserPrefService } from '../user-pref/user-pref.service';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  userProfile;
  constructor( private prefService: UserPrefService) {
   }


  async getDateFormat() {
     let dateFormat = '';
     await this.prefService.getProfileFromCache();
     if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.userPreference) {
      dateFormat = this.prefService.cachedUserPrefEntity.userPreference.dateFormat;
    }
     switch (dateFormat) {
      case 'MM/DD/YYYY':
        return 'MM/dd/yyyy';
      case 'DD.MM.YYYY':
        return 'dd.MM.yyyy';
      case 'DD/MM/YYYY':
        return 'dd/MM/yyyy';
      case 'YYYY-MM-DD':
        return 'yyyy-MM-dd';
      case 'Month DD, YYYY':
        return 'MMM d, y';
      default: return 'MM/dd/yyyy';
    }
   }
   async getTimeFormat() {
    let timeFormat = '';
    await this.prefService.getProfileFromCache();
    if (this.prefService.cachedUserPrefEntity && this.prefService.cachedUserPrefEntity.userPreference) {
      timeFormat = this.prefService.cachedUserPrefEntity.userPreference.timeFormat;
   }
    switch (timeFormat) {
     case '12 Hour Format':
       return 'h:mm:ss a z';
     case '24 Hour Format':
       return 'HH:mm:ss z';
     default: return 'h:mm:ss a z';
   }
  }
}
