import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/internal/operators';
import { UsersService } from 'app/services/users.service';

@Component({
    selector     : 'tasks',
    templateUrl  : './tasks.component.html',
    styleUrls    : ['./tasks.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TasksComponent implements OnInit, OnDestroy
{
    dataSource: FilesDataSource | null;
    displayedColumns = ['user_num_doc', 'user_names', 'user_ape_pat', 'user_mail', 'user_occupation_desc', 'user_red_sal', 'user_tasks', 'user_valid', 'stat_reg'];

    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild(MatSort)
    sort: MatSort;

    @ViewChild('filter')
    filter: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(        
        private _userService: UsersService
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
        this.dataSource = new FilesDataSource(this._userService, this.paginator, this.sort);

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe(() => {
                if ( !this.dataSource )
                {
                    return;
                }                
                this.dataSource.filter = this.filter.nativeElement.value;                
            });
    }
    
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    constructor(
        private _userService: UsersService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    )
    {
        super();
        this.filteredData = this._userService.users;   
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this._userService.onUserChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                        let data = this._userService.users.slice();
                        data = this.filterData(data);
                        this.filteredData = [...data];
                        data = this.sortData(data);
                        // Grab the page's slice of data.
                        const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                        return data.splice(startIndex, this._matPaginator.pageSize);
                    }
                ));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any
    {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any)
    {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string
    {
        return this._filterChange.value;
    }

    set filter(filter: string)
    {
        this._filterChange.next(filter);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter data
     *
     * @param data
     * @returns {any}
     */
    filterData(data): any
    {
        if ( !this.filter )
        {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[]
    {
        if ( !this._matSort.active || this._matSort.direction === '' )
        {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';      
        
            switch (this._matSort.active) {
                case 'user_num_doc':
                    [propertyA, propertyB] = [a.user_num_doc, b.user_num_doc];
                    break;
                case 'user_names':
                    [propertyA, propertyB] = [a.user_names, b.user_names];
                    break;
                case 'user_ape_pat':
                    [propertyA, propertyB] = [a.user_ape_pat, b.user_ape_pat];
                    break;
                case 'user_mail':
                    [propertyA, propertyB] = [a.user_mail, b.user_mail];
                    break;
                case 'user_occupation_desc':
                    [propertyA, propertyB] = [a.user_occupation_desc, b.user_occupation_desc];
                    break;
                case 'user_red_sal':
                    [propertyA, propertyB] = [a.user_red_sal, b.user_red_sal];
                    break;
                case 'user_tasks':
                    [propertyA, propertyB] = [a.user_tasks, b.user_tasks];
                    break;
                case 'user_valid':
                    [propertyA, propertyB] = [a.user_valid, b.user_valid];
                    break;
                case 'stat_reg':
                    [propertyA, propertyB] = [a.stat_reg, b.stat_reg];
                    break;
            }      

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }

    /**
     * Disconnect
     */
    disconnect(): void
    {
    }
}
