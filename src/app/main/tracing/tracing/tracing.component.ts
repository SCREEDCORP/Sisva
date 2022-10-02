import {
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MAT_DATE_FORMATS, MatStepper } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { Router } from '@angular/router';
import { RegistryUtil } from 'app/utils/registry.util';
import * as moment from 'moment';
import { NgxNavigationWithDataComponent } from 'ngx-navigation-with-data';
import { UserService } from 'app/services/user.service';
import { PatientUtil } from 'app/utils/patient.util';
import { ExcelUtil } from 'app/utils/excel.util';

export const MY_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD'
    },
    display: {
        dateInput: 'YYYY-MM-DD'
    }
};

@Component({
    selector: 'tracing-patient',
    templateUrl: './tracing.component.html',
    styleUrls: ['./tracing.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class TracingPatientComponent implements OnInit, OnDestroy {
    @ViewChild('stepper') stepper: MatStepper;

    patient: Patient;
    pageType: string;
    public maxDateFecNac = new Date();
    patientForm: FormGroup;

    resumeForm: FormGroup;
    // tracingForm: FormGroup;

    public currentTracing = {
        schedule_ejec: '1',
        schedule_order: '1',
        schedule_trc_data: {}
    };

    public currentTracingUpdate: any;

    public currentTracingText = '';

    public listProductAdm = [];
    public listWeight = [];
    public listAnemState = [];

    public stepperEditable = true;
    public loading = false;

    public arrayTracing = [];

    public tracing1Form: FormGroup;
    public tracing2Form: FormGroup;
    public tracing3Form: FormGroup;
    public tracing4Form: FormGroup;
    public tracing5Form: FormGroup;
    public tracing6Form: FormGroup;

    public showTracing1Form = false;
    public showTracing2Form = false;
    public showTracing3Form = false;
    public showTracing4Form = false;
    public showTracing5Form = false;
    public showTracing6Form = false;

    public roleAdminReadonly = false;

    public pat_hcd = 0;

    // Private
    private _unsubscribeAll: Subject<any>;
    /**
     * Constructor
     *
     * @param {EcommerceProductService} _ecommerceProductService
     * @param {FormBuilder} _formBuilder
     * @param {MatSnackBar} _matSnackBar
     */
    constructor(
        private _patientService: PatientService,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _registryUtil: RegistryUtil,
        public _navCtrl: NgxNavigationWithDataComponent,
        private _userService: UserService,
        private _patientUtil: PatientUtil,
        private _excelUtil: ExcelUtil
    ) {
        // Set the default
        this.patient = new Patient();

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
        
        this.listWeight = this._patientUtil.getWeight();
        this.listAnemState = this._patientUtil.getAnemState();
        console.log(this.listAnemState);
        // Subscribe to update product on changes
        this._patientService.onProductChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(patient => {
                if (patient) {
                    this.patient = new Patient(patient);
                    this.pageType = this.patient.pageType;
                    this.arrayTracing = this.patient.pat_schedule_tracing_data;

                    let currentTracing: any;

                    for (let index = 0; index < this.arrayTracing.length; index++) {
                        const element = this.arrayTracing[index];                        
                        if (element.schedule_ejec === '0') {
                            currentTracing = this.arrayTracing[index];
                            break;
                        }
                    }
                    
                    for (let index = this.arrayTracing.length - 1; index >= 0; index--) {
                        const element = this.arrayTracing[index];
                        if (element.schedule_ejec === '1') {
                            if (element.schedule_order === '1' || element.schedule_order === '3' || element.schedule_order === '6') {
                                this.currentTracingUpdate = element;
                                break;
                            }
                        }
                    }

                    this.pat_hcd = Number(this.patient.pat_medic_info.pat_hcd);

                    if (currentTracing != null) {
                        this.currentTracing = currentTracing;
                    }

                    this.resumeForm = this.createResumeForm();
                    if (this.pageType === 'new') {
                        this.loadCurrentTracingText();
                        this.createCurrentTracingForm();
                        this.calculateEdadPatientInit(
                            moment(this.patient.pat_basic_info.pat_fec_nac)
                        );
                    } else {
                        this.createFormsDetaulf();
                        this.loadTracing();
                    }
                }
                this.listProductAdm = this._patientUtil.getProductAdm().filter(x => x.type === 'ane');
                this.patientForm = this.createPatientForm();
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
    createFormsDetaulf(): void {
        this.tracing1Form = this._formBuilder.group({});
        this.tracing2Form = this._formBuilder.group({});
        this.tracing3Form = this._formBuilder.group({});
        this.tracing4Form = this._formBuilder.group({});
        this.tracing5Form = this._formBuilder.group({});
        this.tracing6Form = this._formBuilder.group({});
    }

    loadCurrentTracingText(): void {
        switch (this.currentTracing.schedule_order) {
            case '1':
                this.currentTracingText = 'primer';
                break;
            case '2':
                this.currentTracingText = 'segundo';
                break;
            case '3':
                this.currentTracingText = 'tercer';
                break;
            case '4':
                this.currentTracingText = 'cuarto';
                break;
            case '5':
                this.currentTracingText = 'quinto';
                break;
            case '6':
                this.currentTracingText = 'sexto';
                break;
        }
    }

    loadTracing(): void {
        this.arrayTracing.forEach(element => {
            switch (element.schedule_order) {
                case '1':
                    if (element.schedule_ejec == '1') {
                        this.tracing1Form = this.createTraingForm(element);
                        this.showTracing1Form = true;
                    }
                    break;
                case '2':
                    if (element.schedule_ejec == '1') {
                        this.tracing2Form = this.createTraingForm(element);
                        this.showTracing2Form = true;
                    }
                    break;
                case '3':
                    if (element.schedule_ejec == '1') {
                        this.tracing3Form = this.createTraingForm(element);
                        this.showTracing3Form = true;
                    }
                    break;
                case '4':
                    if (element.schedule_ejec == '1') {
                        this.tracing4Form = this.createTraingForm(element);
                        this.showTracing4Form = true;
                    }
                    break;
                case '5':
                    if (element.schedule_ejec == '1') {
                        this.tracing5Form = this.createTraingForm(element);
                        this.showTracing5Form = true;
                    }
                    break;
                case '6':
                    if (element.schedule_ejec == '1') {
                        this.tracing6Form = this.createTraingForm(element);
                        this.showTracing6Form = true;
                    }
                    break;
            }
        });
    }

    createTraingForm(tracing): FormGroup {
        let trc_num_mue: string;
        let trc_fec_mue: string;
        let trc_hsd: string;
        let trc_hcd: string;

        let trc_ane_state: string;
        let trc_pat_est_salud: string;
        let trc_pat_weight: string;
        let tr_pat_his_cli: string;

        if (tracing.schedule_trc_data.trc_num_mue) {
            trc_num_mue = tracing.schedule_trc_data.trc_num_mue;
        } else {
            trc_num_mue = '';
        }
        if (tracing.schedule_trc_data.trc_fec_mue) {
            trc_fec_mue = tracing.schedule_trc_data.trc_fec_mue;
        } else {
            trc_fec_mue = '';
        }

        if (tracing.schedule_trc_data.trc_hsd) {
            trc_hsd = tracing.schedule_trc_data.trc_hsd;
        } else {
            trc_hsd = '';
        }

        if (tracing.schedule_trc_data.trc_hcd) {
            trc_hcd = tracing.schedule_trc_data.trc_hcd;
        } else {
            trc_hcd = '';
        }

        if (tracing.schedule_trc_data.trc_ane_state) {
            trc_ane_state = tracing.schedule_trc_data.trc_ane_state;
        } else {
            trc_ane_state = '';
        }

        if (tracing.schedule_trc_data.trc_pat_est_salud) {
            trc_pat_est_salud = tracing.schedule_trc_data.trc_pat_est_salud;
        } else {
            trc_pat_est_salud = '';
        }

        if (tracing.schedule_trc_data.trc_pat_weight) {
            trc_pat_weight = tracing.schedule_trc_data.trc_pat_weight;
        } else {
            trc_pat_weight = '';
        }

        if (tracing.schedule_trc_data.tr_pat_his_cli) {
            tr_pat_his_cli = tracing.schedule_trc_data.tr_pat_his_cli;
        } else {
            tr_pat_his_cli = '';
        }

        return this._formBuilder.group({
            trc_fec_ini_trt: [tracing.schedule_trc_data.trc_fec_ini_trt],
            trc_next_tracing: [
                {
                    value: tracing.schedule_trc_data.trc_next_tracing,
                    disabled: this.roleAdminReadonly
                }
            ],

            trc_hem: [tracing.schedule_trc_data.trc_hem],
            trc_med_id: [
                {
                    value: tracing.schedule_trc_data.trc_med_id,
                    disabled: this.roleAdminReadonly
                }
            ],

            trc_obvs: [tracing.schedule_trc_data.trc_obvs],
            trc_state: [tracing.schedule_trc_data.trc_state],

            trc_tol_trt: [
                {
                    value: tracing.schedule_trc_data.trc_tol_trt,
                    disabled: this.roleAdminReadonly
                }
            ],
            trc_vst_med: [
                {
                    value: tracing.schedule_trc_data.trc_vst_med,
                    disabled: this.roleAdminReadonly
                }
            ],

            trc_num_mue: [trc_num_mue],
            trc_fec_mue: [
                { value: trc_fec_mue, disabled: this.roleAdminReadonly }
            ],
            trc_hsd: [trc_hsd],
            trc_hcd: [trc_hcd],

            trc_est_ate: [tracing.schedule_trc_data.trc_est_ate],
            fec_reg: [tracing.schedule_trc_data.fec_reg],
            usu_reg: [tracing.schedule_trc_data.usu_reg],
            trc_id: [tracing.trc_id],
            trc_order: [Number(tracing.schedule_order)],
            trc_fec_fin_fin: [
                {
                    value: tracing.schedule_trc_data.trc_fec_fin_trt,
                    disabled: this.roleAdminReadonly
                }
            ],

            trc_ane_state: [trc_ane_state],
            trc_pat_weight: [trc_pat_weight],

            trc_pat_est_salud: [trc_pat_est_salud],            
            tr_pat_his_cli: [tr_pat_his_cli]
        });
    }

    createResumeForm(): FormGroup {
        return this._formBuilder.group({
            pat_id: [this.patient.pat_id],
            pat_names: [this.patient.pat_basic_info.pat_names],
            pat_ape_pat: [this.patient.pat_basic_info.pat_ape_pat],
            pat_ape_mat: [this.patient.pat_basic_info.pat_ape_mat],
            pat_fec_nac: [this.patient.pat_basic_info.pat_fec_nac],
            pat_edad: [''],
            pat_sexo: [
                this._registryUtil
                    .getSexos()
                    .find(
                        x =>
                            x.sex_id === this.patient.pat_basic_info.pat_sexo_id
                    ).sex_desc
            ],
            pat_tip_doc: [
                this._registryUtil
                    .getTiposDocumento()
                    .find(
                        x =>
                            x.tip_doc_id ===
                            this.patient.pat_basic_info.pat_document
                                .pat_tip_doc_id
                    ).tip_doc_desc
            ],
            pat_num_doc: [this.patient.pat_basic_info.pat_document.pat_num_doc],
            pat_num_mue: [this.patient.pat_medic_info.pat_num_mue],
            pat_his_cli: [this.patient.pat_medic_info.pat_his_cli],
            pat_est_salud: [this.patient.pat_medic_info.pat_est_salud],
            pat_hem_wo_dsct: [this.patient.pat_medic_info.pat_hsd],
            pat_hem_wi_dsct: [this.patient.pat_medic_info.pat_hcd],
            pat_ubg_dst: [this.patient.pat_geoloc_info.pat_dst_name],
            pat_latitude: [this.patient.pat_geoloc_info.pat_latitude],
            pat_longitude: [this.patient.pat_geoloc_info.pat_longitude],
            pat_elevation: [this.patient.pat_geoloc_info.pat_elevation],
            pat_dire: [this.patient.pat_geoloc_info.pat_dire]
        });
    }

    createCurrentTracingForm(): void {
        try {
            switch (this.currentTracing.schedule_order) {
                case '1':
                    this.tracing1Form = this._formBuilder.group({
                        trc_fec_ini_trt: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().format('YYYY-MM-DD')
                                : this.patient.pat_medic_info.pat_fec_ini_trt,
                            Validators.required
                        ],
                        trc_next_tracing: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().add(30, 'days')
                                : moment(
                                      this.patient.pat_medic_info
                                          .pat_fec_ini_trt
                                  ).add(30, 'days'),
                            Validators.required
                        ],
                        trc_num_mue: ['2', Validators.required],
                        trc_fec_mue: ['', Validators.required],
                        trc_hem: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_hsd: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_med_id: ['', Validators.required],
                        trc_hcd: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_state: ['', Validators.required],
                        trc_obvs: ['']
                    });
                    break;
                case '2':
                    this.tracing2Form = this._formBuilder.group({
                        trc_fec_ini_trt: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().format('YYYY-MM-DD')
                                : this.patient.pat_medic_info.pat_fec_ini_trt,
                            Validators.required
                        ],
                        trc_next_tracing: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().add(60, 'days')
                                : moment(
                                      this.patient.pat_medic_info
                                          .pat_fec_ini_trt
                                  ).add(60, 'days'),
                            Validators.required
                        ],
                        trc_med_id: ['', Validators.required],
                        trc_tol_trt: [false, Validators.required],
                        trc_vst_med: [false, Validators.required],
                        trc_obvs: ['']
                    });
                    break;
                case '3':
                    this.tracing3Form = this._formBuilder.group({
                        trc_fec_ini_trt: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().format('YYYY-MM-DD')
                                : this.patient.pat_medic_info.pat_fec_ini_trt,
                            Validators.required
                        ],
                        trc_next_tracing: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().add(90, 'days')
                                : moment(
                                      this.patient.pat_medic_info
                                          .pat_fec_ini_trt
                                  ).add(90, 'days'),
                            Validators.required
                        ],
                        trc_num_mue: ['3', Validators.required],
                        trc_fec_mue: ['', Validators.required],
                        trc_hem: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_hsd: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_med_id: ['', Validators.required],
                        trc_hcd: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_tol_trt: [false, Validators.required],
                        trc_vst_med: [false, Validators.required],
                        trc_state: ['', Validators.required],
                        trc_ane_state: ['', Validators.required],
                        trc_obvs: ['']
                    });
                    break;
                case '4':
                    this.tracing4Form = this._formBuilder.group({
                        trc_fec_ini_trt: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().format('YYYY-MM-DD')
                                : this.patient.pat_medic_info.pat_fec_ini_trt,
                            Validators.required
                        ],
                        trc_next_tracing: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().add(120, 'days')
                                : moment(
                                      this.patient.pat_medic_info
                                          .pat_fec_ini_trt
                                  ).add(120, 'days'),
                            Validators.required
                        ],
                        trc_med_id: ['', Validators.required],
                        trc_tol_trt: [false, Validators.required],
                        trc_vst_med: [false, Validators.required],
                        trc_obvs: ['']
                    });
                    break;
                case '5':
                    this.tracing5Form = this._formBuilder.group({
                        trc_fec_ini_trt: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().format('YYYY-MM-DD')
                                : this.patient.pat_medic_info.pat_fec_ini_trt,
                            Validators.required
                        ],
                        trc_next_tracing: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().add(150, 'days')
                                : moment(
                                      this.patient.pat_medic_info
                                          .pat_fec_ini_trt
                                  ).add(150, 'days'),
                            Validators.required
                        ],
                        trc_med_id: ['', Validators.required],
                        trc_tol_trt: [false, Validators.required],
                        trc_vst_med: [false, Validators.required],
                        trc_obvs: ['']
                    });
                    break;
                case '6':
                    this.tracing6Form = this._formBuilder.group({
                        trc_fec_ini_trt: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().format('YYYY-MM-DD')
                                : this.patient.pat_medic_info.pat_fec_ini_trt,
                            Validators.required
                        ],
                        trc_fec_fin_trt: [
                            this.patient.pat_medic_info.pat_fec_ini_trt === ' '
                                ? moment().add(180, 'days')
                                : moment(
                                      this.patient.pat_medic_info
                                          .pat_fec_ini_trt
                                  ).add(180, 'days'),
                            Validators.required
                        ],
                        trc_num_mue: ['4', Validators.required],
                        trc_fec_mue: ['', Validators.required],
                        trc_hem: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_hsd: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_med_id: ['', Validators.required],
                        trc_hcd: [
                            '',
                            [
                                Validators.required,
                                Validators.pattern('^[0-9.]*$')
                            ]
                        ],
                        trc_est_ate: [
                            this.patient.pat_medic_info.pat_est_salud,
                            Validators.required
                        ],
                        trc_state: ['', Validators.required],
                        trc_ane_state: ['', Validators.required],
                        trc_obvs: ['']
                    });
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    calculateEdadPatientInit(value): void {
        let format = '';
        const currentDate = moment();
        const fecNacDate = moment(value._i);
        const years = currentDate.diff(fecNacDate, 'years');
        fecNacDate.add(years, 'years');
        const months = currentDate.diff(fecNacDate, 'months');
        fecNacDate.add(months, 'months');
        const days = currentDate.diff(fecNacDate, 'days');
        format = years + ' años ' + months + ' meses y ' + days + ' días.';
        this.resumeForm.controls['pat_edad'].setValue(format);
    }

    exportToExcel(): void {
        const dataExport = [];
        this.arrayTracing.forEach((element) => {   
            console.log(element);                
            dataExport.push(
                {
                    tratId: element.schedule_id,
                    tratPrgFec: element.schedule_date,
                    tratPrgEjec: element.schedule_ejec,
                    tratPrgOrd: element.schedule_order,
                    tratDatFecIni: element.schedule_trc_data != null ? element.schedule_trc_data.trc_fec_ini_trt : ' ',
                    tratDatHem: element.schedule_trc_data != null ? element.schedule_trc_data.trc_hem : ' ',
                    tratDatHsd: element.schedule_trc_data != null ? element.schedule_trc_data.trc_hsd : ' ',
                    tratDatHcd: element.schedule_trc_data != null ? element.schedule_trc_data.trc_hcd : ' ',
                    tratDatHisCli: element.schedule_trc_data != null ? element.schedule_trc_data.tr_pat_his_cli : ' ',
                    tratDatAneEst: element.schedule_trc_data != null && element.schedule_trc_data.trc_ane_state != null ? 
                        this.listAnemState.find(x => x.ane_option == element.schedule_trc_data.trc_ane_state).ane_desc : ' ',
                    tratDatMedEst: element.schedule_trc_data != null ? element.schedule_trc_data.trc_state : ' ',
                    tratDatMedAdm: element.schedule_trc_data != null ? this.listProductAdm.find(x => x.pat_adm_id == element.schedule_trc_data.trc_med_id).pat_adm_desc : ' ',
                    tratDatObvs: element.schedule_trc_data != null ? element.schedule_trc_data.trc_obvs : ' ',
                    tratDatEstSal: element.schedule_trc_data != null ? element.schedule_trc_data.trc_pat_est_salud : ' ',
                    tratDatMedConIni: element.schedule_trc_data != null &&  element.schedule_trc_data.trc_pat_weight != null ? 
                        this.listWeight.find(x => x.pat_weight_id == element.schedule_trc_data.trc_pat_weight).pat_weight_desc : ' ',
                    tratDatNextPrg: element.schedule_trc_data != null ? element.schedule_trc_data.trc_next_tracing : ' ',
                    tratDatNumMue: element.schedule_trc_data != null ? element.schedule_trc_data.trc_num_mue : ' ',
                    tratDatFecMue: element.schedule_trc_data != null ? element.schedule_trc_data.trc_fec_mue : ' ',
                    tratDatFecReg: element.schedule_trc_data != null ? element.schedule_trc_data.fec_reg : ' ',
                    tratDatUsuReg: element.schedule_trc_data != null ? element.schedule_trc_data.usu_reg : ' ',
                }
            );
        });
        this._excelUtil.exportExcel(dataExport, 'reporte_tratamientos_paciente.xlsx');
    }

    calculateHCD(event, tracingForm): void {
        console.log(tracingForm);
        let HCD;
        if (this.pageType == 'edit') {
            if (this.resumeForm.value.pat_elevation >= 1000) {
                const alt =
                    (Number.parseFloat(this.resumeForm.value.pat_elevation) /
                        1000) *
                    3.3;
                const ajuste = -0.032 * alt + 0.022 * (alt * alt);
                HCD =
                    Math.round(
                        (Number.parseFloat(event.target.value) - ajuste) * 100
                    ) / 100;
                switch (tracingForm.trc_order) {
                    case 1:
                        this.tracing1Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 2:
                        this.tracing2Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 3:
                        this.tracing3Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 4:
                        this.tracing4Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 5:
                        this.tracing5Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 6:
                        this.tracing6Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                }
            } else {
                HCD = event.target.value.toString();
                switch (tracingForm.trc_order) {
                    case 1:
                        this.tracing1Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 2:
                        this.tracing2Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 3:
                        this.tracing3Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 4:
                        this.tracing4Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 5:
                        this.tracing5Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case 6:
                        this.tracing6Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                }
            }
            this.calculateStatePatient(HCD, tracingForm.trc_order);
        } else {
            this.clearWhiteSpacesMedicForm(event);
            if (this.resumeForm.value.pat_elevation >= 1000) {
                const alt =
                    (Number.parseFloat(this.resumeForm.value.pat_elevation) /
                        1000) *
                    3.3;
                const ajuste = -0.032 * alt + 0.022 * (alt * alt);
                HCD =
                    Math.round(
                        (Number.parseFloat(event.target.value) - ajuste) * 100
                    ) / 100;

                switch (this.currentTracing.schedule_order) {
                    case '1':
                        this.tracing1Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case '2':
                        this.tracing2Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case '3':
                        this.tracing3Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case '4':
                        this.tracing4Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case '5':
                        this.tracing5Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                    case '6':
                        this.tracing6Form.controls['trc_hcd'].setValue(
                            HCD.toString()
                        );
                        break;
                }
            } else {
                HCD = event.target.value.toString();
                switch (this.currentTracing.schedule_order) {
                    case '1':
                        this.tracing1Form.controls['trc_hcd'].setValue(
                            event.target.value.toString()
                        );
                        break;
                    case '2':
                        this.tracing2Form.controls['trc_hcd'].setValue(
                            event.target.value.toString()
                        );
                        break;
                    case '3':
                        this.tracing3Form.controls['trc_hcd'].setValue(
                            event.target.value.toString()
                        );
                        break;
                    case '4':
                        this.tracing4Form.controls['trc_hcd'].setValue(
                            event.target.value.toString()
                        );
                        break;
                    case '5':
                        this.tracing5Form.controls['trc_hcd'].setValue(
                            event.target.value.toString()
                        );
                        break;
                    case '6':
                        this.tracing6Form.controls['trc_hcd'].setValue(
                            event.target.value.toString()
                        );
                        break;
                }
            }
            this.calculateStatePatient(HCD, '0');
        }
    }

    clearWhiteSpacesMedicForm(event): void {
        const clearText = event.target.value.trim();
        switch (this.currentTracing.schedule_order) {
            case '1':
                this.tracing1Form.controls[event.target.id].setValue(clearText);
                break;
            case '2':
                this.tracing2Form.controls[event.target.id].setValue(clearText);
                break;
            case '3':
                this.tracing3Form.controls[event.target.id].setValue(clearText);
                break;
            case '4':
                this.tracing4Form.controls[event.target.id].setValue(clearText);
                break;
            case '5':
                this.tracing5Form.controls[event.target.id].setValue(clearText);
                break;
            case '6':
                this.tracing6Form.controls[event.target.id].setValue(clearText);
                break;
        }
    }

    validateHSD(value, tracingForm): void {
        console.log(value);
        if (this.pageType == 'edit') {
            if (tracingForm.trc_hsd == null || tracingForm.trc_hsd == '') {
                this._matSnackBar.open(
                    'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                    'Aceptar',
                    {
                        verticalPosition: 'top',
                        duration: 2000
                    }
                );
                switch (tracingForm.trc_order) {
                    case 1:
                        this.tracing1Form.controls['trc_hcd'].setValue('');
                        break;
                    case 2:
                        this.tracing2Form.controls['trc_hcd'].setValue('');
                        break;
                    case 3:
                        this.tracing3Form.controls['trc_hcd'].setValue('');
                        break;
                    case 4:
                        this.tracing4Form.controls['trc_hcd'].setValue('');
                        break;
                    case 5:
                        this.tracing5Form.controls['trc_hcd'].setValue('');
                        break;
                    case 6:
                        this.tracing6Form.controls['trc_hcd'].setValue('');
                        break;
                }
            } else {
                this.calculateStatePatient(value, tracingForm.trc_order);
            }
        } else {
            switch (this.currentTracing.schedule_order) {
                case '1':
                    if (
                        this.tracing1Form.value.trc_hsd == null ||
                        this.tracing1Form.value.trc_hsd == ''
                    ) {
                        this._matSnackBar.open(
                            'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this.tracing1Form.controls['trc_hcd'].setValue('');
                    } else {
                        this.calculateStatePatient(value, '0');
                    }
                    break;
                case '2':
                    if (
                        this.tracing2Form.value.trc_hsd == null ||
                        this.tracing2Form.value.trc_hsd == ''
                    ) {
                        this._matSnackBar.open(
                            'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this.tracing2Form.controls['trc_hcd'].setValue('');
                    } else {
                        this.calculateStatePatient(value, '0');
                    }
                    break;
                case '3':
                    if (
                        this.tracing3Form.value.trc_hsd == null ||
                        this.tracing3Form.value.trc_hsd == ''
                    ) {
                        this._matSnackBar.open(
                            'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this.tracing3Form.controls['trc_hcd'].setValue('');
                    } else {
                        this.calculateStatePatient(value, '0');
                    }
                    break;
                case '4':
                    if (
                        this.tracing4Form.value.trc_hsd == null ||
                        this.tracing4Form.value.trc_hsd == ''
                    ) {
                        this._matSnackBar.open(
                            'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this.tracing4Form.controls['trc_hcd'].setValue('');
                    } else {
                        this.calculateStatePatient(value, '0');
                    }
                    break;
                case '5':
                    if (
                        this.tracing5Form.value.trc_hsd == null ||
                        this.tracing5Form.value.trc_hsd == ''
                    ) {
                        this._matSnackBar.open(
                            'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this.tracing5Form.controls['trc_hcd'].setValue('');
                    } else {
                        this.calculateStatePatient(value, '0');
                    }
                    break;
                case '6':
                    if (
                        this.tracing6Form.value.trc_hsd == null ||
                        this.tracing6Form.value.trc_hsd == ''
                    ) {
                        this._matSnackBar.open(
                            'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this.tracing6Form.controls['trc_hcd'].setValue('');
                    } else {
                        this.calculateStatePatient(value, '0');
                    }
                    break;
            }
        }
    }

    calculateStatePatient(value, trc_order): void {
        try {
            const valueHCD = Number.parseFloat(value);
            let valueText = '';
            if (this.pageType == 'edit') {
                if (valueHCD >= 11.6) {
                    valueText = 'Normal';
                } else if (valueHCD < 11.6 && valueHCD >= 11) {
                    valueText = 'En riesgo';
                } else if (valueHCD < 11 && valueHCD >= 9.99) {
                    valueText = 'Anemia Leve';
                } else if (valueHCD < 9.99 && valueHCD >= 7.01) {
                    valueText = 'Anemia moderada';
                } else if (valueHCD < 7.01) {
                    valueText = 'Anemia Severa';
                }

                switch (trc_order) {
                    case 1:
                        this.tracing1Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case 2:
                        this.tracing2Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case 3:
                        this.tracing3Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case 4:
                        this.tracing4Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case 5:
                        this.tracing5Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case 6:
                        this.tracing6Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                }
            } else {
                if (valueHCD >= 11.6) {
                    valueText = 'Normal';
                } else if (valueHCD < 11.6 && valueHCD >= 11) {
                    valueText = 'En riesgo';
                } else if (valueHCD < 11 && valueHCD >= 9.99) {
                    valueText = 'Anemia Leve';
                } else if (valueHCD < 9.99 && valueHCD >= 7.01) {
                    valueText = 'Anemia moderada';
                } else if (valueHCD < 7.01) {
                    valueText = 'Anemia Severa';
                }

                switch (this.currentTracing.schedule_order) {
                    case '1':
                        this.tracing1Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case '2':
                        this.tracing2Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case '3':
                        this.tracing3Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case '4':
                        this.tracing4Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case '5':
                        this.tracing5Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                    case '6':
                        this.tracing6Form.controls['trc_state'].setValue(
                            valueText
                        );
                        break;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    /**
     * Create product form
     *
     * @returns {FormGroup}
     */
    createPatientForm(): FormGroup {
        return this._formBuilder.group({
            pat_id: [this.patient.pat_id]
        });
    }

    finalizeRegistry(): void {
        this._router.navigateByUrl(
            '/tracing/' + this.patient.pat_id + '/' + this.patient.pat_handle
        );
    }

    registryTracing(): void {
        this.loading = true;
        let objTracing = {};

        switch (this.currentTracing.schedule_order) {
            case '1':
                objTracing = {
                    trc_fec_ini_trt: this.tracing1Form.value.trc_fec_ini_trt,
                    trc_fec_mue: this._registryUtil.getStringFromDate(
                        this.tracing1Form.value.trc_fec_mue
                    ),
                    trc_hcd: this.tracing1Form.value.trc_hcd,
                    trc_hem: this.tracing1Form.value.trc_hem,
                    trc_hsd: this.tracing1Form.value.trc_hsd,
                    trc_med_id: this.tracing1Form.value.trc_med_id,
                    trc_next_tracing: this._registryUtil.getStringFromDate(
                        this.tracing1Form.value.trc_next_tracing
                    ),
                    trc_num_mue: this.tracing1Form.value.trc_num_mue,
                    trc_obvs:
                        this.tracing1Form.value.trc_obvs != ''
                            ? this.tracing1Form.value.trc_obvs
                            : ' ',
                    trc_state: this.tracing1Form.value.trc_state,
                    fec_reg: this._registryUtil.getDateRegistry(),
                    usu_reg: this._userService.getUserLoged().user_id
                };       
                                
                const dataMedicUpdatePatient1 = {
                    pat_id: this.patient.pat_id,
                    pat_trc_order: this.currentTracing.schedule_order,

                    pat_adm: this.tracing1Form.value.trc_med_id,
                    pat_fec_mue: this.tracing1Form.value.trc_fec_mue,
                    pat_num_mue: this.tracing1Form.value.trc_num_mue,
                    pat_hem: this.tracing1Form.value.trc_hem,
                    pat_hsd: this.tracing1Form.value.trc_hsd,
                    pat_hcd: this.tracing1Form.value.trc_hcd,
                    pat_medic_state: this.tracing1Form.value.trc_state,
                    pat_ane_state: this.tracing1Form.value.trc_ane_state,
                    pat_obvs: this.tracing1Form.value.trc_obvs != ''                        
                    ? this.tracing1Form.value.trc_obvs
                    : ' ',

                    pat_his_cli: this.tracing1Form.value.tr_pat_his_cli,
                    pat_weight: this.tracing1Form.value.trc_pat_weight,
                    pat_est_salud: this.tracing1Form.value.trc_pat_est_salud
                };
                this._patientService.putUpdateMedicInfo(dataMedicUpdatePatient1).subscribe(
                    dataUpdate1 => {
                        if (dataUpdate1.res_service === 'ok') { 
                            this._matSnackBar.open(
                                'Se actualizó orrectamente la información médica.',
                                'Aceptar',
                                {
                                    verticalPosition: 'top',
                                    duration: 2000
                                }
                            );
                        }
                    }
                );
                
                break;
            case '2':
                objTracing = {
                    trc_fec_ini_trt: this.tracing2Form.value.trc_fec_ini_trt,
                    trc_med_id: this.tracing2Form.value.trc_med_id,
                    trc_next_tracing: this._registryUtil.getStringFromDate(
                        this.tracing2Form.value.trc_next_tracing
                    ),
                    trc_obvs:
                        this.tracing2Form.value.trc_obvs != ''
                            ? this.tracing2Form.value.trc_obvs
                            : ' ',
                    trc_tol_trt: this.tracing2Form.value.trc_tol_trt,
                    trc_vst_med: this.tracing2Form.value.trc_vst_med,
                    fec_reg: this._registryUtil.getDateRegistry(),
                    usu_reg: this._userService.getUserLoged().user_id
                };
                break;
            case '3':
                objTracing = {
                    trc_fec_ini_trt: this.tracing3Form.value.trc_fec_ini_trt,
                    trc_fec_mue: this._registryUtil.getStringFromDate(
                        this.tracing3Form.value.trc_fec_mue
                    ),
                    trc_hcd: this.tracing3Form.value.trc_hcd,
                    trc_hem: this.tracing3Form.value.trc_hem,
                    trc_hsd: this.tracing3Form.value.trc_hsd,
                    trc_med_id: this.tracing3Form.value.trc_med_id,
                    trc_next_tracing: this._registryUtil.getStringFromDate(
                        this.tracing3Form.value.trc_next_tracing
                    ),
                    trc_num_mue: this.tracing3Form.value.trc_num_mue,
                    trc_obvs:
                        this.tracing3Form.value.trc_obvs != ''
                            ? this.tracing3Form.value.trc_obvs
                            : ' ',
                    trc_state: this.tracing3Form.value.trc_state,
                    trc_tol_trt: this.tracing3Form.value.trc_tol_trt,
                    trc_vst_med: this.tracing3Form.value.trc_vst_med,
                    trc_ane_state: this.tracing3Form.value.trc_ane_state,
                    fec_reg: this._registryUtil.getDateRegistry(),
                    usu_reg: this._userService.getUserLoged().user_id
                };

                const dataMedicUpdatePatient3 = {
                    pat_id: this.patient.pat_id,
                    pat_trc_order: this.currentTracing.schedule_order,

                    pat_adm: this.tracing3Form.value.trc_med_id,
                    pat_fec_mue: this.tracing3Form.value.trc_fec_mue,
                    pat_num_mue: this.tracing3Form.value.trc_num_mue,
                    pat_hem: this.tracing3Form.value.trc_hem,
                    pat_hsd: this.tracing3Form.value.trc_hsd,
                    pat_hcd: this.tracing3Form.value.trc_hcd,
                    pat_medic_state: this.tracing3Form.value.trc_state,
                    pat_ane_state: this.tracing3Form.value.trc_ane_state,
                    pat_obvs: this.tracing3Form.value.trc_obvs != ''

                    ? this.tracing3Form.value.trc_obvs
                    : ' '
                };
                this._patientService.putUpdateMedicInfo(dataMedicUpdatePatient3).subscribe(
                    dataUpdate3 => {
                        if (dataUpdate3.res_service === 'ok') { 
                            this._matSnackBar.open(
                                'Se actualizó orrectamente la información médica.',
                                'Aceptar',
                                {
                                    verticalPosition: 'top',
                                    duration: 2000
                                }
                            );
                        }
                    }
                );

                break;
            case '4':
                objTracing = {
                    trc_fec_ini_trt: this.tracing4Form.value.trc_fec_ini_trt,
                    trc_med_id: this.tracing4Form.value.trc_med_id,
                    trc_next_tracing: this._registryUtil.getStringFromDate(
                        this.tracing4Form.value.trc_next_tracing
                    ),
                    trc_obvs:
                        this.tracing4Form.value.trc_obvs != ''
                            ? this.tracing4Form.value.trc_obvs
                            : ' ',
                    trc_tol_trt: this.tracing4Form.value.trc_tol_trt,
                    trc_vst_med: this.tracing4Form.value.trc_vst_med,
                    fec_reg: this._registryUtil.getDateRegistry(),
                    usu_reg: this._userService.getUserLoged().user_id
                };
                break;
            case '5':
                objTracing = {
                    trc_fec_ini_trt: this.tracing5Form.value.trc_fec_ini_trt,
                    trc_med_id: this.tracing5Form.value.trc_med_id,
                    trc_next_tracing: this._registryUtil.getStringFromDate(
                        this.tracing5Form.value.trc_next_tracing
                    ),
                    trc_obvs:
                        this.tracing5Form.value.trc_obvs != ''
                            ? this.tracing5Form.value.trc_obvs
                            : ' ',
                    trc_tol_trt: this.tracing5Form.value.trc_tol_trt,
                    trc_vst_med: this.tracing5Form.value.trc_vst_med,
                    fec_reg: this._registryUtil.getDateRegistry(),
                    usu_reg: this._userService.getUserLoged().user_id
                };
                break;
            case '6':
                objTracing = {
                    trc_fec_ini_trt: this.tracing6Form.value.trc_fec_ini_trt,
                    trc_fec_mue: this._registryUtil.getStringFromDate(
                        this.tracing6Form.value.trc_fec_mue
                    ),
                    trc_hcd: this.tracing6Form.value.trc_hcd,
                    trc_hem: this.tracing6Form.value.trc_hem,
                    trc_hsd: this.tracing6Form.value.trc_hsd,
                    trc_med_id: this.tracing6Form.value.trc_med_id,
                    trc_fec_fin_trt: this._registryUtil.getStringFromDate(
                        this.tracing6Form.value.trc_fec_fin_trt
                    ),
                    trc_num_mue: this.tracing6Form.value.trc_num_mue,
                    trc_obvs:
                        this.tracing6Form.value.trc_obvs != ''
                            ? this.tracing6Form.value.trc_obvs
                            : ' ',
                    trc_state: this.tracing6Form.value.trc_state,
                    trc_est_ate: this.tracing6Form.value.trc_est_ate,
                    trc_ane_state: this.tracing6Form.value.trc_ane_state,
                    fec_reg: this._registryUtil.getDateRegistry(),
                    usu_reg: this._userService.getUserLoged().user_id
                };

                const dataMedicUpdatePatient6 = {
                    pat_id: this.patient.pat_id,
                    pat_trc_order: this.currentTracing.schedule_order,

                    pat_adm: this.tracing6Form.value.trc_med_id,
                    pat_fec_mue: this.tracing6Form.value.trc_fec_mue,
                    pat_num_mue: this.tracing6Form.value.trc_num_mue,
                    pat_hem: this.tracing6Form.value.trc_hem,
                    pat_hsd: this.tracing6Form.value.trc_hsd,
                    pat_hcd: this.tracing6Form.value.trc_hcd,
                    pat_medic_state: this.tracing6Form.value.trc_state,
                    pat_ane_state: this.tracing6Form.value.trc_ane_state,
                    pat_obvs: this.tracing6Form.value.trc_obvs != ''

                    ? this.tracing6Form.value.trc_obvs
                    : ' '
                };
                this._patientService.putUpdateMedicInfo(dataMedicUpdatePatient6).subscribe(
                    dataUpdate6 => {
                        if (dataUpdate6.res_service === 'ok') { 
                            this._matSnackBar.open(
                                'Se actualizó orrectamente la información médica.',
                                'Aceptar',
                                {
                                    verticalPosition: 'top',
                                    duration: 2000
                                }
                            );
                        }
                    }
                );

                break;
        }

        this.currentTracing.schedule_trc_data = objTracing;
        this.currentTracing.schedule_ejec = '1';
        const currentIndex = Number(this.currentTracing.schedule_order) - 1;
        this.arrayTracing[currentIndex] = this.currentTracing;
        const dataUpdate = {
            pat_schedule_tracing_data: this.arrayTracing,
            pat_id: this.patient.pat_id
        };

        this._patientService.postAddTracing(dataUpdate).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this.stepper.next();
                } else {
                    this._matSnackBar.open(
                        'No se registró orrectamente el seguimiento.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 2000
                        }
                    );
                    this._navCtrl.navigate('/errors/error-500', {
                        error: data.error_desc
                    });
                }
            },
            error => {
                this._matSnackBar.open(
                    'No se registró orrectamente el seguimiento.',
                    'Aceptar',
                    {
                        verticalPosition: 'top',
                        duration: 2000
                    }
                );
                this._navCtrl.navigate('/errors/error-500', { error: error });
            },
            () => {
                this.loading = false;
            }
        );
    }

    btnRegistryTracing(): void {
        this._router.navigateByUrl(
            '/tracing/new/' +
                this.patient.pat_id +
                '/' +
                this.patient.pat_handle
        );
    }

    updateTracingArray(): void {
        this.loading = true;
        this.arrayTracing.forEach(element => {
            switch (element.schedule_order) {
                case '1':
                    if (element.schedule_ejec === '1') {
                        this.arrayTracing[0].schedule_trc_data = {
                            fec_reg: this.tracing1Form.value.fec_reg,
                            tr_pat_his_cli: this.tracing1Form.value.tr_pat_his_cli,
                            trc_ane_state: this.tracing1Form.value.trc_ane_state,

                            trc_fec_ini_trt: this.tracing1Form.value
                                .trc_fec_ini_trt,
                            trc_fec_mue: this.tracing1Form.value.trc_fec_mue,
                            trc_hcd: this.tracing1Form.value.trc_hcd,
                            trc_hem: this.tracing1Form.value.trc_hem,
                            trc_hsd: this.tracing1Form.value.trc_hsd,
                            trc_med_id: this.tracing1Form.value.trc_med_id,
                            trc_next_tracing: this.tracing1Form.value
                                .trc_next_tracing,
                            trc_num_mue: this.tracing1Form.value.trc_num_mue,
                            trc_obvs:
                                this.tracing1Form.value.trc_obvs != ''
                                    ? this.tracing1Form.value.trc_obvs
                                    : ' ',
                            trc_pat_est_salud: this.tracing1Form.value.trc_pat_est_salud,
                            trc_pat_weight: this.tracing1Form.value.trc_pat_weight,
                            trc_state: this.tracing1Form.value.trc_state,
                            usu_reg: this.tracing1Form.value.usu_reg,
                            usu_upd: this._userService.getUserLoged().user_id,
                            fec_upd: this._registryUtil.getDateRegistry()
                        };
                    }

                    if (element.schedule_order === this.currentTracingUpdate.schedule_order) {
                        console.log('update_1');
                        const dataMedicUpdatePatient = {
                            pat_id: this.patient.pat_id,
                            pat_trc_order: element.schedule_order,

                            pat_adm: this.tracing1Form.value.trc_med_id,
                            pat_fec_mue: this.tracing1Form.value.trc_fec_mue,
                            pat_num_mue: this.tracing1Form.value.trc_num_mue,
                            pat_hem: this.tracing1Form.value.trc_hem,
                            pat_hsd: this.tracing1Form.value.trc_hsd,
                            pat_hcd: this.tracing1Form.value.trc_hcd,
                            pat_medic_state: this.tracing1Form.value.trc_state,
                            pat_ane_state: this.tracing1Form.value.trc_ane_state,
                            pat_obvs: this.tracing1Form.value.trc_obvs != ''                        
                            ? this.tracing1Form.value.trc_obvs
                            : ' ',

                            pat_his_cli: this.tracing1Form.value.tr_pat_his_cli,
                            pat_weight: this.tracing1Form.value.trc_pat_weight,
                            pat_est_salud: this.tracing1Form.value.trc_pat_est_salud
                        };
                        this._patientService.putUpdateMedicInfo(dataMedicUpdatePatient).subscribe(
                            dataUpdate1 => {
                                if (dataUpdate1.res_service === 'ok') { 
                                    this._matSnackBar.open(
                                        'Se actualizó orrectamente la información médica.',
                                        'Aceptar',
                                        {
                                            verticalPosition: 'top',
                                            duration: 2000
                                        }
                                    );
                                }
                            }
                        );
                    }

                    break;
                case '2':
                    if (element.schedule_ejec === '1') {
                        this.arrayTracing[1].schedule_trc_data = {
                            fec_reg: this.tracing2Form.value.fec_reg,
                            trc_fec_ini_trt: this.tracing2Form.value
                                .trc_fec_ini_trt,
                            trc_hem: this.tracing2Form.value.trc_hem,
                            trc_med_id: this.tracing2Form.value.trc_med_id,
                            trc_next_tracing: this.tracing2Form.value
                                .trc_next_tracing,
                            trc_obvs:
                                this.tracing2Form.value.trc_obvs != ''
                                    ? this.tracing2Form.value.trc_obvs
                                    : ' ',
                            trc_state: this.tracing2Form.value.trc_state,
                            trc_tol_trt: this.tracing2Form.value.trc_tol_trt,
                            trc_vst_med: this.tracing2Form.value.trc_vst_med,
                            usu_reg: this.tracing2Form.value.usu_reg,
                            usu_upd: this._userService.getUserLoged().user_id,
                            fec_upd: this._registryUtil.getDateRegistry()
                        };
                    }
                    break;
                case '3':
                    if (element.schedule_ejec === '1') {
                        this.arrayTracing[2].schedule_trc_data = {
                            fec_reg: this.tracing3Form.value.fec_reg,
                            trc_fec_ini_trt: this.tracing3Form.value
                                .trc_fec_ini_trt,
                            trc_fec_mue: this.tracing3Form.value.trc_fec_mue,
                            trc_hcd: this.tracing3Form.value.trc_hcd,
                            trc_hem: this.tracing3Form.value.trc_hem,
                            trc_hsd: this.tracing3Form.value.trc_hsd,
                            trc_med_id: this.tracing3Form.value.trc_med_id,
                            trc_next_tracing: this.tracing3Form.value
                                .trc_next_tracing,
                            trc_num_mue: this.tracing3Form.value.trc_num_mue,
                            trc_obvs:
                                this.tracing3Form.value.trc_obvs != ''
                                    ? this.tracing3Form.value.trc_obvs
                                    : ' ',
                            trc_state: this.tracing3Form.value.trc_state,
                            trc_tol_trt: this.tracing3Form.value.trc_tol_trt,
                            trc_vst_med: this.tracing3Form.value.trc_vst_med,
                            trc_ane_state: this.tracing3Form.value.trc_ane_state,
                            usu_reg: this.tracing3Form.value.usu_reg,
                            usu_upd: this._userService.getUserLoged().user_id,
                            fec_upd: this._registryUtil.getDateRegistry()
                        };
                    }

                    if (element.schedule_order === this.currentTracingUpdate.schedule_order) {           
                        console.log('update_3');
                        const dataMedicUpdatePatient = {
                            pat_id: this.patient.pat_id,
                            pat_trc_order: element.schedule_order,

                            pat_adm: this.tracing3Form.value.trc_med_id,
                            pat_fec_mue: this.tracing3Form.value.trc_fec_mue,
                            pat_num_mue: this.tracing3Form.value.trc_num_mue,
                            pat_hem: this.tracing3Form.value.trc_hem,
                            pat_hsd: this.tracing3Form.value.trc_hsd,
                            pat_hcd: this.tracing3Form.value.trc_hcd,
                            pat_medic_state: this.tracing3Form.value.trc_state,
                            pat_ane_state: this.tracing3Form.value.trc_ane_state,
                            pat_obvs: this.tracing3Form.value.trc_obvs != ''

                            ? this.tracing3Form.value.trc_obvs
                            : ' '
                        };
                        this._patientService.putUpdateMedicInfo(dataMedicUpdatePatient).subscribe(
                            dataUpdate3 => {
                                if (dataUpdate3.res_service === 'ok') { 
                                    this._matSnackBar.open(
                                        'Se actualizó orrectamente la información médica.',
                                        'Aceptar',
                                        {
                                            verticalPosition: 'top',
                                            duration: 2000
                                        }
                                    );
                                }
                            }
                        );
                    }

                    break;
                case '4':
                    if (element.schedule_ejec === '1') {
                        this.arrayTracing[3].schedule_trc_data = {
                            fec_reg: this.tracing4Form.value.fec_reg,
                            trc_fec_ini_trt: this.tracing4Form.value
                                .trc_fec_ini_trt,
                            trc_hem: this.tracing4Form.value.trc_hem,
                            trc_med_id: this.tracing4Form.value.trc_med_id,
                            trc_next_tracing: this.tracing4Form.value
                                .trc_next_tracing,
                            trc_obvs:
                                this.tracing4Form.value.trc_obvs != ''
                                    ? this.tracing4Form.value.trc_obvs
                                    : ' ',
                            trc_state: this.tracing4Form.value.trc_state,
                            trc_tol_trt: this.tracing4Form.value.trc_tol_trt,
                            trc_vst_med: this.tracing4Form.value.trc_vst_med,
                            usu_reg: this.tracing4Form.value.usu_reg,
                            usu_upd: this._userService.getUserLoged().user_id,
                            fec_upd: this._registryUtil.getDateRegistry()
                        };
                    }
                    break;
                case '5':
                    if (element.schedule_ejec === '1') {
                        this.arrayTracing[4].schedule_trc_data = {
                            fec_reg: this.tracing5Form.value.fec_reg,
                            trc_fec_ini_trt: this.tracing5Form.value
                                .trc_fec_ini_trt,
                            trc_hem: this.tracing5Form.value.trc_hem,
                            trc_med_id: this.tracing5Form.value.trc_med_id,
                            trc_next_tracing: this.tracing5Form.value
                                .trc_next_tracing,
                            trc_obvs:
                                this.tracing5Form.value.trc_obvs != ''
                                    ? this.tracing5Form.value.trc_obvs
                                    : ' ',
                            trc_state: this.tracing5Form.value.trc_state,
                            trc_tol_trt: this.tracing5Form.value.trc_tol_trt,
                            trc_vst_med: this.tracing5Form.value.trc_vst_med,
                            usu_reg: this.tracing5Form.value.usu_reg,
                            usu_upd: this._userService.getUserLoged().user_id,
                            fec_upd: this._registryUtil.getDateRegistry()
                        };
                    }
                    break;
                case '6':
                    if (element.schedule_ejec === '1') {
                        console.log('update_6');
                        this.arrayTracing[5].schedule_trc_data = {
                            fec_reg: this.tracing6Form.value.fec_reg,
                            trc_est_ate: this.tracing6Form.value.trc_est_ate,
                            trc_fec_fin_trt: this.tracing6Form.value
                                .trc_fec_fin_fin,
                            trc_fec_ini_trt: this.tracing6Form.value
                                .trc_fec_ini_trt,
                            trc_fec_mue: this.tracing6Form.value.trc_fec_mue,
                            trc_hcd: this.tracing6Form.value.trc_hcd,
                            trc_hem: this.tracing6Form.value.trc_hem,
                            trc_hsd: this.tracing6Form.value.trc_hsd,
                            trc_med_id: this.tracing6Form.value.trc_med_id,
                            trc_num_mue: this.tracing6Form.value.trc_num_mue,
                            trc_obvs:
                                this.tracing6Form.value.trc_obvs != ''
                                    ? this.tracing6Form.value.trc_obvs
                                    : ' ',
                            trc_state: this.tracing6Form.value.trc_state,
                            trc_ane_state: this.tracing6Form.value.trc_ane_state,
                            usu_reg: this.tracing6Form.value.usu_reg,
                            usu_upd: this._userService.getUserLoged().user_id,
                            fec_upd: this._registryUtil.getDateRegistry()
                        };
                    }

                    if (element.schedule_order === this.currentTracingUpdate.schedule_order) {
                        const dataMedicUpdatePatient = {
                            pat_id: this.patient.pat_id,
                            pat_trc_order: element.schedule_order,

                            pat_adm: this.tracing6Form.value.trc_med_id,
                            pat_fec_mue: this.tracing6Form.value.trc_fec_mue,
                            pat_num_mue: this.tracing6Form.value.trc_num_mue,
                            pat_hem: this.tracing6Form.value.trc_hem,
                            pat_hsd: this.tracing6Form.value.trc_hsd,
                            pat_hcd: this.tracing6Form.value.trc_hcd,
                            pat_medic_state: this.tracing6Form.value.trc_state,
                            pat_ane_state: this.tracing6Form.value.trc_ane_state,
                            pat_obvs: this.tracing6Form.value.trc_obvs != ''

                            ? this.tracing6Form.value.trc_obvs
                            : ' '
                        };
                        this._patientService.putUpdateMedicInfo(dataMedicUpdatePatient).subscribe(
                            dataUpdate6 => {
                                if (dataUpdate6.res_service === 'ok') { 
                                    this._matSnackBar.open(
                                        'Se actualizó orrectamente la información médica.',
                                        'Aceptar',
                                        {
                                            verticalPosition: 'top',
                                            duration: 2000
                                        }
                                    );
                                }
                            }
                        );
                    }

                    break;
            }
        });

        const dataUpdate = {
            pat_schedule_tracing_data: this.arrayTracing,
            pat_id: this.patient.pat_id
        };

        this._patientService.postAddTracing(dataUpdate).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this._matSnackBar.open(
                        'Se actualizó orrectamente el seguimiento.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 2000
                        }
                    );
                } else {
                    this._matSnackBar.open(
                        'No se actualizó orrectamente el seguimiento.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 2000
                        }
                    );
                    this._navCtrl.navigate('/errors/error-500', {
                        error: data.error_desc
                    });
                }
            },
            error => {
                this._matSnackBar.open(
                    'No se actualzó orrectamente el seguimiento.',
                    'Aceptar',
                    {
                        verticalPosition: 'top',
                        duration: 2000
                    }
                );
                this._navCtrl.navigate('/errors/error-500', { error: error });
            },
            () => {
                this.loading = false;
            }
        );
    }
}
