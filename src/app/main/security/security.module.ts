import { NgModule } from '@angular/core';
import { LoginModule } from './login/login.module';
import { RegistryModule } from './registry/registry.module';

@NgModule({
    imports: [    
        LoginModule,
        RegistryModule
    ]
})
export class SecurityModule
{
}