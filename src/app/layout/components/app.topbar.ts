import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { AppSidebar } from '@/layout/components/app.sidebar';
import { AppBreadcrumb } from '@/layout/components/app.breadcrumb';
import { LayoutService } from '@/layout/service/layout.service';
import { AuthService } from '@/shared/services/auth/auth.service';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [CommonModule, RouterModule, StyleClassModule, Ripple, ButtonModule, AppBreadcrumb, AppSidebar],
    template: `
        <div class="topbar-start">
            <button pButton pRipple #menubutton type="button" class="topbar-menubutton p-trigger" text rounded severity="secondary" (click)="onMenuButtonClick()">
                <i class="pi pi-bars"></i>
            </button>

            <div class="topbar-breadcrumb">
                <div app-breadcrumb></div>
            </div>
        </div>

        <div class="layout-topbar-menu-section">
            <div app-sidebar></div>
        </div>

        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="profile-item topbar-item">
                    <button pButton pRipple type="button" icon="pi pi-sign-out" class="text-surface-500 dark:text-surface-400" severity="secondary" text rounded (click)="logout()"></button>
                </li>
            </ul>
        </div>
    `,
    host: {
        class: 'layout-topbar'
    }
})
export class AppTopbar {
    auth = inject(AuthService);
    layoutService = inject(LayoutService);

    @ViewChild('menubutton') menuButton!: ElementRef<HTMLElement>;

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    logout() {
        this.auth.logout();
    }
}
