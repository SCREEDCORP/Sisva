import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { DoseCalculatorUtil } from 'app/utils/dose-calculator.util';

@Component({
    selector: 'dose-calculator',
    templateUrl: './dose-calculator.component.html',
    styleUrls: ['./dose-calculator.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class DoseCalculatorComponent implements OnInit, OnDestroy {
    form: FormGroup;
    step = 0;

    lstAdministration = [];
    lstCondition = [];
    lstAgeRange = [];

    showWeight = false;
    showAgeRange = false;
    showResults = false;

    private _unsubscribeAll: Subject<any>;
    /**
     * Constructor
     */
    constructor(private _formBuilder: FormBuilder,
        private _doseCalculatorUtil: DoseCalculatorUtil) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            dose_adm_id: ['', Validators.required],
            dose_cond_id: ['', Validators.required],
            dose_age_id: ['', Validators.required],
            dose_weigh: ['', Validators.pattern('^[0-9.]*$')],
            dose_res_fe: [''],
            dose_res_time: [''],
            dose_res_sf_drops: [''],
            dose_res_sf_syrup: [''],
            dose_res_hp_drops: [''],
            dose_res_hp_syrup: [''],
        });
        this.lstAdministration = this._doseCalculatorUtil.getAdministration();
        this.lstCondition = this._doseCalculatorUtil.getCondition();
    }

    ngOnDestroy(): void {        
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    setStep(index: number): void {
        this.step = index;
    }

    nextStep(): void {
        this.step++;
    }

    prevStep(): void {
        this.step--;
    }

    loadListAgeRangeAdministration(value): void {
        if (this.form.value.dose_cond_id !== ''){
            this.lstAgeRange = this._doseCalculatorUtil.getAgeRange();
            this.showWeight = false;
            if (value === '1') {
                this.lstAgeRange = this.lstAgeRange.filter(x => x.dose_adm_id === value);
            } else if (value === '2') {
                this.lstAgeRange = this.lstAgeRange.filter(x => x.dose_adm_id === value && x.dose_cond_id === this.form.value.dose_cond_id);
            }
            this.cleanResults();            
        }
    }

    loadListAgeRange(value): void {
        this.lstAgeRange = this._doseCalculatorUtil.getAgeRange();
        this.showWeight = false;
        if (this.form.value.dose_adm_id === '1') {
            this.lstAgeRange = this.lstAgeRange.filter(x => x.dose_adm_id === this.form.value.dose_adm_id);
        } else if (this.form.value.dose_adm_id === '2') {
            this.lstAgeRange = this.lstAgeRange.filter(x => x.dose_adm_id === this.form.value.dose_adm_id && x.dose_cond_id === value);
        }
        this.showAgeRange = true;
        this.cleanResults();
    }

    evaluteShowWeight(value): void {
        const dose_adm_id = this.form.value.dose_adm_id;        
        const dose_weigh = this.form.value.dose_weigh;
        if (dose_adm_id === '1') {
            if (value === '1') {
                this.showWeight = true;
                if (dose_weigh !== '') {
                    this.calculateDose();
                }
            } else {
                this.showWeight = false;
                this.calculateDose();
            }
        } else if (dose_adm_id === '2') {
            this.showWeight = true;
            if (dose_weigh !== '') {
                this.calculateDose();
            }
        }
    }

    calculateDose(): void {        
        const dose_adm_id = this.form.value.dose_adm_id;
        const dose_cond_id = this.form.value.dose_cond_id;
        const dose_age_id = this.form.value.dose_age_id;
        const dose_weigh = this.form.value.dose_weigh;

        let dose_res_fe = 0;
        let dose_res_time = '';
        let dose_res_sf_drops = 0;
        let dose_res_sf_syrup = 0;
        let dose_res_hp_drops = 0;
        let dose_res_hp_syrup = 0;

        let eva_fe = 0;
        const eva_sf_drops = 1.25;
        const eva_sf_syrup = 3;
        const eva_hp_drops = 2.5;
        const eva_hp_syrus = 10;

        if (dose_adm_id === '1') {
            eva_fe = 2;
            if (dose_age_id === '1') {
                dose_res_fe = dose_weigh * eva_fe;
                dose_res_time = 'Hasta los 6 meses';
            } else if (dose_age_id === '2') {
                dose_res_fe = 12.5;
                dose_res_time = 'Un año de tratamiento (360 dias)';
            }
            dose_res_sf_drops = dose_res_fe / eva_sf_drops;
            dose_res_sf_syrup = dose_res_fe / eva_sf_syrup; 
            dose_res_hp_drops = dose_res_fe / eva_hp_drops;                                       
            dose_res_hp_syrup = dose_res_fe / eva_hp_syrus;
        } else if (dose_adm_id === '2') {            
            if (dose_cond_id === '1') {
                eva_fe = 4;
                dose_res_time = '6 meses contínuos';
            } else if (dose_cond_id === '2') {
                eva_fe = 3;
                if (dose_age_id === '4') {
                    dose_res_time = 'Hasta 6 meses';
                } else if (dose_age_id === '5') {
                    dose_res_time = '6 meses contínuos';
                }
            }
            dose_res_fe = dose_weigh * eva_fe;
            dose_res_sf_drops = dose_res_fe / eva_sf_drops;
            dose_res_sf_syrup = dose_res_fe / eva_sf_syrup;
            dose_res_hp_drops = dose_res_fe / eva_hp_drops;
            dose_res_hp_syrup = dose_res_fe / eva_hp_syrus;
        }

        this.form.controls['dose_res_fe'].setValue(Math.round(dose_res_fe * 100) / 100);
        this.form.controls['dose_res_time'].setValue(dose_res_time);
        this.form.controls['dose_res_sf_drops'].setValue(Math.ceil(dose_res_sf_drops));
        this.form.controls['dose_res_hp_drops'].setValue(Math.ceil(dose_res_hp_drops));
        // this.form.controls['dose_res_sf_syrup'].setValue((Math.round(dose_res_sf_syrup * 100) / 100).toFixed(2));        
        // this.form.controls['dose_res_hp_syrup'].setValue((Math.round(dose_res_hp_syrup * 100) / 100).toFixed(2));
        this.form.controls['dose_res_sf_syrup'].setValue(this.round(dose_res_sf_syrup, 1));        
        this.form.controls['dose_res_hp_syrup'].setValue(this.round(dose_res_hp_syrup, 1));

        this.showResults = true;
    }

    cleanResults(): void {
        this.showResults = false;        
        this.form.controls['dose_res_fe'].setValue('');
        this.form.controls['dose_res_time'].setValue('');
        this.form.controls['dose_res_sf_drops'].setValue('');
        this.form.controls['dose_res_sf_syrup'].setValue('');
        this.form.controls['dose_res_hp_drops'].setValue('');
        this.form.controls['dose_res_hp_syrup'].setValue('');
    }

    round(value: number, precision: number): any {
        const multiplier = Math.pow(10, precision || 0);
        return Math.ceil(value * multiplier) / multiplier;
    }
}
