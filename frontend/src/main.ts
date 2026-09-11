import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
    console.error('Não foi possível iniciar o EcoDescarte.', error);
    const root = document.querySelector('app-root');

    if (root) {
        root.textContent = 'Não foi possível iniciar o EcoDescarte. Recarregue a página.';
    }
});
