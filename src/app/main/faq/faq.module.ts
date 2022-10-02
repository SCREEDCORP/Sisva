import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatExpansionModule, MatIconModule } from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FaqComponent } from './faq.component';
import { FaqService } from '../../services/faq.service';

const routes = [
    {
        path     : '**',
        component: FaqComponent,
        resolve  : {
            faq: FaqService
        }
    }
];

@NgModule({
    declarations: [
        FaqComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatExpansionModule,
        MatIconModule,

        FuseSharedModule
    ],
    providers   : [
        FaqService
    ]
})
export class FaqModule
{
}
