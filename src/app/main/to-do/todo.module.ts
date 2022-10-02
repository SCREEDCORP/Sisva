import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    MatButtonModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatRippleModule, MatSelectModule, MatTooltipModule, MatChipsModule
} from '@angular/material';
import { NgxDnDModule } from '@swimlane/ngx-dnd';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { TodoComponent } from './todo.component';
import { TodoService } from '../../services/todo.service';
import { TodoMainSidebarComponent } from './sidebars/main/main-sidebar.component';
import { TodoListItemComponent } from './todo-list/todo-list-item/todo-list-item.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoDetailsComponent } from './todo-details/todo-details.component';
import { PatientService } from 'app/services/patient.service';
import { PatientUtil } from 'app/utils/patient.util';

const routes: Routes = [
    {
        path     : 'all',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        }
    },
    {
        path     : 'all/:todoId',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        }
    },
    {
        path     : 'tag/:tagHandle',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        }
    },
    {
        path     : 'tag/:tagHandle/:todoId',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        }
    },
    {
        path     : 'filter/:filterHandle',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        }
    },
    {
        path     : 'filter/:filterHandle/:todoId',
        component: TodoComponent,
        resolve  : {
            todo: TodoService
        }
    },
    {
        path      : '**',
        redirectTo: 'all'
    }
];

@NgModule({
    declarations: [
        TodoComponent,
        TodoMainSidebarComponent,
        TodoListItemComponent,
        TodoListComponent,
        TodoDetailsComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatSelectModule,

        NgxDnDModule,

        FuseSharedModule,
        FuseSidebarModule,
        MatTooltipModule,
        MatChipsModule
    ],
    providers   : [
        TodoService,
        PatientService,
        PatientUtil
    ]
})
export class TodoModule
{
}
