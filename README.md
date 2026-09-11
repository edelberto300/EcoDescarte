EcoDescarte

Sobre

O EcoDescarte é uma aplicação criada para ajudar pessoas a encontrar locais adequados para descarte de resíduos.

O sistema permite cadastrar pontos de coleta, consultar esses locais e registrar descartes.

Problema

Muitas pessoas não sabem onde descartar corretamente materiais como pilhas, eletrônicos, óleo, vidro, medicamentos e lâmpadas.

O descarte incorreto desses resíduos pode causar impactos ao meio ambiente.

ODS

O projeto está relacionado ao:

ODS 12 — Consumo e Produção Responsáveis

A proposta é ajudar no descarte correto de resíduos e facilitar o acesso a informações sobre pontos de coleta.

Tecnologias

Frontend

Angular

TypeScript

HTML

CSS

Backend

Java

Spring Boot

Maven

Banco de dados

MongoDB

Docker

Testes

JUnit

Mockito

JaCoCo

Testes Angular

Arquitetura

Angular
   ↓
Spring Boot
   ↓
MongoDB

O frontend se comunica com o backend através de uma API REST.

O backend recebe as requisições e salva os dados no MongoDB.

Funcionalidades

Nesta primeira versão é possível:

Cadastrar pontos de coleta

Listar pontos de coleta

Ver detalhes de um ponto

Registrar descartes

Visualizar descartes registrados

Como executar

MongoDB

cd mongodb
docker compose up -d

Backend

cd backend
mvn spring-boot:run

Frontend

cd frontend
npm install
npm start

A aplicação estará disponível em:

http://localhost:4200

Testes

Backend

cd backend
mvn test

Cobertura

mvn verify

Frontend

cd frontend
npm test

A cobertura mínima esperada é de 70%.