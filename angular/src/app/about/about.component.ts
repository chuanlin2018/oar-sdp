import { Component, OnInit } from '@angular/core';
import { GoogleAnalyticsService } from '../shared/ga-service/google-analytics.service';
import { CommonService } from '../shared/common/common.service';
import { AppConfig, Config } from '../shared/config-service/config-service.service';
import { JsonldService } from '../shared/jsonld-service/jsonld.service';

@Component({
  selector: 'sdp-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  imageURL: string;
  confValues: Config;

  constructor(
    public gaService: GoogleAnalyticsService, 
    private appConfig: AppConfig,
    public commonService: CommonService,
    public jsonldService: JsonldService) 
  { 
    this.confValues = this.appConfig.getConfig();
  }

  ngOnInit() {
    this.imageURL = this.confValues.SDPAPI + 'assets/images/sdp-background.jpg';
    this.jsonldService.removeStructuredData();
    this.jsonldService.insertSchema(this.jsonldService.orgSchema(), 'structured-data-org');
  }

}
