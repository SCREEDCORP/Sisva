import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatRippleModule, MatSelectModule, MatSnackBarModule,
    MatSortModule,
    MatTableModule, MatTabsModule, MatStepperModule, MatDatepickerModule, MatAutocompleteModule, MatProgressBarModule, MatListModule, MatSlideToggleModule, MatCheckboxModule, MatDialogModule
} from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { DatePipe } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { TasksComponent } from './tasks/tasks.component';
import { TaskComponent } from './task/task.component';
import { TaskService } from 'app/services/task.service';
import { UserService } from 'app/services/user.service';
import { UsersService } from 'app/services/users.service';
import { PatientService } from 'app/services/patient.service';
import { UserModalComponent } from '../modals/user/user-modal.component';
import { UserModalModule } from '../modals/user/user-modal.module';

const routes: Routes = [
    {
        path     : '',
        component: TasksComponent,
        resolve  : {
            data: UsersService
        }
    },
    {
        path     : ':id',
        component: TaskComponent,
        resolve  : {
            data: UserService
        }
    },
    {
        path     : ':id/:handle',
        component: TaskComponent,
        resolve  : {
            data: UserService
        }
    }
];

@NgModule({
    declarations: [
        TaskComponent,
        TasksComponent
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
        MatCheckboxModule,
        UserModalModule,
        MatDialogModule
    ],
    providers   : [        
        UserService,
        UsersService,
        PatientService,
        DatePipe,
        TaskService
    ],
    entryComponents: [
        UserModalComponent
    ]
})
export class TasksModule
{
}
