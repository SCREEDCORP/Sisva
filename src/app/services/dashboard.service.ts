import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ResponseModel } from 'app/models/api-response.model';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';

@Injectable()
export class ProjectDashboardService implements Resolve<any>
{
    projects: any[];
    widgets: any[];

    private urlListOrgzPatientYears = `${this.globalValues.urlPatients()}/list/report/patients-years`;
    private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };    
    
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,        
        private globalValues: ApisRoutesConfig
    )
    {
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
                this.getProjects(),
                this.getWidgets()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get projects
     *
     * @returns {Promise<any>}
     */
    getProjects(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get('api/project-dashboard-projects')
                .subscribe((response: any) => {
                    this.projects = response;
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Get widgets
     *
     * @returns {Promise<any>}
     */
    getWidgets(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.get('api/project-dashboard-widgets')
                .subscribe((response: any) => {
                    this.widgets = response;
                    resolve(response);
                }, reject);
        });
    }

    postOrgzPatients(orgz): Observable<ResponseModel> {
        return this._httpClient.post<ResponseModel>(this.urlListOrgzPatientYears, orgz, this.httpOptions);
    }
}
