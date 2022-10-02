import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar, MAT_DATE_FORMATS, MatStepper, MatDialog, DateAdapter, MAT_DATE_LOCALE, MatDatepicker } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistryUtil } from 'app/utils/registry.util';
import { NgxNavigationWithDataComponent } from 'ngx-navigation-with-data';
import { OrganizationModel } from 'app/models/organization.model';
import { OrganizationService } from 'app/services/organization.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment';
import * as moment from 'moment';
import { UserService } from 'app/services/user.service';

export const MY_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM',
    },
    display: {
        dateInput: 'YYYY-MM',
        monthYearLabel: 'YYYY MMM',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY MMMM',
    },
};

@Component({
    selector: 'projection',
    templateUrl: './projection.component.html',
    styleUrls: ['./projection.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class ProjectionComponent implements OnInit, OnDestroy {
    @ViewChild('stepper') stepper: MatStepper;
    pageType: string;

    projectionForm: FormGroup;

    projections: any[];
    projection: any;

    Organization: any;
    public loading = false;
    public maxDateFecNac = new Date();
    public showEditProjection = false;
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
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _registryUtil: RegistryUtil,
        public _navCtrl: NgxNavigationWithDataComponent,
        private _organizationService: OrganizationService,
        private _activateRoute: ActivatedRoute,
        private _userService: UserService,
        public dialog: MatDialog,
    ) {
        moment.locale('es');
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
        // Subscribe to update product on changes
        this._organizationService.onOrganizationProjectionsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(Organization => {
                this._activateRoute.params.subscribe(
                    param => {
                        if (param.id) {
                            if (param.id == 'new') {
                                this.pageType = 'new';
                                this.Organization = new OrganizationModel();
                                this.loadProjections(Organization);
                            } else {
                                this.pageType = 'edit';
                                this.Organization = new OrganizationModel(Organization);
                                this.loadProjection(Organization, param.id);
                            }
                        }
                    }
                );
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

    loadProjections(projections): void {
        this.projections = projections;
        this.projections.sort(function(a, b) {
            return (a.orgz_proj_date < b.orgz_proj_date) ? -1 : ((a.orgz_proj_date > b.orgz_proj_date) ? 1 : 0);
        });      
        this.createProjectionForm(null, this.projections);
    }

    loadProjection(projections: any[], projDate: any): void {
        this.projections = projections;
        this.projection = projections.find(x => x.orgz_proj_date === projDate);
        this.showEditProjection = true;
        this.createProjectionForm(this.projection, null);
    }

    createProjectionForm(projection?, projections?: any[]): void {
        try {
            if (projection) {
                this.projectionForm = this._formBuilder.group({
                    orgz_proj_date: [ {
                        value : moment(this.projection.orgz_proj_year).add(-1, 'month'),
                        disabled: true
                    }, Validators.required],
                    orgz_proj_number: [projection.orgz_proj_number, Validators.required],                    
                });
            } else {
                const currentProjection = moment();
                projections.forEach(element => {
                    while (element.orgz_proj_date === currentProjection.format('YYYY-MM')) {
                        currentProjection.add(1, 'month');
                    }
                });
                this.projectionForm = this._formBuilder.group({
                    orgz_proj_date: [currentProjection, Validators.required],
                    orgz_proj_number: ['', Validators.required]
                });
            }

        } catch (error) {
            console.log(error);
        }
    }

    finalizeRegistry(): void {

    }

    chosenYearHandler(normalizedYear: Moment): void {
        const ctrlValue = this.projectionForm.value.orgz_proj_date;
        ctrlValue.year(normalizedYear.year());
    }

    chosenMonthHandler(normlizedMonth: Moment, datepicker: MatDatepicker<Moment>): void {
        const ctrlValue = this.projectionForm.value.orgz_proj_date;
        ctrlValue.month(normlizedMonth.month());
        this.projectionForm.controls.orgz_proj_date.setValue(ctrlValue);
        datepicker.close();
    }

    addProjection(): void {
        this.loading = true;
        this.projections.push(
            {
                orgz_proj_number: this.projectionForm.value.orgz_proj_number,
                orgz_proj_date: this._registryUtil.getStringFromDateFormat(this.projectionForm.value.orgz_proj_date),
                user_reg: this._userService.getUserLoged().user_id,
                fec_reg: this._registryUtil.getDateRegistry(),
                stat_reg: '1'
            }
        );
        const projectionBody = {
            orgz_id: this._userService.getUserLoged().user_organization.orgz_id,
            orgz_projections: this.projections
        };        
        this._organizationService.patchUpdateProjections(projectionBody).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this._matSnackBar.open(
                        'Se registró correctamente la información.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 3000
                        }
                    );
                    this.projectionForm.controls.orgz_proj_date.setValue(this.projectionForm.value.orgz_proj_date.add(1, 'month'));
                    this.projectionForm.controls.orgz_proj_number.setValue('');
                    this.projections.sort(function(a, b) {
                        return (a.orgz_proj_date < b.orgz_proj_date) ? -1 : ((a.orgz_proj_date > b.orgz_proj_date) ? 1 : 0);
                    });      
                } else {
                    this._navCtrl.navigate('/errors/error-500', {
                        error: data.error_desc
                    });
                }
            },
            error => {
                this._navCtrl.navigate('/errors/error-500', {
                    error: error
                });
            },
            () => {
                this.loading = false;
            }
        );
    }

    updateProjection(): void {
        this.loading = true;
        this.projections.forEach((element, index) => {
            if (element.orgz_proj_date === this.projection.orgz_proj_date) {
                const dataUpdate = {
                    orgz_proj_number: this.projectionForm.value.orgz_proj_number,
                    orgz_proj_date: this.projection.orgz_proj_date,
                    user_reg: element.user_reg,
                    fec_reg: element.fec_reg,
                    user_upd: this._userService.getUserLoged().user_id,
                    fec_upd: this._registryUtil.getDateRegistry(),
                    stat_reg: '1'
                };
                this.projections[index] = dataUpdate;
            }
        });
        const projectionBody = {
            orgz_id: this._userService.getUserLoged().user_organization.orgz_id,
            orgz_projections: this.projections
        };     
        this._organizationService.patchUpdateProjections(projectionBody).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    this._matSnackBar.open(
                        'Se registró correctamente la información.',
                        'Aceptar',
                        {
                            verticalPosition: 'top',
                            duration: 3000
                        }
                    );
                } else {
                    this._navCtrl.navigate('/errors/error-500', {
                        error: data.error_desc
                    });
                }
            },
            error => {
                this._navCtrl.navigate('/errors/error-500', {
                    error: error
                });
            },
            () => {
                this.loading = false;
            }
        );
    }
}
