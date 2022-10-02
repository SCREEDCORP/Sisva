import { Injectable } from '@angular/core';
import { UserModel } from 'app/models/user.model';

@Injectable()
export class NavigationService {
    constructor() {}

    getNavigation(user: UserModel): void {
        let DefaultNavigation: any;
        DefaultNavigation = [
            {
                id: 'applications',
                title: 'Aplicaciones',
                type: 'group',
                children: [
                    {
                        id: 'dashboard',
                        title: 'Dashboard',
                        type: 'item',
                        icon: 'dashboard',
                        url: '/dashboard'
                    },
                    {
                        id: 'to-do',
                        title: 'Mis actividades',
                        type: 'collapsable',
                        icon: 'playlist_add_check',
                        children: [
                            {
                                id: 'to-do',
                                title: 'Por hacer',
                                type: 'item',
                                url: '/apps/todo',
                                icon: 'format_list_numbered',
                                exactMatch: true
                            },
                            {
                                id: 'scrumboard',
                                title: 'Seguimiento',
                                type: 'item',
                                url: '/apps/scrumboard',
                                icon: 'assessment',
                                exactMatch: true
                            },
                            // {
                            //     id: 'calendar',
                            //     title: 'Calendario',
                            //     type: 'item',
                            //     icon: 'calendar_today',
                            //     url: '/calendar'
                            // }
                        ]
                    }
                ]
            },
            {
                id: 'control',
                title: 'Control de anemia',
                type: 'group',
                children: [
                    {
                        id: 'patients',
                        title: 'Padrón nominal',
                        type: 'item',
                        icon: 'group',
                        url: '/patients/type/ane'
                    },
                    {
                        id: 'tracing',
                        title: 'Seguimiento',
                        type: 'item',
                        icon: 'assignment',
                        url: '/tracing/type/ane'
                    },
                    {
                        id: 'reports',
                        title: 'Reportes',
                        type: 'item',
                        icon: 'add_location',
                        url: '/reports/type/ane'
                    },
                    {
                        id: 'to-do',
                        title: 'Esquema de tratamiento',
                        type: 'collapsable',
                        icon: 'invert_colors',
                        children: [
                            {
                                id: 'to-do',
                                title: 'Productos para el trat.',
                                type: 'item',
                                url:
                                    '/treatment-scheme/1/productos-para-el-tratamiento',
                                icon: 'redeem',
                                exactMatch: true
                            },
                            {
                                id: 'scrumboard',
                                title: 'Suplementación con hierro',
                                type: 'item',
                                icon: 'spa',
                                url:
                                    '/treatment-scheme/2/suplementacion-hierro',
                                exactMatch: true
                            },
                            {
                                id: 'scrumboard',
                                title: 'Trat. prema. y bajo peso',
                                type: 'item',
                                icon: 'child_care',
                                url:
                                    '/treatment-scheme/3/tratamiento-prematuro-bajo-peso',
                                exactMatch: true
                            },
                            {
                                id: 'scrumboard',
                                title: 'Trat. termino y buen peso',
                                type: 'item',
                                icon: 'mood',
                                url:
                                    '/treatment-scheme/4/tratamiento-termino-buen-peso',
                                exactMatch: true
                            }
                        ]
                    },
                    {
                        id: 'dose-calculator',
                        title: 'Calculadora de dosis',
                        type: 'item',
                        icon: 'ballot',
                        url: '/dose-calculator'
                    }
                ]
            },
            {
                id: 'control-dci',
                title: 'Control de DCI',
                type: 'group',
                children: [
                    {
                        id: 'patients-dci',
                        title: 'Padrón nominal',
                        type: 'item',
                        icon: 'group',
                        url: '/patients-dci/type/dci'
                    },
                    {
                        id: 'tracing-dci',
                        title: 'Seguimiento',
                        type: 'item',
                        icon: 'assignment',
                        url: '/tracing-dci/type/dci'
                    }
                ]
            },
            {
                id: 'control-gestante',
                title: 'Control de gestante',
                type: 'group',
                children: [
                    {
                        id: 'patients-ges',
                        title: 'Padrón nominal',
                        type: 'item',
                        icon: 'pregnant_woman',
                        url: '/patients-ges/type/ges'
                    },
                    {
                        id: 'tracing-ges',
                        title: 'Seguimiento',
                        type: 'item',
                        icon: 'assignment',
                        url: '/tracing-ges/type/ges'
                    }
                ]
            }
        ];

        if (user.user_flag_leader) {
            DefaultNavigation.push({
                id: 'control',
                title: 'Administrador',
                type: 'group',
                children: [
                    {
                        id: 'user',
                        title: 'Usuarios',
                        type: 'item',
                        icon: 'supervised_user_circle',
                        url: '/user'
                    },
                    {
                        id: 'activation',
                        title: 'Solicitudes de activación',
                        type: 'item',
                        icon: 'contact_mail',
                        url: '/activation'
                    },
                    {
                        id: 'tasks',
                        title: 'Asignar seguimiento',
                        type: 'item',
                        icon: 'add_to_photos',
                        url: '/tasks'
                    },
                    {
                        id: 'organization',
                        title: 'Organización',
                        type: 'collapsable',
                        icon: 'home',
                        children: [
                            {
                                id: 'orgz-padron',
                                title: 'Proyección de padrón',
                                type: 'item',
                                url:  '/orgz/padron',
                                icon: 'people_outline',
                                exactMatch: true
                            }
                        ]
                    },
                ]
            });
        }

        return DefaultNavigation;
    }
}
