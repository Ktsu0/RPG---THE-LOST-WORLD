# WebRPG Fase 7 — Bestiário, Masmorra Viva, Torre com Sprite e Áudio de Verdade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish closing the gap from spec section 10 (`docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`): give enemies real, varied sprites instead of everyone-is-the-Orc, fix the dungeon's actual missing gameplay (walking into a monster room currently does nothing), give the Torre boss fight a face, reskin the dungeon with real tiles, and wire real sound/music files into the audio systems that already exist but play nothing. Assumes Fase 6 (`docs/superpowers/plans/2026-07-10-webrpg-fase6-fundacao-visual.md`) is already merged — this plan reuses its Kenney asset pipeline pattern and CSS tokens.

**Architecture:** No new architectural layer this time — this plan is almost entirely wiring existing systems together correctly and feeding them real content. One real finding changes scope: research done while writing this plan found the dungeon (`WebRPG/src/telas/masmorra/telaMasmorra.js`) never actually triggers combat when the player enters a monster/miniboss/boss room — movement only reveals fog of war. That's not a visual gap, it's a functional one (Fase 4's "masmorra jogável do início ao fim" wasn't fully true), so Task 3 fixes it directly by embedding the existing `iniciarBatalha` sprite-battle screen into the dungeon screen on room entry — no navigation/router involvement, so the dungeon session state never has to survive a screen swap.

**Tech Stack:** Same as Fase 6 — Vite/vanilla JS, Vitest + jsdom, Kenney.nl CC0 packs. Adds Zerie's itch.io character pack (same author/art style as the already-integrated Soldier/Orc pack) for monster sprites.

## Global Constraints

- No hotlinking — every asset copied into `WebRPG/assets/` and registered in `WebRPG/assets/CREDITS.md` (spec section 5/10.2).
- `engine/masmorra/`'s existing exported functions (`criarSessaoMasmorra`, `mover`, `tentarSairMasmorra`, `gerarMasmorra`, `templatesMasmorra`, `determinarDificuldade`) and their cell shape (`{x, y, visited, roomType, content}`) are **not modified** — Task 3 only adds a new file alongside them. This dungeon system is already fully tested and working; the risk/reward of refactoring its shape to match Fase 6's `engine/mundo/` shape isn't worth it for this plan (see Task 5's architecture note for the full reasoning).
- Torre's combat state machine (`engine/torre/index.js`, `engine/torre/bosses.js`) is **not modified** — Task 4 only adds a sprite element around it, reusing `WebRPG/src/telas/batalha/sprites.js`'s existing `tocarAnimacao`.
- Run `npm test` (repo root) after every task.

---

### Task 1: Enemy → sprite mapping (stop every enemy from rendering as Orc)

**Files:**
- Create: `WebRPG/src/telas/batalha/mapaSprites.js`
- Create: `WebRPG/src/telas/batalha/mapaSprites.test.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/animacoes.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`

**Interfaces:**
- Produces: `spriteParaInimigo(nomeInimigo: string) → string` (a sprite folder name under `WebRPG/assets/personagens/`, e.g. `"orc"`), defaulting to `"orc"` for unmapped names.
- Consumes: nothing new. `montarTelaBatalha`'s returned `elementos` gains two new fields — `personagemJogador: "soldado"`, `personagemInimigo: <result of spriteParaInimigo>` — which Task 2 doesn't need to know about, but `animacoes.js` reads instead of its old hardcoded ternaries.

Finding from research: `WebRPG/src/telas/batalha/animacoes.js` currently hardcodes `evento.autor === "jogador" ? "soldado" : "orc"` in three places — the actual enemy's name (`inimigo.nome`, e.g. "Guardião de Pedra", "Lich Menor") is never consulted. Every enemy in the game today visually renders as the Orc sprite. This task makes the sprite selection data-driven so Task 2's downloaded monster sprites can actually be used.

- [ ] **Step 1: Write the failing test**

Create `WebRPG/src/telas/batalha/mapaSprites.test.js`:

```js
import { describe, it, expect } from "vitest";
import { spriteParaInimigo } from "./mapaSprites.js";

describe("spriteParaInimigo", () => {
  it('mapeia "Orc" para o sprite "orc"', () => {
    expect(spriteParaInimigo("Orc")).toBe("orc");
  });

  it("retorna o sprite padrão (orc) para um nome sem mapeamento conhecido", () => {
    expect(spriteParaInimigo("Monstro Nunca Visto")).toBe("orc");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- mapaSprites`
Expected: FAIL — `Failed to resolve import "./mapaSprites.js"`.

- [ ] **Step 3: Write the implementation**

Create `WebRPG/src/telas/batalha/mapaSprites.js`:

```js
// Preenchido conforme o bestiário for baixado (ver Task 2 do plano da Fase 7) —
// cada entrada mapeia o nome exato de um inimigo (engine/torre/bosses.js,
// engine/masmorra/gerador.js, engine/geradores/inimigoTreino.js) para uma pasta
// existente em WebRPG/assets/personagens/.
const MAPA_SPRITE_POR_NOME = {
  Orc: "orc",
};

const SPRITE_PADRAO = "orc";

export function spriteParaInimigo(nomeInimigo) {
  return MAPA_SPRITE_POR_NOME[nomeInimigo] ?? SPRITE_PADRAO;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- mapaSprites`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire it into `telaBatalha.js`**

In `WebRPG/src/telas/batalha/telaBatalha.js`, add the import at the top:

```js
import { spriteParaInimigo } from "./mapaSprites.js";
```

Change `montarTelaBatalha`'s body — find:

```js
  const palco = container.querySelector(".palco-batalha");
  const combatenteJogador = criarCombatente(jogador.nome || "Você", "soldado");
  const combatenteInimigo = criarCombatente(inimigo.nome, "orc");
  palco.appendChild(combatenteJogador);
  palco.appendChild(combatenteInimigo);

  const elementos = {
    palco,
    combatenteJogador,
    combatenteInimigo,
```

Replace with:

```js
  const palco = container.querySelector(".palco-batalha");
  const personagemInimigo = spriteParaInimigo(inimigo.nome);
  const combatenteJogador = criarCombatente(jogador.nome || "Você", "soldado");
  const combatenteInimigo = criarCombatente(inimigo.nome, personagemInimigo);
  palco.appendChild(combatenteJogador);
  palco.appendChild(combatenteInimigo);

  const elementos = {
    palco,
    combatenteJogador,
    combatenteInimigo,
    personagemJogador: "soldado",
    personagemInimigo,
```

- [ ] **Step 6: Wire it into `animacoes.js`**

In `WebRPG/src/telas/batalha/animacoes.js`, change the destructuring line — find:

```js
export async function reproduzirEventos(eventos, elementos) {
  const { spriteJogador, spriteInimigo, combatenteJogador, combatenteInimigo, palco } =
    elementos;
```

Replace with:

```js
export async function reproduzirEventos(eventos, elementos) {
  const { spriteJogador, spriteInimigo, combatenteJogador, combatenteInimigo, palco } =
    elementos;
  const personagemJogadorAtual = elementos.personagemJogador ?? "soldado";
  const personagemInimigoAtual = elementos.personagemInimigo ?? "orc";
```

Then, inside the `"dano"` case, find:

```js
        const autorSprite = evento.autor === "jogador" ? spriteJogador : spriteInimigo;
        const personagemAutor = evento.autor === "jogador" ? "soldado" : "orc";
        const personagemAlvo = evento.alvo === "jogador" ? "soldado" : "orc";
```

Replace with:

```js
        const autorSprite = evento.autor === "jogador" ? spriteJogador : spriteInimigo;
        const personagemAutor = evento.autor === "jogador" ? personagemJogadorAtual : personagemInimigoAtual;
        const personagemAlvo = evento.alvo === "jogador" ? personagemJogadorAtual : personagemInimigoAtual;
```

And inside the `"morte"` case, find:

```js
      case "morte": {
        const personagem = evento.alvo === "jogador" ? "soldado" : "orc";
```

Replace with:

```js
      case "morte": {
        const personagem = evento.alvo === "jogador" ? personagemJogadorAtual : personagemInimigoAtual;
```

- [ ] **Step 7: Add regression tests to `telaBatalha.test.js`**

In `WebRPG/src/telas/batalha/telaBatalha.test.js`, add a new `describe` block at the end of the file (after the existing `describe("mostrarOverlayFim", ...)`):

```js
describe("seleção de sprite do inimigo", () => {
  it("usa o sprite mapeado para o nome do inimigo", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(elementos.personagemInimigo).toBe("orc");
    expect(elementos.combatenteInimigo.querySelector(".sprite").dataset.personagem).toBe("orc");
  });

  it("cai no sprite padrão para um inimigo sem mapeamento conhecido", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Criatura Desconhecida", hp: 15, hpMax: 30 },
    });
    expect(elementos.personagemInimigo).toBe("orc");
  });
});
```

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including `animacoes.test.js` (its `criarElementosDeTeste()` fixture doesn't set `personagemJogador`/`personagemInimigo`, which is fine — Step 6's `?? "soldado"` / `?? "orc"` fallbacks cover that).

- [ ] **Step 9: Commit**

```bash
git add WebRPG/src/telas/batalha
git commit -m "feat: sprite do inimigo em batalha agora depende do nome (era sempre orc, mesmo hardcoded)"
```

---

### Task 2: Download the monster bestiary and populate the sprite map

**Files:**
- Create: `WebRPG/assets/personagens/<varios>/` (extracted pack + reorganized per-monster folders, mirroring the existing `soldado`/`orc` layout: `idle.png`, `ataque.png`, `dano.png`, `morte.png`)
- Modify: `WebRPG/src/telas/batalha/mapaSprites.js` (fill in `MAPA_SPRITE_POR_NOME`)
- Modify: `WebRPG/assets/CREDITS.md`

**Interfaces:**
- Consumes: `MAPA_SPRITE_POR_NOME` shape from Task 1.
- Produces: nothing new for other tasks, but every enemy name currently defined anywhere in `engine/` should end up with an entry. Full list to cover (from research): training — `"Orc"` (already mapped); Torre bosses (`engine/torre/bosses.js`, all 10) — `"Guardião de Pedra"`, `"Sentinela de Ferro"`, `"Mago Sombrio"`, `"Lobo Alfa"`, `"Cavaleiro Sombrio"`, `"Hidra das Sombras"`, `"Golem Titânico"`, `"Senhor dos Mortos"`, `"Dragão Negro"`, `"Lorde do Caos"`; Masmorra (`engine/masmorra/gerador.js`, all 3 templates) mobs — `"Esqueleto Errante"`, `"Zumbi Apodrecido"`, `"Aranha da Cripta"`, `"Morcego Gigante"`, `"Golem de Cristal"`, `"Aranha Venenosa"`, `"Salamandra de Fogo"`, `"Imp Menor"`, `"Escorpião de Magma"`; minibosses — `"Cavaleiro Caído"`, `"Guardião de Cristal"`, `"Comandante Ígneo"`; bosses — `"Lich Menor"`, `"Elemental de Cristal"`, `"Senhor das Chamas"`.

That's 25 distinct enemy names (26 counting Orc) and only a handful of distinct visual archetypes are worth downloading — reuse one sprite folder for multiple thematically-similar names (e.g. every skeleton/undead name can share one "esqueleto" sprite) rather than sourcing 25 unique sprites. This mirrors the project's existing "sprite comes from class, not from every possible identity" decision (spec section 5: "Raça × classe... inviável").

- [ ] **Step 1: Download the primary pack**

Try Zerie's sibling pack first, for art-style consistency with the already-integrated Soldier/Orc pack (same author/proportions):

Visit `https://zerie.itch.io/tiny-rpg-character-asset-pack-02` in a browser (itch.io blocks automated fetches — this has to be a manual/browser step), download the free pack zip, and extract it to `WebRPG/assets/personagens/_pacote-zerie-02/`.

If that pack doesn't have enough distinct monster archetypes (check what's actually in it once extracted — Step 2), fall back to the pack already named in `WebRPG/assets/CREDITS.md`'s checklist: `https://luizmelo.itch.io/monsters-creatures-fantasy` (CC0, "Monsters Creatures Fantasy"). Both are legitimate — note in `CREDITS.md` (Step 5) which one(s) actually got used, since the art style will differ slightly from the Soldier/Orc pack if LuizMelo's pack is needed.

- [ ] **Step 2: Inventory what was downloaded**

Run: `find WebRPG/assets/personagens/_pacote-zerie-02 -iname "*.png" | sort`

List the distinct creature folders/names found. Pick enough archetypes to cover the 25 names above with thematically-sensible reuse — a reasonable minimum target set: skeleton/undead, zombie, giant spider, bat, crystal/stone golem, fire salamander/imp, dragon, knight/armored humanoid, lich/dark mage, demon lord. If the pack is missing an archetype (e.g. no dragon), that name stays on the `SPRITE_PADRAO` ("orc") fallback for now rather than blocking this task — note it in `CREDITS.md` as a known gap.

- [ ] **Step 3: Reorganize into the existing per-character folder convention**

For each archetype picked, create `WebRPG/assets/personagens/<nome-pasta>/` with `idle.png`, `ataque.png`, `dano.png`, `morte.png` — same convention as `WebRPG/assets/personagens/orc/`. Example:

```bash
mkdir -p WebRPG/assets/personagens/esqueleto
cp "WebRPG/assets/personagens/_pacote-zerie-02/<caminho-real-idle>.png" WebRPG/assets/personagens/esqueleto/idle.png
cp "WebRPG/assets/personagens/_pacote-zerie-02/<caminho-real-attack>.png" WebRPG/assets/personagens/esqueleto/ataque.png
cp "WebRPG/assets/personagens/_pacote-zerie-02/<caminho-real-hurt>.png" WebRPG/assets/personagens/esqueleto/dano.png
cp "WebRPG/assets/personagens/_pacote-zerie-02/<caminho-real-death>.png" WebRPG/assets/personagens/esqueleto/morte.png
```

`WebRPG/src/telas/batalha/sprites.js`'s `ANIMACOES` config (`{ idle: {frames:6,...}, ataque: {frames:6,...}, dano: {frames:4,...}, morte: {frames:4,...} }`) assumes fixed frame counts per animation — if a downloaded sprite sheet has a different frame count, either crop/pad the sheet to match, or (simpler, and the recommended path) copy `WebRPG/src/telas/batalha/sprites.js`'s `ANIMACOES` object and adjust per-archetype frame counts by adding a lookup keyed by folder name — but only do this if you actually hit a mismatch; don't preemptively change working code.

- [ ] **Step 4: Fill in the sprite map**

Update `WebRPG/src/telas/batalha/mapaSprites.js`'s `MAPA_SPRITE_POR_NOME`, e.g.:

```js
const MAPA_SPRITE_POR_NOME = {
  Orc: "orc",
  "Esqueleto Errante": "esqueleto",
  "Cavaleiro Caído": "esqueleto",
  "Zumbi Apodrecido": "zumbi",
  "Aranha da Cripta": "aranha",
  "Aranha Venenosa": "aranha",
  "Morcego Gigante": "morcego",
  "Golem de Cristal": "golem",
  "Guardião de Cristal": "golem",
  "Golem Titânico": "golem",
  "Salamandra de Fogo": "salamandra",
  "Imp Menor": "salamandra",
  "Comandante Ígneo": "salamandra",
  "Escorpião de Magma": "escorpiao",
  "Dragão Negro": "dragao",
  // nomes sem arquétipo baixado caem no padrão "orc" via SPRITE_PADRAO —
  // ver CREDITS.md para a lista do que ainda falta.
};
```

(Fill in real keys/values matching whatever was actually extracted in Steps 2-3 — the example above is illustrative, not prescriptive.)

- [ ] **Step 5: Update `mapaSprites.test.js` and `CREDITS.md`**

Add one `it.each` case per newly-mapped name to `WebRPG/src/telas/batalha/mapaSprites.test.js`, e.g.:

```js
it.each([
  ["Esqueleto Errante", "esqueleto"],
  ["Cavaleiro Caído", "esqueleto"],
  ["Zumbi Apodrecido", "zumbi"],
  // ...um par [nome, pasta] por entrada real adicionada no Step 4
])('mapeia "%s" para o sprite "%s"', (nome, pasta) => {
  expect(spriteParaInimigo(nome)).toBe(pasta);
});
```

In `WebRPG/assets/CREDITS.md`, move the "Monstros adicionais" checklist item to "Já no repositório" with the pack name, author, source URL, license, and the list of archetype folders created — plus an explicit note of which enemy names (if any) are still unmapped and falling back to "orc".

- [ ] **Step 6: Verify manually and run tests**

Run: `npm run dev`, start a training battle (still "Orc", unaffected). Run: `npm test`.
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add WebRPG/assets/personagens WebRPG/src/telas/batalha/mapaSprites.js WebRPG/src/telas/batalha/mapaSprites.test.js WebRPG/assets/CREDITS.md
git commit -m "feat: bestiario de sprites reais para os inimigos de torre/masmorra (era so soldado/orc)"
```

---

### Task 3: Fix the dungeon's missing encounter trigger

**Files:**
- Create: `engine/masmorra/inimigoDaSala.js`
- Create: `engine/masmorra/inimigoDaSala.test.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.test.js`

**Interfaces:**
- Consumes: `determinarDificuldade` from `./gerador.js` (existing); the dungeon cell shape `{roomType, content: {nome, poder?}}` (existing, unmodified).
- Produces: `criarInimigoDaSala(celula, jogador) → {nome, hp, hpMax, atk, defesa, xp, ouro, habilidade: null, status: []}` — a battle-ready enemy object, i.e. the same shape `criarInimigoTreino()` already produces (`engine/geradores/inimigoTreino.js`), consumable directly by `iniciarBatalha`.

Research finding: `telaMasmorra.js` reveals fog of war on movement but never inspects `celula.roomType`/`content` on arrival — walking into a monster/miniboss/boss room currently does nothing. This task fixes that by embedding the existing sprite battle screen (`iniciarBatalha`, already built in Fases 0-1) directly into the dungeon screen when the player steps onto an encounter room, and clears the room (`limparSala`, already exported by `engine/masmorra/index.js` but never called anywhere in the UI) on victory.

- [ ] **Step 1: Write the failing tests for `criarInimigoDaSala`**

Create `engine/masmorra/inimigoDaSala.test.js`:

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { criarInimigoDaSala } from "./inimigoDaSala.js";

afterEach(() => vi.restoreAllMocks());

describe("criarInimigoDaSala", () => {
  it("escala hp/atk/xp/ouro pela dificuldade do nível do jogador (sala de miniboss, sem poder extra)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const celula = { roomType: "miniboss", content: { nome: "Cavaleiro Caído" } };

    expect(criarInimigoDaSala(celula, { nivel: 3 })).toEqual({
      nome: "Cavaleiro Caído",
      hp: 135, hpMax: 135, atk: 36, defesa: 9, xp: 45, ouro: 30,
      habilidade: null, status: [],
    });
  });

  it("aplica o multiplicador de poder da sala de boss", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const celula = { roomType: "boss", content: { nome: "Lich Menor", poder: 1.4 } };

    expect(criarInimigoDaSala(celula, { nivel: 3 })).toEqual({
      nome: "Lich Menor",
      hp: 336, hpMax: 336, atk: 76, defesa: 9, xp: 63, ouro: 42,
      habilidade: null, status: [],
    });
  });

  it("lança erro para um tipo de sala sem encontro", () => {
    const celula = { roomType: "vazio", content: null };
    expect(() => criarInimigoDaSala(celula, { nivel: 3 })).toThrow('Tipo de sala "vazio"');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- inimigoDaSala`
Expected: FAIL — `Failed to resolve import "./inimigoDaSala.js"`.

- [ ] **Step 3: Write the implementation**

Create `engine/masmorra/inimigoDaSala.js`:

```js
import { determinarDificuldade } from "./gerador.js";

const STATS_BASE_POR_TIPO = {
  monstro: { hp: 22, atk: 7 },
  miniboss: { hp: 45, atk: 12 },
  boss: { hp: 80, atk: 18 },
};

export function criarInimigoDaSala(celula, jogador) {
  const base = STATS_BASE_POR_TIPO[celula.roomType];
  if (!base) {
    throw new Error(`Tipo de sala "${celula.roomType}" não tem um encontro.`);
  }

  const dificuldade = determinarDificuldade(jogador.nivel);
  const poder = celula.content.poder ?? 1;

  return {
    nome: celula.content.nome,
    hp: Math.round(base.hp * dificuldade * poder),
    hpMax: Math.round(base.hp * dificuldade * poder),
    atk: Math.round(base.atk * dificuldade * poder),
    defesa: Math.round(3 * dificuldade),
    xp: Math.round(15 * dificuldade * poder),
    ouro: Math.round(10 * dificuldade * poder),
    habilidade: null,
    status: [],
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- inimigoDaSala`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing DOM test for the encounter trigger**

In `WebRPG/src/telas/masmorra/telaMasmorra.test.js`, replace the `jogadorDeTeste` helper (it currently lacks combat stats, which the embedded battle screen needs) and add a new test. Find:

```js
function jogadorDeTeste() {
  return { nivel: 3, inventario: [], itens: [], ouro: 100 };
}
```

Replace with:

```js
function jogadorDeTeste() {
  return {
    nome: "Herói", nivel: 3, hp: 200, hpMax: 200, atk: 20, defesa: 10,
    xp: 0, ouro: 100, inventario: [], itens: [], status: [],
  };
}
```

(This is a superset of the old fixture — every existing test in this file keeps passing, they just get a fuller player object.)

Then add a new test to the `describe("montarTelaMasmorra", ...)` block:

```js
  it("entrar numa sala de encontro (monstro/miniboss/boss) embute a tela de batalha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const elementos = montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });

    // Com Math.random fixo em 0.5, a entrada fica em (2,2) e (3,2) é sempre
    // "miniboss" com content.nome "Cavaleiro Caído" — verificado rodando o
    // gerador isoladamente antes de escrever este teste.
    elementos.botaoMover("leste").click();

    expect(container.querySelector(".tela-batalha")).not.toBeNull();
    const nomes = [...container.querySelectorAll(".nome-combatente")].map((el) => el.textContent);
    expect(nomes).toContain("Cavaleiro Caído");
    expect(container.querySelector(".grade-masmorra").style.display).toBe("none");
  });
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- telaMasmorra`
Expected: FAIL — no `.tela-batalha` is ever rendered by the current `telaMasmorra.js`.

- [ ] **Step 7: Implement the encounter trigger**

Replace `WebRPG/src/telas/masmorra/telaMasmorra.js` entirely with:

```js
import { criarSessaoMasmorra, mover, tentarSairMasmorra, limparSala } from "@engine/masmorra/index.js";
import { templatesMasmorra } from "@engine/masmorra/gerador.js";
import { criarInimigoDaSala } from "@engine/masmorra/inimigoDaSala.js";
import { iniciarBatalha } from "../batalha/controladorBatalha.js";

const SIMBOLO_POR_TIPO = {
  entrada: "E", boss: "B", miniboss: "M", monstro: "!",
  trap: "trap", secret: "?", treasure: "$", vazio: ".",
};

const TIPOS_COM_ENCONTRO = new Set(["monstro", "miniboss", "boss"]);

export function montarTelaMasmorra(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-masmorra">
      <div class="painel grade-masmorra"></div>
      <div class="controles-masmorra">
        <button class="botao" data-direcao="norte">Norte</button>
        <button class="botao" data-direcao="sul">Sul</button>
        <button class="botao" data-direcao="leste">Leste</button>
        <button class="botao" data-direcao="oeste">Oeste</button>
      </div>
      <button class="botao botao--destaque" id="botao-sair-masmorra">Sair da Masmorra</button>
    </div>
  `;

  let sessao = criarSessaoMasmorra(jogador, templatesMasmorra[0].id);
  const areaGrade = container.querySelector(".grade-masmorra");
  const areaControles = container.querySelector(".controles-masmorra");

  function renderizarGrade() {
    areaGrade.innerHTML = "";
    areaGrade.style.display = "grid";
    areaGrade.style.gridTemplateColumns = `repeat(${sessao.dungeon.size}, 1fr)`;

    for (const linha of sessao.dungeon.grid) {
      for (const celula of linha) {
        const div = document.createElement("div");
        div.className = "celula-masmorra";
        div.dataset.celula = `${celula.x}-${celula.y}`;
        const naPosicaoAtual = celula.x === sessao.posicao.x && celula.y === sessao.posicao.y;

        if (celula.visited) {
          div.classList.add("celula--visitada");
        }

        if (naPosicaoAtual) {
          div.classList.add("celula--jogador");
          div.textContent = "@";
        } else if (celula.visited) {
          div.textContent = SIMBOLO_POR_TIPO[celula.roomType] || ".";
        } else {
          div.classList.add("celula--oculta");
          div.textContent = "?";
        }
        areaGrade.appendChild(div);
      }
    }
  }
  renderizarGrade();

  function celulaAtualDaSessao() {
    return sessao.dungeon.grid[sessao.posicao.y][sessao.posicao.x];
  }

  function verificarEncontro() {
    const celula = celulaAtualDaSessao();
    if (!TIPOS_COM_ENCONTRO.has(celula.roomType)) return;

    const inimigo = criarInimigoDaSala(celula, jogador);
    areaGrade.style.display = "none";
    areaControles.style.display = "none";

    const areaBatalha = document.createElement("div");
    container.querySelector(".tela-masmorra").insertBefore(areaBatalha, areaControles);

    iniciarBatalha(areaBatalha, jogador, inimigo, {
      onFim: (fim) => {
        areaBatalha.remove();
        if (fim === "vitoria") {
          limparSala(sessao);
          areaGrade.style.display = "";
          areaControles.style.display = "";
          renderizarGrade();
        } else {
          // Derrota ou fuga: sai da masmorra em vez de deixar o jogador
          // preso numa sala com um monstro que ele não pode mais enfrentar
          // (não há tela de "game over" própria da masmorra — reaproveita
          // o mesmo caminho de saída do botão "Sair da Masmorra").
          aoSair();
        }
      },
    });
  }

  function moverPara(direcao) {
    const resultado = mover(sessao, direcao);
    if (!resultado.saiuDosLimites) {
      sessao = resultado.sessao;
      renderizarGrade();
      verificarEncontro();
    }
  }

  for (const botao of container.querySelectorAll("[data-direcao]")) {
    botao.addEventListener("click", () => moverPara(botao.dataset.direcao));
  }

  const botaoSairMasmorra = container.querySelector("#botao-sair-masmorra");
  botaoSairMasmorra.addEventListener("click", () => {
    tentarSairMasmorra(sessao);
    aoSair();
  });

  function botaoMover(direcao) {
    return container.querySelector(`[data-direcao="${direcao}"]`);
  }

  return { botaoSairMasmorra, botaoMover };
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test -- telaMasmorra`
Expected: PASS (4 tests: the 3 original plus the new encounter test).

- [ ] **Step 9: Verify manually**

Run: `npm run dev`, reach the city, enter the Masmorra, move around.

Expected: stepping onto a `!`/`M`/`B` cell hides the grid and drops straight into the same sprite battle screen used by the training fight (with the new bestiary sprite from Task 2, if that name got mapped). Winning returns to the dungeon map with that room now cleared (its symbol reverts to `.`); losing exits back to the city.

- [ ] **Step 10: Run the full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 11: Commit**

```bash
git add engine/masmorra/inimigoDaSala.js engine/masmorra/inimigoDaSala.test.js WebRPG/src/telas/masmorra
git commit -m "fix: masmorra agora dispara combate de verdade ao entrar numa sala de monstro/miniboss/boss"
```

---

### Task 4: Give the Torre boss fight a sprite

**Files:**
- Modify: `WebRPG/src/telas/torre/telaTorre.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.test.js`
- Modify: `WebRPG/src/estilos/torre.css`

**Interfaces:**
- Consumes: `tocarAnimacao` from `../batalha/sprites.js` (existing), `spriteParaInimigo` from `../batalha/mapaSprites.js` (Task 1).
- Produces: nothing new for other tasks.

Torre's combat is a separate, older, text-only UI (no `iniciarBatalha` involvement, no sprite element at all today) — rewriting it onto the sprite battle screen is a much bigger, riskier change to a fully-working turn-based state machine than this plan should attempt (see the Global Constraints note). This task is the minimal, safe visual win: show the boss's sprite doing its idle animation above the log, reusing the exact same `tocarAnimacao` function the battle screen uses.

- [ ] **Step 1: Write the failing test**

In `WebRPG/src/telas/torre/telaTorre.test.js`, add to the `describe("montarTelaTorre", ...)` block:

```js
  it("mostra o sprite do boss atual", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaTorre(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const spriteBoss = container.querySelector(".sprite-boss");
    expect(spriteBoss).not.toBeNull();
    expect(spriteBoss.style.backgroundImage).toContain("/assets/personagens/");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- telaTorre`
Expected: FAIL — no `.sprite-boss` element exists.

- [ ] **Step 3: Implement**

In `WebRPG/src/telas/torre/telaTorre.js`, add imports:

```js
import { tocarAnimacao } from "../batalha/sprites.js";
import { spriteParaInimigo } from "../batalha/mapaSprites.js";
```

Find the template string:

```js
  container.innerHTML = `
    <div class="tela-torre">
      <div class="painel cabecalho-torre">
        <span class="andar-atual"></span>
        <span class="nome-boss"></span>
        <div class="barra"><div class="barra__preenchimento barra__preenchimento--hp barra-boss"></div></div>
      </div>
      <div class="painel log-torre"></div>
```

Replace with:

```js
  container.innerHTML = `
    <div class="tela-torre">
      <div class="painel cabecalho-torre">
        <span class="andar-atual"></span>
        <span class="nome-boss"></span>
        <div class="barra"><div class="barra__preenchimento barra__preenchimento--hp barra-boss"></div></div>
      </div>
      <div class="palco-torre">
        <div class="sprite sprite-boss"></div>
      </div>
      <div class="painel log-torre"></div>
```

Find:

```js
  const andarAtual = container.querySelector(".andar-atual");
  const nomeBoss = container.querySelector(".nome-boss");
  const log = container.querySelector(".log-torre");
  const barraBoss = container.querySelector(".barra-boss");

  function atualizarCabecalho() {
    andarAtual.textContent = `Andar ${estado.andar}`;
    nomeBoss.textContent = estado.bossAtual ? estado.bossAtual.nome : "";
    if (estado.bossAtual) {
      barraBoss.style.width = `${Math.max(0, (estado.bossAtual.hp / estado.bossAtual.hpMax) * 100)}%`;
    }
  }
```

Replace with:

```js
  const andarAtual = container.querySelector(".andar-atual");
  const nomeBoss = container.querySelector(".nome-boss");
  const log = container.querySelector(".log-torre");
  const barraBoss = container.querySelector(".barra-boss");
  const spriteBoss = container.querySelector(".sprite-boss");

  function atualizarCabecalho() {
    andarAtual.textContent = `Andar ${estado.andar}`;
    nomeBoss.textContent = estado.bossAtual ? estado.bossAtual.nome : "";
    if (estado.bossAtual) {
      barraBoss.style.width = `${Math.max(0, (estado.bossAtual.hp / estado.bossAtual.hpMax) * 100)}%`;
      tocarAnimacao(spriteBoss, spriteParaInimigo(estado.bossAtual.nome), "idle");
    }
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- telaTorre`
Expected: PASS.

- [ ] **Step 5: Add minimal layout CSS**

In `WebRPG/src/estilos/torre.css`, add:

```css
.palco-torre {
  min-height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
```

- [ ] **Step 6: Verify manually**

Run: `npm run dev`, reach the Torre from the city.

Expected: the boss's sprite (from Task 2's bestiary, or the Orc fallback if "Guardião de Pedra" wasn't one of the mapped archetypes) plays its idle animation above the log.

- [ ] **Step 7: Run the full test suite and commit**

Run: `npm test`

```bash
git add WebRPG/src/telas/torre WebRPG/src/estilos/torre.css
git commit -m "feat: boss da torre agora mostra um sprite animado (era so texto)"
```

---

### Task 5: Reskin the dungeon grid with real tiles

**Files:**
- Create: `WebRPG/assets/cenarios/roguelike-rpg-pack/` (extracted zip)
- Create: `WebRPG/assets/cenarios/masmorra/` (the handful of tiles actually used)
- Modify: `WebRPG/assets/CREDITS.md`
- Modify: `WebRPG/src/estilos/masmorra.css`

**Architecture note (why this doesn't reuse Fase 6's `rendererTiles.js`):** spec section 10.3 originally described the city, tower, and dungeon sharing "o mesmo renderer de tiles." Having now read the actual dungeon code closely (Task 3), the dungeon's session model has fog-of-war (`visited`) and semantically different content (`roomType`/`content` with `nome`/`poder`) baked into `engine/masmorra`'s tested, working cell shape — different enough from `engine/mundo`'s `{tipo, conteudo}` shape that forcing them into one shared renderer would mean either (a) risky changes to `engine/masmorra`'s existing shape, or (b) an over-abstracted renderer full of special-case branches for two different data models. Neither is worth it just to reskin the dungeon — the same visual goal (real pixel-art tiles instead of flat colored divs) is fully achievable by keeping `telaMasmorra.js`'s own bespoke rendering (already updated in Task 3) and just swapping its CSS backgrounds, which is what this task does. `engine/mundo`/`rendererTiles.js` stays reserved for screens with no pre-existing bespoke grid (city done in Fase 6; a future "real" walkable dungeon replacing the fog-of-war minigame entirely would be a much bigger, separate initiative, not a reskin).

Verified, direct, CC0-licensed source (fetched and confirmed 2026-07-10): `https://kenney.nl/media/pages/assets/roguelike-rpg-pack/12c03cd78b-1677697420/kenney_roguelike-rpg-pack.zip` — source page `https://kenney.nl/assets/roguelike-rpg-pack` (16×16 tiles).

- [ ] **Step 1: Download and extract**

```bash
curl -L -o /tmp/roguelike-rpg-pack.zip "https://kenney.nl/media/pages/assets/roguelike-rpg-pack/12c03cd78b-1677697420/kenney_roguelike-rpg-pack.zip"
mkdir -p WebRPG/assets/cenarios/roguelike-rpg-pack
unzip -o /tmp/roguelike-rpg-pack.zip -d WebRPG/assets/cenarios/roguelike-rpg-pack
```

If the URL 404s, get the current one from `https://kenney.nl/assets/roguelike-rpg-pack` and update it here and in `CREDITS.md`.

- [ ] **Step 2: Pick tiles for each dungeon symbol**

Run: `find WebRPG/assets/cenarios/roguelike-rpg-pack -iname "*.png" | head -60` and pick one tile each for: unexplored/fog (`celula--oculta`), explored floor (`celula--visitada`), the player marker (`celula--jogador`), and a generic "unknown content" floor tile (the base `.celula-masmorra` background, shown for unvisited-but-revealed-type cells if any). Copy them flat:

```bash
mkdir -p WebRPG/assets/cenarios/masmorra
cp "WebRPG/assets/cenarios/roguelike-rpg-pack/<caminho-chao-escuro>.png" WebRPG/assets/cenarios/masmorra/chao.png
cp "WebRPG/assets/cenarios/roguelike-rpg-pack/<caminho-parede-ou-vazio>.png" WebRPG/assets/cenarios/masmorra/oculta.png
```

- [ ] **Step 3: Apply as backgrounds**

In `WebRPG/src/estilos/masmorra.css`, change:

```css
.celula-masmorra {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-barra-vazia);
  border: 1px solid var(--cor-borda);
  font-family: var(--fonte-pixel);
  font-size: 10px;
}

.celula--oculta {
  background: var(--cor-fundo);
  color: transparent;
}
```

to:

```css
.celula-masmorra {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--cor-barra-vazia);
  background-image: url("/assets/cenarios/masmorra/chao.png");
  background-size: cover;
  image-rendering: pixelated;
  border: 1px solid var(--cor-borda);
  font-family: var(--fonte-pixel);
  font-size: 10px;
  text-shadow: 0 0 3px #000, 0 0 3px #000;
}

.celula--oculta {
  background-color: var(--cor-fundo);
  background-image: url("/assets/cenarios/masmorra/oculta.png");
  color: transparent;
}
```

(`text-shadow` keeps the room-type letter/`@` legible now that it sits on top of a busy tile image instead of a flat color.)

- [ ] **Step 4: Verify visually**

Run: `npm run dev`, enter the Masmorra.

Expected: fog-of-war cells and revealed floor cells show distinct pixel-art tiles instead of flat dark rectangles; the player marker and room-type letters stay legible.

- [ ] **Step 5: Register the license and run tests**

Add the "Roguelike/RPG pack" entry to `WebRPG/assets/CREDITS.md` under "Já no repositório" (same format as Fase 6 Task 9's entry).

Run: `npm test` (expected: all pass — CSS/image-only change).

- [ ] **Step 6: Commit**

```bash
git add WebRPG/assets/cenarios WebRPG/src/estilos/masmorra.css WebRPG/assets/CREDITS.md
git commit -m "feat: reskin da masmorra com tileset real (Kenney Roguelike/RPG Pack, CC0)"
```

---

### Task 6: Download real audio files

**Files:**
- Create: `WebRPG/assets/audio/efeitos/` (golpe, critico, moeda)
- Create: `WebRPG/assets/audio/musica/` (cidade, batalha)
- Modify: `WebRPG/assets/CREDITS.md`
- Possibly modify: `WebRPG/src/audio/tocador.js`, `WebRPG/src/audio/musica.js` (only if the downloaded files aren't `.mp3` — see Step 3)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new for other tasks — `tocarEfeito("golpe"|"critico"|"moeda")` and `tocarMusica("cidade"|"batalha")` are already called from existing code (Task 1's research); this task just makes the files they request actually exist.

Verified, direct, CC0-licensed source (fetched and confirmed 2026-07-10): `https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip` — source page `https://kenney.nl/assets/rpg-audio` (50 sound assets).

- [ ] **Step 1: Download and extract**

```bash
curl -L -o /tmp/rpg-audio.zip "https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip"
mkdir -p WebRPG/assets/cenarios/../audio/_pacote-kenney-rpg-audio
unzip -o /tmp/rpg-audio.zip -d WebRPG/assets/audio/_pacote-kenney-rpg-audio
```

If the URL 404s, get the current one from `https://kenney.nl/assets/rpg-audio` and update it here and in `CREDITS.md`.

- [ ] **Step 2: Inventory the actual files and formats**

Run: `find WebRPG/assets/audio/_pacote-kenney-rpg-audio -type f | sort`

Kenney audio packs typically ship `.ogg` (occasionally also `.wav`), **not** `.mp3`.

- [ ] **Step 3: Reconcile the file extension**

If Step 2 shows `.ogg` files (the likely case): change the two hardcoded `.mp3` extensions in the player modules to `.ogg`. In `WebRPG/src/audio/tocador.js`, change:

```js
  const audio = new Audio(`/assets/audio/efeitos/${nome}.mp3`);
```
to:
```js
  const audio = new Audio(`/assets/audio/efeitos/${nome}.ogg`);
```

In `WebRPG/src/audio/musica.js`, change:
```js
  faixaAtual = new Audio(`/assets/audio/musica/${nome}.mp3`);
```
to:
```js
  faixaAtual = new Audio(`/assets/audio/musica/${nome}.ogg`);
```

If Step 2 instead shows actual `.mp3` files already, skip this step entirely — leave the player modules untouched.

- [ ] **Step 4: Pick and copy the sound effect files**

Browse the extracted files (their names should be self-descriptive, e.g. something like `impactMetal`, `coin`, `chime` — exact names depend on what Step 2 found) and copy one file for each expected identifier, using whichever extension Step 2/3 settled on (`.mp3` or `.ogg`):

```bash
mkdir -p WebRPG/assets/audio/efeitos
cp "WebRPG/assets/audio/_pacote-kenney-rpg-audio/<arquivo-real-de-impacto>.ogg" WebRPG/assets/audio/efeitos/golpe.ogg
cp "WebRPG/assets/audio/_pacote-kenney-rpg-audio/<arquivo-real-de-impacto-mais-forte>.ogg" WebRPG/assets/audio/efeitos/critico.ogg
cp "WebRPG/assets/audio/_pacote-kenney-rpg-audio/<arquivo-real-de-moeda>.ogg" WebRPG/assets/audio/efeitos/moeda.ogg
```

- [ ] **Step 5: Pick and copy the music tracks**

The RPG Audio pack is sound-effects-focused and may not include full music loops — if it doesn't, that's fine, use two more Kenney packs instead (`https://kenney.nl/assets/digital-audio` or search `https://kenney.nl/assets/category:Music` for ambient/loopable tracks under the same CC0 license), download similarly, and pick one calm loop for `cidade` and one higher-energy loop for `batalha`:

```bash
mkdir -p WebRPG/assets/audio/musica
cp "<caminho-real-faixa-calma>.ogg" WebRPG/assets/audio/musica/cidade.ogg
cp "<caminho-real-faixa-de-tensao>.ogg" WebRPG/assets/audio/musica/batalha.ogg
```

- [ ] **Step 6: Verify manually**

Run: `npm run dev` with browser audio unmuted. Start the app (music should start on reaching the city), start a battle (music changes, hits/crits/victory play sound effects).

Expected: audible sound where before there was silence. Check the browser devtools console for any 404s on `/assets/audio/...` — if present, the filename in Step 4/5 doesn't match what `tocarEfeito`/`tocarMusica` request; fix the copied filename, not the player code (unless it's the extension mismatch already handled in Step 3).

- [ ] **Step 7: Register licenses and run tests**

Update `WebRPG/assets/CREDITS.md`'s "Sons" checklist item (and add a new one if a separate music pack was used in Step 5) with pack name(s), source URL(s), and CC0 license.

Run: `npm test`
Expected: all pass (`tocador.js`/`musica.js` have no dedicated unit tests today per the research — jsdom doesn't support real audio playback, consistent with why `.play()?.catch?.(() => {})` exists; this task is verified manually per Step 6, matching spec section 8's "UI: checklist manual").

- [ ] **Step 8: Commit**

```bash
git add WebRPG/assets/audio WebRPG/assets/CREDITS.md WebRPG/src/audio
git commit -m "feat: efeitos sonoros e musica de fundo reais (Kenney RPG Audio, CC0) - tocador ja existia, so faltava o conteudo"
```

---

### Task 7: End-to-end playtest checklist

**Files:** none (manual verification only, matching spec section 8's "UI: checklist manual por fase").

- [ ] Clear `localStorage` (devtools → Application → Local Storage → clear), run `npm run dev`.
- [ ] Título screen shows the logo in the real pixel font (Fase 6 Task 2); "Continuar" is disabled.
- [ ] "Nova Jornada" → character creation → pick a race/class, confirm.
- [ ] City shows the walkable tile map (Fase 6 Task 8) with real ground/building art (Fase 6 Task 9); walking or clicking reaches every hotspot.
- [ ] "Explorar" starts a battle: HP/MP bars are visibly full-width and drain correctly (Fase 6 Task 1); hits play a sound (Task 6); the enemy is the Orc sprite (unaffected by this plan, still the only trained enemy).
- [ ] Guilda, Loja, Personagem, Configurações all still open/close correctly (unchanged screens, sanity check nothing broke).
- [ ] Torre: boss now shows an animated sprite (Task 4) instead of just a name/log.
- [ ] Masmorra: grid shows real dungeon tiles (Task 5); walking onto a monster/miniboss/boss cell drops into a real sprite battle with that monster's own sprite (Tasks 2-3); winning clears the room and returns to the map; losing exits to the city.
- [ ] Reload the page: Título shows again, "Continuar" is now enabled, clicking it returns to the city with the same character/progress (save/load unaffected by this plan, sanity check).
- [ ] Open devtools console throughout the whole run above — zero 404s on any `/assets/...` path, zero uncaught errors.

- [ ] **Report the outcome.** If everything above checks out, this plan is done. If something doesn't — note exactly which line item failed and why; don't silently patch it outside the task that owns that area.

---

## Self-Review

**Spec coverage** (`docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` section 10.4, rows 6c/6d, plus the masmorra encounter gap found during this plan's own research):
- ~10 monster sprites (row 6c) → Tasks 1-2. ✅
- Áudio de verdade (row 6d) → Task 6. ✅
- Torre/masmorra visual treatment (section 10.3) → Tasks 4-5, with an explicit documented deviation (Task 5's architecture note) from "mesmo renderer" for the dungeon specifically.
- Masmorra's missing combat trigger (not in the original spec — found while researching this plan) → Task 3. Flagged rather than silently fixed without explanation, consistent with this project's existing practice of documenting corrections (see `docs/superpowers/plans/2026-07-09-webrpg-fase*.md` for precedent).

**Placeholder scan:** the `<caminho-real-...>` placeholders in Tasks 2, 5, 6 are the same legitimate pattern as Fase 6 Tasks 9-10 — they depend on zip contents that don't exist in the repo until the task's own download step runs.

**Type/signature consistency:** `criarInimigoDaSala(celula, jogador) → {nome, hp, hpMax, atk, defesa, xp, ouro, habilidade, status}` (Task 3) matches the shape `iniciarBatalha`/`criarEstadoBatalha` already consume (same shape as `criarInimigoTreino()`'s return in `engine/geradores/inimigoTreino.js`). `spriteParaInimigo` (Task 1) is called identically in `telaBatalha.js` (Task 1) and `telaTorre.js` (Task 4).

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-10-webrpg-fase7-bestiario-audio.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
