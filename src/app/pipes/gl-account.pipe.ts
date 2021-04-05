import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'glAccount'
})
export class GlAccountPipe implements PipeTransform {

  transform(value: string): string {
    if (value.startsWith('000')) {
      value = value.substr(3);
    }
    return value;
  }

}
