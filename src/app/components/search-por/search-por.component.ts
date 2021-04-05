import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderRequestOptionsService } from 'src/app/services/order-request-options/order-request-options.service';

@Component({
  selector: 'app-search-por',
  templateUrl: './search-por.component.html',
  styleUrls: ['./search-por.component.css']
})
export class SearchPorComponent implements OnInit {
  searchForm: FormGroup;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private optionsService: OrderRequestOptionsService) {
      this.searchForm = this.formBuilder.group({
        searchID: null
      });
    }

  ngOnInit() {
  }
  searchPOR() {
    const searchValue = this.searchForm.value.searchID;
    this.optionsService.getDocumentStatus(searchValue).subscribe((data) => {
      if (data.status.toLowerCase() === 'draft') {
        this.router.navigateByUrl('draft/' + searchValue);
      } else {
        this.router.navigateByUrl('ncrequestview/' + searchValue);
      }
    },
    (err) => {
      console.log('Error on search', err);
    }
    );
  }

}
