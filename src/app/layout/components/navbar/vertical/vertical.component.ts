import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { UserModel } from 'app/models/user.model';
import { MatSnackBar } from '@angular/material';
import { UserService } from 'app/services/user.service';
import { NavigationService } from 'app/services/navigation.service';

@Component({
    selector: 'navbar-vertical-style-1',
    templateUrl: './vertical.component.html',
    styleUrls: ['./vertical.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;

    // Private
    private _fusePerfectScrollbar: FusePerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;

    public user: UserModel;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {Router} _router
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _router: Router,
        private _userService: UserService,
        private _matSnackBar: MatSnackBar,
        private _navigationService: NavigationService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.user = new UserModel();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Directive
    @ViewChild(FusePerfectScrollbarDirective)
    set directive(theDirective: FusePerfectScrollbarDirective) {
        if (!theDirective) {
            return;
        }

        this._fusePerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this._fuseNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._fusePerfectScrollbar.update();
            });

        // Scroll to the active item position
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                setTimeout(() => {
                    const activeNavItem: any = document.querySelector('navbar .nav-link.active');

                    if (activeNavItem) {
                        const activeItemOffsetTop = activeNavItem.offsetTop,
                            activeItemOffsetParentTop = activeNavItem.offsetParent.offsetTop,
                            scrollDistance = activeItemOffsetTop - activeItemOffsetParentTop - (48 * 3) - 168;

                        this._fusePerfectScrollbar.scrollToTop(scrollDistance);
                    }
                });
            }
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this._fuseSidebarService.getSidebar('navbar')) {
                    this._fuseSidebarService.getSidebar('navbar').close();
                }
            }
            );

        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });

        // Get current navigation
        this._fuseNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                setTimeout(() => {
                    const userStr = sessionStorage.getItem('sisva_user_details_loged');
                    this.user = new UserModel(JSON.parse(userStr));
                    if (this.user.user_id !== '0') {
                        if (this.user.user_valid === '0') {
                            this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                            this._router.navigateByUrl('/security/login');
                        } else {
                            this.navigation = this._navigationService.getNavigation(this.user);
                        }
                    }
                }, 2000);                
            });

        this.loadUserInfo();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar opened status
     */
    toggleSidebarOpened(): void {
        this._fuseSidebarService.getSidebar('navbar').toggleOpen();
    }

    /**
     * Toggle sidebar folded status
     */
    toggleSidebarFolded(): void {
        this._fuseSidebarService.getSidebar('navbar').toggleFold();
    }

    goToDashboard(): void {
        this._router.navigateByUrl('/dashboard');
    }

    loadUserInfo(): void {
        const oUserLoged = this._userService.getUserLoged();
        if (oUserLoged.user_id !== '0') {
            this._userService.postDetails(oUserLoged).subscribe(
                data => {
                    if (data.res_service === 'ok') {
                        if (data.data_result.Count > 0) {
                            this.user = new UserModel(data.data_result.Items[0]);
                            this.user.user_password = '';
                            this.user.user_mail_leader = '';

                            if (this.user.user_valid === '0') {
                                this._matSnackBar.open('El usuario no se encuentra activo.', 'Aceptar', {
                                    verticalPosition: 'top',
                                    duration: 2000
                                });
                                this._router.navigateByUrl('/security/login');
                            } else {
                                sessionStorage.setItem('sisva_user_details_loged', JSON.stringify(this.user));
                            }
                        } else {
                            this._matSnackBar.open('No se pudo obtener la información del usuario.', 'Aceptar', {
                                verticalPosition: 'top',
                                duration: 2000
                            });
                            localStorage.removeItem('sisva_user_login');
                            sessionStorage.removeItem('sisva_user_login');
                            this._router.navigateByUrl('/security/login');
                        }
                    } else {
                        this._matSnackBar.open('No se pudo obtener la información del usuario.', 'Aceptar', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                        localStorage.removeItem('sisva_user_login');
                        sessionStorage.removeItem('sisva_user_login');
                        this._router.navigateByUrl('/security/login');
                    }
                },
                error => {
                    this._matSnackBar.open('No se pudo obtener la información del usuario.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 2000
                    });
                    localStorage.removeItem('sisva_user_login');
                    sessionStorage.removeItem('sisva_user_login');
                    this._router.navigateByUrl('/security/login');
                },
                () => {
                }
            );
        }
    }
}
