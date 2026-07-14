# WebRPG Fase 13 — Loot Real, Masmorra Viva & Heróis com Rosto Próprio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar os achados #1, #4, #8 e #9 da spec seção 13.1 (`docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`) — os últimos gaps de conteúdo/profundidade encontrados na revisão final, depois que a Fase 12 já resolveu o amuleto/talismã/portão da Torre. Hoje: (a) pisar numa sala de armadilha/tesouro/segredo da masmorra não faz **nada**; (b) vencer qualquer batalha só dá XP e ouro — nenhum monstro, miniboss ou boss jamais dropa item, e os bônus passivos de classe "drop de ouro" (Arqueiro) e "drop de item" (Assassino) são dado morto; (c) o herói sempre usa o sprite "soldado", não importa a raça/classe escolhida; (d) só a Poção de Cura existe como consumível — o Néctar da Vida Eterna (cura total, 1 por vez) e as 4 relíquias lendárias de masmorra do console nunca foram portados. Esta fase entrega os quatro, com uma decisão de escopo explícita: as salas de tesouro da masmorra e os drops de combate compartilham o **mesmo pool de itens** dos materiais do Amuleto Supremo (Fase 12) — o jogador agora consegue juntar esses materiais **"em missões ou em exploração"**, exatamente como o amuleto sempre pretendeu.

**Architecture:** Nenhuma camada nova. Task 1 adiciona um módulo pequeno (`engine/masmorra/salas.js`, mesmo padrão de `inimigoDaSala.js` da Fase 7) para as três interações que faltam. Task 2 adiciona `engine/combate/drops.js` e altera `concederRecompensaVitoria` (a única função de recompensa do combate 1x1 principal, reaproveitada automaticamente por treino **e** masmorra) e separadamente o motor da Torre (que não usa `concederRecompensaVitoria` — tem sua própria linha de recompensa desde a Fase 4). Task 3 é puramente CSS/dado — reaproveita o único par de sprites existente (Soldado) com filtros de cor por classe, em vez de caçar/baixar 6 sprites novos (mesma lógica de simplificação pragmática já usada na Fase 7 para a névoa de guerra da masmorra: reaproveitar um asset existente com CSS em vez de produzir um novo). Task 4 estende o padrão de "API única de item consumível" que a Fase 10 já estabeleceu para a Poção de Cura (`engine/itens/pocao.js`) para o Néctar da Vida Eterna, e implementa só o efeito passivo mais simples e mais diretamente conectado à masmorra desta fase (Fragmento do Sol Caído revela a grade) — as outras 3 relíquias entram no jogo como itens de inventário reais e colecionáveis, mas com o efeito passivo deliberadamente adiado (decisão documentada, não descoberta tardia).

**Tech Stack:** Mesmo stack — Vite/vanilla JS, Vitest + jsdom. Nenhum asset novo.

## Global Constraints

- O pool de itens de tesouro/drop de combate (`Pena do Corvo Sombrio`, `Pergaminho Arcano`, `Essência da Noite`, `Relíquia Brilhante`, `Gema da Escuridão`, `Fragmento Antigo`) é **o mesmo conjunto de nomes já usado pela Fase 12** (`REQUISITOS_AMULETO`, `PRECO_TALISMA`) — nenhum nome novo inventado, só uma segunda fonte de obtenção para os mesmos itens.
- `concederRecompensaVitoria(jogador, inimigo)` muda de forma de retorno (`{xpGanho, ouroGanho}` → `{xpGanho, ouroGanho, itemGanho}`) — **os dois testes existentes em `recompensas.test.js` usam `toEqual` e vão quebrar** com a chave nova; corrigi-los faz parte da Task 2, não é uma regressão a evitar.
- Nenhuma migração de save — qualquer leitura de campo novo usa fallback (`jogador.bonusClasse?.dropItem ?? 0`, `jogador.inventario ?? []`).
- Rodar `npm test` (raiz do repo) depois de cada task.

---

### Task 1: Salas de armadilha, tesouro e segredo da masmorra ficam funcionais

**Files:**
- Create: `engine/masmorra/salas.js`
- Create: `engine/masmorra/salas.test.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.js`
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.test.js`
- Modify: `WebRPG/src/estilos/masmorra.css`

**Interfaces:**
- Produces: `resolverArmadilha(jogador) → {dano}` (`dano = max(1, floor(hpMax*0.08))`, nunca reduz o HP abaixo de 1 — armadilha machuca, não mata), `resolverTesouro(jogador) → {ouro, item}` (`ouro = rand(30,80)`; 40% de chance de também sortear 1 item do pool compartilhado com o Amuleto/Talismã, ver Task 2 para o pool completo), `resolverSegredo(sessao) → {celulasReveladas}` (revela até 2 células não visitadas ao acaso, marcando `visited = true`, sem mexer no conteúdo delas — o jogador só "sabe que tem algo ali", sem ver o quê, até chegar lá andando).
- Consumed by: `WebRPG/src/telas/masmorra/telaMasmorra.js`.

Fiel ao espírito do console (armadilha causa dano, segredo revela algo, tesouro dá recompensa — spec seção 13.1, achado #1) sem reimplementar a mecânica exata do console linha por linha (não pesquisada em detalhe nesta revisão) — mesma abordagem de simplificação fiel já usada pela Fase 4 para o gerador de masmorra.

- [ ] **Step 1: Escrever os testes que falham em `engine/masmorra/salas.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { resolverArmadilha, resolverTesouro, resolverSegredo } from "./salas.js";

afterEach(() => vi.restoreAllMocks());

describe("resolverArmadilha", () => {
  it("causa dano proporcional ao hpMax, sem derrubar abaixo de 1", () => {
    const jogador = { hp: 100, hpMax: 100 };
    const { dano } = resolverArmadilha(jogador);
    expect(dano).toBe(8); // floor(100*0.08)
    expect(jogador.hp).toBe(92);
  });

  it("nunca deixa o hp abaixo de 1", () => {
    const jogador = { hp: 3, hpMax: 100 };
    resolverArmadilha(jogador);
    expect(jogador.hp).toBe(1);
  });
});

describe("resolverTesouro", () => {
  it("sempre dá ouro; com sorte, também dá um item do pool compartilhado", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(30,80)=30; chance de item bate (<=40%)
    const jogador = { ouro: 0, inventario: [] };
    const resultado = resolverTesouro(jogador);
    expect(resultado.ouro).toBe(30);
    expect(jogador.ouro).toBe(30);
    expect(resultado.item).not.toBeNull();
    expect(jogador.inventario).toContain(resultado.item);
  });

  it("sem sorte, dá só ouro", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.999).mockReturnValue(0.999);
    const jogador = { ouro: 0, inventario: [] };
    const resultado = resolverTesouro(jogador);
    expect(resultado.item).toBeNull();
    expect(jogador.inventario).toEqual([]);
  });
});

describe("resolverSegredo", () => {
  it("revela até 2 células não visitadas, sem alterar o conteúdo delas", () => {
    const grid = [
      [{ x: 0, y: 0, visited: true, roomType: "entrada" }, { x: 1, y: 0, visited: false, roomType: "monstro" }],
      [{ x: 0, y: 1, visited: false, roomType: "trap" }, { x: 1, y: 1, visited: false, roomType: "vazio" }],
    ];
    const sessao = { dungeon: { grid } };
    const resultado = resolverSegredo(sessao);
    expect(resultado.celulasReveladas).toBe(2);
    const naoVisitadasRestantes = grid.flat().filter((c) => !c.visited).length;
    expect(naoVisitadasRestantes).toBe(1); // 3 não visitadas - 2 reveladas = 1
  });

  it("revela o que houver quando sobrarem menos de 2 células não visitadas", () => {
    const grid = [[{ x: 0, y: 0, visited: true, roomType: "entrada" }, { x: 1, y: 0, visited: false, roomType: "boss" }]];
    const sessao = { dungeon: { grid } };
    const resultado = resolverSegredo(sessao);
    expect(resultado.celulasReveladas).toBe(1);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- masmorra/salas`
Expected: FAIL — `Failed to resolve import "./salas.js"`.

- [ ] **Step 3: Implementar `engine/masmorra/salas.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";

// Mesmo pool de materiais do Amuleto Supremo/Talismã da Torre (Fase 12,
// engine/itens/amuletoTalisma.js) — tesouro de masmorra e drop de combate
// (Fase 13, Task 2) são uma segunda fonte dos mesmos itens, não itens novos.
export const POOL_ITENS_EXPLORACAO = [
  "Pena do Corvo Sombrio", "Pergaminho Arcano", "Essência da Noite",
  "Relíquia Brilhante", "Gema da Escuridão", "Fragmento Antigo",
];

export function resolverArmadilha(jogador) {
  const dano = Math.max(1, Math.floor(jogador.hpMax * 0.08));
  jogador.hp = Math.max(1, jogador.hp - dano);
  return { dano };
}

export function resolverTesouro(jogador) {
  const ouro = rand(30, 80);
  jogador.ouro += ouro;

  let item = null;
  if (rand(1, 100) <= 40) {
    item = POOL_ITENS_EXPLORACAO[rand(0, POOL_ITENS_EXPLORACAO.length - 1)];
    jogador.inventario.push(item);
  }
  return { ouro, item };
}

export function resolverSegredo(sessao) {
  const candidatos = sessao.dungeon.grid.flat().filter((c) => !c.visited);
  let reveladas = 0;
  for (let i = 0; i < 2 && candidatos.length > 0; i++) {
    const idx = rand(0, candidatos.length - 1);
    candidatos.splice(idx, 1)[0].visited = true;
    reveladas++;
  }
  return { celulasReveladas: reveladas };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- masmorra/salas`
Expected: PASS.

- [ ] **Step 5: Teste que falha em `telaMasmorra.test.js`**

```js
  it("armadilha causa dano e some da grade depois", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    const elementos = montarTelaMasmorra(container, { jogador, aoSair: vi.fn() });
    // Mesma observação da Fase 7: com Math.random fixo em 0.5, a entrada e as
    // salas ao redor são determinísticas — usar a direção/posição já validada
    // nos testes existentes deste arquivo para achar uma célula "trap" real,
    // ou forçar sessao.dungeon.grid[...] .roomType = "trap" antes do movimento
    // se nenhuma sala natural bater (mais simples e não-frágil).
    const hpAntes = jogador.hp;
    elementos.botaoMover("leste").click(); // ajustar a direção real usada no teste existente de encontro (Fase 7) para reaproveitar o mesmo determinismo
    expect(container.querySelector(".log-masmorra").textContent).toMatch(/armadilha|tesouro|secreta/i);
  });
```

**Nota para o executor:** o teste acima está esboçado — como a posição exata de cada tipo de sala depende do gerador com seed fixo (`Math.random` mockado em 0.5), a forma mais simples e não-frágil é **forçar diretamente** `sessao` (ou a célula de destino) para o `roomType` desejado antes de mover, em vez de descobrir por tentativa qual direção cai numa armadilha. Como `sessao` é uma variável interna do módulo (não exposta), a alternativa é expor `elementos.sessaoAtual()` só para teste, ou testar a função de dispatch isoladamente com um mock do `celulaAtualDaSessao()`. Escolher a forma mais simples ao implementar — o importante é cobrir os 3 ramos novos (`trap`, `treasure`, `secret`) sem depender de sorte do gerador.

- [ ] **Step 6: Rodar e confirmar falha**

Run: `npm test -- telaMasmorra`
Expected: FAIL — hoje não existe `.log-masmorra`.

- [ ] **Step 7: Implementar em `telaMasmorra.js`**

Adicionar o import:

```js
import { resolverArmadilha, resolverTesouro, resolverSegredo } from "@engine/masmorra/salas.js";
```

Adicionar ao template, entre `.grade-masmorra` e `.controles-masmorra`:

```html
<div class="painel log-masmorra"></div>
```

Renomear o dispatch de interação — encontrar:

```js
  function verificarEncontro() {
    const celula = celulaAtualDaSessao();
    if (!TIPOS_COM_ENCONTRO.has(celula.roomType)) return;
```

Substituir a função inteira por uma versão que também trata as 3 salas novas antes do `return` antecipado:

```js
  const log = container.querySelector(".log-masmorra");
  function registrarLog(mensagem) {
    const linha = document.createElement("p");
    linha.textContent = mensagem;
    log.appendChild(linha);
  }

  function verificarInteracaoDaSala() {
    const celula = celulaAtualDaSessao();

    if (celula.roomType === "trap") {
      const { dano } = resolverArmadilha(jogador);
      registrarLog(`Você caiu numa armadilha e perdeu ${dano} HP!`);
      limparSala(sessao);
      renderizarGrade();
      return;
    }
    if (celula.roomType === "treasure") {
      const { ouro, item } = resolverTesouro(jogador);
      registrarLog(`Você encontrou um tesouro: +${ouro} ouro${item ? ` e ${item}` : ""}!`);
      limparSala(sessao);
      renderizarGrade();
      return;
    }
    if (celula.roomType === "secret") {
      resolverSegredo(sessao);
      registrarLog("Uma passagem secreta revela salas próximas no mapa!");
      limparSala(sessao);
      renderizarGrade();
      return;
    }

    if (!TIPOS_COM_ENCONTRO.has(celula.roomType)) return;
```

(o restante do corpo — criação do inimigo, `iniciarBatalha`, etc. — continua igual, só a função foi renomeada de `verificarEncontro` para `verificarInteracaoDaSala`.)

Atualizar a chamada em `moverPara`:

```js
  function moverPara(direcao) {
    const resultado = mover(sessao, direcao);
    if (!resultado.saiuDosLimites) {
      sessao = resultado.sessao;
      renderizarGrade();
      verificarInteracaoDaSala();
    }
  }
```

- [ ] **Step 8: Rodar e confirmar sucesso**

Run: `npm test -- telaMasmorra`
Expected: PASS.

- [ ] **Step 9: CSS mínimo**

Em `WebRPG/src/estilos/masmorra.css`, adicionar (mesmo padrão de `.log-batalha`/`.log-torre` já usados no resto do projeto):

```css
.log-masmorra {
  max-height: 100px;
  overflow-y: auto;
  font-size: 13px;
}
```

- [ ] **Step 10: Verificar manualmente**

Run: `npm run dev`. Entrar na Masmorra e explorar até pisar numa sala de armadilha (`trap`), tesouro (`treasure`) e segredo (`secret`) — cada uma reage e loga uma mensagem, e a sala fica "limpa" (não repete o efeito ao passar de novo).

- [ ] **Step 11: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add engine/masmorra/salas.js engine/masmorra/salas.test.js WebRPG/src/telas/masmorra WebRPG/src/estilos/masmorra.css
git commit -m "feat: salas de armadilha/tesouro/segredo da masmorra ficam funcionais (eram so decoracao)"
```

---

### Task 2: Drop de item ao vencer batalhas + bônus de classe (dropOuro/dropItem) ativados

**Files:**
- Create: `engine/combate/drops.js`
- Create: `engine/combate/drops.test.js`
- Modify: `engine/combate/recompensas.js`
- Modify: `engine/combate/recompensas.test.js`
- Modify: `engine/torre/index.js`
- Modify: `engine/torre/index.test.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.js`

**Interfaces:**
- Produces: `calcularChanceDropItem(jogador) → number` (8% base + `jogador.bonusClasse?.dropItem ?? 0` — Assassino tem `dropItem: 10`, logo 18%), `calcularBonusOuro(jogador, ouroBase) → number` (`ouroBase * (1 + (jogador.bonusClasse?.dropOuro ?? 0)/100)`, arredondado — Arqueiro tem `dropOuro: 10`, logo +10%), `sortearDropDeItem(jogador) → string|null` (sorteia 1 item de `POOL_ITENS_EXPLORACAO`, a mesma lista exportada por `engine/masmorra/salas.js` na Task 1).
- Consumes: `POOL_ITENS_EXPLORACAO` (Task 1).
- `concederRecompensaVitoria(jogador, inimigo)` (existente, `engine/combate/recompensas.js`) passa a aplicar as duas funções acima e a devolver `itemGanho` — consumido automaticamente por **treino e masmorra**, já que ambos passam pelo mesmo `engine/combate/turno.js` → `iniciarBatalha`. A Torre (motor próprio, Fase 4) ganha a mesma lógica separadamente, já que não usa `concederRecompensaVitoria`.

- [ ] **Step 1: Escrever os testes que falham em `engine/combate/drops.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { calcularChanceDropItem, calcularBonusOuro, sortearDropDeItem } from "./drops.js";

afterEach(() => vi.restoreAllMocks());

describe("calcularChanceDropItem", () => {
  it("8% de base sem bônus de classe", () => {
    expect(calcularChanceDropItem({})).toBe(8);
  });

  it("soma o bônus dropItem da classe (Assassino: +10)", () => {
    expect(calcularChanceDropItem({ bonusClasse: { dropItem: 10 } })).toBe(18);
  });
});

describe("calcularBonusOuro", () => {
  it("sem bônus de classe, devolve o valor base", () => {
    expect(calcularBonusOuro({}, 100)).toBe(100);
  });

  it("aplica o bônus dropOuro da classe (Arqueiro: +10%)", () => {
    expect(calcularBonusOuro({ bonusClasse: { dropOuro: 10 } }, 100)).toBe(110);
  });
});

describe("sortearDropDeItem", () => {
  it("respeita calcularChanceDropItem e sorteia um item do pool quando a sorte bate", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <= 8
    expect(sortearDropDeItem({})).not.toBeNull();
  });

  it("retorna null quando a sorte falha", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999); // rand(1,100)=100 > 8
    expect(sortearDropDeItem({})).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- combate/drops`
Expected: FAIL.

- [ ] **Step 3: Implementar `engine/combate/drops.js`**

```js
import { rand } from "./aleatorio.js";
import { POOL_ITENS_EXPLORACAO } from "@engine/masmorra/salas.js";

const CHANCE_BASE_DROP_ITEM = 8;

export function calcularChanceDropItem(jogador) {
  return CHANCE_BASE_DROP_ITEM + (jogador.bonusClasse?.dropItem ?? 0);
}

export function calcularBonusOuro(jogador, ouroBase) {
  const bonusPercentual = jogador.bonusClasse?.dropOuro ?? 0;
  return Math.round(ouroBase * (1 + bonusPercentual / 100));
}

export function sortearDropDeItem(jogador) {
  if (rand(1, 100) > calcularChanceDropItem(jogador)) return null;
  return POOL_ITENS_EXPLORACAO[rand(0, POOL_ITENS_EXPLORACAO.length - 1)];
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- combate/drops`
Expected: PASS.

- [ ] **Step 5: Atualizar os testes existentes em `recompensas.test.js`**

Os dois testes existentes usam `toEqual({xpGanho, ouroGanho})` — vão quebrar com a chave `itemGanho` nova. Encontrar:

```js
    const resultado = concederRecompensaVitoria(jogador, inimigo);
    expect(resultado).toEqual({ xpGanho: 20, ouroGanho: 30 });
```

Substituir por (adicionar `vi.spyOn(Math, "random").mockReturnValue(0.999)` no topo do teste para garantir que o drop de item não dispare, mantendo o teste focado em xp/ouro):

```js
    vi.spyOn(Math, "random").mockReturnValue(0.999); // garante que nenhum item dropa neste teste
    const resultado = concederRecompensaVitoria(jogador, inimigo);
    expect(resultado).toEqual({ xpGanho: 20, ouroGanho: 30, itemGanho: null });
```

Aplicar o mesmo ajuste no segundo teste (fórmula de fallback) — cuidado com a ordem das chamadas de `rand` dentro de `concederRecompensaVitoria` (a chamada de fallback de ouro `rand(50,100)` acontece **antes** do sorteio de drop; usar `mockReturnValueOnce` encadeado se precisar valores diferentes para cada chamada, ou manter `mockReturnValue` fixo se o mesmo valor servir para os dois — `0.999` funciona para ambos: dá o topo da faixa de ouro de fallback E garante que o drop de item não dispare).

Adicionar um teste novo:

```js
  it("aplica o bônus de classe no ouro e pode dropar item do pool de exploração", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // topo do drop de item e base do rand
    const jogador = { xp: 0, ouro: 0, inventario: [], bonusClasse: { dropOuro: 10, dropItem: 10 } };
    const inimigo = { xp: 20, ouro: 100, hpMax: 50, atk: 10 };
    const resultado = concederRecompensaVitoria(jogador, inimigo);
    expect(resultado.ouroGanho).toBe(110); // 100 * 1.10
    expect(resultado.itemGanho).not.toBeNull();
    expect(jogador.inventario).toContain(resultado.itemGanho);
  });
```

- [ ] **Step 6: Rodar e confirmar falha**

Run: `npm test -- recompensas`
Expected: FAIL — `concederRecompensaVitoria` ainda não devolve `itemGanho` nem aplica bônus de classe.

- [ ] **Step 7: Implementar em `engine/combate/recompensas.js`**

Substituir o arquivo inteiro por:

```js
import { rand } from "./aleatorio.js";
import { calcularBonusOuro, sortearDropDeItem } from "./drops.js";

export function concederRecompensaVitoria(jogador, inimigo) {
  const xpGanho =
    Number(inimigo.xp) || Math.floor(inimigo.hpMax / 5 + inimigo.atk * 2);
  const ouroBase = Number(inimigo.ouro) || rand(50, 100);
  const ouroGanho = calcularBonusOuro(jogador, ouroBase);
  jogador.xp += xpGanho;
  jogador.ouro += ouroGanho;

  const itemGanho = sortearDropDeItem(jogador);
  if (itemGanho) {
    jogador.inventario = jogador.inventario ?? [];
    jogador.inventario.push(itemGanho);
  }

  return { xpGanho, ouroGanho, itemGanho };
}
```

- [ ] **Step 8: Rodar e confirmar sucesso**

Run: `npm test -- recompensas`
Expected: PASS.

- [ ] **Step 9: Exibir o item ganho na UI de batalha**

Em `WebRPG/src/telas/batalha/controladorBatalha.js`, encontrar `descreverEvento`'s case `"vitoria"`:

```js
    case "vitoria":
      return `Vitória! +${evento.xpGanho} XP, +${evento.ouroGanho} ouro.`;
```

Substituir por:

```js
    case "vitoria":
      return `Vitória! +${evento.xpGanho} XP, +${evento.ouroGanho} ouro${evento.itemGanho ? `. Você encontrou: ${evento.itemGanho}` : "."}`;
```

Em `mostrarOverlayFim` (`telaBatalha.js`, já estendida na Fase 12 Task 5 com `eventosLevelUp`), adicionar mais um campo opcional `itemGanho`:

```js
export function mostrarOverlayFim(elementos, { tipo, xpGanho, ouroGanho, eventosLevelUp = [], itemGanho = null }) {
  const titulo = tipo === "vitoria" ? "Vitória!" : "Derrota...";
  const detalhe = tipo === "vitoria" ? `+${xpGanho} XP, +${ouroGanho} ouro` : "Tente novamente.";
  const linhaItem = itemGanho ? `<p>Você encontrou: ${itemGanho}</p>` : "";
  const ultimoLevelUp = eventosLevelUp[eventosLevelUp.length - 1];
  const linhaLevelUp = ultimoLevelUp
    ? `<p class="texto-level-up">🎉 Nível ${ultimoLevelUp.nivel}! HP máximo: ${ultimoLevelUp.hpMax}</p>`
    : "";
  elementos.overlayFim.innerHTML = `
    <h1 class="texto-pixel">${titulo}</h1>
    <p>${detalhe}</p>
    ${linhaItem}
    ${linhaLevelUp}
  `;
  elementos.overlayFim.classList.remove("overlay-fim--oculto");
}
```

E em `controladorBatalha.js`, no bloco que já chama `mostrarOverlayFim` (Fase 12 Task 5), adicionar `itemGanho: eventoVitoria?.itemGanho` ao objeto passado.

Adicionar um teste em `telaBatalha.test.js` cobrindo `mostrarOverlayFim` com `itemGanho` preenchido, mesmo padrão dos testes de `eventosLevelUp` já existentes.

- [ ] **Step 10: Rodar e confirmar sucesso**

Run: `npm test -- telaBatalha && npm test -- controladorBatalha`
Expected: PASS.

- [ ] **Step 11: Estender o drop para os bosses da Torre**

Em `engine/torre/index.js`, importar:

```js
import { calcularBonusOuro, sortearDropDeItem } from "@engine/combate/drops.js";
```

Encontrar (dentro de `executarTurnoTorre`, no bloco de morte do boss):

```js
      jogador.xp += boss.xp;
      jogador.ouro += boss.ouro;
```

Substituir por:

```js
      jogador.xp += boss.xp;
      jogador.ouro += calcularBonusOuro(jogador, boss.ouro);
      const itemGanho = sortearDropDeItem(jogador);
      if (itemGanho) {
        jogador.inventario.push(itemGanho);
        eventos.push({ tipo: "item_ganho", item: itemGanho });
      }
```

Adicionar um teste em `engine/torre/index.test.js` cobrindo o drop/bônus num boss derrotado (mesma técnica de fixar `Math.random` já usada nos testes existentes desse arquivo).

Em `WebRPG/src/telas/torre/telaTorre.js`, adicionar o caso `"item_ganho"` a `descreverEvento`:

```js
    case "item_ganho": return `Você encontrou: ${evento.item}`;
```

- [ ] **Step 12: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add engine/combate/drops.js engine/combate/drops.test.js engine/combate/recompensas.js engine/combate/recompensas.test.js engine/torre/index.js engine/torre/index.test.js WebRPG/src/telas/batalha WebRPG/src/telas/torre
git commit -m "feat: monstros/bosses/minibosses agora dropam item (era so XP e ouro); bonus de classe dropOuro/dropItem finalmente ativos"
```

---

### Task 3: O herói ganha variedade visual por classe

**Files:**
- Create: `WebRPG/src/telas/batalha/filtroClasse.js`
- Create: `WebRPG/src/telas/batalha/filtroClasse.test.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`
- Modify: `WebRPG/src/telas/criacao/telaCriacao.js`
- Modify: `WebRPG/src/telas/criacao/telaCriacao.test.js`

**Interfaces:**
- Produces: `filtroParaClasse(classeNome: string) → string` (um valor de CSS `filter`, ex. `"hue-rotate(90deg)"`), com fallback `"none"` para uma classe desconhecida.

**Decisão documentada — recolorir o sprite existente, não baixar 6 sprites novos:** a spec (seção 5) sempre planejou "sprite de batalha vem da classe" (6 sprites), mas só o par Soldado/Orc da Fase 1 existe. Caçar/baixar 6 arquétipos humanoides novos (mesmo processo de asset-hunting das Fases 6-8) é desproporcional ao ganho visual aqui — a mesma lógica de simplificação pragmática já usada na Fase 7 para diferenciar `chao`/`oculta` da masmorra (reaproveitar 1 asset com `filter` de CSS em vez de produzir um segundo). Aplica-se um `filter` de cor distinto por classe sobre o sprite "soldado" único que já existe, dando identidade visual a cada uma das 6 classes sem nenhum download novo. Se uma fase futura quiser sprites únicos de verdade por classe, só o `filtroParaClasse`/CSS muda — a estrutura (elemento `.sprite`, `personagemJogador`) já suporta a troca.

- [ ] **Step 1: Escrever o teste que falha em `filtroClasse.test.js`**

```js
import { describe, it, expect } from "vitest";
import { filtroParaClasse } from "./filtroClasse.js";

describe("filtroParaClasse", () => {
  it.each([
    ["Arqueiro", "hue-rotate(90deg) saturate(1.2)"],
    ["Paladino", "hue-rotate(200deg) saturate(1.3)"],
    ["Assassino", "grayscale(0.5) brightness(0.85)"],
    ["Bárbaro", "hue-rotate(-30deg) saturate(1.5)"],
    ["Necromante", "hue-rotate(260deg) saturate(1.4) brightness(0.9)"],
    ["Xamã", "hue-rotate(150deg) saturate(1.2)"],
  ])('retorna o filtro definido para "%s"', (classe, filtroEsperado) => {
    expect(filtroParaClasse(classe)).toBe(filtroEsperado);
  });

  it('retorna "none" para uma classe desconhecida', () => {
    expect(filtroParaClasse("Classe Nunca Vista")).toBe("none");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- filtroClasse`
Expected: FAIL.

- [ ] **Step 3: Implementar `filtroClasse.js`**

```js
const FILTRO_POR_CLASSE = {
  Arqueiro: "hue-rotate(90deg) saturate(1.2)",
  Paladino: "hue-rotate(200deg) saturate(1.3)",
  Assassino: "grayscale(0.5) brightness(0.85)",
  Bárbaro: "hue-rotate(-30deg) saturate(1.5)",
  Necromante: "hue-rotate(260deg) saturate(1.4) brightness(0.9)",
  Xamã: "hue-rotate(150deg) saturate(1.2)",
};

const FILTRO_PADRAO = "none";

export function filtroParaClasse(classeNome) {
  return FILTRO_POR_CLASSE[classeNome] ?? FILTRO_PADRAO;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- filtroClasse`
Expected: PASS (7 testes).

- [ ] **Step 5: Teste que falha em `telaBatalha.test.js`**

```js
  it("aplica o filtro de cor da classe do jogador no sprite dele", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", classe: "Necromante", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(elementos.spriteJogador.style.filter).toBe("hue-rotate(260deg) saturate(1.4) brightness(0.9)");
  });

  it("sem classe definida, o sprite fica sem filtro", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    expect(elementos.spriteJogador.style.filter).toBe("none");
  });
```

- [ ] **Step 6: Rodar e confirmar falha**

Run: `npm test -- telaBatalha`
Expected: FAIL.

- [ ] **Step 7: Implementar em `telaBatalha.js`**

Adicionar o import:

```js
import { filtroParaClasse } from "./filtroClasse.js";
```

Depois da linha que cria `combatenteJogador` (`const combatenteJogador = criarCombatente(jogador.nome || "Você", "soldado");`), adicionar:

```js
  combatenteJogador.querySelector(".sprite").style.filter = filtroParaClasse(jogador.classe);
```

- [ ] **Step 8: Rodar e confirmar sucesso**

Run: `npm test -- telaBatalha`
Expected: PASS.

- [ ] **Step 9: Aplicar também no preview da criação de personagem**

Em `telaCriacao.js`, importar `filtroParaClasse` de `../batalha/filtroClasse.js`. Dentro de `atualizarPreview()` (que já roda quando raça e classe estão escolhidas), adicionar:

```js
  function atualizarPreview() {
    if (!estado.racaNome || !estado.classeNome) return;
    const atributos = calcularAtributosIniciais(estado.racaNome, estado.classeNome);
    painelPreview.innerHTML = `
      <h2>Atributos</h2>
      <p>HP: ${atributos.hpMax}</p>
      <p>Ataque: ${atributos.ataque}</p>
      <p>Defesa: ${atributos.defesa}</p>
    `;
    container.querySelector(".sprite-preview .sprite").style.filter = filtroParaClasse(estado.classeNome);
  }
```

Adicionar um teste em `telaCriacao.test.js`: selecionar uma classe (ex. clicar `[data-classe="Bárbaro"]`) e conferir que `container.querySelector(".sprite-preview .sprite").style.filter` bate com `filtroParaClasse("Bárbaro")`.

- [ ] **Step 10: Rodar a suíte completa e verificar manualmente**

Run: `npm test`
Expected: PASS.

Run: `npm run dev`. Criar personagens de classes diferentes e comparar o preview na criação e o sprite em batalha — cada classe tem uma tonalidade visível e distinta.

- [ ] **Step 11: Commit**

```bash
git add WebRPG/src/telas/batalha/filtroClasse.js WebRPG/src/telas/batalha/filtroClasse.test.js WebRPG/src/telas/batalha/telaBatalha.js WebRPG/src/telas/batalha/telaBatalha.test.js WebRPG/src/telas/criacao
git commit -m "feat: o sprite do heroi varia por classe via filtro de cor (reaproveita o unico sprite existente, sem baixar 6 novos)"
```

---

### Task 4: Néctar da Vida Eterna funcional + relíquias de masmorra colecionáveis

**Files:**
- Create: `engine/itens/nectar.js`
- Create: `engine/itens/nectar.test.js`
- Modify: `engine/combate/turno.js`
- Modify: `engine/combate/turno.test.js`
- Modify: `engine/masmorra/salas.js`
- Modify: `engine/masmorra/salas.test.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js`
- Modify: `WebRPG/assets/CREDITS.md` (não — sem asset novo; ignorar)

**Interfaces:**
- Produces: `contarNectar(jogador) → number`, `podeGanharNectar(jogador) → boolean` (`< 1`, o limite do console), `usarNectarDaVidaEterna(jogador) → {usou: boolean}` (cura 100% do HP, consome 1 unidade) em `engine/itens/nectar.js`. `executarRodada` (motor de turno, Fase 4/10) passa a aceitar a ação `"usar_nectar"`, mesmo padrão de `"usar_pocao"` (Fase 10). `resolverTesouro`/`sortearDropDeItem` (Tasks 1-2) passam a incluir "Néctar da Vida Eterna" e as 4 relíquias no pool de exploração, respeitando o limite de 1 Néctar por vez.

**Decisão de escopo documentada:** das 5 relíquias/consumíveis do console (`JogoRPG/masmorra/masmorra.js:22-54`), só duas ganham efeito mecânico nesta fase: **Néctar da Vida Eterna** (consumível de cura total, mesmo padrão já construído para a Poção na Fase 10) e **Fragmento do Sol Caído** (revela a masmorra inteira ao ser obtido — reaproveita `resolverSegredo`-like lógica já escrita na Task 1). As outras três (**Orbe da Fênix Flamejante** — reviver uma vez, **Coração Flamejante** — curar 25 HP por inimigo derrotado dentro da masmorra, **Bússola do Destino** — revelar a localização do tesouro/boss) entram no jogo como itens de inventário reais e colecionáveis (aparecem no pool de exploração, podem ser vendidos/guardados), mas **sem o efeito passivo ligado** — cada um exigiria um gancho próprio no motor de combate ou de masmorra (revive automático, cura pós-combate condicional, revelação de posição específica) desproporcional ao que resta de escopo desta fase. Documentado como pendência de conteúdo futura, mesmo padrão da Fase 4 (`dano_extra`/`defesa_extra`) e da Fase 8 (arquétipos de sprite ausentes).

- [ ] **Step 1: Escrever os testes que falham em `engine/itens/nectar.test.js`**

```js
import { describe, it, expect } from "vitest";
import { contarNectar, podeGanharNectar, usarNectarDaVidaEterna } from "./nectar.js";

const NOME = "Néctar da Vida Eterna";

describe("contarNectar e podeGanharNectar", () => {
  it("conta corretamente e respeita o limite de 1", () => {
    expect(contarNectar({ inventario: [] })).toBe(0);
    expect(podeGanharNectar({ inventario: [] })).toBe(true);
    expect(podeGanharNectar({ inventario: [NOME] })).toBe(false);
  });
});

describe("usarNectarDaVidaEterna", () => {
  it("cura 100% do hp e consome a unidade", () => {
    const jogador = { hp: 10, hpMax: 200, inventario: [NOME] };
    const resultado = usarNectarDaVidaEterna(jogador);
    expect(resultado).toEqual({ usou: true });
    expect(jogador.hp).toBe(200);
    expect(jogador.inventario).toEqual([]);
  });

  it("retorna usou:false sem consumir nada quando não há néctar", () => {
    const jogador = { hp: 10, hpMax: 200, inventario: [] };
    const resultado = usarNectarDaVidaEterna(jogador);
    expect(resultado).toEqual({ usou: false });
    expect(jogador.hp).toBe(10);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- itens/nectar`
Expected: FAIL.

- [ ] **Step 3: Implementar `engine/itens/nectar.js`**

```js
const NOME_NECTAR = "Néctar da Vida Eterna";
const LIMITE_NECTAR = 1;

export function contarNectar(jogador) {
  return (jogador.inventario ?? []).filter((item) => item === NOME_NECTAR).length;
}

export function podeGanharNectar(jogador) {
  return contarNectar(jogador) < LIMITE_NECTAR;
}

export function usarNectarDaVidaEterna(jogador) {
  const indice = (jogador.inventario ?? []).indexOf(NOME_NECTAR);
  if (indice === -1) return { usou: false };
  jogador.inventario.splice(indice, 1);
  jogador.hp = jogador.hpMax;
  return { usou: true };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- itens/nectar`
Expected: PASS.

- [ ] **Step 5: Adicionar a ação `usar_nectar` ao motor de turno**

Em `engine/combate/turno.js`, importar `usarNectarDaVidaEterna` de `@engine/itens/nectar.js`. Encontrar o ramo já existente de `"usar_pocao"` (Fase 10):

```js
  } else if (acao === "usar_pocao") {
    const resultado = usarPocaoDeCura(jogador);
    if (resultado.usou) {
      eventos.push({ tipo: "pocao_usada", valor: resultado.cura });
    } else {
      eventos.push({ tipo: "pocao_indisponivel" });
    }
  } else if (acao === "defender") {
```

Adicionar um ramo irmão logo antes de `"defender"`:

```js
  } else if (acao === "usar_nectar") {
    const resultado = usarNectarDaVidaEterna(jogador);
    eventos.push({ tipo: resultado.usou ? "nectar_usado" : "nectar_indisponivel" });
  } else if (acao === "defender") {
```

Adicionar 2 testes em `turno.test.js` espelhando os já existentes de `"usar_pocao"` (Fase 10) para `"usar_nectar"`.

- [ ] **Step 6: Rodar e confirmar sucesso**

Run: `npm test -- combate/turno`
Expected: PASS.

- [ ] **Step 7: Botão de Néctar na UI de batalha (só aparece quando há 1 disponível)**

Em `telaBatalha.js`, depois do botão `data-acao="usar_pocao"` (Fase 10), adicionar ao template:

```html
<button class="botao" data-acao="usar_nectar" style="display: none;">💖 Néctar</button>
```

Na lógica de montagem (mesmo ponto onde `atualizarBotaoItem` já roda para a Poção), adicionar: se `contarNectar(jogador) > 0`, mostrar o botão (`style.display = ""`) com o texto "💖 Néctar da Vida Eterna"; senão, manter oculto (diferente da Poção, que fica sempre visível mas desabilitada em 0 — o Néctar é raro o bastante para só aparecer quando existe, evitando poluir a barra de ações na maioria das partidas).

Em `controladorBatalha.js`, registrar o listener (`elementos.botaoNectar?.addEventListener("click", () => executar("usar_nectar"))`) e adicionar o case em `descreverEvento`:

```js
    case "nectar_usado": return "💖 Você usou o Néctar da Vida Eterna — HP totalmente restaurado!";
    case "nectar_indisponivel": return "Você não tem Néctar da Vida Eterna!";
```

Adicionar testes em `telaBatalha.test.js` cobrindo os dois estados (botão oculto sem néctar, visível com néctar).

- [ ] **Step 8: Rodar e confirmar sucesso**

Run: `npm test -- telaBatalha && npm test -- controladorBatalha`
Expected: PASS.

- [ ] **Step 9: Estender o pool de exploração com Néctar e as 4 relíquias**

Em `engine/masmorra/salas.js`, atualizar `POOL_ITENS_EXPLORACAO` e a lógica de sorteio para respeitar o limite do Néctar:

```js
export const POOL_ITENS_EXPLORACAO = [
  "Pena do Corvo Sombrio", "Pergaminho Arcano", "Essência da Noite",
  "Relíquia Brilhante", "Gema da Escuridão", "Fragmento Antigo",
  "Orbe da Fênix Flamejante", "Coração Flamejante", "Fragmento do Sol Caído",
  "Néctar da Vida Eterna", "Bússola do Destino",
];
```

Em `resolverTesouro(jogador)`, antes de sortear, filtrar o pool para excluir `"Néctar da Vida Eterna"` se `!podeGanharNectar(jogador)` (importar de `@engine/itens/nectar.js`); e, se o item sorteado for `"Fragmento do Sol Caído"`, chamar `resolverSegredo`-like revelação total em vez da revelação parcial — ver Step 10.

Atualizar os testes de `salas.test.js` (o teste "sem sorte, dá só ouro" precisa continuar determinístico — conferir se o novo pool maior não quebra o mock de `Math.random` existente, ajustando o índice esperado se necessário).

- [ ] **Step 10: Fragmento do Sol Caído revela a masmorra inteira**

Em `engine/masmorra/salas.js`, adicionar:

```js
export function revelarMasmorraInteira(sessao) {
  for (const celula of sessao.dungeon.grid.flat()) {
    celula.visited = true;
  }
}
```

Em `telaMasmorra.js`, no branch de `"treasure"` (Task 1), depois de obter `item`, checar:

```js
    if (celula.roomType === "treasure") {
      const { ouro, item } = resolverTesouro(jogador);
      registrarLog(`Você encontrou um tesouro: +${ouro} ouro${item ? ` e ${item}` : ""}!`);
      if (item === "Fragmento do Sol Caído") {
        revelarMasmorraInteira(sessao);
        registrarLog("O Fragmento do Sol Caído ilumina toda a masmorra!");
      }
      limparSala(sessao);
      renderizarGrade();
      return;
    }
```

Adicionar um teste em `salas.test.js` para `revelarMasmorraInteira` (marca todas as células como `visited: true`) e um teste de integração em `telaMasmorra.test.js` forçando o sorteio do Fragmento (mockar `Math.random` de forma que `resolverTesouro` sorteie exatamente esse item, ou testar `revelarMasmorraInteira` isoladamente e confiar na cobertura unitária — mais simples e menos frágil).

- [ ] **Step 11: Rodar a suíte completa**

Run: `npm test`
Expected: PASS.

- [ ] **Step 12: Verificar manualmente**

Run: `npm run dev`. Farmar tesouros de masmorra até sortear o Néctar da Vida Eterna: o botão "💖 Néctar" aparece em batalha e cura 100% ao usar. Farmar até sortear o Fragmento do Sol Caído: a masmorra inteira aparece revelada no mapa.

- [ ] **Step 13: Commit**

```bash
git add engine/itens/nectar.js engine/itens/nectar.test.js engine/combate/turno.js engine/combate/turno.test.js engine/masmorra/salas.js engine/masmorra/salas.test.js WebRPG/src/telas/batalha WebRPG/src/telas/masmorra
git commit -m "feat: Nectar da Vida Eterna funcional e Fragmento do Sol Caido revela a masmorra; demais 3 reliquias entram como coletaveis sem efeito passivo (decisao documentada)"
```

---

### Task 5: Playtest checklist e fechamento definitivo da spec

**Files:**
- Modify: `docs/superpowers/docs.md`
- Modify: `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`

- [ ] Pisar numa sala de armadilha, tesouro e segredo da masmorra: cada uma reage (dano, ouro/item, revelação) e não repete o efeito ao passar de novo.
- [ ] Vencer batalhas de treino, masmorra e um boss da Torre: cada uma tem chance de dropar item, além de XP/ouro; um jogador Arqueiro ganha mais ouro, um Assassino dropa item com mais frequência (conferir com várias tentativas).
- [ ] Criar personagens de pelo menos 3 classes diferentes: o sprite do herói (preview na criação e em batalha) muda de tonalidade por classe.
- [ ] Farmar um Néctar da Vida Eterna (tesouro de masmorra) e usá-lo em batalha: cura 100% do HP; farmar um Fragmento do Sol Caído: revela a masmorra inteira.
- [ ] Console do navegador sem erros/404s no fluxo todo.
- [ ] `npm test` (suíte completa) e `npm run build` passam.
- [ ] Atualizar `docs/superpowers/docs.md`: adicionar a linha da Fase 13 como ✅ Concluída.
- [ ] Atualizar a spec: marcar os achados #1, #4, #8, #9 da seção 13.1 como resolvidos; reconfirmar que os achados #2/#3 (tela de batalha visual para Arena/Guilda/Torre) continuam fora de escopo (já eram, seções 11.4/12.5) — **com esta fase, todos os achados numerados da seção 13 estão endereçados** (resolvidos ou explicitamente fora de escopo), fechando a spec por completo.
- [ ] **Reportar o resultado.** Se algum item da lista falhar, anotar exatamente qual e por quê.

---

## Self-Review

**Cobertura da spec** (seção 13.1, achados #1, #4, #8, #9):
- Salas de armadilha/tesouro/segredo funcionais → Task 1. ✅
- Drop de item em combate + bônus de classe ativados (treino, masmorra e Torre) → Task 2. ✅
- Sprite do herói varia por classe → Task 3 (decisão documentada: recolorir o existente, não baixar 6 sprites novos). ✅
- Néctar da Vida Eterna + relíquias de masmorra → Task 4, com 2 das 5 ganhando efeito mecânico real e as outras 3 documentadas como colecionáveis sem efeito passivo — decisão de escopo explícita, não uma lacuna descoberta depois. ✅

**Achados #2/#3 permanecem intencionalmente fora desta fase** (tela de batalha visual para Arena/Guilda/Torre) — já eram fora de escopo desde as seções 11.4/12.5, e nada nesta pesquisa mudou essa avaliação: Guilda resolve missões por chance (não há combate turno-a-turno para visualizar sem redesenhar o sistema inteiro), e Arena/Torre teriam custo de retrofit desproporcional ao valor desta fase.

**Consistência de assinatura:** `concederRecompensaVitoria` ganha uma chave nova (`itemGanho`) — quebra deliberada e corrigida dos 2 testes existentes (Task 2, Step 5), não uma regressão. `mostrarOverlayFim` acumula mais um campo opcional (`itemGanho`, junto do `eventosLevelUp` da Fase 12) — mesmo padrão aditivo/retrocompatível. `usar_nectar` segue exatamente o mesmo contrato de `usar_pocao` (Fase 10).

**Sinergia entre tasks:** o pool de itens de exploração (Task 1) é reaproveitado por Task 2 (drop de combate) e Task 4 (Néctar/relíquias) — um único lugar (`engine/masmorra/salas.js`) define "quais itens de material/relíquia existem no jogo", evitando 3 listas divergentes.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-14-webrpg-fase13-loot-masmorra-heroi.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
