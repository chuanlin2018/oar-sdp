import { Component, Input } from '@angular/core';
import {LandingPanelComponent} from './landing.component'; 
import { TreeModule,TreeNode, Tree, MenuItem } from 'primeng/primeng';
@Component({
  selector: 'description-resources',
  template: `
          <div class="ui-g">
          <div class = "ui-g-12 ui-md-12 ui-lg-12 ui-sm-10" style="padding:2%">

          <h3 id="description" name="desscription">Description</h3><br>
            <div id="recordDescription" class="well" style="background-color:#006495; text-align: left; color: white">
                {{ record["description"] }}
            </div>     
            <strong>Research Topics:</strong> 
            <span  *ngFor="let topic of record['topic']; let i =index">
                {{ topic.tag }}
                <span *ngIf="i < record['topic'].length-1 ">,</span>
            </span>
            <br> 
            <b>Subject Keywords:</b>
            <span *ngFor="let keyword of record['keyword']; let i =index">
                {{ keyword }}<span *ngIf="i < record['keyword'].length-1 ">,</span>
            </span>
            <br>
            <div *ngIf="checkReferences()"> 
             <h3 id="reference" name="reference">References</h3>
               This data is discussed in :
                <span *ngFor="let refs of record['references']"> 
                  <span *ngIf="refs['refType'] == 'IsDocumentedBy'">
                    <br> <a href={{refs.location}} target="blank">{{ refs.label }}</a>
                  </span>   
                </span>
            </div>
             <b>Data Access:</b> {{ record['accessLevel'] }} 
                <span *ngIf="record['rights']">, The access rights are {{ record.rights }} </span>
             <br>
             <br>
            <div *ngIf="files.length != 0">              
                <h3 id="files" name="files">Files</h3>   
                <div class="ui-g">
                    <div class="ui-g-6 ui-md-6 ui-lg-6 ui-sm-10">
                        <p-tree [value]="files" selectionMode="single" [(selection)]="selectedFile" (onNodeSelect)="nodeSelect($event)">
                            <template let-node  pTemplate="default">
                                <span>{{node.label}}</span>
                            </template>
                        </p-tree>
                    </div>
                    <div class="ui-g-6 ui-md-6 ui-lg-6 ui-sm-10">
                        <div ng2-sticky>
                            <div *ngIf="isFileDetails">
                                <filedetails-resources [fileDetails]="fileDetails"></filedetails-resources>
                            </div>   
                        </div>
                    </div>
                </div>
            </div>
        </div>
     </div>
  `
})

export class DescriptionComponent {
 
 @Input() record: any[];
 @Input() files: any[];

 fileDetails:string="";
 isFileDetails: boolean = false;
 isReference: boolean = false;
 selectedFile: TreeNode;
 
 nodeSelect(event) {
      
        var test = this.getComponentDetails(this.record["components"],event.node.data);
        let i =0;
        
        this.fileDetails ="";
        for(let t of test){
            this.isFileDetails = true;
            this.fileDetails = t; 
        }
     
  }
getComponentDetails(data,filepath) {
  return data.filter(
      function(data){return data.filepath == filepath }
  );
}
keys() : Array<string> {
    return Object.keys(this.fileDetails);
  }
 
 checkReferences(){
      if(Array.isArray(this.record['references']) ){
          for(let ref of this.record['references'] ){
              if(ref.refType == "isDocumentedBy") return true;
          }
      }
 }

}
