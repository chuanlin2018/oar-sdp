import { Component, Inject, OnInit, Input, NgZone, ViewChild, ElementRef, Query } from '@angular/core';
import { SelectItem, DropdownModule } from 'primeng/primeng';
import { TaxonomyListService } from '../shared/taxonomy-list/index';
import { SearchfieldsListService } from '../shared/searchfields-list/index';
import { SearchService, SEARCH_SERVICE } from '../shared/search-service';
import { Router, NavigationExtras } from '@angular/router';
import * as _ from 'lodash';
import { AppConfig, Config } from '../shared/config-service/config-service.service';
import { timer } from 'rxjs/observable/timer';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AdvSearchComponent } from '../adv-search/adv-search.component';
import { SearchQueryService } from '../shared/search-query/search-query.service';
import { Observable } from 'rxjs';
import { SDPQuery, QueryRow } from '../shared/search-query/query';

@Component({
    selector: 'app-search-panel',
    templateUrl: './search-panel.component.html',
    styleUrls: ['./search-panel.component.scss'],
    animations: [
        trigger('changeDivSize', [
        state('initial', style({
            opacity: '0',
            overflow: 'hidden',
            height: '0px'
        })),
        state('final', style({
            opacity: '1',
            overflow: 'hidden',
            height: '*'
        })),
        transition('initial=>final', animate('1000ms ease-out')),
        transition('final=>initial', animate('500ms ease-out'))
        ])
    ]
})
export class SearchPanelComponent implements OnInit {
    @Input() title: string;
    @Input() subtitle: boolean;
    @Input() helpicon: boolean = false;
    @Input() advanceLink: boolean;
    @Input() jumbotronPadding: string = '1em';
    @Input() homePage: boolean = false;

    confValues: Config;
    errorMessage: string;
    _searchValue: string = '';
    suggestedTaxonomies: string[];
    suggestedTaxonomyList: string[];
    searchTaxonomyKey: string;
    queryAdvSearch: string = '';
    operators: SelectItem[];
    SDPAPI: any;
    imageURL: string;
    mobHeight: number;
    mobWidth: number;
    placeholder: string;
    display: boolean = false;
    textRotate: boolean = true;
    showExampleStatus: boolean = false;
    searchBottonWith: string = '10%';
    breadcrumb_top: string = '6em';
    placeHolderText: string[] = ['Kinetics database', 'Gallium', '"SRD 101"', 'XPDB', 'Interatomic Potentials'];
    inputStyle: any = {'width':'100%','padding-left':'40px','height': '40px','font-weight': '400',
                        'font-style': 'italic', 'border': '0px'};
    fields: SelectItem[];
    currentState = 'initial';
    showDropdown: boolean = true;
    currentFieldValue: string;  //To temporarily hold user selected field value
    inputValueMissing: boolean = false;
    examples = [
        {field: 'contactPoint.fn', example: 'Levine'},
        {field: 'doi', example: '10.18434/M3TH4R'},
        {field: 'ediid', example: '54AE54FB37AC022DE0531A570681D4291851'},
        {field: 'contactPoint.hasEmail', example: 'richard.ricker@nist.gov'},
        {field: '@type', example: 'Concept'},
        {field: 'components.filepath', example: 'Dataset_UrbanDustOpticalProperties.zip'},
        {field: 'landingPage', example: 'http://www.ctcms.nist.gov/oof/'}
    ]
    observableFields: Observable<SelectItem[]>;

    @ViewChild('field') fieldElement: ElementRef;
    @ViewChild('field2') queryName: ElementRef;

    // injected as ViewChilds so that this class can call its public functions
    @ViewChild(AdvSearchComponent)
    private advSearchComp: AdvSearchComponent;

    get searchValue() : string { return this._searchValue};
                        
    set searchValue(searchValue: string){
        this._searchValue = searchValue;
    } 

    /**
     * Create an instance of services for Home
     */
    constructor(@Inject(SEARCH_SERVICE) private searchService: SearchService,
        public taxonomyListService: TaxonomyListService, 
        public searchFieldsListService: SearchfieldsListService, 
        public searchQueryService: SearchQueryService,
        public ngZone: NgZone,
        private router: Router,
        private appConfig: AppConfig) {
        var ts = new Date();
        this.suggestedTaxonomies = [];
        this.confValues = this.appConfig.getConfig();

        this.mobHeight = (window.innerHeight);
        this.mobWidth = (window.innerWidth);
    }

    /**
     *
     */
    ngOnInit() {
        window.onresize = (e) => {
            this.ngZone.run(() => {
            this.mobWidth = window.innerWidth;
            this.mobHeight = window.innerHeight;
            this.onWindowResize();
            });
        };

        this.observableFields = this.searchFieldsListService.getSearchFields();

        this.searchService._watchQueryValue((queryObj) => {
            if (queryObj && queryObj.queryString && queryObj.queryString.trim() != '') {
                this.searchValue = queryObj.queryString;
                this.searchService.setQueryValue(null, null, null); // Reset
            }
        });
        
        this.searchQueryService._watchShowExamples((showExample) => {
                this.showExampleStatus = showExample;
                this.changeState(showExample); 
            }
        );

        // Init search box size and breadcrumb position
        this.onWindowResize();
        var i = 0;
        const source = timer(1000, 2000);
        source.subscribe(val => {
        if (i < this.placeHolderText.length) {
            i++;
            this.placeholder = this.placeHolderText[i];
        } else {
            this.placeholder = this.placeHolderText[0];
            i = 0;
        }
        });

        this.SDPAPI = this.confValues.SDPAPI;
        this.imageURL = this.confValues.SDPAPI + 'assets/images/sdp-background.jpg';
        this.getTaxonomySuggestions();
        this.searchOperators();
    }

    /**
     * Show/hide syntax rules
     */
    changeState(status: boolean) {
        console.log("status", status);
        this.showExampleStatus = status;
        if(this.showExampleStatus)
            this.currentState = 'final';
        else
            this.currentState = 'initial';
    }

    /**
     * Hide syntax rules and field lookup help
     */
    hideAllHelp() {
        this.showExampleStatus = false;
        this.currentState = 'initial';
    }

    /**
     * When window resized, we need to resize the search text box and reposition breadcrumb accordingly
     * When top menu bar collapse, we want to place breadcrumb inside the top menu bar
     */
    onWindowResize(){
        if(this.mobWidth > 461){
        this.searchBottonWith = "10%";
        }else{
        this.searchBottonWith = "100%";
        }

        if(this.mobWidth > 750){
        this.breadcrumb_top = '6em';
        }else{
        this.breadcrumb_top = '3.5em';
        }
    }

    /**
     *  Clear the search text box
     */
    clearText() {
        var field = (<HTMLInputElement>document.getElementById('searchinput'));
        if (!Boolean(this._searchValue.trim())) {
        field.value = ' ';
        }
    }

    addPlaceholder() {
        var field = (<HTMLInputElement>document.getElementById('searchinput'));
        if (!Boolean(this._searchValue)) {
        field.value = '';
        }
    }

    getTaxonomySuggestions() {
        this.taxonomyListService.get()
        .subscribe(
            taxonomies => this.suggestedTaxonomies = this.toTaxonomySuggestedItems(taxonomies),
            error => this.errorMessage = <any>error
        );
    }

    /**
     * Generate suggested taxonomy items list from a given taxonomy list. It's basically the list 
     * of the labels of the given taxonomy list.
     * @param taxonomies taxonomy list
     */
    toTaxonomySuggestedItems(taxonomies: any[]) {
        let items: string[] = [];
        for (let taxonomy of taxonomies) {
            items.push(taxonomy.label);
        }
        return items;
    }

    /**
     * Generate a specific taxonomy items list from a given taxonomy list.
     * @param taxonomies 
     */
    toTaxonomiesItems(taxonomies: any[]) {
        let items: SelectItem[] = [];
        items.push({ label: 'ALL RESEARCH', value: '' });
        for (let taxonomy of taxonomies) {
        items.push({ label: taxonomy.label, value: taxonomy.label });
        }
        return items;
    }


    /**
     * Filter keywords for suggestive search
     */
    filterTaxonomies(event: any) {
        let suggTaxonomy = event.query;
        this.suggestedTaxonomyList = [];
        for (let i = 0; i < this.suggestedTaxonomies.length; i++) {
            let keyw = this.suggestedTaxonomies[i];
            if (keyw.toLowerCase().indexOf(suggTaxonomy.trim().toLowerCase()) >= 0) {
                this.suggestedTaxonomyList.push(keyw);
            }
        }
    }

    /**
     * Define Search operators for the drop down
     */
    searchOperators() {
        this.operators = [];
        this.operators.push({ label: 'AND', value: 'AND' });
        this.operators.push({ label: 'OR', value: 'OR' });
    }

    /**
     * Set the search parameters and redirect to search page
     */
    search(searchValue: string, searchTaxonomyKey: string) {
        this.searchTaxonomyKey = searchTaxonomyKey;

        this.searchService.search(searchValue);
    }

    /**
     *  Pass Search example popup value to home screen
     */
    searchExample(popupValue: string) {
        this.display = false;
        this._searchValue = popupValue;
        this.textRotate = !this.textRotate;
    }

    /**
     * Apeend text to the search box
     * @param field - text to be appended
     * @param op - operator (usually "=")
     * @param overlaypanel - the overlaypanel that is calling. It will be closed after this operation.
     */
    addKeyValuePairToSearchBox(event: any, field: string, overlay1: OverlayPanel, overlay2: OverlayPanel){
        this.currentFieldValue = field;

        overlay2.show(event);
    }

    processInputValue(inputValue: string, overlaypanel: OverlayPanel){
        let lQueryConstrain: string;
        let lInputValue = inputValue;

        //If input value is empty, display message. Otherwise append the whole constrain to the search box
        if(lInputValue  == null || lInputValue  == undefined || lInputValue .trim() == ""){
            this.inputValueMissing = true;
        }else{
            this.inputValueMissing = false;

            // Strip quotes
            lInputValue  = lInputValue .replace(new RegExp('"', 'g'), '');

            if(lInputValue .indexOf(" ") > 0){
                lInputValue  = '"' + lInputValue  + '"';
            }

            if(this.currentFieldValue == "searchphrase"){
                lQueryConstrain = lInputValue;
            }else{
                lQueryConstrain = this.currentFieldValue + "=" + lInputValue;
            }

            if(this.searchValue.substr(this.searchValue.length - 1) == " ")
                this.searchValue += lQueryConstrain;
            else{
                if(this.searchValue.substr(this.searchValue.length - 1) == "="){
                    this.searchValue += lQueryConstrain; 
                    ;
                }else{
                    this.searchValue += " " + lQueryConstrain;
                }
            }

            if(overlaypanel) overlaypanel.hide();
        }
    }

    /**
     * Apeend text to the search box
     * @param field - text to be appended
     * @param op - operator (usually "=")
     * @param overlaypanel - the overlaypanel that is calling. It will be closed after this operation.
     */
    appendToSearchBox(field: string, op?: string, overlaypanel?: OverlayPanel){
        // Strip quotes
        field = field.replace(new RegExp('"', 'g'), '');

        if(field.indexOf(" ") > 0){
            field = '"' + field + '"';
        }
        if(this.searchValue.substr(this.searchValue.length - 1) == " ")
            this.searchValue += field;
        else{
            if(this.searchValue.substr(this.searchValue.length - 1) == "="){
                this.searchValue += field;
            }else{
                this.searchValue += " " + field;
            }
            
        }

        if(op) this.searchValue = this.searchValue.trim() + op;

        if(overlaypanel) overlaypanel.hide();
        field = "";
    }

    /*
     * Popup dialog
     */
    showPopupDialog( event, overlaypanel: OverlayPanel ) {
        overlaypanel.toggle(event);

        setTimeout(()=>{ 
            this.fieldElement.nativeElement.focus();
        },0);  
    }

    /**
     * This is for the case when user right click on the search text box. An overlay panel with field value
     * will popup. This function returns overlay panel style based on the screen size.
     */
    overlayStyle(){
        if(this.mobWidth > 461){
            return {'position':'related','left':'50%','max-width':'800px'};
        }
        else{
            return {'position':'related','left':'50%','max-width':'400px'};
        }
    }

    /**
     * Return search button class based on screen width
     */
    getSearchBtnClass(){
        if(this.mobWidth > 461){
            return "bigSearchButton";
        }else{
            return "full-width";
        }
    }

    /**
     * Popup dialog to show query name entry
     */
    showQueryNameDialog( event, overlaypanel: OverlayPanel ) {
        overlaypanel.toggle(event);

        setTimeout(()=>{ 
            this.queryName.nativeElement.focus();
        },0);  
    }

    /**
     * Save the query string in the search box into query array
     * This will remote execute the save query function in adv-search component
     */
    saveAdvQuery(queryName: string, overlaypanel: OverlayPanel){
        if(queryName)
            this.searchQueryService.saveAdvQueryFromString(this.searchValue, queryName);
        else
            alert("Query name is required.");

        overlaypanel.hide();
    }

    /**
     * Return examples based on currentFieldValue
     */
    getExample(){
        let example = this.examples.filter(ex=>ex.field == this.currentFieldValue);
        if(example.length > 0) return example[0].example;
        else return "physics";
    }
}
