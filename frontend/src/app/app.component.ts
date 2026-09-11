import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterLink, RouterOutlet],
    template: `
        <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
        <header class="site-header">
            <div class="container header-content">
                <a class="brand" routerLink="/" aria-label="EcoDescarte, página inicial">
                    <span class="brand-symbol" aria-hidden="true">↻</span> {{ title }}
                </a>
                <span class="ods-label">ODS 12 · Consumo responsável</span>
            </div>
        </header>
        <main id="main-content" class="container" tabindex="-1">
            <router-outlet />
        </main>
        <footer class="site-footer container">
            <span>EcoDescarte</span>
            <span>Projeto acadêmico · Engenharia de Software</span>
        </footer>
    `
})
export class AppComponent {
    readonly title = 'EcoDescarte';
}
