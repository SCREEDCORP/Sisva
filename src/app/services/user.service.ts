import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { ResponseModel } from 'app/models/api-response.model';
import { UserModel } from 'app/models/user.model';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  routeParams: any;
  user = {};
  onUserChanged: BehaviorSubject<any>;

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private urlRegistry = `${this.globalValues.urlUser()}/registry`;
  private urlLogin = `${this.globalValues.urlUser()}/login`;
  private urlDetails = `${this.globalValues.urlUser()}/details`;
  private urlDetailsOrgzTask = `${this.globalValues.urlUser()}/details/tasks/report `;
  private urlDetailsMail = `${this.globalValues.urlUser()}/details/mail`;
  private urlTasks = `${this.globalValues.urlUser()}/details/tasks`;
  private urlUpdateActivation = `${this.globalValues.urlUser()}/update-activation`;
  private urlCreateActivationReq = `${this.globalValues.urlUser()}/activate-create`;
  private urlActivationSendMail = `${this.globalValues.urlUser()}/activate-create/send-mail`;
  private urlUpdatePhone = `${this.globalValues.urlUser()}/update-phone-activate`;
  private urlSearch = `${this.globalValues.urlUser()}/user-search`;
  private urlActivateUser = `${this.globalValues.urlUser()}/activate-create/update`;

  constructor(
    private httpClient: HttpClient,
    private globalValues: ApisRoutesConfig,
  ) {
    this.onUserChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;

    return new Promise((resolve, reject) => {

      Promise.all([
        this.getUser()
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  postOrganizationTask(orgz): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlDetailsOrgzTask, orgz, this.httpOptions);
  }

  postRegistryUser(user): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlRegistry, user, this.httpOptions);
  }

  postLoginUser(user): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlLogin, user, this.httpOptions);
  }

  postDetails(user): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlDetails, user, this.httpOptions);
  }

  postDetailsMail(user): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlDetailsMail, user, this.httpOptions);
  }

  patchUpdatePhoneActivate(user): Observable<ResponseModel> {
    return this.httpClient.patch<ResponseModel>(this.urlUpdatePhone, user, this.httpOptions);
  }

  patchUpdateUserActivation(user): Observable<ResponseModel> {
    return this.httpClient.patch<ResponseModel>(this.urlUpdateActivation, user, this.httpOptions);
  }

  patchCreateActivateRequest(request): Observable<ResponseModel> {
    return this.httpClient.patch<ResponseModel>(this.urlCreateActivationReq, request, this.httpOptions);
  }

  postActivationSendMail(mail): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlActivationSendMail, mail, this.httpOptions);
  }

  postSearchUser(user): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlSearch, user, this.httpOptions);
  }

  patchActivateUser(activation): Observable<ResponseModel> {
    return this.httpClient.patch<ResponseModel>(this.urlActivateUser, activation, this.httpOptions);
  }

  getTaks(user): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlTasks, user, this.httpOptions);
  }

  getUser(): Promise<any> {
    const bodyDetails = {
      user_id: this.routeParams.id
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(this.urlDetails, bodyDetails, this.httpOptions)
        .subscribe((response: any) => {
          this.user = response.data_result.Items[0];
          this.onUserChanged.next(this.user);
          resolve(response);
        }, reject);
    });
  }

  getUserLoged(): UserModel {
    const localsUserToken = localStorage.getItem('sisva_user_login');
    const sessionUserToken = sessionStorage.getItem('sisva_user_login');
    let oUserModel = new UserModel();
    if (localsUserToken != null) {
      oUserModel = new UserModel(JSON.parse(localsUserToken));
    } else if (sessionUserToken != null) {
      oUserModel = new UserModel(JSON.parse(sessionUserToken));
    }
    return oUserModel;
  }

}
