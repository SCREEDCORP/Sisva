export class OrganizationModel
{
    orgz_id: string;
    orgz_name: string;
    orgz_ubigeo: {
        ubg_dpt: string;
        ubg_dst: string;
        ubg_prv: string;
        ubg_dst_name: string;
        ubg_prv_name: string;
    }

    user_reg: string;
    stat_reg: string;
    fec_reg: string;
    orgz_projections: any[];
    constructor(orgz?)
    {        
        orgz = orgz || {};
        this.orgz_id = orgz.orgz_id || '0';
        this.orgz_name = orgz.orgz_name || ' ';
        this.orgz_ubigeo = orgz.orgz_ubigeo || {};
        this.user_reg = orgz.user_reg || ' ';
        this.stat_reg = orgz.stat_reg || ' ';
        this.fec_reg = orgz.fec_reg || ' ';
        this.orgz_projections = orgz.orgz_projections || [];
    }
}
