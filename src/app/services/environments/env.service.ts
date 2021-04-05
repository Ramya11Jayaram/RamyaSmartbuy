import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // API url - defaulted with  URL as a fallback
  public apiUrl = 'https://smartbuy.ameri100.com/api';
  public apiUrlPref = 'https://smartbuy.ameri100.com/userservice';

  public version = 'version';

  // Whether or not to enable debug mode
  public enableDebug = true;

  constructor() {}
}
