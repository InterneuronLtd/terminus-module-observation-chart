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
export class Observationevent {
  constructor(
    public observationevent_id: string,
    public person_id: string,
    public datestarted: any,
    public datefinished: any,
    public addedby: string,
    public encounter_id: string,
    public isamended: boolean,
    public observationfrequency: number,
    public observationscaletype_id: string,
    public escalationofcare: boolean,
    public reasonforamend: string,
    public _createdby: string,
    public reasonforincompleteobservations?: string,
    public reasonfordelete?: string,
    public eventcorrelationid?: string,
    public incomplete?: boolean
  ) { }
}


export class Observation {
  constructor(
    public observation_id?: string,
    public units?: string,
    public symbol?: string,
    public timerecorded?: any,
    public observationevent_id?: string,
    public observationtype_id?: string,
    public observationtypemeasurement_id?: string,
    public value?: string,
    public hasbeenammended?: boolean,
    public _createdby?: string,
    public eventcorrelationid?: string
  ) { }
}

export class Observationtype {
  constructor(
    public observationtype_id: string,
    public code: string,
    public name: string,
    public active: boolean,
    public valuetype: string,
    public valuelist: string) { }
}

export class ObservationEventMonitoring {
  constructor(
    public observationeventmonitoring_id: string,
    public observationevent_id: string,
    public observationfrequency: number,
    public escalationofcare: boolean,
    public ispatientsick: string,
    public concernsaboutpatient: string,
    public couldbeinfection: string,
    public escalatedtowhom?: string,
    public reasonfornotescalating?: string,
    public monitoringcomments?: string,
    public eventcorrelationid?: string,
    public hasbeenammended?: boolean,
    public isobservationfrequencyamended?: boolean,
    public isescalationofcareamended?: boolean

  ) { }

}

//mapping reactive form observation names to observation codes synapse, to add a new quesiton, add to reactive form and to this enum. 
export enum obsNames {
  ["oxygenDevice"] = "OXYGENDEV",
  ["inspiredOxygenPercentage"] = "INSPIREO2PERCENTAGE",
  ["inspiredOxygenLitrePerMin"] = "INSPIREO2LITREPERMIN",
  ["positionBP"] = "BPPOSITION",
  ["painScaleMovement"] = "PAINSCOREMOVEMENT",
  ["painScaleRest"] = "PAINSCOREATREST",
  ["supplementalOxygen"] = "ONOXYGEN",
  ["temperature"] = "TEMP",
  ["respirationRate"] = "RESP",
  ["oxygenSaturation"] = "SPO2",
  ["pulseRate"] = "HR",
  ["systolicBP"] = "SBP",
  ["diastolicBP"] = "DBP",
  ["consciousLevel"] = "CLVL",
  ["bowelsOpen"] = "BSC",
  ["height"] = "HEIGHT",
  ["weight"] = "WEIGHT",
  ["glucose"] = "glucose",
  ["respdistress"] = "respdistress",
  ["concern"] = "concern",
  ["concerns"] = "concerns",
  ["reasonfornobp"] = "reasonfornobp"


}

// mapping chart observation names/identifiers to observaiton types in synapse
export enum obsNamesFromChart {
  ["device"] = "OXYGENDEV",
  ["isonoxygen"] = "ONOXYGEN",
  ["temperature"] = "TEMP",
  ["respirations"] = "RESP",
  ["oxygensaturations"] = "SPO2",
  ["pulse"] = "HR",
  ["systolicbloodpressure"] = "SBP",
  ["diastolicbloodpressure"] = "DBP",
  ["consciousness"] = "CLVL",
  ["bowelsopen"] = "BSC",
  ["glucose"] = "glucose",
  ["painscoreatrest"] = "PAINSCOREATREST",
  ["painscorewithmovement"] = "PAINSCOREMOVEMENT",
  ["inspireoxygenpercentage"] = "INSPIREO2PERCENTAGE",
  ["inspireoxygenlitrepermin"] = "INSPIREO2LITREPERMIN",
  ["monitoring"] = "monitoring",
  ["escalationofcare"] = "escalationofcare",
  ["respiratorydistress"] = "respdistress",
  ["dfnconcern"] = "concern"

}

//mapping chart observation names/headers to meaningful headers
export enum obsNameHeadersFromChart {
  //obscode keys
  ["OXYGENDEV"] = "Oxygen Device",
  ["ONOXYGEN"] = "On Oxygen?",
  ["TEMP"] = "Temperature",
  ["RESP"] = "Respirations",
  ["SPO2"] = "Oxygen Saturations",
  ["HR"] = "Pulse Rate",
  ["SBP"] = "Systolic Blood Pressure",
  ["DBP"] = "Diastolic Blood Pressure",
  ["CLVL"] = "Consciousness Level",
  ["BSC"] = "Bowels Open",
  ["glucose"] = "Glucose",
  ["PAINSCOREATREST"] = "Pain Score - Rest",
  ["PAINSCOREMOVEMENT"] = "Pain Score - Movement",


  ["HEIGHT"] = "Height",
  ["WEIGHT"] = "Weight",
  ["BPPOSITION"] = "BP Position",
  ["INSPIREO2PERCENTAGE"] = "Inspired Oxygen (%)",
  ["INSPIREO2LITREPERMIN"] = "Inspired Oxygen (L/min)",
  ["respdistress"] = "Respiratory Distress",
  ["concern"] = "Are there Doctor/Nurse/Family concerns?",
  ["concerns"] = " Doctor/Nurse/Family concerns",
  ["reasonfornobp"] = "Reason for not taking BP",
  ["monitoring"] = "Monitoring",
  ["escalationofcare"] = "Escalation",

  //non obscode keys
  ["painscore"] = "Pain Score",
}

export enum obsUnits {
  ["OXYGENDEV"] = "",
  ["INSPIREO2PERCENTAGE"] = "%",
  ["INSPIREO2LITREPERMIN"] = "L/min",
  ["BPPOSITION"] = "",
  ["PAINSCOREMOVEMENT"] = "",
  ["PAINSCOREATREST"] = "",
  ["ONOXYGEN"] = "",
  ["TEMP"] = "°C",
  ["RESP"] = "breaths per minute",
  ["SPO2"] = "%",
  ["HR"] = "Bpm",
  ["SBP"] = "mmHg",
  ["DBP"] = "mmHg",
  ["CLVL"] = "",
  ["BSC"] = "",
  ["HEIGHT"] = "cm",
  ["WEIGHT"] = "kg",
  ["glucose"] = "",
  ["respdistress"] = "",
  ["concern"] = "",
  ["concerns"] = "",
  ["reasonfornobp"] = ""

}

export enum obsSortOrder {
  ["concern"] = 1,
  ["concerns"] = 2,
  ["RESP"] = 3,
  ["respdistress"] = 4,
  ["SPO2"] = 5,
  ["ONOXYGEN"] = 6,
  ["OXYGENDEV"] = 7,
  ["INSPIREO2PERCENTAGE"] = 8,
  ["INSPIREO2LITREPERMIN"] = 9,
  ["SBP"] = 10,
  ["DBP"] = 11,
  ["BPPOSITION"] = 12,
  ["HR"] = 13,
  ["CLVL"] = 14,
  ["TEMP"] = 15,
  ["PAINSCOREATREST"] = 16,
  ["PAINSCOREMOVEMENT"] = 17,
  ["glucose"] = 18,
  ["BSC"] = 19,
  ["HEIGHT"] = 20,
  ["WEIGHT"] = 21,
  ["ispatientsick"] = 22,
  ["couldbeinfection"] = 23,
  ["concernsaboutpatient"] = 24,
  ["reasonfornobp"] = 25,
  ["reasonfornotescalating"] = 26
}

export enum deviceDisplayName {
  ["NIV"] = "CPAP/BiPAP Mask",
  ["H"] = "Humidified Oxygen",
  ["N"] = "Nasal Canula",
  ["RM"] = "Reservoir Mask",
  ["SM"] = "Simple Mask",
  ["V"] = "Venturi Mask",
  ["TM"] = "Tracheostomy Mask",

  //old ones
  ["Venturi Mask"] = "Venturi Mask",
  ["Nasal cannulae"] = "Nasal cannulae",
  ["Non-rebreather mask"] = "Non-rebreather mask",

}

export enum consciousLevelDisplayName {
  ["A"] = "Alert",
  ["C"] = "Confusion",
  ["V"] = "Voice",
  ["P"] = "Pain",
  ["U"] = "Unresponsive",
}

export enum consciousLevelDisplayNamePEWS {
  //["A"] = "Awake/Responsive to voice",
  //["U"] = "Unresponsive to voice",
  ["A"] = "Alert",
  ["C"] = "Confusion",
  ["V"] = "Voice",
  ["P"] = "Pain",
  ["U"] = "Unresponsive",
}

export enum monitoringDisplayName {
  ["monitoring"] = "Monitoring Frequency",
  ["escalationofcare"] = "Escalation of care",
  ["ispatientsick"] = "Does the patient look sick?",
  ["concernsaboutpatient"] = "Any other concerns about this patient?",
  ["couldbeinfection"] = "Could this be due to an infection?",
  ["reasonfornotescalating"] = "Reason for not escalating",
  ["escalatedtowhom"] = "Escalated to whom?",
  ["monitoringcomments"] = "Monitoring comments"
}


export class Observationtypemeasurement {

  observationtypemeasurement_id: string
  observationtype_id: string
  symbol: string
  name: string
  active: boolean
}

export class Oxygendevices {
  oxygendevices_id: string
  name: string
  description: string
  active: boolean
}
export class Observationscaletype {

  observationscaletype_id: string
  scaletypename: string
  scaletypedescription: string
}

export class PersonObservationScale {
  personobservationscale_id: string;
  person_id: string;
  observationscaletype_id: string;

}
