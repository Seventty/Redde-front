import { AuthInterceptor } from '@/shared/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ToastModule],
    template: `<router-outlet></router-outlet><p-toast></p-toast>`,
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, MessageService]
})
export class AppComponent {}
