// ✅ companies-form.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DgiiService } from '@/shared/services/dgii/dgii.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FluidModule, ButtonModule, InputTextModule, ToastModule, FormsModule],
  templateUrl: './companies-form.component.html'
})
export class CompaniesFormComponent implements OnInit {
  @ViewChild('rncInput') rncInput!: ElementRef;
  dgiiService = inject(DgiiService);
  private route = inject(ActivatedRoute);

  companyForm!: FormGroup;
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
      rnc: [null, [Validators.required, Validators.pattern(/^\d{9,11}$/)]],
      name: ['', Validators.required],
      commercialName: ['', Validators.required],
      category: [''],
      paymentScheme: [''],
      state: [''],
      economicActivity: [''],
      governmentBranch: ['']
    });

    this.companyForm.get('rnc')?.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((rnc) => {
        const cleanRnc = (rnc || '').toString().replace(/-/g, '');
        if (/^\d{9,11}$/.test(cleanRnc)) {
          this.autocompletarDesdeDGII(cleanRnc);
        }
      });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompanyData(+id);
    }
  }

  loadCompanyData(id: number) {
    this.http.get<any>(`/api/Company/${id}`).subscribe({
      next: (company) => {
        this.companyForm.patchValue({
          rnc: company.rnc,
          name: company.name,
          commercialName: company.commercialName,
          category: company.category,
          paymentScheme: company.paymentScheme,
          state: company.state,
          economicActivity: company.economicActivity,
          governmentBranch: company.governmentBranch
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

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Llena todos los campos requeridos' });
      return;
    }

    const data = this.isEditMode ? this.companyForm.getRawValue() : this.companyForm.value;
    data.rnc = data.rnc?.toString().replace(/-/g, '');
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

  autocompletarDesdeDGII(rnc: string): void {
    this.http.get<any>(`/api/Dgii/${rnc}`).subscribe({
      next: (res) => {
        if (!res || Object.keys(res).length === 0 || res.error) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin resultados',
            detail: res.error || 'No se encontraron datos para este RNC o cédula'
          });
          return;
        }

        const sanitize = (value: string) => value?.replace(/\s+/g, ' ').trim();

        this.companyForm.patchValue({
          name: sanitize(res['Nombre/Razón Social'] || ''),
          commercialName: sanitize(res['Nombre Comercial'] || ''),
          category: sanitize(res['Categoría'] || ''),
          paymentScheme: sanitize(res['Régimen de pagos'] || ''),
          state: sanitize(res['Estado'] || ''),
          economicActivity: sanitize(res['Actividad Economica'] || ''),
          governmentBranch: sanitize(res['Administracion Local'] || '')
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Autocompletado exitoso',
          detail: 'Datos recuperados desde la DGII'
        });
      },
      error: (err) => {
        console.error('Error al consultar DGII', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló la consulta al servicio de la DGII' });
      }
    });
  }
}
