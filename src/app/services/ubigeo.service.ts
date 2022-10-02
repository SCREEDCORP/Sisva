import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../node_modules/@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { ApisRoutesConfig } from 'app/configuration/api-routes.config';
import { ResponseModel } from 'app/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private urlListDpt = `${this.globalValues.urlUbigeo()}/get-dpt`;
  private urlListPrv = `${this.globalValues.urlUbigeo()}/get-prv`;
  private urlListDst = `${this.globalValues.urlUbigeo()}/get-dst`;
  private urlGoogleApiElevation = `${this.globalValues.urlGoogleElevation()}/elevation`;
  constructor(
    private httpClient: HttpClient,
    private globalValues: ApisRoutesConfig
  ) { }

  getElevation(cords): Observable<ResponseModel> {
    const objCords = {
      longitude : cords.longitude,
      latitude : cords.latitude
    };
    return this.httpClient.post<ResponseModel>(this.urlGoogleApiElevation, objCords, this.httpOptions);   
  }

  getListDpt(): Observable<ResponseModel> {
    return this.httpClient.get<ResponseModel>(this.urlListDpt, this.httpOptions);
  }

  getListPrv(ubigeo): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlListPrv, ubigeo, this.httpOptions);   
  }

  getListDst(ubigeo): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.urlListDst, ubigeo, this.httpOptions);
  }
}
