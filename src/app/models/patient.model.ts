import { FuseUtils } from '@fuse/utils';

export class Patient {
    pat_id: string;
    fec_reg: string;
    usu_reg: string;
    pat_basic_info: {
        pat_names: string;
        pat_ape_pat: string;
        pat_ape_mat: string;
        pat_fec_nac: string;
        pat_sexo_id: string;
        pat_apo_names: string;
        pat_apo_ape_pat: string;
        pat_apo_ape_mat: string;
        pat_apo_document: {
            pat_apo_tip_doc: string;
            pat_apo_num_doc: string;
        }
        pat_apo_phone: string;
        pat_document: {
            pat_num_doc: string;
            pat_tip_doc_id: string;
        },
        pat_organization: {
            orgz_id:  string;
            orgz_name: string;
        }
    };

    pat_medic_info: {
        pat_fec_mue: string;
        pat_fec_ini_trt: string;
        pat_hem: string;
        pat_hsd: string;
        pat_hcd: string;
        pat_num_mue: string;
        pat_his_cli: string;
        pat_obvs: string;
        pat_est_salud: string;
        pat_adm: string;
        pat_weight: string;
        pat_medic_state: string;
        pat_ane_state: string;
        pat_ges: string;
        pat_paridad: string;
        pat_fur: string;
        pat_fpp: string; 
    };

    pat_geoloc_info: {
        pat_latitude: string;
        pat_longitude: string;
        pat_elevation: string;
        pat_dire: string;
        pat_ubigeo: {
            ubg_dpt: string;
            ubg_prv: string;
            ubg_dst: string;
        },
        pat_dst_name: string;
    };

    pat_handle: string;
    pageType: string;

    pat_schedule_tracing: [];
    pat_schedule_tracing_data: [
        {
            schedule_ejec: string;
            schedule_asign: {
                user_id: string;
            }
        }
    ];
    /**
     * Constructor
     *
     * @param patient
     */
    constructor(patient?) {        
        patient = patient || {};
        this.pat_id = patient.pat_id;
        this.pageType = patient.pageType || '';
        try {
            this.pat_handle = FuseUtils.handleize(patient.pat_basic_info.pat_names);
        } catch (e) {
            this.pat_handle = '1';
        }
        
        this.pat_basic_info = patient.pat_basic_info || {};
        this.pat_medic_info = patient.pat_medic_info || {};        

        this.pat_geoloc_info = patient.pat_geoloc_info || {};

        this.pat_schedule_tracing = patient.pat_schedule_tracing || [];
        this.pat_schedule_tracing_data = patient.pat_schedule_tracing_data || [];
    }
}
