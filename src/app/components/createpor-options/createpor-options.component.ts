import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PODetailsService } from 'src/app/services/approval-details/podetails.service';

@Component({
  selector: 'app-createpor-options',
  templateUrl: './createpor-options.component.html',
  styleUrls: ['./createpor-options.component.css']
})
export class CreateporOptionsComponent implements OnInit {
  porOption: any;
  porForm: FormGroup;
  invalidID = false;
  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private pODetailsService: PODetailsService) {
    this.porForm = this.formBuilder.group({
      createPOR: null,
      refPOR: null
    });
  }
  ngOnInit() {
  }

  onHomeClick() {
    this.router.navigateByUrl('home');
  }

  copyPOR() {
    this.pODetailsService.getNewPORID(this.porForm.value.refPOR).subscribe((data) => {
      console.log('new por id ----', data);
      if (data <= 0) {
        this.invalidID = true;
        // alert('Please check the entered purchase order ID !');
      } else {
        this.router.navigateByUrl('draft/' + data);
      }

    },
    (err) => {
      console.log(err);
    }
    );
  }

  onSelect() {
    // tslint:disable-next-line: triple-equals
    if (this.porForm.value.createPOR == 1) {
      this.router.navigateByUrl('ncrequestnew');
    }

  }

}
