import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig, Config } from '../config-service/config-service.service';

@Injectable({
  providedIn: 'root'
})
export class SearchfieldsListService {
  confValues: Config;
  private RMMAPIURL: string;

  /**
   * Creates a new FieldsListService with the injected Http.
   * @param {HttpClient} http - The injected Http.
   * @constructor
   */
  constructor(private http: HttpClient,
    private appConfig: AppConfig) {
      this.confValues = this.appConfig.getConfig();
      this.RMMAPIURL = this.confValues.RMMAPI;
    }

  /**
   * Returns an Observable for the HTTP GET request for the JSON resource.
   * @return {string[]} The Observable for the HTTP request.
   */
  get(): Observable<any> {
   return this.http.get(this.RMMAPIURL + 'records/fields');
  }
  /**
    * Handle HTTP error
    */
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
