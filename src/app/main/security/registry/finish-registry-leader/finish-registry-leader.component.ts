import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { RegistryUtil } from 'app/utils/registry.util';
import { UserService } from 'app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from 'app/models/user.model';

@Component({
    selector     : 'finish-registry-leader',
    templateUrl  : './finish-registry-leader.component.html',
    styleUrls    : ['./finish-registry-leader.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FinishRegistryLeaderComponent implements OnInit
{
    registerForm: FormGroup;
    public showConfirm = true;
    public user_phone_readonly = false;
    public loading = false;
    public user: UserModel;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _registryUtil: RegistryUtil,
        private _userService: UserService,
        private _activateRoute: ActivatedRoute,
        private _router: Router
    )
    {
        this.user = new UserModel();
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
    }

    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            user_phone           : ['', [Validators.required, Validators.maxLength(9), Validators.minLength(9), Validators.pattern('^[0-9]*$')]]
        });
        this.loadUserDetails();
    }

    loadUserDetails(): void {
        this._activateRoute.params.subscribe(
            data => {
                if (data.user_id) {
                    this._userService.postDetails(data).subscribe(
                        dataUser => {
                            if (dataUser.res_service == 'ok') {
                                if (dataUser.data_result.Count > 0) {
                                    this.user = dataUser.data_result.Items[0];
                                    if (this.user.user_activate_info) {
                                        this._matSnackBar.open('Ya se registro una solicitud de activación para este usuario.', 'Aceptar', {
                                            verticalPosition: 'top',
                                            duration: 3000
                                        });
                                        localStorage.removeItem('sisva_user_login');
                                        sessionStorage.removeItem('sisva_user_login');
                                        this._router.navigateByUrl('/security/login');
                                    }
                                } else {
                                    this._matSnackBar.open('El usuario no se registrado o activo.', 'Aceptar', {
                                        verticalPosition: 'top',
                                        duration: 3000
                                    });
                                    localStorage.removeItem('sisva_user_login');
                                    sessionStorage.removeItem('sisva_user_login');
                                    this._router.navigateByUrl('/security/login');
                                }
                            } else {
                                this._matSnackBar.open('No se pudo obtener la información del usuario.', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 3000
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

    contactUser(): void {
        this.loading = true;
        this.showConfirm = false;
        this.user_phone_readonly = true;
        let bodyActivateLeader = {
            user_id: this.user.user_id,
            user_activate_info : {
                user_phone : this.registerForm.value.user_phone,
                fec_reg: this._registryUtil.getDateRegistry()
            }
        };    
        this._userService.patchUpdatePhoneActivate(bodyActivateLeader).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    this._matSnackBar.open('Gracias, pronto nos pondremos en contacto con usted.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                }
            },
            error => {
                this._matSnackBar.open('No se pudo actualizar la información del cliente.', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 3000
                });
            },
            () => {
                this.loading = false;
            }
        );
    }
}
