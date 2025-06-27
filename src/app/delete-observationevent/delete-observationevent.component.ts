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
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { Observationevent, Observation, obsNames, Observationtype, obsNamesFromChart, obsNameHeadersFromChart, obsUnits, obsSortOrder, deviceDisplayName, consciousLevelDisplayName, monitoringDisplayName, consciousLevelDisplayNamePEWS } from '../models/observations.model';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-delete-observationevent',
  templateUrl: './delete-observationevent.component.html',
  styleUrls: ['./delete-observationevent.component.css']
})
export class DeleteObservationeventComponent implements OnInit, OnDestroy {

  public chartEvent: any = {}
  observationEvent: any = {};
  subscriptions: Subscription = new Subscription();
  //reasonForRemoval: string = "";
  disableRemove: boolean = true;
  @ViewChild('openDelete') openDelete: ElementRef;
  @ViewChild('closeDelete') closeDelete: ElementRef;
  @ViewChild('reasonForRemoval') reasonForRemoval: ElementRef;
  @ViewChild('openConfirm') openConfirm: ElementRef;
  @ViewChild('closeConfirm') closeConfirm: ElementRef;
  oldObservations: any = []
  obsTypes: Array<Observationtype> = [];
  isCurrentEncounter: boolean = false;

  constructor(private subjects: SubjectsService, private apiRequest: ApirequestService, private appService: AppService) {
    this.subscriptions.add(this.subjects.apiServiceReferenceChange.subscribe(() => {
      this.getMetaData();
    }));
    this.subscriptions.add(this.subjects.openDeletePopover.subscribe
      ((event: any) => {
        this.chartEvent = event;
        this.observationEvent = {};
        this.openModal();
        this.oldObservations = [];

        this.getObservationEvent(event);
        this.isCurrentEncounter = this.appService.isCurrentEncouner;
      }));
  }
  onReasonChange(reason: string) {
    //this.reasonForRemoval = reason;
    this.reasonForRemoval.nativeElement.value = reason;
    if (!(/\S/.test(reason)))
      this.disableRemove = true;
    else
      this.disableRemove = false;
  }
  ngOnDestroy() {
    this.appService.logToConsole("destroying delete pop up component instance");

    this.subscriptions.unsubscribe();
  }
  getMetaData() {
    this.appService.logToConsole("in metadata: remove pop up");
    //get observation types
    this.apiRequest.getRequest(this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=observationtype").subscribe(
      (response) => {
        let responseArray = JSON.parse(response);
        for (let r of responseArray) {
          this.obsTypes.push(<Observationtype>r);
        }
      });
  }
  ngOnInit() {
  }
  closeModal() {
    this.closeDelete.nativeElement.click();
  }
  openModal() {
    this.openDelete.nativeElement.click();
  }

  openConfirmModal() {
    this.reasonForRemoval.nativeElement.value = "";
    this.disableRemove = true;
    this.openConfirm.nativeElement.click();

  }

  closeConfirmModal() {
    this.closeConfirm.nativeElement.click();

  }

  openConfirmDialog() {
    this.closeModal();
    this.openConfirmModal();
  }

  closeConfirmDialog() {
    this.openModal();
    this.closeConfirmModal();
  }


  getObservationEvent(observationevent_id: string) {

    this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=core&synapseentityname=observationevent&synapseattributename=observationevent_id&returnsystemattributes=1&attributevalue=${observationevent_id}`)
      .subscribe
      ((observationevent) => {
        let responseEvent = JSON.parse(observationevent);
        this.observationEvent = <Observationevent>responseEvent[0];
        //get obs

        this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=core&synapseentityname=observation&synapseattributename=observationevent_id&attributevalue=${observationevent_id}`)
          .subscribe
          ((response) => {

            let responseArray = JSON.parse(response);
            for (let r of responseArray) {
              let obscode = this.obsTypes.filter(x => x.observationtype_id == (<Observation>r).observationtype_id)[0].code;
              if (Object.keys(monitoringDisplayName).includes(obscode))
                continue; //skip adding to this observations array if the code is monitoring information, which is now moved to observationeventmonitoring entity

              r.displayName = Object.keys(obsNameHeadersFromChart).includes(obscode) ? obsNameHeadersFromChart[obscode] : obscode;
              r.displayUnits = obsUnits[obscode];


              if (obscode == "OXYGENDEV")
                r.value = deviceDisplayName[r.value];

              if (obscode == "CLVL")
                r.value = this.appService.isNewsScale(this.appService.currentEWSScale) ? consciousLevelDisplayName[r.value] : consciousLevelDisplayNamePEWS[r.value];


              r.sortOrder = obsSortOrder[obscode];
              //this.oldObservations.push(r);
              if(r.displayName != 'Height' && r.displayName != 'Weight'){
                this.oldObservations.push(r);
              }
            }




            //Smoke Test	4	Current Reqmt	Need to show the reason for an amendment in the history pop-up	Discussed in design sessions	agreed		Update observation event summary to include Reason for Ammendment 
            if (this.observationEvent.isamended == true || this.observationEvent.isamended == "true") {
              let reasonForAmend: any = {};
              reasonForAmend.value = this.observationEvent.reasonforamend;
              reasonForAmend.displayName = "Reason for amend";
              reasonForAmend.sortOrder = 102;
              reasonForAmend.displayUnits = "";
              this.oldObservations.push(reasonForAmend);
            }

            //Smoke Test	7	Current Reqmt	Need to capture a reason for accepting an incomplete observation (to deter this for users)	This was agreed in the last design session	agreed	P1	"Add Reason for Capturing an incomplete set of observations (TextArea) and make it mandatory
            if (this.observationEvent.reasonforincompleteobservations && /\S/.test(this.observationEvent.reasonforincompleteobservations)) {
              // string is not empty and not just whitespace
              let reasonForIncomplete: any = {};
              reasonForIncomplete.value = this.observationEvent.reasonforincompleteobservations;
              reasonForIncomplete.displayName = "Reason for incomplete set";
              reasonForIncomplete.sortOrder = 103;
              reasonForIncomplete.displayUnits = "";
              this.oldObservations.push(reasonForIncomplete);
            }

            //Smoke Test	28	Current Reqmt	The observation event pop-over should include the calculated EWS score at the top of the obs list			P1	Update observation event summary to include EWS Score / Flag at the top of the list


            this.apiRequest.getRequest(`${this.appService.baseURI}/GetBaseViewListObjectByAttribute/carerecord_observations?synapseattributename=observationevent_id&attributevalue=${observationevent_id}`)
              .subscribe
              ((ews) => {
                let cleanJson = (ews || '').replace(/"{/g, '{').replace(/}\"/g, '}').replace(/\\"/g, '"').replace(/\\"/g, '"');
                if (cleanJson) {
                  if ((JSON.parse(cleanJson)).earlywarningscore && (JSON.parse(cleanJson)).earlywarningscore.observationvalue != null) {
                    let ewsScore: any = {};
                    ewsScore.value = (JSON.parse(cleanJson)).earlywarningscore.observationvalue;
                    ewsScore.displayName = "NEWS2 Score";
                    ewsScore.sortOrder = 0;
                    ewsScore.displayUnits = "";
                    this.oldObservations.push(ewsScore);
                  }
                  if ((JSON.parse(cleanJson)).ispatientsick && (JSON.parse(cleanJson)).ispatientsick.observationvalue != null) {
                    let obj: any = {};
                    obj.value = (JSON.parse(cleanJson)).ispatientsick.observationvalue.toString();
                    obj.displayName = monitoringDisplayName["ispatientsick"];
                    obj.sortOrder = obsSortOrder["ispatientsick"];
                    obj.displayUnits = "";
                    this.oldObservations.push(obj);
                  }
                  if ((JSON.parse(cleanJson)).concernsaboutpatient && (JSON.parse(cleanJson)).concernsaboutpatient.observationvalue != null) {
                    let obj: any = {};
                    obj.value = (JSON.parse(cleanJson)).concernsaboutpatient.observationvalue.toString();
                    obj.displayName = monitoringDisplayName["concernsaboutpatient"];
                    obj.sortOrder = obsSortOrder["concernsaboutpatient"];
                    obj.displayUnits = "";
                    this.oldObservations.push(obj);
                  }
                  if ((JSON.parse(cleanJson)).couldbeinfection && (JSON.parse(cleanJson)).couldbeinfection.observationvalue != null) {
                    let obj: any = {};
                    obj.value = (JSON.parse(cleanJson)).couldbeinfection.observationvalue.toString();
                    obj.displayName = monitoringDisplayName["couldbeinfection"];
                    obj.sortOrder = obsSortOrder["couldbeinfection"];
                    obj.displayUnits = "";
                    this.oldObservations.push(obj);
                  }


                  //Issue	42	Nursing App	Observation event summary doesn't display 'Escalated care' value	Expected behavior: the observation event summary is displayed when tapping on the observation date at the top of the chart. It should show everything that is captured (or ammended) in the Obs Entry/Amend screen	agreed	P1	Update observation event summary to include Escalated Care value

                  let escalationOfCare: any = {};
                  escalationOfCare.value = (JSON.parse(cleanJson)).escalationofcare == null ? "null" : (JSON.parse(cleanJson)).escalationofcare.observationvalue.toString();
                  escalationOfCare.displayName = monitoringDisplayName["escalationofcare"]
                  escalationOfCare.displayUnits = "";
                  escalationOfCare.sortOrder = 100;
                  if (escalationOfCare.value != "null") {
                    this.oldObservations.push(escalationOfCare);
                    if (escalationOfCare.value != "true") {
                      if ((JSON.parse(cleanJson)).reasonfornotescalating && (JSON.parse(cleanJson)).reasonfornotescalating.observationvalue != null
                        && (JSON.parse(cleanJson)).reasonfornotescalating.observationvalue != "null") {
                        let obj: any = {};
                        obj.value = (JSON.parse(cleanJson)).reasonfornotescalating.observationvalue.toString();
                        obj.displayName = monitoringDisplayName["reasonfornotescalating"];
                        obj.sortOrder = 101
                        obj.displayUnits = "";
                        this.oldObservations.push(obj);
                      }
                    }
                    else {
                      if ((JSON.parse(cleanJson)).escalatedtowhom && (JSON.parse(cleanJson)).escalatedtowhom.observationvalue != null
                        && (JSON.parse(cleanJson)).escalatedtowhom.observationvalue != "null") {
                        let obj: any = {};
                        obj.value = (JSON.parse(cleanJson)).escalatedtowhom.observationvalue.toString();
                        obj.displayName = monitoringDisplayName["escalatedtowhom"];
                        obj.sortOrder = 101
                        obj.displayUnits = "";
                        this.oldObservations.push(obj);
                      }
                    }
                  }
                  if ((JSON.parse(cleanJson)).monitoringcomments && (JSON.parse(cleanJson)).monitoringcomments.observationvalue != null && (JSON.parse(cleanJson)).monitoringcomments.observationvalue != "") {
                    let obj: any = {};
                    obj.value = (JSON.parse(cleanJson)).monitoringcomments.observationvalue.toString();
                    obj.displayName = monitoringDisplayName["monitoringcomments"];
                    obj.sortOrder = 104
                    obj.displayUnits = "";
                    this.oldObservations.push(obj);
                  }



                }


                //Add Recorded by to the summary list - 24th Oct 2019
                if (this.observationEvent.addedby) {
                  // string is not empty and not just whitespace
                  let recordedBy: any = {};
                  recordedBy.value = this.observationEvent.addedby.replace(/,/g, '').split(' ').reverse().join(' ');
                  recordedBy.displayName = "Recorded by";
                  recordedBy.sortOrder = 105;
                  recordedBy.displayUnits = "";
                  this.oldObservations.push(recordedBy);
                }

                this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=core&synapseentityname=observationeventmonitoring&synapseattributename=observationevent_id&returnsystemattributes=1&attributevalue=${observationevent_id}`)
                  .subscribe
                  ((observationeventmonitoring) => {
                    let observationEventMonitoring = JSON.parse(observationeventmonitoring);
                    if (Array.isArray(observationEventMonitoring) && observationEventMonitoring.length != 0) {
                      let monitoringFrequency: any = {};

                      // if (this.appService.appConfig.environment == 'hospital') {
                      //   if (observationEventMonitoring[0].ispause)
                      //     monitoringFrequency.value = "Paused";
                      //   else if (observationEventMonitoring[0].isstop)
                      //       monitoringFrequency.value = "Stopped";
                      //   else if (observationEventMonitoring[0].monitoringnotrequired)
                      //     monitoringFrequency.value = "Regular Monitoring not required";
                      //   else {
                      //       monitoringFrequency.value = observationEventMonitoring[0].frequency_entered;
                      //       monitoringFrequency.displayUnits = observationEventMonitoring[0].frequencyunit_entered;
                      //     }
                      // }
                      // else {
                        monitoringFrequency.value = (observationEventMonitoring[0].observationfrequency == '168' ? 'Monitoring not clinically indicated' :observationEventMonitoring[0].observationfrequency);
                        monitoringFrequency.displayUnits = (observationEventMonitoring[0].observationfrequency == '168' ? '' : "Hrs");
                      // }
                      monitoringFrequency.displayName = "Monitoring Frequency";
                      monitoringFrequency.sortOrder = 107;
                      this.oldObservations.push(monitoringFrequency);

                    }
                  });

                //Smoke Test	23	Current Reqmt	The observation event should be displayed in the same order as the observation entry form, which is the same as the chart.	The observation event pop-over is displayed when tapping the obs date at the top of the chart. Currently displayed in alphabetical order.		P1	Update Observation Event Summary ordering

                this.oldObservations.sort(function compare(a, b) {
                  //var x = a.displayName.toLowerCase();
                  //var y = b.displayName.toLowerCase();
                  //if (x < y) { return -1; }
                  //if (x > y) { return 1; }
                  //return 0;

                  return <number>a.sortOrder - <number>b.sortOrder;
                });

              });



          });
      });
  }

  deleteObservationEvent() {

    //amend with reason and delete.

    if (this.observationEvent) {
      this.closeModal();
      this.closeConfirmModal();
      this.subjects.showMessage.next({ result: "inprogress", message: "Observations are being removed..." });

      //Smoke Test	6	Current Reqmt	Need to capture a reason for removing a set of observations	Discussed in design sessions	agreed	P1	"Add Reason for Removing a set of Observation (TextArea) and make it mandatory
      //this.observationEvent.reasonforamend = "Deleting observations because they are being invalidated";
      //this.observationEvent.reasonfordelete = this.reasonForRemoval;
      this.observationEvent.reasonfordelete = this.reasonForRemoval.nativeElement.value;

      this.apiRequest.postRequest(this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=observationevent", JSON.stringify(this.observationEvent))
        .subscribe(
          () => {
            this.apiRequest.deleteRequest(this.appService.baseURI + "/DeleteObject?synapsenamespace=core&synapseentityname=observationevent&id=" + this.observationEvent.observationevent_id)
              .subscribe(
                () => {
                  this.subjects.showMessage.next({ result: "complete", message: "Observations removed.", timeout: 10000 });
                  this.subjects.drawGraph.next(true);
                }, (error) => {
                  this.subjects.showMessage.next({ result: "failed", message: "Could not remove observations " + error })
                });
          }, (error) => this.subjects.showMessage.next({ result: "failed", message: "Could not remove observations " + error }));
    }
  }

  amendObservationEvent() {
    this.closeModal();
    this.closeConfirmModal();
    setTimeout(() => {
      this.subjects.openObsForm.next("Amend Observations");
      this.subjects.amendObs.next(this.observationEvent.observationevent_id);
    }, 500);
  }
}
