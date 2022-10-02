import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatIconModule, MatTabsModule, MatGridListModule, MatFormFieldModule, 
         MatOptionModule, MatSelectModule, MatInputModule, MatExpansionModule, MatListModule, MatChipsModule } from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseDemoModule } from '@fuse/components/demo/demo.module';
import { FuseSidebarModule } from '@fuse/components';
import { DoseCalculatorComponent } from './dose-calculator.component';

const routes: Routes = [    
    {
        path     : '',
        component: DoseCalculatorComponent
    }
];

@NgModule({
    declarations: [
        DoseCalculatorComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        FuseSidebarModule,
        FuseSharedModule,
        FuseDemoModule,
        MatGridListModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatInputModule,
        MatExpansionModule,
        MatListModule,
        MatChipsModule
    ]
})
export class DoseCalculatorModule
{
}
