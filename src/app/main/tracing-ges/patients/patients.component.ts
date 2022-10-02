import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/internal/operators';
import { PatientsService } from '../../../services/patients.service';
import { PatientUtil } from 'app/utils/patient.util';

@Component({
    selector     : 'tracing-patients',
    templateUrl  : './patients.component.html',
    styleUrls    : ['./patients.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TracingPatientsComponent implements OnInit, OnDestroy
{
    dataSource: FilesDataSource | null;
    displayedColumns = ['pat_num_doc', 'pat_names', 'pat_familia', 'pat_sexo', 'pat_historia', 'pat_comunidad', 'pat_fec_nac', 'pat_schedule_trc', 'pat_active'];

    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild(MatSort)
    sort: MatSort;

    @ViewChild('filter')
    filter: ElementRef;

    public listAnemState = [];

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _patientsService: PatientsService,
        private _patientUtil: PatientUtil
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
        this.listAnemState = this._patientUtil.getAnemState();

        this.dataSource = new FilesDataSource(this._patientsService, this.paginator, this.sort);

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

    obtenerDescEstadoAnemia(value): any {        
        return this.listAnemState.find(x => x.ane_option === value).ane_desc;
    }
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    constructor(
        private _patientsService: PatientsService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    )
    {
        super();

        this.filteredData = this._patientsService.patients;
        console.log(this.filteredData);
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this._patientsService.onPatientChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                        let data = this._patientsService.patients.slice();

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
                case 'pat_num_doc':
                    [propertyA, propertyB] = [a.pat_num_doc, b.pat_num_doc];
                    break;
                case 'pat_names':
                    [propertyA, propertyB] = [a.pat_names, b.pat_names];
                    break;
                case 'pat_familia':
                    [propertyA, propertyB] = [a.pat_familia, b.pat_familia];
                    break;
                case 'pat_sexo':
                    [propertyA, propertyB] = [a.pat_sexo, b.pat_sexo];
                    break;
                case 'pat_fec_nac':
                    [propertyA, propertyB] = [a.pat_fec_nac, b.pat_fec_nac];
                    break;
                case 'pat_historia':
                    [propertyA, propertyB] = [a.pat_historia, b.pat_historia];
                    break;
                case 'pat_comunidad':
                    [propertyA, propertyB] = [a.pat_comunidad, b.pat_comunidad];
                    break;
                case 'pat_schedule_trc':
                    [propertyA, propertyB] = [a.pat_schedule_trc, b.pat_schedule_trc];
                    break;
                case 'pat_active':
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
