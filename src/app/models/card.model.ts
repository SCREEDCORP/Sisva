import { FuseUtils } from '@fuse/utils';
import { Patient } from './patient.model';

export class Card
{
    id: string;
    name: string;
    description: string;
    idAttachmentCover: string;
    idMembers: string[];
    idLabels: string[];
    attachments: any[];
    subscribed: boolean;
    checklists: any[];
    checkItems: number;
    checkItemsChecked: number;
    comments: any[];
    activities: any[];
    due: string;
    pat_id: string;
    patient: Patient
    /**
     * Constructor
     *
     * @param card
     */
    constructor(card)
    {
        this.id = card.id || FuseUtils.generateGUID();
        this.name = card.name || '';
        this.description = card.description || '';
        this.idAttachmentCover = card.idAttachmentCover || '';
        this.idMembers = card.idMembers || [];
        this.idLabels = card.idLabels || [];
        this.attachments = card.attachments || [];
        this.subscribed = card.subscribed || true;
        this.checklists = card.checklists || [];
        this.checkItems = card.checkItems || 0;
        this.checkItemsChecked = card.checkItemsChecked || 0;
        this.comments = card.comments || [];
        this.activities = card.activities || [];
        this.due = card.due || '';
        this.pat_id = card.pat_id || ''; 
        this.patient = card.patient || new Patient();
    }
}
