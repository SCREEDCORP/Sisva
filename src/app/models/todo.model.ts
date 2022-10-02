export class Todo
{
    id: string;
    title: string;
    notes: string;
    desc: string;
    startDate: string;
    dueDate: boolean;
    completed: boolean;
    starred: boolean;
    progress: boolean;
    important: boolean;
    deleted: boolean;
    tags: [
        {
            'id': number,
            'name': string,
            'label': string,
            'color': string
        }
        ];
    task: {
        fec_reg: string;
        pat_id: string;
        schedule_date: string;
        schedule_ejec: string;
        schedule_id: string;
        schedule_order: string;
        schedule_stat: string;
        usu_reg: string;
    };
    /**
     * Constructor
     *
     * @param todo
     */
    constructor(todo)
    {
        {
            this.id = todo.id;
            this.title = todo.title;
            this.notes = todo.notes;
            this.desc = todo.desc;
            this.startDate = todo.startDate;
            this.dueDate = todo.dueDate;
            this.completed = todo.completed;
            this.starred = todo.starred;
            this.progress = todo.progress;
            this.important = todo.important;
            this.deleted = todo.deleted;
            this.tags = todo.tags || [];
            this.task = todo.task || {};
        }
    }

    /**
     * Toggle star
     */
    toggleStar(): void
    {
        this.starred = !this.starred;
    }

    toggleProgess(): void {
        this.progress = !this.progress;
    }

    /**
     * Toggle important
     */
    toggleImportant(): void
    {
        this.important = !this.important;
    }

    /**
     * Toggle completed
     */
    toggleCompleted(): void
    {
        this.completed = !this.completed;
    }

    /**
     * Toggle deleted
     */
    toggleDeleted(): void
    {
        this.deleted = !this.deleted;
    }
}
