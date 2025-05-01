import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-users',
  imports: [TableModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
    users: any[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
      this.http.get<any[]>('/api/User').subscribe({
        next: (data) => (this.users = data),
        error: (err) => console.error('Error al cargar usuarios', err)
      });
    }
}
