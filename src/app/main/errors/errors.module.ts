import { NgModule } from '@angular/core';
import { Error500Module } from './500/error-500.module';
import { Error404Module } from './404/error-404.module';

@NgModule({
    imports: [    
        Error500Module,
        Error404Module
    ]
})
export class ErrorsModule
{
}

