import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule, MatStepperModule, MatOptionModule, MatSelectModule, MatDatepickerModule } from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { RegistryComponent } from './registry.component';
import { FinishRegistryComponent } from './finish-registry/finish-registry.component';
import { NgxLoadingModule } from 'ngx-loading';
import { FinishRegistryLeaderComponent } from './finish-registry-leader/finish-registry-leader.component';
import { ActivateLeaderComponent } from './activate-leader/act-leader.component';
import { RegistryActivateComponent } from './activate/registry-activate.component';
import { AgmCoreModule } from '@agm/core';

const routes = [
    {
        path     : 'registry',
        component: RegistryComponent
    },
    {
        path    : 'registry-finish/:user_id/:leader_id',
        component: FinishRegistryComponent
    },
    {
        path    : 'registry-finish-leader/:user_id',
        component: FinishRegistryLeaderComponent
    },
    {
        path    : 'activate-leader/:user_id',
        component: ActivateLeaderComponent
    },
    {
        path    : 'activate/:user_id',
        component: RegistryActivateComponent
    }
];

@NgModule({
    declarations: [
        RegistryComponent,
        FinishRegistryComponent,
        FinishRegistryLeaderComponent,
        ActivateLeaderComponent,
        RegistryActivateComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSnackBarModule,
        FuseSharedModule,
        NgxLoadingModule,
        MatStepperModule,
        MatOptionModule,
        MatSelectModule,
        MatDatepickerModule,

        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyApIM-BFqJpck7MUpGLQCVrppZVaq9od7I'
        }),


    ]
})
export class RegistryModule
{
}
