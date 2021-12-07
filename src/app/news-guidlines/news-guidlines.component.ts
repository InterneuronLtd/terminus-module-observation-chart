//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

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

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubjectsService } from '../services/subjects.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ObservationEventMonitoring, Observation, Observationevent } from '../models/observations.model';
import { v4 as uuid } from 'uuid';
import * as moment from 'moment';
import { IAssessmentContext } from '../directives/module-loader.directive';


@Component({
  selector: 'app-news-guidlines',
  templateUrl: './news-guidlines.component.html',
  styleUrls: ['./news-guidlines.component.css'],
})
export class NewsGuidlinesComponent implements OnInit {

  obsmonitoringform = this.fb.group({
    isPatientSick: [''],
    couldBeInfection: [''],
    concernsAboutPatient: [''],
    monitoringFrequency: [''],
    escalationofCare: [''],
    escalatedtowhom: [''],
    reasonfornotescalating: [''],
    monitoringcomments: ['']

  });

  disableSubmit: boolean = false;
  ewsScoreHeader: string = "";
  observationEvent: Observationevent;
  guidance: any = {};
  oldMonitoring: ObservationEventMonitoring;
  subscriptions: Subscription = new Subscription();
  observations: Observation[];
  limitMonitoringFrequency: boolean = false;
  ewsScaleType: string;
  response: any = { score: 0, clinicalresponse: "", monitoring: "", cssclass: "", text: "", topConcernsText: "", scoreTypeHeading: "" };
  isNewsScale: boolean;
  @ViewChild('openGuidance') openGuidance: ElementRef;
  @ViewChild('closeGuidance') closeGuidance: ElementRef;
  painScoreThreshold: number = 7;
  showEscalationQuestions: boolean = false;
  other_concerns_about_patient_warning_message: string;
  could_be_infection_warning_message: string;

  @ViewChild('firstElement')
  private firstElement: ElementRef;

  constructor(private fb: FormBuilder, private apiRequest: ApirequestService, private subjects: SubjectsService, private appService: AppService) {

    this.subscriptions.add(this.obsmonitoringform.get('isPatientSick').valueChanges.subscribe(value => {
      if (value == "true") {
        this.obsmonitoringform.get('couldBeInfection').setValidators(this.isUnansweredValidator);
        this.obsmonitoringform.get('couldBeInfection').updateValueAndValidity();
      }
      else {
        this.obsmonitoringform.get('couldBeInfection').clearValidators();
        this.obsmonitoringform.get('couldBeInfection').updateValueAndValidity();
      }

      this.setEscalationOfCareValidator();


    }));

    this.subscriptions.add(this.obsmonitoringform.get('concernsAboutPatient').valueChanges.subscribe(value => {
      this.setEscalationOfCareValidator();

    }));

    this.subscriptions.add(this.obsmonitoringform.get('escalationofCare').valueChanges.subscribe(value => {
      if (value == "true") {
        this.obsmonitoringform.get('escalatedtowhom').setValidators(this.isUnansweredValidator);
        this.obsmonitoringform.get('escalatedtowhom').updateValueAndValidity();

        this.obsmonitoringform.get('reasonfornotescalating').clearValidators();
        this.obsmonitoringform.get('reasonfornotescalating').updateValueAndValidity();
      }
      else if (value == "false") {
        this.obsmonitoringform.get('reasonfornotescalating').setValidators(this.isUnansweredValidator);
        this.obsmonitoringform.get('reasonfornotescalating').updateValueAndValidity();

        this.obsmonitoringform.get('escalatedtowhom').clearValidators();
        this.obsmonitoringform.get('escalatedtowhom').updateValueAndValidity();
      }
      else {
        this.obsmonitoringform.get('escalatedtowhom').clearValidators();
        this.obsmonitoringform.get('escalatedtowhom').reset();

        this.obsmonitoringform.get('escalatedtowhom').updateValueAndValidity();
        this.obsmonitoringform.get('reasonfornotescalating').clearValidators();
        this.obsmonitoringform.get('reasonfornotescalating').reset();
        this.obsmonitoringform.get('reasonfornotescalating').updateValueAndValidity();
      }

    }));
    this.subscriptions.add(this.subjects.openGuidance.subscribe
      ((event: any) => {

        setTimeout(() => {
          this.firstElement.nativeElement.scrollIntoView();
        }, 200);


        this.ewsScaleType = event.ewsScaleType;
        this.ewsScoreHeader = event.score;
        this.guidance = event.guidance;
        this.isNewsScale = this.appService.isNewsScale(event.ewsScaleType);
        if (<number>event.score >= 3 || this.guidance.split(" ")[0] == "LOW/MEDIUM")
          this.showEscalationQuestions = true;
        else
          this.showEscalationQuestions = false;
        this.prepareResponse(event);


        this.disableSubmit = true;
        this.limitMonitoringFrequency = false;
        this.painScoreThreshold = this.appService.appConfig.appsettings.painscale_warning_threshold_score;
        this.obsmonitoringform.reset();
        this.obsmonitoringform.get('monitoringFrequency').setValue("4");
        this.obsmonitoringform.get('monitoringFrequency').updateValueAndValidity();
        this.oldMonitoring = null;

        if (event.observationevent) {
          this.observationEvent = event.observationevent;
          this.observations = event.observations;
          this.getMonitoringForEventAndPrepopulateForm(event.observationevent.observationevent_id)
        }
        else {
          this.observationEvent = null;
          this.observations = null;
        }

        this.setValidators();
        this.openModal();
      }));
  }

  reset() {

  }

  setEscalationOfCareValidator() {
    let isPatientSick = this.obsmonitoringform.getRawValue()["isPatientSick"];
    let concernsAboutPatient = this.obsmonitoringform.getRawValue()["concernsAboutPatient"];

    if (isPatientSick == "true" || concernsAboutPatient == "true") {
      this.obsmonitoringform.get('escalationofCare').setValidators(this.isUnansweredValidator);
      this.obsmonitoringform.get('escalationofCare').updateValueAndValidity();
    }

    else {
      this.obsmonitoringform.get('escalationofCare').clearValidators();
      this.obsmonitoringform.get('escalationofCare').reset();
      this.obsmonitoringform.get('escalationofCare').updateValueAndValidity();

    }

  }

  prepareResponse(event: any) {

    this.response = { score: -1, clinicalresponse: "", monitoring: "", cssclass: "", text: "", topConcernsText: "", scoreTypeHeading: "" };

    let score = <number>event.score;
    this.response.score = score;
    if (this.isNewsScale) {
      this.response.topConcernsText = this.appService.appConfig.appsettings.news2guidance.topConcernsText;
      this.response.scoreTypeHeading = "NEWS2 Score:";
      if (event.guidance.split(" ")[0] == "LOW/MEDIUM") {
        this.response.text = this.appService.appConfig.appsettings.news2guidance.score3single_text;
        this.response.cssclass = this.appService.appConfig.appsettings.news2guidance.score3single_cssclass;
        this.response.clinicalresponse = this.appService.appConfig.appsettings.news2guidance.score3single_clinicalresponse;
        this.response.monitoring = this.appService.appConfig.appsettings.news2guidance.score3single_frequency;
      }
      else
        if (score == 0) {
          this.response.text = this.appService.appConfig.appsettings.news2guidance.score0_text;
          this.response.cssclass = this.appService.appConfig.appsettings.news2guidance.score0_cssclass;
          this.response.clinicalresponse = this.appService.appConfig.appsettings.news2guidance.score0_clinicalresponse;
          this.response.monitoring = this.appService.appConfig.appsettings.news2guidance.score0_frequency;
        }
        else if (score > 0 && score < 5) {
          this.response.text = this.appService.appConfig.appsettings.news2guidance.score1to4_text;
          this.response.cssclass = this.appService.appConfig.appsettings.news2guidance.score1to4_cssclass;
          this.response.clinicalresponse = this.appService.appConfig.appsettings.news2guidance.score1to4_clinicalresponse;
          this.response.monitoring = this.appService.appConfig.appsettings.news2guidance.score1to4_frequency;
        }
        else if (score > 4 && score < 7) {
          this.response.text = this.appService.appConfig.appsettings.news2guidance.score5to6_text;
          this.response.cssclass = this.appService.appConfig.appsettings.news2guidance.score5to6_cssclass;
          this.response.clinicalresponse = this.appService.appConfig.appsettings.news2guidance.score5to6_clinicalresponse;
          this.response.monitoring = this.appService.appConfig.appsettings.news2guidance.score5to6_frequency;
        }
        else if (score > 6) {
          this.response.text = this.appService.appConfig.appsettings.news2guidance.score7ormore_text;
          this.response.cssclass = this.appService.appConfig.appsettings.news2guidance.score7ormore_cssclass;
          this.response.clinicalresponse = this.appService.appConfig.appsettings.news2guidance.score7ormore_clinicalresponse;
          this.response.monitoring = this.appService.appConfig.appsettings.news2guidance.score7ormore_frequency;
        }
    }
    else
      if (!this.isNewsScale) {
        this.response.topConcernsText = this.appService.appConfig.appsettings.pewsguidance.topConcernsText;
        this.response.scoreTypeHeading = "PEWS Score:";

        this.response.text = this.appService.appConfig.appsettings.pewsguidance["score" + score + "_text"];
        this.response.cssclass = this.appService.appConfig.appsettings.pewsguidance["score" + score + "_cssclass"];
        this.response.clinicalresponse = this.appService.appConfig.appsettings.pewsguidance["score" + score + "_clinicalresponse"];
        this.response.monitoring = this.appService.appConfig.appsettings.pewsguidance["score" + score + "_frequency"];
      }

    this.could_be_infection_warning_message = this.appService.appConfig.appsettings.could_be_infection_warning_message;
    this.other_concerns_about_patient_warning_message = this.appService.appConfig.appsettings.other_concerns_about_patient_warning_message;

  }


  openModal() {
    this.openGuidance.nativeElement.click();
  }
  closeModal() {
    this.closeGuidance.nativeElement.click();
  }
  ngOnInit() {
  }

  submitMonitoring() {

    if (this.obsmonitoringform.valid) {
      this.closeModal();
      this.subjects.closeObsForm.next({ result: "inprogress", message: "Please wait while response and monitoring are being updated..." });
      this.disableSubmit = true;
      let obsMonitoring_id = "";
      if (this.oldMonitoring)
        obsMonitoring_id = this.oldMonitoring.observationeventmonitoring_id;
      else
        obsMonitoring_id = uuid();

      let escalationofCare = this.obsmonitoringform.getRawValue()["escalationofCare"];
      escalationofCare = escalationofCare == "true" ? true : (escalationofCare == "false" ? false : null);
      let isPatientSick = this.obsmonitoringform.getRawValue()["isPatientSick"];
      let concernsAboutPatient = this.obsmonitoringform.getRawValue()["concernsAboutPatient"];
      let couldBeInfection = this.obsmonitoringform.getRawValue()["couldBeInfection"];
      let monitoringFrequency = Number(this.obsmonitoringform.getRawValue()["monitoringFrequency"]);
      let escalatedtowhom = this.obsmonitoringform.getRawValue()["escalatedtowhom"];
      let reasonfornotescalating = this.obsmonitoringform.getRawValue()["reasonfornotescalating"];
      let monitoringcomments = this.obsmonitoringform.getRawValue()["monitoringcomments"];

      if (isPatientSick != "true")
        couldBeInfection = "null";

      if (!escalationofCare) {
        escalatedtowhom = "null";
      }
      else {
        reasonfornotescalating = "null";
      }

      if (!this.showEscalationQuestions) {
        isPatientSick = "null";
        couldBeInfection = "null";
        concernsAboutPatient = "null";
        escalationofCare = null;
        escalatedtowhom = "null";
        reasonfornotescalating = "null";
      }

      let ismonitoringfreqamended: boolean = false;
      let isescalationofcareamended: boolean = false;

      if (this.oldMonitoring) {
        ismonitoringfreqamended = this.oldMonitoring.isobservationfrequencyamended == true || this.oldMonitoring.observationfrequency != monitoringFrequency;
        isescalationofcareamended = this.oldMonitoring.isobservationfrequencyamended == true || this.oldMonitoring.escalationofcare != escalationofCare;
      }

      let newObsMonitoring = new ObservationEventMonitoring(
        obsMonitoring_id,
        this.observationEvent.observationevent_id,
        monitoringFrequency || 4,
        escalationofCare,
        isPatientSick,
        concernsAboutPatient,
        couldBeInfection,
        escalatedtowhom,
        reasonfornotescalating,
        monitoringcomments,
        this.observationEvent.eventcorrelationid,
        this.oldMonitoring ? true : false,
        ismonitoringfreqamended,
        isescalationofcareamended
      );

      this.subscriptions.add(this.apiRequest.postRequest(this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=observationeventmonitoring", JSON.stringify(newObsMonitoring)).
        subscribe((resp) => {
          this.subjects.showMessage.next({ result: "complete", message: "<h5>" + (this.ewsScoreHeader ? (this.response.scoreTypeHeading + " " + this.ewsScoreHeader) : "") + "</h5>Response and Monitoring updated.", timeout: 10000 });

          //recalculate obs due time if most latest obs even  t has been amended. 
          if (this.appService.prevObservationEvents[0].observationevent_id == this.observationEvent.observationevent_id)
            this.appService.nextObsDueTime = new Date(moment(this.appService.prevObservationEvents[0].datefinished, moment.ISO_8601).add(Math.ceil((monitoringFrequency || 4) * 60), "minutes").toISOString()).toString();

          if (couldBeInfection == "true") {
            this.subjects.showMessage.next({ result: "inprogress", message: "<h5>" + (this.ewsScoreHeader ? (this.response.scoreTypeHeading + " " + this.ewsScoreHeader) : "") + "</h5>Opening Sepsis Assessment... ", timeout: 10000 });

            //open sepsis assessment
            this.subjects.loadAssessmentModule.next(this.observationEvent.observationevent_id);
          }
          this.subjects.frameworkEvent.next("UPDATE_EWS");

        }, (err_obsevent) => {
          this.closeModal();
          this.appService.logToConsole("error creating observations event");
          this.appService.logToConsole(err_obsevent);
          this.subjects.showMessage.next({ result: "failed", message: "There was an error adding observations monitoring: " + err_obsevent });
        }, () => { this.subjects.drawGraph.next(); }));
    }
    else {
      this.obsmonitoringform.get('monitoringFrequency').markAsTouched({ onlySelf: true });
      this.obsmonitoringform.get('isPatientSick').markAsTouched({ onlySelf: true });
      this.obsmonitoringform.get('concernsAboutPatient').markAsTouched({ onlySelf: true });
      this.obsmonitoringform.get('couldBeInfection').markAsTouched({ onlySelf: true });
      this.obsmonitoringform.get('escalationofCare').markAsTouched({ onlySelf: true });

      this.obsmonitoringform.get('escalatedtowhom').markAsTouched({ onlySelf: true });
      this.obsmonitoringform.get('reasonfornotescalating').markAsTouched({ onlySelf: true });

    }
  }

  getMonitoringForEventAndPrepopulateForm(observationevent_id: string) {
    this.appService.logToConsole("amend monitoring for:" + observationevent_id)

    if (this.observations)
      for (let r of this.observations) {
        let obscode = this.appService.obsTypes.filter(x => x.observationtype_id == (<Observation>r).observationtype_id)[0].code;

        if (obscode == "PAINSCOREMOVEMENT" || obscode == "PAINSCOREATREST") {
          if (r.value && (<number><unknown>r.value) >= this.painScoreThreshold) {
            this.limitMonitoringFrequency = true;
            this.obsmonitoringform.get('monitoringFrequency').setValue("null");
            this.obsmonitoringform.get('monitoringFrequency').updateValueAndValidity();
            break;
          }
        }
      }


    this.subscriptions.add(this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=core&synapseentityname=observationeventmonitoring&synapseattributename=observationevent_id&attributevalue=${observationevent_id}`)
      .subscribe((response) => {
        this.disableSubmit = false;

        if (response) {
          let responseEvent = JSON.parse(response);

          if (responseEvent && responseEvent.length > 0) {
            this.oldMonitoring = <ObservationEventMonitoring>responseEvent[0];
            let control = this.obsmonitoringform.get('isPatientSick');
            control.setValue(responseEvent[0].ispatientsick);
            control.updateValueAndValidity();

            control = this.obsmonitoringform.get('couldBeInfection');
            control.setValue(responseEvent[0].couldbeinfection);
            control.updateValueAndValidity();

            control = this.obsmonitoringform.get('concernsAboutPatient');
            control.setValue(responseEvent[0].concernsaboutpatient);
            control.updateValueAndValidity();

            control = this.obsmonitoringform.get('monitoringFrequency');
            if (this.limitMonitoringFrequency && <number><unknown>responseEvent[0].observationfrequency.toString() > 2)
              control.setValue("null");
            else
              control.setValue(responseEvent[0].observationfrequency.toString());
            control.updateValueAndValidity();

            control = this.obsmonitoringform.get('escalationofCare');
            control.setValue((responseEvent[0].escalationofcare == null) ? "null" : responseEvent[0].escalationofcare.toString());
            control.updateValueAndValidity();

            control = this.obsmonitoringform.get('escalatedtowhom');
            control.setValue(responseEvent[0].escalatedtowhom);
            control.updateValueAndValidity();

            control = this.obsmonitoringform.get('reasonfornotescalating');
            control.setValue(responseEvent[0].reasonfornotescalating);
            control.updateValueAndValidity();

            control = this.obsmonitoringform.get('monitoringcomments');
            control.setValue(responseEvent[0].monitoringcomments);
            control.updateValueAndValidity();

            this.setValidators();

          }
        }
      }));
  }

  setValidators() {
    this.obsmonitoringform.get('monitoringFrequency').setValidators(this.isUnansweredValidator);
    this.obsmonitoringform.get('monitoringFrequency').updateValueAndValidity();

    this.obsmonitoringform.get('isPatientSick').setValidators(this.isUnansweredValidator);
    this.obsmonitoringform.get('isPatientSick').updateValueAndValidity();

    this.obsmonitoringform.get('concernsAboutPatient').setValidators(this.isUnansweredValidator);
    this.obsmonitoringform.get('concernsAboutPatient').updateValueAndValidity();

    if (this.obsmonitoringform.get('isPatientSick').value == "true") {
      this.obsmonitoringform.get('couldBeInfection').setValidators(this.isUnansweredValidator);
      this.obsmonitoringform.get('couldBeInfection').updateValueAndValidity();
    }

    if (this.obsmonitoringform.get('escalationofCare').value == "true") {
      this.obsmonitoringform.get('escalatedtowhom').setValidators(this.isUnansweredValidator);
      this.obsmonitoringform.get('escalatedtowhom').updateValueAndValidity();
    }
    else if (this.obsmonitoringform.get('escalationofCare').value == "false") {
      this.obsmonitoringform.get('reasonfornotescalating').setValidators(this.isUnansweredValidator);
      this.obsmonitoringform.get('reasonfornotescalating').updateValueAndValidity();
    }
    else {
      this.obsmonitoringform.get('escalatedtowhom').clearValidators();
      this.obsmonitoringform.get('escalatedtowhom').updateValueAndValidity();

      this.obsmonitoringform.get('reasonfornotescalating').clearValidators();
      this.obsmonitoringform.get('reasonfornotescalating').updateValueAndValidity();
    }

    if (!this.showEscalationQuestions) {
      this.obsmonitoringform.get('isPatientSick').clearValidators();
      this.obsmonitoringform.get('couldBeInfection').clearValidators();
      this.obsmonitoringform.get('concernsAboutPatient').clearValidators();
      this.obsmonitoringform.get('escalationofCare').clearValidators();
      this.obsmonitoringform.get('escalatedtowhom').clearValidators();
      this.obsmonitoringform.get('reasonfornotescalating').clearValidators();

      this.obsmonitoringform.get('isPatientSick').updateValueAndValidity();
      this.obsmonitoringform.get('couldBeInfection').updateValueAndValidity();
      this.obsmonitoringform.get('concernsAboutPatient').updateValueAndValidity();
      this.obsmonitoringform.get('escalationofCare').updateValueAndValidity();
      this.obsmonitoringform.get('escalatedtowhom').updateValueAndValidity();
      this.obsmonitoringform.get('reasonfornotescalating').updateValueAndValidity();

    }

  }
  public isUnansweredValidator(control: FormControl) {
    const isUnanswered = control.value == null || (control.value || '').trim() === "null"
    return !isUnanswered ? null : { 'unanswered': true };
  }

}
