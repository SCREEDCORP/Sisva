import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { ScrumboardService } from '../../../services/scrumboard.service';
import { List } from '../../../models/list.model';
import { UserService } from 'app/services/user.service';
import { UserModel } from 'app/models/user.model';
import { MatSnackBar } from '@angular/material';
import { Card } from 'app/models/card.model';
import { PatientService } from 'app/services/patient.service';

@Component({
    selector: 'scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ScrumboardBoardComponent implements OnInit, OnDestroy {
    board: any;

    // Private
    private _unsubscribeAll: Subject<any>;
    private user: UserModel;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _location: Location,
        private _scrumboardService: ScrumboardService,
        private _userService: UserService,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _patientService: PatientService
    ) {
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
        this._scrumboardService.onBoardChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(board => {
                this.board = board;
            });
        const userStr = sessionStorage.getItem('sisva_user_details_loged');
        this.user = new UserModel(JSON.parse(userStr));
        if (this.user.user_id !== '0') {
            if (this.user.user_valid === '0') {
                this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                this._router.navigateByUrl('/security/login');
            } else {
                const userObj = {
                    user_id: this.user.user_id
                };
                this._userService.getTaks(userObj).subscribe(
                    data => {
                        if (data.res_service === 'ok') {
                            if (data.data_result.Count > 0) {

                                const listPorHacer = this.user.user_tasks.filter(x => x.schedule_ejec === '1' && x.schedule_stat === '1');
                                const listEnProgreso = this.user.user_tasks.filter(x => x.schedule_ejec === '2' && x.schedule_stat === '1');
                                const listCompletado = this.user.user_tasks.filter(x => x.schedule_ejec === '3' && x.schedule_stat === '1');
                                const listValidado = this.user.user_tasks.filter(x => x.schedule_ejec === '4' && x.schedule_stat === '1');

                                listPorHacer.forEach(element => {
                                    this.board.lists[0].idCards.push(element.schedule_id);
                                });
                                listEnProgreso.forEach(element => {
                                    this.board.lists[1].idCards.push(element.schedule_id);
                                });
                                listCompletado.forEach(element => {
                                    this.board.lists[2].idCards.push(element.schedule_id);
                                });
                                listValidado.forEach(element => {
                                    this.board.lists[3].idCards.push(element.schedule_id);
                                });

                                const listTask = this.user.user_tasks.filter(
                                    x => x.schedule_stat === '1'
                                );
                                listTask.forEach(element => {
                                    let dsc = '';
                                    switch (element.schedule_order) {
                                        case '1':
                                            dsc = 'Primer';
                                            break;
                                        case '2':
                                            dsc = 'Segundo';
                                            break;
                                        case '3':
                                            dsc = 'Tercer';
                                            break;
                                        case '4':
                                            dsc = 'Cuarto';
                                            break;
                                        case '5':
                                            dsc = 'Quinto';
                                            break;
                                        case '6':
                                            dsc = 'Sexto';
                                            break;
                                    }
                                    dsc = dsc + ' seguimiento';
                                    const dataPatient = {
                                        pat_id: element.pat_id
                                    };
                                    this._patientService.postPatientDetailsBoard(dataPatient).subscribe(
                                        dataPatientResult => {
                                            if (dataPatientResult.res_service === 'ok') {
                                                if (dataPatientResult.data_result.Count > 0) {
                                                    const oCard = new Card({
                                                        name: element.schedule_id,
                                                        id: element.schedule_id,
                                                        due: element.schedule_date,
                                                        pat_id: element.pat_id,
                                                        description: dsc,
                                                        patient: dataPatientResult.data_result.Items[0]
                                                    });                                                    
                                                    this.board.cards.push(
                                                        oCard
                                                    );
                                                }
                                            }
                                        }
                                    );
                                });
                            }
                        }
                    }, error => {
                        console.log(error);
                    }, () => {

                    }
                );
            }
        }
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
     * On list add
     *
     * @param newListName
     */
    onListAdd(newListName): void {
        if (newListName === '') {
            return;
        }
        const list = new List({ name: newListName });
        this._scrumboardService.addList(list);
    }

    /**
     * On board name changed
     *
     * @param newName
     */
    onBoardNameChanged(newName): void {
        this._scrumboardService.updateBoard();
        this._location.go('/apps/scrumboard/boards/' + this.board.id + '/' + this.board.uri);
    }

    /**
     * On drop
     *
     * @param ev
     */
    onDrop(ev): void {
        this._scrumboardService.updateBoard();
    }
}
