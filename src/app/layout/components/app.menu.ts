import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/shared/services/auth/auth.service';

interface MenuItem {
    label?: string;
    icon?: string;
    routerLink?: string[];
    url?: string[];
    target?: '_blank' | '_self' | '_parent' | '_top';
    routerLinkActiveOptions?: { [key: string]: any };
    items?: MenuItem[];
    separator?: boolean;
    visible?: boolean;
    disabled?: boolean;
    command?: (event?: any) => void;
    class?: string;
    style?: string;
    styleClass?: string;
    id?: string;
    urlTarget?: '_blank' | '_self' | '_parent' | '_top';
}

@Component({
    selector: '[app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu" #menuContainer>
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`,
    host: {
        class: 'layout-menu-container'
    }
})
export class AppMenu {
    authService = inject(AuthService);
    el: ElementRef = inject(ElementRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    model: MenuItem[] = [];

    constructor() {
        this.authService.role$.subscribe((role) => {
            this.model = this.getMenuByRole(role);
            console.log("Se esta llenando esta mamada por el rol?", role);
        });
    }


    getMenuByRole(role: string | null): MenuItem[] {
        if (role === 'Admin') {
            return [
                {
                    label: 'Admin',
                    icon: 'pi pi-user',
                    items: [
                        {
                            label: 'Users',
                            icon: 'pi pi-fw pi-user',
                            routerLink: ['/']
                        }
                    ]
                },
                {
                    label: 'Companies',
                    icon: 'pi pi-building',
                    items: [
                        {
                            label: 'Companies',
                            icon: 'pi pi-fw pi-building',
                            routerLink: ['/']
                        }
                    ]
                }
            ];
        } else if (role === 'Owner') {
            return [
                {
                    label: 'Company',
                    icon: 'pi pi-building',
                    items: [
                        {
                            label: 'Create company',
                            icon: 'pi pi-fw pi-plus',
                            routerLink: ['/']
                        },
                        {
                            label: 'Company managment',
                            icon: 'pi pi-fw pi-building',
                            routerLink: ['/']
                        }
                    ]
                },
            ];
        } else {
            return [];
        }
    }
}
