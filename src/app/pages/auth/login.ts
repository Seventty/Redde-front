import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { LayoutService } from '@/layout/service/layout.service';
import { Fluid } from 'primeng/fluid';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '@/shared/services/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ToastModule, ReactiveFormsModule, RouterModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, RippleModule, IconField, InputIcon, Fluid],
    providers: [MessageService],
    template: `
        <div [class]="'flex min-h-screen  ' + (layoutService.isDarkTheme() ? 'layout-dark' : 'layout-light')">
            <div class="w-full" style="background: var(--surface-ground)">
                <p-fluid
                    class="min-h-screen text-center w-full flex items-center md:items-center justify-center flex-col bg-auto md:bg-contain !bg-no-repeat"
                    style="padding: 20% 10% 20% 10%; background: var(--exception-pages-image); background-size: contain;"
                >
                    <div class="flex flex-col">
                        <div class="flex items-center mb-12">
                            <img src="/images/logo-redde.png" class="ml-4" style="width: 100px" alt="logo" />
                        </div>
                        <form [formGroup]="loginForm" class="form-container" autocomplete="on">
                            <p-iconfield>
                                <p-inputicon class="pi pi-envelope" />
                                <input pInputText type="text" name="email" autocomplete="email" placeholder="Email" class="block mb-4" style="max-width: 320px; min-width: 270px" formControlName="email" />
                            </p-iconfield>

                            <p-iconfield>
                                <p-inputicon class="pi pi-key" />
                                <input pInputText type="password" name="password" autocomplete="current-password" placeholder="Password" class="block mb-4" style="max-width: 320px; min-width: 270px" formControlName="password" />
                            </p-iconfield>
                            <a href="#" class="flex text-surface-500 dark:text-surface-400 mb-6 text-sm">Forgot your password?</a>
                        </form>
                        <div class="mt-6">
                            <button pButton pRipple class="block" type="submit" style="max-width: 320px; margin-bottom: 32px" (click)="onSubmit()">Login</button>
                            <span class="flex text-sm text-surface-500 dark:text-surface-400">Don’t have an account?<a class="cursor-pointer ml-1" [routerLink]="['/register']">Sign-up here</a></span>
                        </div>
                        <div class="flex flex-col gap-2 mt-4">
                            <button pButton type="button" icon="pi pi-github" label="Login with GitHub" (click)="loginWithGitHub()" class="p-button-outlined"></button>
                        </div>
                    </div>
                </p-fluid>
            </div>
        </div>
        <p-toast></p-toast>
    `
})
export class Login {
    layoutService = inject(LayoutService);
    messageService = inject(MessageService);
    router = inject(Router);
    authService = inject(AuthService);
    fb = inject(FormBuilder);
    http = inject(HttpClient);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    onSubmit() {
        if (this.loginForm.valid) {
            const { email, password } = this.loginForm.value;

            this.http.post('/api/auth/login', { email, password }).subscribe({
                next: (res: any) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Login exitoso',
                        detail: 'Redirigiendo...'
                    });
                    localStorage.setItem('access_token', res.token);
                    this.authService.setRole(res.role);
                    this.router.navigate(['/home']);
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de autenticación',
                        detail: err?.error?.message || 'Credenciales inválidas'
                    });
                }
            });
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario inválido',
                detail: 'Por favor revisa los campos obligatorios'
            });
            this.loginForm.markAllAsTouched();
        }
    }

    loginWithGitHub() {
        const clientId = 'Ov23liYMpPN6hC9BOxSJ';
        const redirectUri = `${environment.githubRedirectUri}/oauth/github-callback`;
        const scope = 'read:user user:email';

        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    }
}
