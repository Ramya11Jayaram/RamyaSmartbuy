import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'approverHierarchy'
})
export class ApproverHierarchyPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: string, opts?: {date: string, approval: string, title?: string, dateFormat?: string}): string {
    const temp: Array<any> = value.split('/');
    let returnMe = '';
    for (const item of temp) {
      if (!returnMe) {
        returnMe += this.styleApprover(item, opts);
      } else {
        returnMe += '<br><h6 class="text-smartbuy">Substitutor</h6><hr>' /* Substitutor always goes first */
        + this.styleApprover(item, opts);
      }
    }
    return returnMe;
  }

  private styleApprover(value: string, opts?: {date: string, approval: string, title?: string, dateFormat?: string}): string {
    let addText = false; /* Denotes whether to show date and approval status */
    if (value.includes('@')) { // approved
      value = value.replace('@', '');
      value = '<span class="text-success">' + value + '</span>';
      addText = true;
    } else if (value.includes('#')) { // active
      value = value.replace('#', '');
      value = '<span class="text-gold">' + value + '</span>';
    } else if (value.includes('^')) { // rejected
      value = value.replace('^', '');
      value = '<span class="text-danger">' + value + '</span>';
      addText = true;
    } else { // pending
      value = '<span class="text-gold">' + value + '</span>';
    }
    if (addText && opts) {
      value += '<div>' + opts.approval + '</div>';
      if (opts.date) {
        value += '<span><span class="text-sm">' + this.datePipe.transform(opts.date, opts.dateFormat || '') + '</span></span>';
      }
    }
    return value;
  }

}
