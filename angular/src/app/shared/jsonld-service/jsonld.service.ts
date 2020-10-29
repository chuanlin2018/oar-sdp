import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class JsonldService {

    constructor(@Inject(DOCUMENT) private _document: Document) {}

    static scriptType = 'application/ld+json';

    /**
     * Return schema of the given url and name
     * @param url full url for current page 
     * @param name name of current page
     */
    public websiteSchema(url?: string, name?: string){
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: url || "https://data.nist.gov",
            name         : name || 'NIST',
            "sameAs": ["https://facebook.com/USNISTGOV",
                    "https://instagram.com/usnistgov",
                    "https://twitter.com/nist"]
            }
    }

    /**
     * Return schema for the organization
     */
    public orgSchema(){
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "NIST Science Data Portal",
            "description": "This National Institute of Standards and Technology (NIST) Science Data Portal provides a user-friendly discovery and exploration tool for publicly available datasets at NIST. These data products are generated as part of the NIST mission, spanning multiple disciplines of scientific, engineering and technology research. NIST's publicly available data sets showcase its commitment to providing accurate, well-curated measurements of physical properties, exemplified by the Standard Reference Data program, as well as its commitment to advancing basic research.",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Gaithersburg, MD",
                "postalCode": "20899",
                "streetAddress": "100 Bureau Drive"
            },
            "email": "datasupport@nist.gov",
            "member": [
                {
                "@type": "Organization"
                },
                {
                "@type": "Organization"
                }
            ],
            "telephone": "NA"
        }
    }

    /**
     * Retur schema of the search page
     * @param url full url for the search page 
     * @param name name of the search page
     * @param query the search query passed to the search page
     */
    public searchSchema(url: string = "https://data.nist.gov", name?: string, targetURL?: string){
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: url,
            name         : name || 'NIST',
            "potentialAction": {
              "@type": "SearchAction",
              "target": targetURL
            }
        }
    }

    /**
     * Remove Json-LD object from DOM
     */
    removeStructuredData(): void {
        const els = [];
        [ 'structured-data', 'structured-data-org', 'structured-data-search' ].forEach(c => {
            els.push(...Array.from(this._document.head.getElementsByClassName(c)));
        });
        els.forEach(el => this._document.head.removeChild(el));
    }

    /**
     * Insert Json-LD object into DOM
     */
    insertSchema(schema: Record<string, any>, className = 'structured-data'): void {
        let script;
        let shouldAppend = false;
        console.log('schema', schema);
        if (this._document.head.getElementsByClassName(className).length) {
            script = this._document.head.getElementsByClassName(className)[0];
        } else {
            script = this._document.createElement('script');
            shouldAppend = true;
        }
        script.setAttribute('class', className);
        script.type = JsonldService.scriptType;
        script.text = JSON.stringify(schema);
        if (shouldAppend) {
            this._document.head.appendChild(script);
        }
    }
}
