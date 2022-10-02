import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'treatment-scheme',
    templateUrl: './treatment-scheme.component.html',
    styleUrls: ['./treatment-scheme.component.scss']
})
export class TreatmentSchemeComponent implements OnInit {
    selectedIndex = 0;

    constructor(private _activedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this._activedRoute.params.subscribe(params => {
            this.selectTab(Number.parseFloat(params.id) - 1);
        });
    }

    selectTab(index: number): void {
        this.selectedIndex = index;
    }
}
