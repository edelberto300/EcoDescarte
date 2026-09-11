import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {

    if (error instanceof HttpErrorResponse) {

        if (error.status === 0) {
            return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.';
        }

        const body: unknown = error.error;

        if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') {
            const details = 'errors' in body && typeof body.errors === 'object' && body.errors !== null
                ? Object.values(body.errors).filter((value): value is string => typeof value === 'string') : [];
            return [body.message, ...details].join(' ');
        }
    }

    return 'Não foi possível concluir a operação. Tente novamente.';
}
