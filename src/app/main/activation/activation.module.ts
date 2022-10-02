import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
    MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatPaginatorModule, MatRippleModule, MatSelectModule, MatSortModule, MatSnackBarModule, MatTableModule,
    MatTabsModule, MatStepperModule, MatDatepickerModule, MatSliderModule, MatSlideToggleModule
} from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components';
import { NgxLoadingModule } from 'ngx-loading';
import { UserActivationListComponent } from './list/activation-list.component';
import { ActivationService } from 'app/services/activation.service';

const routes: Routes = [
    {
        path: '',
        component: UserActivationListComponent,
        resolve: {
            data: ActivationService
        }
    }
];

@NgModule({
    declarations: [
        UserActivationListComponent
    ],
    imports: [
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

        FuseSharedModule,
        FuseWidgetModule,
        MatStepperModule,
        MatDatepickerModule,
        NgxLoadingModule.forRoot({}),
        MatChipsModule,        
        MatSlideToggleModule
    ],
    providers: [
        ActivationService,
    ]
})
export class ActivationModule {
}

