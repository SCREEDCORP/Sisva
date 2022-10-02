import { NgModule } from '@angular/core';
import { UserProfileModule } from './profile/profile.module';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from './list/user-list.component';
import { MatButtonModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, 
         MatPaginatorModule, MatRippleModule, MatSelectModule, MatSortModule, MatSnackBarModule, MatTableModule, 
         MatTabsModule, MatStepperModule, MatDatepickerModule, MatDialogModule } from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components';
import { NgxLoadingModule } from 'ngx-loading';
import { UsersService } from 'app/services/users.service';
import { UserModalModule } from '../modals/user/user-modal.module';
import { UserModalComponent } from '../modals/user/user-modal.component';

const routes: Routes = [
    {
        path     : '',
        component: UserListComponent,
        resolve  : {
            data: UsersService
        }
    }
];

@NgModule({
    declarations: [
        UserListComponent
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

        UserProfileModule,
        UserModalModule,
        MatDialogModule
    ],
    providers   : [        
        UsersService,
    ],
    entryComponents: [
        UserModalComponent
    ]
})
export class UserModule
{
}

