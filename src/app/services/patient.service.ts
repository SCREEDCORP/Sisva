import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { ResponseModel } from 'app/models/api-response.model';
import { Patient } from 'app/models/patient.model';

@Injectable()
export class PatientService implements Resolve<any>
{
    routeParams: any;
    patient: Patient;
    onProductChanged: BehaviorSubject<any>;

    private urlCreatePatient = `${this.globalValues.urlPatients()}/create`;
    private urlDetallePatient = `${this.globalValues.urlPatients()}/details`;
    private urlDetallePatientBoard = `${this.globalValues.urlPatients()}/details/board`;
    private urSearchPatientDni = `${this.globalValues.urlPatients()}/details/document`;
    private urlUpdatePatient = `${this.globalValues.urlPatients()}/update`;
    private urlUpdateMedicPatient = `${this.globalValues.urlPatients()}/update/medic`;
    private urlListUbigeoPatient = `${this.globalValues.urlPatients()}/list-ubigeo`;
    private urSearchPatient = `${this.globalValues.urlPatients()}/search-padron`; 
    private urlAddtracing = `${this.globalValues.urlPatients()}/add-tracing`; 
    private urlUpdatetracing = `${this.globalValues.urlPatients()}/update-tracing`; 
    private urlSearchPatient = `${this.globalValues.urlPatients()}/search-names`; 
    private urlCreateNotification = `${this.globalValues.urlPatients()}/create/notification`; 
    private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };    

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private globalValues: ApisRoutesConfig
    ) {
        // Set the defaults
        this.onProductChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getProduct()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get product
     *
     * @returns {Promise<any>}
     */
    getProduct(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.routeParams.pat_id){
                const bodyPatient = {
                    pat_id: this.routeParams.pat_id
                };
                this._httpClient.post(this.urlDetallePatient, bodyPatient, this.httpOptions)
                    .subscribe((response: any) => {                        
                        this.patient = response.data_result.Items[0];
                        this.patient.pageType = this.routeParams.id;
                        this.onProductChanged.next(this.patient);
                        resolve(response);
                    }, reject);
            }
            else if (this.routeParams.id === 'new') {
                this.onProductChanged.next(false);
                resolve(false);
            }
            else {
                const bodyPatient = {
                    pat_id: this.routeParams.id
                };
                this._httpClient.post(this.urlDetallePatient, bodyPatient, this.httpOptions)
                    .subscribe((response: any) => {                        
                        this.patient = response.data_result.Items[0];
                        this.patient.pageType = 'edit';
                        this.onProductChanged.next(this.patient);
                        resolve(response);
                    }, reject);
            }
        });
    }



    putUpdateMedicInfo(medicInfo): Observable<ResponseModel> {
        return this._httpClient.patch<ResponseModel>(this.urlUpdateMedicPatient, medicInfo, this.httpOptions);
    }

    postPatientDetails(patient): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urlDetallePatient, patient, this.httpOptions);
    }

    postPatientDetailsBoard(patient): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urlDetallePatientBoard, patient, this.httpOptions);
    }

    updatePatient(patient): Observable<ResponseModel> {
        return this._httpClient.put<ResponseModel>(this.urlUpdatePatient, patient, this.httpOptions);
    }

    addPatient(patient): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urlCreatePatient, patient, this.httpOptions);
    }

    postNotification(patient): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urlCreateNotification, patient, this.httpOptions);
    }

    getPatientsUbigeo(ubigeo): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urlListUbigeoPatient, ubigeo, this.httpOptions);
    }

    postSearchPatientDni(patient): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urSearchPatientDni, patient, this.httpOptions);
    }

    postSearchPatientPadron(patient): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urSearchPatient, patient, this.httpOptions);
    }

    postAddTracing(tracing): Observable<ResponseModel> {
        return this._httpClient.patch<ResponseModel>(this.urlAddtracing, tracing, this.httpOptions);
    }

    patchUpdateTracing(patient): Observable<ResponseModel> {
        return this._httpClient.patch<ResponseModel>(this.urlUpdatetracing, patient, this.httpOptions);
    }
    
    postSearchPatient(patient): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urlSearchPatient, patient, this.httpOptions);
    }

}
