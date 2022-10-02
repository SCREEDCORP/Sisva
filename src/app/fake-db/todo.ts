export class TodoFakeDb
{
    public static todos = [
    ];

    public static filters = [
        {
            'id'    : 0,
            'handle': 'starred',
            'title' : 'Por hacer',
            'icon'  : 'check_box'
        },
        {
            'id'    : 1,
            'handle': 'progess',
            'title' : 'En progreso',
            'icon'  : 'card_travel'
        },
        {
            'id'    : 2,
            'handle': 'completed',
            'title' : 'Completados',
            'icon'  : 'check'
        },
        {
            'id'    : 3,
            'handle': 'dueDate',
            'title' : 'Vencidos',
            'icon'  : 'schedule'
        },
        {
            'id'    : 4,
            'handle': 'today',
            'title' : 'Hoy',
            'icon'  : 'today'
        },
        {
            'id'    : 5,
            'handle': 'deleted',
            'title' : 'Eliminados',
            'icon'  : 'delete'
        }
    ];

    public static tags = [
        {
            'id'    : 1,
            'handle': 'frontend',
            'title' : 'Frontend',
            'color' : '#388E3C'
        },
        {
            'id'    : 2,
            'handle': 'backend',
            'title' : 'Backend',
            'color' : '#F44336'
        },
        {
            'id'    : 3,
            'handle': 'api',
            'title' : 'API',
            'color' : '#FF9800'
        },
        {
            'id'    : 4,
            'handle': 'issue',
            'title' : 'Issue',
            'color' : '#0091EA'
        },
        {
            'id'    : 5,
            'handle': 'mobile',
            'title' : 'Mobile',
            'color' : '#9C27B0'
        }
    ];
}
