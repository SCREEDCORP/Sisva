import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { UserModel } from 'app/models/user.model';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class ActivationService implements Resolve<any>
{
    activations = [];
    onActivationChanged: BehaviorSubject<any>;
    private urlListPatient = `${this.globalValues.urlUser()}/activate-create/list`;
    private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private globalValues: ApisRoutesConfig,
        private _router: Router,
        private _matSnackBar: MatSnackBar   
    )
    {
        // Set the defaults
        this.onActivationChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getActivations()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get products
     *
     * @returns {Promise<any>}
     */
    getActivations(): Promise<any>
    {
        const userStr = sessionStorage.getItem('sisva_user_details_loged');
        const user = new UserModel(JSON.parse(userStr));

        if (user.user_id !== '0') {
            if (user.user_valid === '0') {
                this._matSnackBar.open('No se cargó la información del usuario', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                this._router.navigateByUrl('/security/login');
            } else {
                const bodyUser = {
                    user_id: user.user_id
                };
                return new Promise((resolve, reject) => {
                    this._httpClient.post(this.urlListPatient, bodyUser, this.httpOptions)
                        .subscribe((response: any) => {                                                
                            if (response.res_service === 'ok') {
                                if (response.data_result.Count > 0) {
                                    this.activations = response.data_result.Items[0].user_activate_reqst;
                                    this.activations.forEach((element, index) => {
                                        element['user_details'] = new UserModel();
                                        this.activations[index] = element;
                                    });
                                    this.onActivationChanged.next(this.activations);
                                    resolve(response);
                                }
                            }
                        }, reject);
                });
            }
        }
    }
}
