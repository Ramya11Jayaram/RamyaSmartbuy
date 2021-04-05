import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, Subject, config } from 'rxjs';
import { catchError, map, tap, startWith } from 'rxjs/operators';
import { Podetails } from './model/po-detail';
import { EnvService } from 'src/app/services/environments/env.service';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

const CACHE_KEY = 'httpRepCache';
@Injectable({
    providedIn: 'root'
})
export class PODetailsService {
    private usersUrl: string;
    private usersUrl2: string;
    private apiUrl4: string;
    private apiUrl3: string;
    private podetails: Podetails;


    repos;
    constructor(private readonly http: HttpClient, private env: EnvService) {
        this.usersUrl = env.apiUrl;
        this.usersUrl2 = env.apiUrl.concat('/orderRequest');
        this.apiUrl3 = env.apiUrl.concat('/purchaseRequest');
        this.apiUrl4 = env.apiUrl.concat('/purchaseOrderUpdate');
    }


    public getRequistionDetials(userId: number): Observable<any> {
        return this.http.get(this.apiUrl3.concat('/requisitions')).pipe(catchError(this.handleError));

    }
/*
    getPOList(): Observable<Podetails[]> {
        // console.log("id is ==>"+id)
        return this.http.get<any[]>(this.usersUrl.concat('/podetails/')).pipe(
            // Adapt each item in the raw data array
            map(data => data.map(Podetails.adapt))

        );
    }
 */

    getRequestionById(id: number): Observable<Podetails[]> {
        console.log('id1 is ==>' + id);
        return this.http.get<any[]>(this.usersUrl2.concat('/podetails/')).pipe(
            // Adapt each item in the raw data array
            map(data => data.map(Podetails.adapt))

        );
    }

    getPORWaiting(approverId: number, startIndex?, pageSize?): Observable<any> {
      const vals = startIndex && pageSize ? '&startIndex=' + startIndex + '&pageSize=' + pageSize : '';
      return this.http.get(this.apiUrl3.concat('/getPORListWaiting?approverId=' + approverId+'&statusId=2' + vals)).pipe(catchError(this.handleError));
    }

    getPORSubWaiting(approverId: number, startIndex?, pageSize?): Observable<any> {
      const vals = startIndex && pageSize ? '&startIndex=' + startIndex + '&pageSize=' + pageSize : '';
      return this.http.get(this.apiUrl3.concat('/getPORSubWaiting?approverId=' + approverId + vals)).pipe(catchError(this.handleError));
    }

    getPORApprovedRejected(approverId: number, startIndex?, pageSize?): Observable<any> {
      const vals = startIndex && pageSize ? '&startIndex=' + startIndex + '&pageSize=' + pageSize : '';
      return this.http.get(this.apiUrl3.concat('/getPOR?approverId=' + approverId + vals)).pipe(catchError(this.handleError));
    }

    getNewPORID(id: number): Observable<any> {
      return this.http.get(this.apiUrl3.concat('/saveAsPR?pr=' + id)).pipe(catchError(this.handleError));
    }

    getRequestionById2(id: number): Observable<any> {
        console.log('id is ==>' + id);
       // return this.http.get<any>(this.usersUrl.concat('/podetails/' + id)).pipe(map((response: Response) => {
        return this.http.get<any>(this.apiUrl3.concat('/viewPOR?purchaseOrderId=' + id)).pipe(map((response: Response) => {
            // http://localhost:8080/api/purchaseRequest/viewPOR?purchaseOrderId=5
            return response;
        }),
            catchError(this.handleError));
    }
    getRequestionById2Test(id: number): Observable<any> {
      console.log('id is ==>' + id);
     // return this.http.get<any>(this.usersUrl.concat('/podetails/' + id)).pipe(map((response: Response) => {
      return this.http.get<any>(this.apiUrl3.concat('/viewPORUpdate?purchaseOrderId=' + id)).pipe(map((response: Response) => {
          // http://localhost:8080/api/purchaseRequest/viewPOR?purchaseOrderId=5
          return response;
      }),
          catchError(this.handleError));
  }
    public getuserRequistionDetials(userId: number, startIndex?, pageSize?): Observable<any> {
      const vals = startIndex && pageSize ? '&startIndex=' + startIndex + '&pageSize=' + pageSize : '';
       /* this.repos=this.http.get<any>(this.apiUrl3.concat('/requisitions'))
        .pipe(
            map(data => data)
        ).(next=>{
            localStorage[CACHE_KEY]=JSON.stringify(next);
        });
        this.repos=this.repos.pipe(
            startWith(JSON.parse(localStorage[CACHE_KEY] || '[]'))
        )
        return this.repos;*/
        return this.http.get<any>(this.apiUrl3.concat('/viewrequistion?requester=' + userId + vals)).pipe(catchError(this.handleError));
    }

    public getrequestionBycreatedBy(userId: number, startIndex?, pageSize?): Observable<any> {
      const vals = startIndex && pageSize ? '&startIndex=' + startIndex + '&pageSize=' + pageSize : '';
        console.log(this.apiUrl3.concat('/viewmyquistion?createdBy=' + userId + vals));
        return this.http.get<any>(this.apiUrl3.concat('/viewmyquistion?createdBy=' + userId + vals)).pipe(catchError(this.handleError));
    }

    public getPorAttachments(prid): Observable<any> {
      return this.http.get(this.apiUrl3.concat('/listAttachment?prid=' + prid)).pipe(catchError(this.handleError));
    }

    public getAttachmentLink(filename): Observable<string> {
      return this.http.get<string>(this.apiUrl3.concat('/getAttachment?filepath=' + filename)).pipe(catchError(this.handleError));
    }

    public putPOUpdate(num: number, data: any): Observable<any> {
      return this.http.put(this.apiUrl4.concat('/' + num), data, httpOptions).pipe(catchError(this.handleError));

     /*
      *  PO Update API Details
      *
      *  PUT  http://localhost:8080/api/purchaseOrderUpdate/4
      *  Request :
      *    {
      *      "newPoComments": "TestingSample",
      *      "newPoValue": 1450
      *      }
      */
    }

    /* getPosts(): Observable<any> {
         return this.http
             .get(this.usersUrl.concat('/podetails'))
             .pipe(map((response: Response) => {
                 return response.json();
             }),
                 catchError(this.handleError));
     }*/



    private handleError(error: any) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return observable with user-facing error message
        return throwError(error);
    }

    public editViewForm(data: any): Observable<any> {// updatePurchaseRequest
        console.log(this.apiUrl3.concat('/updatePurchaseRequest'));
        console.log(data);
        return this.http.post(this.apiUrl3.concat('/updatePurchaseRequest'), data, httpOptions).pipe(catchError(this.handleError));

      }
}
