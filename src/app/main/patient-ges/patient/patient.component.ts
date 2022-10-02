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
import { UbigeoService } from 'app/services/ubigeo.service';
import { NgxNavigationWithDataComponent } from 'ngx-navigation-with-data';
import { UserService } from 'app/services/user.service';
import { PatientUtil } from 'app/utils/patient.util';
import { UserModel } from 'app/models/user.model';
import { OrganizationService } from 'app/services/organization.service';

export const MY_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD'
    },
    display: {
        dateInput: 'YYYY-MM-DD'
    }
};

@Component({
    selector: 'patient',
    templateUrl: './patient.component.html',
    styleUrls: ['./patient.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class PatientComponent implements OnInit, OnDestroy {
    @ViewChild('stepper') stepper: MatStepper;

    patient: Patient;
    pageType: string;
    patientForm: FormGroup;
    basicForm: FormGroup;
    medicForm: FormGroup;
    locationForm: FormGroup;
    public user: UserModel;
    public maxDateFecNac = new Date();
    public showMapa = false;
    public stepperEditable = true;
    private ubg_dpt;

    public listTipDocument = [];
    public listSex = [];
    public listUbigeoDpt = [];
    public listUbigeoPrv = [];
    public listUbigeoDst = [];
    public listProdAdm = [];
    public listWeight = [];
    public listAnemState = [];

    public loading = false;
    public showLocationMap = false;
    public show_pat_fec_ini_trt = true;
    public show_pat_adm_id = true;
    
    public showDireccionMap = false;

    private organization: any;

    public showEdadGestacional = false;
    public edadGestacional = '';

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
        private _ubigeoService: UbigeoService,
        public _navCtrl: NgxNavigationWithDataComponent,
        private _userService: UserService,
        private _patientUtil: PatientUtil,
        private _organizationService: OrganizationService
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

        this.listTipDocument = this._registryUtil.getTiposDocumento();
        this.listSex = this._registryUtil.getSexos();
        this.listProdAdm = this._patientUtil.getProductAdm().filter(x => x.type === 'ges');
        this.listWeight = this._patientUtil.getWeight();
        this.listAnemState = this._patientUtil.getAnemState();
        
        // Subscribe to update product on changes
        this._patientService.onProductChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(patient => {
                if (patient) {
                    this.patient = new Patient(patient);
                    this.pageType = 'edit';
                    this.patientForm = this.createPatientForm();
                    this.calculateEdadPatient(
                        moment(this.patient.pat_basic_info.pat_fec_nac)
                    );
                    this.calculateEdadGestacional(
                        moment(this.patient.pat_medic_info.pat_fur)
                    );
                } else {
                    this.pageType = 'new';
                    this.patient = new Patient();
                    this.patientForm = this.createPatientFormDefault();
                }
            });

        this.createPatientFormRegistry();
        this.loadUbigeoDpt();
        this.loadUserInfo();
    }

    mapClicked($event): void {
        if (this.pageType === 'edit') {
            this.patientForm.controls.pat_latitude.setValue($event.coords.lat);
            this.patientForm.controls.pat_longitude.setValue($event.coords.lng);
            const buttonUpdate = <HTMLInputElement>(
                document.getElementById('btnUpdatePatient')
            );
            buttonUpdate.disabled = false;
        } else {
            this.locationForm.controls.pat_latitude.setValue($event.coords.lat);
            this.locationForm.controls.pat_longitude.setValue($event.coords.lng);
        }

        this.getElevation();
      }

    loadUserInfo(): void {
        try {
            setTimeout(() => {
                const userStr = sessionStorage.getItem(
                    'sisva_user_details_loged'
                );
                this.user = new UserModel(JSON.parse(userStr));
                if (this.user.user_id !== '0') {
                    if (this.user.user_valid === '0') {
                        this._matSnackBar.open(
                            'El usuario no se encuentra activo.',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this._router.navigateByUrl('/security/login');
                    } else {
                        const detailsBody = {
                            orgz_id: this.user.user_organization.orgz_id
                        };
                        this._organizationService.postDetailsOrgz(detailsBody).subscribe(
                            dataOrgz => {
                                if (dataOrgz.res_service === 'ok') {
                                    if (dataOrgz.data_result.Count > 0) {                                        
                                        this.organization = dataOrgz.data_result.Items[0];
                                        this.locationForm.controls.pat_ubg_dpt.setValue(this.organization.orgz_ubigeo.ubg_dpt);
                                        this.loadUbigeoPrv(this.organization.orgz_ubigeo.ubg_dpt);
                                        this.locationForm.controls.pat_ubg_prv.setValue(this.organization.orgz_ubigeo.ubg_prv);
                                        this.loadUbigeoDst(this.organization.orgz_ubigeo.ubg_prv);
                                        this.locationForm.controls.pat_ubg_dst.setValue(this.organization.orgz_ubigeo.ubg_dst);
                                        this.locationForm.controls.pat_latitude.setValue(Number(this.organization.orgz_ubigeo.orgz_geolocation.orgz_latitude));
                                        this.locationForm.controls.pat_longitude.setValue(Number(this.organization.orgz_ubigeo.orgz_geolocation.orgz_longitude));
                                        this.locationForm.controls.pat_elevation.setValue(this.organization.orgz_ubigeo.orgz_geolocation.orgz_elevation);
                                        this.showMapa = true;
                                        this.showLocationMap = true;
                                    }
                                }
                            }
                        );
                    }
                }
            }, 2000);
        } catch (err) {
            this._matSnackBar.open(
                'Toolbar - No se cargo correctamente la información.',
                'Aceptar',
                {
                    verticalPosition: 'top',
                    duration: 2000
                }
            );
        }
    }

    createPatientFormRegistry(): void {
        this.basicForm = this._formBuilder.group({
            pat_names: ['', Validators.required],
            pat_ape_pat: ['', Validators.required],
            pat_ape_mat: ['', Validators.required],
            pat_tip_doc: ['1', Validators.required],
            pat_num_doc: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(8),
                    Validators.minLength(8),
                    Validators.pattern('^[0-9]*$')
                ]
            ],
            pat_fec_nac: ['', Validators.required],
            pat_edad: ['', Validators.required],
            pat_sexo: ['2', Validators.required],
            pat_apo_names: ['', Validators.required],
            pat_apo_ape_pat: ['', Validators.required],
            pat_apo_ape_mat: ['', Validators.required],
            pat_apo_num_doc: ['', Validators.required],
            pat_apo_tip_doc: ['1', Validators.required],
            pat_apo_phone: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.minLength(9),
                    Validators.maxLength(9)
                ]
            ]
        });

        this.medicForm = this._formBuilder.group({
            pat_adm_id: ['', Validators.required],
            pat_num_mue: ['', Validators.required],
            pat_his_cli: ['', Validators.required],
            pat_hem_wi_dsct: ['', Validators.required],
            pat_fec_ini_trt: ['', Validators.required],
            pat_fec_mue: ['', Validators.required],
            pat_hem: ['', Validators.required],
            pat_hem_wo_dsct: ['', Validators.required],
            pat_obvs: [''],
            pat_state: [''],
            pat_ane_state: [''],
            pat_est_salud: ['', Validators.required],
            pat_ges: ['', Validators.required],
            pat_paridad: ['', Validators.required],
            pat_fur: ['', Validators.required],
            pat_fpp: ['', Validators.required],
        });

        this.locationForm = this._formBuilder.group({
            pat_latitude: ['', Validators.required],
            pat_longitude: ['', Validators.required],
            pat_ubg_dpt: ['', Validators.required],
            pat_ubg_prv: ['', Validators.required],
            pat_ubg_dst: ['', Validators.required],
            pat_elevation: ['', Validators.required],
            pat_dire: ['', Validators.required]
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
     * Create product form
     *
     * @returns {FormGroup}
     */
    createPatientForm(): FormGroup {
        this.showMapa = true;

        this.loadUbigeoPrv(this.patient.pat_geoloc_info.pat_ubigeo.ubg_dpt);
        this.loadUbigeoDst(this.patient.pat_geoloc_info.pat_ubigeo.ubg_prv);

        const pat_adm = this.listProdAdm.find(
            x => x.pat_adm_id === this.patient.pat_medic_info.pat_adm
        ).pat_adm_desc;

        return this._formBuilder.group({
            pat_id: [this.patient.pat_id],
            pat_names: [this.patient.pat_basic_info.pat_names],
            pat_ape_pat: [this.patient.pat_basic_info.pat_ape_pat],
            pat_ape_mat: [this.patient.pat_basic_info.pat_ape_mat],
            pat_apo_names: [this.patient.pat_basic_info.pat_apo_names],
            pat_apo_ape_mat: [this.patient.pat_basic_info.pat_apo_ape_mat],
            pat_apo_ape_pat: [this.patient.pat_basic_info.pat_apo_ape_pat],
            pat_apo_tip_doc: [
                this.patient.pat_basic_info.pat_apo_document.pat_apo_tip_doc
            ],
            pat_apo_num_doc: [
                this.patient.pat_basic_info.pat_apo_document.pat_apo_num_doc
            ],
            pat_apo_phone: [
                this.patient.pat_basic_info.pat_apo_phone,
                [
                    Validators.maxLength(9),
                    Validators.minLength(9),
                    Validators.pattern('^[0-9]*$')
                ]
            ],
            pat_fec_nac: [moment(this.patient.pat_basic_info.pat_fec_nac)],
            pat_edad: ['', Validators.required],
            pat_sexo: [this.patient.pat_basic_info.pat_sexo_id],
            pat_tip_doc: [
                this.patient.pat_basic_info.pat_document.pat_tip_doc_id
            ],
            pat_num_doc: [
                this.patient.pat_basic_info.pat_document.pat_num_doc,
                [
                    Validators.required,
                    Validators.maxLength(8),
                    Validators.minLength(8),
                    Validators.pattern('^[0-9]*$')
                ]
            ],
            pat_num_mue: [this.patient.pat_medic_info.pat_num_mue],
            pat_fec_mue: [this.patient.pat_medic_info.pat_fec_mue],
            pat_hem: [this.patient.pat_medic_info.pat_hem],
            pat_hem_wo_dsct: [this.patient.pat_medic_info.pat_hsd],
            pat_obvs: [this.patient.pat_medic_info.pat_obvs],
            pat_his_cli: [this.patient.pat_medic_info.pat_his_cli],
            pat_hem_wi_dsct: [this.patient.pat_medic_info.pat_hcd],
            pat_fec_ini_trt: [this.patient.pat_medic_info.pat_fec_ini_trt],
            pat_state: [this.patient.pat_medic_info.pat_medic_state],
            pat_ane_state: [this.listAnemState.find(x => x.ane_option === this.patient.pat_medic_info.pat_ane_state).ane_desc],
            pat_est_salud: [this.patient.pat_medic_info.pat_est_salud],
            pat_adm_id: [pat_adm],

            pat_ges: [this.patient.pat_medic_info.pat_ges],
            pat_paridad: [this.patient.pat_medic_info.pat_paridad],
            pat_fur: [this.patient.pat_medic_info.pat_fur],
            pat_fpp: [this.patient.pat_medic_info.pat_fpp],
            
            pat_ubg_dpt: [
                this.patient.pat_geoloc_info.pat_ubigeo.ubg_dpt,
                Validators.required
            ],
            pat_ubg_prv: [
                this.patient.pat_geoloc_info.pat_ubigeo.ubg_prv,
                Validators.required
            ],
            pat_ubg_dst: [
                this.patient.pat_geoloc_info.pat_ubigeo.ubg_dst,
                Validators.required
            ],
            pat_latitude: [
                Number.parseFloat(this.patient.pat_geoloc_info.pat_latitude),
                [Validators.required]
            ],
            pat_longitude: [
                Number.parseFloat(this.patient.pat_geoloc_info.pat_longitude),
                [Validators.required]
            ],
            pat_elevation: [
                this.patient.pat_geoloc_info.pat_elevation,
                [Validators.required]
            ],
            pat_dire: [
                this.patient.pat_geoloc_info.pat_dire,
                Validators.required
            ]
        });
    }

    loadUbigeoDpt(): void {
        try {
            this._ubigeoService.getListDpt().subscribe(data => {
                if (data.res_service == 'ok') {
                    if (data.data_result.Count > 0) {
                        this.listUbigeoDpt = data.data_result.Items;
                        this.listUbigeoDpt = this.listUbigeoDpt.sort(function(a, b) {
                            return a.ubg_dsc.localeCompare(b.ubg_dsc);
                        });
                    } else {
                        this._matSnackBar.open(
                            'No se cargo correctamente el ubigeo.',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this._router.navigateByUrl('/errors/error-500');
                    }
                } else {
                    this._matSnackBar.open(
                        'No se cargo correctamente el ubigeo.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 2000
                        }
                    );
                    this._router.navigateByUrl('/errors/error-500');
                }
            });
        } catch (error) {
            this._matSnackBar.open(
                'No se cargo correctamente el ubigeo.',
                'Aceptar',
                {
                    verticalPosition: 'top',
                    duration: 2000
                }
            );
            this._router.navigateByUrl('/errors/error-500');
        }
    }

    loadUbigeoPrv(ubg_dpt): void {
        this.loading = true;
        this.ubg_dpt = ubg_dpt;
        const ubigeoBody = {
            ubg_dpt: ubg_dpt
        };
        this._ubigeoService.getListPrv(ubigeoBody).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    if (data.data_result.Count > 0) {
                        this.listUbigeoPrv = data.data_result.Items.sort(
                            function(a, b) {
                                return a.ubg_dsc.localeCompare(b.ubg_dsc);
                            }
                        );
                        this.listUbigeoPrv = this.listUbigeoPrv.filter(
                            x => x.ubg_prv != '0'
                        );
                    } else {
                        this._matSnackBar.open(
                            'No se cargo correctamente el ubigeo provincia.',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this._router.navigateByUrl('/errors/error-500');
                    }
                } else {
                    this._matSnackBar.open(
                        'No se cargo correctamente el ubigeo provincia.',
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
            error_ubigeoService => {
                this._matSnackBar.open(
                    'No se cargo correctamente el ubigeo provincia.',
                    'Aceptar',
                    {
                        verticalPosition: 'top',
                        duration: 2000
                    }
                );
                this._navCtrl.navigate('/errors/error-500', {
                    error: error_ubigeoService
                });
            },
            () => {
                this.loading = false;
            }
        );
    }

    loadUbigeoDst(ubg_prv): void {
        this.loading = true;
        const ubigeoBody = {
            ubg_dpt: this.ubg_dpt,
            ubg_prv: ubg_prv
        };
        this._ubigeoService.getListDst(ubigeoBody).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    if (data.data_result.Count > 0) {
                        this.listUbigeoDst = data.data_result.Items.sort(
                            function(a, b) {
                                return a.ubg_dsc.localeCompare(b.ubg_dsc);
                            }
                        );
                        this.listUbigeoDst = this.listUbigeoDst.filter(
                            x => x.ubg_dst != '0'
                        );
                    } else {
                        this._matSnackBar.open(
                            'No se cargo correctamente el ubigeo distrito.',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                        this._router.navigateByUrl('/errors/error-500');
                    }
                } else {
                    this._matSnackBar.open(
                        'No se cargo correctamente el ubigeo distrito.',
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
                    'No se cargo correctamente el ubigeo distrito.',
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

    changeShowLocationMap(): void {
        this.showLocationMap = true;
    }

    createPatientFormDefault(): FormGroup {
        return this._formBuilder.group({
            pat_id: [''],
            pat_latitude: [''],
            pat_longitude: [''],
            pat_elevation: ['']
        });
    }

    updatePatient(): void {
        try {
            this.loading = true;
            const bodyPatient = {
                pat_id: this.patient.pat_id,
                pat_basic_info: {
                    pat_names: this.patientForm.value.pat_names,
                    pat_ape_pat: this.patientForm.value.pat_ape_pat,
                    pat_ape_mat: this.patientForm.value.pat_ape_mat,
                    pat_fec_nac: this._registryUtil.getStringFromDate(
                        this.patientForm.value.pat_fec_nac
                    ),
                    pat_sexo_id: this.patientForm.value.pat_sexo,
                    pat_apo_names: this.patientForm.value.pat_apo_names,
                    pat_apo_phone: this.patientForm.value.pat_apo_phone,
                    pat_apo_ape_pat: this.patientForm.value.pat_apo_ape_pat,
                    pat_apo_ape_mat: this.patientForm.value.pat_apo_ape_mat,
                    pat_apo_document: {
                        pat_apo_tip_doc: this.patientForm.value.pat_apo_tip_doc,
                        pat_apo_num_doc: this.patientForm.value.pat_apo_num_doc
                    },
                    pat_document: {
                        pat_tip_doc_id: this.patientForm.value.pat_tip_doc,
                        pat_num_doc: this.patientForm.value.pat_num_doc
                    },
                    pat_organization: {
                        orgz_id: this.user.user_organization.orgz_id
                    }
                },
                pat_geoloc_info: {
                    pat_latitude: this.patientForm.value.pat_latitude.toString(),
                    pat_longitude: this.patientForm.value.pat_longitude.toString(),
                    pat_elevation: this.patientForm.value.pat_elevation,
                    pat_dire: this.patientForm.value.pat_dire,
                    pat_ubigeo: {
                        ubg_dpt: this.patientForm.value.pat_ubg_dpt,
                        ubg_prv: this.patientForm.value.pat_ubg_prv,
                        ubg_dst: this.patientForm.value.pat_ubg_dst
                    },
                    pat_dst_name: this.listUbigeoDst.find(
                        x =>
                            x.ubg_dst === this.patientForm.value.pat_ubg_dst &&
                            x.ubg_prv === this.patientForm.value.pat_ubg_prv &&
                            x.ubg_dpt === this.patientForm.value.pat_ubg_dpt
                    ).ubg_dsc
                },
                usu_upd: this._userService.getUserLoged().user_id,
                fec_upd: this._registryUtil.getDateRegistry()
            };
            this._patientService.updatePatient(bodyPatient).subscribe(
                data => {
                    if (data.res_service === 'ok') {
                        this._matSnackBar.open(
                            'Se actualizó correctamente la información.',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 3000
                            }
                        );
                    } else {
                        this._matSnackBar.open(
                            'No se pudo actualizar la información.',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 3000
                            }
                        );
                        this._navCtrl.navigate('/errors/error-500', {
                            error: data.error_desc
                        });
                    }
                },
                errorupdatePatient => {
                    this._matSnackBar.open(
                        'No se pudo actualizar la información.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 2000
                        }
                    );
                    this._navCtrl.navigate('/errors/error-500', {
                        error: errorupdatePatient
                    });
                },
                () => {
                    this.loading = false;
                }
            );
        } catch (error) {
            this.loading = false;
            this._matSnackBar.open(
                'No se pudo actualizar la información.',
                'Aceptar',
                {
                    verticalPosition: 'top',
                    duration: 3000
                }
            );
            this._navCtrl.navigate('/errors/error-500', { error: error });
        }
    }

    clearWhiteSpacesBasicForm(event): void {
        const clearText = event.target.value.trim();
        this.basicForm.controls[event.target.id].setValue(clearText);
    }

    keyDownBasicForm(event): void {
        if (event.keyCode == 13) {
            document.getElementById('btnFormBasicNext').click();
        }
    }

    keyDownMedicForm(event): void {
        if (event.keyCode == 13) {
            document.getElementById('btnMedicFormNext').click();
        }
    }

    clearWhiteSpacesMedicForm(event): void {
        const clearText = event.target.value.trim();
        this.medicForm.controls[event.target.id].setValue(clearText);
    }

    actionGetLocation(): void {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    this.locationForm.controls['pat_latitude'].setValue(
                        position.coords.latitude
                    );
                    this.locationForm.controls['pat_longitude'].setValue(
                        position.coords.longitude
                    );
                    this.showMapa = true;
                    if (this.pageType == 'edit') {
                        this.patientForm.controls['pat_latitude'].setValue(
                            position.coords.latitude
                        );
                        this.patientForm.controls['pat_longitude'].setValue(
                            position.coords.longitude
                        );
                        const buttonUpdate = <HTMLInputElement>(
                            document.getElementById('btnUpdatePatient')
                        );
                        buttonUpdate.disabled = false;
                    }
                    this.getElevation();
                });
            }
        } catch (error) {
            this.loading = false;
            this._matSnackBar.open(
                'No se puede obtener correctamente la ubicación.',
                'Aceptar',
                {
                    verticalPosition: 'top',
                    duration: 2000
                }
            );
            this._navCtrl.navigate('/errors/error-500', { error: error });
        }
    }

    getElevation(): void {
        this.loading = true;
        let objCords;
        if (this.pageType == 'edit') {
            objCords = {
                longitude: this.patientForm.value.pat_longitude,
                latitude: this.patientForm.value.pat_latitude
            };
        } else {
            objCords = {
                longitude: this.locationForm.value.pat_longitude,
                latitude: this.locationForm.value.pat_latitude
            };
        }
        this._ubigeoService.getElevation(objCords).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    const elevation =
                        Math.round(data.data_result_api[0].elevation * 100) /
                        100;
                    this.locationForm.controls['pat_elevation'].setValue(
                        elevation.toString()
                    );
                    this.patientForm.controls['pat_elevation'].setValue(
                        elevation.toString()
                    );
                }
            },
            errorgetElevation => {
                this._matSnackBar.open(
                    'No se puede obtener correctamente la ubicación.',
                    'Aceptar',
                    {
                        verticalPosition: 'top',
                        duration: 2000
                    }
                );
                this._navCtrl.navigate('/errors/error-500', {
                    error: errorgetElevation
                });
            },
            () => {
                this.loading = false;
            }
        );
    }

    finalizeRegistry(): void {
        this._router.navigateByUrl('/patients-ges/type/ges');
    }

    changeMaxLengthDocument(value): void {
        if (value == '1') {
            this.patientForm.controls.pat_num_doc.setValue('');
            this.patientForm.controls.pat_num_doc.setValidators([
                Validators.required,
                Validators.maxLength(8),
                Validators.minLength(8),
                Validators.pattern('^[0-9]*$')
            ]);
        } else {
            this.patientForm.controls.pat_num_doc.setValue('');
            this.patientForm.controls.pat_num_doc.setValidators([
                Validators.required,
                Validators.minLength(8),
                Validators.pattern('^[0-9]*$')
            ]);
        }
    }

    btnLocationFormNextClick(): void {
        try {
            this.loading = true;
            const schTracing1 =
                this.medicForm.value.pat_fec_ini_trt !== ''
                    ? this._registryUtil.getStringFromDate(
                          this.medicForm.value.pat_fec_ini_trt
                      )
                    : ' ';

            const schTracing2 =
                this.medicForm.value.pat_fec_ini_trt !== ''
                    ? this._registryUtil.getStringFromDate(
                          this.medicForm.value.pat_fec_ini_trt.add('days', 30)
                      )
                    : ' ';

            const schTracing3 =
                this.medicForm.value.pat_fec_ini_trt !== ''
                    ? this._registryUtil.getStringFromDate(
                          this.medicForm.value.pat_fec_ini_trt.add('days', 30)
                      )
                    : ' ';

            const schTracing4 =
                this.medicForm.value.pat_fec_ini_trt !== ''
                    ? this._registryUtil.getStringFromDate(
                          this.medicForm.value.pat_fec_ini_trt.add('days', 30)
                      )
                    : ' ';

            const schTracing5 =
                this.medicForm.value.pat_fec_ini_trt !== ''
                    ? this._registryUtil.getStringFromDate(
                          this.medicForm.value.pat_fec_ini_trt.add('days', 30)
                      )
                    : ' ';

            const schTracing6 =
                this.medicForm.value.pat_fec_ini_trt !== ''
                    ? this._registryUtil.getStringFromDate(
                          this.medicForm.value.pat_fec_ini_trt.add('days', 30)
                      )
                    : ' ';

            let pat_schedule_tracing = [];
            let pat_schedule_tracing_data = [];

            if (this.medicForm.value.pat_hem_wi_dsct < 11) {
                pat_schedule_tracing_data = [
                    {
                        schedule_date: schTracing1,
                        schedule_order: '1'
                    },
                    {
                        schedule_date: schTracing2,
                        schedule_order: '2'
                    },
                    {
                        schedule_date: schTracing3,
                        schedule_order: '3'
                    },
                    {
                        schedule_date: schTracing4,
                        schedule_order: '4'
                    },
                    {
                        schedule_date: schTracing5,
                        schedule_order: '5'
                    },
                    {
                        schedule_date: schTracing6,
                        schedule_order: '6'
                    }
                ];

                pat_schedule_tracing = [
                    {
                        schedule_date: schTracing1
                    },
                    {
                        schedule_date: schTracing2
                    },
                    {
                        schedule_date: schTracing3
                    },
                    {
                        schedule_date: schTracing4
                    },
                    {
                        schedule_date: schTracing5
                    },
                    {
                        schedule_date: schTracing6
                    }
                ];
            }

            const bodyPatient = {
                pat_basic_info: {
                    pat_names: this.basicForm.value.pat_names,
                    pat_ape_pat: this.basicForm.value.pat_ape_pat,
                    pat_ape_mat: this.basicForm.value.pat_ape_mat,
                    pat_fec_nac: this._registryUtil.getStringFromDate(
                        this.basicForm.value.pat_fec_nac
                    ),
                    pat_sexo_id: this.basicForm.value.pat_sexo,
                    pat_apo_names: this.basicForm.value.pat_apo_names,
                    pat_apo_phone: this.basicForm.value.pat_apo_phone,
                    pat_apo_ape_pat: this.basicForm.value.pat_apo_ape_pat,
                    pat_apo_ape_mat: this.basicForm.value.pat_apo_ape_mat,
                    pat_apo_document: {
                        pat_apo_tip_doc: this.basicForm.value.pat_apo_tip_doc,
                        pat_apo_num_doc: this.basicForm.value.pat_apo_num_doc
                    },
                    pat_document: {
                        pat_tip_doc: this.basicForm.value.pat_tip_doc,
                        pat_num_doc: this.basicForm.value.pat_num_doc
                    },
                    pat_organization: {
                        orgz_id: this.user.user_organization.orgz_id,
                        orgz_name: this.user.user_organization.orgz_name
                    }
                },
                pat_type: {
                    pat_flg_ane: false,
                    pat_flg_dci: false,
                    pat_flg_ges: true
                },
                pat_medic_info: {
                    pat_num_mue: this.medicForm.value.pat_num_mue,
                    pat_fec_mue: this._registryUtil.getStringFromDate(
                        this.medicForm.value.pat_fec_mue
                    ),
                    pat_hem: this.medicForm.value.pat_hem,
                    pat_hem_wo_dsct: this.medicForm.value.pat_hem_wo_dsct,
                    pat_obvs:
                        this.medicForm.value.pat_obvs !== ''
                            ? this.medicForm.value.pat_obvs
                            : ' ',
                    pat_his_cli: this.medicForm.value.pat_his_cli,
                    pat_hem_wi_dsct: this.medicForm.value.pat_hem_wi_dsct,
                    pat_fec_ini_trt: schTracing1,
                    pat_medic_state: this.medicForm.value.pat_state,
                    pat_est_salud: this.medicForm.value.pat_est_salud,
                    pat_adm_id: this.medicForm.value.pat_adm_id !== '' ? this.medicForm.value.pat_adm_id : '0',
                    pat_trc_tol_trt: this.medicForm.value.pat_trc_tol_trt,
                    pat_trc_vst_med: this.medicForm.value.pat_trc_vst_med,
                    pat_trc_next_tracing: schTracing2,
                    pat_ane_state: this.medicForm.value.pat_ane_state,
                    pat_ges: this.medicForm.value.pat_ges,
                    pat_paridad: this.medicForm.value.pat_paridad,
                    pat_fur: this._registryUtil.getStringFromDate(this.medicForm.value.pat_fur),
                    pat_fpp: this._registryUtil.getStringFromDate(this.medicForm.value.pat_fpp)
                },
                pat_geoloc_info: {
                    pat_latitude: this.locationForm.value.pat_latitude.toString(),
                    pat_longitude: this.locationForm.value.pat_longitude.toString(),
                    pat_elevation: this.locationForm.value.pat_elevation,
                    pat_dire: this.locationForm.value.pat_dire,
                    pat_ubigeo: {
                        ubg_dpt: this.locationForm.value.pat_ubg_dpt,
                        ubg_prv: this.locationForm.value.pat_ubg_prv,
                        ubg_dst: this.locationForm.value.pat_ubg_dst
                    },
                    pat_dst_name: this.listUbigeoDst.find(
                        x =>
                            x.ubg_dst == this.locationForm.value.pat_ubg_dst &&
                            x.ubg_prv === this.locationForm.value.pat_ubg_prv &&
                            x.ubg_dpt === this.locationForm.value.pat_ubg_dpt
                    ).ubg_dsc
                },
                pat_schedule_tracing: pat_schedule_tracing,
                pat_schedule_tracing_data: pat_schedule_tracing_data,
                usu_reg: this._userService.getUserLoged().user_id,
                fec_reg: this._registryUtil.getDateRegistry()
            };

            console.log(bodyPatient);

            this._patientService.addPatient(bodyPatient).subscribe(
                data => {
                    if (data.res_service === 'ok') {
                        this.stepper.next();
                        this.stepperEditable = false;
                        this._matSnackBar.open(
                            'El paciente se registró correctamente.',
                            'Aceptar',
                            {
                                verticalPosition: 'top',
                                duration: 2000
                            }
                        );
                    } else {
                        this._matSnackBar.open(
                            'El paciente no se registró correctamente.',
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
                erroraddPatient => {
                    this._matSnackBar.open(
                        'El paciente no se registró correctamente.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 2000
                        }
                    );
                    this._navCtrl.navigate('/errors/error-500', {
                        error: erroraddPatient
                    });
                },
                () => {
                    this.loading = false;
                }
            );
        } catch (error) {
            this.loading = false;
            this._matSnackBar.open(
                'El paciente no se registró correctamente.',
                'Aceptar',
                {
                    verticalPosition: 'top',
                    duration: 2000
                }
            );
            this._navCtrl.navigate('/errors/error-500', { error: error });
        }
    }

    calculateEdadPatient(value): void {
        let format = '';
        const currentDate = moment();
        const fecNacDate = moment(this._registryUtil.getStringFromDate(value));
        const years = currentDate.diff(fecNacDate, 'years');
        fecNacDate.add(years, 'years');
        const months = currentDate.diff(fecNacDate, 'months');
        fecNacDate.add(months, 'months');
        const days = currentDate.diff(fecNacDate, 'days');

        format = years + ' años ' + months + ' meses y ' + days + ' días.';
        if (this.pageType == 'edit') {
            this.patientForm.controls['pat_edad'].setValue(format);
        } else {
            this.basicForm.controls['pat_edad'].setValue(format);
        }
    }

    calculateEdadGestacional(value): void {
        let format = '';
        const currentDate = moment();
        const fecNacDate = moment(this._registryUtil.getStringFromDate(value));

        const weeks = currentDate.diff(fecNacDate, 'weeks');
        fecNacDate.add(weeks, 'weeks');
        const days = currentDate.diff(fecNacDate, 'days');
                        
        format = weeks + ' semanas y ' + days + ' días.';
        this.showEdadGestacional = true;
        this.edadGestacional = format;
    }

    calculateHCD(event): void {
        let HCD;
        if (this.pageType == 'edit') {
            if (this.patientForm.value.pat_elevation >= 1000) {
                const alt =
                    (Number.parseFloat(this.patientForm.value.pat_elevation) /
                        1000) *
                    3.3;
                const ajuste = -0.032 * alt + 0.022 * (alt * alt);
                HCD =
                    Math.round(
                        (Number.parseFloat(event.target.value) - ajuste) * 100
                    ) / 100;
                this.patientForm.controls['pat_hem_wi_dsct'].setValue(
                    HCD.toString()
                );
            } else {
                this.patientForm.controls['pat_hem_wi_dsct'].setValue(
                    event.target.value.toString()
                );
                HCD = event.target.value.toString();
            }
            this.calculateStatePatient(HCD);
        } else {
            this.clearWhiteSpacesMedicForm(event);
            if (this.locationForm.value.pat_elevation >= 1000) {
                const alt =
                    (Number.parseFloat(this.locationForm.value.pat_elevation) /
                        1000) *
                    3.3;
                const ajuste = -0.032 * alt + 0.022 * (alt * alt);
                HCD =
                    Math.round(
                        (Number.parseFloat(event.target.value) - ajuste) * 100
                    ) / 100;
                this.medicForm.controls['pat_hem_wi_dsct'].setValue(
                    HCD.toString()
                );
            } else {
                this.medicForm.controls['pat_hem_wi_dsct'].setValue(
                    event.target.value.toString()
                );
                HCD = event.target.value.toString();
            }
            this.calculateStatePatient(HCD);
        }
    }

    validateHSD(value): void {
        if (this.pageType == 'edit') {
            if (
                this.patientForm.value.pat_hem_wo_dsct == null ||
                this.patientForm.value.pat_hem_wo_dsct == ''
            ) {
                this._matSnackBar.open(
                    'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                    'Aceptar',
                    {
                        verticalPosition: 'top',
                        duration: 2000
                    }
                );
                this.patientForm.controls['pat_hem_wi_dsct'].setValue('');
            }
        } else {
            if (
                this.medicForm.value.pat_hem_wo_dsct == null ||
                this.medicForm.value.pat_hem_wo_dsct == ''
            ) {
                this._matSnackBar.open(
                    'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                    'Aceptar',
                    {
                        verticalPosition: 'top',
                        duration: 2000
                    }
                );
                this.medicForm.controls['pat_hem_wi_dsct'].setValue('');
            }
        }
    }

    calculateStatePatient(value): void {
        try {
            const valueHCD = Number.parseFloat(value);
            let valueText = '';
            if (this.pageType == 'edit') {
                if (
                    this.patientForm.value.pat_hem_wo_dsct == null ||
                    this.patientForm.value.pat_hem_wo_dsct == ''
                ) {
                    this._matSnackBar.open(
                        'Primero ingresar un valor para la Hemoglobina sin descuento (HSD)',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 2000
                        }
                    );
                    this.patientForm.controls['pat_hem_wi_dsct'].setValue('');
                } else {
                    if (valueHCD >= 11.6) {
                        valueText = 'Normal';
                        this.patientForm.controls[
                            'pat_fec_ini_trt'
                        ].clearValidators();
                        this.patientForm.controls[
                            'pat_fec_ini_trt'
                        ].updateValueAndValidity();
                        this.patientForm.controls[
                            'pat_adm_id'
                        ].clearValidators();
                        this.patientForm.controls[
                            'pat_adm_id'
                        ].updateValueAndValidity();
                        this.show_pat_fec_ini_trt = false;
                        this.show_pat_adm_id = false;
                    } else if (valueHCD < 11.6 && valueHCD >= 11) {
                        valueText = 'En riesgo';
                        this.patientForm.controls[
                            'pat_fec_ini_trt'
                        ].clearValidators();
                        this.patientForm.controls[
                            'pat_fec_ini_trt'
                        ].updateValueAndValidity();
                        this.patientForm.controls[
                            'pat_adm_id'
                        ].clearValidators();
                        this.patientForm.controls[
                            'pat_adm_id'
                        ].updateValueAndValidity();
                        this.show_pat_fec_ini_trt = false;
                        this.show_pat_adm_id = false;
                    } else if (valueHCD < 11 && valueHCD >= 9.99) {
                        valueText = 'Anemia Leve';
                        this.patientForm.controls[
                            'pat_fec_ini_trt'
                        ].setValidators(Validators.required);
                        this.patientForm.controls['pat_adm_id'].setValidators(
                            Validators.required
                        );
                        this.show_pat_fec_ini_trt = true;
                        this.show_pat_adm_id = true;
                    } else if (valueHCD < 9.99 && valueHCD >= 7.01) {
                        valueText = 'Anemia moderada';
                        this.patientForm.controls[
                            'pat_fec_ini_trt'
                        ].setValidators(Validators.required);
                        this.patientForm.controls['pat_adm_id'].setValidators(
                            Validators.required
                        );
                        this.show_pat_fec_ini_trt = true;
                        this.show_pat_adm_id = true;
                    } else if (valueHCD < 7.01) {
                        valueText = 'Anemia Severa';
                        this.patientForm.controls[
                            'pat_fec_ini_trt'
                        ].setValidators(Validators.required);
                        this.patientForm.controls['pat_adm_id'].setValidators(
                            Validators.required
                        );
                        this.show_pat_fec_ini_trt = true;
                        this.show_pat_adm_id = true;
                    }
                    this.patientForm.controls['pat_state'].setValue(valueText);
                }
            } else {
                if (valueHCD >= 11.6) {
                    valueText = 'Normal';
                    this.medicForm.controls[
                        'pat_fec_ini_trt'
                    ].clearValidators();
                    this.medicForm.controls[
                        'pat_fec_ini_trt'
                    ].updateValueAndValidity();
                    this.medicForm.controls['pat_adm_id'].clearValidators();
                    this.medicForm.controls[
                        'pat_adm_id'
                    ].updateValueAndValidity();
                    this.show_pat_fec_ini_trt = false;
                    this.show_pat_adm_id = false;
                } else if (valueHCD < 11.6 && valueHCD >= 11) {
                    valueText = 'En riesgo';
                    this.medicForm.controls[
                        'pat_fec_ini_trt'
                    ].clearValidators();
                    this.medicForm.controls[
                        'pat_fec_ini_trt'
                    ].updateValueAndValidity();
                    this.medicForm.controls['pat_adm_id'].clearValidators();
                    this.medicForm.controls[
                        'pat_adm_id'
                    ].updateValueAndValidity();
                    this.show_pat_fec_ini_trt = false;
                    this.show_pat_adm_id = false;
                } else if (valueHCD < 11 && valueHCD >= 9.99) {
                    valueText = 'Anemia Leve';
                    this.medicForm.controls['pat_fec_ini_trt'].setValidators(
                        Validators.required
                    );
                    this.medicForm.controls['pat_adm_id'].setValidators(
                        Validators.required
                    );
                    this.show_pat_fec_ini_trt = true;
                    this.show_pat_adm_id = true;
                } else if (valueHCD < 9.99 && valueHCD >= 7.01) {
                    valueText = 'Anemia moderada';
                    this.medicForm.controls['pat_fec_ini_trt'].setValidators(
                        Validators.required
                    );
                    this.medicForm.controls['pat_adm_id'].setValidators(
                        Validators.required
                    );
                    this.show_pat_fec_ini_trt = true;
                    this.show_pat_adm_id = true;
                } else if (valueHCD < 7.01) {
                    valueText = 'Anemia Severa';
                    this.medicForm.controls['pat_fec_ini_trt'].setValidators(
                        Validators.required
                    );
                    this.medicForm.controls['pat_adm_id'].setValidators(
                        Validators.required
                    );
                    this.show_pat_fec_ini_trt = true;
                    this.show_pat_adm_id = true;
                }
                this.medicForm.controls['pat_state'].setValue(valueText);
            }
        } catch (error) {
            console.log(error);
        }
    }

    searchPatientPadron(value): void {
        const clearText = value.target.value.trim();
        this.basicForm.controls[value.target.id].setValue(clearText);
        if (clearText.length == 8) {
            const bodySearch = {
                pat_num_dni: clearText,
                pat_tip_doc_id: this.basicForm.value.pat_tip_doc
            };
            this._patientService.postSearchPatientDni(bodySearch).subscribe(
                dataDocument => {
                    if (dataDocument.res_service === 'ok') {
                        if (dataDocument.data_result.Count > 0) {
                            this._matSnackBar.open(
                                'El número de documento ya se encuentra registrado.',
                                'Aceptar',
                                {
                                    verticalPosition: 'top',
                                    duration: 2000
                                }
                            );
                            this.basicForm.controls['pat_num_doc'].setValue('');
                        }
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }
}
