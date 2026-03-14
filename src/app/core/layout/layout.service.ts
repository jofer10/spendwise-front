import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Servicio para controlar el drawer/sidebar desde header (menú) y sidebar (cerrar al navegar).
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private toggle$ = new Subject<void>();
  private close$ = new Subject<void>();

  /** Emitido cuando se debe alternar abrir/cerrar el drawer (p. ej. botón menú). */
  get onToggle() {
    return this.toggle$.asObservable();
  }

  /** Emitido cuando se debe cerrar el drawer (p. ej. clic en enlace en móvil). */
  get onClose() {
    return this.close$.asObservable();
  }

  toggle(): void {
    this.toggle$.next();
  }

  close(): void {
    this.close$.next();
  }
}
