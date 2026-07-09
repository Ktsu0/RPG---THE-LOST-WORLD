# WebRPG — Fase 0 (Fundação) e Fase 1 (Batalha) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Construir a fundação técnica do WebRPG (Vite + Vitest + design system + roteador) e a primeira fatia vertical jogável: uma batalha completa Soldado vs Orc em pixel art, com sangramento e envenenamento funcionando visualmente, conforme `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`.

**Architecture:** Um novo `engine/combate/` puro (sem `console.log`, sem DOM) reimplementa fielmente o subconjunto do sistema de batalha do `JogoRPG/` necessário para esta fatia (dano, crítico, esquiva, sangramento, envenenamento, fuga, vitória, derrota), emitindo listas de eventos. O `WebRPG/` consome esses eventos para animar sprites, atualizar barras e preencher o log de combate. O console (`JogoRPG/`) **não é alterado nesta fase** — o motor web roda em paralelo, sem risco de regressão.

**Tech Stack:** Vite (dev server/build), Vitest + jsdom (testes), JavaScript ESM puro (sem framework de UI), CSS puro (custom properties, `steps()` para sprites).

## Global Constraints

- Todo texto de UI, nomes de função e variáveis em português, seguindo o padrão já usado no `JogoRPG/` (`lerInput`, `calcularAtaque`, `rand`, etc.) — copiado do spec seção 4.1.
- Nenhuma imagem via hotlink: todo asset visual vem de `WebRPG/assets/` local — spec seção 5.
- `engine/` é uma camada independente: nunca importa de `JogoRPG/` nem de `WebRPG/` — spec seção 3.1.
- `JogoRPG/` (console) não é modificado nesta fase — decisão de escopo desta fase (ver seção "Fora de escopo" abaixo), consistente com a migração gradual da spec seção 3.3.
- Aleatoriedade em testes é controlada exclusivamente via `vi.spyOn(Math, 'random')` — sem bibliotecas extras de RNG determinístico.
- Node v24 / npm 11 já instalados nesta máquina (verificado).

## Fora de escopo desta fase (documentado, não é lacuna silenciosa)

Seguindo a spec seção 3.3 ("extrai-se apenas o que a fase atual precisa"), o `engine/combate/` desta fase cobre exatamente: ataque básico, crítico, esquiva por habilidade do inimigo, ataque duplo, sangramento (efeito de arma), envenenamento (habilidade de inimigo), fúria do Bárbaro, cura passiva do Xamã, fuga, vitória (XP/ouro) e derrota. Ficam fora, para fases posteriores quando os sistemas relacionados forem construídos:

- Uso de Poção/Item em combate (depende do sistema de itens — Fase 3 "Economia").
- Invocação de esqueletos do Necromante e absorção de dano por esqueletos.
- Habilidades de inimigo `invulneravel`, `teia`/paralisia, `dano_extra`, `roubo_e_fuga`, poderes de boss (`Necromancia`, `Sopro Glaciar`, etc.), petrificação.
- Efeitos de arma além de sangramento (`roubo_de_vida`, `crítico`, `ataque_duplo`, `confusão`, `congelamento`, `incêndio`) e as verificações de esquiva/bloqueio por efeito de arma.
- Drop de itens e level up ao vencer (a vitória do motor concede apenas XP/ouro, fórmula idêntica à de `vitoria.js`).
- Ressurreição via Orbe da Fênix Flamejante ao morrer.
- Salvamento de jogo (save/load é Fase 2 "Identidade").
- Modos `torre`/`onda` (bloqueiam fuga no console); nesta fase só existe o modo normal.
- Botões de ação "Habilidade" e "Defender" da spec seção 4.3: nenhuma dessas ações existe no `JogoRPG/` atual (apenas Atacar/Poção/Fugir), então a barra de ações desta fase mostra só **Atacar** e **Fugir** — "Item" fica para quando o sistema de itens for portado (Fase 3) e "Habilidade" para quando houver uma ação de classe manual a expor.
- Cenário de fundo em parallax por local (spec seção 4.3): esta fase usa um gradiente CSS sólido como palco; os fundos parallax dependem dos assets de `ansimuz` listados como pendentes na Task 6 e entram numa fase posterior.

---

## Fase 0 — Fundação

### Task 1: Instalar Vite e Vitest, configurar scripts

**Files:**
- Modify: `package.json`
- Create: `vite.config.js`
- Create: `vitest.config.js`

**Interfaces:**
- Produces: comando `npm run dev` (servidor Vite servindo `WebRPG/`), `npm run test` (roda Vitest uma vez), `npm run test:watch` (modo watch), alias de import `@engine` apontando para `./engine` (usado a partir da Task 17).

- [x] **Step 1: Instalar as dependências de desenvolvimento**

Run: `npm install -D vite@^6 vitest@^3 jsdom@^25`
Expected: comando termina sem erro, `vite`, `vitest` e `jsdom` aparecem em `package.json` -> `devDependencies`.

- [x] **Step 2: Criar `vite.config.js` na raiz do repositório**

```js
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  root: "WebRPG",
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("./engine", import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
```

- [x] **Step 3: Criar `vitest.config.js` na raiz do repositório**

```js
import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("./engine", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["engine/**/*.test.js", "WebRPG/src/**/*.test.js"],
  },
});
```

- [x] **Step 4: Atualizar os scripts em `package.json`**

Substituir o bloco `"scripts"` existente por:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [x] **Step 5: Verificar a instalação**

Run: `npx vite --version`
Expected: imprime algo como `vite/6.x.x ...` sem erro.

Run: `npx vitest --version`
Expected: imprime a versão do Vitest sem erro.

- [x] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js vitest.config.js
git commit -m "chore: instalar Vite e Vitest para o WebRPG"
```

---

### Task 2: Reorganizar estrutura de pastas do WebRPG

**Files:**
- Create: `WebRPG/legado/` (destino do protótipo atual)
- Modify (mover): `WebRPG/index.html` -> `WebRPG/legado/index.html`
- Modify (mover): `WebRPG/main.js` -> `WebRPG/legado/main.js`
- Modify (mover): `WebRPG/data.js` -> `WebRPG/legado/data.js`
- Modify (mover): `WebRPG/style.css` -> `WebRPG/legado/style.css`
- Create: `WebRPG/index.html` (novo ponto de entrada Vite)
- Create: `WebRPG/src/estilos/`, `WebRPG/src/rotas/`, `WebRPG/src/telas/` (pastas vazias, populadas nas próximas tasks)
- Create: `engine/combate/` (pasta vazia, populada na Fase 1)

**Interfaces:**
- Produces: `WebRPG/index.html` servido pelo Vite, carregando `WebRPG/src/main.js` como módulo (criado na Task 5).

- [x] **Step 1: Mover o protótipo atual para `WebRPG/legado/` preservando histórico**

```bash
mkdir -p WebRPG/legado
git mv WebRPG/index.html WebRPG/legado/index.html
git mv WebRPG/main.js WebRPG/legado/main.js
git mv WebRPG/data.js WebRPG/legado/data.js
git mv WebRPG/style.css WebRPG/legado/style.css
```

- [x] **Step 2: Criar a estrutura de pastas nova**

```bash
mkdir -p WebRPG/src/estilos WebRPG/src/rotas WebRPG/src/telas engine/combate
```

- [x] **Step 3: Criar o novo `WebRPG/index.html`**

```html
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Lost World - WebRPG</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [x] **Step 4: Verificar que a pasta legado preserva o protótipo antigo**

Run: `ls WebRPG/legado`
Expected: lista `index.html`, `main.js`, `data.js`, `style.css`.

- [x] **Step 5: Commit**

```bash
git add -A WebRPG engine
git commit -m "refactor: mover protótipo do WebRPG para legado/ e criar esqueleto Vite"
```

---

### Task 3: Design system CSS (tokens, base, painéis)

**Files:**
- Create: `WebRPG/src/estilos/variaveis.css`
- Create: `WebRPG/src/estilos/base.css`
- Create: `WebRPG/src/estilos/paineis.css`

**Interfaces:**
- Produces: classes CSS reutilizáveis `.painel`, `.botao`, `.botao--destaque`, `.barra`, `.barra__preenchimento`, `.barra__preenchimento--hp`, `.barra__preenchimento--mp`, e custom properties (`--cor-fundo`, `--cor-hp`, `--fonte-pixel`, etc.) usadas por todas as telas futuras.

Esta task é puramente CSS (sem lógica testável); a verificação é visual, feita na Task 5 quando a tela inicial existir.

- [x] **Step 1: Criar `WebRPG/src/estilos/variaveis.css`**

```css
:root {
  --cor-fundo: #14121a;
  --cor-fundo-painel: #1f1c29;
  --cor-borda: #3a3450;
  --cor-texto: #e8e3f0;
  --cor-texto-fraco: #a89fc2;
  --cor-destaque: #d4af37;
  --cor-perigo: #d64545;
  --cor-sucesso: #4caf6d;
  --cor-hp: #d64545;
  --cor-mp: #4a7fd6;
  --cor-barra-vazia: #2a2635;

  --fonte-pixel: "Press Start 2P", monospace;
  --fonte-corpo: "Inter", sans-serif;

  --raio-painel: 4px;
  --espaco-sm: 8px;
  --espaco-md: 16px;
  --espaco-lg: 24px;
}
```

- [x] **Step 2: Criar `WebRPG/src/estilos/base.css`**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--cor-fundo);
  color: var(--cor-texto);
  font-family: var(--fonte-corpo);
  min-height: 100vh;
  overflow-x: hidden;
}

img,
.sprite {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

h1,
h2,
h3,
.texto-pixel {
  font-family: var(--fonte-pixel);
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
```

- [x] **Step 3: Criar `WebRPG/src/estilos/paineis.css`**

```css
.painel {
  background: var(--cor-fundo-painel);
  border: 2px solid var(--cor-borda);
  border-radius: var(--raio-painel);
  padding: var(--espaco-md);
}

.botao {
  font-family: var(--fonte-corpo);
  font-weight: 700;
  background: var(--cor-fundo-painel);
  color: var(--cor-texto);
  border: 2px solid var(--cor-borda);
  border-radius: var(--raio-painel);
  padding: var(--espaco-sm) var(--espaco-md);
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.botao:hover {
  background: var(--cor-borda);
}

.botao:active {
  transform: scale(0.97);
}

.botao:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.botao--destaque {
  border-color: var(--cor-destaque);
  color: var(--cor-destaque);
}

.barra {
  position: relative;
  height: 18px;
  background: var(--cor-barra-vazia);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-painel);
  overflow: hidden;
}

.barra__preenchimento {
  height: 100%;
  transition: width 0.4s ease;
}

.barra__preenchimento--hp {
  background: var(--cor-hp);
}

.barra__preenchimento--mp {
  background: var(--cor-mp);
}
```

- [x] **Step 4: Commit**

```bash
git add WebRPG/src/estilos
git commit -m "feat: design system CSS base do WebRPG (tokens, reset, painéis)"
```

---

### Task 4: Roteador de telas (TDD)

**Files:**
- Create: `WebRPG/src/rotas/roteador.js`
- Test: `WebRPG/src/rotas/roteador.test.js`

**Interfaces:**
- Produces: `inicializarRoteador(container)`, `registrarTela(nome, montar)`, `mostrarTela(nome, props)`, `telaAtualNome()` — usados por `WebRPG/src/main.js` (Task 5) e por todas as telas futuras.

- [x] **Step 1: Escrever o teste `WebRPG/src/rotas/roteador.test.js`**

```js
import { describe, it, expect, beforeEach } from "vitest";
import {
  inicializarRoteador,
  registrarTela,
  mostrarTela,
  telaAtualNome,
} from "./roteador.js";

describe("roteador", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    inicializarRoteador(container);
  });

  it("lança erro ao mostrar uma tela não registrada", () => {
    expect(() => mostrarTela("inexistente")).toThrow(
      'Tela "inexistente" não foi registrada.'
    );
  });

  it("monta a tela registrada dentro do container", () => {
    registrarTela("titulo", (el) => {
      el.innerHTML = "<h1>THE LOST WORLD</h1>";
    });
    mostrarTela("titulo");
    expect(container.querySelector("h1").textContent).toBe("THE LOST WORLD");
  });

  it("limpa o conteúdo anterior ao trocar de tela", () => {
    registrarTela("a", (el) => {
      el.innerHTML = "<p>A</p>";
    });
    registrarTela("b", (el) => {
      el.innerHTML = "<p>B</p>";
    });
    mostrarTela("a");
    mostrarTela("b");
    expect(container.querySelectorAll("p").length).toBe(1);
    expect(container.querySelector("p").textContent).toBe("B");
  });

  it("passa props para a função de montagem", () => {
    let recebido = null;
    registrarTela("com-props", (el, props) => {
      recebido = props;
    });
    mostrarTela("com-props", { valor: 42 });
    expect(recebido).toEqual({ valor: 42 });
  });

  it("rastreia o nome da tela atual", () => {
    registrarTela("titulo", () => {});
    mostrarTela("titulo");
    expect(telaAtualNome()).toBe("titulo");
  });
});
```

- [x] **Step 2: Rodar os testes para confirmar que falham**

Run: `npm run test -- roteador`
Expected: FAIL — `Cannot find module './roteador.js'` (o arquivo ainda não existe).

- [x] **Step 3: Implementar `WebRPG/src/rotas/roteador.js`**

```js
const telas = new Map();
let telaAtual = null;
let elementoContainer = null;

export function inicializarRoteador(container) {
  elementoContainer = container;
  telas.clear();
  telaAtual = null;
}

export function registrarTela(nome, montar) {
  telas.set(nome, montar);
}

export function mostrarTela(nome, props = {}) {
  if (!telas.has(nome)) {
    throw new Error(`Tela "${nome}" não foi registrada.`);
  }
  if (!elementoContainer) {
    throw new Error(
      "Roteador não foi inicializado. Chame inicializarRoteador primeiro."
    );
  }
  elementoContainer.innerHTML = "";
  const montar = telas.get(nome);
  montar(elementoContainer, props);
  telaAtual = nome;
}

export function telaAtualNome() {
  return telaAtual;
}
```

- [x] **Step 4: Rodar os testes para confirmar que passam**

Run: `npm run test -- roteador`
Expected: PASS — 5 testes verdes.

- [x] **Step 5: Commit**

```bash
git add WebRPG/src/rotas
git commit -m "feat: roteador de telas do WebRPG"
```

---

### Task 5: Bootstrap `main.js` + tela inicial mínima

**Files:**
- Create: `WebRPG/src/main.js`
- Create: `WebRPG/src/telas/inicial.js`
- Test: `WebRPG/src/telas/inicial.test.js`

**Interfaces:**
- Consumes: `inicializarRoteador`, `registrarTela`, `mostrarTela` (Task 4).
- Produces: `montarTelaInicial(container)`, registrada no roteador como `'inicial'` (será substituída como tela padrão de boot na Task 17, mas continua registrada).

- [x] **Step 1: Escrever o teste `WebRPG/src/telas/inicial.test.js`**

```js
import { describe, it, expect } from "vitest";
import { montarTelaInicial } from "./inicial.js";

describe("tela inicial", () => {
  it("renderiza o título do jogo", () => {
    const container = document.createElement("div");
    montarTelaInicial(container);
    expect(container.querySelector("h1").textContent).toBe("THE LOST WORLD");
  });
});
```

- [x] **Step 2: Rodar o teste para confirmar que falha**

Run: `npm run test -- inicial`
Expected: FAIL — `Cannot find module './inicial.js'`.

- [x] **Step 3: Implementar `WebRPG/src/telas/inicial.js`**

```js
export function montarTelaInicial(container) {
  container.innerHTML = `
    <div class="painel" style="margin: auto; text-align: center;">
      <h1>THE LOST WORLD</h1>
      <p>Fundação do WebRPG pronta. Fase 1 (Batalha) começa aqui.</p>
    </div>
  `;
}
```

- [x] **Step 4: Rodar o teste para confirmar que passa**

Run: `npm run test -- inicial`
Expected: PASS — 1 teste verde.

- [x] **Step 5: Criar `WebRPG/src/main.js`**

```js
import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import { inicializarRoteador, registrarTela, mostrarTela } from "./rotas/roteador.js";
import { montarTelaInicial } from "./telas/inicial.js";

const app = document.getElementById("app");
inicializarRoteador(app);
registrarTela("inicial", montarTelaInicial);
mostrarTela("inicial");
```

- [x] **Step 6: Verificar manualmente no navegador**

Run: `npm run dev`
Expected: terminal imprime uma URL local (ex: `http://localhost:5173`). Abrir no navegador e confirmar: fundo escuro, painel centralizado com o título "THE LOST WORLD" em fonte pixel e o parágrafo abaixo.

- [x] **Step 7: Commit**

```bash
git add WebRPG/src/main.js WebRPG/src/telas
git commit -m "feat: bootstrap do WebRPG com tela inicial mínima"
```

---

### Task 6: Estrutura de assets e créditos

**Files:**
- Create: `WebRPG/assets/CREDITS.md`
- Create: `WebRPG/assets/personagens/.gitkeep`
- Create: `WebRPG/assets/cenarios/.gitkeep`
- Create: `WebRPG/assets/ui/.gitkeep`
- Create: `WebRPG/assets/audio/.gitkeep`

**Interfaces:**
- Produces: pastas de destino para os assets organizados na Task 13, e um checklist manual para o usuário baixar os packs externos listados na spec seção 5.

- [x] **Step 1: Criar as pastas de destino**

```bash
mkdir -p WebRPG/assets/personagens WebRPG/assets/cenarios WebRPG/assets/ui WebRPG/assets/audio
touch WebRPG/assets/personagens/.gitkeep WebRPG/assets/cenarios/.gitkeep WebRPG/assets/ui/.gitkeep WebRPG/assets/audio/.gitkeep
```

- [x] **Step 2: Criar `WebRPG/assets/CREDITS.md`**

```markdown
# Créditos de Assets — WebRPG

Registro de origem e licença de cada asset visual/sonoro usado no jogo. Nenhum asset é referenciado por hotlink — todos são copiados para dentro de `WebRPG/assets/`.

## Já no repositório

- **Tiny RPG Character Asset Pack v1.03 — Free Soldier & Orc**
  Local original: `WebRPG/assets/Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/`
  Organizado em: `WebRPG/assets/personagens/soldado/` e `WebRPG/assets/personagens/orc/` (Task 13 do plano de implementação).
  Uso: sprites de batalha do herói (classe base) e do inimigo Orc.
  Licença: conferir o arquivo de licença original dentro da pasta do pack antes de redistribuir o jogo publicamente.

## A baixar manualmente (checklist)

Estes packs ainda não estão no repositório. Cada um precisa ser baixado manualmente (geralmente um `.zip` do itch.io), extraído, e ter os arquivos usados copiados para a subpasta indicada — mantendo este arquivo atualizado com o nome exato do pack e a licença declarada pelo autor.

- [ ] **Monstros adicionais** — perfil do criador LuizMelo no itch.io (`https://luizmelo.itch.io/`): buscar pacotes "Monsters Creatures Fantasy" ou similares. Destino: `WebRPG/assets/personagens/`.
- [ ] **Cenários de fundo (parallax)** — perfil do criador ansimuz no itch.io (`https://ansimuz.itch.io/`): buscar pacotes de "platformer/adventure background". Destino: `WebRPG/assets/cenarios/`.
- [ ] **UI em pixel art (painéis, botões, molduras)** — perfil Kenney no itch.io (`https://kenney.itch.io/`): buscar "UI Pack" ou "Pixel UI". Destino: `WebRPG/assets/ui/`.
- [ ] **Ícones de itens em pixel art** — buscar packs de ícones de RPG no itch.io ou OpenGameArt.org. Destino: `WebRPG/assets/ui/icones/`.
- [ ] **Sons (golpe, crítico, moeda, level up)** — Kenney Audio (`https://kenney.itch.io/`) ou packs de áudio RPG no itch.io. Destino: `WebRPG/assets/audio/`. Necessário apenas a partir da Fase 5 (Polimento).

Ao baixar um pack, adicione uma entrada acima com: nome exato do pack, autor, URL da página específica do pack, e a licença declarada.
```

- [x] **Step 3: Commit**

```bash
git add WebRPG/assets/CREDITS.md WebRPG/assets/personagens/.gitkeep WebRPG/assets/cenarios/.gitkeep WebRPG/assets/ui/.gitkeep WebRPG/assets/audio/.gitkeep
git commit -m "docs: estrutura de assets e checklist de créditos do WebRPG"
```

---

## Fase 1 — Batalha

### Task 7: `engine/combate/aleatorio.js` e cálculos básicos de dano (TDD)

**Files:**
- Create: `engine/combate/aleatorio.js`
- Create: `engine/combate/calculoDano.js`
- Test: `engine/combate/aleatorio.test.js`
- Test: `engine/combate/calculoDano.test.js`

**Interfaces:**
- Produces: `rand(min, max)`; `calcularAtaqueJogador(jogador)`, `calcularDefesaJogador(jogador)`, `calcularDanoBaseJogador(jogador)`, `calcularChanceCriticaJogador(jogador)`, `aplicarFuriaBarbaro(jogador, dano)`, `calcularDefesaInimigo(inimigo)` — usados pela Task 8 (mesmo arquivo, funções de resolução de ataque) e pela Task 11 (`turno.js`).

Fiel a `JogoRPG/utilitarios.js` (função `rand`), `JogoRPG/batalha/ataqueJogador/calcular/{calcularAtk,calcularDef,danoJogador}.js`, `JogoRPG/batalha/ataqueInimigo/funcionAuxiliares/calcularDanoInimigo.js` (defesa do inimigo) e `JogoRPG/personagem/habilidades.js` (`aplicarFuria`), removendo apenas os `console.log`.

- [x] **Step 1: Escrever o teste `engine/combate/aleatorio.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { rand } from "./aleatorio.js";

describe("rand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna o valor mínimo quando Math.random retorna 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(rand(5, 10)).toBe(5);
  });

  it("retorna o valor máximo quando Math.random se aproxima de 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(rand(5, 10)).toBe(10);
  });

  it("calcula um valor intermediário corretamente", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(rand(1, 100)).toBe(51);
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- aleatorio`
Expected: FAIL — `Cannot find module './aleatorio.js'`.

- [x] **Step 3: Implementar `engine/combate/aleatorio.js`**

```js
export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- aleatorio`
Expected: PASS — 3 testes verdes.

- [x] **Step 5: Escrever o teste `engine/combate/calculoDano.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  calcularAtaqueJogador,
  calcularDefesaJogador,
  calcularDanoBaseJogador,
  calcularChanceCriticaJogador,
  aplicarFuriaBarbaro,
  calcularDefesaInimigo,
} from "./calculoDano.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("calcularAtaqueJogador", () => {
  it("soma ataque base, bônus de nível, equipamentos, bônus extra e arma equipada", () => {
    const jogador = {
      ataque: 10,
      nivel: 3,
      equipamentos: { arma: { atkBonus: 5 }, armadura: null },
      bonusAtk: 2,
      amuletoEquipado: false,
      ataqueOriginal: 10,
      armaEquipada: { atk: 3 },
    };
    // 10 + floor(3*2)=6 + 5 (equip) + 2 (bonusAtk) + 3 (arma) = 26
    expect(calcularAtaqueJogador(jogador)).toBe(26);
  });

  it("soma o bônus do amuleto (2% do ataque original) quando equipado", () => {
    const jogador = {
      ataque: 10,
      nivel: 0,
      equipamentos: {},
      bonusAtk: 0,
      amuletoEquipado: true,
      ataqueOriginal: 100,
      armaEquipada: null,
    };
    // 10 + 0 + 0 + 0 + floor(100*0.02)=2 = 12
    expect(calcularAtaqueJogador(jogador)).toBe(12);
  });
});

describe("calcularDefesaJogador", () => {
  it("soma defesa base, defesa dos equipamentos e bônus extra", () => {
    const jogador = {
      defesa: 8,
      equipamentos: { armadura: { defesa: 4 }, capacete: { defesa: 2 } },
      bonusDef: 1,
    };
    expect(calcularDefesaJogador(jogador)).toBe(15);
  });
});

describe("calcularDanoBaseJogador", () => {
  it("soma o ataque total a uma variação aleatória de 0 a 4", () => {
    const jogador = {
      ataque: 10,
      nivel: 0,
      equipamentos: {},
      bonusAtk: 0,
      amuletoEquipado: false,
      armaEquipada: null,
    };
    vi.spyOn(Math, "random").mockReturnValue(0.9); // rand(0,4) = 4
    expect(calcularDanoBaseJogador(jogador)).toBe(14);
  });
});

describe("calcularChanceCriticaJogador", () => {
  it("soma bônus de classe, raça, crítico direto e efeito de arma", () => {
    const jogador = {
      bonusClasse: { critChance: 5 },
      bonusRaca: { critChance: 3 },
      bonusCritico: 2,
      armaEquipada: { efeito: { tipo: "critico", chance: 10 } },
    };
    expect(calcularChanceCriticaJogador(jogador)).toBe(20);
  });
});

describe("aplicarFuriaBarbaro", () => {
  it("aumenta o dano em 50% quando o Bárbaro está com 35% de HP ou menos", () => {
    const jogador = { classe: "Bárbaro", hp: 30, hpMax: 100 };
    expect(aplicarFuriaBarbaro(jogador, 10)).toBe(15);
  });

  it("não altera o dano para outras classes", () => {
    const jogador = { classe: "Guerreiro", hp: 30, hpMax: 100 };
    expect(aplicarFuriaBarbaro(jogador, 10)).toBe(10);
  });
});

describe("calcularDefesaInimigo", () => {
  it("soma defesa base e bônus de defesa", () => {
    const inimigo = { defesa: 6, bonusDef: 2 };
    expect(calcularDefesaInimigo(inimigo)).toBe(8);
  });
});
```

- [x] **Step 6: Rodar e confirmar falha**

Run: `npm run test -- calculoDano`
Expected: FAIL — `Cannot find module './calculoDano.js'`.

- [x] **Step 7: Implementar `engine/combate/calculoDano.js`**

```js
import { rand } from "./aleatorio.js";

export function calcularAtaqueJogador(jogador) {
  let atk = jogador.ataque || 0;
  atk += Math.floor(jogador.nivel * 2);

  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  const atkBonus = equipamentos.reduce(
    (acc, it) => acc + (Number(it.atkBonus) || 0),
    0
  );
  atk += atkBonus;
  atk += jogador.bonusAtk || 0;

  if (jogador.amuletoEquipado) {
    const atkBase = jogador.ataqueOriginal || jogador.ataque || 0;
    atk += Math.floor(atkBase * 0.02);
  }

  if (jogador.armaEquipada && jogador.armaEquipada.atk) {
    atk += Number(jogador.armaEquipada.atk) || 0;
  }

  return atk;
}

export function calcularDefesaJogador(jogador) {
  let def = jogador.defesa || 0;
  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  for (const it of equipamentos) {
    def += it.defesa || 0;
  }
  def += jogador.bonusDef || 0;
  return def;
}

export function calcularDanoBaseJogador(jogador) {
  return Math.max(1, Math.floor(calcularAtaqueJogador(jogador)) + rand(0, 4));
}

export function calcularChanceCriticaJogador(jogador) {
  const bonusCriticoArma =
    jogador.armaEquipada?.efeito?.tipo === "critico"
      ? jogador.armaEquipada.efeito.chance
      : 0;
  return (
    (jogador.bonusClasse?.critChance || 0) +
    (jogador.bonusRaca?.critChance || 0) +
    (jogador.bonusCritico || 0) +
    bonusCriticoArma
  );
}

export function aplicarFuriaBarbaro(jogador, dano) {
  if (jogador.classe === "Bárbaro" && jogador.hp <= jogador.hpMax * 0.35) {
    return Math.floor(dano * 1.5);
  }
  return dano;
}

export function calcularDefesaInimigo(inimigo) {
  let def = Number(inimigo.defesa) || 0;
  def += inimigo.bonusDef || 0;
  return def;
}
```

- [x] **Step 8: Rodar e confirmar sucesso**

Run: `npm run test -- calculoDano`
Expected: PASS — 7 testes verdes.

- [x] **Step 9: Commit**

```bash
git add engine/combate/aleatorio.js engine/combate/aleatorio.test.js engine/combate/calculoDano.js engine/combate/calculoDano.test.js
git commit -m "feat: cálculos básicos de dano do engine de combate"
```

---

### Task 8: Resolução de ataque (jogador e inimigo) com crítico/esquiva/bloqueio (TDD)

**Files:**
- Modify: `engine/combate/calculoDano.js`
- Modify: `engine/combate/calculoDano.test.js`

**Interfaces:**
- Consumes: `calcularDanoBaseJogador`, `calcularDefesaInimigo`, `aplicarFuriaBarbaro`, `calcularChanceCriticaJogador`, `calcularDefesaJogador`, `rand` (Task 7, mesmo arquivo/módulo `aleatorio.js`).
- Produces: `resolverAtaqueJogador(jogador, inimigo) -> { dano, critico, esquivou }`, `resolverAtaqueInimigo(inimigo, jogador) -> { resultado: 'esquiva'|'bloqueio'|'dano', dano }` — usados pela Task 11 (`turno.js`).

Fiel a `JogoRPG/batalha/ataqueJogador/ataqueJogador.js` (linhas 51-81: cálculo de dano, fúria, crítico, esquiva do inimigo) e `JogoRPG/batalha/ataqueInimigo/funcionAuxiliares/calcularDanoInimigo.js` (esquiva/bloqueio do jogador), removendo os `console.log` e os ramos de `dano_extra`/`petrificado`/efeitos de arma de esquiva-bloqueio (fora de escopo — ver seção "Fora de escopo desta fase").

- [x] **Step 1: Adicionar os testes de `resolverAtaqueJogador` e `resolverAtaqueInimigo` ao final de `engine/combate/calculoDano.test.js`**

```js
describe("resolverAtaqueJogador", () => {
  function jogadorBase() {
    return {
      ataque: 10,
      nivel: 0,
      equipamentos: {},
      bonusAtk: 0,
      amuletoEquipado: false,
      armaEquipada: null,
      bonusClasse: {},
      bonusRaca: {},
      bonusCritico: 0,
      classe: "Guerreiro",
      hp: 100,
      hpMax: 100,
    };
  }

  function inimigoBase() {
    return { defesa: 3, bonusDef: 0, habilidade: null };
  }

  it("causa dano normal sem crítico quando a chance de crítico é zero e o inimigo não esquiva", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(0,4)=0 dentro de calcularDanoBaseJogador
    const resultado = resolverAtaqueJogador(jogadorBase(), inimigoBase());
    // danoBruto=10, defesa=3, dano=7, sem fúria, chanceCritica=0 (sem 2ª chamada), habilidade null (sem 3ª chamada)
    expect(resultado).toEqual({ dano: 7, critico: false, esquivou: false });
  });

  it("dobra o dano quando o crítico é acertado", () => {
    const jogador = { ...jogadorBase(), bonusCritico: 50 };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,4) em calcularDanoBaseJogador -> 0
      .mockReturnValueOnce(0); // rand(1,100) do crítico -> 1, <=50 sucesso
    const resultado = resolverAtaqueJogador(jogador, inimigoBase());
    expect(resultado).toEqual({ dano: 14, critico: true, esquivou: false });
  });

  it("o inimigo com habilidade esquiva pode evitar o dano", () => {
    const inimigo = { ...inimigoBase(), habilidade: "esquiva" };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,4) -> 0
      .mockReturnValueOnce(0); // rand(1,100) da esquiva -> 1, <=15 sucesso
    const resultado = resolverAtaqueJogador(jogadorBase(), inimigo);
    expect(resultado).toEqual({ dano: 0, critico: false, esquivou: true });
  });
});

describe("resolverAtaqueInimigo", () => {
  function inimigoBase() {
    return { atk: 10, status: [] };
  }

  function jogadorBase() {
    return {
      defesa: 5,
      equipamentos: {},
      bonusDef: 0,
      bonusClasse: {},
      bonusEsquiva: 0,
      bonusBloqueio: 0,
    };
  }

  it("causa dano normal quando o jogador não esquiva nem bloqueia", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // aplica-se às 3 chamadas de rand desta função
    // danoBase = max(1, 10 + rand(0,3)=0 - floor(defesaJogador(5)/5)=1) = 9
    const resultado = resolverAtaqueInimigo(inimigoBase(), jogadorBase());
    expect(resultado).toEqual({ resultado: "dano", dano: 9 });
  });

  it("o jogador esquiva quando a chance é suficiente", () => {
    const jogador = { ...jogadorBase(), bonusEsquiva: 50 };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,3) da base -> 0
      .mockReturnValueOnce(0); // rand(1,100) da esquiva -> 1, <=50 sucesso
    const resultado = resolverAtaqueInimigo(inimigoBase(), jogador);
    expect(resultado).toEqual({ resultado: "esquiva", dano: 0 });
  });

  it("o jogador bloqueia quando a esquiva falha mas o bloqueio é suficiente", () => {
    const jogador = { ...jogadorBase(), bonusBloqueio: 50 };
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // rand(0,3) da base -> 0
      .mockReturnValueOnce(0) // rand(1,100) da esquiva (total=0) -> 1, falha
      .mockReturnValueOnce(0); // rand(1,100) do bloqueio -> 1, <=50 sucesso
    const resultado = resolverAtaqueInimigo(inimigoBase(), jogador);
    expect(resultado).toEqual({ resultado: "bloqueio", dano: 0 });
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- calculoDano`
Expected: FAIL — `resolverAtaqueJogador is not a function`.

- [x] **Step 3: Adicionar as funções ao final de `engine/combate/calculoDano.js`**

```js
export function resolverAtaqueJogador(jogador, inimigo) {
  const danoBruto = calcularDanoBaseJogador(jogador);
  const defesaEfetiva = calcularDefesaInimigo(inimigo);
  let dano = Math.max(1, danoBruto - defesaEfetiva);
  dano = aplicarFuriaBarbaro(jogador, dano);

  const chanceCritica = calcularChanceCriticaJogador(jogador);
  let critico = false;
  if (chanceCritica > 0 && rand(1, 100) <= chanceCritica) {
    critico = true;
    dano *= 2;
  }

  if (inimigo.habilidade === "esquiva" && rand(1, 100) <= 15) {
    return { dano: 0, critico: false, esquivou: true };
  }

  return { dano, critico, esquivou: false };
}

export function resolverAtaqueInimigo(inimigo, jogador) {
  const danoBase = Math.max(
    1,
    inimigo.atk + rand(0, 3) - Math.floor(calcularDefesaJogador(jogador) / 5)
  );

  const esquivaTotal =
    (jogador.bonusClasse?.esquiva || 0) + (jogador.bonusEsquiva || 0);
  if (rand(1, 100) <= esquivaTotal) {
    return { resultado: "esquiva", dano: 0 };
  }

  const chanceBloqueio =
    (jogador.bonusClasse?.bloqueioChance || 0) + (jogador.bonusBloqueio || 0);
  if (rand(1, 100) <= chanceBloqueio) {
    return { resultado: "bloqueio", dano: 0 };
  }

  return { resultado: "dano", dano: danoBase };
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- calculoDano`
Expected: PASS — 13 testes verdes no total do arquivo.

- [x] **Step 5: Commit**

```bash
git add engine/combate/calculoDano.js engine/combate/calculoDano.test.js
git commit -m "feat: resolução de ataque do jogador e do inimigo (crítico, esquiva, bloqueio)"
```

---

### Task 9: Efeitos de status por turno — sangramento, envenenamento, cura xamã, efeito de arma (TDD)

**Files:**
- Create: `engine/combate/efeitosDeStatus.js`
- Test: `engine/combate/efeitosDeStatus.test.js`

**Interfaces:**
- Produces: `processarCuraXama(jogador)`, `aplicarSangramento(inimigo, duracao, danoPorTurno)`, `processarSangramentoDoTurno(inimigo)`, `aplicarEnvenenamento(jogador, duracao, danoPorTurno)`, `processarEnvenenamentoDoTurno(jogador)`, `aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)` — `aplicarEnvenenamento` também é usada pela Task 10 (`habilidadesInimigo.js`); todas usadas pela Task 11 (`turno.js`).

Fiel a `JogoRPG/personagem/habilidades.js` (`processarCuraXama`), `JogoRPG/batalha/ataqueInimigo/funcionAuxiliares/sangramento.js`, `JogoRPG/batalha/ataqueInimigo/funcionAuxiliares/envenenamento.js` e ao caso `sangramento` de `JogoRPG/itens/equipamentos/efeitos/armasEfeitos.js` (`aplicarEfeitoArma`), removendo os `console.log`. **Correção documentada:** o código original tem um bug onde o envenenamento do jogador tiquita duas vezes por rodada (uma vez em `aplicarStatusPorTurno` e outra em `processarEnvenenamento`, chamado separadamente em `ataqueJogador.js`); este motor tiquita exatamente uma vez por rodada via `processarEnvenenamentoDoTurno`.

- [x] **Step 1: Escrever o teste `engine/combate/efeitosDeStatus.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  processarCuraXama,
  aplicarSangramento,
  processarSangramentoDoTurno,
  aplicarEnvenenamento,
  processarEnvenenamentoDoTurno,
  aplicarEfeitoDaArmaAoAcertar,
} from "./efeitosDeStatus.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("processarCuraXama", () => {
  it("retorna null para classes que não são Xamã", () => {
    const jogador = { classe: "Guerreiro", hp: 50, hpMax: 100 };
    expect(processarCuraXama(jogador)).toBeNull();
  });

  it("cura 5% do HP máximo quando a chance de 50% acerta", () => {
    const jogador = { classe: "Xamã", hp: 80, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.4); // < 0.5
    const resultado = processarCuraXama(jogador);
    expect(resultado).toEqual({ curou: true, valor: 5 });
    expect(jogador.hp).toBe(85);
  });

  it("não cura quando a chance falha", () => {
    const jogador = { classe: "Xamã", hp: 80, hpMax: 100 };
    vi.spyOn(Math, "random").mockReturnValue(0.9); // >= 0.5
    expect(processarCuraXama(jogador)).toEqual({ curou: false, valor: 0 });
    expect(jogador.hp).toBe(80);
  });
});

describe("aplicarSangramento e processarSangramentoDoTurno", () => {
  it("retorna null quando o inimigo não tem sangramento ativo", () => {
    const inimigo = { hp: 30, status: [] };
    expect(processarSangramentoDoTurno(inimigo)).toBeNull();
  });

  it("aplica dano por turno e mantém o status quando a duração não acabou", () => {
    const inimigo = { hp: 30, status: [] };
    aplicarSangramento(inimigo, 2, 5);
    const resultado = processarSangramentoDoTurno(inimigo);
    expect(resultado).toEqual({ dano: 5, curado: false });
    expect(inimigo.hp).toBe(25);
    expect(inimigo.status).toEqual([{ tipo: "sangramento", duracao: 1, dano: 5 }]);
  });

  it("remove o status quando a duração termina", () => {
    const inimigo = { hp: 30, status: [] };
    aplicarSangramento(inimigo, 1, 5);
    const resultado = processarSangramentoDoTurno(inimigo);
    expect(resultado).toEqual({ dano: 5, curado: true });
    expect(inimigo.status).toEqual([]);
  });
});

describe("aplicarEnvenenamento e processarEnvenenamentoDoTurno", () => {
  it("retorna null quando o jogador não está envenenado", () => {
    const jogador = { hp: 100, status: [] };
    expect(processarEnvenenamentoDoTurno(jogador)).toBeNull();
  });

  it("aplica dano por turno e mantém o status quando a duração não acabou", () => {
    const jogador = { hp: 100, status: [] };
    aplicarEnvenenamento(jogador, 3, 5);
    const resultado = processarEnvenenamentoDoTurno(jogador);
    expect(resultado).toEqual({ dano: 5, curado: false });
    expect(jogador.hp).toBe(95);
  });

  it("remove o status quando a duração termina", () => {
    const jogador = { hp: 100, status: [] };
    aplicarEnvenenamento(jogador, 1, 5);
    const resultado = processarEnvenenamentoDoTurno(jogador);
    expect(resultado).toEqual({ dano: 5, curado: true });
    expect(jogador.status).toEqual([]);
  });
});

describe("aplicarEfeitoDaArmaAoAcertar", () => {
  it("retorna false quando o jogador não tem arma equipada", () => {
    const jogador = { armaEquipada: null };
    const inimigo = { status: [] };
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(false);
  });

  it("retorna false quando o efeito da arma não é sangramento", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "critico" } } };
    const inimigo = { status: [] };
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(false);
  });

  it("aplica sangramento quando a chance da arma acerta", () => {
    const jogador = {
      armaEquipada: {
        nome: "Adaga Sombria",
        efeito: { tipo: "sangramento", chance: 60, duracao: 3, danoPorTurno: 4 },
      },
    };
    const inimigo = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1, <=60 sucesso
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(true);
    expect(inimigo.status).toEqual([{ tipo: "sangramento", duracao: 3, dano: 4 }]);
  });

  it("não aplica sangramento quando a chance da arma falha", () => {
    const jogador = {
      armaEquipada: {
        nome: "Adaga Sombria",
        efeito: { tipo: "sangramento", chance: 60, duracao: 3, danoPorTurno: 4 },
      },
    };
    const inimigo = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100, >60 falha
    expect(aplicarEfeitoDaArmaAoAcertar(jogador, inimigo)).toBe(false);
    expect(inimigo.status).toEqual([]);
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- efeitosDeStatus`
Expected: FAIL — `Cannot find module './efeitosDeStatus.js'`.

- [x] **Step 3: Implementar `engine/combate/efeitosDeStatus.js`**

```js
import { rand } from "./aleatorio.js";

export function processarCuraXama(jogador) {
  if (jogador.classe !== "Xamã" || jogador.hp <= 0) return null;

  const chance = Math.random();
  if (chance < 0.5) {
    const cura = Math.floor(jogador.hpMax * 0.05);
    const hpAnterior = jogador.hp;
    jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
    const curaEfetiva = jogador.hp - hpAnterior;
    return { curou: curaEfetiva > 0, valor: curaEfetiva };
  }
  return { curou: false, valor: 0 };
}

export function aplicarSangramento(inimigo, duracao, danoPorTurno) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "sangramento", duracao, dano: danoPorTurno });
}

export function processarSangramentoDoTurno(inimigo) {
  if (!inimigo.status) return null;
  const efeito = inimigo.status.find((s) => s.tipo === "sangramento");
  if (!efeito) return null;

  inimigo.hp = Math.max(0, inimigo.hp - efeito.dano);
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) {
    inimigo.status = inimigo.status.filter((s) => s.tipo !== "sangramento");
  }
  return { dano: efeito.dano, curado };
}

export function aplicarEnvenenamento(jogador, duracao, danoPorTurno) {
  if (!jogador.status) jogador.status = [];
  jogador.status.push({ tipo: "envenenamento", duracao, dano: danoPorTurno });
}

export function processarEnvenenamentoDoTurno(jogador) {
  if (!jogador.status) return null;
  const efeito = jogador.status.find((s) => s.tipo === "envenenamento");
  if (!efeito) return null;

  jogador.hp = Math.max(0, jogador.hp - efeito.dano);
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) {
    jogador.status = jogador.status.filter((s) => s.tipo !== "envenenamento");
  }
  return { dano: efeito.dano, curado };
}

export function aplicarEfeitoDaArmaAoAcertar(jogador, inimigo) {
  const arma = jogador.armaEquipada;
  if (!arma || !arma.efeito || arma.efeito.tipo !== "sangramento") return false;

  const chance = arma.efeito.chance;
  if (chance && rand(1, 100) > chance) return false;

  aplicarSangramento(inimigo, arma.efeito.duracao, arma.efeito.danoPorTurno);
  return true;
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- efeitosDeStatus`
Expected: PASS — 12 testes verdes.

- [x] **Step 5: Commit**

```bash
git add engine/combate/efeitosDeStatus.js engine/combate/efeitosDeStatus.test.js
git commit -m "feat: efeitos de status por turno (sangramento, envenenamento, cura xamã)"
```

---

### Task 10: Habilidades de inimigo e recompensa de vitória (TDD)

**Files:**
- Create: `engine/combate/habilidadesInimigo.js`
- Create: `engine/combate/recompensas.js`
- Test: `engine/combate/habilidadesInimigo.test.js`
- Test: `engine/combate/recompensas.test.js`

**Interfaces:**
- Consumes: `rand` (Task 7), `aplicarEnvenenamento` (Task 9).
- Produces: `verificarEsquivaInimigo(inimigo)`, `verificarAtaqueDuplo(inimigo)`, `verificarEnvenenamentoAoAtacar(inimigo, jogador)`, `concederRecompensaVitoria(jogador, inimigo) -> { xpGanho, ouroGanho }` — todas usadas pela Task 11 (`turno.js`).

Fiel a `JogoRPG/masmorra/habilidadesInimigos.js` (casos `ataque_duplo` e `envenenamento` de `executarHabilidadeEspecial`/`ataqueInimigo.js` linhas 105-115) e `JogoRPG/verificar/vitoria/vitoria.js` (fórmula de XP/ouro de `finalizarVitoria`, sem drops nem level up — fora de escopo desta fase).

- [x] **Step 1: Escrever o teste `engine/combate/habilidadesInimigo.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  verificarEsquivaInimigo,
  verificarAtaqueDuplo,
  verificarEnvenenamentoAoAtacar,
} from "./habilidadesInimigo.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verificarEsquivaInimigo", () => {
  it("retorna false quando a habilidade não é esquiva", () => {
    expect(verificarEsquivaInimigo({ habilidade: null })).toBe(false);
  });

  it("retorna true quando a habilidade é esquiva e a chance acerta", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1, <=15 sucesso
    expect(verificarEsquivaInimigo({ habilidade: "esquiva" })).toBe(true);
  });

  it("retorna false quando a habilidade é esquiva mas a chance falha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100, >15 falha
    expect(verificarEsquivaInimigo({ habilidade: "esquiva" })).toBe(false);
  });
});

describe("verificarAtaqueDuplo", () => {
  it("retorna false quando a habilidade não é ataque_duplo", () => {
    expect(verificarAtaqueDuplo({ habilidade: null })).toBe(false);
  });

  it("retorna true quando a habilidade é ataque_duplo e a chance acerta", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(verificarAtaqueDuplo({ habilidade: "ataque_duplo" })).toBe(true);
  });

  it("retorna false quando a habilidade é ataque_duplo mas a chance falha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(verificarAtaqueDuplo({ habilidade: "ataque_duplo" })).toBe(false);
  });
});

describe("verificarEnvenenamentoAoAtacar", () => {
  it("não aplica veneno se a habilidade do inimigo não for envenenamento", () => {
    const inimigo = { habilidade: null };
    const jogador = { status: [] };
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(false);
    expect(jogador.status).toHaveLength(0);
  });

  it("aplica veneno no jogador quando a habilidade é envenenamento e a chance acerta", () => {
    const inimigo = { habilidade: "envenenamento" };
    const jogador = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1<=20 sucesso; rand(3,5)=3
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(true);
    expect(jogador.status).toEqual([{ tipo: "envenenamento", duracao: 3, dano: 5 }]);
  });

  it("não aplica veneno quando a chance falha", () => {
    const inimigo = { habilidade: "envenenamento" };
    const jogador = { status: [] };
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100>20 falha
    expect(verificarEnvenenamentoAoAtacar(inimigo, jogador)).toBe(false);
    expect(jogador.status).toHaveLength(0);
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- habilidadesInimigo`
Expected: FAIL — `Cannot find module './habilidadesInimigo.js'`.

- [x] **Step 3: Implementar `engine/combate/habilidadesInimigo.js`**

```js
import { rand } from "./aleatorio.js";
import { aplicarEnvenenamento } from "./efeitosDeStatus.js";

export function verificarEsquivaInimigo(inimigo) {
  return inimigo.habilidade === "esquiva" && rand(1, 100) <= 15;
}

export function verificarAtaqueDuplo(inimigo) {
  return inimigo.habilidade === "ataque_duplo" && rand(1, 100) <= 15;
}

export function verificarEnvenenamentoAoAtacar(inimigo, jogador) {
  if (inimigo.habilidade !== "envenenamento" || rand(1, 100) > 20) return false;
  aplicarEnvenenamento(jogador, rand(3, 5), 5);
  return true;
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- habilidadesInimigo`
Expected: PASS — 8 testes verdes.

- [x] **Step 5: Escrever o teste `engine/combate/recompensas.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { concederRecompensaVitoria } from "./recompensas.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("concederRecompensaVitoria", () => {
  it("usa o XP e o ouro definidos no inimigo quando presentes", () => {
    const jogador = { xp: 0, ouro: 0 };
    const inimigo = { xp: 20, ouro: 30, hpMax: 50, atk: 10 };
    const resultado = concederRecompensaVitoria(jogador, inimigo);
    expect(resultado).toEqual({ xpGanho: 20, ouroGanho: 30 });
    expect(jogador.xp).toBe(20);
    expect(jogador.ouro).toBe(30);
  });

  it("usa a fórmula de fallback quando o inimigo não define xp/ouro", () => {
    const jogador = { xp: 0, ouro: 0 };
    const inimigo = { hpMax: 50, atk: 10 };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(50,100)=50
    const resultado = concederRecompensaVitoria(jogador, inimigo);
    // xpGanho = floor(50/5 + 10*2) = floor(10+20) = 30
    expect(resultado).toEqual({ xpGanho: 30, ouroGanho: 50 });
    expect(jogador.xp).toBe(30);
    expect(jogador.ouro).toBe(50);
  });
});
```

- [x] **Step 6: Rodar e confirmar falha**

Run: `npm run test -- recompensas`
Expected: FAIL — `Cannot find module './recompensas.js'`.

- [x] **Step 7: Implementar `engine/combate/recompensas.js`**

```js
import { rand } from "./aleatorio.js";

export function concederRecompensaVitoria(jogador, inimigo) {
  const xpGanho =
    Number(inimigo.xp) || Math.floor(inimigo.hpMax / 5 + inimigo.atk * 2);
  const ouroGanho = Number(inimigo.ouro) || rand(50, 100);
  jogador.xp += xpGanho;
  jogador.ouro += ouroGanho;
  return { xpGanho, ouroGanho };
}
```

- [x] **Step 8: Rodar e confirmar sucesso**

Run: `npm run test -- recompensas`
Expected: PASS — 2 testes verdes.

- [x] **Step 9: Commit**

```bash
git add engine/combate/habilidadesInimigo.js engine/combate/habilidadesInimigo.test.js engine/combate/recompensas.js engine/combate/recompensas.test.js
git commit -m "feat: habilidades de inimigo (esquiva, ataque duplo, envenenamento) e recompensa de vitória"
```

---

### Task 11: Orquestração da rodada — `executarRodada` (TDD, cenários de integração)

**Files:**
- Create: `engine/combate/turno.js`
- Test: `engine/combate/turno.test.js`

**Interfaces:**
- Consumes: `resolverAtaqueJogador`, `resolverAtaqueInimigo` (Task 8); `processarCuraXama`, `processarSangramentoDoTurno`, `processarEnvenenamentoDoTurno`, `aplicarEfeitoDaArmaAoAcertar` (Task 9); `verificarAtaqueDuplo`, `verificarEnvenenamentoAoAtacar` (Task 10); `concederRecompensaVitoria` (Task 10); `rand` (Task 7).
- Produces: `executarRodada(estado, acao) -> { estado, eventos, fim }`, onde `estado = { jogador, inimigo, rodada }`, `acao` é `'atacar'` ou `'fugir'`, `fim` é `null | 'vitoria' | 'derrota' | 'fuga'`. Lista exaustiva de tipos de evento emitidos nesta fase: `cura_xama`, `sangramento_tick`, `envenenamento_tick`, `dano`, `sangramento_aplicado`, `envenenamento_aplicado`, `esquiva`, `bloqueio`, `ataque_duplo`, `morte`, `vitoria`, `derrota`, `fuga`. Usado pela Task 12 (`index.js`) e pela Task 17 (`controladorBatalha.js`).

Fiel à ordem de execução de `JogoRPG/batalha/sistemaBatalha.js` (processamento passivo -> ação do jogador -> ação do inimigo -> checagens de fim de jogo) e `JogoRPG/batalha/ataqueJogador/ataqueJogador.js`/`ataqueInimigo.js`.

- [x] **Step 1: Escrever o teste `engine/combate/turno.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { executarRodada } from "./turno.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorBase() {
  return {
    nivel: 0,
    ataque: 10,
    defesa: 5,
    hp: 100,
    hpMax: 100,
    equipamentos: {},
    bonusAtk: 0,
    bonusDef: 0,
    amuletoEquipado: false,
    armaEquipada: null,
    bonusClasse: {},
    bonusRaca: {},
    bonusCritico: 0,
    bonusEsquiva: 0,
    bonusBloqueio: 0,
    classe: "Guerreiro",
    status: [],
    xp: 0,
    ouro: 0,
  };
}

function inimigoBase() {
  return {
    nome: "Orc",
    atk: 8,
    defesa: 3,
    hp: 30,
    hpMax: 30,
    xp: 15,
    ouro: 20,
    habilidade: null,
    status: [],
  };
}

describe("executarRodada", () => {
  it("processa uma rodada normal: jogador ataca, inimigo revida, sem eventos especiais", () => {
    const estado = { jogador: jogadorBase(), inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.fim).toBeNull();
    expect(resultado.estado.rodada).toBe(1);
    expect(resultado.estado.inimigo.hp).toBe(23); // 30 - 7
    expect(resultado.estado.jogador.hp).toBe(93); // 100 - 7
    expect(resultado.eventos).toEqual([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
    ]);
  });

  it("tiquita o sangramento do inimigo no início da rodada e o remove quando a duração acaba", () => {
    const inimigo = { ...inimigoBase(), status: [{ tipo: "sangramento", duracao: 1, dano: 4 }] };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos[0]).toEqual({
      tipo: "sangramento_tick",
      alvo: "inimigo",
      dano: 4,
      curado: true,
    });
    expect(resultado.estado.inimigo.status).toEqual([]);
    expect(resultado.estado.inimigo.hp).toBe(19); // 30 - 4 (tick) - 7 (ataque)
    expect(resultado.estado.jogador.hp).toBe(93);
    expect(resultado.fim).toBeNull();
  });

  it("declara derrota quando o envenenamento do jogador zera o HP no início da rodada", () => {
    const jogador = {
      ...jogadorBase(),
      hp: 90,
      status: [{ tipo: "envenenamento", duracao: 1, dano: 95 }],
    };
    const estado = { jogador, inimigo: inimigoBase(), rodada: 0 };

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos).toEqual([
      { tipo: "envenenamento_tick", alvo: "jogador", dano: 95, curado: true },
      { tipo: "morte", alvo: "jogador" },
      { tipo: "derrota" },
    ]);
    expect(resultado.fim).toBe("derrota");
    expect(resultado.estado.jogador.hp).toBe(0);
  });

  it("declara vitória quando o inimigo morre no ataque do jogador", () => {
    const inimigo = { ...inimigoBase(), hp: 5 };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos).toEqual([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "morte", alvo: "inimigo" },
      { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 },
    ]);
    expect(resultado.fim).toBe("vitoria");
    expect(resultado.estado.jogador.xp).toBe(15);
    expect(resultado.estado.jogador.ouro).toBe(20);
  });

  it("fuga bem-sucedida encerra a rodada sem ataques", () => {
    const estado = { jogador: jogadorBase(), inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0.5); // rand(1,100)=51, >40 sucesso

    const resultado = executarRodada(estado, "fugir");

    expect(resultado.eventos).toEqual([{ tipo: "fuga", sucesso: true }]);
    expect(resultado.fim).toBe("fuga");
    expect(resultado.estado.inimigo.hp).toBe(30);
  });

  it("fuga malsucedida permite que o inimigo ataque normalmente", () => {
    const estado = { jogador: jogadorBase(), inimigo: inimigoBase(), rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1, <=40 falha na fuga

    const resultado = executarRodada(estado, "fugir");

    expect(resultado.eventos).toEqual([
      { tipo: "fuga", sucesso: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
    ]);
    expect(resultado.fim).toBeNull();
    expect(resultado.estado.jogador.hp).toBe(93);
  });

  it("aplica envenenamento no jogador quando o inimigo tem a habilidade e a chance acerta", () => {
    const inimigo = { ...inimigoBase(), habilidade: "envenenamento" };
    const estado = { jogador: jogadorBase(), inimigo, rodada: 0 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarRodada(estado, "atacar");

    expect(resultado.eventos).toEqual([
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
      { tipo: "envenenamento_aplicado", alvo: "jogador" },
    ]);
    expect(resultado.estado.jogador.status).toEqual([
      { tipo: "envenenamento", duracao: 3, dano: 5 },
    ]);
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- turno`
Expected: FAIL — `Cannot find module './turno.js'`.

- [x] **Step 3: Implementar `engine/combate/turno.js`**

```js
import { rand } from "./aleatorio.js";
import { resolverAtaqueJogador, resolverAtaqueInimigo } from "./calculoDano.js";
import {
  processarCuraXama,
  processarSangramentoDoTurno,
  processarEnvenenamentoDoTurno,
  aplicarEfeitoDaArmaAoAcertar,
} from "./efeitosDeStatus.js";
import {
  verificarAtaqueDuplo,
  verificarEnvenenamentoAoAtacar,
} from "./habilidadesInimigo.js";
import { concederRecompensaVitoria } from "./recompensas.js";

export function executarRodada(estado, acao) {
  const { jogador, inimigo } = estado;
  const rodada = estado.rodada + 1;
  const eventos = [];

  // 1. Efeitos passivos de início de rodada
  const cura = processarCuraXama(jogador);
  if (cura && cura.curou) {
    eventos.push({ tipo: "cura_xama", valor: cura.valor });
  }

  const sangramento = processarSangramentoDoTurno(inimigo);
  if (sangramento) {
    eventos.push({
      tipo: "sangramento_tick",
      alvo: "inimigo",
      dano: sangramento.dano,
      curado: sangramento.curado,
    });
  }
  if (inimigo.hp <= 0) {
    eventos.push({ tipo: "morte", alvo: "inimigo" });
    const recompensa = concederRecompensaVitoria(jogador, inimigo);
    eventos.push({ tipo: "vitoria", ...recompensa });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "vitoria" };
  }

  const envenenamento = processarEnvenenamentoDoTurno(jogador);
  if (envenenamento) {
    eventos.push({
      tipo: "envenenamento_tick",
      alvo: "jogador",
      dano: envenenamento.dano,
      curado: envenenamento.curado,
    });
  }
  if (jogador.hp <= 0) {
    eventos.push({ tipo: "morte", alvo: "jogador" });
    eventos.push({ tipo: "derrota" });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "derrota" };
  }

  // 2. Ação do jogador
  if (acao === "fugir") {
    const sucesso = rand(1, 100) > 40;
    eventos.push({ tipo: "fuga", sucesso });
    if (sucesso) {
      return { estado: { jogador, inimigo, rodada }, eventos, fim: "fuga" };
    }
  } else {
    const ataque = resolverAtaqueJogador(jogador, inimigo);
    if (ataque.esquivou) {
      eventos.push({ tipo: "esquiva", autor: "inimigo" });
    } else {
      inimigo.hp = Math.max(0, inimigo.hp - ataque.dano);
      eventos.push({
        tipo: "dano",
        autor: "jogador",
        alvo: "inimigo",
        valor: ataque.dano,
        critico: ataque.critico,
      });

      const sangramentoAplicado = aplicarEfeitoDaArmaAoAcertar(jogador, inimigo);
      if (sangramentoAplicado) {
        eventos.push({
          tipo: "sangramento_aplicado",
          alvo: "inimigo",
          duracao: jogador.armaEquipada.efeito.duracao,
          danoPorTurno: jogador.armaEquipada.efeito.danoPorTurno,
        });
      }

      if (inimigo.hp <= 0) {
        eventos.push({ tipo: "morte", alvo: "inimigo" });
        const recompensa = concederRecompensaVitoria(jogador, inimigo);
        eventos.push({ tipo: "vitoria", ...recompensa });
        return { estado: { jogador, inimigo, rodada }, eventos, fim: "vitoria" };
      }
    }
  }

  // 3. Ação do inimigo
  if (verificarAtaqueDuplo(inimigo)) {
    const golpe1 = resolverAtaqueInimigo(inimigo, jogador);
    const golpe2 = resolverAtaqueInimigo(inimigo, jogador);
    const danoTotal =
      (golpe1.resultado === "dano" ? golpe1.dano : 0) +
      (golpe2.resultado === "dano" ? golpe2.dano : 0);
    jogador.hp = Math.max(0, jogador.hp - danoTotal);
    eventos.push({
      tipo: "ataque_duplo",
      autor: "inimigo",
      dano1: golpe1,
      dano2: golpe2,
      danoTotal,
    });
  } else {
    const golpe = resolverAtaqueInimigo(inimigo, jogador);
    if (golpe.resultado === "esquiva") {
      eventos.push({ tipo: "esquiva", autor: "jogador" });
    } else if (golpe.resultado === "bloqueio") {
      eventos.push({ tipo: "bloqueio", autor: "jogador" });
    } else {
      jogador.hp = Math.max(0, jogador.hp - golpe.dano);
      eventos.push({
        tipo: "dano",
        autor: "inimigo",
        alvo: "jogador",
        valor: golpe.dano,
        critico: false,
      });
      if (verificarEnvenenamentoAoAtacar(inimigo, jogador)) {
        eventos.push({ tipo: "envenenamento_aplicado", alvo: "jogador" });
      }
    }
  }

  if (jogador.hp <= 0) {
    eventos.push({ tipo: "morte", alvo: "jogador" });
    eventos.push({ tipo: "derrota" });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "derrota" };
  }

  return { estado: { jogador, inimigo, rodada }, eventos, fim: null };
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- turno`
Expected: PASS — 7 testes verdes.

- [x] **Step 5: Commit**

```bash
git add engine/combate/turno.js engine/combate/turno.test.js
git commit -m "feat: orquestração da rodada de combate (executarRodada)"
```

---

### Task 12: API pública do engine — `engine/combate/index.js` (TDD)

**Files:**
- Create: `engine/combate/index.js`
- Test: `engine/combate/index.test.js`

**Interfaces:**
- Consumes: `executarRodada` (Task 11).
- Produces: `criarEstadoBatalha(jogador, inimigo) -> estado`, `executarAcaoJogador(estado, acao) -> { estado, eventos, fim }` — API pública consumida pela Task 17 (`controladorBatalha.js`) via `@engine/combate/index.js`.

- [x] **Step 1: Escrever o teste `engine/combate/index.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { criarEstadoBatalha, executarAcaoJogador } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("criarEstadoBatalha", () => {
  it("inicializa o status do jogador e do inimigo como arrays vazios quando ausentes", () => {
    const jogador = { hp: 100 };
    const inimigo = { hp: 30 };
    const estado = criarEstadoBatalha(jogador, inimigo);
    expect(estado.jogador.status).toEqual([]);
    expect(estado.inimigo.status).toEqual([]);
    expect(estado.rodada).toBe(0);
  });

  it("não compartilha a referência do array de status do inimigo com o objeto original", () => {
    const inimigoOriginal = { hp: 30, status: [] };
    const estado = criarEstadoBatalha({ hp: 100 }, inimigoOriginal);
    estado.inimigo.status.push({ tipo: "sangramento", duracao: 1, dano: 1 });
    expect(inimigoOriginal.status).toEqual([]);
  });
});

describe("executarAcaoJogador", () => {
  it("delega para a execução de uma rodada e retorna eventos", () => {
    const jogador = {
      nivel: 0,
      ataque: 10,
      defesa: 5,
      hp: 100,
      hpMax: 100,
      equipamentos: {},
      bonusAtk: 0,
      bonusDef: 0,
      amuletoEquipado: false,
      armaEquipada: null,
      bonusClasse: {},
      bonusRaca: {},
      bonusCritico: 0,
      bonusEsquiva: 0,
      bonusBloqueio: 0,
      classe: "Guerreiro",
      xp: 0,
      ouro: 0,
    };
    const inimigo = {
      nome: "Orc",
      atk: 8,
      defesa: 3,
      hp: 30,
      hpMax: 30,
      xp: 15,
      ouro: 20,
      habilidade: null,
    };
    const estado = criarEstadoBatalha(jogador, inimigo);
    vi.spyOn(Math, "random").mockReturnValue(0);

    const resultado = executarAcaoJogador(estado, "atacar");

    expect(resultado.fim).toBeNull();
    expect(resultado.eventos.length).toBeGreaterThan(0);
    expect(resultado.estado.inimigo.hp).toBeLessThan(30);
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- combate/index`
Expected: FAIL — `Cannot find module './index.js'`.

- [x] **Step 3: Implementar `engine/combate/index.js`**

```js
import { executarRodada } from "./turno.js";

export function criarEstadoBatalha(jogador, inimigo) {
  if (!jogador.status) jogador.status = [];
  return {
    jogador,
    inimigo: { ...inimigo, status: inimigo.status ? [...inimigo.status] : [] },
    rodada: 0,
  };
}

export function executarAcaoJogador(estado, acao) {
  return executarRodada(estado, acao);
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- combate/index`
Expected: PASS — 3 testes verdes.

- [x] **Step 5: Rodar a suíte completa do engine para garantir que nada quebrou**

Run: `npm run test -- engine`
Expected: PASS — todos os testes de `engine/combate/*.test.js` verdes (aleatorio, calculoDano, efeitosDeStatus, habilidadesInimigo, recompensas, turno, index).

- [x] **Step 6: Commit**

```bash
git add engine/combate/index.js engine/combate/index.test.js
git commit -m "feat: API pública do engine de combate (criarEstadoBatalha, executarAcaoJogador)"
```

---

### Task 13: Organizar sprites do Soldado e do Orc

**Files:**
- Create: `WebRPG/assets/personagens/soldado/idle.png`, `ataque.png`, `dano.png`, `morte.png` (cópias)
- Create: `WebRPG/assets/personagens/orc/idle.png`, `ataque.png`, `dano.png`, `morte.png` (cópias)
- Modify: `WebRPG/assets/CREDITS.md`

**Interfaces:**
- Produces: sprite sheets em caminhos previsíveis (`/assets/personagens/<personagem>/<animacao>.png`) consumidos pela Task 14 (`sprites.js`). Cada sheet tem células de 100x100px: `idle.png` e `ataque.png` têm 6 quadros (600x100), `dano.png` e `morte.png` têm 4 quadros (400x100) — confirmado via inspeção das imagens de origem.

- [x] **Step 1: Copiar os sprites do Soldado**

```powershell
New-Item -ItemType Directory -Force -Path "WebRPG\assets\personagens\soldado" | Out-Null
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Soldier\Soldier\Soldier-Idle.png" "WebRPG\assets\personagens\soldado\idle.png"
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Soldier\Soldier\Soldier-Attack01.png" "WebRPG\assets\personagens\soldado\ataque.png"
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Soldier\Soldier\Soldier-Hurt.png" "WebRPG\assets\personagens\soldado\dano.png"
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Soldier\Soldier\Soldier-Death.png" "WebRPG\assets\personagens\soldado\morte.png"
```

- [x] **Step 2: Copiar os sprites do Orc**

```powershell
New-Item -ItemType Directory -Force -Path "WebRPG\assets\personagens\orc" | Out-Null
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Orc\Orc\Orc-Idle.png" "WebRPG\assets\personagens\orc\idle.png"
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Orc\Orc\Orc-Attack01.png" "WebRPG\assets\personagens\orc\ataque.png"
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Orc\Orc\Orc-Hurt.png" "WebRPG\assets\personagens\orc\dano.png"
Copy-Item "WebRPG\assets\Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc\Characters(100x100)\Orc\Orc\Orc-Death.png" "WebRPG\assets\personagens\orc\morte.png"
```

- [x] **Step 3: Verificar que os 8 arquivos existem**

Run: `ls WebRPG/assets/personagens/soldado WebRPG/assets/personagens/orc`
Expected: cada pasta lista `idle.png`, `ataque.png`, `dano.png`, `morte.png`.

- [x] **Step 4: Atualizar `WebRPG/assets/CREDITS.md`**

Editar a seção "Já no repositório" adicionando a linha:

```markdown
  Organizado em: `WebRPG/assets/personagens/soldado/` (idle, ataque, dano, morte) e `WebRPG/assets/personagens/orc/` (idle, ataque, dano, morte) — concluído na Task 13.
```

(substitui a linha "Organizado em: ..." que já existia como pendência).

- [x] **Step 5: Commit**

```bash
git add WebRPG/assets/personagens WebRPG/assets/CREDITS.md
git commit -m "feat: organizar sprites de Soldado e Orc para a tela de batalha"
```

---

### Task 14: Motor de animação de sprite (TDD) + CSS de batalha

**Files:**
- Create: `WebRPG/src/telas/batalha/sprites.js`
- Create: `WebRPG/src/estilos/batalha.css`
- Test: `WebRPG/src/telas/batalha/sprites.test.js`
- Modify: `WebRPG/src/main.js`

**Interfaces:**
- Produces: `definirSprite(elemento, personagem, nomeAnimacao)`, `tocarAnimacao(elemento, personagem, nomeAnimacao) -> Promise<void>` — usados pela Task 15 (`animacoes.js`). Classes CSS `.palco-batalha`, `.palco-batalha--tremendo`, `.combatente`, `.sprite`, `.sprite--tocando`, `.sprite--flash`, `.numero-dano`, `.numero-dano--critico` — usadas pelas Tasks 15 e 16.

- [x] **Step 1: Escrever o teste `WebRPG/src/telas/batalha/sprites.test.js`**

```js
import { describe, it, expect } from "vitest";
import { definirSprite, tocarAnimacao } from "./sprites.js";

describe("definirSprite", () => {
  it("define a imagem de fundo e as variáveis CSS de acordo com a animação", () => {
    const elemento = document.createElement("div");
    definirSprite(elemento, "soldado", "ataque");
    expect(elemento.style.backgroundImage).toBe(
      'url(/assets/personagens/soldado/ataque.png)'
    );
    expect(elemento.style.getPropertyValue("--sprite-frames")).toBe("6");
    expect(elemento.style.getPropertyValue("--sprite-duration")).toBe("0.6s");
  });

  it("lança erro para uma animação desconhecida", () => {
    const elemento = document.createElement("div");
    expect(() => definirSprite(elemento, "soldado", "voar")).toThrow(
      'Animação "voar" não existe.'
    );
  });
});

describe("tocarAnimacao", () => {
  it("resolve imediatamente para animações em loop (idle)", async () => {
    const elemento = document.createElement("div");
    await expect(tocarAnimacao(elemento, "soldado", "idle")).resolves.toBeUndefined();
  });

  it("aguarda o evento animationend para animações de disparo único", async () => {
    const elemento = document.createElement("div");
    const promessa = tocarAnimacao(elemento, "soldado", "ataque");
    elemento.dispatchEvent(new Event("animationend"));
    await expect(promessa).resolves.toBeUndefined();
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- sprites`
Expected: FAIL — `Cannot find module './sprites.js'`.

- [x] **Step 3: Implementar `WebRPG/src/telas/batalha/sprites.js`**

```js
const ANIMACOES = {
  idle: { frames: 6, duracao: 1.2, loop: "infinite" },
  ataque: { frames: 6, duracao: 0.6, loop: "1" },
  dano: { frames: 4, duracao: 0.4, loop: "1" },
  morte: { frames: 4, duracao: 0.8, loop: "1" },
};

export function definirSprite(elemento, personagem, nomeAnimacao) {
  const config = ANIMACOES[nomeAnimacao];
  if (!config) {
    throw new Error(`Animação "${nomeAnimacao}" não existe.`);
  }
  elemento.style.backgroundImage = `url(/assets/personagens/${personagem}/${nomeAnimacao}.png)`;
  elemento.style.setProperty("--sprite-frames", config.frames);
  elemento.style.setProperty("--sprite-duration", `${config.duracao}s`);
  elemento.style.setProperty("--sprite-loop", config.loop);
}

export function tocarAnimacao(elemento, personagem, nomeAnimacao) {
  definirSprite(elemento, personagem, nomeAnimacao);
  elemento.classList.remove("sprite--tocando");
  void elemento.offsetWidth; // força reflow para reiniciar a animação
  elemento.classList.add("sprite--tocando");

  const config = ANIMACOES[nomeAnimacao];
  if (config.loop === "infinite") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    elemento.addEventListener("animationend", () => resolve(), { once: true });
  });
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- sprites`
Expected: PASS — 4 testes verdes.

- [x] **Step 5: Criar `WebRPG/src/estilos/batalha.css`**

```css
.tela-batalha {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
}

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

.palco-batalha--tremendo {
  animation: tremor 0.3s ease-in-out;
}

@keyframes tremor {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-6px);
  }
  80% {
    transform: translateX(6px);
  }
}

.combatente {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--espaco-sm);
}

.painel-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 160px;
}

.nome-combatente {
  font-size: 14px;
}

.sprite {
  width: 100px;
  height: 100px;
  background-repeat: no-repeat;
  background-size: auto 100%;
  transform: scale(2.4);
  transform-origin: bottom center;
}

@keyframes sprite-play {
  from {
    background-position-x: 0;
  }
  to {
    background-position-x: calc(var(--sprite-frames) * -100px);
  }
}

.sprite--tocando {
  animation-name: sprite-play;
  animation-timing-function: steps(var(--sprite-frames));
  animation-duration: var(--sprite-duration, 0.6s);
  animation-iteration-count: var(--sprite-loop, 1);
}

.sprite--flash {
  animation: flash-dano 0.25s ease-in-out;
}

@keyframes flash-dano {
  0%,
  100% {
    filter: none;
  }
  50% {
    filter: brightness(3) saturate(0);
  }
}

.numero-dano {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--fonte-pixel);
  font-size: 18px;
  color: var(--cor-perigo);
  pointer-events: none;
  animation: subir-e-sumir 0.9s ease-out forwards;
}

.numero-dano--critico {
  color: var(--cor-destaque);
  font-size: 26px;
}

@keyframes subir-e-sumir {
  0% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -40px);
  }
}

.log-batalha {
  max-height: 140px;
  overflow-y: auto;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.barra-acoes {
  display: flex;
  gap: var(--espaco-sm);
  padding: var(--espaco-md);
  justify-content: center;
}
```

- [x] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

Adicionar a linha abaixo do bloco de imports de estilo existente em `WebRPG/src/main.js`:

```js
import "./estilos/batalha.css";
```

- [x] **Step 7: Commit**

```bash
git add WebRPG/src/telas/batalha/sprites.js WebRPG/src/telas/batalha/sprites.test.js WebRPG/src/estilos/batalha.css WebRPG/src/main.js
git commit -m "feat: motor de animação de sprite e CSS da tela de batalha"
```

---

### Task 15: Fila de eventos -> animação — `animacoes.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/batalha/animacoes.js`
- Test: `WebRPG/src/telas/batalha/animacoes.test.js`

**Interfaces:**
- Consumes: `tocarAnimacao` (Task 14).
- Produces: `reproduzirEventos(eventos, elementos) -> Promise<void>`, onde `elementos = { palco, spriteJogador, spriteInimigo, combatenteJogador, combatenteInimigo }` — usado pela Task 17 (`controladorBatalha.js`). Consome exatamente os tipos de evento emitidos por `executarRodada` (Task 11): `dano`, `esquiva`, `bloqueio`, `sangramento_tick`, `envenenamento_tick`, `sangramento_aplicado`, `envenenamento_aplicado`, `cura_xama`, `morte`, `fuga`, `vitoria`, `derrota`.

- [x] **Step 1: Escrever o teste `WebRPG/src/telas/batalha/animacoes.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { reproduzirEventos } from "./animacoes.js";

vi.mock("./sprites.js", () => ({
  tocarAnimacao: vi.fn(() => Promise.resolve()),
}));

function criarElementosDeTeste() {
  return {
    palco: document.createElement("div"),
    spriteJogador: document.createElement("div"),
    spriteInimigo: document.createElement("div"),
    combatenteJogador: document.createElement("div"),
    combatenteInimigo: document.createElement("div"),
  };
}

describe("reproduzirEventos", () => {
  it("mostra um número de dano no combatente alvo para eventos de dano", async () => {
    const elementos = criarElementosDeTeste();
    const eventos = [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
    ];

    await reproduzirEventos(eventos, elementos);

    expect(elementos.combatenteInimigo.querySelector(".numero-dano").textContent).toBe(
      "7"
    );
  });

  it("marca o número de dano como crítico quando o evento é crítico", async () => {
    const elementos = criarElementosDeTeste();
    const eventos = [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 14, critico: true },
    ];

    await reproduzirEventos(eventos, elementos);

    const numero = elementos.combatenteInimigo.querySelector(".numero-dano");
    expect(numero.classList.contains("numero-dano--critico")).toBe(true);
    expect(numero.textContent).toBe("14!");
  });

  it("processa múltiplos eventos em sequência sem lançar erro", async () => {
    const elementos = criarElementosDeTeste();
    const eventos = [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "sangramento_tick", alvo: "inimigo", dano: 4, curado: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 5, critico: false },
    ];

    await expect(reproduzirEventos(eventos, elementos)).resolves.toBeUndefined();
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- animacoes`
Expected: FAIL — `Cannot find module './animacoes.js'`.

- [x] **Step 3: Implementar `WebRPG/src/telas/batalha/animacoes.js`**

```js
import { tocarAnimacao } from "./sprites.js";

function mostrarNumeroDano(elementoCombatente, valor, critico) {
  const numero = document.createElement("div");
  numero.className = critico ? "numero-dano numero-dano--critico" : "numero-dano";
  numero.textContent = critico ? `${valor}!` : `${valor}`;
  elementoCombatente.appendChild(numero);
  setTimeout(() => numero.remove(), 900);
}

function tremerPalco(elementoPalco) {
  elementoPalco.classList.remove("palco-batalha--tremendo");
  void elementoPalco.offsetWidth;
  elementoPalco.classList.add("palco-batalha--tremendo");
}

function flashDano(elementoSprite) {
  elementoSprite.classList.remove("sprite--flash");
  void elementoSprite.offsetWidth;
  elementoSprite.classList.add("sprite--flash");
}

const espera = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function reproduzirEventos(eventos, elementos) {
  const { spriteJogador, spriteInimigo, combatenteJogador, combatenteInimigo, palco } =
    elementos;

  for (const evento of eventos) {
    switch (evento.tipo) {
      case "dano": {
        const alvoSprite = evento.alvo === "inimigo" ? spriteInimigo : spriteJogador;
        const alvoCombatente =
          evento.alvo === "inimigo" ? combatenteInimigo : combatenteJogador;
        const autorSprite = evento.autor === "jogador" ? spriteJogador : spriteInimigo;
        const personagemAutor = evento.autor === "jogador" ? "soldado" : "orc";
        const personagemAlvo = evento.alvo === "jogador" ? "soldado" : "orc";

        await tocarAnimacao(autorSprite, personagemAutor, "ataque");
        flashDano(alvoSprite);
        mostrarNumeroDano(alvoCombatente, evento.valor, evento.critico);
        if (evento.critico) tremerPalco(palco);
        await tocarAnimacao(alvoSprite, personagemAlvo, "dano");
        break;
      }
      case "esquiva":
      case "bloqueio":
        await espera(400);
        break;
      case "sangramento_tick":
      case "envenenamento_tick": {
        const alvoCombatente =
          evento.alvo === "inimigo" ? combatenteInimigo : combatenteJogador;
        mostrarNumeroDano(alvoCombatente, evento.dano, false);
        await espera(400);
        break;
      }
      case "cura_xama":
      case "sangramento_aplicado":
      case "envenenamento_aplicado":
        await espera(300);
        break;
      case "morte": {
        const personagem = evento.alvo === "jogador" ? "soldado" : "orc";
        const sprite = evento.alvo === "jogador" ? spriteJogador : spriteInimigo;
        await tocarAnimacao(sprite, personagem, "morte");
        break;
      }
      case "fuga":
      case "vitoria":
      case "derrota":
        await espera(500);
        break;
      default:
        break;
    }
  }
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- animacoes`
Expected: PASS — 3 testes verdes.

- [x] **Step 5: Commit**

```bash
git add WebRPG/src/telas/batalha/animacoes.js WebRPG/src/telas/batalha/animacoes.test.js
git commit -m "feat: fila de eventos para animação da batalha"
```

---

### Task 16: Estrutura DOM da tela de batalha — `telaBatalha.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/batalha/telaBatalha.js`
- Test: `WebRPG/src/telas/batalha/telaBatalha.test.js`

**Interfaces:**
- Produces: `montarTelaBatalha(container, { jogador, inimigo }) -> elementos`, `atualizarBarras(elementos, jogador, inimigo)`, `registrarNoLog(elementos, mensagem)` — usados pela Task 17 (`controladorBatalha.js`). `elementos` inclui: `palco`, `combatenteJogador`, `combatenteInimigo`, `spriteJogador`, `spriteInimigo`, `barraHpJogador`, `barraHpInimigo`, `log`, `botaoAtacar`, `botaoFugir`.

- [x] **Step 1: Escrever o teste `WebRPG/src/telas/batalha/telaBatalha.test.js`**

```js
import { describe, it, expect } from "vitest";
import { montarTelaBatalha, atualizarBarras, registrarNoLog } from "./telaBatalha.js";

function criarFixtures() {
  return {
    jogador: { nome: "Herói", hp: 80, hpMax: 100 },
    inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
  };
}

describe("montarTelaBatalha", () => {
  it("renderiza os nomes dos dois combatentes", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    montarTelaBatalha(container, { jogador, inimigo });
    const nomes = [...container.querySelectorAll(".nome-combatente")].map(
      (el) => el.textContent
    );
    expect(nomes).toEqual(["Herói", "Orc"]);
  });

  it("renderiza os botões de ação atacar e fugir", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    montarTelaBatalha(container, { jogador, inimigo });
    expect(container.querySelector('[data-acao="atacar"]')).not.toBeNull();
    expect(container.querySelector('[data-acao="fugir"]')).not.toBeNull();
  });

  it("inicializa as barras de HP de acordo com o HP atual", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    expect(elementos.barraHpJogador.style.width).toBe("80%");
    expect(elementos.barraHpInimigo.style.width).toBe("50%");
  });
});

describe("atualizarBarras", () => {
  it("recalcula a largura das barras conforme o HP muda", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    jogador.hp = 20;
    atualizarBarras(elementos, jogador, inimigo);
    expect(elementos.barraHpJogador.style.width).toBe("20%");
  });

  it("nunca deixa a largura da barra abaixo de 0%", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    jogador.hp = -50;
    atualizarBarras(elementos, jogador, inimigo);
    expect(elementos.barraHpJogador.style.width).toBe("0%");
  });
});

describe("registrarNoLog", () => {
  it("adiciona uma linha de texto ao painel de log", () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = montarTelaBatalha(container, { jogador, inimigo });
    registrarNoLog(elementos, "Você causou 7 de dano.");
    expect(elementos.log.textContent).toContain("Você causou 7 de dano.");
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaBatalha`
Expected: FAIL — `Cannot find module './telaBatalha.js'`.

- [x] **Step 3: Implementar `WebRPG/src/telas/batalha/telaBatalha.js`**

```js
function criarCombatente(nome, classeSprite) {
  const wrapper = document.createElement("div");
  wrapper.className = "combatente";
  wrapper.innerHTML = `
    <div class="sprite" data-personagem="${classeSprite}"></div>
    <div class="painel-status">
      <strong class="nome-combatente">${nome}</strong>
      <div class="barra"><div class="barra__preenchimento barra__preenchimento--hp"></div></div>
    </div>
  `;
  return wrapper;
}

export function montarTelaBatalha(container, { jogador, inimigo }) {
  container.innerHTML = `
    <div class="tela-batalha">
      <div class="palco-batalha"></div>
      <div class="painel log-batalha" aria-live="polite"></div>
      <div class="barra-acoes">
        <button class="botao botao--destaque" data-acao="atacar">Atacar</button>
        <button class="botao" data-acao="fugir">Fugir</button>
      </div>
    </div>
  `;

  const palco = container.querySelector(".palco-batalha");
  const combatenteJogador = criarCombatente(jogador.nome || "Você", "soldado");
  const combatenteInimigo = criarCombatente(inimigo.nome, "orc");
  palco.appendChild(combatenteJogador);
  palco.appendChild(combatenteInimigo);

  const elementos = {
    palco,
    combatenteJogador,
    combatenteInimigo,
    spriteJogador: combatenteJogador.querySelector(".sprite"),
    spriteInimigo: combatenteInimigo.querySelector(".sprite"),
    barraHpJogador: combatenteJogador.querySelector(".barra__preenchimento--hp"),
    barraHpInimigo: combatenteInimigo.querySelector(".barra__preenchimento--hp"),
    log: container.querySelector(".log-batalha"),
    botaoAtacar: container.querySelector('[data-acao="atacar"]'),
    botaoFugir: container.querySelector('[data-acao="fugir"]'),
  };

  atualizarBarras(elementos, jogador, inimigo);
  return elementos;
}

export function atualizarBarras(elementos, jogador, inimigo) {
  const percentualJogador = Math.max(0, Math.min(100, (jogador.hp / jogador.hpMax) * 100));
  const percentualInimigo = Math.max(0, Math.min(100, (inimigo.hp / inimigo.hpMax) * 100));
  elementos.barraHpJogador.style.width = `${percentualJogador}%`;
  elementos.barraHpInimigo.style.width = `${percentualInimigo}%`;
}

export function registrarNoLog(elementos, mensagem) {
  const linha = document.createElement("p");
  linha.textContent = mensagem;
  elementos.log.appendChild(linha);
  elementos.log.scrollTop = elementos.log.scrollHeight;
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaBatalha`
Expected: PASS — 6 testes verdes.

- [x] **Step 5: Commit**

```bash
git add WebRPG/src/telas/batalha/telaBatalha.js WebRPG/src/telas/batalha/telaBatalha.test.js
git commit -m "feat: estrutura DOM da tela de batalha"
```

---

### Task 17: Integração final — `controladorBatalha.js` e boot jogável (TDD + verificação manual)

**Files:**
- Create: `WebRPG/src/telas/batalha/controladorBatalha.js`
- Test: `WebRPG/src/telas/batalha/controladorBatalha.test.js`
- Modify: `WebRPG/src/main.js`

**Interfaces:**
- Consumes: `criarEstadoBatalha`, `executarAcaoJogador` (`@engine/combate/index.js`, Task 12); `montarTelaBatalha`, `atualizarBarras`, `registrarNoLog` (Task 16); `reproduzirEventos` (Task 15).
- Produces: `iniciarBatalha(container, jogador, inimigo) -> elementos` (com `elementos.executarAcao` exposto para testes e reuso), registrado no roteador como a tela padrão de boot desta fase.

- [x] **Step 1: Escrever o teste `WebRPG/src/telas/batalha/controladorBatalha.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { iniciarBatalha } from "./controladorBatalha.js";

vi.mock("@engine/combate/index.js", () => ({
  criarEstadoBatalha: (jogador, inimigo) => ({ jogador, inimigo, rodada: 0 }),
  executarAcaoJogador: (estado) => ({
    estado: {
      ...estado,
      jogador: { ...estado.jogador, hp: 93 },
      inimigo: { ...estado.inimigo, hp: 23 },
    },
    eventos: [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 7, critico: false },
      { tipo: "dano", autor: "inimigo", alvo: "jogador", valor: 7, critico: false },
    ],
    fim: null,
  }),
}));

vi.mock("./animacoes.js", () => ({
  reproduzirEventos: vi.fn(() => Promise.resolve()),
}));

function criarFixtures() {
  return {
    jogador: { nome: "Herói", hp: 100, hpMax: 100 },
    inimigo: { nome: "Orc", hp: 30, hpMax: 30 },
  };
}

describe("iniciarBatalha", () => {
  it("atualiza o log após executar a ação atacar", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await elementos.executarAcao("atacar");

    expect(elementos.log.textContent).toContain("Você causou 7 de dano.");
  });

  it("atualiza as barras de HP após executar a ação atacar", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await elementos.executarAcao("atacar");

    expect(elementos.barraHpJogador.style.width).toBe("93%");
    expect(elementos.barraHpInimigo.style.width).toBe(
      `${(23 / 30) * 100}%`
    );
  });

  it("reabilita os botões de ação após processar a rodada", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await elementos.executarAcao("atacar");

    expect(elementos.botaoAtacar.disabled).toBe(false);
    expect(elementos.botaoFugir.disabled).toBe(false);
  });
});
```

- [x] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- controladorBatalha`
Expected: FAIL — `Cannot find module './controladorBatalha.js'`.

- [x] **Step 3: Implementar `WebRPG/src/telas/batalha/controladorBatalha.js`**

```js
import { criarEstadoBatalha, executarAcaoJogador } from "@engine/combate/index.js";
import { montarTelaBatalha, atualizarBarras, registrarNoLog } from "./telaBatalha.js";
import { reproduzirEventos } from "./animacoes.js";

function descreverEvento(evento) {
  switch (evento.tipo) {
    case "dano":
      return evento.critico
        ? `Golpe crítico! Causou ${evento.valor} de dano.`
        : `${evento.autor === "jogador" ? "Você causou" : "O inimigo causou"} ${evento.valor} de dano.`;
    case "esquiva":
      return evento.autor === "inimigo"
        ? "O inimigo esquivou do seu ataque!"
        : "Você esquivou do ataque!";
    case "bloqueio":
      return "Você bloqueou o ataque!";
    case "sangramento_tick":
      return `O inimigo sangra e perde ${evento.dano} HP.`;
    case "envenenamento_tick":
      return `Você sofre ${evento.dano} de dano por veneno.`;
    case "sangramento_aplicado":
      return "Seu ataque causou sangramento no inimigo!";
    case "envenenamento_aplicado":
      return "O ataque do inimigo te envenenou!";
    case "cura_xama":
      return evento.valor > 0 ? `Sua conexão Xamã restaurou ${evento.valor} HP!` : null;
    case "fuga":
      return evento.sucesso ? "Você fugiu com sucesso!" : "A fuga falhou!";
    case "vitoria":
      return `Vitória! +${evento.xpGanho} XP, +${evento.ouroGanho} ouro.`;
    case "derrota":
      return "Você foi derrotado...";
    default:
      return null;
  }
}

export function iniciarBatalha(container, jogador, inimigoOriginal) {
  let estado = criarEstadoBatalha(jogador, inimigoOriginal);
  const elementos = montarTelaBatalha(container, {
    jogador: estado.jogador,
    inimigo: estado.inimigo,
  });

  let processando = false;

  async function executar(acao) {
    if (processando || estado.fim) return;
    processando = true;
    elementos.botaoAtacar.disabled = true;
    elementos.botaoFugir.disabled = true;

    const resultado = executarAcaoJogador(estado, acao);
    estado = { ...resultado.estado, fim: resultado.fim };

    await reproduzirEventos(resultado.eventos, elementos);
    atualizarBarras(elementos, estado.jogador, estado.inimigo);

    for (const evento of resultado.eventos) {
      const mensagem = descreverEvento(evento);
      if (mensagem) registrarNoLog(elementos, mensagem);
    }

    processando = false;
    if (!resultado.fim) {
      elementos.botaoAtacar.disabled = false;
      elementos.botaoFugir.disabled = false;
    }
  }

  elementos.botaoAtacar.addEventListener("click", () => executar("atacar"));
  elementos.botaoFugir.addEventListener("click", () => executar("fugir"));

  return { ...elementos, executarAcao: executar };
}
```

- [x] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- controladorBatalha`
Expected: PASS — 3 testes verdes.

- [x] **Step 5: Atualizar `WebRPG/src/main.js` para iniciar a batalha de demonstração Soldado vs Orc**

Substituir o conteúdo de `WebRPG/src/main.js` por:

```js
import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import "./estilos/batalha.css";
import { inicializarRoteador, registrarTela, mostrarTela } from "./rotas/roteador.js";
import { montarTelaInicial } from "./telas/inicial.js";
import { iniciarBatalha } from "./telas/batalha/controladorBatalha.js";

const jogadorDeTeste = {
  nome: "Soldado",
  nivel: 3,
  ataque: 12,
  defesa: 6,
  hp: 100,
  hpMax: 100,
  xp: 0,
  ouro: 0,
  classe: "Guerreiro",
  equipamentos: {},
  armaEquipada: {
    nome: "Adaga Sombria",
    atk: 2,
    efeito: { tipo: "sangramento", chance: 60, duracao: 3, danoPorTurno: 4 },
  },
  bonusClasse: {},
  bonusRaca: {},
  bonusCritico: 10,
  bonusEsquiva: 0,
  bonusBloqueio: 0,
  bonusAtk: 0,
  bonusDef: 0,
  status: [],
};

const orcDeTeste = {
  nome: "Orc",
  atk: 9,
  defesa: 3,
  hp: 40,
  hpMax: 40,
  xp: 18,
  ouro: 15,
  habilidade: "envenenamento",
  status: [],
};

const app = document.getElementById("app");
inicializarRoteador(app);
registrarTela("inicial", montarTelaInicial);
registrarTela("batalha", (container) => iniciarBatalha(container, jogadorDeTeste, orcDeTeste));
mostrarTela("batalha");
```

- [x] **Step 6: Rodar a suíte completa de testes**

Run: `npm run test`
Expected: PASS — todos os testes de `engine/**` e `WebRPG/src/**` verdes (aproximadamente 45 testes no total desta Fase 1).

- [x] **Step 7: Verificação manual jogável (critério de pronto da Fase 1)**

Run: `npm run dev`

No navegador, confirmar:
1. A tela de batalha carrega mostrando o Soldado (esquerda) e o Orc (dano em "Orc", direita) com sprites idle animados, barras de HP cheias e o log vazio.
2. Clicar em "Atacar" repetidamente: o soldado anima o golpe, o Orc pisca e recebe um número de dano flutuante, a barra de HP do Orc diminui, e o log registra a mensagem. Em seguida o Orc revida, a barra de HP do jogador diminui e o log registra a mensagem.
3. Em algum acerto (chance de 60%), o log mostra "Seu ataque causou sangramento no inimigo!" — nas rodadas seguintes, a barra de HP do Orc some cai também no início do turno, com o log mostrando "O inimigo sangra e perde 4 HP.".
4. Em algum ataque do Orc (chance de 20%), o log mostra "O ataque do inimigo te envenenou!" — nas rodadas seguintes, a barra de HP do jogador cai no início do turno, com o log mostrando "Você sofre 5 de dano por veneno.".
5. Ao zerar o HP do Orc, o log mostra "Vitória! +N XP, +N ouro." e os botões ficam desabilitados. Ao recarregar a página (F5) uma nova batalha começa (sem persistência — save é Fase 2).
6. Se o HP do jogador zerar primeiro, o log mostra "Você foi derrotado..." e os botões ficam desabilitados.

- [x] **Step 8: Commit**

```bash
git add WebRPG/src/telas/batalha/controladorBatalha.js WebRPG/src/telas/batalha/controladorBatalha.test.js WebRPG/src/main.js
git commit -m "feat: integração final da batalha jogável Soldado vs Orc"
```

---

## Resumo do que fica pronto ao final deste plano

- `npm run dev` abre uma batalha Soldado vs Orc completa e jogável em pixel art, com sprites animados (idle/ataque/dano/morte), números de dano flutuantes, tremor de tela em crítico, barras de HP animadas, log de combate, sangramento e envenenamento funcionando visualmente — o critério de pronto da Fase 1 da spec.
- `engine/combate/` é um módulo puro e 100% testado (Vitest), pronto para ser estendido nas próximas fases (Poção/Itens, Necromante, mais habilidades de inimigo, drops, level up) sem tocar na UI.
- O console (`JogoRPG/`) permanece intacto e funcional.
- A base para a Fase 2 (Identidade: criação de personagem, cidade, save) já tem roteador, design system e estrutura de assets prontos.
