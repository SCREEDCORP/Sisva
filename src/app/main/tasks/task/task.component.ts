import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar, MAT_DATE_FORMATS, MatStepper, MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { Router } from '@angular/router';
import { RegistryUtil } from 'app/utils/registry.util';
import { NgxNavigationWithDataComponent } from 'ngx-navigation-with-data';
import { UserService } from 'app/services/user.service';
import { UserModel } from 'app/models/user.model';
import { TaskService } from 'app/services/task.service';
import { UserModalComponent } from 'app/main/modals/user/user-modal.component';

export const MY_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD',
    },
    display: {
        dateInput: 'YYYY-MM-DD'
    }
};

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss'],
    encapsulation: ViewEncapsulation.None,    
    animations: fuseAnimations,
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})
export class TaskComponent implements OnInit, OnDestroy {
    @ViewChild('stepper') stepper: MatStepper;

    patient: Patient;
    pageType: string;
    userMedicForm: FormGroup;
    public showUserMedicForm = false;    

    patientForm: FormGroup;

    userTaskForm: FormGroup;
    userTasksFormArray: FormArray;
    task: any = [];

    userForm: FormGroup;

    public maxDateFecNac = new Date();    
    public stepperEditable = true;
    public loading = false;
    public showPatientForm = false;

    options: string[] = [];
    public listTipDocument = [];
    private user: UserModel;
    private userLoged: UserModel;

    public listUsers: UserModel[];
    public listPatients: Patient[];
    public selectedPatient: Patient = new Patient();
    public select_user_id;
    public select_pat_id;

    public isLoadingUserSearch = false;
    public isLoadingPatientSearch = false;
    
    public arrayTracing = [];
    public arrayTracingEjecutados = [];
    public arrayTracingAsignados = [];
    public arrayTracingSinAsignar = [];

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
        private _taskService: TaskService,
        private _userService: UserService,
        public dialog: MatDialog,
    ) {
        // Set the default
        this.patient = new Patient();

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
    ngOnInit(): void {

        this.userTasksFormArray = new FormArray(
            [
            ]
        );

        this.userTaskForm = new FormGroup(
            {
                tasks: this.userTasksFormArray
            }
        );

        // Subscribe to update product on changes
        this._userService.onUserChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(patient => {
                if (patient) {
                    this.user = new UserModel(patient);
                    this.loadTasks();
                    this.pageType = 'edit';
                }
                else {
                    this.pageType = 'new';
                    this.patient = new Patient();
                }
            });
        this.listTipDocument = this._registryUtil.getTiposDocumento();
        this.loadUserInfo();

        this.userForm = this._formBuilder.group({
            user_mail: ['', [Validators.required]],
            user_names: ['', [Validators.required]]
        });

        this.userMedicForm = this._formBuilder.group({
            user_tip_doc: ['', Validators.required],
            user_num_doc: ['', Validators.required],
            user_names: ['', Validators.required],
            user_ape_pat: ['', Validators.required],
            user_ape_mat: ['', Validators.required]
        });

        this.patientForm = this._formBuilder.group({
            pat_id: ['', Validators.required],
            pat_tip_doc: ['', Validators.required],
            pat_num_doc: ['', Validators.required],
            pat_names: ['', Validators.required],
            pat_ape_pat: ['', Validators.required],
            pat_ape_mat: ['', Validators.required],
            pat_dire: ['', Validators.required],
            pat_hsd: ['', Validators.required],
            pat_hcd: ['', Validators.required]
        });
    }

    loadTasks(): void {
        this.user.user_tasks.forEach(element => {
            const objPatient = {
                pat_id: element.pat_id
            };
            this._patientService.postPatientDetails(objPatient).subscribe(
                data => {
                    const patient = new Patient(data.data_result.Items[0]);
                    const taskEject = patient.pat_schedule_tracing_data.filter(x => x.schedule_ejec === '1');                
                    const taskAsign = patient.pat_schedule_tracing_data.filter(x => x.schedule_asign != null);
                    const taskAsignMe = taskAsign.filter(x => x.schedule_asign.user_id === this.user.user_id);
                    const taskAsignOthers = taskAsign.filter(x => x.schedule_asign.user_id !== this.user.user_id);
                    
                    const formGroup = this._formBuilder.group(
                        {                    
                            schedule_id: element.schedule_id,
                            fec_reg: element.fec_reg,
                            schedule_date: element.schedule_date,
                            pat_id: element.pat_id,
                            patient: patient,
                            taskEject: [taskEject],
                            taskAsignMe: [taskAsignMe],
                            taskAsignOthers: [taskAsignOthers]
                        }
                    );                    
                    this.userTasksFormArray.push(formGroup);
                    this.userTaskForm = new FormGroup(
                        {
                            'tasks': this.userTasksFormArray
                        }
                    );
                }
            );
        });
    }

    loadUserInfo(): void {
        try {
            const userStr = sessionStorage.getItem('sisva_user_details_loged');
            this.userLoged = new UserModel(JSON.parse(userStr));
            if (this.userLoged.user_valid === '0') {
                this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                this._router.navigateByUrl('/security/login');
            }
        } catch (err) {
            this._matSnackBar.open('Toolbar - No se cargo correctamente la información.', 'Aceptar', {
                verticalPosition: 'top',
                duration: 2000
            });
        }
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

    finalizeRegistry(): void {
        this._router.navigateByUrl('/tasks');
    }

    searchUser(value): void {
        this.isLoadingUserSearch = true;
        if (value.target.value !== '') {
            const searchBody = {
                value: value.target.value,
                orgz_id: this.userLoged.user_organization.orgz_id
            };
            this._userService.postSearchUser(searchBody).subscribe(
                data => {
                    if (data.res_service === 'ok') {
                        this.listUsers = data.data_result.Items;
                    }
                },
                error => {
                    console.log(error);
                },
                () => {
                    this.isLoadingUserSearch = false;
                }
            );
        } else {
            this.listUsers = [];
        }
    }

    selectUser(value): void { 
        const userSelect = this.listUsers.find(x => x.user_id === value);
        this.select_user_id = userSelect.user_id;
        this.showUserMedicForm = true;
        this.userMedicForm.controls['user_tip_doc'].setValue(
            this.listTipDocument.find(x => x.tip_doc_id === userSelect.user_pers_info.user_document.user_tip_doc).tip_doc_desc);
        this.userMedicForm.controls['user_num_doc'].setValue(userSelect.user_pers_info.user_document.user_num_doc);
        this.userMedicForm.controls['user_names'].setValue(userSelect.user_pers_info.user_names);
        this.userMedicForm.controls['user_ape_pat'].setValue(userSelect.user_pers_info.user_ape_pat);
        this.userMedicForm.controls['user_ape_mat'].setValue(userSelect.user_pers_info.user_ape_mat);   
        this.userForm.controls['user_names'].setValue(userSelect.user_pers_info.user_names);
    }

    checkUser(value): void {
        if (!this.isLoadingUserSearch) {
            const userSelect = this.listUsers.find(x => x.user_mail === value.target.value);
            if (userSelect == null) {
                this.showUserMedicForm = false;
                this.userForm.controls['user_mail'].setValue('');
            } else {
                this.select_user_id = userSelect.user_id;
                this.showUserMedicForm = true;
                this.userMedicForm.controls['user_tip_doc'].setValue(
                    this.listTipDocument.find(x => x.tip_doc_id === userSelect.user_pers_info.user_document.user_tip_doc).tip_doc_desc);
                this.userMedicForm.controls['user_num_doc'].setValue(userSelect.user_pers_info.user_document.user_num_doc);
                this.userMedicForm.controls['user_names'].setValue(userSelect.user_pers_info.user_names);
                this.userMedicForm.controls['user_ape_pat'].setValue(userSelect.user_pers_info.user_ape_pat);
                this.userMedicForm.controls['user_ape_mat'].setValue(userSelect.user_pers_info.user_ape_mat);
            }
        }
    }

    searchPatient(value): void {
        this.isLoadingPatientSearch = true;
        
        if (value.target.value !== '') {
            const searchBody = {
                value: value.target.value,
                orgz_id: this.userLoged.user_organization.orgz_id
            };            
            this._patientService.postSearchPatient(searchBody).subscribe(
                data => {                    
                    if (data.res_service === 'ok') {
                        this.listPatients = data.data_result.Items;                        
                    }
                },
                error => {
                    console.log(error);
                },
                () => {
                    this.isLoadingPatientSearch = false;
                }
            );
        } else {
            this.listPatients = [];
        }
    }

    selectPatient(value): void {

        try {
            this.selectedPatient = this.listPatients.find(x => x.pat_id === value);

            if (this.selectedPatient.pat_schedule_tracing.length > 0) {
                if (this.selectedPatient.pat_schedule_tracing_data != null) {
                
                    this.arrayTracing = this.selectedPatient.pat_schedule_tracing_data;
        
                    this.arrayTracingAsignados = this.selectedPatient.pat_schedule_tracing_data;
                    this.arrayTracingAsignados = this.arrayTracingAsignados.filter(x => x.schedule_asign != null && x.schedule_ejec !== '1');
        
                    this.arrayTracingSinAsignar = this.selectedPatient.pat_schedule_tracing_data;
                    this.arrayTracingSinAsignar = this.arrayTracingSinAsignar.filter(x => x.schedule_asign == null && x.schedule_ejec !== '1');
        
                    this.arrayTracingEjecutados = this.selectedPatient.pat_schedule_tracing_data;
                    this.arrayTracingEjecutados = this.arrayTracingEjecutados.filter(x => x.schedule_ejec === '1');
                }
        
                this.select_pat_id = this.selectedPatient.pat_id;
                this.showPatientForm = true;
                this.patientForm.controls['pat_tip_doc'].setValue(
                    this.listTipDocument.find(x => x.tip_doc_id === this.selectedPatient.pat_basic_info.pat_document.pat_tip_doc_id).tip_doc_desc);
                this.patientForm.controls['pat_num_doc'].setValue(this.selectedPatient.pat_basic_info.pat_document.pat_num_doc);
                this.patientForm.controls['pat_names'].setValue(this.selectedPatient.pat_basic_info.pat_names);
                this.patientForm.controls['pat_ape_pat'].setValue(this.selectedPatient.pat_basic_info.pat_ape_pat);
                this.patientForm.controls['pat_ape_mat'].setValue(this.selectedPatient.pat_basic_info.pat_ape_mat);
                this.patientForm.controls['pat_dire'].setValue(this.selectedPatient.pat_geoloc_info.pat_dire);
                this.patientForm.controls['pat_hsd'].setValue(this.selectedPatient.pat_medic_info.pat_hsd);
                this.patientForm.controls['pat_hcd'].setValue(this.selectedPatient.pat_medic_info.pat_hcd);
            } else {
                this._matSnackBar.open('El paciente no tiene anemia.', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                this.patientForm.controls['pat_id'].setValue('');
            }

        } catch (e) {
            this._matSnackBar.open('No se puede cargar la información del paciente', 'Aceptar', {
                verticalPosition: 'top',
                duration: 2000
            });
            this.patientForm.controls['pat_id'].setValue('');
        }
    }

    openDetailsAsignUser(user_id): void {
        const dialogRef = this.dialog.open(UserModalComponent, {
            data: {
                user_id: user_id
            }
        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    selectTracingAsign(event, schedule_id): void {
        this.arrayTracing.forEach((element, index) => {
            let schedule_asign = {};
            if (element.schedule_id === schedule_id) {
                if (event.checked) {
                    schedule_asign = {
                        user_id: this.select_user_id,
                        fec_reg: this._registryUtil.getDateRegistry(),
                        usu_reg: this._userService.getUserLoged().user_id,
                        asign_stat: '1',
                        asign_ejec: '1'
                    };
                    this.arrayTracing[index].schedule_asign = schedule_asign;
                } else {
                    this.arrayTracing[index].schedule_asign = null;
                }
            }
        });
    }

    checkPatient(value): void {
        if (!this.isLoadingPatientSearch) {
            if (this.listPatients != null) {
                const patientSelect = this.listPatients.find(x => x.pat_id === value.target.value);
                if (this.pageType === 'new') {
                    if (patientSelect == null) {
                        this.showPatientForm = false;
                        this.patientForm.controls['pat_id'].setValue('');
                    } else {
                        this.select_pat_id = patientSelect.pat_id;
                        this.showPatientForm = true;
                        this.patientForm.controls['pat_tip_doc'].setValue(
                            this.listTipDocument.find(x => x.tip_doc_id === patientSelect.pat_basic_info.pat_document.pat_tip_doc_id).tip_doc_desc);
                        this.patientForm.controls['pat_num_doc'].setValue(patientSelect.pat_basic_info.pat_document.pat_num_doc);
                        this.patientForm.controls['pat_names'].setValue(patientSelect.pat_basic_info.pat_names);
                        this.patientForm.controls['pat_ape_pat'].setValue(patientSelect.pat_basic_info.pat_ape_pat);
                        this.patientForm.controls['pat_ape_mat'].setValue(patientSelect.pat_basic_info.pat_ape_mat);
                        this.patientForm.controls['pat_dire'].setValue(patientSelect.pat_geoloc_info.pat_dire);
                        this.patientForm.controls['pat_hsd'].setValue(patientSelect.pat_medic_info.pat_hsd);
                        this.patientForm.controls['pat_hcd'].setValue(patientSelect.pat_medic_info.pat_hcd);
                    }
                } else {
                    console.log(this.userTaskForm.controls.tasks);
                }
            }
        }
    }

    createTask(): void {
        this.loading = true;
        let tracingAsign =  this.arrayTracing.filter(x => x.schedule_asign != null);
        tracingAsign =  tracingAsign.filter(x => x.schedule_asign.user_id == this.select_user_id && x.schedule_ejec == '0');
        const dataUpdate = {
            pat_schedule_tracing_data: this.arrayTracing,
            pat_id: this.selectedPatient.pat_id
        };

        this._patientService.postAddTracing(dataUpdate).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    
                    const user_tasks = [];
                    tracingAsign.forEach(element => {
                        const task = {
                            schedule_id: element.schedule_id,
                            schedule_order: element.schedule_order,
                            schedule_date: element.schedule_date,
                            schedule_ejec: '1',
                            schedule_stat: '1',
                            pat_id: this.selectedPatient.pat_id,
                            fec_reg: this._registryUtil.getDateRegistry(),
                            usu_reg: this._userService.getUserLoged().user_id 
                        };
                        user_tasks.push(task);
                    });

                    const ojbUpdateTask = {
                        user_tasks: user_tasks,
                        user_id: this.select_user_id
                    };

                    this._taskService.postAddTask(ojbUpdateTask).subscribe(
                        dataTask => {
                            if (dataTask.res_service === 'ok') {
                                this._matSnackBar.open('Asignado correctamente', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 2000
                                });
                                this.stepper.next();
                            }                
                        },
                        error => {
                            console.log(error);
                            this._matSnackBar.open('No se agregó correctamente la tarea.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                        },
                        () => {
                            this.loading = false;
                        }
                    );   

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
            }
        );   
    }
}
