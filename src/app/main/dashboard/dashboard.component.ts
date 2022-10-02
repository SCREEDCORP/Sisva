import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import * as shape from 'd3-shape';

import { fuseAnimations } from '@fuse/animations';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ProjectDashboardService } from '../../services/dashboard.service';
import { UserModel } from 'app/models/user.model';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { UserService } from 'app/services/user.service';
import * as moment from 'moment';
import { OrganizationService } from 'app/services/organization.service';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DashboardComponent implements OnInit {
    projects: any[];
    selectedProject: any;

    widgets: any;
    widget4: any = {};
    widget5: any = {};
    widget6: any = {};
    widget7: any = {};
    widget8: any = {};

    dateNow = Date.now();

    public user: UserModel;

    public userDataDasboard = {
        taskToday: 0,
        taskComplete: 0,
        taskDue: 0,
        taskOrgz: 0,
        patYearsOrgz: 0
    };

    private rangesMonths: {
        range01: any,
        range02: any,
        range03: any,
        range04: any
     };

    private ranges = { };

    private patientsTracingAne = [];
    private patientsTracingOk = [];
    
    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {ProjectDashboardService} _projectDashboardService
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private _projectDashboardService: ProjectDashboardService,
        private _organizationService: OrganizationService,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _userService: UserService
    ) {
        moment.locale('es');
        this.rangesMonths = {
            range01: moment(),
            range02: moment().subtract(1, 'month'),
            range03: moment().subtract(2, 'month'),
            range04: moment().subtract(3, 'month')
        };
        this.ranges = {
            '04': this.capitalizeFirstLetter(this.rangesMonths.range04.format('MMMM')),
            '03': this.capitalizeFirstLetter(this.rangesMonths.range03.format('MMMM')),
            '02': this.capitalizeFirstLetter(this.rangesMonths.range02.format('MMMM')),
            '01': this.capitalizeFirstLetter(this.rangesMonths.range01.format('MMMM'))
        };
        /**
         * Widget 5
         */
        this.widget5 = {
            currentRange: '01',
            xAxis: true,
            yAxis: true,
            gradient: false,
            legend: false,
            showXAxisLabel: false,
            xAxisLabel: 'Days',
            showYAxisLabel: false,
            yAxisLabel: 'Isues',
            scheme: {
                domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
            },
            onSelect: (ev) => {
                console.log(ev);
            },
            supporting: {
                currentRange: '01',
                xAxis: false,
                yAxis: false,
                gradient: false,
                legend: false,
                showXAxisLabel: false,
                xAxisLabel: 'Days',
                showYAxisLabel: false,
                yAxisLabel: 'Isues',
                scheme: {
                    domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
                },
                curve: shape.curveBasis
            }
        };

        this.widget4 = {
            currentRange: '01',
            xAxis: true,
            yAxis: true,
            gradient: false,
            legend: false,
            showXAxisLabel: false,
            xAxisLabel: 'Days',
            showYAxisLabel: false,
            yAxisLabel: 'Isues',
            scheme: {
                domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
            },
            onSelect: (ev) => {
                console.log(ev);
            },
            supporting: {
                currentRange: '01',
                xAxis: false,
                yAxis: false,
                gradient: false,
                legend: false,
                showXAxisLabel: false,
                xAxisLabel: 'Days',
                showYAxisLabel: false,
                yAxisLabel: 'Isues',
                scheme: {
                    domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
                },
                curve: shape.curveBasis
            }
        };

        /**
         * Widget 6
         */
        this.widget6 = {
            currentRange: '01',
            legend: false,
            explodeSlices: false,
            labels: true,
            doughnut: true,
            gradient: false,
            scheme: {
                domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63']
            },
            onSelect: (ev) => {
                console.log(ev);
            }
        };

        this.widget7 = {
            currentRange: '01'
        };

        this.widget8 = {
            currentRange: '01',
            legend: false,
            explodeSlices: false,
            labels: true,
            doughnut: true,
            gradient: false,
            scheme: {
                domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63']
            },
            onSelect: (ev) => {
                console.log(ev);
            }
        };

        setInterval(() => {
            this.dateNow = Date.now();
        }, 1000);

        this.user = new UserModel();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.projects = this._projectDashboardService.projects;
        this.selectedProject = this.projects[0];
        this.widgets = this._projectDashboardService.widgets;
        this.loadUserInfo();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    loadUserInfo(): void {
        const oUserLoged = this._userService.getUserLoged();
        if (oUserLoged.user_id !== '0') {
            this._userService.postDetails(oUserLoged).subscribe(
                data => {
                    if (data.res_service === 'ok') {
                        if (data.data_result.Count > 0) {
                            this.user = new UserModel(data.data_result.Items[0]);
                            this.user.user_password = '';
                            this.user.user_mail_leader = '';
                            if (this.user.user_valid === '0') {
                                this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 2000
                                });
                                this._router.navigateByUrl('/security/login');
                            } else {
                                this.CargarInformacionDashBoard(this.user);
                                sessionStorage.setItem('sisva_user_details_loged', JSON.stringify(this.user));
                            }
                        } else {
                            this._matSnackBar.open('No se pudo obtener la información del usuario.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                            localStorage.removeItem('sisva_user_login');
                            sessionStorage.removeItem('sisva_user_login');
                            this._router.navigateByUrl('/security/login');
                        }
                    } else {
                        this._matSnackBar.open('No se pudo obtener la información del usuario.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        localStorage.removeItem('sisva_user_login');
                        sessionStorage.removeItem('sisva_user_login');
                        this._router.navigateByUrl('/security/login');
                    }
                },
                error => {
                    this._matSnackBar.open('No se pudo obtener la información del usuario.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    localStorage.removeItem('sisva_user_login');
                    sessionStorage.removeItem('sisva_user_login');
                    this._router.navigateByUrl('/security/login');
                },
                () => {
                }
            );
        }
    }

    CargarInformacionDashBoard(user: UserModel): any {
        const currentDate = moment().format('YYYY-MM-DD');
        this.userDataDasboard.taskToday = user.user_tasks.filter(x => x.schedule_date === currentDate && x.schedule_ejec === '0').length;
        this.userDataDasboard.taskComplete = user.user_tasks.filter(x => x.schedule_date === currentDate && x.schedule_ejec === '1').length;
        this.userDataDasboard.taskDue = user.user_tasks.filter(x => x.schedule_date < currentDate && x.schedule_ejec === '0').length;

        this._userService.postOrganizationTask({ orgz_id: this.user.user_organization.orgz_id }).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.length > 0) {
                        this.userDataDasboard.taskOrgz = data.data_result.filter(x => x.schedule_date < currentDate && x.schedule_ejec === '0').length;
                    }
                }
            }
        );

        this._projectDashboardService.postOrgzPatients({ orgz_id: this.user.user_organization.orgz_id, pat_flg_ane: true }).subscribe(
            dataPatients => {
                if (dataPatients.res_service === 'ok') {
                    if (dataPatients.data_result.length > 0) {
                        dataPatients.data_result.filter(x => x.pat_schedule_tracing_data.length > 0).forEach(element => {
                            element.pat_schedule_tracing_data.filter(x => x.schedule_ejec === '1' && x.schedule_trc_data.trc_hcd != null).forEach(elementTracing => {
                                this.patientsTracingAne.push(elementTracing);
                            });
                        });
                
                        dataPatients.data_result.filter(x => x.pat_schedule_tracing_data.length == 0).forEach(element => {
                            this.patientsTracingOk.push(
                                {
                                    fec_reg: element.fec_reg
                                }
                            );
                        });
                        this.CargarInformacionAvanceAnual(dataPatients.data_result);
                        this.CargarInformacionAvanceAnemia(dataPatients.data_result);

                        this.CargarInformacionAvanceTamizados(dataPatients.data_result);
                        this.CargarInformacionAvancePieCharTamizado(dataPatients.data_result);
                        
                        dataPatients.data_result.forEach(element => {
                            const currentDatePat = moment();
                            const fecNacDate = moment(element.pat_basic_info.pat_fec_nac);
                            const years = currentDatePat.diff(fecNacDate, 'years');
                            if (years >= 5) {
                                this.userDataDasboard.patYearsOrgz = this.userDataDasboard.patYearsOrgz + 1;
                            }
                        });
                    }
                }
            }
        );
    }

    async CargarInformacionAvancePieCharTamizado(patients: any) {
        console.log(this.patientsTracingAne);
        this.widgets.widget8.ranges = this.ranges;
        const detailsBody = {
            orgz_id: this.user.user_organization.orgz_id
        };

        this._organizationService.postDetailsOrgz(detailsBody).subscribe(
            data => {
                if (data.res_service === 'ok') {
                    if (data.data_result.Count > 0) {
                        const organization = data.data_result.Items[0];
                        console.log(organization);
                        this.loadPieChardAnemTam(this.rangesMonths.range01, this.widgets.widget8, '01', organization);
                        this.loadPieChardAnemTam(this.rangesMonths.range02, this.widgets.widget8, '02', organization);
                        this.loadPieChardAnemTam(this.rangesMonths.range03, this.widgets.widget8, '03', organization);
                        this.loadPieChardAnemTam(this.rangesMonths.range04, this.widgets.widget8, '04', organization);
                    }
                }
            }
        );
    }

    async CargarInformacionAvanceAnemia(patients: any) {
        this.widgets.widget6.ranges = this.ranges;
        this.loadPieChardAnem(this.rangesMonths.range01, this.widgets.widget6, '01');
        this.loadPieChardAnem(this.rangesMonths.range02, this.widgets.widget6, '02');
        this.loadPieChardAnem(this.rangesMonths.range03, this.widgets.widget6, '03');
        this.loadPieChardAnem(this.rangesMonths.range04, this.widgets.widget6, '04');
    }
    
    loadPieChardAnemTam(range: any, widget6: any, rangeStr: any, organization: any): void {
        const patientsTrat = this.patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range.format('YYYY-MM')).length;
        const patientsNoTrat = this.patientsTracingOk.filter(x => moment(x.fec_reg).format('YYYY-MM') == range.format('YYYY-MM')).length;

        let dataProjectionNumber = 0;
        let patientsNoTam = 0;

        const dataProjection = organization.orgz_projections.find(x => x.orgz_proj_date === range.format('YYYY-MM'));
        if (dataProjection != null) {
            dataProjectionNumber = dataProjection.orgz_proj_number;
            patientsNoTam = dataProjectionNumber - (patientsTrat + patientsNoTrat);
        }
        const dataRangeMonth = [
            {
                'name' : 'Niños tamizados',
                'value': patientsTrat + patientsNoTrat
            },
            {
                'name' : 'Niños no tamizados',
                'value': patientsNoTam
            },
            {
                'name' : 'Padres que no quieren que se realice el tamizaje',
                'value': this.patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range.format('YYYY-MM') 
                && x.schedule_trc_data.trc_ane_state == '5').length
            }
        ];
        widget6.mainChart[rangeStr] = dataRangeMonth;
        widget6.footerLeft.count[rangeStr] = patientsTrat + patientsNoTrat;
        widget6.footerRight.count[rangeStr] = patientsNoTam;        
    }

    loadPieChardAnem(range: any, widget6: any, rangeStr: any): void {
        const patientsTrat = this.patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range.format('YYYY-MM')).length;
        const patientsNoTrat = this.patientsTracingOk.filter(x => moment(x.fec_reg).format('YYYY-MM') == range.format('YYYY-MM')).length;
        const dataRangeMonth = [
            {
                'name' : 'Niños tratados',
                'value': patientsTrat
            },
            {
                'name' : 'Niños no tratados',
                'value': patientsNoTrat
            },
            {
                'name' : 'Niños recuperados completos (un niño recuperado es aquel que tenga mas de 11 en hemoglobina + 6 suplementaciones)',
                'value': this.patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range.format('YYYY-MM') 
                                                     && x.schedule_trc_data.trc_ane_state == '2').length
            },
            {
                'name' : 'Niños recuperados Incompletos (un niño como hemoglobina mayor o = 11 sin cumplir sus 6 suplementaciones)',
                'value': this.patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range.format('YYYY-MM') 
                                                     && x.schedule_trc_data.trc_ane_state == '3').length
            },
            {
                'name' : 'Cantidad de niños referidos (niños sin aumento de hemoglobina con 3 suplementaciones)',
                'value': this.patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range.format('YYYY-MM') 
                                                     && x.schedule_trc_data.trc_ane_state == '4').length
            },
            {
                'name' : 'Padres que no quieren que se realice el tratamiento',
                'value': this.patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range.format('YYYY-MM') 
                                                     && x.schedule_trc_data.trc_ane_state == '5').length
            }
        ];
        widget6.mainChart[rangeStr] = dataRangeMonth;
        widget6.footerLeft.count[rangeStr] = patientsTrat;
        widget6.footerRight.count[rangeStr] = patientsNoTrat;        
    }

    async CargarInformacionAvanceTamizados(patients: any) {
        this.widgets.widget4.ranges = this.ranges;
        this.loadPatientsReportData(this.rangesMonths.range01, this.patientsTracingOk, this.patientsTracingAne, '01', this.widgets.widget4);
        this.loadPatientsReportData(this.rangesMonths.range02, this.patientsTracingOk, this.patientsTracingAne, '02', this.widgets.widget4);
        this.loadPatientsReportData(this.rangesMonths.range03, this.patientsTracingOk, this.patientsTracingAne, '03', this.widgets.widget4);
        this.loadPatientsReportData(this.rangesMonths.range04, this.patientsTracingOk, this.patientsTracingAne, '04', this.widgets.widget4);
        this.loadSupporting(this.rangesMonths, patients, this.widgets.widget4);
        this.loadSupportingTam(patients, this.widgets.widget4);
        this.loadSupportingProm(this.rangesMonths, this.patientsTracingAne, this.widgets.widget4);
        this.loadSupportingAnemPercent(this.rangesMonths, this.patientsTracingAne, this.patientsTracingOk, this.widgets.widget4);
        this.loadSupportingTrat(this.rangesMonths, this.patientsTracingAne, this.widgets.widget4);
    }

    async CargarInformacionAvanceAnual(patients: any) {
        this.widgets.widget5.ranges = this.ranges;
        this.loadPatientsReportData(this.rangesMonths.range01, this.patientsTracingOk, this.patientsTracingAne, '01', this.widgets.widget5);
        this.loadPatientsReportData(this.rangesMonths.range02, this.patientsTracingOk, this.patientsTracingAne, '02', this.widgets.widget5);
        this.loadPatientsReportData(this.rangesMonths.range03, this.patientsTracingOk, this.patientsTracingAne, '03', this.widgets.widget5);
        this.loadPatientsReportData(this.rangesMonths.range04, this.patientsTracingOk, this.patientsTracingAne, '04', this.widgets.widget5);        
        this.loadSupporting(this.rangesMonths, patients, this.widgets.widget5);
        this.loadSupportingProm(this.rangesMonths, this.patientsTracingAne, this.widgets.widget5);
        this.loadSupportingAnemPercent(this.rangesMonths, this.patientsTracingAne, this.patientsTracingOk, this.widgets.widget5);
        this.loadSupportingTrat(this.rangesMonths, this.patientsTracingAne, this.widgets.widget5);
    }    

    loadSupportingTam(patients: any, widget: any): void {
        patients.filter(x => x.pat_schedule_tracing_data.length == 0).forEach(element => {
            if (moment(patients.fec_reg).format('YYYY-MM') == this.rangesMonths.range01.format('YYYY-MM')) {          
                this.loadSupportingDataRangeTam(element, '01', widget);       
            }
    
            if (moment(patients.fec_reg).format('YYYY-MM') == this.rangesMonths.range02.format('YYYY-MM')) {          
                this.loadSupportingDataRangeTam(element, '02', widget);       
            }
    
            if (moment(patients.fec_reg).format('YYYY-MM') == this.rangesMonths.range03.format('YYYY-MM')) {          
                this.loadSupportingDataRangeTam(element, '03', widget);       
            }
    
            if (moment(patients.fec_reg).format('YYYY-MM') == this.rangesMonths.range04.format('YYYY-MM')) {          
                this.loadSupportingDataRangeTam(element, '04', widget);       
            }
        });
    }

    loadSupporting(rangesMonths: any, patients: any, widget: any): void {
        patients.filter(x => x.pat_schedule_tracing_data.length > 0).forEach(element => {
            element.pat_schedule_tracing_data.filter(x => x.schedule_ejec === '1' && x.schedule_trc_data.trc_hcd != null).forEach(elementTracing => {        
                this.loadSupportingData(rangesMonths, element, elementTracing, widget);
            });
        });
    }

    loadSupportingData(rangeMonths: any, element: any, elementTracing: any, widget: any): void {
        if (moment(elementTracing.schedule_date).format('YYYY-MM') == rangeMonths.range01.format('YYYY-MM')) {          
            this.loadSupportingDataRange(element, elementTracing, '01', widget);       
        }

        if (moment(elementTracing.schedule_date).format('YYYY-MM') == rangeMonths.range02.format('YYYY-MM')) {          
            this.loadSupportingDataRange(element, elementTracing, '02', widget);       
        }

        if (moment(elementTracing.schedule_date).format('YYYY-MM') == rangeMonths.range03.format('YYYY-MM')) {          
            this.loadSupportingDataRange(element, elementTracing, '03', widget);       
        }

        if (moment(elementTracing.schedule_date).format('YYYY-MM') == rangeMonths.range04.format('YYYY-MM')) {          
            this.loadSupportingDataRange(element, elementTracing, '04', widget);       
        }
    }

    loadSupportingDataRange(element: any, elementTracing: any, arg2: string, widget: any): void {
        const currentDatePat = moment(elementTracing.schedule_date);
        const fecNacDate = moment(element.pat_basic_info.pat_fec_nac);

        const years = currentDatePat.diff(fecNacDate, 'years');
        fecNacDate.add(years, 'years');
        const months = currentDatePat.diff(fecNacDate, 'months');

        if (years == 0 && (months >= 0 && months < 6)) {
            widget.supporting.etareo1.count[arg2] = widget.supporting.etareo1.count[arg2] + 1;
        }

        if ((years == 0 && (months >= 0 && months >= 6)) || (years >= 1 && years < 3)) {
            widget.supporting.etareo2.count[arg2] = widget.supporting.etareo2.count[arg2] + 1;
        }

        if (years >= 3 && years < 5) {
            widget.supporting.etareo3.count[arg2] = widget.supporting.etareo3.count[arg2] + 1;
        } 
    }

    loadSupportingDataRangeTam(element: any, range: string, widget: any): void {
        const currentDatePat = moment(element.fec_reg);
        const fecNacDate = moment(element.pat_basic_info.pat_fec_nac);

        const years = currentDatePat.diff(fecNacDate, 'years');
        fecNacDate.add(years, 'years');
        const months = currentDatePat.diff(fecNacDate, 'months');

        if (years == 0 && (months >= 0 && months < 6)) {
            widget.supporting.etareo1.count[range] = widget.supporting.etareo1.count[range] + 1;
        }

        if ((years == 0 && (months >= 0 && months >= 6)) || (years >= 1 && years < 3)) {
            widget.supporting.etareo2.count[range] = widget.supporting.etareo2.count[range] + 1;
        }

        if (years >= 3 && years < 5) {
            widget.supporting.etareo3.count[range] = widget.supporting.etareo3.count[range] + 1;
        } 
    }

    loadPatientsReportData(range01: any, patientsTracingOk: any[], patientsTracingAne: any[], arg3: string, widget: any): void {
        const dataRange = [];
        this.weeks(range01).forEach((element) => {
            dataRange.push({
                'name': 'Del ' + moment(element.startDate).format('DD') + ' al ' + moment(element.endDate).format('DD'),
                'series': [
                    {
                        'name': 'Niños sanos',
                        'value': patientsTracingOk.filter(x => x.fec_reg >= element.startDate && x.fec_reg <= element.endDate).length
                    },
                    {
                        'name': 'Niños en riesgo',
                        'value': patientsTracingAne.filter(x => x.schedule_date >= element.startDate
                            && x.schedule_date <= element.endDate
                            && (x.schedule_trc_data.trc_hcd < 11.6 && x.schedule_trc_data.trc_hcd >= 11)).length
                    },
                    {
                        'name': 'Niños con anemia leve',
                        'value': patientsTracingAne.filter(x => x.schedule_date >= element.startDate
                            && x.schedule_date <= element.endDate
                            && (x.schedule_trc_data.trc_hcd < 11 && x.schedule_trc_data.trc_hcd >= 9.99)).length
                    },
                    {
                        'name': 'Niños con anemia moderada',
                        'value': patientsTracingAne.filter(x => x.schedule_date >= element.startDate
                            && x.schedule_date <= element.endDate
                            && (x.schedule_trc_data.trc_hcd < 9.99 && x.schedule_trc_data.trc_hcd >= 7.01)).length
                    },
                    {
                        'name': 'Niños con anemia severa',
                        'value': patientsTracingAne.filter(x => x.schedule_date >= element.startDate
                            && x.schedule_date <= element.endDate
                            && (x.schedule_trc_data.trc_hcd < 7.01)).length
                    }
                ]
            });
        });
        widget.mainChart[arg3] = dataRange;
    }

    loadSupportingTrat(rangesMonths: any, patientsTracingAne: any[], widget: any): void {
        widget.supporting.tratamiento.count['01'] = patientsTracingAne.filter(x => x.schedule_trc_data.trc_ane_state === '1' 
                                                                                  && moment(x.schedule_date).format('YYYY-MM') == rangesMonths.range01.format('YYYY-MM')).length;

        widget.supporting.tratamiento.count['02'] = patientsTracingAne.filter(x => x.schedule_trc_data.trc_ane_state === '1' 
                                                                                  && moment(x.schedule_date).format('YYYY-MM') == rangesMonths.range02.format('YYYY-MM')).length;

        widget.supporting.tratamiento.count['03'] = patientsTracingAne.filter(x => x.schedule_trc_data.trc_ane_state === '1' 
                                                                                  && moment(x.schedule_date).format('YYYY-MM') == rangesMonths.range03.format('YYYY-MM')).length;

        widget.supporting.tratamiento.count['04'] = patientsTracingAne.filter(x => x.schedule_trc_data.trc_ane_state === '1' 
                                                                                  && moment(x.schedule_date).format('YYYY-MM') == rangesMonths.range04.format('YYYY-MM')).length;
    }

    loadSupportingAnemPercent(rangesMonths: any, patientsTracingAne: any[], patientsTracingOk: any[], widget: any): void {
        this.loadSupportingAnemPercenteRange(rangesMonths.range01, patientsTracingAne, patientsTracingOk, '01', widget);
        this.loadSupportingAnemPercenteRange(rangesMonths.range02, patientsTracingAne, patientsTracingOk, '02', widget);
        this.loadSupportingAnemPercenteRange(rangesMonths.range03, patientsTracingAne, patientsTracingOk, '03', widget);
        this.loadSupportingAnemPercenteRange(rangesMonths.range04, patientsTracingAne, patientsTracingOk, '04', widget);
    }

    loadSupportingAnemPercenteRange(range01: any, patientsTracingAne: any[], patientsTracingOk: any[], range: any, widget: any): void {
        const tTratamientosAne = patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') == range01.format('YYYY-MM')).length;
        const tTratamientosOk = patientsTracingOk.filter(x => moment(x.fec_reg).format('YYYY-MM') == range01.format('YYYY-MM')).length;
        if ((tTratamientosAne + tTratamientosOk) > 0 ) {
            widget.supporting.anemia.count[range] = ((tTratamientosAne / (tTratamientosAne + tTratamientosOk)) * 100).toFixed(1).toString() + ' %';
        } else {
            widget.supporting.anemia.count[range] = '0 %';
        }        
    }

    loadSupportingProm(rangesMonths: any, patientsTracingAne: any[], widget: any): void {
        widget.supporting.promedio.count['01'] = ((patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') 
                                                                                                == rangesMonths.range01.format('YYYY-MM')).length) / 
                                                                                                   rangesMonths.range01.daysInMonth()).toFixed(1);
        widget.supporting.promedio.count['02'] = ((patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') 
                                                                                                == rangesMonths.range02.format('YYYY-MM')).length) / 
                                                                                                   rangesMonths.range02.daysInMonth()).toFixed(1);                
        widget.supporting.promedio.count['03'] = ((patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') 
                                                                                                == rangesMonths.range03.format('YYYY-MM')).length) / 
                                                                                                   rangesMonths.range03.daysInMonth()).toFixed(1);
        widget.supporting.promedio.count['04'] = ((patientsTracingAne.filter(x => moment(x.schedule_date).format('YYYY-MM') 
                                                                                                == rangesMonths.range04.format('YYYY-MM')).length) / 
                                                                                                   rangesMonths.range04.daysInMonth()).toFixed(1);        
    }

    capitalizeFirstLetter(string): any {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    weeks(momentDate): any {
        const lastOfMonth = momentDate.clone().endOf('month');
        const lastOfMonthDate = lastOfMonth.date();
        const firstOfMonth = momentDate.clone().startOf('month');
        const currentWeek = firstOfMonth.clone().day(0);
        const output = [];
        let startOfWeek;
        let endOfWeek;

        while (currentWeek < lastOfMonth) {
            startOfWeek = this.sameMonth(currentWeek.clone().day(0), firstOfMonth, 1);
            endOfWeek = this.sameMonth(currentWeek.clone().day(6), firstOfMonth, lastOfMonthDate);

            output.push({
                startDate: momentDate._d.getFullYear() + '-' + ('00' + (momentDate._d.getMonth() + 1)).slice(-2) + '-' + ('00' + startOfWeek).slice(-2),
                endDate: momentDate._d.getFullYear() + '-' + ('00' + (momentDate._d.getMonth() + 1)).slice(-2) + '-' + ('00' + endOfWeek).slice(-2)
            });
            currentWeek.add(7, 'days');
        }

        return output;
    }

    sameMonth(a, b, other): any {
        if (a.month() !== b.month()) {
            return other;
        }
        return a.date();
    }
}

export class FilesDataSource extends DataSource<any>
{
    /**
     * Constructor
     *
     * @param _widget11
     */
    constructor(private _widget11) {
        super();
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
        return this._widget11.onContactsChanged;
    }

    /**
     * Disconnect
     */
    disconnect(): void {
    }
}

