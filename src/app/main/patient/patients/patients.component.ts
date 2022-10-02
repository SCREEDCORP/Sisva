import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatMenuTrigger } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { takeUntil } from 'rxjs/internal/operators';
import { PatientsService } from '../../../services/patients.service';
import { PatientUtil } from 'app/utils/patient.util';
import { RegistryUtil } from 'app/utils/registry.util';
import { ExcelUtil } from 'app/utils/excel.util';

@Component({
    selector: 'patients',
    templateUrl: './patients.component.html',
    styleUrls: ['./patients.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PatientsComponent implements OnInit, OnDestroy {
    dataSource: FilesDataSource | null;
    displayedColumns = ['pat_num_doc', 'pat_names', 'pat_familia', 'pat_sexo', 'pat_fec_nac', 'pat_historia', 'pat_comunidad', 'pat_state', 'pat_active'];

    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild(MatSort)
    sort: MatSort;

    @ViewChild('filter')
    filter: ElementRef;

    @ViewChild('contextMenu')
    contextMenu: MatMenuTrigger;

    items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
    ];

    contextMenuPosition = { x: '0px', y: '0px' };

    // Private
    private _unsubscribeAll: Subject<any>;

    public listTipDocument = [];
    public listSex = [];
    public listProdAdm = [];
    public listWeight = [];
    public listAnemState = [];

    constructor(
        private _patientsService: PatientsService,
        private _patientUtil: PatientUtil,
        private _registryUtil: RegistryUtil,
        private _excelUtil: ExcelUtil
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

        this.listProdAdm = this._patientUtil.getProductAdm().filter(x => x.type === 'ane');
        this.listWeight = this._patientUtil.getWeight();
        this.listAnemState = this._patientUtil.getAnemState();
        this.listTipDocument = this._registryUtil.getTiposDocumento();
        this.listSex = this._registryUtil.getSexos();

        this.dataSource = new FilesDataSource(this._patientsService, this.paginator, this.sort);

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

    onContextMenu(event: MouseEvent, item: Item): void {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'item': item };
        this.contextMenu.openMenu();
    }

    onContextMenuAction1(item: Item): void {
        alert(`Click on Action 1 for ${item.name}`);
    }

    onContextMenuAction2(item: Item): void {
        alert(`Click on Action 2 for ${item.name}`);
    }

    exportToExcel(): void {
        const dataExport = [];
        this.dataSource.filteredData.forEach((element) => {                   
            dataExport.push(
                {
                    patientId: element.pat_id,
                    
                    patientNames: element.pat_basic_info.pat_names,
                    patientApePat: element.pat_basic_info.pat_ape_pat,
                    patientApeMat: element.pat_basic_info.pat_ape_mat,
                    patientTipDoc: this.listTipDocument.find(x => x.tip_doc_id == element.pat_basic_info.pat_document.pat_tip_doc_id).tip_doc_name,
                    patientNumDoc: element.pat_basic_info.pat_document.pat_num_doc,                    
                    patientTipSex: this.listSex.find(x => x.sex_id == element.pat_basic_info.pat_sexo_id).sex_desc,

                    patientDire: element.pat_geoloc_info.pat_dire,
                    patientUbgDst: element.pat_geoloc_info.pat_ubigeo.ubg_dst,
                    patientUbgPrv: element.pat_geoloc_info.pat_ubigeo.ubg_prv,
                    patientUbgDpt: element.pat_geoloc_info.pat_ubigeo.ubg_dpt,
                    patientGeoLat: element.pat_geoloc_info.pat_latitude,
                    patientGeoLng: element.pat_geoloc_info.pat_longitude,
                    patientGeoAlt: element.pat_geoloc_info.pat_elevation,

                    patientMedHem: element.pat_medic_info.pat_hem,
                    patientMedHcd: element.pat_medic_info.pat_hcd,
                    patientMedHsd: element.pat_medic_info.pat_hsd,
                    patientMedHisCli: element.pat_medic_info.pat_his_cli,
                    patientMedEstacionSal: element.pat_medic_info.pat_est_salud,
                    patientMedEstMed: element.pat_medic_info.pat_medic_state,
                    patientMedEstAne: this.listAnemState.find(x => x.ane_option == element.pat_medic_info.pat_ane_state).ane_desc,                     
                    patientMedMedAdm: this.listProdAdm.find(x => x.pat_adm_id == element.pat_medic_info.pat_adm).pat_adm_desc, 
                    patientMedNumMue: element.pat_medic_info.pat_num_mue,
                    patientMedFecMue: element.pat_medic_info.pat_fec_mue,
                    patientMedCondIni: this.listWeight.find(x => x.pat_weight_id == element.pat_medic_info.pat_weight).pat_weight_desc,

                    patientApoNames: element.pat_basic_info.pat_apo_names,
                    patientApoApePat: element.pat_basic_info.pat_apo_ape_pat,
                    patientApoApeMat: element.pat_basic_info.pat_apo_ape_mat,
                    patientApoPhone: element.pat_basic_info.pat_apo_phone,
                    patientApoTipDoc: element.pat_basic_info.pat_apo_document.pat_apo_num_doc,
                    patientApoNumDoc: element.pat_basic_info.pat_apo_document.pat_apo_tip_doc,                    

                    fecReg: element.pat_fec_reg,
                    usuReg: element.pat_usu_reg
                }
            );
        });
        this._excelUtil.exportExcel(dataExport, 'reporte_padron_nominal_anemia.xlsx');
    }
}

export interface Item {
    id: number;
    name: string;
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    constructor(
        private _patientsService: PatientsService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    ) {
        super();

        this.filteredData = this._patientsService.patients;
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
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
                // case 'pat_id':
                //     [propertyA, propertyB] = [a.pat_id, b.pat_id];
                //     break;
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
                case 'pat_state':
                    [propertyA, propertyB] = [a.pat_state, b.pat_state];
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
    disconnect(): void {
    }
}
