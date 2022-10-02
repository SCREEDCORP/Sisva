import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { ResponseModel } from 'app/models/api-response.model';
import { OrganizationModel } from 'app/models/organization.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private urlCreate = `${this.globalValues.urlOrganization()}/create`;
  private urlDetails = `${this.globalValues.urlOrganization()}/details`;
  private urlUpdProjections = `${this.globalValues.urlOrganization()}/projections`;

  organizationProjections = [];
  onOrganizationProjectionsChanged: BehaviorSubject<any>;

  constructor(
    private httpClient: HttpClient,
    private globalValues: ApisRoutesConfig,
    private _userService: UserService
  ) { 
    this.onOrganizationProjectionsChanged = new BehaviorSubject({});
  }

  resolve(): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getOrganization()
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  getOrganization(): Promise<any> {
    return new Promise((resolve, reject) => {
      const OrgzBody = {
        orgz_id: this._userService.getUserLoged().user_organization.orgz_id
      };
      this.httpClient.post(this.urlDetails, OrgzBody, this.httpOptions)
        .subscribe((response: any) => {
          const dataOrgz = new OrganizationModel(response.data_result.Items[0]);
          this.organizationProjections = dataOrgz.orgz_projections;
          this.onOrganizationProjectionsChanged.next(this.organizationProjections);
          resolve(response);
        }, reject);
    });
  }

  postCreateOrganization(orgz): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlCreate, orgz, this.httpOptions);
  }

  postDetailsOrgz(orgz): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlDetails, orgz, this.httpOptions);
  }

  patchUpdateProjections(orgz): Observable<ResponseModel> {
    return this.httpClient.patch<ResponseModel>(this.urlUpdProjections, orgz, this.httpOptions);
  }

}
