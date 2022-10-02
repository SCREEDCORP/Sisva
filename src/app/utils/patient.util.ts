export class PatientUtil {

    constructor(
    ) { }

    getWeight(): any {
        return [
            {
                'pat_weight_id': '1',
                'pat_weight_desc': 'Pretermino o bajo peso'
            },
            {
                'pat_weight_id': '2',
                'pat_weight_desc': 'A termino'
            }
        ];
    }

    getProductAdm(): any {
        return [
            {
                'pat_adm_id': '0',
                'pat_adm_desc': 'Sin administración',
                'type': 'ane'
            },
            {
                'pat_adm_id': '1',
                'pat_adm_desc': 'Sulfato ferroso en gotas',
                'type': 'ane'
            },
            {
                'pat_adm_id': '2',
                'pat_adm_desc': 'Sulfato ferroso en jarabe',
                'type': 'ane'
            },
            {
                'pat_adm_id': '3',
                'pat_adm_desc': 'Hierro polimaltosado en gotas',
                'type': 'ane'
            },
            {
                'pat_adm_id': '4',
                'pat_adm_desc': 'Hierro polimaltosado en jarabe',
                'type': 'ane'
            },
            {
                'pat_adm_id': '5',
                'pat_adm_desc': 'Sulfato ferroso y ácido fólico',
                'type': 'ges'
            },
            {
                'pat_adm_id': '6',
                'pat_adm_desc': 'Hierro polimaltosado y ácido fólico',
                'type': 'ges'
            }
        ];
    }

    getAnemState(): any {
        return [
            {
                'ane_option' : '0',
                'ane_desc' : 'Normal'
            },
            {
                'ane_option' : '1',
                'ane_desc' : 'Tratamiento (tto)'
            },
            {
                'ane_option' : '2',
                'ane_desc' : 'Recuperado Completo'
            },
            {
                'ane_option' : '3',
                'ane_desc' : 'Recuperado Incompleto'
            },
            {
                'ane_option' : '4',
                'ane_desc' : 'Referido'
            },
            {
                'ane_option' : '5',
                'ane_desc' : 'No acepta tratamiento'
            }
        ]
    }
}
