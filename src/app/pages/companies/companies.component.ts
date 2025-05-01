import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-companies',
    imports: [TableModule],
    templateUrl: './companies.component.html',
    styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {
    companies: any[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get<any[]>('/api/Company').subscribe({
            next: (data) => (this.companies = data),
            error: (err) => console.error('Error al cargar compañias', err)
        });
    }
}
