# WebRPG Fase 9 — Cenários Parallax & Áudio Definitivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar os dois últimos achados de `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` seção 11.1 (achados #4-#5): dar um cenário de fundo por local de batalha (a spec seção 4.3 pede isso explicitamente desde 2026-07-08 e nunca foi implementado), e resolver a lacuna de áudio conhecida desde a Fase 7 — jingles curtos em vez de música ambiente, e Torre/Masmorra/Arena sem nenhuma música própria. Fecha com uma revisão visual final tela a tela contra a referência Knights of Pen & Paper, retomando o critério de pronto original da Fase 5 (spec seção 6).

**Architecture:** Nenhuma camada nova. Task 1 adiciona um parâmetro `local` opcional a `montarTelaBatalha`/`iniciarBatalha` (default `"treino"`, retrocompatível com as chamadas existentes que não passam esse campo) e usa CSS `background-image` em camadas (mesma técnica de qualquer fundo parallax simples via `background-position`/múltiplos `div`s absolutamente posicionados) — não introduz canvas nem motor de parallax dedicado. Task 2 só troca arquivos de áudio e adiciona chamadas a `tocarMusica(nome)` (já existe e já aceita qualquer nome, Fase 5/7) em telas que hoje não chamam nada.

**Tech Stack:** Mesmo stack das Fases 6-8 — Vite/vanilla JS, Vitest + jsdom, packs CC0 (Kenney.nl / itch.io).

## Global Constraints

- Nenhum hotlink — todo asset copiado para dentro de `WebRPG/assets/` e registrado em `WebRPG/assets/CREDITS.md`.
- `montarTelaBatalha(container, { jogador, inimigo, local })` — `local` é **opcional**; todo call site existente (`WebRPG/src/main.js`, `WebRPG/src/telas/batalha/controladorBatalha.test.js`) que não passa `local` continua funcionando com o valor padrão `"treino"`, sem precisar editar nenhum teste existente.
- `tocarMusica(nome)` (`WebRPG/src/audio/musica.js`) não muda de assinatura — só ganha novos arquivos `.ogg` e novos call sites.
- Rodar `npm test` (raiz do repo) depois de cada task.

---

### Task 1: Cenário de fundo por local de batalha

**Files:**
- Create: `WebRPG/assets/cenarios/parallax/` (pack baixado + os fundos efetivamente usados: `floresta.png`, `cripta.png`, `pedra-escura.png`)
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.js`
- Modify: `WebRPG/src/main.js`
- Modify: `WebRPG/src/estilos/batalha.css`, `WebRPG/src/estilos/torre.css`
- Modify: `WebRPG/assets/CREDITS.md`

**Interfaces:**
- `montarTelaBatalha(container, { jogador, inimigo, local = "treino" })` — `local` vira uma classe CSS no `.palco-batalha` (`palco-batalha--treino`, `palco-batalha--masmorra`).
- `iniciarBatalha(container, jogador, inimigoOriginal, { onFim, local } = {})` repassa `local` para `montarTelaBatalha` sem alterar o resto do fluxo.
- `.palco-torre` (Fase 7 Task 4) ganha um fundo próprio via CSS, sem precisar de parâmetro (a Torre não usa `montarTelaBatalha` — tem UI própria desde a Fase 4).

Achado (spec seção 11.1, #4, texto original da spec seção 4.3 desde 2026-07-08): "Cenário de fundo parallax por local (floresta/missão, pedra escura/torre, cripta/masmorra)". Hoje `.palco-batalha` é um gradiente CSS liso (`WebRPG/src/estilos/batalha.css:26-36`) e `.palco-torre` não tem nenhum `background` (só o sprite do boss, Fase 7 Task 4). Só existem 2 call sites reais de `montarTelaBatalha` hoje — treino (`main.js`) e masmorra (`telaMasmorra.js`) — Arena e Guilda resolvem combate em log de texto, sem palco (spec seção 11.4, fora de escopo).

- [ ] **Step 1: Escrever o teste que falha em `telaBatalha.test.js`**

Adicionar ao final do arquivo:

```js
describe("cenário de fundo por local", () => {
  it("usa a classe do local de treino por padrão", () => {
    const container = document.createElement("div");
    montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(container.querySelector(".palco-batalha").classList.contains("palco-batalha--treino")).toBe(true);
  });

  it("usa a classe do local passado explicitamente", () => {
    const container = document.createElement("div");
    montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
      local: "masmorra",
    });
    expect(container.querySelector(".palco-batalha").classList.contains("palco-batalha--masmorra")).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- telaBatalha`
Expected: FAIL — `.palco-batalha` não tem nenhuma classe `palco-batalha--*` hoje.

- [ ] **Step 3: Implementar em `telaBatalha.js`**

Encontrar:

```js
export function montarTelaBatalha(container, { jogador, inimigo }) {
  container.innerHTML = `
    <div class="tela-batalha">
      <div class="palco-batalha"></div>
```

Substituir por:

```js
export function montarTelaBatalha(container, { jogador, inimigo, local = "treino" }) {
  container.innerHTML = `
    <div class="tela-batalha">
      <div class="palco-batalha palco-batalha--${local}"></div>
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- telaBatalha`
Expected: PASS.

- [ ] **Step 5: Repassar `local` em `controladorBatalha.js`**

Encontrar:

```js
export function iniciarBatalha(container, jogador, inimigoOriginal, { onFim } = {}) {
  let estado = criarEstadoBatalha(jogador, inimigoOriginal);
  const elementos = montarTelaBatalha(container, {
    jogador: estado.jogador,
    inimigo: estado.inimigo,
  });
```

Substituir por:

```js
export function iniciarBatalha(container, jogador, inimigoOriginal, { onFim, local } = {}) {
  let estado = criarEstadoBatalha(jogador, inimigoOriginal);
  const elementos = montarTelaBatalha(container, {
    jogador: estado.jogador,
    inimigo: estado.inimigo,
    local,
  });
```

(Quando `local` é `undefined`, `montarTelaBatalha` já aplica o próprio default `"treino"` — não precisa repetir o default aqui.)

- [ ] **Step 6: Passar `local: "treino"` e `local: "masmorra"` nos call sites**

Em `WebRPG/src/main.js`, função `irParaBatalhaDeTreino`, encontrar:

```js
    registrarTela("batalha", (el) =>
      iniciarBatalha(el, jogador, criarInimigoTreino(), {
        onFim: (fim) => {
```

Substituir por:

```js
    registrarTela("batalha", (el) =>
      iniciarBatalha(el, jogador, criarInimigoTreino(), {
        local: "treino",
        onFim: (fim) => {
```

Em `WebRPG/src/telas/masmorra/telaMasmorra.js`, na função `verificarEncontro`, encontrar:

```js
    iniciarBatalha(areaBatalha, jogador, inimigo, {
      onFim: (fim) => {
```

Substituir por:

```js
    iniciarBatalha(areaBatalha, jogador, inimigo, {
      local: "masmorra",
      onFim: (fim) => {
```

- [ ] **Step 7: Baixar o pack de parallax**

Buscar um pack de fundo parallax gratuito/CC0 — o autor `ansimuz` no itch.io (`https://ansimuz.itch.io/`) já estava listado como candidato desde a Fase 6/CREDITS.md; confirmar na página exata o nome do pack e a licença antes de baixar. Precisa cobrir pelo menos os 3 temas: floresta (para treino), cripta/masmorra escura, pedra/pedra escura (para torre). Se um único pack não cobrir os 3, usar mais de um pack (registrar cada um separadamente em CREDITS.md, mesma prática já usada para os packs de áudio na Fase 7).

Extrair para `WebRPG/assets/cenarios/parallax/_pacote-<nome>/` e copiar os 3 fundos escolhidos (uma imagem única "achatada" por tema é suficiente — não é necessário implementar camadas de parallax reais com múltiplas velocidades de scroll para esta fase; ver nota de escopo abaixo) para `WebRPG/assets/cenarios/parallax/{floresta,cripta,pedra-escura}.png`.

**Nota de escopo:** "parallax" na spec original (seção 4.3) descreve o *estilo visual* da referência (Knights of Pen & Paper usa camadas com profundidade), não necessariamente uma implementação técnica de scroll multi-camada — a tela de batalha aqui é estática (sem side-scroll), então uma imagem de fundo única e bem escolhida por tema já cumpre o objetivo visual ("deixar de parecer um formulário"). Se o pack baixado já vier organizado em camadas (comum em packs de parallax) e for barato compor 2-3 camadas com `background-position`/`z-index` para dar profundidade sutil (nuvens/montanhas se movendo levemente diferente do chão), fazer isso é um bônus, mas não é obrigatório para o critério de pronto.

- [ ] **Step 8: Aplicar como CSS**

Em `WebRPG/src/estilos/batalha.css`, encontrar:

```css
.palco-batalha {
  position: relative;
  flex: 1;
  min-height: 320px;
  background: linear-gradient(180deg, #241f33 0%, #14121a 100%);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: var(--espaco-lg);
}
```

Substituir por:

```css
.palco-batalha {
  position: relative;
  flex: 1;
  min-height: 320px;
  background-color: #14121a;
  background-size: cover;
  background-position: center bottom;
  image-rendering: pixelated;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: var(--espaco-lg);
}

.palco-batalha--treino {
  background-image: url("/assets/cenarios/parallax/floresta.png");
}

.palco-batalha--masmorra {
  background-image: linear-gradient(180deg, rgba(20, 18, 26, 0.3) 0%, rgba(20, 18, 26, 0.7) 100%),
    url("/assets/cenarios/parallax/cripta.png");
}
```

(O gradiente escuro sobreposto em `--masmorra` mantém o contraste com os sprites/números de dano em cima de um fundo de cripta possivelmente mais claro — mesmo raciocínio já documentado na Fase 7 para `text-shadow` na masmorra.)

Em `WebRPG/src/estilos/torre.css`, encontrar:

```css
.palco-torre {
  min-height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
```

Substituir por:

```css
.palco-torre {
  min-height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: #0e0d13;
  background-image: linear-gradient(180deg, rgba(14, 13, 19, 0.3) 0%, rgba(14, 13, 19, 0.75) 100%),
    url("/assets/cenarios/parallax/pedra-escura.png");
  background-size: cover;
  background-position: center bottom;
  image-rendering: pixelated;
}
```

- [ ] **Step 9: Verificar manualmente**

Run: `npm run dev`. Entrar numa batalha de treino (fundo de floresta), numa masmorra até um encontro (fundo de cripta escurecido), e na Torre (fundo de pedra escura atrás do sprite do boss).

Expected: cada palco mostra um fundo condizente com o local, com contraste suficiente para ler nome/barras/log por cima.

- [ ] **Step 10: Registrar em CREDITS.md, rodar a suíte completa e commitar**

Run: `npm test`
Expected: todos os testes passam (incluindo `controladorBatalha.test.js`, que não passa `local` em nenhuma chamada — usa o default `"treino"` sem precisar de edição).

```bash
git add WebRPG/assets/cenarios/parallax WebRPG/src/telas/batalha WebRPG/src/telas/masmorra/telaMasmorra.js WebRPG/src/main.js WebRPG/src/estilos/batalha.css WebRPG/src/estilos/torre.css WebRPG/assets/CREDITS.md
git commit -m "feat: cenario de fundo por local de batalha (treino/floresta, masmorra/cripta, torre/pedra escura) - pedido desde a spec original, nunca implementado"
```

---

### Task 2: Áudio ambiente definitivo (Torre/Masmorra ganham música própria, faixas mais longas)

**Files:**
- Create: `WebRPG/assets/audio/musica/torre.ogg`, `masmorra.ogg`
- Modify: `WebRPG/assets/audio/musica/cidade.ogg`, `batalha.ogg` (substituição de conteúdo, mesmo nome de arquivo)
- Modify: `WebRPG/src/telas/torre/telaTorre.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.test.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.test.js`
- Modify: `WebRPG/assets/CREDITS.md`

**Interfaces:**
- Consome: `tocarMusica(nome)` (`WebRPG/src/audio/musica.js`, existente desde a Fase 5/7, assinatura inalterada — já aceita qualquer nome de arquivo em `WebRPG/assets/audio/musica/`).
- Produz: nada novo para outras tasks.

Achado (spec seção 11.1, #5; `WebRPG/assets/CREDITS.md`, limitação conhecida desde a Fase 7): o pack de música atual (`music-jingles`, Kenney) só tem *stingers* curtos de poucos segundos tocando em loop, em vez de faixas ambiente de verdade; além disso, Torre, Masmorra e Arena nunca chamam `tocarMusica` — tocam com o silêncio (ou a música da cidade, se o jogador entrou vindo de lá e nada pausou) em vez de música própria. Esta task resolve as duas coisas para Torre e Masmorra (a Arena continua sem música própria — não tem palco de batalha nenhum, spec seção 11.4 já marca isso como fora de escopo tanto para Fase 6-7 quanto para 8-9).

- [ ] **Step 1: Baixar faixas ambiente mais longas**

Buscar um pack de música ambiente/loopável de verdade (não *stingers*) em `https://kenney.nl/assets?q=music` (categoria "Music") ou packs de itch.io equivalentes, gratuitos/CC0, com faixas de pelo menos ~1-2 minutos cada, idealmente já projetadas para loop sem corte perceptível. Precisa de pelo menos 4 faixas distintas por tom: cidade (calma), batalha (tensa), torre (sombria/épica), masmorra (tensa/misteriosa) — duas faixas podem compartilhar o mesmo arquivo se o pack não tiver variedade suficiente (ex. torre e masmorra usando a mesma faixa "sombria"), documentando isso em CREDITS.md em vez de forçar 4 faixas artificialmente diferentes de baixa qualidade.

- [ ] **Step 2: Substituir e criar os arquivos**

```bash
cp "<faixa-calma-real>.ogg" WebRPG/assets/audio/musica/cidade.ogg
cp "<faixa-tensa-real>.ogg" WebRPG/assets/audio/musica/batalha.ogg
cp "<faixa-sombria-epica-real>.ogg" WebRPG/assets/audio/musica/torre.ogg
cp "<faixa-misteriosa-real>.ogg" WebRPG/assets/audio/musica/masmorra.ogg
```

- [ ] **Step 3: Escrever o teste que falha em `telaTorre.test.js`**

Adicionar, importando `tocarMusica` com `vi.mock`:

```js
vi.mock("@audio/musica.js", () => ({ tocarMusica: vi.fn() }));
import { tocarMusica } from "@audio/musica.js";

it("toca a música da torre ao montar a tela", () => {
  const container = document.createElement("div");
  montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
  expect(tocarMusica).toHaveBeenCalledWith("torre");
});
```

(Ajustar o caminho do mock (`@audio/musica.js`) para bater com o alias real usado nos outros imports do arquivo — conferir `vite.config.js`/imports existentes em `telaTorre.js` antes de escrever o teste, para não quebrar por caminho incorreto.)

- [ ] **Step 4: Rodar e confirmar falha**

Run: `npm test -- telaTorre`
Expected: FAIL — `tocarMusica` nunca é chamado hoje.

- [ ] **Step 5: Implementar em `telaTorre.js`**

Adicionar o import:

```js
import { tocarMusica } from "@audio/musica.js";
```

Logo no início de `montarTelaTorre` (antes ou depois de montar o `container.innerHTML`, mesma convenção de `main.js`'s `irParaCidade`/`irParaBatalhaDeTreino`):

```js
export function montarTelaTorre(container, { jogador, aoSair }) {
  tocarMusica("torre");
  container.innerHTML = `
```

- [ ] **Step 6: Rodar e confirmar sucesso**

Run: `npm test -- telaTorre`
Expected: PASS.

- [ ] **Step 7: Repetir os Steps 3-6 para `telaMasmorra.js`**

Mesmo padrão: teste `expect(tocarMusica).toHaveBeenCalledWith("masmorra")`, chamada `tocarMusica("masmorra")` logo no início de `montarTelaMasmorra`, antes do `container.innerHTML`.

Run: `npm test -- telaMasmorra`
Expected: PASS.

- [ ] **Step 8: Verificar manualmente com áudio ligado**

Run: `npm run dev` com som do navegador ligado. Percorrer cidade → treino → cidade → torre → cidade → masmorra.

Expected: cada tela troca para sua própria faixa (torre e masmorra não continuam tocando a música da cidade ou do silêncio); as faixas de cidade/batalha soam como música ambiente de verdade, não um stinger de 2 segundos repetindo.

- [ ] **Step 9: Registrar em CREDITS.md, rodar a suíte completa e commitar**

Atualizar `WebRPG/assets/CREDITS.md`: remover a "limitação conhecida" de jingles curtos (ou atualizar o texto se ainda houver alguma faixa compartilhada por falta de variedade, conforme Step 1) e documentar o novo pack.

Run: `npm test`
Expected: todos os testes passam.

```bash
git add WebRPG/assets/audio/musica WebRPG/src/telas/torre WebRPG/src/telas/masmorra WebRPG/assets/CREDITS.md
git commit -m "feat: musica ambiente de verdade (faixas mais longas) e Torre/Masmorra ganham musica propria (antes tocavam nada)"
```

---

### Task 3: Revisão visual final tela a tela

**Files:** possivelmente pequenos ajustes de CSS pontuais encontrados durante a revisão — nenhum arquivo previsto de antemão (ver nota abaixo).

Retoma o critério de pronto original da Fase 5 (spec seção 6): "Cada tela revisada contra o padrão de referência [Knights of Pen & Paper]; jogável no celular". As Fases 6-9 fecharam as lacunas de asset que impediam essa revisão de fazer sentido antes — agora que cenário, sprite, UI kit, áudio e ícones existem de verdade, esta task é a comparação lado a lado final.

- [ ] **Step 1: Rodar o jogo e tirar 1 screenshot por tela**

Run: `npm run dev`. Usando Playwright (mesmo padrão de verificação usado nas Fases 6-7), percorrer e capturar: Título, Criação, Cidade, Batalha de treino, Guilda, Loja, Personagem, Configurações, Torre, Masmorra (grid e um encontro), Arena.

- [ ] **Step 2: Comparar cada screenshot contra os princípios da spec seção 4.1**

Para cada tela, checar:
- Painéis/botões usam o UI kit pixel (Fase 6), não caixa CSS lisa.
- Texto de título/números usa a fonte pixel; texto de corpo usa a fonte limpa.
- Cores de raridade (`obterClasseRaridade`) aparecem consistentes em loja/inventário/drops.
- Barras de HP/MP visíveis e com largura correta (regressão do bug da Fase 6 Task 1 não voltou).
- Nenhum ícone/imagem quebrada (404).

- [ ] **Step 3: Documentar e corrigir achados pontuais**

Se algo divergir da referência de um jeito pequeno e isolado (ex. um espaçamento, uma cor de contraste insuficiente), corrigir diretamente com um commit próprio por achado, mesmo padrão de correção documentada já usado nas Fases 6-7 (ex. o bug do `border-image fill`). Se algo divergir de um jeito grande (uma tela inteira precisando de redesenho), **não implementar dentro desta task** — documentar como achado para uma fase futura em vez de expandir esta revisão num redesenho não planejado.

- [ ] **Step 4: Testar responsividade mobile**

Reduzir a viewport do Playwright para um tamanho de celular (ex. 375×667) e repetir a passagem pelas telas principais (Cidade, Batalha, Masmorra). Confirmar que o layout responsivo da Fase 5 continua funcionando com os novos cenários de fundo (Task 1) sem cortar conteúdo.

- [ ] **Step 5: Rodar a suíte completa**

Run: `npm test` e `npm run build`.
Expected: ambos passam (a menos que o Step 3 tenha adicionado testes de regressão para algo corrigido, que devem passar também).

- [ ] **Step 6: Commit (se houve correções no Step 3)**

```bash
git add <arquivos tocados no Step 3>
git commit -m "fix: ajustes pontuais encontrados na revisão visual final (Fase 9)"
```

(Se nenhuma correção foi necessária, pular este commit — não há nada para commitar só pela revisão em si.)

---

### Task 4: Playtest checklist de fim de fase e fechamento

**Files:**
- Modify: `docs/superpowers/docs.md`
- Modify: `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` (marcar seção 11 como concluída, mesmo padrão da seção 10 após a Fase 6/7)

- [ ] Rodar `npm run dev`, limpar `localStorage`, jogar do Título até uma masmorra completa e uma sessão de Torre.
- [ ] Cada palco de batalha (treino/masmorra) e a Torre mostram um cenário de fundo condizente com o local (Task 1).
- [ ] Cidade, treino, Torre e Masmorra cada um toca sua própria música ao entrar (Task 2); as faixas soam como música ambiente, não um jingle de poucos segundos repetindo.
- [ ] A revisão visual final (Task 3) não encontrou nenhuma tela "parecendo um formulário".
- [ ] Console do navegador sem 404s em `/assets/...` e sem erros não tratados, do Título até a Masmorra e a Torre.
- [ ] `npm test` (suíte completa) e `npm run build` passam.
- [ ] Atualizar `docs/superpowers/docs.md`: marcar a linha da Fase 9 como ✅ Concluída.
- [ ] Atualizar a spec (seção 11): anotar que as Fases 8-9 foram implementadas e verificadas, mesmo padrão usado para a Fase 6/7 no cabeçalho da spec.
- [ ] **Reportar o resultado.** Se algum item da lista falhar, anotar exatamente qual e por quê.

---

## Self-Review

**Cobertura da spec** (seção 11.1/11.3, achados #4-#5):
- Cenário de fundo por local de batalha → Task 1. ✅ (com a nota de escopo documentada no Step 7 de que "parallax" aqui é uma imagem de fundo por tema, não um motor de scroll multi-camada — decisão consciente, não uma simplificação silenciosa).
- Áudio ambiente definitivo + Torre/Masmorra com música própria → Task 2. ✅ (Arena continua sem música/palco próprio, já documentado como fora de escopo na spec seção 11.4).
- Revisão visual final (retomando o critério original da Fase 5) → Task 3.

**Consistência de tipo/assinatura:** `montarTelaBatalha(container, { jogador, inimigo, local = "treino" })` (Task 1) é uma extensão estritamente aditiva e retrocompatível — nenhum call site existente (incluindo `controladorBatalha.test.js`, que tem 6 chamadas sem `local`) precisa ser editado. `tocarMusica(nome)` (Task 2) não muda de assinatura, só ganha novos call sites e novos arquivos.

**Placeholder scan:** os placeholders `<faixa-...-real>.ogg`/pack a escolher nas Tasks 1 e 2 dependem de pesquisa em tempo de execução (nome exato do pack, licença), mesmo padrão já usado em todas as tasks de asset das Fases 6-8.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-11-webrpg-fase9-cenarios-audio.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
