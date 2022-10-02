import { Component, OnDestroy, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { TodoService } from '../../../../services/todo.service';
import { UserModel } from 'app/models/user.model';

@Component({
    selector     : 'todo-main-sidebar',
    templateUrl  : './main-sidebar.component.html',
    styleUrls    : ['./main-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class TodoMainSidebarComponent implements OnInit, OnDestroy
{
    folders: any[];
    filters: any[];

    @Input()
    user: UserModel;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {TodoService} _todoService
     * @param {Router} _router
     */
    constructor(
        private _todoService: TodoService,
        private _router: Router
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._todoService.onFiltersChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(filters => {
                this.filters = filters;
            });
        // console.log(this.user);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * New todo
     */
    newTodo(): void
    {
        this._router.navigate(['/apps/todo/all']).then(() => {
            setTimeout(() => {
                this._todoService.onNewTodoClicked.next('');
            });
        });
    }
}
