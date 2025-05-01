import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private roleSubject = new BehaviorSubject<string | null>(null);
    role$ = this.roleSubject.asObservable();

    constructor(private router: Router) {}

    logout(): void {
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    setRole(role: string) {
        this.roleSubject.next(role);
        console.log("Seteando rol", role);
    }

    getRole(): string | null {
        return this.roleSubject.value;
    }

    loadRoleFromStorage() {
        const token = localStorage.getItem('access_token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            this.setRole(role);
        }
    }
}
