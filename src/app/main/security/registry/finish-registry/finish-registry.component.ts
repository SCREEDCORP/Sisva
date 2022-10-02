import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { UserService } from 'app/services/user.service';
import { UserModel } from 'app/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { RegistryUtil } from 'app/utils/registry.util';

@Component({
    selector: 'finish-registry',
    templateUrl: './finish-registry.component.html',
    styleUrls: ['./finish-registry.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FinishRegistryComponent implements OnInit {
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    public user: UserModel;
    public activate_id;
    public registry = true;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _userService: UserService,
        private _activateRoute: ActivatedRoute,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _registryUtil: RegistryUtil
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

    ngOnInit(): void {
        this.loadUserDetails();
    }

    loadUserDetails(): void {
        this._activateRoute.params.subscribe(
            data => {
                if (data.user_id && data.leader_id) {
                    this._userService.postDetails(data).subscribe(
                        dataUser => {
                            if (dataUser.res_service === 'ok') {
                                if (dataUser.data_result.Count > 0) {
                                    this.user = dataUser.data_result.Items[0];
                                    if (!this.user.user_flag_actv_req) {
                                        if (this.user.user_valid === '1') {
                                            this._matSnackBar.open('El usuario ya fue activado.', 'Aceptar', {
                                                verticalPosition: 'top',
                                                duration: 2000
                                            });
                                            this._router.navigateByUrl('/security/login');
                                        } else {

                                            const objMail = {
                                                user_names: this.user.user_pers_info.user_names,
                                                user_mail: this.user.user_mail,
                                                orgz_name: this.user.user_organization.orgz_name,
                                                user_mail_leader: this.user.user_mail_leader
                                            };
                                            this._userService.postActivationSendMail(objMail).subscribe(
                                                dataMail => {
                                                    if (dataMail.res_service === 'ok') {
                                                        const bodyActivate = {
                                                            user_id: data.leader_id,
                                                            activate_request: {
                                                                user_id: this.user.user_id,
                                                                user_mail: this.user.user_mail,
                                                                fec_reg: this._registryUtil.getDateRegistry(),
                                                                mail_send: dataMail.data_result_api
                                                            }
                                                        };
                                                        this._userService.patchCreateActivateRequest(bodyActivate).subscribe(
                                                            dataRequest => {
                                                                if (dataRequest.res_service === 'ok') {
                                                                    this.activate_id = dataRequest.data_result.activate_id;
                                                                } else {
                                                                    this.registry = false;
                                                                    this._matSnackBar.open('La solicitud de activación no se creo correctamente.', 'Aceptar', {
                                                                        verticalPosition: 'top',
                                                                        duration: 2000
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    } else {
                                        this._matSnackBar.open('La notificación de activación ya fue registrada.', 'Aceptar', {
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
}
