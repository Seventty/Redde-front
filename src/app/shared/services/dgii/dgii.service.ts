import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DgiiService {
  constructor(private http: HttpClient) {}

  consultarRNC(rnc: string) {
    const url = '/dgii-api/app/WebApps/ConsultasWeb/Rnc/DGII_RNC_Contribuyente.aspx/GetContribuyente';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json;charset=UTF-8'
    });

    return this.http.post<any>(url, { rnc }, { headers });
  }
}
