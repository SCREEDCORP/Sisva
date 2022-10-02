import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from 'app/services/user.service';
import { UserModel } from 'app/models/user.model';

@Component({
    selector: 'user-modal',
    templateUrl: 'user-modal.component.html',
    styleUrls: ['./user-modal.component.scss']
})
export class UserModalComponent implements OnInit {

    formUser: FormGroup;
    private user_id: any;
    private user: UserModel;

    constructor(
        public dialogRef: MatDialogRef<UserModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: FormBuilder,
        private _userService: UserService
    ) {
        this.user_id = data.user_id;        
    }

    ngOnInit(): void {
        this.formUser = this.formBuilder.group({
            user_mail: [''],
            user_occupation_desc : [''],
            user_red_sal : [''],
            orgz_name : [''],
            user_names : [''],
            user_ape_pat : [''],
            user_ape_mat : [''],
            user_num_doc : [''],
            user_tasks : [''],
        });
        this.loadUserInfoDetails(this.user_id);
    }

    loadUserInfoDetails(user_id): void {
        const dataUser = {
            user_id: user_id
        };
        this._userService.postDetails(dataUser).subscribe(
            data => {                
                if (data.res_service === 'ok') {
                    if (data.data_result.Count > 0) {
                        this.user = data.data_result.Items[0];
                        this.formUser = this.formBuilder.group({
                            user_mail: [this.user.user_mail],
                            user_names : [this.user.user_pers_info.user_names],
                            user_ape_pat : [this.user.user_pers_info.user_ape_pat],
                            user_ape_mat : [this.user.user_pers_info.user_ape_mat],

                            user_occupation_desc : [this.user.user_medic_info.user_occupation_info.user_occupation_desc],
                            user_red_sal : [this.user.user_medic_info.user_red_sal],                            
                            user_num_doc : [this.user.user_pers_info.user_document.user_num_doc],
                            user_tasks : [this.user.user_tasks != null ? this.user.user_tasks.length : '0'],
                        });
                    }
                }
            }
        );
    }
}
