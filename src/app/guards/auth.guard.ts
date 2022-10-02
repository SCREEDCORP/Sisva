import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
  })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (localStorage.getItem('sisva_user_login') != null){
      return true;
    } else if (sessionStorage.getItem('sisva_user_login') != null){
      return true;
    } else {
      this.router.navigateByUrl('/security/login');      
      return false;
    }
  }
}
