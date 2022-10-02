import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
  })
export class LoginGuard implements CanActivate {
  constructor(private router: Router) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (localStorage.getItem('sisva_user_login') != null){
      this.router.navigateByUrl('/dashboard');
      return false;
    } else if (sessionStorage.getItem('sisva_user_login') != null){
      this.router.navigateByUrl('/dashboard');
      return false;
    } else {
      return true;
    }
  }
}
