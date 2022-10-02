import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    MatButtonModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule,
    MatProgressBarModule, MatRippleModule, MatSidenavModule, MatToolbarModule, MatTooltipModule
} from '@angular/material';
import { NgxDnDModule } from '@swimlane/ngx-dnd';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseMaterialColorPickerModule } from '@fuse/components';
import { ScrumboardComponent } from './scrumboard.component';
import { ScrumboardService, BoardResolve } from '../../services/scrumboard.service';
import { ScrumboardBoardComponent } from './board/board.component';
import { ScrumboardBoardListComponent } from './board/list/list.component';
import { ScrumboardBoardCardComponent } from './board/list/card/card.component';
import { ScrumboardBoardEditListNameComponent } from './board/list/edit-list-name/edit-list-name.component';
import { ScrumboardBoardAddCardComponent } from './board/list/add-card/add-card.component';
import { ScrumboardBoardAddListComponent } from './board/add-list/add-list.component';
import { ScrumboardCardDialogComponent } from './board/dialogs/card/card.component';
import { ScrumboardLabelSelectorComponent } from './board/dialogs/card/label-selector/label-selector.component';
import { ScrumboardEditBoardNameComponent } from './board/edit-board-name/edit-board-name.component';
import { ScrumboardBoardSettingsSidenavComponent } from './board/sidenavs/settings/settings.component';
import { ScrumboardBoardColorSelectorComponent } from './board/sidenavs/settings/board-color-selector/board-color-selector.component';
import { PatientService } from 'app/services/patient.service';
import { TaskService } from 'app/services/task.service';
import { NgxLoadingModule } from 'ngx-loading';

const routes: Routes = [
    {
        path     : 'boards',
        component: ScrumboardComponent,
        resolve  : {
            scrumboard: ScrumboardService
        }
    },
    {
        path     : 'boards/:boardId/:boardUri',
        component: ScrumboardBoardComponent,
        resolve  : {
            board: BoardResolve
        }
    },
    {
        path      : '**',
        redirectTo: 'boards'
    }
];

@NgModule({
    declarations   : [
        ScrumboardComponent,
        ScrumboardBoardComponent,
        ScrumboardBoardListComponent,
        ScrumboardBoardCardComponent,
        ScrumboardBoardEditListNameComponent,
        ScrumboardBoardAddCardComponent,
        ScrumboardBoardAddListComponent,
        ScrumboardCardDialogComponent,
        ScrumboardLabelSelectorComponent,
        ScrumboardEditBoardNameComponent,
        ScrumboardBoardSettingsSidenavComponent,
        ScrumboardBoardColorSelectorComponent
    ],
    imports        : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,

        NgxDnDModule,

        FuseSharedModule,
        FuseConfirmDialogModule,
        FuseMaterialColorPickerModule,
        NgxLoadingModule
    ],
    providers      : [
        ScrumboardService,
        BoardResolve,
        PatientService,
        TaskService
    ],
    entryComponents: [ScrumboardCardDialogComponent]
})
export class ScrumboardModule
{
}
