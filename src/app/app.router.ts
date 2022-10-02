import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

const appRoutes: Routes = [
    {
        path     : 'dashboard',
        loadChildren: './main/dashboard/dashboard.module#DashboardModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'user',
        loadChildren: './main/user/user.module#UserModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'activation',
        loadChildren: './main/activation/activation.module#ActivationModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'patients',
        loadChildren: './main/patient/patient.module#PatientModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'patients-dci',
        loadChildren: './main/patient-dci/patient-dci.module#PatientDciModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'patients-ges',
        loadChildren: './main/patient-ges/patient-ges.module#PatientGesModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'tracing',
        loadChildren: './main/tracing/tracing.module#TracingModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'tracing-dci',
        loadChildren: './main/tracing-dci/tracing-dci.module#TracingDciModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'tracing-ges',
        loadChildren: './main/tracing-ges/tracing-ges.module#TracingGesModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'calendar',
        loadChildren: './main/calendar/calendar.module#CalendarModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'reports',
        loadChildren: './main/reports/reports.module#ReportsModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'tasks',
        loadChildren: './main/tasks/tasks.module#TasksModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'treatment-scheme',
        loadChildren: './main/treatment-scheme/treatment-scheme.module#TreatmentSchemeModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'dose-calculator',
        loadChildren: './main/dose-calculator/dose-calculator.module#DoseCalculatorModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'apps/mail',
        loadChildren: './main/messages/mail.module#MailModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'apps/scrumboard',
        loadChildren: './main/scrumboard/scrumboard.module#ScrumboardModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'apps/todo',
        loadChildren: './main/to-do/todo.module#TodoModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'orgz/padron',
        loadChildren: './main/organization/projection/projections.module#ProjectionsModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'security',
        loadChildren: './main/security/security.module#SecurityModule',
        canActivate: [LoginGuard]
    },
    {
        path     : 'errors',
        loadChildren: './main/errors/errors.module#ErrorsModule',
        canActivate: [AuthGuard]
    },
    {
        path     : 'faq',
        loadChildren: './main/faq/faq.module#FaqModule',
        canActivate: [AuthGuard]
    },
    {
        path     : '**',
        loadChildren: './main/dashboard/dashboard.module#DashboardModule',
        canActivate: [AuthGuard]
    },
];

export const APP_ROUTING = RouterModule.forRoot(appRoutes);
