import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RegistryUtil {

    constructor(
    ) { }

    getTiposDocumento(): any {
        return [
            {
                'tip_doc_id': '1',
                'tip_doc_desc': 'Documento Nacional de Identidad',
                'tip_doc_name': 'DNI'
            },
            {
                'tip_doc_id': '2',
                'tip_doc_desc': 'Carnet de extrangería',
                'tip_doc_name': 'CEXT'
            }
        ];
    }

    getSexos(): any {
        return [
            {
                'sex_id': '1',
                'sex_desc': 'Masculino'
            },
            {
                'sex_id': '2',
                'sex_desc': 'Femenino'
            }
        ];
    }

    getListOccupation(): any {
        return [
            {
                'occ_id': '1',
                'occ_desc': 'Medicina'
            },
            {
                'occ_id': '2',
                'occ_desc': 'Odontología'
            },
            {
                'occ_id': '3',
                'occ_desc': 'Enfermería'
            },
            {
                'occ_id': '4',
                'occ_desc': 'Obstetricia'
            },
            {
                'occ_id': '5',
                'occ_desc': 'Químico Farmacéutico'
            },
            {
                'occ_id': '6',
                'occ_desc': 'Nutricionista'
            },
            {
                'occ_id': '7',
                'occ_desc': 'Psicología'
            },
            {
                'occ_id': '8',
                'occ_desc': 'Tec. Enfermería'
            },
        ];
    }

    getDateRegistry(): string {
        const date = new Date();
        const dateFormat = date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2) + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2) + ':' +
            ('00' + date.getSeconds()).slice(-2);

        return dateFormat;
    }

    getStringFromDate(dateraw): string {
        const dateFormat = dateraw._d.getFullYear() + '-' + ('00' + (dateraw._d.getMonth() + 1)).slice(-2) + '-' + ('00' + dateraw._d.getDate()).slice(-2);
        return dateFormat;
    }

    getStringFromDateFormat(dateraw): string {
        const dateFormat = dateraw._d.getFullYear() + '-' + ('00' + (dateraw._d.getMonth() + 1)).slice(-2);
        return dateFormat;
    }

    addDays(date: Date, days: number): Date {
        date.setDate(date.getDate() + days);
        return date;
    }

    ValidarCampoNull(data, value): any {
        let dataReturn = '';
        if (data.schedule_trc_data[value]) {
            dataReturn = data.schedule_trc_data[value];
        } else {
            dataReturn = '';
        }
        return dataReturn;
    }
}
