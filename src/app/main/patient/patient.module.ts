import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatRippleModule, MatSelectModule, MatSnackBarModule,
    MatSortModule,
    MatTableModule, MatTabsModule, MatStepperModule, MatDatepickerModule, MatDividerModule, MatMenuModule, MatSlideToggleModule, MatTooltipModule
} from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { PatientComponent } from './patient/patient.component';
import { PatientService } from '../../services/patient.service';
import { PatientsService } from '../../services/patients.service';
import { PatientsComponent } from './patients/patients.component';
import { DatePipe } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { PatientUtil } from 'app/utils/patient.util';

const routes: Routes = [
    {
        path     : 'type/:type',
        component: PatientsComponent,
        resolve  : {
            data: PatientsService
        }
    },
    {
        path     : ':id',
        component: PatientComponent,
        resolve  : {
            data: PatientService
        }
    },
    {
        path     : ':id/:handle',
        component: PatientComponent,
        resolve  : {
            data: PatientService
        }
    }
];

@NgModule({
    declarations: [
        PatientComponent,
        PatientsComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule,

        NgxChartsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyApIM-BFqJpck7MUpGLQCVrppZVaq9od7I'
        }),

        FuseSharedModule,
        FuseWidgetModule,
        MatStepperModule,
        MatDatepickerModule,      
        NgxLoadingModule.forRoot({}),
        MatChipsModule,
        MatDividerModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatTooltipModule
    ],
    providers   : [
        PatientService,
        PatientsService,
        DatePipe,
        PatientUtil
    ]
})
export class PatientModule
{
}
