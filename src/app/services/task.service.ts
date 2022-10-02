import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { Observable } from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { ResponseModel } from 'app/models/api-response.model';

@Injectable()
export class TaskService {

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private urlCreate = `${this.globalValues.urlTask()}/task-add`;

  constructor(
    private httpClient: HttpClient,
    private globalValues: ApisRoutesConfig
  ) { }

  postAddTask(task): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlCreate, task, this.httpOptions);
  }
}
