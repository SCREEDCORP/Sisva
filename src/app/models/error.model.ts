import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ErrorModel {
    error_data: any;
    error_url: any;
    error_code: any;
    error_user: any;
    error_date: any;
    error_info: any;
}
