import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { UserService } from 'app/services/user.service';
import { RegistryUtil } from 'app/utils/registry.util';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { NgxNavigationWithDataComponent } from 'ngx-navigation-with-data';
import { UserModel } from 'app/models/user.model';

@Component({
    selector     : 'registry',
    templateUrl  : './registry.component.html',
    styleUrls    : ['./registry.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class RegistryComponent implements OnInit, OnDestroy
{
    registerForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;
    public showEmailLeader = true;
    public loading = false;
    private userLeader: UserModel;
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _userService: UserService,
        private _registryUtil: RegistryUtil,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        public _navCtrl: NgxNavigationWithDataComponent
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
        this.registerForm = this._formBuilder.group({
            user_names           : ['', Validators.required],
            user_mail            : ['', [Validators.required, Validators.email]],
            user_password        : ['', Validators.required],
            user_passwordConfirm : ['', [Validators.required, confirmPasswordValidator]],
            user_flag_leader     : [false],
            user_mail_leader     : ['', [Validators.required, Validators.email]],
            user_flag_terms      : [false, Validators.required]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.registerForm.get('user_password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('user_passwordConfirm').updateValueAndValidity();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    actionEmailLaeder(value): void {
        if (value.checked) {
            this.showEmailLeader = false;    
            this.registerForm.controls['user_mail_leader'].setValue('isleader@isleader.com');        
            this.registerForm.controls['user_flag_leader'].setValidators(Validators.required);
        } else {
            this.showEmailLeader = true;    
            this.registerForm.controls['user_mail_leader'].setValue('');         
            this.registerForm.controls['user_flag_leader'].clearValidators();
            this.registerForm.controls['user_flag_leader'].updateValueAndValidity();
        }
    }

    registryUser(): void {
        this.loading = true;
        let bodyRegistry;        
        if (this.registerForm.value.user_flag_leader) {
            bodyRegistry = {
                user_pers_info: {
                    user_names      : this.registerForm.value.user_names
                },
                user_mail_leader    : this.registerForm.value.user_mail_leader,
                user_flag_leader    : this.registerForm.value.user_flag_leader,
                user_mail           : this.registerForm.value.user_mail,
                user_password       : this.registerForm.value.user_password,
                user_flag_terms     : this.registerForm.value.user_flag_terms,                
                fec_reg             : this._registryUtil.getDateRegistry(),
                user_reg            : 'registry'
            };
        } else {
            bodyRegistry = {
                user_pers_info: {
                    user_names      : this.registerForm.value.user_names
                },
                user_mail_leader    : this.registerForm.value.user_mail_leader,
                user_flag_leader    : this.registerForm.value.user_flag_leader,
                user_mail           : this.registerForm.value.user_mail,
                user_password       : this.registerForm.value.user_password,
                user_flag_terms     : this.registerForm.value.user_flag_terms,
                user_organization   : this.userLeader.user_organization,
                fec_reg             : this._registryUtil.getDateRegistry(),
                user_reg            : 'registry'
            };
        }

        this._userService.postRegistryUser(bodyRegistry).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    this._matSnackBar.open('Se registró correctamente el usuario.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 1000
                    });
                    setTimeout(() => {
                        if (bodyRegistry.user_flag_leader) {
                            this._router.navigateByUrl('/security/activate-leader/' + data.data_result.user_id);
                        } else {
                            this._router.navigateByUrl('/security/registry-finish/' + data.data_result.user_id + '/' + this.userLeader.user_id);
                        }
                    }, 1000);                                        
                } else {
                    this._matSnackBar.open('No se registro correctamente al usuario.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });

                    this._navCtrl.navigate('/errors/error-500', { error: data.error_desc });
                }
            },
            error => {
                this._matSnackBar.open('No se registró correctamente al usuario.', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                this._navCtrl.navigate('/errors/error-500', { error: error });
            },
            () => {
                this.loading = false;
            }
        );        
    }

    loadUserLeader(value): void {
        this.loading = true;
        const oUser = {
            user_mail: value
        };
        this._userService.postDetailsMail(oUser).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    if (data.data_result.Count > 0) {
                        this.userLeader = new UserModel(data.data_result.Items[0]);                        
                        if (this.userLeader.user_flag_leader) {
                            this._matSnackBar.open('Encargado encontrado exitosamente.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                        } else {
                            this._matSnackBar.open('El correo electrónico ingresado no pertenece a un encargado.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                            this.registerForm.controls['user_mail_leader'].setValue('');
                        }                        
                    } else {
                        this._matSnackBar.open('El correo electrónico no se encuentra registrado.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        this.registerForm.controls['user_mail_leader'].setValue('');
                    }
                } else {
                    this._matSnackBar.open('No se pudo obtener la información del encargado', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    this.registerForm.controls['user_mail_leader'].setValue('');
                }                
            },
            error => {
                this._matSnackBar.open('Error obteniendo la información del encargado', 'Aceptar', {
                    verticalPosition: 'top',
                    duration: 2000
                });
                this.registerForm.controls['user_mail_leader'].setValue('');
            },
            () => {
                this.loading = false;
            }
        );        
    }

    validateEmailExist(value): void {

        const email = new FormControl(value, Validators.email);
        if (!email.errors) {
            this.loading = true;

            const oUser = {
                user_mail: value
            };
    
            this._userService.postDetailsMail(oUser).subscribe(
                dataValidateExist => {
                    if (dataValidateExist.res_service == 'ok') {
                        if (dataValidateExist.data_result.Count > 0) {
                            this._matSnackBar.open('El correo electrónico ya se encuentra registrado.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                            this.registerForm.controls['user_mail'].setValue('');
                        }
                    } else {
                        this._matSnackBar.open('No se pudo validar correctamente la existencia del correo electrónico', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        this.registerForm.controls['user_mail'].setValue('');
                    }                
                },
                errorDataValidateExists => {
                    this._matSnackBar.open('Error validando el email', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    this.registerForm.controls['user_mail'].setValue('');
                },
                () => {
                    this.loading = false;
                }
            );  
    
        }
    }

}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if ( !control.parent || !control )
    {
        return null;
    }

    const password = control.parent.get('user_password');
    const passwordConfirm = control.parent.get('user_passwordConfirm');

    if ( !password || !passwordConfirm )
    {
        return null;
    }

    if ( passwordConfirm.value === '' )
    {
        return null;
    }

    if ( password.value === passwordConfirm.value )
    {
        return null;
    }

    return {'passwordsNotMatching': true};
};
