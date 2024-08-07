//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Limited

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

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Encounter } from '../models/encounter.model';
import { PersonObservationScale, Observationtype, Observationevent, Observationscaletype } from '../models/observations.model';
import { Subscription } from 'rxjs';
import * as jwt_decode from "jwt-decode";
import { action } from '../models/Filter.model';
import { configmodel } from '../models/config.model';
import * as moment from 'moment';



@Injectable({
  providedIn: 'root'
})
export class AppService {
  sepsisAssessmentURI: string;
  sepsisAssessmentElementTag: string;
  reset(): void {
    this.personId = null;
    this.encouter = null;
    this.chartJson = null;
    this.chartDataJson = null;
    this.isCurrentEncouner = false;
    this.apiService = null;
    this.personscale = null;
    this.baseURI = null;
    this.autonomicsBaseURI = null;
    this.appConfig = new configmodel();
    this.loggedInUserName = null;
    this.enableLogging = true;
    this.roleActions = [];
    this.obsTypes = [];
    this.prevObservationEvents = null;
    this.currentEWSScale = null;
    this.obsScales = [];
    this.nextObsDueTime = null;
    this.isInitComplete = null;
    this.personDOB = null;
    this.personAgeAtAdmission = null;

  }
  subscriptions: Subscription;
  public personId: string;
  public encouter: Encounter;
  public chartJson: JSON;
  public chartDataJson: JSON;
  public isCurrentEncouner: boolean = false;
  public apiService: any;
  personscale: PersonObservationScale = null;
  public baseURI: string;
  public autonomicsBaseURI: string;
  public appConfig: configmodel = new configmodel();
  public loggedInUserName: string = null;
  public enableLogging: boolean = true;
  public roleActions: action[] = [];
  public obsTypes: Observationtype[];
  public prevObservationEvents: Array<Observationevent> = null;
  public currentEWSScale: string;
  public obsScales: Array<Observationscaletype> = [];

  public nextObsDueTime: string;
  public isInitComplete: boolean;
  public personDOB: Date;
  public personAgeAtAdmission: number;

  constructor() {
  }
  decodeAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    }
    catch (Error) {
      return null;
    }
  }

  logToConsole(msg: any) {
    if (this.enableLogging) {
      console.log(msg);
    }
  }

  setPatientAgeAtAdmission() {
    this.personAgeAtAdmission = moment(this.encouter.admitdatetime, moment.ISO_8601).diff(moment(this.personDOB, moment.ISO_8601), "years");
  }

  setCurrentScale() {
    let scale = "";
    if (this.personAgeAtAdmission < 19) {
      if (this.personAgeAtAdmission <= 0)
        scale = "PEWS-0To11Mo";
      else if (this.personAgeAtAdmission >= 1 && this.personAgeAtAdmission <= 4)
        scale = "PEWS-1To4Yrs";
      else if (this.personAgeAtAdmission >= 5 && this.personAgeAtAdmission <= 12)
        scale = "PEWS-5To12Yrs";
      else if (this.personAgeAtAdmission >= 13 && this.personAgeAtAdmission <= 18)
        scale = "PEWS-13To18Yrs";

    } else
      if (this.personscale) {

        scale = this.obsScales.filter(x => x.observationscaletype_id == this.personscale.observationscaletype_id)[0].scaletypename;
      }
      else {
        scale = "NEWS2-Scale1";
      }
    this.currentEWSScale = scale;
    return scale;

  }
  public isNewsScale(ewsScaleTyoe: string) {
    switch (ewsScaleTyoe) {
      case "NEWS2-Scale1":
      case "NEWS2-Scale2":
        {
          return true;
        }
      case "PEWS-0To11Mo":
      case "PEWS-1To4Yrs":
      case "PEWS-5To12Yrs":
      case "PEWS-13To18Yrs":
        {
          return false;
        }
      default:
        return null;
    }

  }


  public authoriseAction(action: string): boolean {
    return this.roleActions.filter(x => x.actionname.toLowerCase() == action.toLowerCase()).length > 0;
  }
}
