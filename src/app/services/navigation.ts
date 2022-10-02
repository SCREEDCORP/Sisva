import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
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
                url: '/dashboard',
                // badge    : {
                //     title    : '25',                    
                //     bg       : '#F44336',
                //     fg       : '#FFFFFF'
                // }
            },
            // {
            //     id       : 'calendar',
            //     title    : 'Calendario',                
            //     type     : 'item',
            //     icon     : 'calendar_today',
            //     url      : '/calendar',
            // },
            {
                id: 'to-do',
                title: 'Mis actividades',
                type: 'collapsable',
                icon: 'playlist_add_check',
                children: [
                    {
                        id: 'to-do',
                        title: 'Listado',
                        type: 'item',
                        url: '/to-do',
                        icon: 'format_list_numbered',
                        exactMatch: true
                    }
                ]
            },
            // {
            //     id       : 'mail',
            //     title    : 'Mensajes',                
            //     type     : 'item',
            //     icon     : 'message',
            //     url      : '/apps/mail',
            // },
        ],
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
                url: '/patients'
            },
            {
                id: 'tracing',
                title: 'Seguimiento',
                type: 'item',
                icon: 'assignment',
                url: '/tracing'
            },
            {
                id: 'reports',
                title: 'Reportes',
                type: 'item',
                icon: 'add_location',
                url: '/reports'
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
                        url: '/treatment-scheme/1/productos-para-el-tratamiento',
                        icon: 'redeem',
                        exactMatch: true
                    },
                    {
                        id: 'scrumboard',
                        title: 'Suplementación con hierro',
                        type: 'item',
                        icon: 'spa',
                        url: '/treatment-scheme/2/suplementacion-hierro',
                        exactMatch: true
                    },
                    {
                        id: 'scrumboard',
                        title: 'Trat. prema. y bajo peso',
                        type: 'item',
                        icon: 'child_care',
                        url: '/treatment-scheme/3/tratamiento-prematuro-bajo-peso',
                        exactMatch: true
                    },
                    {
                        id: 'scrumboard',
                        title: 'Trat. termino y buen peso',
                        type: 'item',
                        icon: 'mood',
                        url: '/treatment-scheme/4/tratamiento-termino-buen-peso',
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
            }
        ]
    }
];
