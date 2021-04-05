import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SidebarLink } from './sidebar-link';
import { EnvService } from '../environments/env.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarLinksService {
  private linksUrl: string;
  private linksUrl2: string;

  constructor(private http: HttpClient, private env: EnvService) {
    this.linksUrl = env.apiUrl.concat('/ui');
    this.linksUrl2 = env.apiUrl;
  }

/*   public findAll(): Observable<SidebarLink[]> { // dont use this method yet lol
    return this.http.get<SidebarLink[]>(this.linksUrl);
  }

  public save(tile: SidebarLink) { // dont use this method yet lol
    return this.http.post<SidebarLink>(this.linksUrl, tile);
  } */

  public getAll(isAdmin): Observable<any> {
    let lang = 'en';
    if (window.location.href.indexOf('/pt') !== -1) {
      lang = 'pt';
    } else if (window.location.href.indexOf('/es') !== -1) {
      lang = 'es';
    }
    return this.http.get(this.linksUrl.concat('/sidebar'), {params: {
      adminaccess: isAdmin,
      language: lang
    }});
    /* if you need to use JSON-Server, it's still /sidebarLinks */
  }
}
