# WebRPG Fase 11 — Save Completo & Lançamento (GitHub Pages) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Última fase da spec `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` — fecha os achados #4 e #5 da seção 12.1 e encerra o documento. Duas promessas da spec nunca cumpridas: (a) **importar save** (seção 7: "importar = selecionar/arrastar arquivo" e "save corrompido/inválido: o jogo não trava — oferece novo jogo ou importar backup") — `importarSave()` existe em `WebRPG/src/armazenamento/localStorage.js:31` mas **nenhuma tela chama**, e um save corrompido no "Continuar" cai silenciosamente na criação; (b) **deploy** (seção 2: "Site estático (compatível com GitHub Pages)") — não existe workflow, o `vite.config.js` não tem `base` nem `publicDir`, e todos os caminhos de asset são absolutos (`/assets/...`), o que quebra sob o subcaminho `https://<user>.github.io/<repo>/`.

**Architecture:** Task 1 é só UI + fluxo (a serialização/validação já existe em `engine/save/` desde a Fase 2). Tasks 2-3 são infra de build/deploy: primeiro tornar o build de produção íntegro e relocável (auditoria empírica com `vite build` + `vite preview`, não por suposição — ver o aviso da Task 2), depois o workflow. Task 4 é o checklist de encerramento da spec inteira.

**Tech Stack:** Mesmo stack + GitHub Actions (`actions/deploy-pages`). Nenhuma dependência de runtime nova.

## Global Constraints

- `serializarSave`/`desserializarSave` (`engine/save/`) não mudam — a Fase 2 já definiu o esquema versionado e a validação; esta fase só consome.
- O jogo continua 100% estático (spec seção 9) — o deploy é só build + upload, sem backend.
- Segredos/tokens: o workflow usa apenas o `GITHUB_TOKEN` automático do Actions com as permissões `pages: write`/`id-token: write` — nenhum secret manual é criado.
- Rodar `npm test` (raiz do repo) depois de cada task.

---

### Task 1: Importar save — UI em Configurações + save corrompido oferece as duas saídas

**Files:**
- Modify: `WebRPG/src/telas/configuracao/telaConfiguracoes.js`
- Modify: `WebRPG/src/telas/configuracao/telaConfiguracoes.test.js`
- Modify: `WebRPG/src/telas/titulo/telaTitulo.js`
- Modify: `WebRPG/src/telas/titulo/telaTitulo.test.js`
- Modify: `WebRPG/src/main.js`
- Modify: `WebRPG/src/main.test.js`

**Interfaces:**
- Consumes: `importarSave(textoArquivo) → {valido, jogador, erro}` (já existe, `WebRPG/src/armazenamento/localStorage.js:31`), `salvarNoNavegador` (existente).
- Produces: `montarTelaConfiguracoes` ganha a opção `aoImportar(jogador)` (callback chamado com o jogador importado válido — o chamador em `main.js` decide recarregar a cidade com ele); `montarTelaTitulo` ganha a opção `aoImportar(jogador)` e um estado visual de "save corrompido".

- [ ] **Step 1: Testes que falham em `telaConfiguracoes.test.js`**

```js
  it("importa um save válido de arquivo e chama aoImportar com o jogador", async () => {
    const aoImportar = vi.fn();
    const container = document.createElement("div");
    montarTelaConfiguracoes(container, { jogador: jogadorDeTeste(), aoSair: vi.fn(), aoImportar });

    const input = container.querySelector("#input-importar-save");
    expect(input).not.toBeNull();
    expect(input.accept).toBe("application/json");

    // Simula a seleção de arquivo sem depender de FileReader real do jsdom:
    // a tela deve expor a função de processamento para teste (ver Step 3).
    const { processarTextoImportado } = montarTelaConfiguracoes(container, {
      jogador: jogadorDeTeste(), aoSair: vi.fn(), aoImportar,
    });
    const textoValido = JSON.stringify({ versao: 1, jogador: jogadorDeTeste() });
    processarTextoImportado(textoValido);
    expect(aoImportar).toHaveBeenCalled();
  });

  it("mostra erro visível (e não chama aoImportar) para um arquivo inválido", () => {
    const aoImportar = vi.fn();
    const container = document.createElement("div");
    const { processarTextoImportado } = montarTelaConfiguracoes(container, {
      jogador: jogadorDeTeste(), aoSair: vi.fn(), aoImportar,
    });
    processarTextoImportado("{isso não é um save}");
    expect(aoImportar).not.toHaveBeenCalled();
    expect(container.querySelector(".erro-importacao").textContent.length).toBeGreaterThan(0);
  });
```

(Conferir antes o formato exato que `serializarSave` produz — o `textoValido` do teste deve ser gerado por `serializarSave(jogadorDeTeste())` importado de `@engine/save/index.js`, não montado à mão, para o teste não apostar no shape.)

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- telaConfiguracoes`
Expected: FAIL — `#input-importar-save` não existe.

- [ ] **Step 3: Implementar em `telaConfiguracoes.js`**

No painel de save do template, ao lado do botão de exportar:

```html
<button class="botao" id="botao-exportar-save">Exportar Save</button>
<label class="botao" for="input-importar-save">Importar Save</label>
<input type="file" id="input-importar-save" accept="application/json" hidden />
<p class="erro-importacao" role="alert"></p>
```

Lógica (expor `processarTextoImportado` no retorno para os testes — o listener do input só lê o arquivo e delega):

```js
  const erroImportacao = container.querySelector(".erro-importacao");

  function processarTextoImportado(texto) {
    const { valido, jogador: jogadorImportado, erro } = importarSave(texto);
    if (!valido) {
      erroImportacao.textContent = `Save inválido: ${erro ?? "arquivo não reconhecido"}. Nada foi alterado.`;
      return;
    }
    salvarNoNavegador(jogadorImportado);
    aoImportar(jogadorImportado);
  }

  container.querySelector("#input-importar-save").addEventListener("change", (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => processarTextoImportado(String(leitor.result));
    leitor.readAsText(arquivo);
  });
```

Em `main.js`, no registro da tela de configuração, passar `aoImportar: (jogadorImportado) => irParaCidade(jogadorImportado)` — o save já foi persistido dentro de `processarTextoImportado`, então recarregar a cidade com o jogador novo é suficiente.

- [ ] **Step 4: Save corrompido no Título — oferecer as duas saídas da spec**

Hoje (`main.js:123-129`) um save inválido no "Continuar" cai **silenciosamente** na criação. A spec seção 7 exige oferta explícita: "novo jogo ou importar backup".

Em `telaTitulo.js`: adicionar a opção `modoSaveCorrompido` (booleano) — quando `true`, renderizar acima dos botões um aviso `<p class="aviso-save-corrompido">Seu save está corrompido ou incompatível. Comece uma nova jornada ou importe um backup exportado.</p>` e um `<label class="botao" for="input-importar-titulo">Importar Backup</label><input type="file" id="input-importar-titulo" accept="application/json" hidden />` com o mesmo padrão de leitura da Task 1 Step 3, chamando a opção `aoImportar(jogador)`.

Em `main.js`, no `aoContinuar`:

```js
        aoContinuar: () => {
          const { valido, jogador } = carregarDoNavegador();
          if (valido) {
            irParaCidade(jogador);
          } else {
            // Spec seção 7: save corrompido nunca trava e oferece novo jogo OU importar backup
            registrarTela("titulo", (el) =>
              montarTelaTitulo(el, {
                temSave: false,
                modoSaveCorrompido: true,
                aoNovaJornada: () => iniciarCriacao(),
                aoContinuar: () => {},
                aoImportar: (jogadorImportado) => {
                  salvarNoNavegador(jogadorImportado);
                  irParaCidade(jogadorImportado);
                },
              })
            );
            mostrarTela("titulo");
          }
        },
```

Testes em `telaTitulo.test.js`: `modoSaveCorrompido: true` mostra o aviso e o botão de importar; `modoSaveCorrompido` ausente não mostra nenhum dos dois. Em `main.test.js`: gravar um save corrompido (`localStorage.setItem("webrpg_save", "lixo{{{")`), bootstrap, clicar Continuar → o aviso aparece em vez da criação silenciosa.

- [ ] **Step 5: Rodar tudo e verificar manualmente**

Run: `npm test`
Expected: PASS.

Run: `npm run dev`. Roteiro: exportar o save → limpar `localStorage` → Título → Nova Jornada com outro nome → Configurações → Importar Save (arquivo exportado) → volta pra cidade com o personagem original. Depois: corromper o save no devtools (`localStorage.setItem("webrpg_save", "x")`) → recarregar → Continuar → aviso + Importar Backup funcionam.

- [ ] **Step 6: Commit**

```bash
git add WebRPG/src/telas/configuracao WebRPG/src/telas/titulo WebRPG/src/main.js WebRPG/src/main.test.js
git commit -m "feat: importar save (Configuracoes + recuperacao de save corrompido no Titulo) - spec secao 7 completa"
```

---

### Task 2: Build de produção íntegro e relocável (publicDir + base + auditoria de caminhos)

**Files:**
- Modify: `vite.config.js`
- Possibly move: `WebRPG/assets/` → `WebRPG/public/assets/` (ver Step 1 — só se a suspeita se confirmar)
- Possibly modify: `WebRPG/src/audio/tocador.js`, `musica.js`, `WebRPG/src/telas/batalha/sprites.js`, `WebRPG/src/telas/criacao/telaCriacao.js`, `WebRPG/src/estilos/*.css` (todos os pontos com `/assets/` absoluto — lista completa levantada na pesquisa: `tocador.js:14`, `musica.js:18`, `sprites.js:31`, `telaCriacao.js:9`, `mundo.css`, `masmorra.css`, `paineis.css`, e os CSS das Fases 8-9 se já executadas)
- Modify: os testes que assertam caminhos (`tocador.test.js`, `musica.test.js`, `sprites.test.js`, `telaTorre.test.js`) conforme o helper escolhido

**AVISO — diagnosticar antes de mexer:** a spec seção 12.1 (achado #5) registra a *suspeita* de que o build de produção nem copia `WebRPG/assets/` para `dist/` (o `vite.config.js` tem `root: "WebRPG"` sem `publicDir`, e o default do Vite é `<root>/public`, que não existe — `/assets/` funciona no dev server porque o Vite serve o root inteiro como estático, mas o build só copia o `publicDir`). **Confirmar empiricamente no Step 1 antes de qualquer mudança** — se `dist/` já contiver os assets por algum motivo não previsto, pular o Step 2 e documentar.

- [ ] **Step 1: Diagnóstico empírico do build atual**

```bash
npm run build
ls dist/assets 2>/dev/null || echo "SEM PASTA dist/assets"
npx vite preview
```

Abrir a URL do preview e navegar Título → criação → cidade → batalha com o devtools aberto na aba Network. Anotar exatamente quais requisições de `/assets/...` retornam 404 (previsão: todas — fonte, sprites, tiles, UI kit, áudio).

- [ ] **Step 2: Mover os assets para o `publicDir` padrão**

Se o Step 1 confirmou os 404s:

```bash
mkdir WebRPG/public
git mv WebRPG/assets WebRPG/public/assets
```

Isso preserva **todas** as URLs `/assets/...` existentes (dev e build) porque o conteúdo de `<root>/public` é servido/copiado na raiz. Rodar `npm run build && npx vite preview` de novo e repetir a navegação — zero 404s esperados agora. Rodar `npm test` (nenhum teste referencia o caminho físico `WebRPG/assets/`, só URLs — conferir com `grep -rn "WebRPG/assets" WebRPG/src engine` antes de assumir).

Atualizar as referências documentais que apontam para o caminho físico antigo (`WebRPG/assets/CREDITS.md` continua onde está — ele se move junto; conferir menções em `docs/` e nos próprios planos apenas se forem instruções ainda não executadas).

- [ ] **Step 3: Tornar o app relocável sob subcaminho (`base`)**

Descobrir o nome real do repositório: `git remote get-url origin` (esperado: algo como `RPG---THE-LOST-WORLD`). Em `vite.config.js`:

```js
export default defineConfig({
  root: "WebRPG",
  // GitHub Pages serve em https://<user>.github.io/<repo>/ — o base precisa
  // bater com o nome do repo no deploy, e continuar "/" no dev local.
  base: process.env.VITE_BASE ?? "/",
  // ...resto igual...
});
```

O workflow (Task 3) passará `VITE_BASE=/<nome-do-repo>/` no build de deploy. Dev local e testes continuam com `base: "/"` — zero impacto no fluxo diário.

- [ ] **Step 4: Auditar os caminhos absolutos em JS**

Com `base` configurado, referências **em JS** a `/assets/...` precisam do prefixo. Criar `WebRPG/src/caminhos.js`:

```js
// Prefixa o base do Vite (ex. "/RPG---THE-LOST-WORLD/" no GitHub Pages, "/" no dev)
// em caminhos de asset montados dinamicamente em JS — CSS é reescrito pelo próprio
// Vite no build, mas template strings em JS não são.
export function caminhoAsset(caminhoRelativo) {
  return `${import.meta.env.BASE_URL}${caminhoRelativo}`;
}
```

Trocar os call sites de JS levantados na pesquisa:
- `tocador.js:14` → `new Audio(caminhoAsset(`assets/audio/efeitos/${nome}.ogg`))`
- `musica.js:18` → idem com `assets/audio/musica/${nome}.ogg`
- `sprites.js:31` → `url(${caminhoAsset(`assets/personagens/${personagem}/${nomeAnimacao}.png`)})`
- `telaCriacao.js:9` → idem no template string

Atualizar as asserções dos testes correspondentes (`tocador.test.js:37`, `musica.test.js:40`, `sprites.test.js:9`, `telaTorre.test.js:48`): no Vitest, `import.meta.env.BASE_URL` é `"/"`, então as asserções existentes com `/assets/...` continuam válidas **se** o helper for usado — rodar e conferir em vez de assumir; ajustar só o que falhar.

**CSS não entra nesta auditoria por decisão consciente:** o Vite reescreve `url()` em CSS importado apontando para o `publicDir` quando `base` está configurado — **verificar isso empiricamente no Step 5** (é exatamente para isso que o build com base simulada existe); se a reescrita não acontecer para algum arquivo, converter esses `url("/assets/...")` para o padrão que o preview provar funcionar, documentando no commit.

- [ ] **Step 5: Verificação final com base simulada**

```bash
VITE_BASE=/simulacao-subpasta/ npm run build
npx vite preview
```

(No PowerShell: `$env:VITE_BASE = "/simulacao-subpasta/"; npm run build`.)

Navegar o fluxo completo (Título → criação → cidade → batalha → torre → masmorra) na URL do preview com a subpasta, devtools/Network aberto: **zero 404s** — este é o teste que o deploy real vai repetir.

- [ ] **Step 6: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add vite.config.js WebRPG/public WebRPG/src package.json
git commit -m "fix: build de producao integro e relocavel (publicDir correto, base configuravel, caminhos de asset auditados)"
```

(Se o Step 2 moveu os assets, o `git mv` já está no stage — conferir com `git status` que a movimentação aparece como rename, não como delete+add de centenas de arquivos binários novos.)

---

### Task 3: Workflow de deploy no GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md` (link para o jogo publicado, se o repositório tiver README; criar seção curta se não tiver)

**Interfaces:**
- Consumes: o build relocável da Task 2 (`VITE_BASE`).
- Produces: deploy automático a cada push na `main`, com `npm test` como gate.

- [ ] **Step 1: Criar `.github/workflows/deploy.yml`**

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          VITE_BASE: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

(Conferir a versão de Node usada localmente com `node --version` e alinhar o `node-version` — o repo não tem `.nvmrc`/`engines` conhecido; usar a major local.)

- [ ] **Step 2: Habilitar o Pages no repositório**

Via `gh` CLI (ou instruir o usuário se faltar permissão):

```bash
gh api -X POST repos/{owner}/{repo}/pages -f build_type=workflow 2>/dev/null || gh api -X PUT repos/{owner}/{repo}/pages -f build_type=workflow
```

- [ ] **Step 3: Commit, push e acompanhar o primeiro deploy**

**Push é ação externa — confirmar com o usuário antes**, seguindo o padrão das fases anteriores (a Fase 6/7 pediu autorização via pergunta explícita antes do push).

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: deploy automatico no GitHub Pages (testes como gate, base derivado do nome do repo)"
git push origin main
gh run watch
```

- [ ] **Step 4: Verificar o site publicado**

Abrir `https://<user>.github.io/<repo>/` num navegador (ou via Playwright, mesmo padrão de verificação das fases anteriores): jogar Título → criação → cidade → uma batalha, com devtools/Network aberto. **Zero 404s, zero erros de console.** Se algum asset 404ar aqui mas não no preview local da Task 2 Step 5, o diagnóstico é diferença entre `VITE_BASE` simulado e o nome real do repo — corrigir e re-push.

- [ ] **Step 5: Registrar a URL**

Adicionar a URL pública ao `README.md` e ao topo da spec (`docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`).

---

### Task 4: Checklist final da spec inteira e encerramento

**Files:**
- Modify: `docs/superpowers/docs.md`
- Modify: `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`

A revisão tela a tela detalhada já foi feita na Fase 9 Task 3 — este checklist é a verificação de encerramento: cada promessa estrutural da spec, conferida uma última vez **na URL pública** (não no dev server), porque é assim que os jogadores vão receber o jogo.

- [ ] **Seção 4.2 (mapa de telas):** Título → Criação → Cidade navegável em tiles, e os 7 destinos (Guilda, Loja, Torre, Masmorra, Arena, Personagem, Config) todos alcançáveis e retornáveis.
- [ ] **Seção 4.3 (batalha):** cenário por local, sprites com as 4 animações, barras drenando, 4 ações funcionais (Atacar · Poção · Defender · Fugir — correção 12.2 aplicada), fila de eventos sequencial, log rolável, ícones de status com tooltip.
- [ ] **Seção 4.4 (masmorra):** 10 temas selecionáveis, grade com névoa, tiles reais, encontro vira batalha de sprites, vencer limpa a sala.
- [ ] **Seção 7 (saves):** criar → jogar → exportar → limpar navegador → importar → continuar do mesmo ponto; save corrompido oferece novo jogo/importar sem travar; auto-save após batalha e compra (recarregar e conferir).
- [ ] **Seção 5/CREDITS:** `WebRPG/(public/)assets/CREDITS.md` cobre todo pack presente no repositório, com licença.
- [ ] **Seção 8:** `npm test` completo verde; anotar a contagem final de testes.
- [ ] **Zero 404/erros de console** no fluxo inteiro acima, na URL pública.
- [ ] Marcar a Fase 11 como ✅ Concluída em `docs/superpowers/docs.md`.
- [ ] Atualizar o cabeçalho da spec: `**Status:** Concluída — todas as fases (0-11) implementadas e verificadas; jogo publicado em <URL>. Documento encerrado; trabalho futuro (seção 12.5) requer spec nova.`
- [ ] **Reportar o resultado**, item a item, com a URL pública no topo.

---

## Self-Review

**Cobertura da spec** (seção 12.1/12.4, achados #4 e #5):
- Importar save + save corrompido com as duas saídas → Task 1 (usa o `importarSave` já existente e nunca chamado; nenhuma mudança no esquema de save). ✅
- Build íntegro/relocável → Task 2, com diagnóstico empírico obrigatório antes de mexer (a suspeita do `publicDir` está registrada como suspeita na spec, e o plano trata como tal). ✅
- Deploy GitHub Pages com gate de testes → Task 3, push condicionado a confirmação do usuário (ação externa). ✅
- Encerramento formal da spec → Task 4. ✅

**Consistência de assinatura:** `montarTelaConfiguracoes`/`montarTelaTitulo` ganham opções novas (`aoImportar`, `modoSaveCorrompido`) — aditivas, com os chamadores existentes intactos quando omitidas. `caminhoAsset` centraliza o prefixo de base num único ponto testável.

**Riscos conhecidos:** (a) a reescrita de `url()` de CSS pelo Vite sob `base` é verificada empiricamente (Task 2 Steps 4-5), não assumida; (b) o `git mv` de centenas de PNGs precisa aparecer como rename no stage (Task 2 Step 6) para não inflar o repositório; (c) o primeiro deploy pode expor diferença entre a base simulada e o nome real do repo — coberto pela Task 3 Step 4.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-11-webrpg-fase11-save-lancamento.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
