import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { UbigeoService } from 'app/services/ubigeo.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { PatientService } from 'app/services/patient.service';
import { markerModel } from 'app/models/marker.model';
import { MouseEvent } from '@agm/core';
import { NgxNavigationWithDataComponent } from 'ngx-navigation-with-data';
import { UserModel } from 'app/models/user.model';
import { OrganizationService } from 'app/services/organization.service';
import { RegistryUtil } from 'app/utils/registry.util';
import * as moment from 'moment';

@Component({
    selector: 'report-map',
    templateUrl: './report-map.component.html',
    styleUrls: ['./report-map.component.scss'],
    animations: fuseAnimations
})
export class ReportMapComponent implements OnInit, OnDestroy {
    categories: any[];
    courses: any[];
    coursesFilteredByCategory: any[];
    filteredCourses: any[];
    currentCategory: string;
    searchTerm: string;

    public listUbigeoDpt = [];
    private ubg_dpt;
    public listUbigeoPrv = [];
    private ubg_prv;
    public listUbigeoDst = [];

    // Private
    private _unsubscribeAll: Subject<any>;
    public showMapa = false;

    lat = 0;
    lng = 0;
    zoom = 13;
    markers: markerModel[] = [];

    user: UserModel;

    public valueDpt;
    public valuePrv;
    public valueDts;

    public loading = false;

    constructor(
        private _ubigeoService: UbigeoService,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _patientService: PatientService,
        public _navCtrl: NgxNavigationWithDataComponent,
        private _orgzService: OrganizationService,
        private _registryUtil: RegistryUtil
    ) {
        // Set the defaults
        this.currentCategory = 'all';
        this.searchTerm = '';

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
        this.loadUbigeoDpt();
        this.loadUserInfo();
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
     * Filter courses by category
     */
    filterCoursesByCategory(): void {
        // Filter
        if (this.currentCategory === 'all') {
            this.coursesFilteredByCategory = this.courses;
            this.filteredCourses = this.courses;
        }
        else {
            this.coursesFilteredByCategory = this.courses.filter((course) => {
                return course.category === this.currentCategory;
            });

            this.filteredCourses = [...this.coursesFilteredByCategory];

        }

        // Re-filter by search term
        this.filterCoursesByTerm();
    }

    /**
     * Filter courses by term
     */
    filterCoursesByTerm(): void {
        const searchTerm = this.searchTerm.toLowerCase();

        // Search
        if (searchTerm === '') {
            this.filteredCourses = this.coursesFilteredByCategory;
        }
        else {
            this.filteredCourses = this.coursesFilteredByCategory.filter((course) => {
                return course.title.toLowerCase().includes(searchTerm);
            });
        }
    }

    loadUserInfo(): void {
        try {
            setTimeout(() => {
                const userStr = sessionStorage.getItem('sisva_user_details_loged');
                this.user = new UserModel(JSON.parse(userStr));
                if (this.user.user_id !== '0') {
                    if (this.user.user_valid === '0') {
                        this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        this._router.navigateByUrl('/security/login');
                    } else {
                        this.loadOrganizationUbigeo(this.user.user_organization.orgz_id);
                    }
                }
            }, 2000);
        } catch (err) {
            this._matSnackBar.open('Toolbar - No se cargo correctamente la información.', 'Aceptar', {
                verticalPosition: 'top',
                duration: 2000
            });
        }
    }

    loadOrganizationUbigeo(orgz_id): void {
        this.loading = true;
        const detailsBody = {
            orgz_id: orgz_id
        };

        this._orgzService.postDetailsOrgz(detailsBody).subscribe(
            dataOrgz => {
                if (dataOrgz.res_service === 'ok') {
                    if (dataOrgz.data_result.Count > 0) {
                        const orgz = dataOrgz.data_result.Items[0];
                        this.valueDpt = orgz.orgz_ubigeo.ubg_dpt;
                        this.loadUbigeoPrv(this.valueDpt);
                        this.valuePrv = orgz.orgz_ubigeo.ubg_prv;
                        this.loadUbigeoDst(this.valuePrv);
                        this.valueDts = orgz.orgz_ubigeo.ubg_dst;
                        this.loadPatientsDst(this.valueDts);
                    }
                }
            },
            errorOrgz => {
                console.log(errorOrgz);
            }
        );        
    }

    loadUbigeoDpt(): void {
        try {
            this._ubigeoService.getListDpt().subscribe(
                data => {
                    if (data.res_service == 'ok') {
                        if (data.data_result.Count > 0) {
                            this.listUbigeoDpt = data.data_result.Items;
                            this.listUbigeoDpt = this.listUbigeoDpt.sort(function (a, b) {
                                return a.ubg_dsc.localeCompare(b.ubg_dsc);
                            });
                        } else {
                            this._matSnackBar.open('No se cargo correctamente el ubigeo.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                            this._router.navigateByUrl('/errors/error-500');
                        }
                    } else {
                        this._matSnackBar.open('No se cargo correctamente el ubigeo.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        this._router.navigateByUrl('/errors/error-500');
                    }
                }
            );
        } catch (error) {
            this._matSnackBar.open('No se cargo correctamente el ubigeo.', 'Aceptar', {
                verticalPosition: 'top',
                duration: 2000
            });
            this._router.navigateByUrl('/errors/error-500');
        }
    }

    loadUbigeoPrv(ubg_dpt): void {
        this.listUbigeoDst = [];
        this.loading = true;
        this.ubg_dpt = ubg_dpt;
        const ubigeoBody = {
            ubg_dpt: ubg_dpt
        };
        this._ubigeoService.getListPrv(ubigeoBody).subscribe(
            data => {
                if (data.res_service == 'ok') {
                    if (data.data_result.Count > 0) {
                        this.listUbigeoPrv = data.data_result.Items.sort(function (a, b) {
                            return a.ubg_dsc.localeCompare(b.ubg_dsc);
                        });
                        this.listUbigeoPrv = this.listUbigeoPrv.filter(x => x.ubg_prv != '0');
                    } else {
                        this._matSnackBar.open('No se cargo correctamente el ubigeo provincia.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        this._router.navigateByUrl('/errors/error-500');
                    }
                } else {
                    this._matSnackBar.open('No se cargo correctamente el ubigeo provincia.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    this._navCtrl.navigate('/errors/error-500', { error: data.error_desc });
                }
            },
            error => {
                this._matSnackBar.open('No se cargo correctamente el ubigeo provincia.', 'Aceptar', {
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

    loadUbigeoDst(ubg_prv): void {
        this.ubg_prv = ubg_prv;
        const ubigeoBody = {
            ubg_dpt: this.ubg_dpt,
            ubg_prv: ubg_prv
        };
        this._ubigeoService.getListDst(ubigeoBody).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.Count > 0) {
                        this.listUbigeoDst = data.data_result.Items.sort(function (a, b) {
                            return a.ubg_dsc.localeCompare(b.ubg_dsc);
                        });
                        this.listUbigeoDst = this.listUbigeoDst.filter(x => x.ubg_dst !== '0');
                    } else {
                        this._matSnackBar.open('No se cargo correctamente el ubigeo distrito.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        this._router.navigateByUrl('/errors/error-500');
                    }
                } else {
                    this._matSnackBar.open('No se cargo correctamente el ubigeo distrito.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    this._router.navigateByUrl('/errors/error-500');
                }
            }
        );
    }

    loadPatientsDst(ubg_dst): void {
        this.loading = true;
        const bodyPatientDst = {
            type: 'dst',
            ubg_dpt: this.ubg_dpt,
            ubg_prv: this.ubg_prv,
            ubg_dst: ubg_dst
        };
        this._patientService.getPatientsUbigeo(bodyPatientDst).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.Count > 0) {
                        this.showMapa = true;
                        this.lat = Number.parseFloat(data.data_result.Items[0].pat_geoloc_info.pat_latitude);
                        this.lng = Number.parseFloat(data.data_result.Items[0].pat_geoloc_info.pat_longitude);                        
                        data.data_result.Items.forEach(element => {
                            let currentIcon = 'assets/images/patient/green-happy-face.png';
                            let currentState = '';

                            const currentDay = this._registryUtil.getStringFromDate(moment());
                            const tracingDay = element.pat_schedule_tracing_data.find(x => x.schedule_date == currentDay);                            

                            if (tracingDay != null) {
                                currentIcon = 'assets/images/patient/notif_tracing_10.gif';
                                if (element.pat_medic_info.pat_hcd >= 11.6) {
                                    currentState = 'Normal';                                    
                                } else if (element.pat_medic_info.pat_hcd < 11.6 && element.pat_medic_info.pat_hcd >= 11) {
                                    currentState = 'En riesgo';                                    
                                } else if (element.pat_medic_info.pat_hcd < 11 && element.pat_medic_info.pat_hcd >= 9.99) {
                                    currentState = 'Anemia Leve';                                    
                                } else if (element.pat_medic_info.pat_hcd < 9.99 && element.pat_medic_info.pat_hcd >= 7.01) {
                                    currentState = 'Anemia moderada';                                    
                                } else if (element.pat_medic_info.pat_hcd < 7.01) {
                                    currentState = 'Anemia Severa';                                    
                                }                                
                            } else {
                                if (element.pat_medic_info.pat_hcd >= 11.6) {
                                    currentState = 'Normal';
                                    currentIcon = 'assets/images/patient/green-happy-face.png';
                                } else if (element.pat_medic_info.pat_hcd < 11.6 && element.pat_medic_info.pat_hcd >= 11) {
                                    currentState = 'En riesgo';
                                    currentIcon = 'assets/images/patient/yellow-neutral-face.png';
                                } else if (element.pat_medic_info.pat_hcd < 11 && element.pat_medic_info.pat_hcd >= 9.99) {
                                    currentState = 'Anemia Leve';
                                    currentIcon = 'assets/images/patient/red-sad-face.png';
                                } else if (element.pat_medic_info.pat_hcd < 9.99 && element.pat_medic_info.pat_hcd >= 7.01) {
                                    currentState = 'Anemia moderada';
                                    currentIcon = 'assets/images/patient/red-sad-face.png';
                                } else if (element.pat_medic_info.pat_hcd < 7.01) {
                                    currentState = 'Anemia Severa';
                                    currentIcon = 'assets/images/patient/red-sad-face.png';
                                }
                            }

                            const htmlUrl = '<p>' + element.pat_basic_info.pat_names + '</p>';
                            let htmlInfo = '<p>' + 'Hcto: ' + element.pat_medic_info.pat_hem + '<br/>' 
                                                   + 'HCD: ' + element.pat_medic_info.pat_hcd + '<br/>' 
                                                   + 'N° Muestra: ' + element.pat_medic_info.pat_hcd + '<br/>' 
                                                   + 'Estado: ' + currentState ;
                                    
                            if (tracingDay != null) {
                                htmlInfo =  htmlInfo + '<br/><br/>¡Hoy le toca su tratamiento!';
                            }     

                            htmlInfo = htmlInfo + '</p>';

                            this.markers.push(
                                {
                                    lat: element.pat_geoloc_info.pat_latitude,
                                    lng: element.pat_geoloc_info.pat_longitude,
                                    label: element.pat_medic_info.pat_hcd,
                                    draggable: false,
                                    iconUrl: currentIcon,
                                    infoWindow: htmlInfo,
                                    navigateUrl: htmlUrl,
                                    pat_id: element.pat_id
                                }
                            );
                        });                        
                    } else {
                        this._matSnackBar.open('No existe información de pacientes para este distrito.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                    }
                } else {
                    this._matSnackBar.open('No se pudo cargar correctamente la información.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                }
            }, err => {
                console.log(err);
            }, () => {
                this.loading = false;
            }
        );
    }

    clickedMarker(label: string, index: number): void {
        console.log(`clicked the marker: ${label || index}`);
    }

    markerDragEnd(m: markerModel, $event: MouseEvent): void {
        console.log('dragEnd', m, $event);
    }

    navigateToPatientDetails(value): void {
        this._router.navigateByUrl('/patients/' + value + '/details');
        console.log(value);
    }
}
