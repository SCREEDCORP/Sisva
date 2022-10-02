import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatIconModule, MatTabsModule, MatGridListModule } from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseDemoModule } from '@fuse/components/demo/demo.module';
import { FuseSidebarModule } from '@fuse/components';
import { TreatmentSchemeComponent } from './treatment-scheme.component';

const routes: Routes = [    
    {
        path     : ':id/:topic',
        component: TreatmentSchemeComponent
    }
];

@NgModule({
    declarations: [
        TreatmentSchemeComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        FuseSidebarModule,
        FuseSharedModule,
        FuseDemoModule,
        MatGridListModule
    ]
})
export class TreatmentSchemeModule
{
}
