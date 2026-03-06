import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <h1>Dashboard</h1>
    <mat-card>
      <mat-card-content>
        <p>Bienvenido. Aquí irá el contenido del dashboard (placeholders).</p>
      </mat-card-content>
    </mat-card>
  `,
})
export class DashboardHomeComponent {}
