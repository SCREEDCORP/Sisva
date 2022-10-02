import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class markerModel {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
	iconUrl: string;
	infoWindow: string;
	navigateUrl: string;
	pat_id: string;
}
