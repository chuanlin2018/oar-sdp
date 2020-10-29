import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { JsonldService } from '../shared/jsonld-service/jsonld.service';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  selector: 'sdp-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})

export class HomeComponent implements OnInit {
    currentRoute: string;

    searchPhrases = {
        'IT': '"Information Technology"',
        'MS': '"Mathematics and Statistics"',
        'Manufacturing': 'Manufacturing',
        'Forensics': 'Forensics',
        'Materials': 'Materials',
        'PN': '"Physics and Neutron"',
        'AC': '"Advanced Communications"',
        'Chemistry': 'Chemistry'
    }

  constructor(private router: Router, public jsonldService: JsonldService) {
  }

  ngOnInit() {
    this.jsonldService.removeStructuredData();
    this.jsonldService.insertSchema(this.jsonldService.websiteSchema(window.location.href, "NIST"));
  }

  /**
   * Set the search parameters and redirect to search page
   */
  search(searchValue: string) {
      console.log('searchValue', searchValue);
    let queryValue = "topic.tag=" + searchValue;

    let params: NavigationExtras = {
      queryParams: {
        'q': queryValue
      }
    };
    this.router.navigate(['/search'], params);
  }
}
