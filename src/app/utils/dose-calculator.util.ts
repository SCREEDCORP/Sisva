import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DoseCalculatorUtil {

    constructor(
    ) { }

    getAdministration(): any {
        return [
            {
                'dose_adm_id': '1',
                'dose_adm_desc': 'Suplementación'
            },
            {
                'dose_adm_id': '2',
                'dose_adm_desc': 'Tratamiento'
            }
        ];
    }

    getCondition(): any {
        return [
            {
                'dose_cond_id': '1',
                'dose_cond_desc': 'Prematuros o bajo peso (< 2500 g)'
            },
            {
                'dose_cond_id': '2',
                'dose_cond_desc': 'A término (> 2500 g)'
            }
        ];
    }

    getAgeRange(): any {
        return [
            {
                'dose_age_id': '1',
                'dose_age_desc': '30 días a 6 meses',
                'dose_adm_id': '1',
                'dose_cond_id': '1'
            },
            {
                'dose_age_id': '2',
                'dose_age_desc': '6 meses a más',
                'dose_adm_id': '1',
                'dose_cond_id': '1'
            },
            {
                'dose_age_id': '3',
                'dose_age_desc': 'Desde los 30 días',
                'dose_adm_id': '2',
                'dose_cond_id': '1'
            },
            {
                'dose_age_id': '4',
                'dose_age_desc': 'Menores de 6 meses',
                'dose_adm_id': '2',
                'dose_cond_id': '2'
            },
            {
                'dose_age_id': '5',
                'dose_age_desc': '6 meses a más',
                'dose_adm_id': '2',
                'dose_cond_id': '2'
            }
        ];
    }
}
