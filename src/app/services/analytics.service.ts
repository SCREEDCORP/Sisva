import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AnalyticsDashboardService
{
    widgets: any[];

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    )
    {
    }
    
    getWidgetsOb(): Observable<any> {
        return this._httpClient.get<any>('api/analytics-dashboard-widgets');
    }
}
