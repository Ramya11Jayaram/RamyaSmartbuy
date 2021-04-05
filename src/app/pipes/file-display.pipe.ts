import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileDisplay'
})
export class FileDisplayPipe implements PipeTransform {

  transform(value: string): string {
    return value.split(/.*\/[0-9]*\//)[1];
  }

}
