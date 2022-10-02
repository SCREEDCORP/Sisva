import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ApisRoutesConfig {   

    urlPatients(): string {
        return 'https://8nng85nkrc.execute-api.us-east-1.amazonaws.com/prd';
    }

    urlUbigeo(): string {
        return 'https://ejsv0ckqyh.execute-api.us-east-1.amazonaws.com/prd';
    }
    
    urlUser(): string {
        return 'https://it2a74sbrd.execute-api.us-east-1.amazonaws.com/prd';
    }

    urlOrganization(): string {
        return 'https://ok7gcd2pl0.execute-api.us-east-1.amazonaws.com/prd';
    }

    apiKeyGoogMaps(): string {
        return 'AIzaSyApIM-BFqJpck7MUpGLQCVrppZVaq9od7I';
    }

    urlGoogleElevation(): string {
        return 'https://ldfky3f1b1.execute-api.us-east-1.amazonaws.com/prd';
    }

    urlTask(): string {
        return 'https://28fbl0dfvh.execute-api.us-east-1.amazonaws.com/prd';
    }
}
