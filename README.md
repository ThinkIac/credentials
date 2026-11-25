# credentials

Aplica guarda Bearer por pacote. Prefere `<PACOTE>_ENV_AUTH_TOKEN`, com fallback para `AUTH_TOKEN`. A pipeline `credential:verify` pode permitir, rejeitar ou personalizar a resposta.

```sh
npm install ThinkIac/credentials#<commit>
```

```js
const {buildCredentialGuard} = require('@thinkiac/module-credentials');
const guard = buildCredentialGuard(container, 'app', {env: process.env});
app.get('/private', guard, handler);
```

## Estrutura

Fontes em `src/index.type`, compilados para `dist/index.cjs`. A fachada `index.cjs` preserva a API CommonJS. `provideCredential` mantém o registro declarativo de capacidade; `createRuntimeModule` é alias legado e `createHost` vem do runtime-compat fixado por commit.

## Contratos

`expectedCredential(folder, env)` resolve o token. `buildCredentialGuard(container, folder, {env})` retorna middleware assíncrono. A pipeline recebe o veredito e `{req, res, pkg, token}`. Ausência de credencial ou token inválido resulta em 401. Erros da pipeline propagam. O nome do módulo e do estado continua `credential`, no singular. Comparação de token preserva o comportamento original, sem promessa de tempo constante.

## Validação

`npm test` compila e executa testes, incluindo comparações com o fonte anterior. `npm run test:isolated` instala o artefato sem dependências de desenvolvimento. CI cobre Node 18, 20 e 22.

## Plataforma

Migração compatível, sem novos recursos. Não importa APIs Node diretamente, mas usa process.env como padrão e objetos de middleware do host. Não foi validado em QuickJS ou ESP32. Nunca registre valores de credenciais.
