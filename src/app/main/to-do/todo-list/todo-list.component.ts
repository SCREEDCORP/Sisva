import {
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Input
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { takeUntil } from 'rxjs/operators';
import { Todo } from '../../../models/todo.model';
import { TodoService } from '../../../services/todo.service';
import { UserModel } from 'app/models/user.model';
import { id } from '@swimlane/ngx-charts/release/utils';
import { PatientService } from 'app/services/patient.service';
import { PatientUtil } from 'app/utils/patient.util';
import { RegistryUtil } from 'app/utils/registry.util';
import * as moment from 'moment';

@Component({
    selector: 'todo-list',
    templateUrl: './todo-list.component.html',
    styleUrls: ['./todo-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class TodoListComponent implements OnInit, OnDestroy {
    todos: Todo[];
    currentTodo: Todo;

    @Input()
    user: UserModel;

    public listAnemState = [];

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {TodoService} _todoService
     * @param {Location} _location
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _todoService: TodoService,
        private _location: Location,
        private _patientService: PatientService,
        private _patientUtil: PatientUtil,
        private _activateRoute: ActivatedRoute,
        private _registryUtil: RegistryUtil
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
        this.listAnemState = this._patientUtil.getAnemState();
        // Subscribe to update todos on changes
        this._todoService.onTodosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(todos => {
                this.todos = todos;
            });
        const loadUserInterval = setInterval(() => {
            const currentDay = this._registryUtil.getStringFromDate(moment());
            if (this.user.user_tasks.length > 0) {
                clearInterval(loadUserInterval);

                this._activateRoute.params.subscribe(param => {
                    if (param.filterHandle) {
                        let arrayFilterTask = [];

                        switch (param.filterHandle) {
                            case 'starred':
                                arrayFilterTask = this.user.user_tasks.filter(
                                    x => x.schedule_ejec === '1'
                                );
                                break;
                            case 'progess':
                                arrayFilterTask = this.user.user_tasks.filter(
                                    x => x.schedule_ejec === '2'
                                );
                                break;
                            case 'completed':
                                arrayFilterTask = this.user.user_tasks.filter(
                                    x => x.schedule_ejec === '3'
                                );
                                break;
                            case 'dueDate':
                                arrayFilterTask = this.user.user_tasks.filter(
                                    x =>
                                        x.schedule_date < currentDay &&
                                        x.schedule_ejec === '0'
                                );
                                break;
                            case 'today':
                                arrayFilterTask = this.user.user_tasks.filter(
                                    x => x.schedule_date === currentDay
                                );
                                break;
                            case 'deleted':
                                arrayFilterTask = this.user.user_tasks.filter(
                                    x => x.schedule_stat === '0'
                                );
                                break;
                        }

                        arrayFilterTask.forEach(element => {
                            const dataPatient = {
                                pat_id: element.pat_id
                            };
                            this._patientService
                                .postPatientDetailsBoard(dataPatient)
                                .subscribe(
                                    data => {
                                        if (data.res_service === 'ok') {
                                            if (data.data_result.Count > 0) {
                                                const patient =
                                                    data.data_result.Items[0];
                                                let vNroSeguimiento = '';
                                                switch (
                                                    element.schedule_order
                                                ) {
                                                    case '1':
                                                        vNroSeguimiento =
                                                            'Primer';
                                                        break;
                                                    case '2':
                                                        vNroSeguimiento =
                                                            'Segundo';
                                                        break;
                                                    case '3':
                                                        vNroSeguimiento =
                                                            'Tercer';
                                                        break;
                                                    case '4':
                                                        vNroSeguimiento =
                                                            'Cuarto';
                                                        break;
                                                    case '5':
                                                        vNroSeguimiento =
                                                            'Quinto';
                                                        break;
                                                    case '6':
                                                        vNroSeguimiento =
                                                            'Sexto';
                                                        break;
                                                }
                                                const todo = {
                                                    id: element.schedule_id,
                                                    title:
                                                        vNroSeguimiento +
                                                        ' seguimiento de ' +
                                                        patient.pat_basic_info
                                                            .pat_names +
                                                        ' ' +
                                                        patient.pat_basic_info
                                                            .pat_apo_ape_pat +
                                                        ' ' +
                                                        patient.pat_basic_info
                                                            .pat_ape_pat,
                                                    notes:
                                                        'Estado de anemia: ' +
                                                        patient.pat_medic_info
                                                            .pat_medic_state,
                                                    desc:
                                                        'Estado de paciente: ' +
                                                        this.listAnemState.find(
                                                            x =>
                                                                x.ane_option ===
                                                                patient
                                                                    .pat_medic_info
                                                                    .pat_ane_state
                                                        ).ane_desc,
                                                    startDate: element.fec_reg,
                                                    dueDate:
                                                        element.schedule_date,
                                                    task: element,
                                                    completed:
                                                        element.schedule_ejec ===
                                                        '3'
                                                            ? true
                                                            : false,
                                                    starred:
                                                        element.schedule_ejec ===
                                                        '1'
                                                            ? true
                                                            : false,
                                                    progress:
                                                        element.schedule_ejec ===
                                                        '2'
                                                            ? true
                                                            : false,
                                                    deleted:
                                                        element.schedule_stat ===
                                                        '0'
                                                            ? true
                                                            : false
                                                };
                                                this.todos.push(new Todo(todo));
                                            }
                                        }
                                    },
                                    error => {
                                        console.log(error);
                                    }
                                );
                        });
                    } else {
                        this.user.user_tasks.forEach(element => {
                            const dataPatient = {
                                pat_id: element.pat_id
                            };
                            this._patientService
                                .postPatientDetailsBoard(dataPatient)
                                .subscribe(
                                    data => {
                                        if (data.res_service === 'ok') {
                                            if (data.data_result.Count > 0) {
                                                const patient =
                                                    data.data_result.Items[0];
                                                let vNroSeguimiento = '';
                                                switch (
                                                    element.schedule_order
                                                ) {
                                                    case '1':
                                                        vNroSeguimiento =
                                                            'Primer';
                                                        break;
                                                    case '2':
                                                        vNroSeguimiento =
                                                            'Segundo';
                                                        break;
                                                    case '3':
                                                        vNroSeguimiento =
                                                            'Tercer';
                                                        break;
                                                    case '4':
                                                        vNroSeguimiento =
                                                            'Cuarto';
                                                        break;
                                                    case '5':
                                                        vNroSeguimiento =
                                                            'Quinto';
                                                        break;
                                                    case '6':
                                                        vNroSeguimiento =
                                                            'Sexto';
                                                        break;
                                                }
                                                const todo = {
                                                    id: element.schedule_id,
                                                    title:
                                                        vNroSeguimiento +
                                                        ' seguimiento de ' +
                                                        patient.pat_basic_info
                                                            .pat_names +
                                                        ' ' +
                                                        patient.pat_basic_info
                                                            .pat_apo_ape_pat +
                                                        ' ' +
                                                        patient.pat_basic_info
                                                            .pat_ape_pat,
                                                    notes:
                                                        'Estado de anemia: ' +
                                                        patient.pat_medic_info
                                                            .pat_medic_state,
                                                    desc:
                                                        'Estado de paciente: ' +
                                                        this.listAnemState.find(
                                                            x =>
                                                                x.ane_option ===
                                                                patient
                                                                    .pat_medic_info
                                                                    .pat_ane_state
                                                        ).ane_desc,
                                                    startDate: element.fec_reg,
                                                    dueDate:
                                                        element.schedule_date,
                                                    task: element,
                                                    completed:
                                                        element.schedule_ejec ===
                                                        '3'
                                                            ? true
                                                            : false,
                                                    starred:
                                                        element.schedule_ejec ===
                                                        '1'
                                                            ? true
                                                            : false,
                                                    progress:
                                                        element.schedule_ejec ===
                                                        '2'
                                                            ? true
                                                            : false,
                                                    deleted:
                                                        element.schedule_stat ===
                                                        '0'
                                                            ? true
                                                            : false
                                                };
                                                this.todos.push(new Todo(todo));
                                            }
                                        }
                                    },
                                    error => {
                                        console.log(error);
                                    }
                                );
                        });
                    }
                });
            }
        }, 1000);

        // Subscribe to update current todo on changes
        this._todoService.onCurrentTodoChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currentTodo => {
                if (!currentTodo) {
                    // Set the current todo id to null to deselect the current todo
                    this.currentTodo = null;

                    // Handle the location changes
                    const tagHandle = this._activatedRoute.snapshot.params
                            .tagHandle,
                        filterHandle = this._activatedRoute.snapshot.params
                            .filterHandle;

                    if (tagHandle) {
                        this._location.go('apps/todo/tag/' + tagHandle);
                    } else if (filterHandle) {
                        this._location.go('apps/todo/filter/' + filterHandle);
                    } else {
                        this._location.go('apps/todo/all');
                    }
                } else {
                    this.currentTodo = currentTodo;
                }
            });
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
     * Read todo
     *
     * @param todoId
     */
    readTodo(todoId): void {
        // Set current todo
        this._todoService.setCurrentTodo(todoId);
    }

    /**
     * On drop
     *
     * @param ev
     */
    onDrop(ev): void {}
}
