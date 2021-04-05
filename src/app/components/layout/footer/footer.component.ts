import { Component, OnInit } from '@angular/core';
import { EnvService } from '../../../services/environments/env.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  version;

  constructor(private env: EnvService) {
    this.version = env.version;
   }

  ngOnInit() {

  }

}
