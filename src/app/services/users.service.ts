import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { UserModel } from 'app/models/user.model';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  users = [];
  onUserChanged: BehaviorSubject<any>;

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private urlListOrgz = `${this.globalValues.urlUser()}/list-orgz`;

  constructor(
    private httpClient: HttpClient,
    private globalValues: ApisRoutesConfig,
    private _router: Router
  ) {
    this.onUserChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getUsers()
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  getUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
        const userStr = sessionStorage.getItem('sisva_user_details_loged');
        const user = new UserModel(JSON.parse(userStr));
        if (user.user_valid === '0') {
          this._router.navigateByUrl('/security/login');
        }
        const userOrgz = {
          orgz_id: user.user_organization.orgz_id
        };
        this.httpClient.post(this.urlListOrgz, userOrgz, this.httpOptions)
          .subscribe((response: any) => {
            this.users = response.data_result.Items.filter(x => x.user_pers_info.user_ape_pat != null);
            this.onUserChanged.next(this.users);
            resolve(response);
          }, reject);
      });
  }
}
