import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { ReportMapComponent } from './map/report-map.component';
import { AgmCoreModule } from '@agm/core';
import { PatientService } from 'app/services/patient.service';
import { NgxLoadingModule } from 'ngx-loading';

const routes: Routes = [
    {
        path     : 'type/:type',
        component: ReportMapComponent
    }
];

@NgModule({
    declarations: [
        ReportMapComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyApIM-BFqJpck7MUpGLQCVrppZVaq9od7I'
        }),
        NgxLoadingModule
    ],
    providers   : [
        PatientService
    ]
})
export class ReportsModule
{
}
