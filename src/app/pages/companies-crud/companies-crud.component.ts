import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-companies',
    imports: [CommonModule, TableModule, ButtonModule, SplitButtonModule, ToastModule, ConfirmDialogModule, MenuModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './companies-crud.component.html'
})
export class CompaniesCrudComponent implements OnInit {
    confirmationService = inject(ConfirmationService);
    messageService = inject(MessageService);
    router = inject(Router);

    companies: any[] = [];

    headers = [
        { field: 'id', header: 'ID' },
        { field: 'rnc', header: 'RNC' },
        { field: 'name', header: 'Nombre' },
        { field: 'commercialName', header: 'Nombre Comercial' },
        { field: 'category', header: 'Categoría' },
        { field: 'paymentScheme', header: 'Esquema de Pago' },
        { field: 'state', header: 'Estado' },
        { field: 'economicActivity', header: 'Actividad Económica' },
        { field: 'governmentBranch', header: 'Rama Gubernamental' },
        { field: 'options', header: 'Opciones' }
    ];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get<any[]>('/api/Company').subscribe({
            next: (data) => {
                this.companies = data.map((company) => ({
                    ...company,
                    actions: this.buildMenuItems(company)
                }));
            },
            error: (err) => console.error('Error al cargar compañías', err)
        });
    }

    getColumnValue(row: any, field: string) {
        return row[field];
    }

    buildMenuItems(company: any): MenuItem[] {
        return [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.onEdit(company)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => this.onDelete(company)
            }
        ];
    }

    emitRowData(row: any, index: number) {}

    onEdit(company: any) {
        this.router.navigate(['/company/create', company.id]);
    }

    onDelete(company: any) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de que deseas eliminar la empresa "${company.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.http.delete(`/api/Company/${company.id}`).subscribe({
                    next: () => {
                        this.companies = this.companies.filter((c) => c.id !== company.id);

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: 'La empresa fue eliminada correctamente',
                            life: 3000
                        });
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar la empresa',
                            life: 3000
                        });
                        console.error('Error al eliminar la empresa:', err);
                    }
                });
            }
        });
    }
}
