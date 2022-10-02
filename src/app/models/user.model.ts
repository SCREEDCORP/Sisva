export class UserModel
{
    user_id: string;
    user_password: string;
    user_mail: string;
    user_mail_leader: string;
    user_flag_terms: boolean;
    user_flag_leader: boolean;
    user_flag_actv_req: boolean;

    user_valid: string;

    user_activate_info: {
        fec_reg: string;
        user_phone: string;
    };
    
    user_pers_info: {
        user_names: string;
        user_ape_pat: string;
        user_ape_mat: string;
        user_fec_nac: string;
        user_sexo: string;
        user_document: {
            user_num_doc: string;
            user_tip_doc: string;
        }

    };

    user_organization: {
        orgz_id: string;
        orgz_name: string;
    };

    user_medic_info: {
        user_mic_red: string;
        user_pst_sal: string;
        user_red_sal: string;
        user_occupation_info: {
            user_occupation: string;
            user_occupation_desc: string;
        }
    };

    user_tasks: {
        fec_reg: string;
        pat_id: string;
        schedule_date: string;
        schedule_id: string;
        schedule_order: string;
        usu_reg: string;
        schedule_ejec: string;
        schedule_stat: string;
    }[];

    stat_reg: string;
    user_reg: string;
    fec_reg: string;
    fec_upd: string;
    user_upd: string;

    /**
     * Constructor
     *
     * @param user
     */
    constructor(user?)
    {        
        user                    = user || {};
        this.user_id            = user.user_id || '0';
        this.user_password      = user.user_password || ' ';
        this.user_mail          = user.user_mail || ' ';
        this.user_mail_leader   = user.user_mail_leader || ' ';
        this.user_flag_terms    = user.user_flag_terms || false;
        this.user_flag_leader   = user.user_flag_leader || false;
        this.user_flag_actv_req = user.user_flag_actv_req || false;
        this.user_valid         = user.user_valid || '0';
        this.user_activate_info = user.user_activate_info || {orgz_id : ''};
        this.user_pers_info     = user.user_pers_info || {};
        this.user_organization  = user.user_organization || {};
        this.user_medic_info    = user.user_medic_info || {};
        this.stat_reg           = user.stat_reg || ' ';
        this.user_reg           = user.user_reg || ' ';
        this.fec_reg            = user.fec_reg || ' ';
        this.fec_upd            = user.fec_upd || ' ';
        this.user_upd           = user.user_upd || ' ';
        this.user_tasks         = user.user_tasks || [];
    }
}
