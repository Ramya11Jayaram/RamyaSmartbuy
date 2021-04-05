import { Component, OnInit } from '@angular/core';

import { SidebarService } from '../../../services/sidebar/sidebar.service';

@Component({
  selector: 'app-sidebar-toggler',
  templateUrl: './sidebar-toggler.component.html',
  styleUrls: ['./sidebar-toggler.component.css']
})
export class SidebarTogglerComponent implements OnInit {

  constructor(public sidebarService: SidebarService) { }

  ngOnInit() {
  }

}
