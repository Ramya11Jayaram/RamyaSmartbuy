import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rule-change-request',
  templateUrl: './rule-change-request.component.html',
  styleUrls: ['./rule-change-request.component.css']
})
export class RuleChangeRequestComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onHomeClick() {
    this.router.navigateByUrl('home');
  }

}
