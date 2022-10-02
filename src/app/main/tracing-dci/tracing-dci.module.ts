import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatRippleModule, MatSelectModule, MatSnackBarModule,
    MatSortModule,
    MatTableModule, MatTabsModule, MatStepperModule, MatDatepickerModule, MatSlideToggleModule
} from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { PatientService } from '../../services/patient.service';
import { PatientsService } from '../../services/patients.service';
import { DatePipe } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { TracingPatientsComponent } from './patients/patients.component';
import { TracingPatientComponent } from './tracing/tracing.component';
import { PatientUtil } from 'app/utils/patient.util';
import { AnalyticsDashboardService } from 'app/services/analytics.service';
import { ChartsModule } from 'ng2-charts';

const routes: Routes = [
    {
        path     : 'type/:type',
        component: TracingPatientsComponent,
        resolve  : {
            data: PatientsService
        }
    },
    {
        path     : ':id/:handle',
        component: TracingPatientComponent,
        resolve  : {
            data: PatientService
        }
    },
    {
        path     : ':id/:pat_id/:handle',
        component: TracingPatientComponent,
        resolve  : {
            data: PatientService
        }
    }
];

@NgModule({
    declarations: [
        TracingPatientComponent,
        TracingPatientsComponent
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
        MatSlideToggleModule,


        ChartsModule,
        NgxChartsModule
    ],
    providers   : [
        PatientService,
        PatientsService,
        DatePipe,
        PatientUtil,
        AnalyticsDashboardService
    ]
})
export class TracingDciModule
{
}
