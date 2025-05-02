import { DgiiService } from '@/shared/services/dgii/dgii.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

interface OptionDto {
    id: number;
    name: string;
}

@Component({
    selector: 'app-companies',
    imports: [TableModule, ToastModule, ReactiveFormsModule, FluidModule, ButtonModule, DropdownModule, InputTextModule, CommonModule],
    templateUrl: './companies-form.component.html'
})
export class CompaniesFormComponent implements OnInit {
    @ViewChild('rncInput') rncInput!: ElementRef;
    dgiiService = inject(DgiiService);
    private route = inject(ActivatedRoute);

    companyForm!: FormGroup;

    categories: OptionDto[] = [];
    paymentSchemes: OptionDto[] = [];
    states: OptionDto[] = [];
    economicActivities: OptionDto[] = [];
    governmentBranches: OptionDto[] = [];
    rncInputModel: string = '';
    isEditMode: boolean = false;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.companyForm = this.fb.group({
            rnc: [null, Validators.required],
            name: ['', Validators.required],
            commercialName: ['', Validators.required],
            categoryId: [null, Validators.required],
            paymentSchemeId: [null, Validators.required],
            stateId: [null, Validators.required],
            economicActivityId: [null, Validators.required],
            governmentBranchId: [null, Validators.required]
        });

        this.loadDropdowns();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadCompanyData(+id);
        }
    }

    loadCompanyData(id: number) {
        this.http.get<any>(`/api/Company/${id}`).subscribe({
            next: (company) => {
                console.log('Que viene en company', company);
                this.companyForm.patchValue({
                    rnc: company.rnc,
                    name: company.name,
                    commercialName: company.commercialName,
                    categoryId: company.category.id,
                    paymentSchemeId: company.paymentScheme.id,
                    stateId: company.state.id,
                    economicActivityId: company.economicActivity.id,
                    governmentBranchId: company.governmentBranch.id
                });

                this.companyForm.get('rnc')?.disable();
                this.isEditMode = true;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la empresa' });
                console.error(err);
            }
        });
    }

    loadDropdowns() {
        this.http.get<OptionDto[]>('/api/DropDownOptions/company-categories').subscribe((data) => (this.categories = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions//payment-schemes').subscribe((data) => (this.paymentSchemes = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions/company-states').subscribe((data) => (this.states = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions/economic-activities').subscribe((data) => (this.economicActivities = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions/government-branches').subscribe((data) => (this.governmentBranches = data));
    }

    onSubmit(): void {
        if (this.companyForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Llena todos los campos requeridos' });
            return;
        }

        const data = this.isEditMode ? this.companyForm.getRawValue() : this.companyForm.value;
        const id = this.route.snapshot.paramMap.get('id');

        const request$ = this.isEditMode ? this.http.put(`/api/Company/${id}`, data) : this.http.post('/api/Company', data);

        request$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.isEditMode ? 'Actualizado' : 'Registrado',
                    detail: this.isEditMode ? 'Empresa actualizada' : 'Empresa registrada'
                });
                this.router.navigate(['/company/detail']);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la empresa' });
                console.error(err);
            }
        });
    }

    onRncEnter(): void {
        const rnc = this.companyForm.get('rnc')?.value?.toString();

        if (!rnc || rnc.length !== 9 || !/^\d{9}$/.test(rnc)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'RNC inválido',
                detail: 'Debe contener exactamente 9 dígitos numéricos'
            });
            return;
        }

        this.dgiiService.consultarRNC(rnc).subscribe({
            next: (response) => {
                try {
                    const parsed = JSON.parse(response.d);
                    console.log('Respuesta DGII:', parsed);

                    if (parsed && parsed.RGE_NOMBRE && parsed.RGE_NOMBRE_COMERCIAL) {
                        this.companyForm.patchValue({
                            name: parsed.RGE_NOMBRE.trim(),
                            commercialName: parsed.RGE_NOMBRE_COMERCIAL.trim()
                        });

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Datos encontrados',
                            detail: 'El nombre y nombre comercial fueron completados automáticamente'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Sin resultados',
                            detail: 'No se encontraron datos para este RNC'
                        });
                    }
                } catch (err) {
                    console.error('Error al parsear respuesta DGII:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo interpretar la respuesta de la DGII'
                    });
                }
            },
            error: (err) => {
                console.error('Error consultando DGII:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ocurrió un problema al consultar el RNC'
                });
            }
        });
    }
}
