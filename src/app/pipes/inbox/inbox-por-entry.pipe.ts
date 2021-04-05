import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ErrorTranslationService } from 'src/app/services/error-translation/error-translation.service';
import { CustomNumberPipe } from '../customNumber/custom-number.pipe';

@Pipe({
  name: 'inboxPorEntry'
})
export class InboxPorEntryPipe implements PipeTransform {
  constructor(private datePipe: DatePipe, private err: ErrorTranslationService, private nPipe: CustomNumberPipe) {}

  transform(value: {id: number, column: string, visible: boolean, position: number}[],
            parent: any, item: any, dateFormat?: string, nPref?): any {
    dateFormat = dateFormat || 'MM/dd/yyyy';
    if (!value || !item) {
      return null;
    }
    let returnVal = '';
    value.sort((a, b) => a.position - b.position);
    // returnVal += '<td><div class="d-inline">' + (item && item.compositeId && item.compositeId.id || '') + '</div></td>';
    for (const val of value) {
      if (val.visible) {
        const tdElement = document.createElement('td');
        const divElement = document.createElement('div');
        divElement.className = 'form-row';
        divElement.innerHTML = this.stylizeReturnVal(val, item, dateFormat, nPref);
        tdElement.appendChild(divElement);
        parent.appendChild(tdElement);
        returnVal += '<td><div class="form-row">' + this.stylizeReturnVal(val, item, dateFormat, nPref) + '</div></td>';
      }
    }
    return returnVal;
  }

  stylizeReturnVal(value: {id: number, column: string, visible: boolean, position: number}, item: any, dateFormat: string, nPref?): string {
    switch (value.column) {
      case 'Company Code':
        return item && item.companyCode && item.companyCode.name || '';
      case 'Purchase Category':
        return item && item.purchaseCategorydto && item.purchaseCategorydto.Category || '';
      case 'POR Brief Description':
        return item && item.comments || '';
      case 'Creator': // item?.adInfoCreatedBy?.displayName
        return item && item.adInfoCreatedBy && item.adInfoCreatedBy.displayName || '';
      case 'Requester': // item?.adInfoRequester?.displayName
        return item && item.adInfoRequester && item.adInfoRequester.displayName || '';
      case 'Created On': // item?.createdon | date
        if (item.createdon) {
          return this.datePipe.transform(item.createdon, dateFormat);
        } else {
          return '';
        }
      case 'Vendor Name': // item?.vendordto?.vendorName
        return item && item.vendordto && item.vendordto.address && item.vendordto.address.split(',', 1)[0] || '';
      case 'Currency': // item?.orderCurencydto?.currency
        return item && item.orderCurrencydto && item.orderCurrencydto.currency || '';
      case 'Total Cost':
        return item && item.localCost ? '<div class="mr-0 ml-auto">' + this.numPref(item.localCost, nPref) + '</div>' : '';
      case 'Total Cost USD':
        return item && item.cost ? '<div class="mr-0 ml-auto">' + this.numPref(item.cost, nPref) + '</div>' : '';
      case 'Pending With': // item?.pendingWith?.displayName
        return item && item.pendingWith && item.pendingWith.displayName || '';
      case 'Pending Since': // item?.pendingSince | date
        return item.pendingSince ? this.datePipe.transform(item.pendingSince, dateFormat) : '';
      case 'Status':
        return item && item.approvelStatus ?
          this.err.returnMsg(this.returnRequistionStatus(Number(item.approvelStatus))) : '';
      default:
        return '';
    }
  }

  private numPref(num, format): any {
    return this.nPipe.transform(num, format);
  }

  private returnRequistionStatus(code: number): string {
    // Pending-1/Active-2/Approved-3/Rejected-4
    switch (code) {
      case 1:
        return 'Draft';
      case 2:
        return 'In Review';

      case 3:
        return 'Approval In Progress';
      case 4:
        return 'Pending Clarification';
      case 5:
        return 'Rejected';
      case 6:
        return 'Cancel';
      case 7:
        return 'Approved';
      case 8:
        return 'PO under review';
      case 9:
        return 'SAP PO In Error';
      case 10:
        return 'Processed';
      default:
        return 'Error';
    }
  }

}
