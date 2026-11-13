# Contrato da API REST

Base local: `http://localhost:8080/api`. JSON em UTF-8. Escritas usam `Content-Type: application/json`. A PoC não possui autenticação.

## Endpoints

| Método e caminho | Resultado | Regras |
| --- | --- | --- |
| `POST /collection-points` | 201, ponto e cabeçalho `Location` | Cria identidade no servidor |
| `GET /collection-points` | 200, lista | Ordena por nome; pode retornar `[]` |
| `GET /collection-points/{id}` | 200, ponto | 404 se não existir |
| `PUT /collection-points/{id}` | 200, ponto atualizado | Substitui campos de negócio; não cria ponto ausente |
| `DELETE /collection-points/{id}` | 204, sem corpo | Exclui também seus descartes; 404 se ausente |
| `POST /collection-points/{id}/disposals` | 201, descarte | Ponto existente, material aceito e quantidade positiva |
| `GET /collection-points/{id}/disposals` | 200, lista | Mais recentes primeiro; 404 se ponto ausente |
| `DELETE /collection-points/{id}/disposals/{disposalId}` | 204, sem corpo | Descarte deve pertencer ao ponto; senão 404 |

## Corpo de cadastro e edição de ponto

```json
{
  "name": "Eco Ponto Central",
  "description": "Ponto fictício para demonstração",
  "address": {
    "street": "Avenida Brasil",
    "number": "1000",
    "neighborhood": "Centro",
    "city": "Maringá",
    "state": "PR",
    "zipCode": "87000-000"
  },
  "acceptedMaterials": ["BATTERY", "GLASS"],
  "openingHours": "08:00 - 18:00"
}
```

Todos os campos são obrigatórios, exceto `description`. Textos obrigatórios não podem conter somente espaços. O servidor exige endereço completo e lista não vazia de materiais válidos. O contrato não valida formato específico de CEP/UF nem faz verificação geográfica.

Na edição, envie todos os campos obrigatórios, inclusive os que não mudaram. `id` no corpo é ignorado. A resposta acrescenta `id`. Alterar materiais aceitos não apaga nem reclassifica descartes históricos. Não há token de versão: entre duas edições concorrentes, prevalece a última gravação.

## Corpo de descarte

```json
{
  "materialType": "BATTERY",
  "quantity": 10,
  "unit": "UNITS"
}
```

A resposta acrescenta `id`, `collectionPointId` e `disposalDate`. A associação é determinada pela URL. `disposalDate` pode ser enviada no formato local `2026-11-13T10:00:00`; quando ausente, o servidor usa seu relógio. A data é truncada a milissegundos. Datas futuras não possuem regra de bloqueio nesta versão.

Materiais: `BATTERY`, `ELECTRONICS`, `COOKING_OIL`, `GLASS`, `MEDICINE`, `LIGHT_BULB`, `OTHER`.

Unidades: `UNITS`, `KG`, `LITERS`. A quantidade deve ser maior que zero. A PoC não impõe combinação específica de material e unidade nem exige inteiro para `UNITS`.

## Erros

```json
{
  "status": 400,
  "message": "Verifique os campos informados.",
  "errors": { "name": "Informe o nome." }
}
```

- **400:** campos inválidos, JSON inválido, enum desconhecido ou material não aceito.
- **404:** ponto ou descarte inexistente; inclui descarte que não pertence ao ponto.
- **503:** indisponibilidade de acesso ao banco. Retorna mensagem genérica, sem detalhes da conexão.

Erros sem detalhe por campo retornam `errors: {}`. Para restrições de CORS, somente `http://localhost:4200` é permitido. Métodos liberados: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.

## Exemplo manual de leitura

```bash
curl --fail-with-body http://localhost:8080/api/collection-points
```

Para testar escrita, use uma base de demonstração e os corpos acima. Os testes automatizados de controller estão em `backend/src/test/java/br/edu/ecodescarte/ApiTest.java`; usam MongoDB simulado e não substituem a verificação real de persistência.
