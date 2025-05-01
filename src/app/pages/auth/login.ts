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

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ToastModule, ReactiveFormsModule, RouterModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, RippleModule, IconField, InputIcon, Fluid],
    providers: [MessageService],
    templateUrl: './login.component.html'
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
}
