import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, 
    MatIconModule, MatInputModule, MatPaginatorModule, MatRippleModule, 
    MatSelectModule, MatSnackBarModule, MatSortModule, MatTableModule, 
    MatTabsModule, MatStepperModule, MatDatepickerModule, MatAutocompleteModule, 
    MatProgressBarModule, MatListModule, MatSlideToggleModule, MatCheckboxModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { NgxLoadingModule } from 'ngx-loading';
import { ProjectionComponent } from './projection/projection.component';
import { ProjectionsComponent } from './projections/projections.component';
import { OrganizationService } from 'app/services/organization.service';

const routes: Routes = [
    {
        path     : '',
        component: ProjectionsComponent,
        resolve  : {
            data: OrganizationService
        }
    },
    {
        path     : ':id',
        component: ProjectionComponent,
        resolve  : {
            data: OrganizationService
        }
    },
    {
        path     : ':id/:handle',
        component: ProjectionComponent,
        resolve  : {
            data: OrganizationService
        }
    }
];

@NgModule({
    declarations: [
        ProjectionComponent,
        ProjectionsComponent,        
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
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

        FuseSharedModule,
        FuseWidgetModule,
        MatStepperModule,
        MatDatepickerModule,      
        NgxLoadingModule.forRoot({}),
        MatChipsModule,
        MatAutocompleteModule,
        MatListModule,
        MatProgressBarModule,
        MatSlideToggleModule,
        MatCheckboxModule
    ],
    providers    : []
})
export class ProjectionsModule
{
}
