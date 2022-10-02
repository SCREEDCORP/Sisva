import { Component, ViewEncapsulation } from '@angular/core';
import { NgxNavigationWithDataComponent } from 'ngx-navigation-with-data';

@Component({
    selector     : 'error-500',
    templateUrl  : './error-500.component.html',
    styleUrls    : ['./error-500.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class Error500Component
{
    public error: any;
    /**
     * Constructor
     */
    constructor(public  _navCtrl: NgxNavigationWithDataComponent)
    {
        console.log(this._navCtrl.get('error')); // it will console Virendra
        console.log(this._navCtrl.data); // it will console whole data object here
        if (this._navCtrl.get('error')){
            this.error = this._navCtrl.get('error').message;
        }        
    }
}
