import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatMenuModule, 
         MatSelectModule, MatTableModule, MatTabsModule, MatSnackBarModule } from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { ProjectDashboardService } from '../../services/dashboard.service';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
    {
        path: '**',
        component: DashboardComponent,
        resolve: {
            data: ProjectDashboardService
        }
    }
];

@NgModule({
    declarations: [
        DashboardComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatTableModule,
        MatTabsModule,

        NgxChartsModule,

        FuseSharedModule,
        FuseSidebarModule,
        FuseWidgetModule,
        MatSnackBarModule
    ],
    providers: [
        ProjectDashboardService        
    ]
})
export class DashboardModule {
}

