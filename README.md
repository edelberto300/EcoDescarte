# EcoDescarte

Prova de Conceito (PoC) da AEP de Engenharia de Software, 6ª série, 2026.2.

O EcoDescarte ajuda pessoas a encontrar pontos de coleta e registrar o descarte de resíduos. O problema abordado é a dificuldade de saber onde encaminhar pilhas, eletrônicos, óleo, vidro, medicamentos e lâmpadas. O público é a comunidade que precisa localizar e manter informações sobre esses locais.

A proposta se relaciona ao **ODS 12 - Consumo e Produção Responsáveis**, por facilitar o encaminhamento de resíduos a pontos adequados. Os registros demonstram o funcionamento da solução; não comprovam destinação efetiva nem redução de impacto ambiental.

## Segunda entrega

A evolução implementada completa o CRUD dos pontos com **edição de nome, descrição, endereço, materiais aceitos e horário**, preservando o identificador e os descartes existentes. Também amplia os testes, prepara a cobertura do frontend e organiza a documentação e o quadro de tarefas.

**Estado da entrega:** código e documentação preparados localmente. Testes, cobertura real, validação visual, publicação final e vídeo ainda precisam ser concluídos conforme [o checklist](docs/segunda-entrega.md). Não há percentual de cobertura medido para esta revisão.

## Funcionalidades

- Cadastrar e listar pontos de coleta.
- Consultar detalhes e materiais aceitos.
- Editar os dados de um ponto sem apagar seus descartes.
- Registrar descarte com material, quantidade positiva, unidade e data.
- Consultar descartes em ordem decrescente de data.
- Excluir um descarte ou um ponto, com confirmação na interface. A exclusão do ponto remove seus descartes.
- Exibir erros de validação e de comunicação com a API.

## Tecnologias e pré-requisitos

| Camada | Tecnologia | Requisito local |
| --- | --- | --- |
| Frontend | Angular 21.2, TypeScript 5.9, RxJS | Node.js 22.12+ na série 22, ou Node.js 24; npm |
| Backend | Java 21, Spring Boot 3.5.16, Spring Data MongoDB | JDK 21 e Maven 3.6.3+ |
| Banco | MongoDB 7 | MongoDB local ou serviço acessível pela URI configurada |
| Testes | JUnit 5, Mockito, MockMvc, JaCoCo; Vitest 4.1.11, jsdom, V8 | Dependências instaladas e comandos abaixo |

O frontend usa `http://localhost:8080/api`. A API atende na porta 8080 e permite CORS de `http://localhost:4200`.

## Execução manual

Os comandos abaixo são para o responsável executar. Maven e Angular podem compilar durante a execução. Nenhum build, Docker ou teste foi executado durante a preparação desta entrega.

1. Disponibilize um MongoDB em `localhost:27017`, com acesso ao banco `ecodescarte`. Uma instalação local dispensa Docker. O arquivo `mongodb/docker-compose.yml` continua disponível como alternativa já existente para uso manual.
2. Na raiz do repositório, inicie a API:

```bash
cd backend
mvn spring-boot:run
```

Para outra instância MongoDB, defina `MONGODB_URI` no ambiente antes de iniciar a API. Não versione credenciais. O padrão está em `backend/src/main/resources/application.yml`.

3. Em outro terminal, na raiz do repositório:

```bash
cd frontend
npm ci
npm start
```

4. Acesse `http://localhost:4200`. Use a API pelo endereço `http://localhost:8080/api/collection-points`.
5. Ao terminar, encerre frontend e backend com `Ctrl+C` e encerre o MongoDB pelo mecanismo usado para iniciá-lo.

### Dados de demonstração

Opcionalmente, inicie o backend com:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

O perfil `dev` inclui três pontos **fictícios** com IDs estáveis. Utiliza inserção condicional e preserva dados de pontos já existentes. Um ponto de demonstração excluído será criado novamente ao reiniciar nesse perfil. Sem `dev`, não há carga inicial automática desses exemplos.

## Testes e cobertura

Execute manualmente, a partir da raiz, em terminais separados:

```bash
cd backend
mvn verify
```

```bash
cd frontend
npm ci
npm run test:coverage
```

- Backend: relatório em `backend/target/site/jacoco/index.html`; limite de 70% de linhas e ramificações.
- Frontend: relatório em `frontend/coverage/ecodescarte/index.html`; limites de 70% de linhas, instruções, funções e ramificações.
- Os dois comandos devem terminar com sucesso. Configurar o limite não prova que ele foi atingido.
- Os testes atuais usam repositórios/HTTP simulados. A persistência real deve ser conferida no roteiro manual.

Veja [testes e evidências](docs/testes.md) para escopo, resultados pendentes e critérios de aceite.

## Estrutura e documentação

```text
backend/    API, regras de negócio, entidades e testes Java
frontend/   interface Angular, serviços HTTP e testes
mongodb/    configuração local e criação inicial das coleções
docs/       documentação técnica e materiais da segunda entrega
```

- [Arquitetura e decisões](docs/architecture.md)
- [Modelagem NoSQL](docs/banco-de-dados.md)
- [Contrato da API](docs/api.md)
- [Testes e validação manual](docs/testes.md)
- [Quadro de tarefas](docs/quadro-de-tarefas.md)
- [Evolução e checklist da segunda entrega](docs/segunda-entrega.md)
- [Roteiro do vídeo de 4 minutos e 30 segundos](docs/roteiro-video.md)
- [Identificação para envio acadêmico](docs/identificacao.md)

Repositório configurado: <https://github.com/edelberto300/EcoDescarte>. A acessibilidade pública e a publicação desta revisão ainda precisam ser verificadas.

## Limites da PoC

Aplicação acadêmica local, sem autenticação ou autorização. Use dados fictícios e não exponha a API publicamente. Edições simultâneas do mesmo ponto seguem a regra de última gravação concluída. A exclusão em duas coleções é herdada da primeira versão e não é transacional; não execute exclusão e registro de descartes simultaneamente na demonstração. As decisões e os riscos estão detalhados na documentação de arquitetura.
