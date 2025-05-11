import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { AuthService } from '@/shared/services/auth/auth.service';

@Component({
    selector: 'app-github-callback',
    standalone: true,
    imports: [NgxSpinnerModule],
    providers: [MessageService],
    template: `<ngx-spinner bdColor="rgba(0, 0, 0, 0.8)" size="medium" color="#fff" type="ball-clip-rotate" [fullScreen]="true"><p style="color: white">Login into Redde...</p></ngx-spinner>`
})
export class GithubCallbackComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private router = inject(Router);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private spinner = inject(NgxSpinnerService);

    ngOnInit() {
        this.spinner.show();

        this.route.queryParams.subscribe((params) => {
            const code = params['code'];
            if (!code) {
                setTimeout(() => this.spinner.hide(), 1000);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Código inválido'
                });
                this.router.navigate(['/login']);
                return;
            }

            this.http.post('/api/auth/github', { code }).subscribe({
                next: (res: any) => {
                    localStorage.setItem('access_token', res.token);
                    this.authService.setRole?.(res.role);
                    setTimeout(() => {
                        this.spinner.hide();
                        this.router.navigate(['/home']);
                    }, 3000);
                },
                error: () => {
                    setTimeout(() => {
                        this.spinner.hide();
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: '¡El login con GitHub falló!'
                        });
                        this.router.navigate(['/login']);
                    }, 3000);
                }
            });
        });
    }
}
