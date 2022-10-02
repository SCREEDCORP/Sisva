import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { ScrumboardService } from '../../../../services/scrumboard.service';
import { Card } from '../../../../models/card.model';
import { ScrumboardCardDialogComponent } from '../dialogs/card/card.component';
import { UserModel } from 'app/models/user.model';
import { TaskService } from 'app/services/task.service';

@Component({
    selector: 'scrumboard-board-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ScrumboardBoardListComponent implements OnInit, OnDestroy {
    board: any;
    dialogRef: any;
    private user: UserModel;
    @Input()
    list;

    @ViewChild(FusePerfectScrollbarDirective)
    listScroll: FusePerfectScrollbarDirective;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    public loading = false;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {ScrumboardService} _scrumboardService
     * @param {MatDialog} _matDialog
     */
    constructor(
        private _scrumboardService: ScrumboardService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private _taskService: TaskService,
        private _router: Router) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        console.log('list.component.ts');
        const loadUserInterval = setInterval(() => {
            const userStr = sessionStorage.getItem('sisva_user_details_loged');
            this.user = new UserModel(JSON.parse(userStr));
            if (this.user.user_id !== '0') {
                clearInterval(loadUserInterval);
                if (this.user.user_valid === '0') {
                    this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    this._router.navigateByUrl('/security/login');
                }
            }
        }, 2000);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On list name changed
     *
     * @param newListName
     */
    onListNameChanged(newListName): void {
        this.list.name = newListName;
    }

    /**
     * On card added
     *
     * @param newCardName
     */
    onCardAdd(newCardName): void {
        if (newCardName === '') {
            return;
        }

        this._scrumboardService.addCard(
            this.list.id,
            new Card({ name: newCardName })
        );

        setTimeout(() => {
            this.listScroll.scrollToBottom(0, 400);
        });
    }

    /**
     * Remove list
     *
     * @param listId
     */
    removeList(listId): void {
        this.confirmDialogRef = this._matDialog.open(
            FuseConfirmDialogComponent,
            {
                disableClose: false
            }
        );

        this.confirmDialogRef.componentInstance.confirmMessage =
            'Are you sure you want to delete the list and it\'s all cards?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._scrumboardService.removeList(listId);
            }
        });
    }

    /**
     * Open card dialog
     *
     * @param cardId
     */
    openCardDialog(cardId): void {
        this.dialogRef = this._matDialog.open(ScrumboardCardDialogComponent, {
            panelClass: 'scrumboard-card-dialog',
            data: {
                cardId: cardId,
                listId: this.list.id
            }
        });
        this.dialogRef.afterClosed().subscribe(() => { });
    }

    /**
     * On drop
     *
     * @param ev
     */
    onDrop(ev): void {

        setTimeout(() => {
            const currentTask = this.user.user_tasks.find(x => x.schedule_id === ev.value);
            const listCurrent = this.arrayContains(ev.value, this.list.idCards);
            if (listCurrent) {
                if (currentTask.schedule_ejec !== this.list.id) {
                    // this.loading = true;
                    this.user.user_tasks.forEach((elementY, index) => {
                        if (elementY.schedule_id === ev.value) {
                            elementY.schedule_ejec = this.list.id;
                            this.user.user_tasks[index] = elementY;
                        }
                    });
                    const ojbUpdateTask = {
                        user_tasks: this.user.user_tasks,
                        user_id: this.user.user_id
                    };                    
                    this._taskService.postAddTask(ojbUpdateTask).subscribe(
                        dataTask => {
                            if (dataTask.res_service === 'ok') {
                                this._matSnackBar.open('Actualizado correctamente', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 2000
                                });
                                sessionStorage.setItem('sisva_user_details_loged', JSON.stringify(this.user));
                            }                
                        },
                        error => {
                            console.log(error);
                            this._matSnackBar.open('No se agregó correctamente la tarea.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                        },
                        () => {
                            // this.loading = false;
                        }
                    ); 
                }
                console.log();
            }
        }, 1000);

        // this._scrumboardService.updateBoard();
    }

    arrayContains(needle, arrhaystack): any {
        return (arrhaystack.indexOf(needle) > -1);
    }
}
