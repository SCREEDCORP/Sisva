import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { UserService } from 'app/services/user.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { UserModel } from 'app/models/user.model';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    loginMailError = '';
    showErrorMail = false;

    loginPasswordError = '';
    showErrorPassword = false;

    private user: UserModel;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _userService: UserService,
        private _matSnackBar: MatSnackBar,
        private _router: Router
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this.user = new UserModel();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            user_mail: ['', [Validators.required, Validators.email]],
            user_password: ['', Validators.required],
            user_remember: [true]
        });
    }

    loginUser(): void {

        this.showErrorMail = false;
        this.showErrorPassword = false;

        const userObject = {
            user_mail: this.loginForm.value.user_mail,
            user_password: this.loginForm.value.user_password
        };
        this._userService.postLoginUser(userObject).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    if (data.data_result.error_type === 'ok') {
                        this.showErrorMail = false;
                        this.user = new UserModel(data.data_result.user_data);
                        if (this.user.user_valid == '1') {

                            if (this.user.user_medic_info.user_mic_red == null) {
                                if (!this.user.user_flag_leader) {
                                    this._router.navigateByUrl('/security/activate/' + this.user.user_id);
                                } else {
                                    this._router.navigateByUrl('/security/activate-leader/' + this.user.user_id);
                                }
                            } else {
                                const userLoged = new UserModel();
                                userLoged.user_id = this.user.user_id;
                                userLoged.user_organization = this.user.user_organization;
                                if (this.loginForm.value.user_remember) {
                                    localStorage.setItem('sisva_user_login', JSON.stringify(userLoged));
                                } else {
                                    sessionStorage.setItem('sisva_user_login', JSON.stringify(userLoged));
                                }

                                location.href = '/dashboard';
                            }

                        } else {
                            this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 3000
                            });
                        }
                    } else {
                        switch (data.data_result.error_type) {
                            case 'user':
                                this.showErrorMail = true;
                                this.loginMailError = data.data_result.error_msg;
                                break;
                            case 'pw':
                                this.showErrorPassword = true;
                                this.loginPasswordError = data.data_result.error_msg;
                                break;
                        }
                    }
                } else {
                    this._matSnackBar.open('Sucedio un error al validar las credenciales.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000
                    });
                }
            }
        );
    }
}
