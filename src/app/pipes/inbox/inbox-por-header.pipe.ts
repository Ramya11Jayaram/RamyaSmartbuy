import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inboxPorHeader'
})
export class InboxPorHeaderPipe implements PipeTransform {

  transform(value: {id: number, column: string, visible: boolean, position: number}[]): any {
    if (!value) {
      return null;
    }
    let returnVal = '';
    value.sort((a, b) => a.position - b.position);
    returnVal += '<th mat-sort-header="' + '#' + '"><div>' + '#' + '</div></th>';
    for (const val of value) {
      if (val.visible) {
        returnVal += '<th mat-sort-header="' + val.column + '"><div>' + val.column + '</div></th>';
      }
    }
    returnVal += '<th><div>Action</div></th>';
    return returnVal;
  }

}
