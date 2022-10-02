import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';
import { UserModel } from 'app/models/user.model';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
    selector     : 'todo',
    templateUrl  : './todo.component.html',
    styleUrls    : ['./todo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class TodoComponent implements OnInit, OnDestroy
{
    hasSelectedTodos: boolean;
    isIndeterminate: boolean;
    filters: any[];
    tags: any[];
    searchInput: FormControl;
    currentTodo: Todo;

    public user: UserModel;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TodoService} _todoService
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private _todoService: TodoService,
        private _matSnackBar: MatSnackBar,
        private _router: Router
    )
    {
        // Set the defaults
        this.searchInput = new FormControl('');

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.user = new UserModel();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.loadUserInfo();
        
        this._todoService.onSelectedTodosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(selectedTodos => {
                setTimeout(() => {
                    this.hasSelectedTodos = selectedTodos.length > 0;
                    this.isIndeterminate = (selectedTodos.length !== this._todoService.todos.length && selectedTodos.length > 0);
                }, 0);
            });

        this._todoService.onFiltersChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(folders => {
                this.filters = this._todoService.filters;
            });

        this.searchInput.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(searchText => {
                this._todoService.onSearchTextChanged.next(searchText);
            });

        this._todoService.onCurrentTodoChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(([currentTodo, formType]) => {
                if ( !currentTodo )
                {
                    this.currentTodo = null;
                }
                else
                {
                    this.currentTodo = currentTodo;
                }
            });
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
     * Deselect current todo
     */
    deselectCurrentTodo(): void
    {
        this._todoService.onCurrentTodoChanged.next([null, null]);
    }

    /**
     * Toggle select all
     */
    toggleSelectAll(): void
    {
        this._todoService.toggleSelectAll();
    }

    /**
     * Select todos
     *
     * @param filterParameter
     * @param filterValue
     */
    selectTodos(filterParameter?, filterValue?): void
    {
        this._todoService.selectTodos(filterParameter, filterValue);
    }

    /**
     * Deselect todos
     */
    deselectTodos(): void
    {
        this._todoService.deselectTodos();
    }

    /**
     * Toggle tag on selected todos
     *
     * @param tagId
     */
    toggleTagOnSelectedTodos(tagId): void
    {
        this._todoService.toggleTagOnSelectedTodos(tagId);
    }

    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void
    {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    loadUserInfo(): void {
        try {
            const loadUserInterval = setInterval(() => {
                const userStr = sessionStorage.getItem('sisva_user_details_loged');
                this.user = new UserModel(JSON.parse(userStr));
                console.log(this.user);
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
        } catch (err) {
            this._matSnackBar.open('Toolbar - No se cargo correctamente la información.', 'Aceptar', {
                verticalPosition: 'top',
                duration: 2000
            });
        }
    }
}
