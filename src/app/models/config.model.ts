//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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

export class Uris {
  public baseuri: string;
  public autonomicsbaseuri: string;
}

export class News2guidance {
  public topConcernsText: string;
  public score0_frequency: string;
  public score0_clinicalresponse: string;
  public score0_text: string;
  public score0_cssclass: string;


  public score1to4_frequency: string;
  public score1to4_clinicalresponse: string;
  public score1to4_text: string;
  public score1to4_cssclass: string;


  public score3single_frequency: string;
  public score3single_clinicalresponse: string;
  public score3single_text: string;
  public score3single_cssclass: string;


  public score5to6_frequency: string;
  public score5to6_clinicalresponse: string;
  public score5to6_text: string;
  public score5to6_cssclass: string;


  public score7ormore_frequency: string;
  public score7ormore_clinicalresponse: string;
  public score7ormore_text: string;
  public score7ormore_cssclass: string;


}

export class PEWSguidance {
  public topConcernsText: string;

  public score0_text: string;
  public score0_frequency: string;
  public score0_clinicalresponse: string;
  public score0_cssclass: string;

  public score1_text: string;
  public score1_frequency: string;
  public score1_clinicalresponse: string;
  public score1_cssclass: string;

  public score2_text: string;

  public score2_frequency: string;
  public score2_clinicalresponse: string;
  public score2_cssclass: string;

  public score3_text: string;
  public score3_frequency: string;
  public score3_clinicalresponse: string;
  public score3_cssclass: string;

  public score4_text: string;
  public score4_frequency: string;
  public score4_clinicalresponse: string;
  public score4_cssclass: string;

  public score5_text: string;
  public score5_frequency: string;
  public score5_clinicalresponse: string;
  public score5_cssclass: string;

  public score6_text: string;
  public score6_frequency: string;
  public score6_clinicalresponse: string;
  public score6_cssclass: string;

  public score7_text: string;
  public score7_frequency: string;
  public score7_clinicalresponse: string;
  public score7_cssclass: string;


}

export class Appsettings {
  public news2guidance: News2guidance = new News2guidance();
  public pewsguidance: PEWSguidance = new PEWSguidance();

  public bp_nottaken_warning_message: string;
  public bpwarningthresholdminutes: number;
  public max_consecutive_partial_sets: number;
  public partial_notallowed_after_mins: number;
  public painscale_warning_threshold_score: number;
  public obs_due_warning: string;
  public other_concerns_about_patient_warning_message: string;
  public could_be_infection_warning_message: string;

}

export class configmodel {
  constructor(
    public uris?: Uris,
    public enablelogging?: boolean,
    public appsettings: Appsettings = new Appsettings(),
    public prodbuild?: boolean
  ) { };
}


