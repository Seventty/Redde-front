import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Fluid } from 'primeng/fluid';
import { CommonModule } from '@angular/common';
import { LayoutService } from '@/layout/service/layout.service';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, IconField, InputIcon, ButtonModule, InputTextModule, RippleModule, Fluid, ToastModule],
    providers: [MessageService],
    template: `
        <div [class]="'flex min-h-screen ' + (layoutService.isDarkTheme() ? 'layout-dark' : 'layout-light')">
            <div class="w-full" style="background: var(--surface-ground)">
                <p-fluid class="min-h-screen text-center w-full flex items-center justify-center flex-col bg-auto bg-contain !bg-no-repeat" style="padding: 20% 10% 20% 10%; background: var(--exception-pages-image); background-size: contain;">
                    <div class="flex flex-col">
                        <div class="flex items-center mb-12">
                            <img src="/images/logo-redde.png" class="ml-4" style="width: 100px" alt="logo" />
                        </div>
                        <form [formGroup]="registerForm" class="form-container text-left" style="max-width: 320px; min-width: 270px">
                            <span class="text-2xl font-semibold mb-2">Register</span>
                            <span class="block text-surface-600 dark:text-surface-200 font-medium mb-6">Let's get started</span>

                            <p-icon-field>
                                <p-inputicon class="pi pi-user" />
                                <input pInputText type="text" placeholder="First Name" formControlName="firstName" class="block mb-4" />
                            </p-icon-field>

                            <p-icon-field>
                                <p-inputicon class="pi pi-envelope" />
                                <input pInputText type="email" autocomplete="email" placeholder="Email" formControlName="email" class="block mb-4" />
                            </p-icon-field>

                            <p-icon-field>
                                <p-inputicon class="pi pi-key" />
                                <input pInputText type="password" autocomplete="new-password" placeholder="Password" formControlName="password" class="block mb-4" />
                            </p-icon-field>

                            <div class="mt-6 flex items-center gap-4">
                                <button pButton pRipple type="button" severity="danger" outlined style="max-width: 320px; margin-bottom: 32px" [routerLink]="['/login']">Cancel</button>
                                <button pButton pRipple type="button" (click)="onSubmit()" class="block" style="max-width: 320px; margin-bottom: 32px">Submit</button>
                            </div>

                            <span class="text-sm text-surface-500 dark:text-surface-400"
                                >Already have an account?
                                <a [routerLink]="['/login']" class="cursor-pointer ml-1 text-primary-500 hover:underline">Login</a>
                            </span>
                        </form>
                        <p-toast></p-toast>
                    </div>
                </p-fluid>
            </div>
        </div>
    `
})
export class Register {
    layoutService = inject(LayoutService);
    fb = inject(FormBuilder);
    http = inject(HttpClient);
    router = inject(Router);
    messageService = inject(MessageService);

    registerForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    onSubmit() {
        if (this.registerForm.valid) {
            const { firstName, email, password } = this.registerForm.value;

            this.http.post('/api/auth/register', { name: firstName, email, password }).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Registro exitoso',
                        detail: 'Redirigiendo al login...'
                    });
                    setTimeout(() => this.router.navigate(['/login']), 1000);
                },
                error: (err) => {
                    console.log('Que viene en error? Para fixear', err?.error?.errors?.Password[0]);
                    if (err?.error?.errors?.Password) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error en registro',
                            detail: err?.error?.errors?.Password[0]
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error en registro',
                            detail: 'No se pudo completar el registro'
                        });
                    }
                }
            });
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario inválido',
                detail: 'Revisa los campos requeridos'
            });
            this.registerForm.markAllAsTouched();
        }
    }
}
