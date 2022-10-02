import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Card } from 'app/models/card.model';

@Component({
    selector     : 'scrumboard-board-card',
    templateUrl  : './card.component.html',
    styleUrls    : ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ScrumboardBoardCardComponent implements OnInit
{
    @Input()
    cardId;

    card: Card;
    board: any;

    public showCard = false;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     */
    constructor(
        private _activatedRoute: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.board = this._activatedRoute.snapshot.data.board;        
        this.card = this.board.cards.find(x => x.id === this.cardId);
        if (this.card == null) {
            this.card = new Card({
                due: ''
            });
            const loadUserInterval = setInterval(() => {
                this.board = this._activatedRoute.snapshot.data.board;
                this.card = this.board.cards.find(x => x.id === this.cardId);
                if (this.card != null) {
                    clearInterval(loadUserInterval);
                } else {
                    this.card = new Card({
                        due: ''
                    });
                    this.showCard = true;
                }
            }, 2000);
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Is the card overdue?
     *
     * @param cardDate
     * @returns {boolean}
     */
    isOverdue(cardDate): boolean
    {
        const value = moment() > moment(new Date(cardDate));
        return value;
    }

    toNumber(number): Number {
        return Number(number);
    }
}
