import { NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule, MatSnackBarModule } from '@angular/material';

import { FuseNavigationModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { NavbarVerticalStyle1Component } from './vertical.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [
        NavbarVerticalStyle1Component
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,

        FuseSharedModule,
        FuseNavigationModule,
        RouterModule,
        MatSnackBarModule
    ],
    exports     : [
        NavbarVerticalStyle1Component
    ]
})
export class NavbarVerticalStyle1Module
{
}
