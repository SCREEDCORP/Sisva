import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnDestroy
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/internal/operators';
import { ActivationService } from 'app/services/activation.service';
import { UserService } from 'app/services/user.service';
import { RegistryUtil } from 'app/utils/registry.util';

@Component({
    selector: 'activation-list',
    templateUrl: './activation-list.component.html',
    styleUrls: ['./activation-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class UserActivationListComponent implements OnInit, OnDestroy {
    dataSource: FilesDataSource | null;

    displayedColumns = [
        'actv_names',
        'actv_mail',
        'actv_orgz_name',
        'actv_fec_reg',
        'actv_user_valid'
    ];

    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild(MatSort)
    sort: MatSort;

    @ViewChild('filter')
    filter: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(private _activationService: ActivationService, private _userService: UserService, private _registryUtil: RegistryUtil) {
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
        this.dataSource = new FilesDataSource(
            this._activationService,
            this.paginator,
            this.sort
        );

        this.dataSource.filteredData.forEach((element, index) => {
            const objUserDetails = {
                user_id: element.user_id
            };
            this._userService.postDetails(objUserDetails).subscribe(
                dataUser => {
                    if (dataUser.res_service === 'ok') {
                        if (dataUser.data_result.Count > 0) {
                            element['user_details'] = dataUser.data_result.Items[0];
                            this.dataSource.filteredData[index] = element;
                        }
                    }
                }
            );
        });

        console.log(this.dataSource.filteredData);

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe(() => {
                if (!this.dataSource) {
                    return;
                }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleActivation(event, activate_id): void {
        this.dataSource.filteredData.forEach((element, index) => {
            if (element.activate_id === activate_id) {
                if (event.checked) {
                    element.user_details.user_valid = '1';
                } else {
                    element.user_details.user_valid = '0';
                }
                this.dataSource.filteredData[index] = element;
                const objActivation = {
                    user_id: element.user_id,
                    user_valid: element.user_details.user_valid,
                    actv_data : {
                        fec_actv: this._registryUtil.getDateRegistry(),
                        usu_actv: this._userService.getUserLoged().user_id,
                        activate_id: activate_id,
                        user_valid: element.user_details.user_valid,
                    }                    
                };
                this._userService.patchActivateUser(objActivation).subscribe(
                    data => {
                        console.log(data);
                    }
                );
            }
        });
    }
}

export class FilesDataSource extends DataSource<any> {
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    constructor(
        private _activationService: ActivationService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    ) {
        super();

        this.filteredData = this._activationService.activations;
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
        const displayDataChanges = [
            this._activationService.onActivationChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges).pipe(
            map(() => {
                let data = this._activationService.activations.slice();

                data = this.filterData(data);

                this.filteredData = [...data];

                data = this.sortData(data);

                // Grab the page's slice of data.
                const startIndex =
                    this._matPaginator.pageIndex * this._matPaginator.pageSize;
                return data.splice(startIndex, this._matPaginator.pageSize);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any) {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string {
        return this._filterChange.value;
    }

    set filter(filter: string) {
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
    filterData(data): any {
        if (!this.filter) {
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
    sortData(data): any[] {
        if (!this._matSort.active || this._matSort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';
            switch (this._matSort.active) {
                case 'actv_names':
                    [propertyA, propertyB] = [a.actv_names, b.actv_names];
                    break;
                case 'actv_mail':
                    [propertyA, propertyB] = [a.actv_mail, b.actv_mail];
                    break;
                case 'actv_orgz_name':
                    [propertyA, propertyB] = [a.actv_orgz_name, b.actv_orgz_name];
                    break;
                case 'actv_fec_reg':
                    [propertyA, propertyB] = [a.actv_fec_reg, b.actv_fec_reg];
                    break;
                case 'actv_user_valid':
                    [propertyA, propertyB] = [a.actv_user_valid, b.pactv_user_validat_fec_nac];
                    break;
            }
            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (
                (valueA < valueB ? -1 : 1) *
                (this._matSort.direction === 'asc' ? 1 : -1)
            );
        });
    }

    /**
     * Disconnect
     */
    disconnect(): void { }
}
