import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  hideSidebar = true;

  constructor() { }

  toggleSidebar() {
    this.hideSidebar = !this.hideSidebar;
  }
}
