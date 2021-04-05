import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UserPrefService } from 'src/app/services/user-pref/user-pref.service';


@Pipe({
  name: 'customNumber'
})
export class CustomNumberPipe implements PipeTransform {
  constructor(private decimalPipe: DecimalPipe, private prefService: UserPrefService) {

  }

  transform(value: any, numberFormat?: string, locale?: string, clearFormat?: boolean): any {
    let retVal = '';
    value = value ? value.toString() : '';
    numberFormat = numberFormat || '1,234,567.89';
    if (!value || value === '-') {
      return null;
    }
    if (clearFormat) { // removing seperators
      if (numberFormat === '1.234.567,89') {
        retVal = value.replace(/\./g, '');
        retVal = retVal.replace(/,/g, '.');
      } else {
        retVal = value.replace(/,/g, '');
      }
      const decimalPart = retVal.split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        const value1 = retVal;
        // this is to prevent more than 2 decimal place
        const value2 = (Math.floor(+retVal * 1000 / 10) / 100) + '';
        if (value1 === value2) {
        return value2;
        }
        // returning new instance to force model change , so view value gets updated
        return new String(value2);
      }
      return retVal || '';
    }
    try {
      if (locale) {
        retVal = this.decimalPipe.transform(value, '1.0-2', locale);
      } else  {
        if (numberFormat === '1.234.567,89') {
          // value = value.replace(/\./g, '');
          value = value.replace(/,/g, '.');
          value = (value === '.') ? '0.' : value;
          retVal = this.decimalPipe.transform(value, '1.0-2', 'pt'); // using 'pt' as its one among the locale using dot seperator
        } else {
          value = value.replace(/,/g, '');
          value = (value === '.') ? '0.' : value;
          retVal = this.decimalPipe.transform(value, '1.0-2', 'en');
        }
        const decimalPart = value.split('.')[1];
        if (value.includes('.') && decimalPart.length === 0) {
          // to allow entering decimal point at the end
          retVal = (numberFormat === '1.234.567,89') ? (retVal + ',') : (retVal + '.');
        } else if (value.includes('.') && decimalPart === '0') {
          // to allow <number>.0 , without this 115.0 is returned as 115 by 'decimalPipe' and user is not able to enter values like 115.01
          retVal = (numberFormat === '1.234.567,89') ? (retVal + ',0') : (retVal + '.0');
        }
      }
    } catch (e) {
      retVal = null;
    }
    // returning new instance to force model change , so view value gets updated
    return retVal ? new String(retVal) : '';
  }

}

