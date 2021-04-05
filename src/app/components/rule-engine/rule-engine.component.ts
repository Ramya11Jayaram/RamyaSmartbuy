import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-rule-engine',
  templateUrl: './rule-engine.component.html',
  styleUrls: ['./rule-engine.component.css']
})
export class RuleEngineComponent implements OnInit {
  filterForm;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.filterForm = this.formBuilder.group({
      name: ''
    });
  }

  ngOnInit() {
  }

  onHomeClick() {
    this.router.navigateByUrl('home');
  }

  onFilterClick() {
    alert('You just filtered with the value: ' + this.filterForm.value.name);
  }

}
