# Arquitetura

O projeto é dividido em três partes:

- Frontend em Angular
- Backend em Spring Boot
- Banco de dados MongoDB

O frontend envia requisições para o backend, e o backend salva e busca os dados no MongoDB.

## Frontend

O frontend foi desenvolvido em Angular.

Ele permite:

- Cadastrar pontos de coleta
- Listar pontos de coleta
- Ver detalhes de um ponto
- Registrar descartes

## Backend

O backend foi desenvolvido em Java com Spring Boot.

Ele é responsável por:

- Receber as requisições do frontend
- Aplicar as regras do sistema
- Salvar e buscar dados no MongoDB

## Banco de dados

O projeto usa MongoDB.

Foram usadas duas collections principais:

- `collection_points`: guarda os pontos de coleta
- `disposals`: guarda os descartes realizados

## Fluxo do descarte

1. O usuário escolhe um ponto de coleta.
2. Informa o material e a quantidade.
3. O frontend envia os dados para o backend.
4. O backend verifica se o ponto existe e se aceita o material.
5. O descarte é salvo no MongoDB.

## Testes

O projeto possui testes automatizados no backend e no frontend.

Também é gerado um relatório de cobertura de testes.