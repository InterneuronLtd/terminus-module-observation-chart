//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
/* Interneuron Observation App
Copyright(C) 2023  Interneuron Holdings Ltd
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.If not, see<http://www.gnu.org/licenses/>. */

import { Component, ViewChild, ElementRef, OnDestroy, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { SubjectsService } from './services/subjects.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppService } from './services/app.service';
import { Subscription, Subject } from 'rxjs';
import { ApirequestService } from './services/apirequest.service';
import { filters, filterParams, filterparam, filter, selectstatement, orderbystatement, action } from './models/Filter.model';
import * as moment from 'moment';
import { ComponentModuleData } from './directives/module-loader.directive';
import { RTNoificationUtilService, RTNotificationsHandlerParams, subscribeToReceivedNotification } from './notification/lib/notification.observable.util';
import { ToastrService } from 'ngx-toastr';
import { SessionStorageService } from 'angular-web-storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {



  hasEncounters = false;
  showNoEncounterMsg = false;
  showSepsisModule = false;
  componentModuleData: ComponentModuleData;
  height: any;
  weight:any;
  encountersListLoaded(value: boolean) {
    this.hasEncounters = value;
    this.showNoEncounterMsg = !value;
    this.subjects.initialzeFormMetaData.next();
  }
  confirmModalRef: BsModalRef;

  title = 'terminus-module-observation-chart';
  modalRef: BsModalRef;
  alerts: any[] = [];
  observationsFormHeader = "Add Observations";
  @ViewChild('closObsForm') closeObsFormButton: ElementRef;
  @ViewChild('openObsForm') openObsFormButton: ElementRef;

  subscriptions: Subscription = new Subscription();
  tempY = 0;
  obsLoaded = false;
  isCurrentEncounter = false;
  obsDueTime: number;
  obsDueMessage: string;
  isActive = true;
  blurObsModal = false;
  @Input() set personid(value: string) {
    this.appService.personId = value;
   
  }
  @Input() set apiservice(value: any) {

    if (!this.appService.baseURI) {
      this.initConfig(value);
    }
    else {
      this.appService.logToConsole("Service reference is being set");
      this.appService.apiService = value;
      this.appService.logToConsole("Service reference is being published");
      this.subjects.apiServiceReferenceChange.next();
      this.appService.logToConsole("personid is being published");
      this.subjects.personIdChange.next();
    }
  }
  @Input() set unload(value: Subject<any>) {
    this.subjects.unload = value;
  }
  @Output() frameworkAction = new EventEmitter<string>();

  constructor(private subjects: SubjectsService, private modalService: BsModalService, public appService: AppService, private apiRequest: ApirequestService, private toastrService: ToastrService, private sessionStorageService: SessionStorageService) {

    
    this.subscriptions.add(this.subjects.openObsForm.subscribe((formHeader: string) => {
      this.observationsFormHeader = formHeader;
      this.openObsFormButton.nativeElement.click();
    }));

    this.subscriptions.add(this.subjects.showMessage.subscribe((status: any) => {
      this.showMessage(status);
    }));
    this.subscriptions.add(this.subjects.closeObsForm.subscribe((status: any) => {
      this.closeOBsModal();
      this.showMessage(status);
    }));

    this.subscriptions.add(this.subjects.encounterChange.subscribe(() => {
      this.isCurrentEncounter = this.appService.isCurrentEncouner;

      if (!this.appService.nextObsDueTime)
        this.getLatestMonitoring();

    }));

    this.subscriptions.add(
      this.subjects.loadAssessmentModule.subscribe((observationeventid: string) => {
        this.loadAssessmentModuleDetail(observationeventid);
      }));
    this.subscriptions.add(this.subjects.frameworkEvent.subscribe((eventType: string) => {
      this.obsUpdateFrameworkEvents(eventType);
    }));

    this.subscribeForRTNotifications();
  }

  subscribeForRTNotifications() {
    const notificationTypes = [
      //{ name: 'OBSERVATION_ADDED', msgPropNameOrMsg: 'obs_added_notification_msg',  currentModuleName: 'app-element' }
      { name: 'OBSERVATION_ADDED', msgPropNameOrMsg: 'obs_added_notification_msg' }
    ];
    const paramData: RTNotificationsHandlerParams = {
      getAppSettings: () => {
        console.log('calling alert for appsettings session in observation',
          this.sessionStorageService.get('observation:appSettings'));
        return this.sessionStorageService.get('observation:appsettings');
      },
      notificationTypes
    };

    subscribeToReceivedNotification('OBS_NOTIFICATION_APP_COMP', (res) => new RTNoificationUtilService().rtNotificationsHandler(paramData, res));
  }

  isDue() {

    if (this.appService.nextObsDueTime)
      if (moment(new Date(this.appService.nextObsDueTime).toISOString()).isBefore()) {
        return true;
      }
      else {
        return false;
      }
  }

  openConfirmModal(template: TemplateRef<any>) {
    this.confirmModalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-sm modal-dialog-centered'
    });
    this.blurObsModal = true;
  }

  confirm(): void {
    this.blurObsModal = false;
    this.confirmModalRef.hide();
    this.closeOBsModal();
  }

  decline(): void {
    this.blurObsModal = false;
    this.confirmModalRef.hide();

  }

  getLatestMonitoring() {
    //get the monitoring data for latest event
    this.subscriptions.add(this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=core&synapseentityname=observationevent&synapseattributename=encounter_id&attributevalue=${this.appService.encouter.encounter_id}&orderby=_sequenceid DESC&limit=1`)
      .subscribe((response) => {
        if (response) {
          let responseEvent = JSON.parse(response);
          if (responseEvent && responseEvent.length > 0) {
            this.subscriptions.add(this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=core&synapseentityname=observationeventmonitoring&synapseattributename=observationevent_id&attributevalue=${responseEvent[0].observationevent_id}&orderby=_sequenceid DESC&limit=1`)
              .subscribe((monitoring) => {
                let monitoringEvent = JSON.parse(monitoring);
                if (monitoringEvent && monitoringEvent.length > 0 && this.appService.encouter.encounter_id == responseEvent[0].encounter_id && (<number>monitoringEvent[0].observationfrequency) != 168) {

                  this.appService.nextObsDueTime = new Date(moment(responseEvent[0].datefinished, moment.ISO_8601).add(Math.ceil(<number>monitoringEvent[0].observationfrequency * 60), "minutes").toISOString()).toString();
                }
              }));
          }
        }
      }));
  }

  initConfig(value: any) {

    this.appService.apiService = value;
    let decodedToken: any;
    if (this.appService.apiService) {
      decodedToken = this.appService.decodeAccessToken(this.appService.apiService.authService.user.access_token);
      if (decodedToken != null)
        this.appService.loggedInUserName = decodedToken.name ? (Array.isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;

    }
    this.subscriptions.add(this.apiRequest.getRequest("./assets/config/ObsChartConfig.json?V" + Math.random()).subscribe(
      (response) => {
        this.appService.appConfig = response;
        this.appService.baseURI = this.appService.appConfig.uris.baseuri;
        this.appService.autonomicsBaseURI = this.appService.appConfig.uris.autonomicsbaseuri;
        this.appService.enableLogging = this.appService.appConfig.enablelogging;
        
        //Adding AppSettings to the session
        const appConfigFromParam = this.appService?.appConfig;
        const appSettingsFromParam = {...appConfigFromParam?.appsettings};
        this.sessionStorageService.set('observation:appsettings', appSettingsFromParam);
        this.getHeightWeight();
        //get actions for rbac
        this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/rbac_actions`, this.createRoleFilter(decodedToken))
          .subscribe((response: action[]) => {
            this.appService.roleActions = response;
            this.appService.logToConsole(response);

            //getPersonDateOfBirth
            this.subscriptions.add(this.apiRequest.getRequest(`${this.appService.baseURI}/GetObject?synapsenamespace=core&synapseentityname=person&id=${this.appService.personId}`).subscribe(
              (person) => {
                person = JSON.parse(person);
                if (person && person.dateofbirth) {
                  this.appService.personDOB = <Date>person.dateofbirth;
                }

                //emit events after getting initial config. //this happens on first load only. 
                this.appService.logToConsole("Service reference is being published from init config");
                this.subjects.apiServiceReferenceChange.next();
                this.appService.logToConsole("personid is being published from init config");
                this.subjects.personIdChange.next();

              }));

          }));

        //get sepsis assessments module url
        this.subscriptions.add(this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=meta&synapseentityname=module&synapseattributename=modulename&attributevalue=SepsisAssessment`)
          .subscribe((assessmentModulesFromDb) => {
            let cloned: any = [];
            if (typeof assessmentModulesFromDb === 'string') {
              cloned = JSON.parse(assessmentModulesFromDb);
            }
            else {
              cloned = assessmentModulesFromDb;
            }
            this.appService.sepsisAssessmentURI = cloned[0].jsurl;
            this.appService.sepsisAssessmentElementTag = cloned[0].domselector;
          }));
      }));
  }


  createRoleFilter(decodedToken: any) {

    let condition = "";
    let pm = new filterParams();
    let synapseroles;
    if (this.appService.appConfig.prodbuild)
      synapseroles = decodedToken.SynapseRoles
    else
      synapseroles = decodedToken.client_SynapseRoles
    if (!Array.isArray(synapseroles)) {
      condition = "rolename = @rolename";
      pm.filterparams.push(new filterparam("rolename", synapseroles));
    }
    else
      for (var i = 0; i < synapseroles.length; i++) {
        condition += "or rolename = @rolename" + i + " ";
        pm.filterparams.push(new filterparam("rolename" + i, synapseroles[i]));
      }
    condition = condition.replace(/^\or+|\or+$/g, '');
    let f = new filters();
    f.filters.push(new filter(condition));


    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    this.appService.logToConsole(JSON.stringify(body));
    return JSON.stringify(body);
  }

  ngOnDestroy() {
    this.appService.logToConsole("app component being unloaded");
    this.appService.encouter = null;
    this.appService.personId = null;
    this.appService.personscale = null;
    this.appService.isCurrentEncouner = null;
    this.appService.reset();
    this.subscriptions.unsubscribe();
    this.subjects.unload.next("app-element");
  }

  showMessage(status: any) {
    if (status.result == "complete") {

      this.alerts = [];
      this.alerts.push({
        type: 'success',
        msg: `${status.message}`,
        timeout: status.timeout ? status.timeout : 0
      });
    }
    else if (status.result == "failed") {
      this.alerts = [];
      this.alerts.push({
        type: 'danger',
        msg: `${status.message}`,
        timeout: status.timeout ? status.timeout : 0
      });
    }
    else if (status.result == "inprogress") {
      this.alerts = [];
      this.alerts.push({
        type: 'info',
        msg: `${status.message}`,
        timeout: status.timeout ? status.timeout : 0
      });
    }

  }

  public openObsModal() {
    this.observationsFormHeader = "Add Observations";
    this.subjects.newObs.next();
    //this.removeXaxisCss();
    this.appService.logToConsole(this.appService.personId);

  }

  public removeXaxisCss() {
    this.tempY = scrollY;
    //document.getElementById("xAxisHeader").className = "";
  }


  public closeOBsModal() {
    this.closeObsFormButton.nativeElement.click();
  }
  obsLoadComplete() {
    this.obsLoaded = true;
  }
  obsUpdateFrameworkEvents(event) {
    this.appService.logToConsole(event);
    this.frameworkAction.emit(event);
  }
  openRecordWeightModal() {
    this.frameworkAction.emit("OPEN_WEIGHT");
  }
  openRecordHeightModal() {
    this.frameworkAction.emit("OPEN_HEIGHT");
  }
  createFilter() {
    //let condition = "person_id = @person_id and encounter_id = @encounter_id";
    let condition = "person_id = @person_id";

    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();
    pm.filterparams.push(new filterparam("person_id", this.appService.personId));
    // pm.filterparams.push(new filterparam("encounter_id", this.appService.encounter.encounter_id));

    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY observationeventdatetime desc");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }
  getHeightWeight(){
    this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/epma_getweightobservations`, this.createFilter())
    .subscribe((response) => {

      if (response.length > 0) {
      
        if (response[0].value != "" || response[0].value != null) {
          this.weight = response[0].value;
        

        } else {
          this.weight = 0;
        }
      } else {
        this.weight = 0;
      }
    }
    ))
    this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/epma_getheightobservations`, this.createFilter())
    .subscribe((response) => {
      
        if (response.length > 0) {
          if (response[0].value != "" || response[0].value != null) {
            this.height = response[0].value;
          } else {
            this.height = 0;
          }
        } else {
          this.height = 0;
        }
      }
      ));

  }

  loadAssessmentModuleDetail(observationEventID: string) {

    this.showSepsisModule = false;
    this.componentModuleData = new ComponentModuleData();
    this.componentModuleData.elementTag = this.appService.sepsisAssessmentElementTag;
    this.componentModuleData.url = this.appService.sepsisAssessmentURI;

    this.componentModuleData.assessmentModuleContext = {

      assessment: {
        assessmenttype_id: '2d06f955-88f6-4fa0-ac5f-3c7dc134f347',
        encounter_id: this.appService.encouter.encounter_id,
        observationevent_id: observationEventID,
        person_id: this.appService.personId,
        sourceofinvocation: 'observations'
      },
      apiServiceFromFW: this.appService.apiService,
      action: 'new'
    };

    this.showSepsisModule = true;
  }

  onSepsisModuleUnLoad(e: any) {
    this.showSepsisModule = false;
    this.subjects.showMessage.next({ result: "complete", message: " ", timeout: 10 });
    this.obsUpdateFrameworkEvents("UPDATE_HEIGHT_WEIGHT");
  }



  encounterLoadComplete() {
    //commment out to push to framework - 3lines
    // this.appService.personId = "4cede3ee-47d9-4a16-ad64-64c3e86083a0";// "17775da9-8e71-4a3f-9042-4cdcbf97efec";// "429904ca-19c1-4a3a-b453-617c7db513a3";//"027c3400-24cd-45c1-9e3d-0f4475336394";//"429904ca-19c1-4a3a-b453-617c7db513a3";

    // let value: any = {};
    // value.authService = {};
    // value.authService.user = {};
    // let auth = this.apiRequest.authService;
    // auth.getToken().then((token) => {
    //  value.authService.user.access_token = token;
    //  this.initConfig(value);
    // });

  }

  //ngOnChanges(changes: SimpleChanges) {

  //  this.appService.logToConsole("personid changed: " + changes.personid.currentValue);
  //  if (!this.appService.apiService) {
  //    this.appService.logToConsole("first service reference is being published");
  //    this.appService.apiService = this.apiservice;
  //    this.subjects.apiServiceReferenceChange.next();
  //  }

  //  this.appService.apiService = this.apiservice;

  //  this.appService.personId = this.personid;
  //  this.subjects.personIdChange.next();
  //}
}
