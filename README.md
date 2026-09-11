# EcoDescarte

## Sobre

Prova de conceito acadêmica para uma AEP de Engenharia de Software. Permite cadastrar e consultar pontos de coleta e registrar descartes realizados nesses locais. Esta é a primeira entrega, com escopo reduzido.

## Problema

Muitas pessoas não sabem onde descartar pilhas, baterias, eletrônicos, óleo, vidro, medicamentos e lâmpadas. A falta de informação contribui para o descarte incorreto desses resíduos. O EcoDescarte reúne os locais de coleta e informa quais materiais cada um recebe.

## ODS

**ODS 12 — Consumo e Produção Responsáveis.** A aplicação facilita o acesso a informações sobre descarte adequado e permite registrar a destinação de resíduos, incentivando práticas de consumo e descarte responsáveis.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | Angular 21, TypeScript 5.9, HTML, CSS, standalone components, HttpClient, Reactive Forms |
| Backend | Java 21, Spring Boot 3.5, Maven, Spring Web, Spring Data MongoDB, Bean Validation |
| Banco | MongoDB 7.0, Docker Compose |
| Testes do backend | JUnit 5, Mockito, MockMvc, JaCoCo |
| Testes do frontend | Vitest, Angular TestBed, HttpTestingController, jsdom |

## Arquitetura

```text
Angular (localhost:4200)
    ↓ HTTP / JSON
API REST Spring Boot (localhost:8080)
    ↓ Spring Data MongoDB
MongoDB (localhost:27017 / ecodescarte)
```

Frontend e backend são aplicações separadas. O backend organiza o fluxo em controller → service → repository. A persistência utiliza as collections `collection_points` e `disposals`, sem banco SQL ou armazenamento em memória como substituto do MongoDB.

Veja [docs/architecture.md](docs/architecture.md).

## Estrutura do projeto

```text
.
├── frontend/
│   ├── src/app/
│   │   ├── collection-point-list/
│   │   ├── collection-point-form/
│   │   ├── collection-point-detail/
│   │   ├── disposal-form/
│   │   ├── models/
│   │   ├── services/
│   │   └── shared/
│   ├── angular.json
│   └── package.json
├── backend/
│   ├── src/main/java/br/edu/ecodescarte/
│   │   ├── collectionpoint/
│   │   ├── disposal/
│   │   ├── shared/
│   │   ├── config/
│   │   └── exception/
│   ├── src/main/resources/application.yml
│   ├── src/test/java/br/edu/ecodescarte/
│   └── pom.xml
├── mongodb/
│   ├── docker-compose.yml
│   └── init-db.js
├── docs/architecture.md
├── .editorconfig
├── .gitignore
└── README.md
```

## Executando o projeto

### Pré-requisitos

- **JDK 21 completo**, incluindo `javac`; apenas o JRE não é suficiente.
- Maven 3.6.3 ou superior.
- Node.js 22.12 ou superior da linha 22, ou Node.js 24, com npm.
- Docker com Docker Compose e daemon em execução.
- Portas `27017`, `8080` e `4200` disponíveis.

Confira as ferramentas antes de iniciar:

```sh
java -version
javac -version
mvn -version
node --version
npm --version
docker compose version
```

O `mvn -version` deve apontar para o JDK 21. Se necessário, ajuste `JAVA_HOME` para o diretório do JDK e inclua `$JAVA_HOME/bin` no `PATH`. Caso um arquivo pessoal `mavenrc` force outra versão, `MAVEN_SKIP_RC=1 mvn -version` permite conferir a versão sem carregar esse arquivo. Não é necessário alterar outros projetos da máquina.

### 1. MongoDB

Na raiz do projeto:

```sh
cd mongodb
docker compose up -d
docker compose ps
```

Aguarde o serviço ficar `healthy`. Para aguardar automaticamente: `docker compose up -d --wait`.

Se estiver no terminal integrado do VS Code instalado via Flatpak e receber `docker: comando não encontrado`, execute o Docker do sistema com `flatpak-spawn`. Dentro da pasta `mongodb`:

```sh
flatpak-spawn --host docker compose up -d --wait
flatpak-spawn --host docker compose ps
```

Essa alternativa requer Docker instalado e funcionando no sistema hospedeiro. Também é possível usar os comandos normais em um terminal do sistema, fora do VS Code. Nesse ambiente Flatpak, use o mesmo prefixo `flatpak-spawn --host` nos demais comandos Docker deste README.

O script `init-db.js` cria o banco `ecodescarte` e as duas collections na primeira inicialização de um volume vazio. Os dados permanecem no volume nomeado `mongodb_data`. A configuração é de desenvolvimento, sem credenciais, e publica a porta somente em `127.0.0.1`.

### 2. Backend

Em outro terminal, partindo da raiz:

```sh
cd backend
mvn spring-boot:run
```

Para iniciar com os três pontos fictícios de demonstração, use **no lugar do comando anterior**:

```sh
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

No terminal do VS Code instalado via Flatpak, `mvn: comando não encontrado` pode ocorrer mesmo com Maven instalado no sistema. Execute-o com `flatpak-spawn --host` e informe um JDK 21 completo. Neste ambiente, o JDK preparado durante a implementação está em `~/.cache/ecodescarte-tools/jdk-21.0.12.1+1`. Dentro da pasta `backend`, o comando é:

```sh
flatpak-spawn --host env \
  JAVA_HOME="$HOME/.cache/ecodescarte-tools/jdk-21.0.12.1+1" \
  MAVEN_SKIP_RC=1 \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Esse caminho é específico deste ambiente; o JDK não faz parte do repositório. Em outra máquina, informe seu diretório de instalação do JDK 21. `MAVEN_SKIP_RC=1` evita carregar um `mavenrc` pessoal que force Java 8. As variáveis valem apenas para esse processo, preservando a configuração dos outros projetos.

O perfil `dev` inclui Eco Ponto Central, Ponto Verde Zona Sul e Farmácia Descarte Seguro, todos em Maringá/PR. As inserções usam identificadores fixos e operações atômicas com `$setOnInsert`: reiniciar a aplicação não duplica nem sobrescreve os pontos existentes. Sem o perfil `dev`, nenhum dado de exemplo é inserido; dados já gravados continuam disponíveis.

A conexão padrão é `mongodb://localhost:27017/ecodescarte`. Para utilizar outro MongoDB, informe a variável de ambiente `MONGODB_URI` com a URI e o nome do banco. Falhas de acesso ao banco retornam HTTP 503 com mensagem legível.

### 3. Frontend

Em um terceiro terminal, partindo da raiz:

```sh
cd frontend
npm install
npm start
```

Abra `http://localhost:4200`. O frontend chama diretamente `http://localhost:8080/api`, definido em `frontend/src/environments/environment.ts`. O backend permite CORS para a origem `http://localhost:4200`.

O `package-lock.json` está versionável e fixa as dependências. Para uma instalação reproduzível, também é possível usar `npm ci`.

### Encerrando

Use `Ctrl+C` nos terminais do frontend e do backend. Para encerrar o banco, na pasta `mongodb`, execute `docker compose down`. O volume e os dados são preservados.

## URLs

| Serviço | Endereço |
| --- | --- |
| Frontend | http://localhost:4200 |
| Backend | http://localhost:8080 |
| API de pontos | http://localhost:8080/api/collection-points |
| MongoDB | localhost:27017 — banco `ecodescarte` |

O backend expõe uma API: sua raiz `/` não possui página HTML.

## Funcionalidades da primeira versão

1. Cadastrar ponto de coleta com endereço, horário e materiais aceitos.
2. Listar pontos de coleta.
3. Visualizar os detalhes de um ponto.
4. Registrar um descarte em um ponto existente.
5. Visualizar os descartes registrados naquele ponto.

As rotas Angular são `/`, `/collection-points/new` e `/collection-points/:id`. O formulário de descarte aparece na tela de detalhes e oferece somente materiais aceitos pelo local.

## API e regras de negócio

| Método | Endpoint | Sucesso |
| --- | --- | --- |
| POST | `/api/collection-points` | 201, ponto criado e cabeçalho `Location` |
| GET | `/api/collection-points` | 200, lista ordenada por nome |
| GET | `/api/collection-points/{id}` | 200, detalhes |
| POST | `/api/collection-points/{id}/disposals` | 201, descarte criado |
| GET | `/api/collection-points/{id}/disposals` | 200, lista por data decrescente |

Exemplo de cadastro de ponto:

```sh
curl -i -X POST http://localhost:8080/api/collection-points \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Eco Ponto do Bairro",
    "description": "Ponto municipal de coleta",
    "address": {
      "street": "Avenida Brasil",
      "number": "1000",
      "neighborhood": "Centro",
      "city": "Maringá",
      "state": "PR",
      "zipCode": "87000-000"
    },
    "acceptedMaterials": ["BATTERY", "ELECTRONICS", "GLASS"],
    "openingHours": "08:00 - 18:00"
  }'
```

Substitua `<id>` pelo identificador retornado para registrar um descarte:

```sh
curl -i -X POST 'http://localhost:8080/api/collection-points/<id>/disposals' \
  -H 'Content-Type: application/json' \
  -d '{"materialType":"BATTERY","quantity":10,"unit":"UNITS"}'
```

Para consultar:

```sh
curl http://localhost:8080/api/collection-points
curl 'http://localhost:8080/api/collection-points/<id>'
curl 'http://localhost:8080/api/collection-points/<id>/disposals'
```

- O ponto precisa existir: caso contrário, retorna **404**.
- O material precisa constar em `acceptedMaterials`: caso contrário, retorna **400**.
- `materialType`, `quantity` e `unit` são obrigatórios; a quantidade deve ser maior que zero. Dados inválidos retornam **400**.
- `collectionPointId` vem obrigatoriamente do `{id}` da URL; o cliente não pode substituir esse vínculo pelo corpo da requisição.
- `disposalDate` é opcional na API e recebe a data/hora atual quando omitida. Uma data enviada deve seguir ISO 8601 local, por exemplo `2026-09-11T10:00:00`.
- Nome, endereço completo, pelo menos um material e horário são obrigatórios no cadastro. Descrição é opcional.
- JSON malformado e valores inexistentes de enums retornam **400**.

Materiais: `BATTERY`, `ELECTRONICS`, `COOKING_OIL`, `GLASS`, `MEDICINE`, `LIGHT_BULB`, `OTHER`.

Unidades: `UNITS`, `KG`, `LITERS`. A primeira entrega não impõe combinações adicionais entre material e unidade.

Erros da aplicação seguem o formato:

```json
{
  "status": 400,
  "message": "Verifique os campos informados.",
  "errors": { "quantity": "A quantidade deve ser maior que zero." }
}
```

## Testes

Backend, a partir da raiz:

```sh
cd backend
mvn test
```

JUnit 5 e Mockito verificam os serviços; MockMvc verifica controllers, Bean Validation, CORS e tratamento de erros usando os serviços reais e repositories simulados. A suíte **não depende de MongoDB nem Docker**. Inclui cadastro, consulta, ponto inexistente, quantidade inválida, material não aceito, datas, isolamento das consultas e inserção dos dados de demonstração.

Frontend, a partir da raiz:

```sh
cd frontend
npm test
```

Os testes verificam formulários, materiais permitidos, requisições HTTP, rotas, respostas de erro, bloqueio de envio duplicado e cancelamento de requisições obsoletas. Usam DOM simulado, sem iniciar um navegador.

## Cobertura

```sh
cd backend
mvn verify
```

O comando compila, executa os testes, empacota o backend e gera o relatório em:

```text
backend/target/site/jacoco/index.html
```

Os arquivos XML e CSV também ficam em `target/site/jacoco/`. A regra JaCoCo exige no mínimo **70% de linhas e 70% de decisões (branches)** no conjunto do backend. O `mvn verify` falha se qualquer limite não for atingido. Não há exclusões de classes para aumentar a cobertura.

## Builds

Em terminais separados, partindo da raiz:

```sh
cd backend
mvn clean verify
```

```sh
cd frontend
npm run build
```

Artefatos: `backend/target/ecodescarte-0.0.1-SNAPSHOT.jar` e `frontend/dist/ecodescarte/browser/`. O Docker é utilizado somente para o MongoDB.

## Decisões técnicas

- Java records representam documentos e endereço, evitando getters, setters e Lombok. Controllers e services usam injeção por construtor.
- Um `DisposalRequest` separado recebe apenas os dados permitidos para criação de descarte. Os identificadores são atribuídos pelo servidor.
- A descrição é opcional; as demais validações de cadastro se limitam ao preenchimento e à lista de materiais.
- Quantidades usam `BigDecimal` no Java e `Decimal128` no MongoDB para preservar valores decimais. O frontend usa `number`.
- Datas usam `LocalDateTime`, conforme os exemplos desta PoC. A data automática usa o fuso do backend e um `Clock` injetado para permitir testes determinísticos. A precisão é limitada a milissegundos, a mesma do MongoDB, para manter a resposta igual ao documento lido posteriormente. A PoC pressupõe demonstração no mesmo fuso horário.
- Um índice em `disposals.collectionPointId` atende à consulta dos descartes de um ponto. Não há edição ou exclusão de pontos nesta versão; a aplicação não altera a lista de materiais entre a consulta e a gravação de um descarte.
- O Angular usa CSS puro, componentes standalone e carregamento das páginas por rota. Requisições são canceladas ao destruir componentes; a troca de ponto também cancela consultas anteriores.
- Angular 21 foi escolhido pela compatibilidade com TypeScript 5.9 e Node 22/24, conforme a [tabela oficial](https://angular.dev/reference/versions). Spring Boot 3.5 atende ao requisito de JUnit 5.
- MongoDB 7.0 foi usado porque a imagem 8.0 recusou iniciar no kernel 7.0 do ambiente de validação. A incompatibilidade da linha 8 com kernels recentes está registrada nas [notas oficiais do MongoDB](https://www.mongodb.com/docs/manual/administration/production-notes/).

## Verificação desta entrega

Verificação realizada em 11/09/2026:

- Backend: **56 testes passando**, build e empacotamento concluídos.
- JaCoCo: **98,06% de linhas**, **100% de decisões**; limite de 70% aprovado.
- Frontend: **25 testes passando**, build de produção concluído e servidor de desenvolvimento respondendo em `localhost:4200`.
- MongoDB iniciado pelo Compose e aprovado no healthcheck; backend conectado ao banco real.
- Cinco fluxos da API verificados por HTTP, incluindo rejeições 400/404 e CORS.
- Serviços Angular executados contra a API e o MongoDB reais em uma verificação adicional com DOM simulado.
- Quantidade `Decimal128`, data BSON e vínculo conferidos diretamente no MongoDB; descarte preservado após reiniciar o banco.
- A verificação de interface usa testes de DOM simulado. A inspeção visual em navegador não foi realizada.

## Evoluções futuras

**Não estão implementadas nesta entrega:**

- Mapa de pontos de coleta.
- Busca por localização.
- Histórico por usuário.
- Estatísticas.
- Avaliações.

A primeira entrega não inclui login, usuários reais, autenticação, autorização, geolocalização, upload, notificações, dashboard, ranking, sistema de pontos ou integrações externas.
