import { NgModule } from '@angular/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { NavbarComponent } from 'app/layout/components/navbar/navbar.component';
import { NavbarVerticalStyle1Module } from './vertical/verticalmodule';
import { NavigationService } from 'app/services/navigation.service';

@NgModule({
    declarations: [
        NavbarComponent
    ],
    imports     : [
        FuseSharedModule,
        NavbarVerticalStyle1Module     
    ],
    exports     : [
        NavbarComponent
    ],
    providers :[
        NavigationService
    ]
})
export class NavbarModule
{
}
