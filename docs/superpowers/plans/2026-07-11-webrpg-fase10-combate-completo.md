# WebRPG Fase 10 — Combate Completo & Masmorras Selecionáveis — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar os achados #1, #2, #3 e #6 da spec seção 12.1 (`docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`): a barra de ações da batalha ganha **Item** e **Defender** (hoje só existem Atacar/Fugir — a spec 4.3 pede 5 ações desde 2026-07-08), a **Poção de Cura finalmente vira utilizável** (hoje é comprável, ganhável em missão e roubável como penalidade de masmorra, mas nenhum código permite bebê-la), efeitos de status ganham a **fileira de ícones com tooltip** prometida na spec 4.1 #2, e os **10 templates de masmorra viram selecionáveis** (pendência anotada na Fase 8 Task 2 — a UI trava em `templatesMasmorra[0]`).

**Architecture:** As duas ações novas entram no motor de turno existente (`engine/combate/turno.js`, `executarRodada(estado, acao)`) como novos ramos do bloco "2. Ação do jogador" — mesma extensão aditiva que a Fase 4 fez ao adicionar paralisia/invulnerável. A contabilidade de poção ganha uma API única (`engine/itens/pocao.js`) que resolve a **dupla contabilidade** achada na pesquisa: a loja põe a poção como objeto em `jogador.inventario` (fiel ao console), mas `engine/missoes/index.js:71` põe a string `"Poção de Cura"` em `jogador.itens` — a API conta e consome das duas fontes, sem migração de dados de save (saves existentes continuam válidos). Ícones de status são spans com classe + `title` (tooltip nativo) renderizados a partir dos arrays `status` que o motor já mantém — zero mudança no motor.

**Tech Stack:** Mesmo stack — Vite/vanilla JS, Vitest + jsdom. Nenhum asset novo obrigatório (ícones de status usam glifos de texto estilizados; ver justificativa na Task 4).

## Global Constraints

- `executarRodada(estado, acao)` continua aceitando as ações antigas sem mudança de comportamento — `"atacar"` e `"fugir"` têm exatamente os mesmos eventos/resultados de antes (os testes existentes de `turno.test.js` passam sem edição).
- Correções de spec da seção 12.2 valem aqui: **sem MP** (nunca existiu no jogo) e **sem botão "Habilidade"** (habilidades de classe são passivas por chance). A barra final tem 4 ações: Atacar · Item · Defender · Fugir.
- Fórmula da poção **fiel ao console**: cura `rand(floor(hpMax*0.20), floor(hpMax*0.30))` — confirmado em `JogoRPG/itens/pocaoCura.js:54-55` e no texto da loja do console ("Cada poção restaura entre 20% - 30% da sua vida máxima", `JogoRPG/loja/loja.js:245`).
- **Defender é uma formalização web documentada**, não um porte: o console não tem ação de defender (o menu de batalha do console é atacar/poção/fugir), mas a spec 4.3 exige o botão desde a versão original. Definição adotada: defender pula o ataque do jogador e reduz à metade (arredondando para baixo) todo dano que o inimigo causar nesta rodada. Mesmo padrão de decisão documentada das fases anteriores (ex. Fase 4, correção #3).
- **Dependência de ordem entre fases: Task 5 requer a Fase 8 já executada.** O teste da Task 5 (`expect(container.querySelectorAll("[data-template]")).toHaveLength(10)`) assume que `templatesMasmorra` já tem os 10 templates — só verdade depois que a Fase 8 (`docs/superpowers/plans/2026-07-11-webrpg-fase8-bestiario-completo.md`, Task 2) rodar. Se a Fase 10 for executada antes da Fase 8, ajustar a asserção para o número real de templates no momento (`templatesMasmorra.length`, não um literal `10`) e re-fazer a asserção quando a Fase 8 rodar depois — ou, preferencialmente, simplesmente executar a Fase 8 primeiro.
- Rodar `npm test` (raiz do repo) depois de cada task.

---

### Task 1: API única de poção — `engine/itens/pocao.js` (TDD)

**Files:**
- Create: `engine/itens/pocao.js`
- Create: `engine/itens/pocao.test.js`

**Interfaces:**
- Produces: `contarPocoes(jogador) → number` (soma objetos `{nome: "Poção de Cura"}` em `jogador.inventario` + strings `"Poção de Cura"` em `jogador.itens`), `consumirPocao(jogador) → boolean` (remove UMA poção — de `itens` primeiro, depois de `inventario`; retorna `false` sem mutação se não houver nenhuma), `usarPocaoDeCura(jogador) → {usou: boolean, cura: number}` (consome + cura `rand(floor(hpMax*0.20), floor(hpMax*0.30))` capado em `hpMax`).
- Consumes: `rand` de `@engine/combate/aleatorio.js` (existente).

- [ ] **Step 1: Escrever o teste `engine/itens/pocao.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { contarPocoes, consumirPocao, usarPocaoDeCura } from "./pocao.js";

afterEach(() => vi.restoreAllMocks());

describe("contarPocoes", () => {
  it("soma as duas contabilidades: objetos no inventario e strings em itens", () => {
    const jogador = {
      inventario: [{ nome: "Poção de Cura", slot: "consumable" }, { nome: "Espada Longa", slot: "weapon" }],
      itens: ["Poção de Cura", "Pena do Corvo Sombrio"],
    };
    expect(contarPocoes(jogador)).toBe(2);
  });

  it("retorna 0 quando não há nenhuma poção", () => {
    expect(contarPocoes({ inventario: [], itens: [] })).toBe(0);
  });
});

describe("consumirPocao", () => {
  it("remove primeiro da lista itens (strings), preservando o resto", () => {
    const jogador = {
      inventario: [{ nome: "Poção de Cura", slot: "consumable" }],
      itens: ["Poção de Cura", "Pena do Corvo Sombrio"],
    };
    expect(consumirPocao(jogador)).toBe(true);
    expect(jogador.itens).toEqual(["Pena do Corvo Sombrio"]);
    expect(jogador.inventario).toHaveLength(1);
  });

  it("remove do inventario quando itens não tem poção", () => {
    const jogador = {
      inventario: [{ nome: "Poção de Cura", slot: "consumable" }],
      itens: [],
    };
    expect(consumirPocao(jogador)).toBe(true);
    expect(jogador.inventario).toEqual([]);
  });

  it("retorna false sem mutar nada quando não há poção", () => {
    const jogador = { inventario: [], itens: [] };
    expect(consumirPocao(jogador)).toBe(false);
  });
});

describe("usarPocaoDeCura", () => {
  it("cura entre 20% e 30% do hpMax (fiel ao console), capado no hpMax", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(min,max) = min
    const jogador = { hp: 50, hpMax: 100, inventario: [], itens: ["Poção de Cura"] };
    expect(usarPocaoDeCura(jogador)).toEqual({ usou: true, cura: 20 }); // floor(100*0.20)
    expect(jogador.hp).toBe(70);
    expect(jogador.itens).toEqual([]);
  });

  it("não deixa o hp passar do hpMax", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999); // rand(min,max) = max
    const jogador = { hp: 95, hpMax: 100, inventario: [], itens: ["Poção de Cura"] };
    const resultado = usarPocaoDeCura(jogador);
    expect(resultado.usou).toBe(true);
    expect(jogador.hp).toBe(100);
  });

  it("retorna {usou: false, cura: 0} sem poções", () => {
    const jogador = { hp: 50, hpMax: 100, inventario: [], itens: [] };
    expect(usarPocaoDeCura(jogador)).toEqual({ usou: false, cura: 0 });
    expect(jogador.hp).toBe(50);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- itens/pocao`
Expected: FAIL — `Failed to resolve import "./pocao.js"`.

- [ ] **Step 3: Implementar `engine/itens/pocao.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";

const NOME_POCAO = "Poção de Cura";

// A loja guarda a poção como objeto em jogador.inventario (fiel ao console);
// as missões premiam com a string "Poção de Cura" em jogador.itens (divergência
// da Fase 3 nunca reconciliada). Esta API é a única porta de entrada para
// contar/consumir poções e enxerga as duas contabilidades — de propósito, para
// que saves existentes continuem valendo sem migração.
export function contarPocoes(jogador) {
  const noInventario = (jogador.inventario ?? []).filter(
    (item) => typeof item === "object" && item !== null && item.nome === NOME_POCAO
  ).length;
  const emItens = (jogador.itens ?? []).filter((item) => item === NOME_POCAO).length;
  return noInventario + emItens;
}

export function consumirPocao(jogador) {
  const indiceEmItens = (jogador.itens ?? []).indexOf(NOME_POCAO);
  if (indiceEmItens !== -1) {
    jogador.itens.splice(indiceEmItens, 1);
    return true;
  }
  const indiceNoInventario = (jogador.inventario ?? []).findIndex(
    (item) => typeof item === "object" && item !== null && item.nome === NOME_POCAO
  );
  if (indiceNoInventario !== -1) {
    jogador.inventario.splice(indiceNoInventario, 1);
    return true;
  }
  return false;
}

export function usarPocaoDeCura(jogador) {
  if (!consumirPocao(jogador)) {
    return { usou: false, cura: 0 };
  }
  const curaMin = Math.floor(jogador.hpMax * 0.2);
  const curaMax = Math.floor(jogador.hpMax * 0.3);
  const cura = rand(curaMin, curaMax);
  jogador.hp = Math.min(jogador.hpMax, jogador.hp + cura);
  return { usou: true, cura };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- itens/pocao`
Expected: PASS (8 testes).

- [ ] **Step 5: Commit**

```bash
git add engine/itens/pocao.js engine/itens/pocao.test.js
git commit -m "feat: API unica de pocao (conta/consome as duas contabilidades; cura 20-30% do hpMax, fiel ao console)"
```

---

### Task 2: Ações `usar_pocao` e `defender` no motor de turno (TDD)

**Files:**
- Modify: `engine/combate/turno.js`
- Modify: `engine/combate/turno.test.js`

**Interfaces:**
- Consumes: `usarPocaoDeCura` (Task 1).
- Produces: `executarRodada(estado, acao)` passa a aceitar `acao: "usar_pocao"` (novo evento `{tipo: "pocao_usada", valor}` ou `{tipo: "pocao_indisponivel"}`) e `acao: "defender"` (novo evento `{tipo: "defendendo"}`; todo dano do inimigo nesta rodada é reduzido à metade, `floor(dano/2)`). Nas duas ações o jogador não ataca — gastar o turno é o custo da ação, mesma lógica do console para a poção.

- [ ] **Step 1: Adicionar os testes ao final de `engine/combate/turno.test.js`**

(Usar os helpers `jogadorBase()`/`inimigoBase()` que o arquivo já tem — conferir os nomes exatos antes, e incluir `itens: []`/`inventario: []` no jogador do teste se o helper não tiver.)

```js
describe("executarRodada com ação usar_pocao", () => {
  it("bebe a poção, cura, não ataca, e o inimigo revida normalmente", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const jogador = { ...jogadorBase(), hp: 40, hpMax: 100, itens: ["Poção de Cura"], inventario: [] };
    const estado = { jogador, inimigo: inimigoBase(), rodada: 0 };

    const resultado = executarRodada(estado, "usar_pocao");

    const eventoPocao = resultado.eventos.find((e) => e.tipo === "pocao_usada");
    expect(eventoPocao).toBeDefined();
    expect(eventoPocao.valor).toBeGreaterThanOrEqual(20);
    expect(eventoPocao.valor).toBeLessThanOrEqual(30);
    expect(jogador.itens).toEqual([]);
    // o jogador não atacou
    expect(resultado.eventos.some((e) => e.tipo === "dano" && e.autor === "jogador")).toBe(false);
    // o inimigo agiu normalmente
    expect(resultado.eventos.some((e) => e.autor === "inimigo" || e.alvo === "jogador")).toBe(true);
  });

  it("sem poção: emite pocao_indisponivel e não gasta nada", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const jogador = { ...jogadorBase(), hp: 40, hpMax: 100, itens: [], inventario: [] };
    const estado = { jogador, inimigo: inimigoBase(), rodada: 0 };

    const resultado = executarRodada(estado, "usar_pocao");

    expect(resultado.eventos.some((e) => e.tipo === "pocao_indisponivel")).toBe(true);
    expect(jogador.hp).toBe(40);
  });
});

describe("executarRodada com ação defender", () => {
  it("emite defendendo e reduz o dano do inimigo à metade", () => {
    // Primeiro mede o dano sem defender, com o mesmo mock de random,
    // para comparar com o dano defendido — evita acoplar o teste à fórmula.
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const estadoSem = { jogador: { ...jogadorBase(), hp: 500, hpMax: 500 }, inimigo: inimigoBase(), rodada: 0 };
    const semDefesa = executarRodada(estadoSem, "defender_MEDICAO_atacar_nao_use"); // ação desconhecida cai no ramo de ataque
    // ...na prática: rodar com "atacar" e capturar evento de dano do inimigo:
    const danoSemDefesa = 0; // ver Step 3 — o teste real compara dois runs com "atacar" vs "defender"

    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const jogador = { ...jogadorBase(), hp: 500, hpMax: 500 };
    const estado = { jogador, inimigo: inimigoBase(), rodada: 0 };

    const resultado = executarRodada(estado, "defender");

    expect(resultado.eventos.some((e) => e.tipo === "defendendo")).toBe(true);
    expect(resultado.eventos.some((e) => e.tipo === "dano" && e.autor === "jogador")).toBe(false);
  });
});
```

**Nota para o executor:** o teste de "reduz à metade" acima está esboçado — escrever a versão final comparando dois `executarRodada` com o mesmo mock de `Math.random` (um `"atacar"`, um `"defender"`, estados independentes mas idênticos) e assertar `danoDefendido === Math.floor(danoNormal / 2)` no evento `{tipo: "dano", autor: "inimigo"}`. Não hardcodar o valor absoluto do dano — a fórmula de `resolverAtaqueInimigo` tem `rand` interno e o teste ficaria frágil.

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- combate/turno`
Expected: FAIL — `pocao_usada`/`defendendo` nunca são emitidos.

- [ ] **Step 3: Implementar em `engine/combate/turno.js`**

Adicionar o import:

```js
import { usarPocaoDeCura } from "@engine/itens/pocao.js";
```

No bloco "2. Ação do jogador", estender a cadeia de `else if` (depois do ramo de paralisia, antes do ramo de fuga):

```js
  // 2. Ação do jogador
  let defendendo = false;
  if (processarParalisiaDoTurno(jogador)) {
    eventos.push({ tipo: "paralisado", alvo: "jogador" });
  } else if (acao === "usar_pocao") {
    const resultado = usarPocaoDeCura(jogador);
    if (resultado.usou) {
      eventos.push({ tipo: "pocao_usada", valor: resultado.cura });
    } else {
      eventos.push({ tipo: "pocao_indisponivel" });
    }
  } else if (acao === "defender") {
    defendendo = true;
    eventos.push({ tipo: "defendendo", alvo: "jogador" });
  } else if (acao === "fugir") {
    // ...ramo existente, sem mudanças...
```

Na seção "3. Ação do inimigo", aplicar a redução em **todos** os pontos onde `jogador.hp` é decrementado (ataque duplo, contra-ataque e golpe normal). Padrão: envolver o dano numa função local definida logo antes da seção 3:

```js
  const aplicarDanoAoJogador = (dano) => {
    const danoFinal = defendendo ? Math.floor(dano / 2) : dano;
    jogador.hp = Math.max(0, jogador.hp - danoFinal);
    return danoFinal;
  };
```

E em cada ponto trocar `jogador.hp = Math.max(0, jogador.hp - X)` por `const danoAplicado = aplicarDanoAoJogador(X)` usando `danoAplicado` no evento correspondente (para o log/número de dano mostrar o valor realmente sofrido, não o valor pré-defesa).

- [ ] **Step 4: Rodar e confirmar sucesso, incluindo regressão**

Run: `npm test -- combate/turno`
Expected: PASS — todos os testes antigos + os novos (as ações `"atacar"`/`"fugir"` não passam por nenhum ramo novo; `defendendo` é `false` por padrão).

- [ ] **Step 5: Commit**

```bash
git add engine/combate/turno.js engine/combate/turno.test.js
git commit -m "feat: acoes usar_pocao e defender no motor de turno (spec 4.3 pedia desde a versao original)"
```

---

### Task 3: Barra de ações completa na UI da batalha

**Files:**
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js`

**Interfaces:**
- Consumes: `contarPocoes` (Task 1); as ações novas do motor (Task 2).
- Produces: `montarTelaBatalha` retorna também `botaoItem` e `botaoDefender` no objeto `elementos`; `descreverEvento` (em `controladorBatalha.js`) ganha os casos `pocao_usada`, `pocao_indisponivel` e `defendendo`.

- [ ] **Step 1: Testes que falham em `telaBatalha.test.js`**

```js
describe("barra de ações completa", () => {
  it("tem os 4 botões: atacar, item, defender, fugir", () => {
    const container = document.createElement("div");
    montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100, itens: ["Poção de Cura"], inventario: [] },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    for (const acao of ["atacar", "usar_pocao", "defender", "fugir"]) {
      expect(container.querySelector(`[data-acao="${acao}"]`)).not.toBeNull();
    }
  });

  it("o botão de item mostra a contagem de poções e desabilita com 0", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100, itens: [], inventario: [] },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(elementos.botaoItem.textContent).toContain("0");
    expect(elementos.botaoItem.disabled).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- telaBatalha`
Expected: FAIL.

- [ ] **Step 3: Implementar em `telaBatalha.js`**

Import: `import { contarPocoes } from "@engine/itens/pocao.js";`

Na `barra-acoes` do template, entre Atacar e Fugir:

```html
<button class="botao botao--destaque" data-acao="atacar">Atacar</button>
<button class="botao" data-acao="usar_pocao">🧪 Poção (0)</button>
<button class="botao" data-acao="defender">Defender</button>
<button class="botao" data-acao="fugir">Fugir</button>
```

No objeto `elementos`, adicionar `botaoItem: container.querySelector('[data-acao="usar_pocao"]')` e `botaoDefender: container.querySelector('[data-acao="defender"]')`. Criar e exportar (ou expor via `elementos`) uma função `atualizarBotaoItem(elementos, jogador)` que escreve `🧪 Poção (${contarPocoes(jogador)})` no botão e o desabilita quando a contagem é 0 — e chamá-la uma vez ao montar a tela.

- [ ] **Step 4: Ligar no `controladorBatalha.js`**

- Registrar os listeners novos ao lado dos existentes: `elementos.botaoItem.addEventListener("click", () => executar("usar_pocao"));` e o equivalente para `"defender"`.
- Na função `executar`, incluir os dois botões novos em **todos** os pontos que hoje habilitam/desabilitam `botaoAtacar`/`botaoFugir` (desabilitar os 4 ao iniciar o processamento; ao reabilitar, chamar `atualizarBotaoItem(elementos, estado.jogador)` em vez de reabilitar o botão de item incondicionalmente — para a contagem atualizar e o botão continuar desabilitado se a última poção foi bebida).
- Em `descreverEvento`, adicionar:

```js
    case "pocao_usada":
      return `🧪 Você bebeu uma Poção de Cura e recuperou ${evento.valor} HP!`;
    case "pocao_indisponivel":
      return "Você não tem nenhuma Poção de Cura!";
    case "defendendo":
      return "Você se põe em guarda — o próximo golpe causará metade do dano.";
```

- [ ] **Step 5: Rodar e confirmar sucesso**

Run: `npm test -- telaBatalha && npm test -- controladorBatalha`
Expected: PASS (os testes existentes de `controladorBatalha.test.js` seguem passando — os fixtures deles não têm `itens`/`inventario`, então `contarPocoes` retorna 0 via os fallbacks `?? []` da Task 1 e o botão só nasce desabilitado).

- [ ] **Step 6: Verificar manualmente**

Run: `npm run dev`. Comprar 2 poções na loja, entrar num treino: o botão mostra "(2)", beber uma cura HP visível na barra e a contagem cai para "(1)", Defender reduz o golpe seguinte (comparar números de dano no log), e com "(0)" o botão desabilita.

- [ ] **Step 7: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add WebRPG/src/telas/batalha
git commit -m "feat: barra de acoes completa na batalha (Atacar - Pocao - Defender - Fugir), pocao finalmente utilizavel"
```

---

### Task 4: Fileira de ícones de status com tooltip

**Files:**
- Create: `WebRPG/src/telas/batalha/iconesStatus.js`
- Create: `WebRPG/src/telas/batalha/iconesStatus.test.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js` (adicionar `<div class="icones-status">` a cada `painel-status` e expor os refs)
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js` (re-renderizar os ícones após cada rodada, junto de `atualizarBarras`)
- Modify: `WebRPG/src/estilos/batalha.css`

**Interfaces:**
- Produces: `renderizarIconesStatus(elemento, combatente)` — limpa e re-renderiza `elemento` com um `<span class="icone-status" title="...">` por efeito ativo em `combatente.status` (array `{tipo, duracao}` que o motor já mantém). Tooltip via atributo `title` nativo: `"<Nome>: <efeito> (<duracao> turno(s) restante(s))"`.

**Decisão documentada — glifos de texto, não PNGs:** os efeitos são poucos (veneno, sangramento, paralisia, invulnerável, defendendo) e o jogo já usa emojis pontuais na UI (🧪 na Task 3, mesmo padrão do console em `JogoRPG/icons.js`). Um span estilizado com glifo (`☠ 🩸 🕸 🛡 ⛨`) sobre chip escuro cumpre "ícone com tooltip" da spec 4.1 sem depender de mais um pack de asset — e se uma fase futura quiser trocar por pixel art, só o CSS/`ICONES_POR_TIPO` muda, não a estrutura.

- [ ] **Step 1: Escrever o teste `iconesStatus.test.js`**

```js
import { describe, it, expect } from "vitest";
import { renderizarIconesStatus } from "./iconesStatus.js";

describe("renderizarIconesStatus", () => {
  it("renderiza um ícone por efeito ativo, com tooltip de nome/efeito/turnos", () => {
    const el = document.createElement("div");
    renderizarIconesStatus(el, { status: [{ tipo: "envenenado", duracao: 2 }, { tipo: "paralisado", duracao: 1 }] });
    const icones = el.querySelectorAll(".icone-status");
    expect(icones).toHaveLength(2);
    expect(icones[0].title).toContain("Envenenado");
    expect(icones[0].title).toContain("2 turno");
  });

  it("limpa os ícones anteriores a cada re-render", () => {
    const el = document.createElement("div");
    renderizarIconesStatus(el, { status: [{ tipo: "envenenado", duracao: 2 }] });
    renderizarIconesStatus(el, { status: [] });
    expect(el.querySelectorAll(".icone-status")).toHaveLength(0);
  });

  it("um tipo desconhecido ganha o ícone genérico em vez de quebrar", () => {
    const el = document.createElement("div");
    renderizarIconesStatus(el, { status: [{ tipo: "efeito_de_fase_futura", duracao: 3 }] });
    expect(el.querySelectorAll(".icone-status")).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha, depois implementar `iconesStatus.js`**

Antes de escrever o catálogo, levantar os tipos reais que o motor põe nos arrays `status`: `grep -rn '"tipo:' engine/combate engine/` — a lista esperada da pesquisa é `envenenado`, `sangramento` (conferir o nome exato usado por `efeitosDeStatus.js`), `paralisado`, `invulneravel`; usar os nomes exatos encontrados como chaves.

```js
const ICONES_POR_TIPO = {
  envenenado: { glifo: "☠", nome: "Envenenado", efeito: "perde HP a cada turno" },
  sangramento: { glifo: "🩸", nome: "Sangrando", efeito: "perde HP a cada turno" },
  paralisado: { glifo: "🕸", nome: "Paralisado", efeito: "perde o turno de ataque" },
  invulneravel: { glifo: "🛡", nome: "Invulnerável", efeito: "ignora todo dano recebido" },
};
const ICONE_GENERICO = { glifo: "✦", nome: "Efeito ativo", efeito: "efeito desconhecido" };

export function renderizarIconesStatus(elemento, combatente) {
  elemento.innerHTML = "";
  for (const efeito of combatente.status ?? []) {
    const config = ICONES_POR_TIPO[efeito.tipo] ?? ICONE_GENERICO;
    const span = document.createElement("span");
    span.className = "icone-status";
    span.textContent = config.glifo;
    const plural = efeito.duracao === 1 ? "turno restante" : "turnos restantes";
    span.title = `${config.nome}: ${config.efeito} (${efeito.duracao} ${plural})`;
    elemento.appendChild(span);
  }
}
```

Run: `npm test -- iconesStatus` → PASS.

- [ ] **Step 3: Ligar na tela e no controlador**

Em `telaBatalha.js`, dentro do template de `criarCombatente`, adicionar `<div class="icones-status"></div>` ao `painel-status` (depois da barra de HP), e expor em `elementos`: `iconesStatusJogador`/`iconesStatusInimigo` (via `combatenteJogador.querySelector(".icones-status")` etc.).

Em `controladorBatalha.js`, logo após a chamada existente de `atualizarBarras(elementos, estado.jogador, estado.inimigo)`:

```js
    renderizarIconesStatus(elementos.iconesStatusJogador, estado.jogador);
    renderizarIconesStatus(elementos.iconesStatusInimigo, estado.inimigo);
```

- [ ] **Step 4: CSS em `batalha.css`**

```css
.icones-status {
  display: flex;
  gap: 4px;
  min-height: 20px;
  justify-content: center;
}

.icone-status {
  font-size: 13px;
  line-height: 18px;
  width: 20px;
  height: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--cor-borda);
  border-radius: 3px;
  cursor: help;
}
```

- [ ] **Step 5: Verificar manualmente**

Run: `npm run dev`. Equipar a Adaga Sombria (aplica sangramento) ou apanhar veneno de um inimigo, e conferir: o ícone aparece no painel do combatente certo, o tooltip nativo mostra nome/efeito/turnos, e o ícone some quando o efeito expira.

- [ ] **Step 6: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add WebRPG/src/telas/batalha WebRPG/src/estilos/batalha.css
git commit -m "feat: fileira de icones de status com tooltip na batalha (spec 4.1 principio 2)"
```

---

### Task 5: Seletor de masmorra (os 10 temas viram alcançáveis)

**Files:**
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.test.js`
- Modify: `WebRPG/src/estilos/masmorra.css` (grade simples de cards de template)

**Interfaces:**
- Consumes: `templatesMasmorra` (já importado por `telaMasmorra.js`).
- Produces: `montarTelaMasmorra` agora renderiza primeiro uma lista de escolha (um botão por template, `data-template="<id>"`, mostrando nome e tema) e só cria a sessão (`criarSessaoMasmorra(jogador, idEscolhido)`) após o clique. Nenhuma mudança de assinatura — `{ jogador, aoSair }` continua igual.

- [ ] **Step 1: Testes que falham em `telaMasmorra.test.js`**

Os testes existentes assumem que a grade aparece imediatamente — vão precisar de um clique de seleção antes. Adicionar um helper no topo do arquivo e usar nos testes existentes:

```js
function entrarNaPrimeiraMasmorra(container) {
  container.querySelector('[data-template]').click();
}
```

Novos testes:

```js
  it("mostra a lista dos 10 templates antes de criar a sessão", () => {
    const container = document.createElement("div");
    montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelectorAll("[data-template]")).toHaveLength(10);
    expect(container.querySelector(".grade-masmorra")).toBeNull();
  });

  it("escolher um template cria a sessão daquele template", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    montarTelaMasmorra(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    container.querySelector('[data-template="covil-vulcanico"]').click();
    expect(container.querySelector(".grade-masmorra")).not.toBeNull();
    expect(container.textContent).toContain("Covil Vulcânico");
  });
```

Atualizar os testes existentes do arquivo para chamar `entrarNaPrimeiraMasmorra(container)` logo após `montarTelaMasmorra(...)` — **atenção ao teste de encontro da Fase 7**: ele depende do template `templatesMasmorra[0]` com `Math.random` fixo em 0.5; entrar pelo primeiro botão da lista preserva exatamente o comportamento antigo.

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- telaMasmorra`
Expected: FAIL — não existe `[data-template]`.

- [ ] **Step 3: Implementar a seleção em `telaMasmorra.js`**

Reestruturar `montarTelaMasmorra`: o `container.innerHTML` inicial vira a lista de seleção (`<div class="selecao-masmorra">` com um `<button class="botao card-template" data-template="${t.id}"><strong>${t.nome}</strong><span>${t.tema}</span></button>` por template + o botão "Voltar" chamando `aoSair()`); ao clicar num card, substituir o conteúdo pelo template atual da tela de masmorra (o mesmo HTML/fluxo de hoje, extraído para uma função interna `iniciarMasmorra(templateId)` que faz `criarSessaoMasmorra(jogador, templateId)` e liga tudo que a tela já liga). Mostrar o nome do template escolhido num cabeçalho acima da grade.

O retorno de `montarTelaMasmorra` (`{ botaoSairMasmorra, botaoMover }`) precisa continuar funcionando após a seleção — trocar para getters/lookup tardio (`botaoMover(direcao)` já é um lookup por seletor; `botaoSairMasmorra` vira também uma função ou é atribuído dentro de `iniciarMasmorra`). Conferir os usos reais nos testes antes de decidir a forma.

- [ ] **Step 4: CSS**

Em `masmorra.css`:

```css
.selecao-masmorra {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--espaco-sm);
  padding: var(--espaco-md);
}

.card-template {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}
```

- [ ] **Step 5: Rodar tudo e verificar manualmente**

Run: `npm test` — todos passam (incluindo `main.test.js`, que navega até a masmorra; se algum teste dele esbarrar na tela de seleção nova, aplicar o mesmo clique de seleção — mudança de comportamento intencional, documentar no commit).

Run: `npm run dev` — entrar na Masmorra mostra os 10 cards; escolher "Caverna Congelada" gera uma masmorra com os mobs daquele tema (conferir um encontro).

- [ ] **Step 6: Commit**

```bash
git add WebRPG/src/telas/masmorra WebRPG/src/estilos/masmorra.css
git commit -m "feat: seletor de masmorra - os 10 templates viram alcancaveis (a UI travava no primeiro)"
```

---

### Task 6: Playtest checklist de fim de fase

**Files:** `docs/superpowers/docs.md` (marcar Fase 10 ✅ ao final).

- [ ] `npm run dev`, limpar `localStorage`, criar personagem, comprar 2 Poções de Cura na loja.
- [ ] Treino: barra de ações mostra os 4 botões; beber poção cura e decrementa a contagem; Defender reduz o dano do golpe seguinte à metade (conferir no log); com 0 poções o botão desabilita.
- [ ] Missão da guilda que premia poção: a contagem no próximo combate reflete a poção ganha (valida a dupla contabilidade unificada da Task 1).
- [ ] Provocar veneno/sangramento: ícones aparecem no painel do combatente certo com tooltip completo, e somem ao expirar.
- [ ] Masmorra: lista com 10 temas; entrar em 2 temas diferentes e conferir mobs/boss condizentes; penalidade de fuga que rouba poção continua funcionando.
- [ ] Console do navegador sem erros/404s no fluxo todo; `npm test` e `npm run build` passam.
- [ ] Marcar a Fase 10 como ✅ Concluída em `docs/superpowers/docs.md`.
- [ ] **Reportar o resultado**, item a item.

---

## Self-Review

**Cobertura da spec** (seção 12.1/12.3, achados #1, #2, #3, #6):
- Ações Item/Defender no motor → Tasks 1-2; na UI → Task 3. ✅ (com as correções de spec 12.2 — sem MP, sem botão Habilidade — aplicadas em vez de contornadas).
- Poção utilizável + dupla contabilidade → Task 1 (API única, sem migração de save). ✅
- Ícones de status com tooltip → Task 4 (decisão documentada: glifos, não PNGs). ✅
- Seletor dos 10 templates → Task 5. ✅

**Consistência de assinatura:** `executarRodada(estado, acao)` estendida por novos valores de `acao` — aditivo, zero quebra nos chamadores (`executarAcaoJogador` repassa a ação opaca). `montarTelaMasmorra({jogador, aoSair})` mantém a assinatura; a mudança de fluxo interno (seleção antes da grade) está coberta por atualização explícita dos testes existentes (Task 5 Step 1), não silenciosa.

**Riscos conhecidos:** o teste de "defender reduz à metade" precisa da técnica de comparação de dois runs (nota na Task 2 Step 1) para não acoplar na fórmula de dano; `main.test.js` pode precisar do clique de seleção de template (Task 5 Step 5, previsto).

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-11-webrpg-fase10-combate-completo.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
