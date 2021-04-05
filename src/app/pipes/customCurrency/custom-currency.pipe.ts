import { Pipe, PipeTransform } from '@angular/core';
import { getCurrencySymbol, CurrencyPipe } from '@angular/common';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';


@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe, private prefService: UserPrefService) {

  }

  transform(value: any, code?: string, numberFormat?: string, removeStr?: boolean): any {
    let retVal = '';
    code = code || 'USD';
    numberFormat = numberFormat || '1,234,567.89';
    if (removeStr) {
      value = value.replace(/[^0-9\.]/g, '');
    }
    if (numberFormat === '1.234.567,89') {
      retVal = this.currencyPipe.transform(value, '', '', '1.0-2', 'pt'); // using 'pt' as its one among the locale using dot seperator
    } else {
      retVal = this.currencyPipe.transform(value, '', '', '1.0-2', 'en');
    }
    let symbol = getCurrencySymbol(code, 'narrow', 'en');
    return retVal ? symbol + retVal : '';

  }

}
