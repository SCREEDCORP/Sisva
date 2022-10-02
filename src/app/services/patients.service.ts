import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { RegistryUtil } from 'app/utils/registry.util';
import { FuseUtils } from '@fuse/utils';
import { UserService } from './user.service';

@Injectable()
export class PatientsService implements Resolve<any>
{
    patients = [];
    onPatientChanged: BehaviorSubject<any>;
    private urlListPatient = `${this.globalValues.urlPatients()}/list`;
    private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private globalValues: ApisRoutesConfig,
        private _registryUtil: RegistryUtil,
        private _userService: UserService
    ) {
        // Set the defaults
        this.onPatientChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getPatientsType(route.params.type)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    getPatientsType(type): Promise<any> {
        return new Promise((resolve, reject) => {
            const typePatient = {
                pat_flg_ane: type == 'ane',
                pat_flg_dci: type == 'dci',
                pat_flg_ges: type == 'ges',
                orgz_id: this._userService.getUserLoged().user_organization.orgz_id
            };
            this._httpClient.post(this.urlListPatient, typePatient, this.httpOptions)
                .subscribe((response: any) => {
                    const rawResult = response.data_result.Items;
                    this.patients = [];
                    rawResult.forEach(element => {                        
                        this.patients.push(
                            {
                                pat_id: element.pat_id,
                                pat_handle: FuseUtils.handleize(element.pat_basic_info.pat_names),
                                pat_num_doc: element.pat_basic_info.pat_document.pat_num_doc,
                                pat_names: element.pat_basic_info.pat_names,
                                pat_familia: element.pat_basic_info.pat_ape_pat + ' ' + (element.pat_basic_info.pat_ape_mat ? element.pat_basic_info.pat_ape_mat : ' '),
                                pat_sexo: this._registryUtil.getSexos().find(x => x.sex_id == element.pat_basic_info.pat_sexo_id).sex_desc,
                                pat_fec_nac: element.pat_basic_info.pat_fec_nac,
                                pat_historia: element.pat_medic_info.pat_his_cli ? element.pat_medic_info.pat_his_cli : ' ',
                                pat_hcd: element.pat_medic_info.pat_hcd ? Number.parseFloat(element.pat_medic_info.pat_hcd) : 0,
                                pat_comunidad: element.pat_geoloc_info.pat_dst_name ? element.pat_geoloc_info.pat_dst_name : ' ',
                                pat_status: element.pat_status,
                                pat_fec_reg: element.fec_reg,
                                pat_usu_reg: element.usu_reg,                                
                                pat_schedule_trc: element.pat_schedule_tracing_data ? element.pat_schedule_tracing_data : [],
                                pat_ane_state: element.pat_medic_info.pat_ane_state,
                                pat_basic_info: element.pat_basic_info,
                                pat_geoloc_info: element.pat_geoloc_info,
                                pat_medic_info: element.pat_medic_info,
                                pat_type: element.pat_type
                            }
                        );
                    });
                    this.onPatientChanged.next(this.patients);
                    resolve(response);
                }, reject);
        });
    }
}
