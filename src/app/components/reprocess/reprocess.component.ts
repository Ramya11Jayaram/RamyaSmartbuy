import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from 'src/app/_alert/alert.service';
import { ReprocessService } from 'src/app/services/reprocess/reprocess.service';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';

@Component({
  selector: 'app-reprocess',
  templateUrl: './reprocess.component.html',
  styleUrls: ['./reprocess.component.css']
})
export class ReprocessComponent implements OnInit {

  // Variables that store data from the DB:
  messageList: {id: number, prid: number, category: number, message: any, status: number,
                createdat: Date, changedat?: Date}[] = [];

  constructor(private spinner: NgxSpinnerService, private alertService: AlertService,
              private reprocessService: ReprocessService, private errTransService: ErrorTranslationService) { }

  async ngOnInit() {
    this.spinner.show();
    await this.reprocessService.getAll().toPromise().then(x => {
      this.messageList = x;
      for (const obj of this.messageList) { // turn 'message' string into object for display
        obj.message = JSON.parse(obj.message);
      }
    }).catch(err => {
      this.alertService.error(this.errTransService.returnMsg('errAPI'));
      console.log(err);
    });
    this.spinner.hide();
  }

  displayCategory(num: number): string {
    switch (num) {
      case 1:
        return 'Outbound';
      case 2:
        return 'Inbound';
      default:
        return 'Unknown Category: ' + num;
    }
  }

  displayStatus(num: number): string {
    switch(num) {
      case 1:
        return 'Processed';
      case 2:
        return 'Ready for Reprocess';
      default:
        return 'Unknown Status: ' + num;
    }
  }

  async onReprocessClick(id: number) {
    let success = false;
    await this.reprocessService.reprocess(id).toPromise().then(res => {
      console.log(res);
      success = true;
      this.alertService.success(this.errTransService.returnMsg('success'));
    }).catch(err => {
      this.alertService.error(this.errTransService.returnMsg('msgProcess'));
      console.log(err);
    });
    if (success) {
      await this.reprocessService.getOne(id).toPromise().then(response => {
        console.log(response);
        const res = response;
        res.message = JSON.parse(res.message); // turn the message string into an object for display
        const msg = this.messageList.find(obj => obj.id === id);
        this.messageList[this.messageList.indexOf(msg)] = res;
      }).catch(err => {
        console.log(err);
        this.alertService.error(this.errTransService.returnMsg('msgUpdt'));
      });
    }
  }

}
