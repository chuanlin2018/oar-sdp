import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import environment from '../../../assets/environment.json';

import * as process from 'process';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { config } from 'rxjs';
import { Location } from '@angular/common';
export interface Config {
  RMMAPI: string;
  DISTAPI: string;
  LANDING: string
  SDPAPI: string;
  PDRAPI: string;
  METAPI: string;
  GACODE: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfig {
  private appConfig;
  private confCall;
  private envVariables = "assets/environment.json";
  private confValues = {} as Config;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID)
  private platformId: Object, location: Location) { }

  loadAppConfig() {
    if (isPlatformBrowser(this.platformId)) {

      // set this.envVariables to be the full URL for retrieving
      // configuration.  Normal rules of relative URLs are applied.    
      let baseurl = null;
      if (this.envVariables.startsWith("/")) {
          baseurl = location.origin;
      }
      else {
          baseurl = location.href.replace(/#.*$/, "");
          if (! this.envVariables.endsWith("/"))
              baseurl = baseurl.replace(/\/[^\/]+$/, "/");
      }
      this.envVariables = baseurl + this.envVariables;
      console.log("Retrieving configuration from "+this.envVariables);
        
      this.confCall = this.http.get(this.envVariables)
        .toPromise()
        .then(
          resp => {
            resp as Config;
            this.confValues.RMMAPI = resp['RMMAPI'];
            this.confValues.DISTAPI = resp['DISTAPI'];
            this.confValues.LANDING = resp['LANDING'];
            this.confValues.METAPI = resp['METAPI'];
            this.confValues.SDPAPI = resp['SDPAPI'];
            this.confValues.PDRAPI = resp['PDRAPI'];
            this.confValues.GACODE = resp['GACODE'];
            console.log("In Browser read environment variables: " + JSON.stringify(this.confValues));
          },
          err => {
            console.log("ERROR IN CONFIG :" + JSON.stringify(err));
          }
        );
      return this.confCall;
    } else {

      this.appConfig = <any>environment;
      this.confValues.RMMAPI = process.env.RMMAPI || this.appConfig.RMMAPI;
      this.confValues.DISTAPI = process.env.DISTAPI || this.appConfig.DISTAPI;
      this.confValues.LANDING = process.env.LANDING || this.appConfig.LANDING;
      this.confValues.METAPI = process.env.METAPI || this.appConfig.METAPI;
      this.confValues.SDPAPI = process.env.SDPAPI || this.appConfig.SDPAPI;
      this.confValues.PDRAPI = process.env.PDRAPI || this.appConfig.PDRAPI;
      this.confValues.GACODE = process.env.GACODE || this.appConfig.GACODE;
      console.log(" ****** In server: " + JSON.stringify(this.confValues));
    }
  }

  getConfig() {
    // console.log(" ****** In Browser 3: "+ JSON.stringify(this.confValues));
    return this.confValues;
  }

  loadConfigForTest(){
    this.confValues = {
      "RMMAPI":  "http://data.nist.gov/rmm/",
      "SDPAPI":  "http://localhost:5555/",
      "PDRAPI":  "http://localhost/od/id/",
      "DISTAPI": "http://data.nist.gov/od/ds/",
      "METAPI":  "http://localhost/metaurl/",
      "LANDING": "http://data.nist.gov/rmm/",
      "GACODE": "UA-115121490-8"
  };
  }
}
