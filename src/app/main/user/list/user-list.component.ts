import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/internal/operators';
import { UsersService } from 'app/services/users.service';
import { UserModalComponent } from 'app/main/modals/user/user-modal.component';

@Component({
    selector     : 'user-list',
    templateUrl  : './user-list.component.html',
    styleUrls    : ['./user-list.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class UserListComponent implements OnInit, OnDestroy
{
    dataSource: FilesDataSource | null;
    displayedColumns = ['user_num_doc', 'user_names', 'user_ape_pat', 'user_ape_mat', 'user_mail', 'user_occupation_desc', 'user_mic_red', 'user_valid'];

    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild(MatSort)
    sort: MatSort;

    @ViewChild('filter')
    filter: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _UsersService: UsersService,
        public dialog: MatDialog
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
        this.dataSource = new FilesDataSource(this._UsersService, this.paginator, this.sort);

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

    showUserDetails(user_id): void {
        const dialogRef = this.dialog.open(UserModalComponent, {
            data: {
                user_id: user_id
            }
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    constructor(
        private _UsersService: UsersService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    )
    {
        super();
        this.filteredData = this._UsersService.users;            
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this._UsersService.onUserChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                        let data = this._UsersService.users.slice();

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
                    [propertyA, propertyB] = [a.pat_num_doc, b.pat_num_doc];
                    break;
                case 'user_names':
                    [propertyA, propertyB] = [a.pat_names, b.pat_names];
                    break;
                case 'user_ape_pat':
                    [propertyA, propertyB] = [a.pat_familia, b.pat_familia];
                    break;
                case 'user_ape_mat':
                    [propertyA, propertyB] = [a.pat_sexo, b.pat_sexo];
                    break;
                case 'user_mail':
                    [propertyA, propertyB] = [a.pat_fec_nac, b.pat_fec_nac];
                    break;
                case 'user_occupation_desc':
                    [propertyA, propertyB] = [a.pat_historia, b.pat_historia];
                    break;
                case 'user_mic_red':
                    [propertyA, propertyB] = [a.pat_comunidad, b.pat_comunidad];
                    break;
                case 'user_valid':
                    [propertyA, propertyB] = [a.pat_active, b.pat_active];
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
