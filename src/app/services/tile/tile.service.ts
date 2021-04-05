import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Tile } from './tile';
import { Observable } from 'rxjs';
import { EnvService } from '../environments/env.service';

@Injectable({
  providedIn: 'root'
})
export class TileService {
  private tileUrl: string;
  private tileUrl2: string;
  private tileBadgeUrl: string;

  constructor(private http: HttpClient, private env: EnvService) {
    this.tileUrl = env.apiUrl.concat('/ui');
    this.tileUrl2 = env.apiUrl;
    this.tileBadgeUrl = env.apiUrl;
  }
/*
  public findAll(): Observable<Tile[]> { // dont use this method yet lol
    return this.http.get<Tile[]>(this.tileUrl);
  }

  public save(tile: Tile) { // dont use this method yet lol
    return this.http.post<Tile>(this.tileUrl, tile);
  } */

  public getAll(isAdmin): Observable<any> {
    let lang = 'en';
    if (window.location.href.indexOf('/pt') !== -1) {
      lang = 'pt';
    } else if (window.location.href.indexOf('/es') !== -1) {
      lang = 'es';
    }
    return this.http.get(this.tileUrl.concat('/tile'), {params: {
      adminaccess: isAdmin,
      language: lang
    }});

    /* if you need to use JSON-Server, the route is still /tileDetails */
  }

  public getBadgeCount(badgeApiUrl: string, id: any): Observable<any> {
    return this.http.get(this.tileBadgeUrl.concat('/' + badgeApiUrl + id));
  }

}
