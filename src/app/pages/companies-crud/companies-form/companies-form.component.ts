import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    imports: [TableModule, ToastModule, ReactiveFormsModule, FluidModule, ButtonModule, DropdownModule, InputTextModule],
    templateUrl: './companies-form.component.html'
})
export class CompaniesFormComponent implements OnInit {
    companyForm!: FormGroup;

    categories: OptionDto[] = [];
    paymentSchemes: OptionDto[] = [];
    states: OptionDto[] = [];
    economicActivities: OptionDto[] = [];
    governmentBranches: OptionDto[] = [];

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
    }

    loadDropdowns() {
        this.http.get<OptionDto[]>('/api/DropDownOptions/company-categories').subscribe((data) => (this.categories = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions//payment-schemes').subscribe((data) => (this.paymentSchemes = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions/company-states').subscribe((data) => (this.states = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions/economic-activities').subscribe((data) => (this.economicActivities = data));
        this.http.get<OptionDto[]>('/api/DropDownOptions/government-branches').subscribe((data) => (this.governmentBranches = data));
    }

    onSubmit(): void {
        if (this.companyForm.valid) {
            this.http.post('/api/Company', this.companyForm.value).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empresa registrada' });
                    this.router.navigate(['/company/detail']);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar' });
                    console.error(err);
                }
            });
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Llena todos los campos requeridos' });
        }
    }
}
