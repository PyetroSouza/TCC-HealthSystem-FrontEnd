# MedTime - Front-end

Aplicação web do **MedTime**, sistema de acompanhamento de medicamentos voltado a **cuidadores**. Por ela, o cuidador acompanha os pacientes vinculados a ele, cadastra medicamentos, controla a agenda de tomadas, o estoque e consulta o histórico.

> Trabalho de Conclusão de Curso | Técnico em Desenvolvimento de Sistemas — SENAI Jandira, 2026

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Fluxo de vínculo cuidador e paciente](#fluxo-de-vínculo-cuidador-e-paciente)
- [Publicação](#publicação)
- [Limitações conhecidas e melhorias futuras](#limitações-conhecidas-e-melhorias-futuras)
- [Equipe](#equipe)

## Visão geral

O MedTime é dividido em partes que se comunicam por uma API REST:

| Parte | Descrição |
|---|---|
| **Front-end web** (este repositório) | Interface para o cuidador. |
| **Back-end** (repositório `https://github.com/FranciscoWala/TCC-HealthSystem-BackEnd.git`) | API REST com autenticação por token JWT e banco de dados relacional. |
| **Aplicativo mobile** (repositório `https://github.com/FranciscoWala/TCC-HealthSystem_Mobile.git`) | Usado pelo paciente, que se cadastra, entra na própria conta e informa o código de vínculo. |

O acesso web é destinado somente a cuidadores. Pacientes utilizam o aplicativo.

## Funcionalidades

**Conta e acesso**
- Cadastro com verificação de e-mail por código.
- Login convencional e login/cadastro com conta Google.
- Recuperação e redefinição de senha.
- Tela "Minha Conta" em modo de visualização.

**Pacientes**
- Vínculo de pacientes por código temporário (validade de 10 minutos).
- Lista de pacientes acompanhados, com o próximo medicamento de cada um.
- Painel individual do paciente.

**Medicamentos**
- Cadastro, edição e exclusão de medicamentos, com foto opcional.
- Programação de horários e agenda do dia.
- Confirmação de tomada, que atualiza agenda, estoque e histórico.
- Controle de estoque, com aviso visual de estoque baixo.
- Histórico de tomadas.

**Qualidade de uso**
- Layout responsivo (celular, tablet e desktop).
- Navegação por teclado nas telas principais e foco visível.
- Validação de formulários e mensagens de erro e de carregamento.

## Tecnologias

- [React](https://react.dev/) 19 e [Vite](https://vite.dev/)
- [React Hook Form](https://react-hook-form.com/) com [Zod](https://zod.dev/) para formulários e validação
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) para login com Google
- [Sonner](https://sonner.emilkowal.ski/) para notificações
- [Lucide](https://lucide.dev/) para ícones
- [Cloudinary](https://cloudinary.com/) para envio das imagens dos medicamentos
- ESLint com regras de hooks do React

## Como rodar localmente

**Pré-requisitos**
- Node.js 22 ou superior
- Back-end do MedTime em execução (por padrão em `http://localhost:8080`)

**Passo a passo**

```bash
# 1. Clone o repositório
git clone https://github.com/PyetroSouza/TCC-HealthSystem-FrontEnd.git

# 2. Entre na pasta do projeto React
cd TCC-HealthSystem-FrontEnd/medtime-react

# 3. Instale as dependências
npm install

# 4. Crie o arquivo de variáveis de ambiente
cp .env.example .env
# edite o .env com os seus valores (veja a seção abaixo)

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

## Variáveis de ambiente

Crie um arquivo `.env` dentro de `medtime-react/` com:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Não | URL base da API. Se omitida, usa `http://localhost:8080/v1/healthSystem/medtime`. |
| `VITE_GOOGLE_CLIENT_ID` | Sim, para login Google | Client ID do OAuth criado no Google Cloud Console. |
| `VITE_CLOUDINARY_CLOUD_NAME` | Sim, para fotos | Nome da conta no Cloudinary. |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Sim, para fotos | Upload preset (sem assinatura) do Cloudinary. |

Observações:
- Variáveis com prefixo `VITE_` ficam **visíveis no código publicado**. Nunca coloque senhas ou chaves secretas nelas.
- O arquivo `.env` não deve ser versionado.
- Para o login Google funcionar, a URL em que o site roda precisa estar em "Origens JavaScript autorizadas" do Client ID no Google Cloud Console.

## Scripts

Execute dentro de `medtime-react/`:

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática. |
| `npm run build` | Gera a versão de produção na pasta `dist/`. |
| `npm run preview` | Serve localmente a versão gerada pelo build. |
| `npm run lint` | Verifica o código com ESLint. |

## Estrutura do projeto

```
medtime-react/
  public/assets/          Imagens e fontes estáticas (inclui a logo)
  src/
    components/           Componentes reutilizáveis (cards, cabeçalho, upload de imagem)
      auth/               Verificação de código por e-mail
      vinculo/            Modal e componentes do vínculo de pacientes
    contexts/             Contexto de autenticação
    hooks/                Hooks personalizados (agenda de medicamentos)
    pages/                Telas da aplicação (login, início, dashboard, medicamentos...)
    schemas/              Esquemas de validação (Zod)
    services/             Comunicação com a API
    utils/                Funções auxiliares (formatação, montagem de payloads)
    config.js             URL base da API
```

## Fluxo de vínculo cuidador e paciente

O cuidador não cria a conta do paciente. O vínculo funciona assim:

1. O paciente se cadastra e entra na própria conta pelo aplicativo.
2. No site, o cuidador clica em **Vincular paciente** e gera um código temporário de 6 dígitos.
3. O paciente informa esse código no aplicativo.
4. O paciente passa a aparecer em **Pacientes acompanhados** do cuidador.

Cada cuidador só acessa os dados dos pacientes vinculados a ele.

## Publicação

O repositório possui um workflow do GitHub Actions (`.github/workflows/deploy.yml`) que gera o build e publica no GitHub Pages.

Para publicar, é necessário:
- Informar `VITE_API_URL` apontando para um back-end acessível por **HTTPS**.
- Informar `VITE_GOOGLE_CLIENT_ID` e as variáveis do Cloudinary no passo de build.
- Conferir que o `base` em `vite.config.js` corresponde ao nome do repositório no Pages.

## Limitações conhecidas e melhorias futuras

- **Vincular conta Google a uma conta já criada com senha:** hoje o sistema orienta o usuário a entrar com a senha. Um vínculo seguro exigiria uma nova rota no back-end que confirme a senha junto com o token do Google.
- **Edição dos dados em "Minha Conta":** a tela está em modo de visualização enquanto a rota de atualização de usuário não estiver concluída no back-end. A edição está pronta no front-end e pode ser reativada pela constante `EDICAO_HABILITADA` em `src/pages/MinhaConta.jsx`.
- **Cadastro do paciente pelo cuidador:** pacientes sem celular exigiriam uma rota própria no back-end.
- **Notificações, integração com pulseira e mapa de farmácias:** possíveis evoluções.
- O sistema lida com informações de saúde. Antes de uso real, seria necessária uma revisão de segurança e de conformidade com a LGPD.

## Equipe

| Integrante | Atuação | GitHub | LinkedIn |
|---|---|---|---|
| Francisco Wala | Gestão e Mobile | [GitHub](https://github.com/FranciscoWala) | [LinkedIn](https://www.linkedin.com/in/francisco-wala-a9805919a/) |
| Kayque Almeida | Back-end e Banco de Dados | [GitHub](https://github.com/KayqueBrenno1) | [LinkedIn](https://www.linkedin.com/in/kayque-brenno/) |
| Pyetro Ferreira | Front-end e UI/UX | [GitHub](https://github.com/PyetroSouza) | [LinkedIn](https://www.linkedin.com/in/pyetro-ferreira-1a29ab194/) |
| Samuel Silva | Mobile e Back-end | [GitHub](https://github.com/samusilva310109-a11y) | [LinkedIn](https://www.linkedin.com/in/samuel-silva-4120133b9/) |

---

**MedTime — Tecnologia para um cuidado mais organizado.**