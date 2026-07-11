# WebRPG Fase 6 — Fundação Visual: Correções, Título e Mundo em Tiles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the visual gap documented in `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` section 10: fix the two bugs that make the battle screen look broken (invisible HP/MP bar, missing pixel font), give the game a real Título screen, and replace the city's flat button list with a genuine walkable tile map — laying the shared `engine/mundo` + tile-renderer foundation that Fase 7 reuses for the dungeon and tower.

**Architecture:** Everything is built inside the existing Vite/DOM `WebRPG` app and the existing `engine/` pure-logic package — no game framework is introduced (per spec section 9). A new `engine/mundo/` module provides grid/movement/pathfinding as pure, Vitest-tested functions, mirroring the existing `engine/masmorra/` module's shape (`{x, y, tipo, conteudo}` cells, a `mover(sessao, direcao)` function). A new `WebRPG/src/mundo/rendererTiles.js` is a small, reusable DOM tile renderer + input controller (click-to-walk with pathfinding, arrow keys/WASD) that any screen can mount over an `engine/mundo` grid. The city screen (`telaCidade.js`) is rebuilt on top of these two pieces.

**Tech Stack:** Vite, vanilla JS (ES modules), Vitest + jsdom (existing `vitest.config.js`, unchanged), `@fontsource/press-start-2p` (npm-distributed self-hosted Google Font, avoids hotlinking), Kenney.nl CC0 asset packs (downloaded as zip, extracted locally — never hotlinked, per spec section 5/9).

## Global Constraints

- No hotlinking of any asset — every downloaded file is copied into `WebRPG/assets/` and registered in `WebRPG/assets/CREDITS.md` with pack name, author, source URL, and license (spec section 5/10.2).
- No game framework (Phaser/PixiJS/Godot) — stay on Vite/DOM (spec section 9).
- All new pure logic goes in `engine/` with zero DOM/console access; all new tests are added to the existing single Vitest run (`npm test` from repo root — there is one root `vitest.config.js` covering both `engine/**/*.test.js` and `WebRPG/src/**/*.test.js`, `environment: "jsdom"` for both).
- Existing screens (`telaGuilda`, `telaLoja`, `telaPersonagem`, `telaArena`, `telaConfiguracoes`, `telaBatalha`) are out of scope for this plan — don't touch them.
- Follow existing code conventions: Portuguese identifiers, `montarTelaX(container, props)` screen convention, CSS custom properties from `WebRPG/src/estilos/variaveis.css`, `.painel`/`.botao`/`.barra` reusable classes from `paineis.css`.

---

### Task 1: Fix the invisible HP/MP bar (CSS bug)

**Files:**
- Modify: `WebRPG/src/estilos/paineis.css:38-45`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new (pure CSS fix, no new exports).

This is finding #1 from spec section 10.1: `.barra` has no `width`, and its parent `.painel-status` (in `WebRPG/src/estilos/batalha.css`) is `display: flex; flex-direction: column; align-items: center;` — which shrinks a width-less child to near-zero instead of letting it fill the 160px-wide parent. The fix is one line.

- [ ] **Step 1: Reproduce the bug visually**

Run: `npm run dev` (from repo root), open `http://localhost:5173`, create a character, click "Explorar" to start a battle.

Expected (bug present): the HP bar under each combatant's name is a barely-visible sliver, not a filled colored bar.

- [ ] **Step 2: Apply the fix**

In `WebRPG/src/estilos/paineis.css`, change:

```css
.barra {
  position: relative;
  height: 18px;
  background: var(--cor-barra-vazia);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-painel);
  overflow: hidden;
}
```

to:

```css
.barra {
  position: relative;
  width: 100%;
  height: 18px;
  background: var(--cor-barra-vazia);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-painel);
  overflow: hidden;
}
```

- [ ] **Step 3: Verify visually**

Reload the dev server page, start a battle again.

Expected: HP bar is now a full-width red bar (green/red fill per `--cor-hp`) spanning the 160px status panel, and it visibly shrinks when the combatant takes damage.

- [ ] **Step 4: Run the full test suite to confirm no regression**

Run: `npm test`
Expected: all existing tests still pass (this is a CSS-only change; `telaBatalha.test.js` asserts `style.width` on the inner `.barra__preenchimento`, which is untouched).

- [ ] **Step 5: Commit**

```bash
git add WebRPG/src/estilos/paineis.css
git commit -m "fix: barra de HP/MP invisivel (largura 0 dentro de flex-column centralizado)"
```

---

### Task 2: Self-host the pixel font (Press Start 2P)

**Files:**
- Modify: `WebRPG/package.json` (via `npm install`, repo root `package.json` actually — see step 1)
- Modify: `WebRPG/src/main.js:1-13` (add one import)

**Interfaces:**
- Consumes: nothing new.
- Produces: the `--fonte-pixel: "Press Start 2P", monospace;` custom property (already declared in `variaveis.css`) now resolves to the real font instead of silently falling back to system `monospace` (finding #2, spec section 10.1).

- [ ] **Step 1: Install the self-hosted font package**

Run (from repo root): `npm install @fontsource/press-start-2p`

This is the standard self-hosted-Google-Fonts pattern: the package bundles the actual `.woff2` files inside `node_modules/@fontsource/press-start-2p/`, so nothing is hotlinked — Vite serves the font from the installed package, resolved at build time like any other npm asset.

- [ ] **Step 2: Confirm the package's weight file**

Run: `ls node_modules/@fontsource/press-start-2p/`

Expected: a `400.css` file (Press Start 2P only ships a single regular/400 weight) alongside `files/` containing the woff2s. If the filename differs, use the actual filename found here in step 3.

- [ ] **Step 3: Import the font CSS**

In `WebRPG/src/main.js`, add as the very first import (before the other `./estilos/*.css` imports, so the `@font-face` rule is registered before anything tries to render pixel text):

```js
import "@fontsource/press-start-2p/400.css";
import "./estilos/variaveis.css";
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`, open the app.

Expected: headings and damage numbers that use `var(--fonte-pixel)` (e.g. the "Raça"/"Classe" labels on the creation screen, battle damage numbers) now render in the actual blocky Press Start 2P face, not a generic bold sans-serif fallback.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: all tests pass (no test asserts on font rendering).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json WebRPG/src/main.js
git commit -m "feat: self-hospeda a fonte Press Start 2P via @fontsource (era so um fallback silencioso pra monospace)"
```

---

### Task 3: Build the Título screen

**Files:**
- Create: `WebRPG/src/telas/titulo/telaTitulo.js`
- Create: `WebRPG/src/telas/titulo/telaTitulo.test.js`
- Create: `WebRPG/src/estilos/titulo.css`
- Modify: `WebRPG/src/main.js` (register the screen, make it the boot entry point)

**Interfaces:**
- Consumes: nothing new from other tasks.
- Produces: `montarTelaTitulo(container, { aoNovaJornada, aoContinuar, temSave }) → { botaoNovaJornada, botaoContinuar }` — a screen mount function following the exact same convention as every other screen in `WebRPG/src/telas/*` (`montarTelaX(container, props)`, wired into the router via `registrarTela`/`mostrarTela` from `WebRPG/src/rotas/roteador.js`).

Finding #6 (spec section 10.1): the game currently boots straight into character creation. This task makes Título the real entry point, matching spec section 4.2 (`Título → Criação de Personagem`).

- [ ] **Step 1: Write the failing test**

Create `WebRPG/src/telas/titulo/telaTitulo.test.js`:

```js
import { describe, it, expect, vi } from "vitest";
import { montarTelaTitulo } from "./telaTitulo.js";

describe("montarTelaTitulo", () => {
  it("mostra o logo do jogo", () => {
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada: vi.fn(), aoContinuar: vi.fn(), temSave: false });
    expect(container.querySelector(".logo-titulo").textContent).toContain("THE LOST WORLD");
  });

  it("desabilita Continuar quando não há save", () => {
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada: vi.fn(), aoContinuar: vi.fn(), temSave: false });
    expect(container.querySelector("#botao-continuar").disabled).toBe(true);
  });

  it("habilita Continuar e chama aoContinuar quando há save", () => {
    const aoContinuar = vi.fn();
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada: vi.fn(), aoContinuar, temSave: true });
    const botao = container.querySelector("#botao-continuar");
    expect(botao.disabled).toBe(false);
    botao.click();
    expect(aoContinuar).toHaveBeenCalledOnce();
  });

  it("chama aoNovaJornada ao clicar em Nova Jornada", () => {
    const aoNovaJornada = vi.fn();
    const container = document.createElement("div");
    montarTelaTitulo(container, { aoNovaJornada, aoContinuar: vi.fn(), temSave: false });
    container.querySelector("#botao-nova-jornada").click();
    expect(aoNovaJornada).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- telaTitulo`
Expected: FAIL — `Failed to resolve import "./telaTitulo.js"`.

- [ ] **Step 3: Write the implementation**

Create `WebRPG/src/telas/titulo/telaTitulo.js`:

```js
export function montarTelaTitulo(container, { aoNovaJornada, aoContinuar, temSave }) {
  container.innerHTML = `
    <div class="tela-titulo">
      <h1 class="logo-titulo">THE LOST WORLD</h1>
      <div class="menu-titulo">
        <button class="botao botao--destaque" id="botao-nova-jornada">Nova Jornada</button>
        <button class="botao" id="botao-continuar" ${temSave ? "" : "disabled"}>Continuar</button>
      </div>
    </div>
  `;

  container.querySelector("#botao-nova-jornada").addEventListener("click", () => aoNovaJornada());

  const botaoContinuar = container.querySelector("#botao-continuar");
  if (temSave) {
    botaoContinuar.addEventListener("click", () => aoContinuar());
  }

  return {
    botaoNovaJornada: container.querySelector("#botao-nova-jornada"),
    botaoContinuar,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- telaTitulo`
Expected: PASS (4 tests).

- [ ] **Step 5: Add the stylesheet**

Create `WebRPG/src/estilos/titulo.css`:

```css
.tela-titulo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--espaco-lg);
  min-height: 100vh;
  padding: var(--espaco-lg);
  text-align: center;
}

.logo-titulo {
  font-family: var(--fonte-pixel);
  font-size: clamp(20px, 6vw, 36px);
  color: var(--cor-destaque);
  letter-spacing: 2px;
  text-wrap: balance;
}

.menu-titulo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
  width: min(280px, 90vw);
}
```

- [ ] **Step 6: Wire it into `main.js` as the boot entry point**

In `WebRPG/src/main.js`, add the CSS import next to the other `estilos/*.css` imports:

```js
import "./estilos/titulo.css";
```

Add the screen import next to the other `telas/*` imports:

```js
import { montarTelaTitulo } from "./telas/titulo/telaTitulo.js";
```

Then, inside `bootstrap(container)`, add a new `iniciarTitulo` function and replace the tail of the function. Find this block at the end of `bootstrap`:

```js
  if (existeSaveNoNavegador()) {
    const { valido, jogador } = carregarDoNavegador();
    if (valido) {
      irParaCidade(jogador);
      return;
    }
  }
  iniciarCriacao();
}
```

Replace it with:

```js
  function iniciarTitulo() {
    registrarTela("titulo", (el) =>
      montarTelaTitulo(el, {
        temSave: existeSaveNoNavegador(),
        aoNovaJornada: () => iniciarCriacao(),
        aoContinuar: () => {
          const { valido, jogador } = carregarDoNavegador();
          if (valido) {
            irParaCidade(jogador);
          } else {
            iniciarCriacao();
          }
        },
      })
    );
    mostrarTela("titulo");
  }

  iniciarTitulo();
}
```

This is an intentional behavior change: previously the game silently skipped straight to the city if a save existed. Now it always shows Título first, and "Continuar" is only enabled/clickable when `existeSaveNoNavegador()` is true — matching the spec's `Título → Criação de Personagem` flow (section 4.2).

- [ ] **Step 7: Verify manually**

Run: `npm run dev`, open the app with no save in `localStorage` (or clear it via devtools).

Expected: Título screen shows, "Continuar" is disabled/greyed, clicking "Nova Jornada" goes to character creation. Complete creation, reach the city, reload the page — Título shows again, this time "Continuar" is enabled and clicking it returns to the city with the same character.

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the 4 new `telaTitulo` tests.

- [ ] **Step 9: Commit**

```bash
git add WebRPG/src/telas/titulo WebRPG/src/estilos/titulo.css WebRPG/src/main.js
git commit -m "feat: tela de Titulo como ponto de entrada real (Nova Jornada / Continuar)"
```

---

### Task 4: `engine/mundo/grade.js` — grid primitives, pathfinding

**Files:**
- Create: `engine/mundo/grade.js`
- Create: `engine/mundo/grade.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `criarGradeDeTracado(tracado: string[], legenda: Record<string, {tipo: string, conteudo: object|null}>) → Array<Array<{x:number, y:number, tipo:string, conteudo:object|null}>>`
  - `celulaEm(grade, x: number, y: number) → cell | null`
  - `caminhoAte(grade, origem: {x,y}, destino: {x,y}) → Array<cell> | null` (ordered steps from just-after-origem to destino inclusive; `[]` if origem === destino; `null` if unreachable)
  - `alcancavel(grade, origem, destino) → boolean`
  - Cell `tipo` values used by this module and its consumers: `"chao"`, `"parede"`, `"hotspot"`. A cell blocks movement/pathing iff `tipo === "parede"`.

This is the reusable grid engine — no dungeon/city-specific knowledge lives here. `engine/masmorra/` is untouched (it has its own, older grid shape for the existing dungeon feature); this is a fresh, general module for Fase 6/7's tile-based world.

- [ ] **Step 1: Write the failing tests**

Create `engine/mundo/grade.test.js`:

```js
import { describe, it, expect } from "vitest";
import { criarGradeDeTracado, celulaEm, caminhoAte, alcancavel } from "./grade.js";

const legenda = {
  "#": { tipo: "parede", conteudo: null },
  ".": { tipo: "chao", conteudo: null },
};

describe("criarGradeDeTracado", () => {
  it("converte um traçado de strings numa grade de células com coordenadas", () => {
    const grade = criarGradeDeTracado(["##", ".#"], legenda);

    expect(grade).toHaveLength(2);
    expect(grade[0]).toHaveLength(2);
    expect(grade[0][0]).toEqual({ x: 0, y: 0, tipo: "parede", conteudo: null });
    expect(grade[1][0]).toEqual({ x: 0, y: 1, tipo: "chao", conteudo: null });
  });

  it("lança erro para símbolo fora da legenda", () => {
    expect(() => criarGradeDeTracado(["#X"], legenda)).toThrow('Símbolo "X"');
  });
});

describe("celulaEm", () => {
  const grade = criarGradeDeTracado(["..", ".."], legenda);

  it("retorna a célula quando dentro dos limites", () => {
    expect(celulaEm(grade, 1, 1)).toEqual({ x: 1, y: 1, tipo: "chao", conteudo: null });
  });

  it("retorna null fora dos limites", () => {
    expect(celulaEm(grade, -1, 0)).toBeNull();
    expect(celulaEm(grade, 2, 0)).toBeNull();
    expect(celulaEm(grade, 0, -1)).toBeNull();
    expect(celulaEm(grade, 0, 2)).toBeNull();
  });
});

describe("caminhoAte", () => {
  it("retorna um array vazio quando origem e destino são a mesma célula", () => {
    const grade = criarGradeDeTracado(["..."], legenda);
    expect(caminhoAte(grade, { x: 1, y: 0 }, { x: 1, y: 0 })).toEqual([]);
  });

  it("retorna a sequência de células até o destino, sem incluir a origem", () => {
    const grade = criarGradeDeTracado(["...."], legenda);
    const caminho = caminhoAte(grade, { x: 0, y: 0 }, { x: 3, y: 0 });
    expect(caminho.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
    ]);
  });

  it("retorna null quando o destino é uma parede ou está inalcançável", () => {
    const grade = criarGradeDeTracado(["...", "###", "..."], legenda);
    expect(caminhoAte(grade, { x: 0, y: 0 }, { x: 2, y: 2 })).toBeNull();
  });
});

describe("alcancavel", () => {
  it("retorna true quando existe caminho sem paredes entre origem e destino", () => {
    const grade = criarGradeDeTracado(["...", "#.#", "..."], legenda);
    expect(alcancavel(grade, { x: 0, y: 0 }, { x: 2, y: 2 })).toBe(true);
  });

  it("retorna false quando paredes bloqueiam todo o caminho", () => {
    const grade = criarGradeDeTracado(["...", "###", "..."], legenda);
    expect(alcancavel(grade, { x: 0, y: 0 }, { x: 2, y: 2 })).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- engine/mundo/grade`
Expected: FAIL — `Failed to resolve import "./grade.js"`.

- [ ] **Step 3: Write the implementation**

Create `engine/mundo/grade.js`:

```js
export function criarGradeDeTracado(tracado, legenda) {
  return tracado.map((linha, y) =>
    [...linha].map((simbolo, x) => {
      const definicao = legenda[simbolo];
      if (!definicao) {
        throw new Error(`Símbolo "${simbolo}" não está na legenda (linha ${y}, coluna ${x}).`);
      }
      return { x, y, ...definicao };
    })
  );
}

export function celulaEm(grade, x, y) {
  const linha = grade[y];
  if (!linha) return null;
  return linha[x] ?? null;
}

function vizinhosCaminhaveis(grade, celula) {
  const candidatos = [
    celulaEm(grade, celula.x, celula.y - 1),
    celulaEm(grade, celula.x, celula.y + 1),
    celulaEm(grade, celula.x + 1, celula.y),
    celulaEm(grade, celula.x - 1, celula.y),
  ];
  return candidatos.filter((c) => c && c.tipo !== "parede");
}

export function caminhoAte(grade, origem, destino) {
  if (origem.x === destino.x && origem.y === destino.y) return [];

  const chave = ({ x, y }) => `${x},${y}`;
  const anterior = new Map([[chave(origem), null]]);
  const fila = [origem];

  while (fila.length > 0) {
    const atual = fila.shift();
    for (const vizinho of vizinhosCaminhaveis(grade, atual)) {
      const k = chave(vizinho);
      if (anterior.has(k)) continue;
      anterior.set(k, atual);

      if (vizinho.x === destino.x && vizinho.y === destino.y) {
        const caminho = [vizinho];
        let passo = atual;
        while (passo && !(passo.x === origem.x && passo.y === origem.y)) {
          caminho.unshift(passo);
          passo = anterior.get(chave(passo));
        }
        return caminho;
      }
      fila.push(vizinho);
    }
  }
  return null;
}

export function alcancavel(grade, origem, destino) {
  return caminhoAte(grade, origem, destino) !== null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- engine/mundo/grade`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add engine/mundo/grade.js engine/mundo/grade.test.js
git commit -m "feat: engine/mundo/grade - grade de tiles a partir de tracado e busca de caminho (BFS)"
```

---

### Task 5: `engine/mundo/index.js` — session and single-step movement

**Files:**
- Create: `engine/mundo/index.js`
- Create: `engine/mundo/index.test.js`

**Interfaces:**
- Consumes: nothing directly (doesn't import `grade.js` — it's grid-shape-agnostic, only needs `celulaEm`-shaped access via the grid array itself).
- Produces:
  - `criarSessaoMundo(grade, posicaoInicial: {x,y}) → { grade, posicao: {x,y} }`
  - `mover(sessao, direcao: "norte"|"sul"|"leste"|"oeste") → { sessao, celula, bloqueado: boolean }` — on success, `sessao` is a NEW session object with updated `posicao` (matches the immutable-session pattern already used by `engine/masmorra/index.js`'s `mover`); on blocked (wall or out of bounds), returns the SAME `sessao` reference and `celula` is the player's current cell.
  - `celulaAtual(sessao) → cell`

- [ ] **Step 1: Write the failing tests**

Create `engine/mundo/index.test.js`:

```js
import { describe, it, expect } from "vitest";
import { criarGradeDeTracado } from "./grade.js";
import { criarSessaoMundo, mover, celulaAtual } from "./index.js";

const legenda = {
  "#": { tipo: "parede", conteudo: null },
  ".": { tipo: "chao", conteudo: null },
  H: { tipo: "hotspot", conteudo: { hotspot: "loja", rotulo: "Loja" } },
};
const grade = criarGradeDeTracado(["###", "#.H", "###"], legenda);

describe("criarSessaoMundo", () => {
  it("começa na posição inicial informada", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    expect(sessao.posicao).toEqual({ x: 1, y: 1 });
  });
});

describe("mover", () => {
  it("move para uma célula de chão livre", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    const resultado = mover(sessao, "leste");

    expect(resultado.bloqueado).toBe(false);
    expect(resultado.sessao.posicao).toEqual({ x: 2, y: 1 });
    expect(resultado.celula.tipo).toBe("hotspot");
  });

  it("bloqueia o movimento contra uma parede e mantém a posição", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    const resultado = mover(sessao, "norte");

    expect(resultado.bloqueado).toBe(true);
    expect(resultado.sessao).toBe(sessao);
    expect(resultado.celula).toEqual(celulaAtual(sessao));
  });

  it("bloqueia o movimento para fora dos limites da grade", () => {
    const gradeParcial = criarGradeDeTracado(["..."], { ".": { tipo: "chao", conteudo: null } });
    const sessao = criarSessaoMundo(gradeParcial, { x: 0, y: 0 });
    const resultado = mover(sessao, "oeste");

    expect(resultado.bloqueado).toBe(true);
  });

  it("lança erro para direção desconhecida", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    expect(() => mover(sessao, "cima")).toThrow("Direção desconhecida");
  });
});

describe("celulaAtual", () => {
  it("retorna a célula na posição atual da sessão", () => {
    const sessao = criarSessaoMundo(grade, { x: 1, y: 1 });
    expect(celulaAtual(sessao)).toEqual({ x: 1, y: 1, tipo: "chao", conteudo: null });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- engine/mundo/index`
Expected: FAIL — `Failed to resolve import "./index.js"`.

- [ ] **Step 3: Write the implementation**

Create `engine/mundo/index.js`:

```js
const DELTAS = {
  norte: { dx: 0, dy: -1 },
  sul: { dx: 0, dy: 1 },
  leste: { dx: 1, dy: 0 },
  oeste: { dx: -1, dy: 0 },
};

function celulaEmGrade(grade, x, y) {
  const linha = grade[y];
  if (!linha) return null;
  return linha[x] ?? null;
}

export function criarSessaoMundo(grade, posicaoInicial) {
  return { grade, posicao: { ...posicaoInicial } };
}

export function celulaAtual(sessao) {
  return celulaEmGrade(sessao.grade, sessao.posicao.x, sessao.posicao.y);
}

export function mover(sessao, direcao) {
  const delta = DELTAS[direcao];
  if (!delta) {
    throw new Error(`Direção desconhecida: ${direcao}`);
  }

  const novoX = sessao.posicao.x + delta.dx;
  const novoY = sessao.posicao.y + delta.dy;
  const celula = celulaEmGrade(sessao.grade, novoX, novoY);

  if (!celula || celula.tipo === "parede") {
    return { sessao, celula: celulaAtual(sessao), bloqueado: true };
  }

  const novaSessao = { ...sessao, posicao: { x: novoX, y: novoY } };
  return { sessao: novaSessao, celula, bloqueado: false };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- engine/mundo/index`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add engine/mundo/index.js engine/mundo/index.test.js
git commit -m "feat: engine/mundo/index - sessao e movimento de um passo com colisao de parede"
```

---

### Task 6: `engine/mundo/mapas/cidade.js` — the city map data

**Files:**
- Create: `engine/mundo/mapas/cidade.js`
- Create: `engine/mundo/mapas/cidade.test.js`

**Interfaces:**
- Consumes: `criarGradeDeTracado`, `alcancavel` from `../grade.js` (Task 4).
- Produces:
  - `criarMapaCidade() → grade` (same shape as `criarGradeDeTracado`'s return)
  - `POSICAO_INICIAL_CIDADE: {x: 5, y: 3}`
  - Every hotspot cell's `conteudo.hotspot` is one of: `"explorar"`, `"guilda"`, `"loja"`, `"personagem"`, `"torre"`, `"masmorra"`, `"arena"`, `"configuracao"` — these strings are consumed by Task 8's `telaCidade.js`.

- [ ] **Step 1: Write the failing tests**

Create `engine/mundo/mapas/cidade.test.js`:

```js
import { describe, it, expect } from "vitest";
import { criarMapaCidade, POSICAO_INICIAL_CIDADE } from "./cidade.js";
import { alcancavel } from "../grade.js";

const HOTSPOTS_ESPERADOS = [
  "explorar", "guilda", "loja", "personagem", "torre", "masmorra", "arena", "configuracao",
];

describe("criarMapaCidade", () => {
  it("tem exatamente um hotspot para cada destino esperado", () => {
    const grade = criarMapaCidade();
    const hotspots = grade.flat().filter((celula) => celula.tipo === "hotspot");

    expect(hotspots.map((c) => c.conteudo.hotspot).sort()).toEqual([...HOTSPOTS_ESPERADOS].sort());
  });

  it("a posição inicial é uma célula de chão", () => {
    const grade = criarMapaCidade();
    const inicial = grade[POSICAO_INICIAL_CIDADE.y][POSICAO_INICIAL_CIDADE.x];
    expect(inicial.tipo).toBe("chao");
  });

  it.each(HOTSPOTS_ESPERADOS)('o hotspot "%s" é alcançável a partir da posição inicial', (nomeHotspot) => {
    const grade = criarMapaCidade();
    const destino = grade.flat().find((c) => c.conteudo?.hotspot === nomeHotspot);
    expect(alcancavel(grade, POSICAO_INICIAL_CIDADE, destino)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- engine/mundo/mapas/cidade`
Expected: FAIL — `Failed to resolve import "./cidade.js"`.

- [ ] **Step 3: Write the implementation**

Create `engine/mundo/mapas/cidade.js`:

```js
import { criarGradeDeTracado } from "../grade.js";

const LEGENDA_CIDADE = {
  "#": { tipo: "parede", conteudo: null },
  ".": { tipo: "chao", conteudo: null },
  "@": { tipo: "chao", conteudo: null },
  G: { tipo: "hotspot", conteudo: { hotspot: "guilda", rotulo: "Guilda" } },
  L: { tipo: "hotspot", conteudo: { hotspot: "loja", rotulo: "Loja" } },
  P: { tipo: "hotspot", conteudo: { hotspot: "personagem", rotulo: "Personagem" } },
  T: { tipo: "hotspot", conteudo: { hotspot: "torre", rotulo: "Torre" } },
  C: { tipo: "hotspot", conteudo: { hotspot: "configuracao", rotulo: "Configurações" } },
  M: { tipo: "hotspot", conteudo: { hotspot: "masmorra", rotulo: "Masmorra" } },
  A: { tipo: "hotspot", conteudo: { hotspot: "arena", rotulo: "Arena" } },
  E: { tipo: "hotspot", conteudo: { hotspot: "explorar", rotulo: "Explorar" } },
};

// "@" marca a posição inicial só como referência visual do traçado —
// a posição real é POSICAO_INICIAL_CIDADE abaixo, mantidas em sincronia manualmente.
const TRACADO_CIDADE = [
  "###########",
  "#G.L.P.T.C#",
  "#.........#",
  "#M...@...A#",
  "#.........#",
  "#....E....#",
  "###########",
];

export const POSICAO_INICIAL_CIDADE = { x: 5, y: 3 };

export function criarMapaCidade() {
  return criarGradeDeTracado(TRACADO_CIDADE, LEGENDA_CIDADE);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- engine/mundo/mapas/cidade`
Expected: PASS (10 tests — 1 + 1 + 8 from `it.each`).

- [ ] **Step 5: Commit**

```bash
git add engine/mundo/mapas
git commit -m "feat: mapa de tiles da cidade com os 8 hotspots (guilda, loja, torre, masmorra, arena, personagem, configuracao, explorar)"
```

---

### Task 7: `WebRPG/src/mundo/rendererTiles.js` — shared tile renderer + movement controller

**Files:**
- Create: `WebRPG/src/mundo/rendererTiles.js`
- Create: `WebRPG/src/mundo/rendererTiles.test.js`
- Create: `WebRPG/src/estilos/mundo.css`

**Interfaces:**
- Consumes: `criarSessaoMundo`, `mover`, `celulaAtual` from `@engine/mundo/index.js` (Task 5); `caminhoAte` from `@engine/mundo/grade.js` (Task 4).
- Produces: `montarMundoTiles(container, { grade, posicaoInicial, aoMover }) → { mover(direcao), celulaAtual(), destruir() }`. `aoMover(celula)` fires once per step actually taken (both from keyboard single-steps and from each intermediate step of a click-to-walk path), always with the cell the player just entered.

This is the piece Task 8 (city) and Fase 7's masmorra/torre migration both mount.

- [ ] **Step 1: Write the failing tests**

Create `WebRPG/src/mundo/rendererTiles.test.js`:

```js
import { describe, it, expect, vi } from "vitest";
import { montarMundoTiles } from "./rendererTiles.js";

function gradeSimples() {
  return [
    [
      { x: 0, y: 0, tipo: "chao", conteudo: null },
      { x: 1, y: 0, tipo: "hotspot", conteudo: { hotspot: "loja", rotulo: "Loja" } },
    ],
    [
      { x: 0, y: 1, tipo: "parede", conteudo: null },
      { x: 1, y: 1, tipo: "chao", conteudo: null },
    ],
  ];
}

describe("montarMundoTiles", () => {
  it("renderiza uma célula por posição da grade, com o marcador do jogador na posição inicial", () => {
    const container = document.createElement("div");
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 0, y: 0 }, aoMover: () => {} });

    expect(container.querySelectorAll(".celula-mundo")).toHaveLength(4);
    const celulaInicial = container.querySelector('[data-x="0"][data-y="0"]');
    expect(celulaInicial.querySelector(".jogador-mundo")).not.toBeNull();
  });

  it("move o jogador ao clicar numa célula adjacente e chama aoMover com a célula de destino", () => {
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 0, y: 0 }, aoMover });

    container.querySelector('[data-x="1"][data-y="0"]').click();

    expect(aoMover).toHaveBeenCalledWith(expect.objectContaining({ x: 1, y: 0, tipo: "hotspot" }));
    expect(container.querySelector('[data-x="1"][data-y="0"] .jogador-mundo')).not.toBeNull();
  });

  it("ignora clique numa célula de parede", () => {
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 1, y: 1 }, aoMover });

    container.querySelector('[data-x="0"][data-y="1"]').click();

    expect(aoMover).not.toHaveBeenCalled();
    expect(container.querySelector('[data-x="1"][data-y="1"] .jogador-mundo')).not.toBeNull();
  });

  it("move com as setas do teclado", () => {
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeSimples(), posicaoInicial: { x: 0, y: 0 }, aoMover });

    container.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(aoMover).toHaveBeenCalledWith(expect.objectContaining({ x: 1, y: 0 }));
  });

  it("caminha em vários passos até uma célula distante (pathfinding) e chama aoMover a cada passo", () => {
    const gradeLinha = [[
      { x: 0, y: 0, tipo: "chao", conteudo: null },
      { x: 1, y: 0, tipo: "chao", conteudo: null },
      { x: 2, y: 0, tipo: "hotspot", conteudo: { hotspot: "loja", rotulo: "Loja" } },
    ]];
    const container = document.createElement("div");
    const aoMover = vi.fn();
    montarMundoTiles(container, { grade: gradeLinha, posicaoInicial: { x: 0, y: 0 }, aoMover });

    container.querySelector('[data-x="2"][data-y="0"]').click();

    expect(aoMover).toHaveBeenCalledTimes(2);
    expect(aoMover).toHaveBeenLastCalledWith(expect.objectContaining({ x: 2, y: 0, tipo: "hotspot" }));
    expect(container.querySelector('[data-x="2"][data-y="0"] .jogador-mundo')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- rendererTiles`
Expected: FAIL — `Failed to resolve import "./rendererTiles.js"`.

- [ ] **Step 3: Write the implementation**

Create `WebRPG/src/mundo/rendererTiles.js`:

```js
import { criarSessaoMundo, mover as moverSessao, celulaAtual as celulaAtualSessao } from "@engine/mundo/index.js";
import { caminhoAte } from "@engine/mundo/grade.js";

const TECLA_PARA_DIRECAO = {
  ArrowUp: "norte", w: "norte", W: "norte",
  ArrowDown: "sul", s: "sul", S: "sul",
  ArrowRight: "leste", d: "leste", D: "leste",
  ArrowLeft: "oeste", a: "oeste", A: "oeste",
};

function direcaoEntre(origem, destino) {
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  if (dx === 1 && dy === 0) return "leste";
  if (dx === -1 && dy === 0) return "oeste";
  if (dx === 0 && dy === 1) return "sul";
  if (dx === 0 && dy === -1) return "norte";
  throw new Error("Passo do caminho não é adjacente à posição atual.");
}

export function montarMundoTiles(container, { grade, posicaoInicial, aoMover }) {
  let sessao = criarSessaoMundo(grade, posicaoInicial);

  container.classList.add("mundo-grade");
  container.style.gridTemplateColumns = `repeat(${grade[0].length}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${grade.length}, 1fr)`;
  container.setAttribute("tabindex", "0");

  function renderizar() {
    container.innerHTML = "";
    for (const linha of sessao.grade) {
      for (const celula of linha) {
        const div = document.createElement("div");
        div.className = `celula-mundo celula-mundo--${celula.tipo}`;
        div.dataset.x = celula.x;
        div.dataset.y = celula.y;

        if (celula.tipo === "hotspot") {
          div.dataset.hotspot = celula.conteudo.hotspot;
          div.title = celula.conteudo.rotulo;
          div.textContent = celula.conteudo.rotulo[0];
        }

        if (celula.x === sessao.posicao.x && celula.y === sessao.posicao.y) {
          const jogador = document.createElement("div");
          jogador.className = "jogador-mundo";
          div.appendChild(jogador);
        }

        div.addEventListener("click", () => moverPorClique(celula));
        container.appendChild(div);
      }
    }
  }

  function aplicarMovimento(direcao) {
    const resultado = moverSessao(sessao, direcao);
    if (resultado.bloqueado) return;
    sessao = resultado.sessao;
    renderizar();
    aoMover(resultado.celula);
  }

  function moverPorClique(celulaAlvo) {
    const caminho = caminhoAte(sessao.grade, sessao.posicao, celulaAlvo);
    if (!caminho || caminho.length === 0) return;
    for (const passo of caminho) {
      const direcao = direcaoEntre(sessao.posicao, passo);
      aplicarMovimento(direcao);
    }
  }

  // O listener de teclado fica no próprio container (não em window/document):
  // o roteador (WebRPG/src/rotas/roteador.js) não tem um contrato de "desmontar",
  // ele só troca telas com elementoContainer.innerHTML = "". Um listener preso ao
  // container é removido do DOM junto com ele e não vaza entre navegações.
  function aoTeclaPressionada(evento) {
    const direcao = TECLA_PARA_DIRECAO[evento.key];
    if (direcao) {
      evento.preventDefault();
      aplicarMovimento(direcao);
    }
  }
  container.addEventListener("keydown", aoTeclaPressionada);

  renderizar();
  container.focus();

  return {
    mover: aplicarMovimento,
    celulaAtual: () => celulaAtualSessao(sessao),
    destruir: () => container.removeEventListener("keydown", aoTeclaPressionada),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- rendererTiles`
Expected: PASS (5 tests).

- [ ] **Step 5: Add the shared stylesheet**

Create `WebRPG/src/estilos/mundo.css`:

```css
.mundo-grade {
  display: grid;
  gap: 1px;
  background: var(--cor-fundo);
  outline: none;
}

.celula-mundo {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-barra-vazia);
  font-family: var(--fonte-pixel);
  font-size: 9px;
  cursor: pointer;
}

.celula-mundo--parede {
  background: var(--cor-borda);
  cursor: default;
}

.celula-mundo--hotspot {
  background: var(--cor-fundo-painel);
  border: 1px solid var(--cor-destaque);
  color: var(--cor-destaque);
}

.jogador-mundo {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: var(--cor-destaque);
}

@media (max-width: 480px) {
  .celula-mundo {
    font-size: 7px;
  }
}
```

Register it in `WebRPG/src/main.js` alongside the other stylesheet imports:

```js
import "./estilos/mundo.css";
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/mundo WebRPG/src/estilos/mundo.css WebRPG/src/main.js
git commit -m "feat: renderer de tiles compartilhado (clique com pathfinding + WASD/setas)"
```

---

### Task 8: Rebuild `telaCidade.js` on top of the tile world

**Files:**
- Modify: `WebRPG/src/telas/cidade/telaCidade.js` (full rewrite)
- Modify: `WebRPG/src/telas/cidade/telaCidade.test.js` (full rewrite — the old button-based assertions no longer apply)
- Modify: `WebRPG/src/estilos/cidade.css`

**Interfaces:**
- Consumes: `criarMapaCidade`, `POSICAO_INICIAL_CIDADE` from `@engine/mundo/mapas/cidade.js` (Task 6); `montarMundoTiles` from `../../mundo/rendererTiles.js` (Task 7).
- Produces: `montarTelaCidade(container, { jogador, aoExplorar, aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem, aoAbrirTorre, aoAbrirMasmorra, aoAbrirArena, aoAbrirConfiguracao }) → { cabecalho }` — same prop names as before (so `WebRPG/src/main.js`'s call site needs zero changes), different DOM/interaction.

This replaces finding #7 (spec section 10.1): the city stops being a button list and becomes the walkable map from Task 6/7.

- [ ] **Step 1: Write the failing tests (replace the whole file)**

Replace `WebRPG/src/telas/cidade/telaCidade.test.js` entirely with:

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { montarTelaCidade } from "./telaCidade.js";

function jogadorDeTeste() {
  return { nome: "Thorin", nivel: 3, hp: 80, hpMax: 100, ouro: 120 };
}

function callbacksDeTeste(overrides = {}) {
  return {
    aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(), aoAbrirPersonagem: vi.fn(),
    aoAbrirTorre: vi.fn(), aoAbrirMasmorra: vi.fn(), aoAbrirArena: vi.fn(), aoAbrirConfiguracao: vi.fn(),
    ...overrides,
  };
}

describe("montarTelaCidade", () => {
  it("exibe nome, nível, HP e ouro do jogador no cabeçalho", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    const texto = container.querySelector(".cabecalho-cidade").textContent;
    expect(texto).toContain("Thorin");
    expect(texto).toContain("Nível 3");
    expect(texto).toContain("80/100");
    expect(texto).toContain("120");
  });

  it("renderiza um hotspot para cada destino da cidade", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    for (const local of ["explorar", "guilda", "loja", "personagem", "torre", "masmorra", "arena", "configuracao"]) {
      expect(container.querySelector(`[data-hotspot="${local}"]`)).not.toBeNull();
    }
  });

  it.each([
    ["explorar", "aoExplorar"],
    ["guilda", "aoAbrirGuilda"],
    ["loja", "aoAbrirLoja"],
    ["personagem", "aoAbrirPersonagem"],
    ["torre", "aoAbrirTorre"],
    ["masmorra", "aoAbrirMasmorra"],
    ["arena", "aoAbrirArena"],
    ["configuracao", "aoAbrirConfiguracao"],
  ])('clicar no hotspot "%s" chama %s', (hotspot, nomeCallback) => {
    const container = document.createElement("div");
    const callbacks = callbacksDeTeste();
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacks });

    container.querySelector(`[data-hotspot="${hotspot}"]`).click();

    expect(callbacks[nomeCallback]).toHaveBeenCalledOnce();
  });
});

describe("onboarding", () => {
  beforeEach(() => localStorage.clear());

  it("mostra a dica de boas-vindas na primeira visita", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    expect(container.querySelector(".dica-onboarding")).not.toBeNull();
  });

  it("não mostra a dica depois de confirmada", () => {
    localStorage.setItem("webrpg_onboarding_visto", "1");
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    expect(container.querySelector(".dica-onboarding")).toBeNull();
  });

  it("clicar em Entendi remove a dica e grava a flag", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), ...callbacksDeTeste() });
    container.querySelector("#botao-onboarding-ok").click();
    expect(container.querySelector(".dica-onboarding")).toBeNull();
    expect(localStorage.getItem("webrpg_onboarding_visto")).toBe("1");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- telaCidade`
Expected: FAIL (old implementation has no `[data-hotspot]` elements).

- [ ] **Step 3: Rewrite the implementation**

Replace `WebRPG/src/telas/cidade/telaCidade.js` entirely with:

```js
import { criarMapaCidade, POSICAO_INICIAL_CIDADE } from "@engine/mundo/mapas/cidade.js";
import { montarMundoTiles } from "../../mundo/rendererTiles.js";

export function montarTelaCidade(container, {
  jogador, aoExplorar, aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem,
  aoAbrirTorre, aoAbrirMasmorra, aoAbrirArena, aoAbrirConfiguracao,
}) {
  container.innerHTML = `
    <div class="tela-cidade">
      <div class="painel cabecalho-cidade">
        <strong>${jogador.nome}</strong>
        <span>Nível ${jogador.nivel}</span>
        <span>HP: ${jogador.hp}/${jogador.hpMax}</span>
        <span>Ouro: ${jogador.ouro}</span>
      </div>
      <div class="mundo-cidade"></div>
    </div>
  `;

  const ACOES_POR_HOTSPOT = {
    explorar: aoExplorar,
    guilda: aoAbrirGuilda,
    loja: aoAbrirLoja,
    personagem: aoAbrirPersonagem,
    torre: aoAbrirTorre,
    masmorra: aoAbrirMasmorra,
    arena: aoAbrirArena,
    configuracao: aoAbrirConfiguracao,
  };

  montarMundoTiles(container.querySelector(".mundo-cidade"), {
    grade: criarMapaCidade(),
    posicaoInicial: POSICAO_INICIAL_CIDADE,
    aoMover: (celula) => {
      if (celula.tipo === "hotspot") {
        ACOES_POR_HOTSPOT[celula.conteudo.hotspot]?.();
      }
    },
  });

  if (!localStorage.getItem("webrpg_onboarding_visto")) {
    const dica = document.createElement("div");
    dica.className = "painel dica-onboarding";
    dica.innerHTML = `
      <p>Bem-vindo a The Lost World! Ande até um dos locais no mapa (ou clique nele) para entrar — comece pela Guilda ou saindo para Explorar.</p>
      <button class="botao botao--destaque" id="botao-onboarding-ok">Entendi</button>
    `;
    container.querySelector(".tela-cidade").prepend(dica);
    dica.querySelector("#botao-onboarding-ok").addEventListener("click", () => {
      localStorage.setItem("webrpg_onboarding_visto", "1");
      dica.remove();
    });
  }

  return { cabecalho: container.querySelector(".cabecalho-cidade") };
}
```

Note: the return value dropped `botaoExplorar` (no such element exists anymore — Task 3/main.js doesn't reference it, and the old test that used it was replaced in Step 1). Double-check `WebRPG/src/main.js`'s `irParaCidade` function doesn't destructure `botaoExplorar` from `montarTelaCidade`'s return — it doesn't (it only calls `montarTelaCidade(el, {...})` without using the return value), so no other file needs a change.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- telaCidade`
Expected: PASS (11 tests).

- [ ] **Step 5: Update the stylesheet**

Replace `WebRPG/src/estilos/cidade.css` entirely with:

```css
.tela-cidade {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
  padding: var(--espaco-lg);
  max-width: 700px;
  margin: 0 auto;
}

.cabecalho-cidade {
  display: flex;
  gap: var(--espaco-md);
  flex-wrap: wrap;
  align-items: center;
}

.mundo-cidade {
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.dica-onboarding {
  border-color: var(--cor-destaque);
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}
```

(This drops the now-unused `.grade-locais`/`.local-cidade` rules.)

- [ ] **Step 6: Verify manually**

Run: `npm run dev`, create a character, reach the city.

Expected: a small tile grid with a colored dot (the player) starting near the middle, a ring of labeled hotspot tiles (G, L, P, T, C, M, A, E) around it. Clicking any distant hotspot walks the player there step by step and opens that screen; arrow keys/WASD also move the player one tile at a time.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add WebRPG/src/telas/cidade WebRPG/src/estilos/cidade.css
git commit -m "feat: cidade agora e um mapa de tiles navegavel (era uma lista de botoes)"
```

---

### Task 9: Download and apply the Kenney scenario tilesets

**Files:**
- Create: `WebRPG/assets/cenarios/rpg-urban-pack/` (extracted zip contents)
- Create: `WebRPG/assets/cenarios/roguelike-rpg-pack/` (extracted zip contents)
- Modify: `WebRPG/assets/CREDITS.md`
- Modify: `WebRPG/src/estilos/mundo.css` (add real tile backgrounds)

Verified, direct, CC0-licensed sources (fetched and confirmed 2026-07-10):
- RPG Urban Pack (16×16 tiles, buildings/streets — used for the city): `https://kenney.nl/media/pages/assets/rpg-urban-pack/0a097d1dc7-1677578575/kenney_rpg-urban-pack.zip` — source page `https://kenney.nl/assets/rpg-urban-pack`
- Roguelike/RPG pack (dungeon/tower-style tiles — reserved for Fase 7's masmorra/torre reskin): source page `https://kenney.nl/assets/roguelike-rpg-pack`

- [ ] **Step 1: Download and extract**

Run (from repo root):

```bash
curl -L -o /tmp/rpg-urban-pack.zip "https://kenney.nl/media/pages/assets/rpg-urban-pack/0a097d1dc7-1677578575/kenney_rpg-urban-pack.zip"
mkdir -p WebRPG/assets/cenarios/rpg-urban-pack
unzip -o /tmp/rpg-urban-pack.zip -d WebRPG/assets/cenarios/rpg-urban-pack
```

If this exact URL 404s (Kenney occasionally rotates the hash in the filename), open `https://kenney.nl/assets/rpg-urban-pack` in a browser, find the current download button, and use that URL instead — update the URL noted above in this plan file and in `CREDITS.md` to match.

- [ ] **Step 2: Inspect what was actually downloaded**

Run: `ls WebRPG/assets/cenarios/rpg-urban-pack` and `find WebRPG/assets/cenarios/rpg-urban-pack -iname "*.png" | head -30`

Kenney packs typically include a `Spritesheet/` (one big PNG + an XML/JSON atlas) and a `Tiles/` folder (individual PNGs already cut to size) — note which layout this pack actually uses; the next step's exact class names depend on the real file(s) found here.

- [ ] **Step 3: Pick 3 tiles and wire them into the CSS**

Using the individual-tile PNGs found in Step 2 (prefer `Tiles/` individual files over cutting a spritesheet by hand — much less error-prone), copy exactly three into a flat, easy-to-reference location and reference them from `mundo.css`:

```bash
mkdir -p WebRPG/assets/cenarios/cidade
cp "WebRPG/assets/cenarios/rpg-urban-pack/<caminho-real-do-tile-de-grama-ou-chao>.png" WebRPG/assets/cenarios/cidade/chao.png
cp "WebRPG/assets/cenarios/rpg-urban-pack/<caminho-real-de-um-tile-de-parede-ou-predio>.png" WebRPG/assets/cenarios/cidade/parede.png
```

(Replace `<caminho-real-...>` with the actual paths found in Step 2 — pick whatever reads clearly as "walkable ground" and "building/wall" at a glance in a file browser or the pack's preview image on the Kenney page.)

Append to `WebRPG/src/estilos/mundo.css`:

```css
.celula-mundo--chao {
  background-image: url("/assets/cenarios/cidade/chao.png");
  background-size: cover;
  image-rendering: pixelated;
}

.celula-mundo--parede {
  background-image: url("/assets/cenarios/cidade/parede.png");
  background-size: cover;
  image-rendering: pixelated;
}
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`, reach the city.

Expected: the tile grid now shows real pixel-art ground/wall tiles instead of flat colored divs (hotspot tiles keep their `--cor-destaque` border/label styling from Task 7 — don't remove that rule, it's what makes destinations stand out from plain floor).

- [ ] **Step 5: Register the license**

In `WebRPG/assets/CREDITS.md`, move the "Cenários de fundo (parallax)" checklist item from "A baixar manualmente" to a new entry under "Já no repositório", following the existing format:

```markdown
- **RPG Urban Pack** (Kenney)
  Local original: `WebRPG/assets/cenarios/rpg-urban-pack/`
  Organizado em: `WebRPG/assets/cenarios/cidade/` (chao.png, parede.png) — usado pelo mapa de tiles da cidade.
  Fonte: https://kenney.nl/assets/rpg-urban-pack
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório mas incentivado).
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test` (expected: all pass — this task touches only images and CSS, no test files).

```bash
git add WebRPG/assets/cenarios WebRPG/src/estilos/mundo.css WebRPG/assets/CREDITS.md
git commit -m "feat: aplica tileset real (Kenney RPG Urban Pack, CC0) ao mapa da cidade"
```

---

### Task 10: Download and apply the Kenney pixel UI kit

**Files:**
- Create: `WebRPG/assets/ui/pixel-ui-pack/` (extracted zip contents)
- Modify: `WebRPG/assets/CREDITS.md`
- Modify: `WebRPG/src/estilos/paineis.css` (`.painel`, `.botao` get real pixel-art backgrounds instead of flat CSS boxes)

Verified, direct, CC0-licensed source (fetched and confirmed 2026-07-10):
`https://kenney.nl/media/pages/assets/pixel-ui-pack/821e760f21-1677661508/kenney_pixel-ui-pack.zip` — source page `https://kenney.nl/assets/pixel-ui-pack` (750 pixel-art UI tiles, panels/buttons with 9-slice-ready borders).

- [ ] **Step 1: Download and extract**

```bash
curl -L -o /tmp/pixel-ui-pack.zip "https://kenney.nl/media/pages/assets/pixel-ui-pack/821e760f21-1677661508/kenney_pixel-ui-pack.zip"
mkdir -p WebRPG/assets/ui/pixel-ui-pack
unzip -o /tmp/pixel-ui-pack.zip -d WebRPG/assets/ui/pixel-ui-pack
```

Same caveat as Task 9 Step 1: if the URL has rotated, get the current one from `https://kenney.nl/assets/pixel-ui-pack` and update it here and in `CREDITS.md`.

- [ ] **Step 2: Inspect and pick one panel + one button**

Run: `find WebRPG/assets/ui/pixel-ui-pack -iname "*panel*" -o -iname "*button*" | head -40`

Pick one panel-frame PNG (for `.painel`) and one button PNG with a visible pressed/normal state pair if available (for `.botao`). Copy them flat:

```bash
mkdir -p WebRPG/assets/ui/base
cp "WebRPG/assets/ui/pixel-ui-pack/<caminho-real-do-painel>.png" WebRPG/assets/ui/base/painel.png
cp "WebRPG/assets/ui/pixel-ui-pack/<caminho-real-do-botao>.png" WebRPG/assets/ui/base/botao.png
```

- [ ] **Step 3: Apply as 9-slice borders**

Modify `WebRPG/src/estilos/paineis.css` — change the `.painel` rule from a flat CSS box to a 9-sliced pixel panel image (using `border-image`, which lets the same PNG stretch to any panel size without distortion at the corners):

```css
.painel {
  border-image: url("/assets/ui/base/painel.png") 12 fill;
  border-width: 12px;
  border-style: solid;
  image-rendering: pixelated;
  padding: var(--espaco-md);
  background: var(--cor-fundo-painel);
}
```

The `12` slice value is a starting guess (typical Kenney UI tile border is 8-16px) — after Step 4's visual check, adjust it up/down until the corners of the panel look crisp and un-stretched at the panel's actual rendered size.

Do the same for `.botao`:

```css
.botao {
  font-family: var(--fonte-corpo);
  font-weight: 700;
  color: var(--cor-texto);
  border-image: url("/assets/ui/base/botao.png") 8 fill;
  border-width: 8px;
  border-style: solid;
  image-rendering: pixelated;
  padding: var(--espaco-sm) var(--espaco-md);
  cursor: pointer;
  transition: transform 0.1s ease;
}
```

Keep the existing `.botao:hover`, `.botao:active`, `.botao:disabled`, `.botao--destaque` rules as-is below this (they layer `background`/`transform`/`opacity` on top and still work with a `border-image` base — only remove any `background:`/`border: 2px solid var(--cor-borda)` lines from the base `.botao`/`.painel` rules themselves, since the image replaces them).

- [ ] **Step 4: Verify visually across screens**

Run: `npm run dev`, click through Título → criação → cidade → guilda → loja → personagem → configurações.

Expected: every panel and button across every screen (they all reuse `.painel`/`.botao`) now shows the pixel-art frame instead of a flat CSS box with a thin border. Check the 9-slice number from Step 3 didn't blur or squash the corners — adjust and re-check if it did.

- [ ] **Step 5: Register the license**

In `WebRPG/assets/CREDITS.md`, move the "UI em pixel art" checklist item to "Já no repositório":

```markdown
- **Pixel UI Pack** (Kenney)
  Local original: `WebRPG/assets/ui/pixel-ui-pack/`
  Organizado em: `WebRPG/assets/ui/base/` (painel.png, botao.png) — usado como `border-image` em `.painel` e `.botao` (paineis.css).
  Fonte: https://kenney.nl/assets/pixel-ui-pack
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório mas incentivado).
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test` (expected: all pass — CSS/image-only change; no test asserts on background-image or border-image).

```bash
git add WebRPG/assets/ui WebRPG/src/estilos/paineis.css WebRPG/assets/CREDITS.md
git commit -m "feat: aplica kit de UI pixel real (Kenney Pixel UI Pack, CC0) aos paineis e botoes"
```

---

## Self-Review

**Spec coverage** (against `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` section 10.4, row 6a/6b):
- Achado #1 (barra invisível) → Task 1. ✅
- Achado #2 (fonte pixel nunca baixada) → Task 2. ✅
- Achado #6 (sem tela de Título) → Task 3. ✅
- `engine/mundo/` (seção 3.1/10.3) → Tasks 4-6. ✅
- Renderer de tiles + cidade navegável (seção 10.3) → Tasks 7-8. ✅
- Cenários via Tiled/Kenney (seção 10.2) → Task 9 uses Kenney tiles directly (no `.tmx`/Tiled export round-trip — the city map is small and hand-authored as an ASCII `TRACADO_CIDADE` in Task 6, which is simpler and equally testable than authoring in the Tiled GUI and parsing its JSON export for a map this size; Tiled remains the recommended tool if/when a much larger or artist-authored map is needed later, per spec section 10.2's tooling table).
- UI kit (seção 10.2) → Task 10. ✅
- ~10 monster sprites, áudio real (seção 10.4 row 6c/6d) → **out of scope for this plan, covered by the Fase 7 plan** (`docs/superpowers/plans/2026-07-10-webrpg-fase7-bestiario-audio.md`).

**Placeholder scan:** no TBD/"add validation"/"similar to Task N" patterns; the two `<caminho-real-...>` placeholders in Tasks 9-10 are intentional — they depend on the actual contents of a zip that doesn't exist in the repo until Step 1 of each task runs, and Step 2 of each task is the concrete instruction for resolving them (inspect, then pick).

**Type/signature consistency:** `mover(sessao, direcao) → {sessao, celula, bloqueado}` (Task 5) is used identically by `rendererTiles.js` (Task 7). `criarMapaCidade()`'s hotspot `conteudo.hotspot` strings (Task 6) match `ACOES_POR_HOTSPOT`'s keys in `telaCidade.js` (Task 8) exactly: `explorar, guilda, loja, personagem, torre, masmorra, arena, configuracao`.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-10-webrpg-fase6-fundacao-visual.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
