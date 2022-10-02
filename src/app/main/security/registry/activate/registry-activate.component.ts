import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatStepper, MAT_DATE_FORMATS } from '@angular/material';
import { UserService } from 'app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from 'app/models/user.model';
import { RegistryUtil } from 'app/utils/registry.util';
import { OrganizationService } from 'app/services/organization.service';
import { OrganizationModel } from 'app/models/organization.model';

export const MY_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD',
    },
    display: {
        dateInput: 'YYYY-MM-DD'
    }
};

@Component({
    selector     : 'registry-activate',
    templateUrl  : './registry-activate.component.html',
    styleUrls    : ['./registry-activate.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})
export class RegistryActivateComponent implements OnInit
{
    @ViewChild('stepper') stepper: MatStepper;
    
    loginForm: FormGroup;
    basicForm: FormGroup;
    organizationForm: FormGroup;

    public showConfirm = true;
    public user_phone_readonly = false;
    public user: UserModel;

    public listTipDocument = [];
    public listSex = [];
    public listOccupation = [];
    
    public maxDateFecNac = new Date();
    public stepperEditable = true;
    public loading = false;

    private organization = new OrganizationModel();

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _userService: UserService,
        private _activateRoute: ActivatedRoute,
        private _router: Router,
        private _registryUtil: RegistryUtil,
        private _organizationService: OrganizationService
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this.user = new UserModel();
    }

    ngOnInit(): void {

        this.loginForm = this._formBuilder.group({
            user_password: ['', Validators.required]
        });

        this.organizationForm = this._formBuilder.group({
            orgz_name: ['', Validators.required],
            orgz_ugb_dpt_id: ['', Validators.required],
            orgz_ugb_prv_id: ['', Validators.required],
            orgz_ugb_dst_id: ['', Validators.required],
        });

        this.basicForm = this._formBuilder.group({
            user_tip_doc    : ['1', Validators.required],
            user_num_doc    : ['', [Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern('^[0-9]*$')]],
            user_ape_pat    : ['', Validators.required],
            user_ape_mat    : ['', Validators.required],
            user_sexo       : ['', Validators.required],
            user_fec_nac    : ['', Validators.required],
            user_occupation : ['', Validators.required],
            user_red_sal    : ['', Validators.required],
            user_mic_red    : ['', Validators.required],
            user_pst_sal    : ['', Validators.required]
        });

        this.loadUserDetails();
        this.listTipDocument = this._registryUtil.getTiposDocumento();
        this.listSex = this._registryUtil.getSexos();
        this.listOccupation = this._registryUtil.getListOccupation();
    }

    loginActivation(): void {
        const oUser = {
            user_mail: this.user.user_mail,
            user_password: this.loginForm.value.user_password
        };
        this._userService.postLoginUser(oUser).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.error_type === 'ok') {
                        this.stepper.next();
                    } else {
                        this._matSnackBar.open(data.data_result.error_msg, 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        this.loginForm.controls['user_password'].setValue('');  
                    }
                } else {
                    this._matSnackBar.open('No se pudo validar correctamente.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    this.loginForm.controls['user_password'].setValue('');                        
                }
            }
        );
    }

    loadUserDetails(): void {
        this._activateRoute.params.subscribe(
            data => {
                if (data.user_id) {
                    this._userService.postDetails(data).subscribe(
                        dataUser => {
                            if (dataUser.res_service == 'ok') {
                                if (dataUser.data_result.Count > 0) {
                                    this.user = new UserModel(dataUser.data_result.Items[0]);                                           
                                    if (this.user.user_medic_info.user_mic_red != null) {
                                        this._matSnackBar.open('El usuario ya fue activado.', 'Aceptar', {
                                            verticalPosition: 'top',
                                            duration: 2000
                                        });
                                        this._router.navigateByUrl('/security/login'); 
                                    }
                                } else {
                                    this._matSnackBar.open('El usuario no se encuentra registrado.', 'Aceptar', {
                                        verticalPosition: 'top',
                                        duration: 2000
                                    }); 
                                    this._router.navigateByUrl('/security/login');
                                }
                            } else {
                                this._matSnackBar.open('No se pudo obtener la información del usuario', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 2000
                                });
                                localStorage.removeItem('sisva_user_login');
                                sessionStorage.removeItem('sisva_user_login');
                                this._router.navigateByUrl('/security/login');
                            }
                        }                        
                    );
                }                
            }
        );
    }

    keyPressLoginForm(value): void {
        if (value.keyCode == 13) {
            this.loginActivation();
        }
    }

    updateDataUserLeader(): void {    
        this.loading = true;    
        const bodyUpdate = {
            user_id : this.user.user_id,
            user_pers_info : {
                user_names: this.user.user_pers_info.user_names,
                user_ape_pat: this.basicForm.value.user_ape_pat,
                user_ape_mat: this.basicForm.value.user_ape_mat,
                user_fec_nac: this._registryUtil.getStringFromDate(this.basicForm.value.user_fec_nac),
                user_document: {
                    user_tip_doc: this.basicForm.value.user_tip_doc,
                    user_num_doc: this.basicForm.value.user_num_doc
                },
                user_sexo: this.basicForm.value.user_sexo
            },
            user_medic_info: {
                user_occupation_info: {
                    user_occupation: this.basicForm.value.user_occupation,
                    user_occupation_desc: this.listOccupation.find(x => x.occ_id == this.basicForm.value.user_occupation).occ_desc
                },
                user_pst_sal: this.basicForm.value.user_pst_sal,
                user_red_sal: this.basicForm.value.user_red_sal,
                user_mic_red: this.basicForm.value.user_mic_red
            },
            user_organization: {
                orgz_id: this.user.user_organization.orgz_id
            },
            fec_upd: this._registryUtil.getDateRegistry(),
            user_upd: this.user.user_id
        };
        this._userService.patchUpdateUserActivation(bodyUpdate).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    this.stepper.next();
                    this._matSnackBar.open('La información se actualizó correctamente.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                } else {
                    this._matSnackBar.open('No se pudo actualizar la información.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                }
            },
            error => {
                this._matSnackBar.open('No se pudo actualizar la información.', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 2000
                });
            },
            () => {
                this.loading = false;
            }
        );
    }
    
    changeMaxLengthDocument(value): void {
        if (value == '1') {
            this.basicForm.controls.user_num_doc.setValue('');
            this.basicForm.controls.user_num_doc.setValidators([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern('^[0-9]*$')]);
        } else {
            this.basicForm.controls.user_num_doc.setValue('');
            this.basicForm.controls.user_num_doc.setValidators([Validators.required, Validators.minLength(8), Validators.pattern('^[0-9]*$')]);
        }
    }

    clearWhiteSpacesMedicForm(event): void {
        const clearText = event.target.value.trim();
        this.basicForm.controls[event.target.id].setValue(clearText);
    }

    finalizeRegistry(): void {
        location.href = '/dashboard';
    }
}
