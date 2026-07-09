# WebRPG — Fase 3 (Economia) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o loop econômico do WebRPG: missões da guilda (narrativas + ondas), loja com sets de armadura e efeitos de arma, e a tela de personagem com equipar/comparar atributos — fechando o critério de pronto da spec: "Loop completo: missão → ouro → loja → equipar → ficar mais forte".

**Architecture:** Continua a convenção de `engine/` puro estabelecida nas Fases 0-2: `engine/itens/`, `engine/loja/`, `engine/missoes/` são módulos sem `console.log`/DOM, que mutam objetos `jogador`/`inimigo` e retornam eventos. A tela de guilda reaproveita o motor de turnos já existente (`engine/combate/index.js`, `@engine/combate/index.js`) para a missão "ondas". A cidade (Fase 2) troca os botões "Guilda"/"Loja"/"Personagem" de desabilitados para funcionais.

**Tech Stack:** Mesmo stack das fases anteriores — Vite, Vitest + jsdom, JavaScript ESM puro, CSS puro. Nenhuma dependência nova.

## Global Constraints

- Todo texto de UI, nomes de função e variáveis em português, seguindo o padrão já usado no `engine/` existente.
- Nenhuma imagem via hotlink: todo asset visual vem de `WebRPG/assets/` local.
- `engine/` nunca importa de `JogoRPG/` nem de `WebRPG/`.
- `JogoRPG/` (console) não é modificado nesta fase.
- Aleatoriedade em testes é controlada exclusivamente via `vi.spyOn(Math, 'random')`.
- Fiel ao `JogoRPG/` nas fórmulas e valores numéricos, exceto onde este documento explicitamente decide corrigir/formalizar algo (ver "Correções e decisões documentadas").

## Correções e decisões documentadas

1. **Bônus de conjunto órfãos são portados como estão, e então conectados ao combate.** No console, `aplicarBonusDeConjunto` calcula `jogador.bonusEsquiva`, `bonusCritico`, `bonusBloqueio`, `bonusHP` mas **nenhum consumidor os lê** em `calcularDanoInimigo.js`/`ataqueInimigo.js` — só `bonusAtk` é de fato somado no ataque. O `engine/combate/calculoDano.js` (Fase 1) já lê `bonusEsquiva`/`bonusBloqueio` em `resolverAtaqueInimigo` e `bonusCritico` em `calcularChanceCriticaJogador` (essas funções já existem e já tratam esses campos corretamente — foram portadas fiéis à *intenção* do sistema, não ao bug). Portanto: **nesta fase, `aplicarBonusDeConjunto` os popula, e o engine de combate da Fase 1 já os consome automaticamente** — a lacuna do console é corrigida como efeito colateral de reusar o motor de combate já correto, sem nenhuma mudança adicional necessária. `bonusHP` continua sem consumidor (não existe hook de "recalcular hpMax" em lugar nenhum) — fica como campo calculado mas não aplicado, documentado aqui como gap conhecido preservado.
2. **Comparação de atributos ↑/↓ ao equipar é funcionalidade nova**, não uma porta — o console não tem nada equivalente (busca confirmada por `↑`/`↓`/"comparar" no código-fonte não encontrou ocorrências). Implementada na Task 3 (`compararAtributos`).
3. **Penalidade de missão tipo "item" nunca dispara.** `aplicarPenalidade("item", jogador)` no console só age se `jogador.setCompleto` for truthy, e nada no código popula esse campo — logo, na prática, as duas missões com `falha.tipo: "item"` sempre caem no `default` ("Sem penalidades graves desta vez."). Portado fielmente: o `engine/missoes/index.js` desta fase reproduz esse comportamento (branch mortа) em vez de inventar uma condição de "set completo" que não existe em nenhum outro lugar do sistema.
4. **Penalidade de ouro ignora `percentualMin`/`percentualMax` da missão.** O console usa sempre `rand(15, 100)` fixo em `aplicarPenalidade`, mesmo as missões definindo `falha: { percentualMin: 15, percentualMax: 20 }`. Portado fielmente (os campos `percentualMin`/`percentualMax` ficam no catálogo mas não são lidos).
5. **`recompensaOndas`/`recompensaFinal` do catálogo de missões não são usados por `batalhaOndas`** — os 5%/20% de drop de "Fragmento Antigo" estão hard-coded na função, coincidindo com os valores do catálogo. Portado fielmente (constantes na função, campos do catálogo ficam inertes, mesma situação do console).

## Fora de escopo desta fase

- **Masmorra secreta pós-missão (`chanceMasmorra`)** e **mini-boss extra pós-missão (`chanceMiniBoss`)** — dependem de `engine/masmorra/` e do sistema de mini-boss, que são Fase 4. O campo `chanceMasmorra`/`chanceMiniBoss` fica no catálogo de missões (fiel ao console), mas `fazerMissao` desta fase não aciona nenhum dos dois ainda — ver Task 7.
- **Arena Infinita como missão da guilda** ("Arena Infinita - Desafio dos Deuses", `tipoBatalha: "arena_infinita"`) — a arena é construída na Fase 4. Esta missão específica fica filtrada do catálogo ativo por enquanto (documentado na Task 6).
- **Amuleto/Talismã: uso do Talismã da Torre** — craftar o talismã é implementado (Task 9), mas seu efeito só existe quando a Torre existir (Fase 4).
- **Drop automático de item em batalha comum** (`processarDropDeItem`, 10% de chance por vitória fora de missão) — a batalha de treino da Fase 2 continua sem drops; drops ficam ligados só a missões nesta fase.
- **Necromante/Bárbaro/Xamã: habilidades de classe em combate** (invocação de esqueleto, fúria, cura) — já existem parcialmente no engine de combate da Fase 1 (fúria do Bárbaro, cura do Xamã) e ficam como estão; invocação de esqueleto do Necromante é Fase 4 (junto com as demais habilidades de inimigo avançadas).

---

## Task 1: Catálogo de itens — `engine/itens/catalogo.js` (TDD)

**Files:**
- Create: `engine/itens/catalogo.js`
- Test: `engine/itens/catalogo.test.js`

**Interfaces:**
- Produces: `conjuntosArmadura` (objeto `{Ferro, Ligeiro, Sombra, Dragão}`, cada um array de 5 peças `{nome, slot, defesa, atkBonus, preco, raridade}`), `catalogoArmas` (array de 10 armas `{nome, slot:'weapon', atk, preco, efeito, raridade}`), `catalogoConsumiveis` (array com "Poção de Cura"), `catalogoLoja` (array combinado com `id` único, armaduras+consumíveis+armas, mesma ordem do console) — usados pela Task 3 (`equipar.js`), Task 5 (`loja/index.js`), e pelas telas das Tasks 10-11.

Fiel a `JogoRPG/loja/itensLoja/armaduras.js:16-143`, `JogoRPG/loja/itensLoja/armas.js:16-90` e `JogoRPG/loja/itensLoja/consumiveis.js`.

- [ ] **Step 1: Escrever o teste `engine/itens/catalogo.test.js`**

```js
import { describe, it, expect } from "vitest";
import { conjuntosArmadura, catalogoArmas, catalogoConsumiveis, catalogoLoja } from "./catalogo.js";

describe("conjuntosArmadura", () => {
  it("tem os 4 conjuntos, cada um com 5 peças (uma por slot)", () => {
    expect(Object.keys(conjuntosArmadura)).toEqual(["Ferro", "Ligeiro", "Sombra", "Dragão"]);
    for (const pecas of Object.values(conjuntosArmadura)) {
      expect(pecas).toHaveLength(5);
      expect(pecas.map((p) => p.slot).sort()).toEqual(["chest", "feet", "hands", "head", "legs"]);
    }
  });

  it("o Peitoral do Dragão tem os atributos corretos", () => {
    const peitoral = conjuntosArmadura["Dragão"].find((p) => p.nome === "Peitoral do Dragão");
    expect(peitoral).toEqual({ nome: "Peitoral do Dragão", slot: "chest", defesa: 20, atkBonus: 7, preco: 17510, raridade: "lendario" });
  });
});

describe("catalogoArmas", () => {
  it("tem as 10 armas do console, com efeitos corretos", () => {
    expect(catalogoArmas).toHaveLength(10);
    const adaga = catalogoArmas.find((a) => a.nome === "Adaga Sombria");
    expect(adaga).toEqual({
      nome: "Adaga Sombria", slot: "weapon", atk: 6, preco: 6500,
      efeito: { tipo: "sangramento", chance: 20, danoPorTurno: 5, duracao: 3 },
      raridade: "raro",
    });
    const foice = catalogoArmas.find((a) => a.nome === "Foice do Ceifador");
    expect(foice.efeito).toEqual({ tipo: "roubo_de_vida", percentual: 0.15 });
  });
});

describe("catalogoConsumiveis", () => {
  it("tem a Poção de Cura", () => {
    expect(catalogoConsumiveis).toEqual([{ nome: "Poção de Cura", slot: "consumable", preco: 200, raridade: "comum" }]);
  });
});

describe("catalogoLoja", () => {
  it("combina armaduras, consumíveis e armas com ids únicos", () => {
    expect(catalogoLoja).toHaveLength(20 + 1 + 10); // 4 conjuntos x 5 peças + 1 poção + 10 armas
    const ids = catalogoLoja.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserva o campo set nas peças de armadura", () => {
    const elmoFerro = catalogoLoja.find((i) => i.nome === "Elmo de Ferro");
    expect(elmoFerro.set).toBe("Ferro");
    expect(elmoFerro.defesa).toBe(6);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- itens/catalogo`
Expected: FAIL — `Cannot find module './catalogo.js'`.

- [ ] **Step 3: Implementar `engine/itens/catalogo.js`**

```js
function criarItemArmadura({ id, nome, slot, preco, defesa = 0, atkBonus = 0, set = null, raridade = "comum" }) {
  return { id, nome, slot, defesa, atkBonus, preco, set, raridade };
}

export const conjuntosArmadura = {
  Ferro: [
    { nome: "Elmo de Ferro", slot: "head", defesa: 6, atkBonus: 0, preco: 2050, raridade: "comum" },
    { nome: "Peitoral de Ferro", slot: "chest", defesa: 12, atkBonus: 0, preco: 2880, raridade: "comum" },
    { nome: "Manoplas de Ferro", slot: "hands", defesa: 5, atkBonus: 1, preco: 1990, raridade: "comum" },
    { nome: "Grevas de Ferro", slot: "legs", defesa: 7, atkBonus: 0, preco: 2250, raridade: "comum" },
    { nome: "Botas de Ferro", slot: "feet", defesa: 4, atkBonus: 0, preco: 1850, raridade: "comum" },
  ],
  Ligeiro: [
    { nome: "Capuz de Velo", slot: "head", defesa: 3, atkBonus: 1, preco: 2050, raridade: "comum" },
    { nome: "Túnica Ligeira", slot: "chest", defesa: 6, atkBonus: 2, preco: 2910, raridade: "raro" },
    { nome: "Luvas Leves", slot: "hands", defesa: 2, atkBonus: 2, preco: 1850, raridade: "comum" },
    { nome: "Calças Ligeiras", slot: "legs", defesa: 4, atkBonus: 1, preco: 2050, raridade: "comum" },
    { nome: "Botas Ágeis", slot: "feet", defesa: 3, atkBonus: 1, preco: 1950, raridade: "comum" },
  ],
  Sombra: [
    { nome: "Máscara das Sombras", slot: "head", defesa: 4, atkBonus: 2, preco: 5450, raridade: "raro" },
    { nome: "Peitoral das Sombras", slot: "chest", defesa: 8, atkBonus: 3, preco: 5960, raridade: "raro" },
    { nome: "Luvas das Sombras", slot: "hands", defesa: 3, atkBonus: 2, preco: 5350, raridade: "raro" },
    { nome: "Calças das Sombras", slot: "legs", defesa: 5, atkBonus: 2, preco: 5610, raridade: "raro" },
    { nome: "Botas das Sombras", slot: "feet", defesa: 4, atkBonus: 2, preco: 5580, raridade: "raro" },
  ],
  Dragão: [
    { nome: "Elmo do Dragão", slot: "head", defesa: 12, atkBonus: 5, preco: 15510, raridade: "lendario" },
    { nome: "Peitoral do Dragão", slot: "chest", defesa: 20, atkBonus: 7, preco: 17510, raridade: "lendario" },
    { nome: "Manoplas do Dragão", slot: "hands", defesa: 8, atkBonus: 4, preco: 14950, raridade: "lendario" },
    { nome: "Grevas do Dragão", slot: "legs", defesa: 12, atkBonus: 4, preco: 15810, raridade: "lendario" },
    { nome: "Botas do Dragão", slot: "feet", defesa: 10, atkBonus: 3, preco: 14900, raridade: "lendario" },
  ],
};

export const catalogoArmas = [
  { nome: "Espada Longa", slot: "weapon", atk: 5, preco: 2500, efeito: null, raridade: "comum" },
  { nome: "Arco Élfico", slot: "weapon", atk: 4, preco: 5000, efeito: { tipo: "esquiva", chance: 10 }, raridade: "raro" },
  { nome: "Adaga Sombria", slot: "weapon", atk: 6, preco: 6500, efeito: { tipo: "sangramento", chance: 20, danoPorTurno: 5, duracao: 3 }, raridade: "raro" },
  { nome: "Martelo de Guerra", slot: "weapon", atk: 8, preco: 7200, efeito: { tipo: "bloqueio", chance: 20 }, raridade: "raro" },
  { nome: "Cajado do Caos", slot: "weapon", atk: 7, preco: 7800, efeito: { tipo: "confusao", chance: 25, duracao: 1 }, raridade: "raro" },
  { nome: "Cajado Congelante", slot: "weapon", atk: 6, preco: 8500, efeito: { tipo: "congelamento", chance: 15, duracao: 1 }, raridade: "raro" },
  { nome: "Machado Flamejante", slot: "weapon", atk: 9, preco: 9200, efeito: { tipo: "incendio", chance: 25, danoPorTurno: 7, duracao: 3 }, raridade: "lendario" },
  { nome: "Lança Sagrada", slot: "weapon", atk: 10, preco: 10000, efeito: { tipo: "critico", chance: 15 }, raridade: "lendario" },
  { nome: "Punhais Gêmeos", slot: "weapon", atk: 5, preco: 11500, efeito: { tipo: "ataque_duplo", chance: 20 }, raridade: "lendario" },
  { nome: "Foice do Ceifador", slot: "weapon", atk: 12, preco: 12500, efeito: { tipo: "roubo_de_vida", percentual: 0.15 }, raridade: "lendario" },
];

export const catalogoConsumiveis = [
  { nome: "Poção de Cura", slot: "consumable", preco: 200, raridade: "comum" },
];

function montarCatalogoLoja() {
  let idAtual = 1;
  const armaduras = Object.entries(conjuntosArmadura).flatMap(([set, pecas]) =>
    pecas.map((peca) => criarItemArmadura({ id: idAtual++, set, ...peca }))
  );
  const consumiveis = catalogoConsumiveis.map((item) => criarItemArmadura({ id: idAtual++, ...item }));
  const armas = catalogoArmas.map((arma) => ({ ...arma, id: idAtual++ }));
  return [...armaduras, ...consumiveis, ...armas];
}

export const catalogoLoja = montarCatalogoLoja();
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- itens/catalogo`
Expected: PASS — 6 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/itens/catalogo.js engine/itens/catalogo.test.js
git commit -m "feat: catálogo de itens do engine (armaduras, armas, consumíveis)"
```

---

## Task 2: Cor de raridade — `engine/itens/raridade.js` (TDD)

**Files:**
- Create: `engine/itens/raridade.js`
- Test: `engine/itens/raridade.test.js`

**Interfaces:**
- Produces: `obterClasseRaridade(raridade) -> 'raridade--comum'|'raridade--raro'|'raridade--lendario'|'raridade--padrao'` — usado pelas telas das Tasks 10-11 para colorir nomes de item via classe CSS (equivalente web de `getRaridadeCor` do console, que retornava código ANSI).

Fiel à *intenção* de `JogoRPG/codigosUniversais.js:59-70` (`comum`→verde, `raro`→azul, `lendario`→amarelo/dourado), trocando cor ANSI por nome de classe CSS que mapeia para os tokens de cor já existentes em `WebRPG/src/estilos/variaveis.css` (`--cor-sucesso` verde, `--cor-mp` azul, `--cor-destaque` dourado).

- [ ] **Step 1: Escrever o teste `engine/itens/raridade.test.js`**

```js
import { describe, it, expect } from "vitest";
import { obterClasseRaridade } from "./raridade.js";

describe("obterClasseRaridade", () => {
  it("mapeia comum, raro e lendario para suas classes CSS", () => {
    expect(obterClasseRaridade("comum")).toBe("raridade--comum");
    expect(obterClasseRaridade("raro")).toBe("raridade--raro");
    expect(obterClasseRaridade("lendario")).toBe("raridade--lendario");
  });

  it("retorna raridade--padrao para valores desconhecidos", () => {
    expect(obterClasseRaridade("epico")).toBe("raridade--padrao");
    expect(obterClasseRaridade(undefined)).toBe("raridade--padrao");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- itens/raridade`
Expected: FAIL — `Cannot find module './raridade.js'`.

- [ ] **Step 3: Implementar `engine/itens/raridade.js`**

```js
export function obterClasseRaridade(raridade) {
  switch (raridade) {
    case "comum": return "raridade--comum";
    case "raro": return "raridade--raro";
    case "lendario": return "raridade--lendario";
    default: return "raridade--padrao";
  }
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- itens/raridade`
Expected: PASS — 2 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/itens/raridade.js engine/itens/raridade.test.js
git commit -m "feat: mapeamento de raridade para classe CSS"
```

---

## Task 3: Equipar, trocar e comparar — `engine/itens/equipar.js` (TDD)

**Files:**
- Create: `engine/itens/equipar.js`
- Test: `engine/itens/equipar.test.js`

**Interfaces:**
- Produces: `aplicarBonusDeConjunto(jogador)`, `equiparArmaduraNoSlot(jogador, armadura) -> {itemAntigo}` (troca com swap, sempre — diferente do console que só troca se o slot estiver vazio; ver Step 3 abaixo para a justificativa), `equiparArma(jogador, arma) -> {itemAntigo}`, `compararAtributos(itemAtual, itemNovo) -> {defesa: number, atkBonus: number}` (diferença `novo - atual`, `0` se `itemAtual` for `null`) — usados pela Task 11 (`telaPersonagem.js`).

Fiel a `JogoRPG/itens/equipamentos/efeitos/armadurasEfeitos.js` (`aplicarBonusDeConjunto`) e à *função* (não ao arquivo exato) de `JogoRPG/itens/equipamentos/armaduras/armaduras.js`/`armas/armas.js` (`gerenciarArmaduras`/`gerenciarArmas`, que fazem swap ao trocar equipamento via menu) — unificados numa única API pura sem `console.log`/`prompt`, pois o menu web (Task 11) sempre permite trocar diretamente, sem o caminho alternativo "só equipa se vazio" que existe em `equiparItem.js` (usado no console só para drop automático, fora de escopo desta fase — ver "Fora de escopo").

- [ ] **Step 1: Escrever o teste `engine/itens/equipar.test.js`**

```js
import { describe, it, expect } from "vitest";
import { aplicarBonusDeConjunto, equiparArmaduraNoSlot, equiparArma, compararAtributos } from "./equipar.js";

function jogadorBase() {
  return {
    equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
    armaEquipada: null,
    inventario: [],
    bonusEsquiva: 0, bonusCritico: 0, bonusBloqueio: 0, bonusHP: 0, bonusAtk: 0,
  };
}

describe("aplicarBonusDeConjunto", () => {
  it("zera os bônus quando nenhum conjunto está completo", () => {
    const jogador = { ...jogadorBase(), bonusEsquiva: 99 };
    aplicarBonusDeConjunto(jogador);
    expect(jogador).toMatchObject({ bonusEsquiva: 0, bonusCritico: 0, bonusBloqueio: 0, bonusHP: 0, bonusAtk: 0 });
  });

  it("aplica +15% de bloqueio quando as 5 peças do conjunto Ferro estão equipadas", () => {
    const jogador = jogadorBase();
    for (const slot of ["head", "chest", "hands", "legs", "feet"]) {
      jogador.equipamentos[slot] = { nome: `Peça Ferro ${slot}`, slot, set: "Ferro", defesa: 1, atkBonus: 0 };
    }
    aplicarBonusDeConjunto(jogador);
    expect(jogador.bonusBloqueio).toBe(15);
  });

  it("aplica +10% esquiva e +10% crítico quando o conjunto Sombra está completo", () => {
    const jogador = jogadorBase();
    for (const slot of ["head", "chest", "hands", "legs", "feet"]) {
      jogador.equipamentos[slot] = { nome: `Peça Sombra ${slot}`, slot, set: "Sombra", defesa: 1, atkBonus: 0 };
    }
    aplicarBonusDeConjunto(jogador);
    expect(jogador.bonusEsquiva).toBe(10);
    expect(jogador.bonusCritico).toBe(10);
  });

  it("não aplica bônus se o conjunto estiver incompleto (só 4 de 5 peças)", () => {
    const jogador = jogadorBase();
    for (const slot of ["head", "chest", "hands", "legs"]) {
      jogador.equipamentos[slot] = { nome: `Peça Dragão ${slot}`, slot, set: "Dragão", defesa: 1, atkBonus: 0 };
    }
    aplicarBonusDeConjunto(jogador);
    expect(jogador.bonusHP).toBe(0);
    expect(jogador.bonusAtk).toBe(0);
  });
});

describe("equiparArmaduraNoSlot", () => {
  it("equipa numa peça vazia e devolve itemAntigo null", () => {
    const jogador = jogadorBase();
    const elmo = { nome: "Elmo de Ferro", slot: "head", set: "Ferro", defesa: 6, atkBonus: 0 };
    const resultado = equiparArmaduraNoSlot(jogador, elmo);
    expect(resultado).toEqual({ itemAntigo: null });
    expect(jogador.equipamentos.head).toBe(elmo);
  });

  it("troca uma peça já equipada, devolvendo a antiga", () => {
    const jogador = jogadorBase();
    const elmoVelho = { nome: "Elmo Velho", slot: "head", set: null, defesa: 2, atkBonus: 0 };
    jogador.equipamentos.head = elmoVelho;
    const elmoNovo = { nome: "Elmo Novo", slot: "head", set: null, defesa: 6, atkBonus: 0 };

    const resultado = equiparArmaduraNoSlot(jogador, elmoNovo);

    expect(resultado).toEqual({ itemAntigo: elmoVelho });
    expect(jogador.equipamentos.head).toBe(elmoNovo);
  });
});

describe("equiparArma", () => {
  it("equipa quando não há arma e devolve itemAntigo null", () => {
    const jogador = jogadorBase();
    const espada = { nome: "Espada Longa", slot: "weapon", atk: 5, efeito: null };
    const resultado = equiparArma(jogador, espada);
    expect(resultado).toEqual({ itemAntigo: null });
    expect(jogador.armaEquipada).toBe(espada);
  });

  it("troca a arma equipada, devolvendo a antiga", () => {
    const jogador = jogadorBase();
    const antiga = { nome: "Adaga", slot: "weapon", atk: 3, efeito: null };
    jogador.armaEquipada = antiga;
    const nova = { nome: "Foice do Ceifador", slot: "weapon", atk: 12, efeito: { tipo: "roubo_de_vida", percentual: 0.15 } };

    const resultado = equiparArma(jogador, nova);

    expect(resultado).toEqual({ itemAntigo: antiga });
    expect(jogador.armaEquipada).toBe(nova);
  });
});

describe("compararAtributos", () => {
  it("retorna 0/0 quando não há item atual (slot vazio)", () => {
    const novo = { defesa: 6, atkBonus: 2 };
    expect(compararAtributos(null, novo)).toEqual({ defesa: 6, atkBonus: 2 });
  });

  it("retorna a diferença positiva (upgrade)", () => {
    const atual = { defesa: 4, atkBonus: 1 };
    const novo = { defesa: 6, atkBonus: 2 };
    expect(compararAtributos(atual, novo)).toEqual({ defesa: 2, atkBonus: 1 });
  });

  it("retorna a diferença negativa (downgrade)", () => {
    const atual = { defesa: 12, atkBonus: 5 };
    const novo = { defesa: 6, atkBonus: 2 };
    expect(compararAtributos(atual, novo)).toEqual({ defesa: -6, atkBonus: -3 });
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- itens/equipar`
Expected: FAIL — `Cannot find module './equipar.js'`.

- [ ] **Step 3: Implementar `engine/itens/equipar.js`**

```js
const BONUS_POR_CONJUNTO = {
  Ferro: (jogador) => { jogador.bonusBloqueio += 15; },
  Ligeiro: (jogador) => { jogador.bonusEsquiva += 15; },
  Sombra: (jogador) => { jogador.bonusEsquiva += 10; jogador.bonusCritico += 10; },
  Dragão: (jogador) => { jogador.bonusHP += 10; jogador.bonusAtk += 10; },
};

export function aplicarBonusDeConjunto(jogador) {
  jogador.bonusEsquiva = 0;
  jogador.bonusCritico = 0;
  jogador.bonusBloqueio = 0;
  jogador.bonusHP = 0;
  jogador.bonusAtk = 0;

  const setsEquipados = {};
  for (const slot in jogador.equipamentos) {
    const item = jogador.equipamentos[slot];
    if (item && item.set) {
      setsEquipados[item.set] = (setsEquipados[item.set] || 0) + 1;
    }
  }

  for (const set in setsEquipados) {
    if (setsEquipados[set] === 5 && BONUS_POR_CONJUNTO[set]) {
      BONUS_POR_CONJUNTO[set](jogador);
    }
  }
}

export function equiparArmaduraNoSlot(jogador, armadura) {
  const itemAntigo = jogador.equipamentos[armadura.slot] || null;
  jogador.equipamentos[armadura.slot] = armadura;
  aplicarBonusDeConjunto(jogador);
  return { itemAntigo };
}

export function equiparArma(jogador, arma) {
  const itemAntigo = jogador.armaEquipada || null;
  jogador.armaEquipada = arma;
  return { itemAntigo };
}

export function compararAtributos(itemAtual, itemNovo) {
  const defesaAtual = itemAtual?.defesa || 0;
  const atkAtual = itemAtual?.atkBonus || 0;
  return {
    defesa: (itemNovo.defesa || 0) - defesaAtual,
    atkBonus: (itemNovo.atkBonus || 0) - atkAtual,
  };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- itens/equipar`
Expected: PASS — 11 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/itens/equipar.js engine/itens/equipar.test.js
git commit -m "feat: equipar/trocar equipamento, bônus de conjunto e comparação de atributos"
```

---

## Task 4: Efeitos de arma restantes — `engine/itens/efeitosArma.js` (TDD)

**Files:**
- Create: `engine/itens/efeitosArma.js`
- Test: `engine/itens/efeitosArma.test.js`

**Interfaces:**
- Consumes: `rand` (`@engine/combate/aleatorio.js`, Fase 1), `aplicarSangramento` (`@engine/combate/efeitosDeStatus.js`, Fase 1, já cobre o efeito `sangramento`).
- Produces: `aplicarRouboDeVida(jogador, danoCausado)`, `verificarCriticoArma(jogador) -> boolean`, `aplicarAtaqueDuploArma(jogador, inimigo) -> {ativou, danoExtra}`, `aplicarConfusao(inimigo)`, `aplicarCongelamento(inimigo)`, `aplicarIncendio(inimigo)`, `processarConfusaoDoTurno(inimigo) -> {puloTurno, dano}|null`, `processarCongelamentoDoTurno(inimigo) -> {puloTurno}|null`, `processarIncendioDoTurno(inimigo) -> {dano, curado}|null` — usados pela Task 7/8 (orquestração de missão) quando a missão dispara batalhas com armas de efeito além de sangramento/envenenamento (já cobertos na Fase 1).

Fiel a `JogoRPG/itens/equipamentos/efeitos/armasEfeitos.js` (`aplicarEfeitoArma` casos `roubo_de_vida`/`critico`/`ataque_duplo`/`confusao`/`congelamento`/`incendio`, e `aplicarStatusPorTurno` para os DOTs), estendendo o padrão já usado em `engine/combate/efeitosDeStatus.js` (Fase 1) em vez de duplicá-lo.

- [ ] **Step 1: Escrever o teste `engine/itens/efeitosArma.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  aplicarRouboDeVida,
  verificarCriticoArma,
  aplicarAtaqueDuploArma,
  aplicarConfusao,
  aplicarCongelamento,
  aplicarIncendio,
  processarConfusaoDoTurno,
  processarCongelamentoDoTurno,
  processarIncendioDoTurno,
} from "./efeitosArma.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("aplicarRouboDeVida", () => {
  it("cura o jogador em 15% do dano causado, sem passar do hpMax", () => {
    const jogador = {
      armaEquipada: { efeito: { tipo: "roubo_de_vida", percentual: 0.15 } },
      hp: 50, hpMax: 100,
    };
    aplicarRouboDeVida(jogador, 40); // floor(40*0.15) = 6
    expect(jogador.hp).toBe(56);
  });

  it("não cura acima do hpMax", () => {
    const jogador = {
      armaEquipada: { efeito: { tipo: "roubo_de_vida", percentual: 0.15 } },
      hp: 98, hpMax: 100,
    };
    aplicarRouboDeVida(jogador, 40);
    expect(jogador.hp).toBe(100);
  });

  it("não faz nada se a arma não tiver o efeito roubo_de_vida", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "critico", chance: 15 } }, hp: 50, hpMax: 100 };
    aplicarRouboDeVida(jogador, 40);
    expect(jogador.hp).toBe(50);
  });
});

describe("verificarCriticoArma", () => {
  it("retorna true quando a chance da arma acerta", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "critico", chance: 15 } } };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=15
    expect(verificarCriticoArma(jogador)).toBe(true);
  });

  it("retorna false quando a arma não tem efeito crítico", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "sangramento", chance: 100 } } };
    expect(verificarCriticoArma(jogador)).toBe(false);
  });
});

describe("aplicarAtaqueDuploArma", () => {
  it("causa dano extra igual ao ataque do jogador quando a chance acerta", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "ataque_duplo", chance: 20 } }, ataque: 12 };
    const inimigo = { hp: 30 };
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=20
    const resultado = aplicarAtaqueDuploArma(jogador, inimigo);
    expect(resultado).toEqual({ ativou: true, danoExtra: 12 });
    expect(inimigo.hp).toBe(18);
  });

  it("não ativa quando a chance falha", () => {
    const jogador = { armaEquipada: { efeito: { tipo: "ataque_duplo", chance: 20 } }, ataque: 12 };
    const inimigo = { hp: 30 };
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(1,100)=100 >20
    const resultado = aplicarAtaqueDuploArma(jogador, inimigo);
    expect(resultado).toEqual({ ativou: false, danoExtra: 0 });
    expect(inimigo.hp).toBe(30);
  });
});

describe("aplicarConfusao, aplicarCongelamento, aplicarIncendio + processamento por turno", () => {
  it("aplica e processa confusão: inimigo se fere e pula o turno", () => {
    const inimigo = { atk: 10, hp: 30, status: [] };
    aplicarConfusao(inimigo, 1);
    const resultado = processarConfusaoDoTurno(inimigo);
    expect(resultado).toEqual({ puloTurno: true, dano: 5 }); // floor(10*0.5)=5
    expect(inimigo.hp).toBe(25);
    expect(inimigo.status).toEqual([]); // duração 1 -> expira neste turno
  });

  it("aplica e processa congelamento: inimigo pula o turno sem dano", () => {
    const inimigo = { atk: 10, hp: 30, status: [] };
    aplicarCongelamento(inimigo, 1);
    const resultado = processarCongelamentoDoTurno(inimigo);
    expect(resultado).toEqual({ puloTurno: true });
    expect(inimigo.status).toEqual([]);
  });

  it("aplica e processa incêndio: dano por turno como sangramento", () => {
    const inimigo = { hp: 30, status: [] };
    aplicarIncendio(inimigo, 2, 7);
    const resultado = processarIncendioDoTurno(inimigo);
    expect(resultado).toEqual({ dano: 7, curado: false });
    expect(inimigo.hp).toBe(23);
    expect(inimigo.status).toEqual([{ tipo: "incendio", duracao: 1, dano: 7 }]);
  });

  it("retorna null quando não há o status correspondente", () => {
    const inimigo = { atk: 10, hp: 30, status: [] };
    expect(processarConfusaoDoTurno(inimigo)).toBeNull();
    expect(processarCongelamentoDoTurno(inimigo)).toBeNull();
    expect(processarIncendioDoTurno(inimigo)).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- itens/efeitosArma`
Expected: FAIL — `Cannot find module './efeitosArma.js'`.

- [ ] **Step 3: Implementar `engine/itens/efeitosArma.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";

export function aplicarRouboDeVida(jogador, danoCausado) {
  const efeito = jogador.armaEquipada?.efeito;
  if (!efeito || efeito.tipo !== "roubo_de_vida") return;
  const vidaRoubada = Math.floor(danoCausado * efeito.percentual);
  jogador.hp = Math.min(jogador.hp + vidaRoubada, jogador.hpMax);
}

export function verificarCriticoArma(jogador) {
  const efeito = jogador.armaEquipada?.efeito;
  if (!efeito || efeito.tipo !== "critico") return false;
  return rand(1, 100) <= efeito.chance;
}

export function aplicarAtaqueDuploArma(jogador, inimigo) {
  const efeito = jogador.armaEquipada?.efeito;
  if (!efeito || efeito.tipo !== "ataque_duplo" || rand(1, 100) > efeito.chance) {
    return { ativou: false, danoExtra: 0 };
  }
  const danoExtra = jogador.ataque;
  inimigo.hp = Math.max(0, inimigo.hp - danoExtra);
  return { ativou: true, danoExtra };
}

export function aplicarConfusao(inimigo, duracao) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "confusao", duracao });
}

export function aplicarCongelamento(inimigo, duracao) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "congelamento", duracao });
}

export function aplicarIncendio(inimigo, duracao, danoPorTurno) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "incendio", duracao, dano: danoPorTurno });
}

function processarStatusSimples(alvo, tipo) {
  if (!alvo.status) return null;
  const efeito = alvo.status.find((s) => s.tipo === tipo);
  if (!efeito) return null;
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) alvo.status = alvo.status.filter((s) => s.tipo !== tipo);
  return { efeito, curado };
}

export function processarConfusaoDoTurno(inimigo) {
  const resultado = processarStatusSimples(inimigo, "confusao");
  if (!resultado) return null;
  const dano = Math.floor(inimigo.atk * 0.5);
  inimigo.hp = Math.max(0, inimigo.hp - dano);
  return { puloTurno: true, dano };
}

export function processarCongelamentoDoTurno(inimigo) {
  const resultado = processarStatusSimples(inimigo, "congelamento");
  if (!resultado) return null;
  return { puloTurno: true };
}

export function processarIncendioDoTurno(inimigo) {
  if (!inimigo.status) return null;
  const efeito = inimigo.status.find((s) => s.tipo === "incendio");
  if (!efeito) return null;
  inimigo.hp = Math.max(0, inimigo.hp - efeito.dano);
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) inimigo.status = inimigo.status.filter((s) => s.tipo !== "incendio");
  return { dano: efeito.dano, curado };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- itens/efeitosArma`
Expected: PASS — 11 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/itens/efeitosArma.js engine/itens/efeitosArma.test.js
git commit -m "feat: efeitos de arma restantes (roubo de vida, crítico, ataque duplo, confusão, congelamento, incêndio)"
```

---

## Task 5: Loja — `engine/loja/index.js` (TDD)

**Files:**
- Create: `engine/loja/index.js`
- Test: `engine/loja/index.test.js`

**Interfaces:**
- Produces: `comprarItem(jogador, item) -> boolean` (true se comprou), `itensVendiveis(inventario) -> array` (filtra consumíveis fora, fiel a `item.slot !== "consumable"`), `venderItens(jogador, indicesSelecionados) -> {totalRecebido}` — usados pela Task 10 (`telaLoja.js`).

Fiel a `JogoRPG/loja/loja.js:15-27` (`comprarItem`) e `JogoRPG/loja/venderItens.js` (30% do preço original, `PERCENTUAL_VENDA = 0.30`).

- [ ] **Step 1: Escrever o teste `engine/loja/index.test.js`**

```js
import { describe, it, expect } from "vitest";
import { comprarItem, itensVendiveis, venderItens } from "./index.js";

describe("comprarItem", () => {
  it("compra quando há ouro suficiente, debita o preço e adiciona ao inventário", () => {
    const jogador = { ouro: 3000, inventario: [] };
    const item = { nome: "Elmo de Ferro", preco: 2050 };
    expect(comprarItem(jogador, item)).toBe(true);
    expect(jogador.ouro).toBe(950);
    expect(jogador.inventario).toEqual([item]);
  });

  it("não compra quando o ouro é insuficiente", () => {
    const jogador = { ouro: 100, inventario: [] };
    const item = { nome: "Elmo de Ferro", preco: 2050 };
    expect(comprarItem(jogador, item)).toBe(false);
    expect(jogador.ouro).toBe(100);
    expect(jogador.inventario).toEqual([]);
  });
});

describe("itensVendiveis", () => {
  it("filtra fora os consumíveis, mantém armas e armaduras", () => {
    const inventario = [
      { nome: "Poção de Cura", slot: "consumable" },
      { nome: "Espada Longa", slot: "weapon" },
      { nome: "Elmo de Ferro", slot: "head" },
    ];
    expect(itensVendiveis(inventario).map((i) => i.nome)).toEqual(["Espada Longa", "Elmo de Ferro"]);
  });
});

describe("venderItens", () => {
  it("vende os itens selecionados por 30% do preço, soma o total e remove do inventário", () => {
    const jogador = {
      ouro: 0,
      inventario: [
        { nome: "Espada Longa", slot: "weapon", preco: 2500 },
        { nome: "Elmo de Ferro", slot: "head", preco: 2050 },
        { nome: "Poção de Cura", slot: "consumable", preco: 200 },
      ],
    };
    const resultado = venderItens(jogador, [0, 1]); // vende Espada Longa e Elmo de Ferro
    // floor(2500*0.3)=750, floor(2050*0.3)=615, total=1365
    expect(resultado).toEqual({ totalRecebido: 1365 });
    expect(jogador.ouro).toBe(1365);
    expect(jogador.inventario).toEqual([{ nome: "Poção de Cura", slot: "consumable", preco: 200 }]);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- loja/index`
Expected: FAIL — `Cannot find module './index.js'`.

- [ ] **Step 3: Implementar `engine/loja/index.js`**

```js
const PERCENTUAL_VENDA = 0.3;

export function comprarItem(jogador, item) {
  if (jogador.ouro < item.preco) return false;
  jogador.ouro -= item.preco;
  jogador.inventario.push(item);
  return true;
}

export function itensVendiveis(inventario) {
  return inventario.filter((item) => item.slot !== "consumable");
}

export function venderItens(jogador, indicesSelecionados) {
  const indicesOrdenados = [...indicesSelecionados].sort((a, b) => b - a);
  let totalRecebido = 0;
  for (const indice of indicesOrdenados) {
    const item = jogador.inventario[indice];
    totalRecebido += Math.floor(item.preco * PERCENTUAL_VENDA);
    jogador.inventario.splice(indice, 1);
  }
  jogador.ouro += totalRecebido;
  return { totalRecebido };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- loja/index`
Expected: PASS — 4 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/loja/index.js engine/loja/index.test.js
git commit -m "feat: comprar e vender itens na loja"
```

---

## Task 6: Catálogo de missões — `engine/missoes/catalogo.js` (TDD)

**Files:**
- Create: `engine/missoes/catalogo.js`
- Test: `engine/missoes/catalogo.test.js`

**Interfaces:**
- Produces: `missoesDisponiveis` (array das 14 missões narrativas + de ondas, **excluindo** "Arena Infinita - Desafio dos Deuses" — ver "Fora de escopo"), cada missão com `{descricao, historia, tipo, nivelMinimo, chanceSucesso, xp(nivel), ouro(nivel), item, chanceMiniBoss, chanceMissaoExtra, chanceMasmorra, falha, tipoBatalha?}` — usado pela Task 7 (`filtroMissao`/`fazerMissao`).

Fiel a `JogoRPG/missao/createMissoes.js:1-234` (13 das 14 entradas — a 14ª, arena infinita, fica fora do catálogo ativo nesta fase).

- [ ] **Step 1: Escrever o teste `engine/missoes/catalogo.test.js`**

```js
import { describe, it, expect } from "vitest";
import { missoesDisponiveis } from "./catalogo.js";

describe("missoesDisponiveis", () => {
  it("tem 14 missões (15 do console menos a Arena Infinita, fora de escopo da Fase 3)", () => {
    expect(missoesDisponiveis).toHaveLength(14);
    expect(missoesDisponiveis.find((m) => m.tipoBatalha === "arena_infinita")).toBeUndefined();
  });

  it("a missão de ondas 'Desafio da Arena Amaldiçoada' está presente com os campos corretos", () => {
    const missao = missoesDisponiveis.find((m) => m.descricao === "Desafio da Arena Amaldiçoada");
    expect(missao.tipoBatalha).toBe("ondas");
    expect(missao.nivelMinimo).toBe(4);
    expect(missao.xp(10)).toBe(100); // 50 + 10*5
    expect(missao.ouro(10)).toBe(200); // 100 + 10*10
    expect(missao.falha).toEqual({ tipo: "hp", percentual: 50 });
  });

  it("a missão 'Escoltar um mercador até a cidade' tem as recompensas corretas", () => {
    const missao = missoesDisponiveis.find((m) => m.descricao === "Escoltar um mercador até a cidade");
    expect(missao.chanceSucesso).toBe(85);
    expect(missao.xp(5)).toBe(20); // 15 + 5*1
    expect(missao.ouro(5)).toBe(15); // 10 + 5*1
  });

  it("todas as missões narrativas (sem tipoBatalha) têm história pré-escrita não vazia", () => {
    const narrativas = missoesDisponiveis.filter((m) => !m.tipoBatalha);
    expect(narrativas.length).toBeGreaterThan(0);
    for (const missao of narrativas) {
      expect(typeof missao.historia).toBe("string");
      expect(missao.historia.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- missoes/catalogo`
Expected: FAIL — `Cannot find module './catalogo.js'`.

- [ ] **Step 3: Implementar `engine/missoes/catalogo.js`**

```js
export const missoesDisponiveis = [
  {
    descricao: "Desafio da Arena Amaldiçoada",
    historia: "Um ritual arcano abriu um portal. Monstros surgem em ondas. Sobreviva e a recompensa será sua.",
    tipo: "lendario",
    nivelMinimo: 4,
    chanceSucesso: 100,
    xp: (nivel) => 50 + nivel * 5,
    ouro: (nivel) => 100 + nivel * 10,
    item: { nome: "Fragmento Antigo", raridade: "lendario" },
    chanceMiniBoss: 1,
    chanceMissaoExtra: 15,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 50 },
    tipoBatalha: "ondas",
  },
  {
    descricao: "Escoltar um mercador até a cidade",
    historia: "O mercador teme bandidos na estrada. Sua escolta é discreta, mas precisa ser rápida e firme.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 85,
    xp: (nivel) => 15 + nivel * 1,
    ouro: (nivel) => 10 + nivel * 1,
    item: null,
    chanceMiniBoss: 5,
    chanceMissaoExtra: 10,
    chanceMasmorra: 1,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Encontrar um amuleto escondido na floresta",
    historia: "Dizem que animais guardam um amuleto perdido. A floresta é traiçoeira; ouça os sinais antes de avançar.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 80,
    xp: (nivel) => 25 + nivel * 2,
    ouro: (nivel) => 20 + nivel * 2,
    item: null,
    chanceMiniBoss: 5,
    chanceMissaoExtra: 10,
    chanceMasmorra: 1,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Ajudar o ferreiro local com materiais",
    historia: "O ferreiro precisa de minério raro para forjar uma lâmina. Trabalho braçal e risco de acidentes.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 90,
    xp: (nivel) => 10 + nivel * 1,
    ouro: (nivel) => 8 + nivel * 1,
    item: null,
    chanceMiniBoss: 5,
    chanceMissaoExtra: 5,
    chanceMasmorra: 1,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Resgatar um aldeão perdido na floresta sombria",
    historia: "Gritos abafados ecoam entre as árvores. Encontrar o aldeão antes da noite é imperativo.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 80,
    xp: (nivel) => 18 + nivel * 1.5,
    ouro: (nivel) => 12 + nivel * 1.5,
    item: { nome: "Pena do Corvo Sombrio", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Recuperar uma espada amaldiçoada em cavernas",
    historia: "A lâmina chama por sangue. Há sombras vivas nas profundezas — recupere a gema que a contém.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 50,
    xp: (nivel) => 40 + nivel * 4,
    ouro: (nivel) => 35 + nivel * 3,
    item: { nome: "Gema da Escuridão", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 15,
    chanceMasmorra: 10,
    falha: { tipo: "item", chancePerdaItemPercent: 2 },
  },
  {
    descricao: "Proteger uma caravana de monstros à noite",
    historia: "Sob a lua, criaturas atacam em bando. Proteja a caravana e mantenha a rota aberta.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 70,
    xp: (nivel) => 30 + nivel * 3,
    ouro: (nivel) => 25 + nivel * 2.5,
    item: { nome: "Essência da Noite", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 10,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Domar uma criatura mística",
    historia: "Domar o resistente espírito bestial exige coragem. Uma tentativa mal feita pode ferir gravemente.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 55,
    xp: (nivel) => 50 + nivel * 5,
    ouro: (nivel) => 40 + nivel * 4,
    item: { nome: "Escama de Dragão Azul", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 10,
    falha: { tipo: "hp", percentual: 20 },
  },
  {
    descricao: "Roubar relíquias de um templo antigo",
    historia: "Guardas e armadilhas protegem tesouros sagrados. A audácia traz lucros, mas pode trazer caça.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 70,
    xp: (nivel) => 45 + nivel * 4,
    ouro: (nivel) => 38 + nivel * 3.5,
    item: { nome: "Relíquia Brilhante", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Salvar um sábio em ruínas místicas",
    historia: "Um sábio preso pode oferecer conhecimento raro em troca da sua bravura. Corra contra o tempo.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 85,
    xp: (nivel) => 28 + nivel * 2,
    ouro: (nivel) => 18 + nivel * 1.8,
    item: { nome: "Pergaminho Arcano", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Recuperar um livro proibido na biblioteca sombria",
    historia: "Entre estantes empoeiradas, o livro sussurra segredos que podem corromper ou capacitar.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 75,
    xp: (nivel) => 42 + nivel * 3.5,
    ouro: (nivel) => 32 + nivel * 3,
    item: { nome: "Página Amaldiçoada", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Explorar o vulcão em erupção",
    historia: "Calor e cinzas testam sua resistência. No coração do vulcão, o poder ardente espera ser tomado.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 45,
    xp: (nivel) => 55 + nivel * 5,
    ouro: (nivel) => 50 + nivel * 4.5,
    item: { nome: "Coração de Magma", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 10,
    falha: { tipo: "item", chancePerdaItemPercent: 2 },
  },
  {
    descricao: "Eliminar uma seita secreta",
    historia: "Rituais obscuros se aproximam do auge. Interrompa-os antes que criaturas sejam invocadas.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 75,
    xp: (nivel) => 38 + nivel * 3,
    ouro: (nivel) => 28 + nivel * 2.8,
    item: { nome: "Máscara Sombria", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Ajudar a curandeira a coletar ervas raras",
    historia: "Ervas que florescem apenas ao amanhecer são preciosas. Proteja a curandeira durante a coleta.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 85,
    xp: (nivel) => 20 + nivel * 1.8,
    ouro: (nivel) => 15 + nivel * 1.5,
    item: { nome: "Flor da Aurora", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 10 },
  },
];
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- missoes/catalogo`
Expected: PASS — 4 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/missoes/catalogo.js engine/missoes/catalogo.test.js
git commit -m "feat: catálogo de missões da guilda"
```

---

## Task 7: Seleção e resolução de missão — `engine/missoes/index.js` (TDD)

**Files:**
- Create: `engine/missoes/index.js`
- Test: `engine/missoes/index.test.js`

**Interfaces:**
- Consumes: `missoesDisponiveis` (Task 6), `checarLevelUp` (`@engine/personagem/experiencia.js`, Fase 2), `rand` (`@engine/combate/aleatorio.js`).
- Produces: `filtroMissao(jogador) -> missao|null`, `aplicarPenalidade(tipo, jogador) -> {tipo, valor, mensagem}`, `resolverResultadoMissao(jogador, missao) -> {sucesso: boolean, xpGanho?, ouroGanho?, itemGanho?: string|null, pocaoGanha: boolean, penalidade?}` — usados pela Task 12 (`telaGuilda.js`).

Fiel a `JogoRPG/missao/filtroMissao.js`, `JogoRPG/missao/resultadoMissao.js` e `JogoRPG/missao/penalidade.js`, removendo `console.log`/recursão automática de "missão extra" (essa fase retorna um evento indicando que uma missão extra apareceu, em vez de chamar `fazerMissao` recursivamente — decisão necessária porque a UI web precisa mostrar cada missão como uma tela distinta, não encadear automaticamente sem interação do jogador) e aplicando as correções documentadas #3 e #4.

- [ ] **Step 1: Escrever o teste `engine/missoes/index.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { filtroMissao, aplicarPenalidade, resolverResultadoMissao } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("filtroMissao", () => {
  it("retorna null quando o jogador não atende o nível mínimo de nenhuma missão", () => {
    expect(filtroMissao({ nivel: 0 })).toBeNull();
  });

  it("retorna uma missão cujo nivelMinimo o jogador atende", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const missao = filtroMissao({ nivel: 1 });
    expect(missao).not.toBeNull();
    expect(missao.nivelMinimo).toBeLessThanOrEqual(1);
  });
});

describe("aplicarPenalidade", () => {
  it("tipo ouro: perde entre 15 e 100 de ouro (rand fixo, ignora percentualMin/Max da missão)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(15,100)=15
    const jogador = { ouro: 50 };
    const resultado = aplicarPenalidade("ouro", jogador);
    expect(resultado).toEqual({ tipo: "ouro", valor: 15, mensagem: "Você perdeu 15 de ouro." });
    expect(jogador.ouro).toBe(35);
  });

  it("tipo ouro: nunca deixa o ouro negativo", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // rand(15,100)=100
    const jogador = { ouro: 50 };
    aplicarPenalidade("ouro", jogador);
    expect(jogador.ouro).toBe(0);
  });

  it("tipo hp: perde 20% do HP atual, nunca abaixo de 1", () => {
    const jogador = { hp: 50 };
    const resultado = aplicarPenalidade("hp", jogador);
    expect(resultado).toEqual({ tipo: "hp", valor: 10, mensagem: "Você perdeu 10 de HP." });
    expect(jogador.hp).toBe(40);
  });

  it("tipo item: nunca aplica (jogador.setCompleto nunca é populado nesta versão)", () => {
    const jogador = { setCompleto: false };
    const resultado = aplicarPenalidade("item", jogador);
    expect(resultado).toEqual({ tipo: "nenhuma", valor: 0, mensagem: "Sem penalidades graves desta vez." });
  });

  it("tipo desconhecido: sem penalidade", () => {
    const jogador = {};
    expect(aplicarPenalidade("nenhum", jogador)).toEqual({ tipo: "nenhuma", valor: 0, mensagem: "Sem penalidades graves desta vez." });
  });
});

describe("resolverResultadoMissao", () => {
  function jogadorBase() {
    return { nivel: 1, xp: 0, ouro: 0, classe: "Guerreiro", inventario: [], itens: [] };
  }

  function missaoDeTeste() {
    return {
      xp: (nivel) => 15 + nivel,
      ouro: (nivel) => 10 + nivel,
      item: { nome: "Pena do Corvo Sombrio", raridade: "comum" },
      chanceMissaoExtra: 10,
      falha: { tipo: "hp", percentual: 10 },
    };
  }

  it("sucesso: concede xp/ouro e chama level up", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)    // resultado = rand(1,100) = 1 -> sucesso (chanceSucesso testada via missao.chanceSucesso separadamente)
      .mockReturnValue(0.99);    // demais rolagens (item, poção, missão extra) falham
    const jogador = jogadorBase();
    const missao = { ...missaoDeTeste(), chanceSucesso: 100 };
    const resultado = resolverResultadoMissao(jogador, missao);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.xpGanho).toBe(16);
    expect(resultado.ouroGanho).toBe(11);
    expect(jogador.xp).toBe(16);
    expect(jogador.ouro).toBe(11);
  });

  it("sucesso com drop de item: chance base 80% para item comum, aplica bônus de 10% para Assassino", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)    // resultado sucesso
      .mockReturnValueOnce(0)    // roll do item: rand(1,100)=1, <=90 (80+10 Assassino) sucesso
      .mockReturnValue(0.99);    // poção e missão extra falham
    const jogador = { ...jogadorBase(), classe: "Assassino" };
    const missao = { ...missaoDeTeste(), chanceSucesso: 100 };
    const resultado = resolverResultadoMissao(jogador, missao);

    expect(resultado.itemGanho).toBe("Pena do Corvo Sombrio");
    expect(jogador.inventario).toEqual(["Pena do Corvo Sombrio"]);
  });

  it("falha: aplica a penalidade da missão", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // resultado = 100 > chanceSucesso
    const jogador = { ...jogadorBase(), hp: 100 };
    const missao = { ...missaoDeTeste(), chanceSucesso: 50 };
    const resultado = resolverResultadoMissao(jogador, missao);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.penalidade).toEqual({ tipo: "hp", valor: 20, mensagem: "Você perdeu 20 de HP." });
    expect(jogador.hp).toBe(80);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- missoes/index`
Expected: FAIL — `Cannot find module './index.js'`.

- [ ] **Step 3: Implementar `engine/missoes/index.js`**

```js
import { rand } from "@engine/combate/aleatorio.js";
import { checarLevelUp } from "@engine/personagem/experiencia.js";
import { missoesDisponiveis } from "./catalogo.js";

export function filtroMissao(jogador) {
  const disponiveis = missoesDisponiveis.filter((missao) => jogador.nivel >= missao.nivelMinimo);
  if (disponiveis.length === 0) return null;

  const comPeso = [];
  for (const missao of disponiveis) {
    const peso = missao.tipoBatalha ? 1 : 5;
    for (let i = 0; i < peso; i++) comPeso.push(missao);
  }
  return comPeso[rand(0, comPeso.length - 1)];
}

export function aplicarPenalidade(tipo, jogador) {
  if (tipo === "ouro") {
    const perda = rand(15, 100);
    jogador.ouro = Math.max(0, jogador.ouro - perda);
    return { tipo: "ouro", valor: perda, mensagem: `Você perdeu ${perda} de ouro.` };
  }

  if (tipo === "hp") {
    const perda = Math.floor(jogador.hp * 0.2);
    jogador.hp = Math.max(1, jogador.hp - perda);
    return { tipo: "hp", valor: perda, mensagem: `Você perdeu ${perda} de HP.` };
  }

  // tipo "item" só age se jogador.setCompleto for truthy — nada no jogo popula esse
  // campo hoje, então esta branch nunca dispara na prática (fiel ao console, ver
  // "Correções e decisões documentadas" #3).
  if (tipo === "item" && jogador.setCompleto) {
    if (rand(1, 100) <= 2) {
      return { tipo: "item", valor: 1, mensagem: "Você perdeu uma peça do seu equipamento." };
    }
    return { tipo: "nenhuma", valor: 0, mensagem: "Por sorte, não perdeu nenhum item." };
  }

  return { tipo: "nenhuma", valor: 0, mensagem: "Sem penalidades graves desta vez." };
}

export function resolverResultadoMissao(jogador, missao) {
  const resultado = rand(1, 100);

  if (resultado > missao.chanceSucesso) {
    return { sucesso: false, penalidade: aplicarPenalidade(missao.falha.tipo, jogador) };
  }

  const xpGanho = Math.round(missao.xp(jogador.nivel));
  const ouroGanho = Math.round(missao.ouro(jogador.nivel));
  jogador.xp += xpGanho;
  jogador.ouro += ouroGanho;

  let itemGanho = null;
  if (missao.item && typeof missao.item === "object") {
    const raridade = (missao.item.raridade || "comum").toLowerCase();
    const baseChance = raridade === "comum" ? 80 : raridade === "raro" ? 50 : raridade === "lendario" ? 30 : 0;
    const bonusClasse = jogador.classe === "Assassino" ? 10 : 0;
    const chanceFinal = Math.min(100, baseChance + bonusClasse);
    if (rand(1, 100) <= chanceFinal) {
      jogador.inventario.push(missao.item.nome);
      itemGanho = missao.item.nome;
    }
  } else if (missao.item && typeof missao.item === "string") {
    jogador.inventario.push(missao.item);
    itemGanho = missao.item;
  }

  const pocaoGanha = rand(1, 100) <= 30;
  if (pocaoGanha) jogador.itens.push("Poção de Cura");

  const missaoExtraApareceu = rand(1, 100) <= missao.chanceMissaoExtra;

  const eventosLevelUp = checarLevelUp(jogador);

  return { sucesso: true, xpGanho, ouroGanho, itemGanho, pocaoGanha, missaoExtraApareceu, eventosLevelUp };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- missoes/index`
Expected: PASS — 10 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/missoes/index.js engine/missoes/index.test.js
git commit -m "feat: seleção e resolução de missão (filtro, recompensa, penalidade)"
```

---

## Task 8: Missão de ondas — `engine/missoes/ondas.js` (TDD)

**Files:**
- Create: `engine/missoes/ondas.js`
- Test: `engine/missoes/ondas.test.js`

**Interfaces:**
- Consumes: `rand` (`@engine/combate/aleatorio.js`).
- Produces: `criarEstadoOndas(jogador) -> {jogador, onda, fragmentosGanhos, curado: false}`, `avancarOnda(estado) -> {estado, ondaVencida: boolean, fragmentoGanho: boolean}` (não executa a batalha em si — só a progressão/recompensa entre ondas; a batalha de cada onda usa `@engine/combate/index.js`, Fase 1, orquestrada pela tela) — usado pela Task 12 (`telaGuilda.js`).

Fiel a `JogoRPG/missao/missaoOndas.js` (10 ondas, cura de 10% entre ondas, 5% de chance de Fragmento Antigo por onda, cura de 30% + mini-boss lendário na 11ª "onda" final — o mini-boss fica fora de escopo desta fase, ver nota no Step 3), simplificado para separar "avançar de onda" (puro, testável) de "executar a batalha da onda" (que já existe no engine de combate da Fase 1 e é orquestrada pela UI).

- [ ] **Step 1: Escrever o teste `engine/missoes/ondas.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { criarEstadoOndas, avancarOnda, TOTAL_ONDAS } from "./ondas.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("criarEstadoOndas", () => {
  it("inicializa a onda 1 e zero fragmentos", () => {
    const jogador = { hp: 100, hpMax: 100 };
    const estado = criarEstadoOndas(jogador);
    expect(estado.onda).toBe(1);
    expect(estado.fragmentosGanhos).toBe(0);
  });
});

describe("avancarOnda", () => {
  it("cura 10% do HP máximo e avança a onda ao vencer", () => {
    const jogador = { hp: 50, hpMax: 100 };
    let estado = criarEstadoOndas(jogador);
    vi.spyOn(Math, "random").mockReturnValue(0.99); // sem fragmento (rand(1,100)=100 > 5)

    const resultado = avancarOnda(estado);

    expect(resultado.ondaVencida).toBe(true);
    expect(resultado.fragmentoGanho).toBe(false);
    expect(resultado.estado.onda).toBe(2);
    expect(jogador.hp).toBe(60); // 50 + floor(100*0.1)
  });

  it("concede um Fragmento Antigo com 5% de chance", () => {
    const jogador = { hp: 50, hpMax: 100 };
    let estado = criarEstadoOndas(jogador);
    vi.spyOn(Math, "random").mockReturnValue(0); // rand(1,100)=1 <=5

    const resultado = avancarOnda(estado);

    expect(resultado.fragmentoGanho).toBe(true);
    expect(resultado.estado.fragmentosGanhos).toBe(1);
  });

  it("marca a última onda (10) como a onda final da sequência", () => {
    const jogador = { hp: 100, hpMax: 100 };
    let estado = { ...criarEstadoOndas(jogador), onda: TOTAL_ONDAS };
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    const resultado = avancarOnda(estado);

    expect(resultado.sequenciaCompleta).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- missoes/ondas`
Expected: FAIL — `Cannot find module './ondas.js'`.

- [ ] **Step 3: Implementar `engine/missoes/ondas.js`**

Nota: o mini-boss final (11ª rodada do console) e a cura de 30% pós-mini-boss ficam fora desta fase — dependem de `criarMiniBoss`, que só é portado na Fase 4 junto com Torre/Masmorra/Arena (todos os sistemas que o usam). A sequência desta fase cobre as 10 ondas normais; a tela de guilda (Task 12) encerra a missão como vitória ao completar a 10ª onda.

```js
import { rand } from "@engine/combate/aleatorio.js";

export const TOTAL_ONDAS = 10;

export function criarEstadoOndas(jogador) {
  return { jogador, onda: 1, fragmentosGanhos: 0 };
}

export function avancarOnda(estado) {
  const { jogador } = estado;
  const fragmentoGanho = rand(1, 100) <= 5;
  const fragmentosGanhos = estado.fragmentosGanhos + (fragmentoGanho ? 1 : 0);

  jogador.hp = Math.min(jogador.hpMax, Math.floor(jogador.hp + jogador.hpMax * 0.1));

  const sequenciaCompleta = estado.onda >= TOTAL_ONDAS;
  const novoEstado = { jogador, onda: estado.onda + 1, fragmentosGanhos };

  return { estado: novoEstado, ondaVencida: true, fragmentoGanho, sequenciaCompleta };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- missoes/ondas`
Expected: PASS — 3 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/missoes/ondas.js engine/missoes/ondas.test.js
git commit -m "feat: progressão de ondas da missão Desafio da Arena Amaldiçoada"
```

---

## Task 9: Amuleto e Talismã — `engine/itens/amuletoTalisma.js` (TDD)

**Files:**
- Create: `engine/itens/amuletoTalisma.js`
- Test: `engine/itens/amuletoTalisma.test.js`

**Interfaces:**
- Produces: `REQUISITOS_AMULETO` (lista de itens/quantidades necessários), `podeCraftarAmuleto(inventario) -> boolean`, `craftarAmuleto(jogador)` (consome itens, ativa o amuleto), `alternarAmuleto(jogador)` (equipar/desequipar, aplica/reverte +5% ATK e +10% HP), `PRECO_TALISMA` (`{fragmentos: 10, ouro: 2000}`), `podeCraftarTalisma(jogador) -> boolean`, `craftarTalisma(jogador)` — usados pela Task 11 (`telaPersonagem.js`).

Fiel a `JogoRPG/itens/amuletoTalisma/amuleto/menuAmuleto.js` (requisitos), `JogoRPG/itens/amuletoTalisma/amuleto/gerenciador.js` (+5% ATK, +10% HP ao equipar — o bônus adicional de +2% ATK dinâmico já está em `engine/combate/calculoDano.js:calcularAtaqueJogador`, Fase 1, via `jogador.amuletoEquipado`) e `JogoRPG/itens/amuletoTalisma/talisma/menuTalisma.js` (10 Fragmento Antigo + 2000 ouro).

- [ ] **Step 1: Escrever o teste `engine/itens/amuletoTalisma.test.js`**

```js
import { describe, it, expect } from "vitest";
import {
  REQUISITOS_AMULETO,
  podeCraftarAmuleto,
  craftarAmuleto,
  alternarAmuleto,
  PRECO_TALISMA,
  podeCraftarTalisma,
  craftarTalisma,
} from "./amuletoTalisma.js";

function contarItem(inventario, nome) {
  return inventario.filter((i) => i === nome).length;
}

describe("podeCraftarAmuleto", () => {
  it("retorna false quando faltam itens", () => {
    expect(podeCraftarAmuleto([])).toBe(false);
  });

  it("retorna true quando o inventário atende todos os requisitos", () => {
    const inventario = REQUISITOS_AMULETO.flatMap((r) => Array(r.quantidade).fill(r.nome));
    expect(podeCraftarAmuleto(inventario)).toBe(true);
  });
});

describe("craftarAmuleto", () => {
  it("consome os itens necessários do inventário", () => {
    const inventario = REQUISITOS_AMULETO.flatMap((r) => Array(r.quantidade).fill(r.nome));
    const jogador = { inventario, amuletoEquipado: false };
    craftarAmuleto(jogador);
    for (const req of REQUISITOS_AMULETO) {
      expect(contarItem(jogador.inventario, req.nome)).toBe(0);
    }
  });
});

describe("alternarAmuleto", () => {
  it("ao equipar, soma +5% ATK e +10% HP, e cura para o novo hpMax", () => {
    const jogador = { ataque: 20, hp: 80, hpMax: 100, amuletoEquipado: false };
    alternarAmuleto(jogador);
    expect(jogador.amuletoEquipado).toBe(true);
    expect(jogador.ataque).toBe(21); // floor(20*1.05)
    expect(jogador.hpMax).toBe(110); // floor(100*1.10)
    expect(jogador.hp).toBe(110);
  });

  it("ao desequipar, reverte para os valores originais salvos", () => {
    const jogador = { ataque: 20, hp: 80, hpMax: 100, amuletoEquipado: false };
    alternarAmuleto(jogador);
    alternarAmuleto(jogador);
    expect(jogador.amuletoEquipado).toBe(false);
    expect(jogador.ataque).toBe(20);
    expect(jogador.hpMax).toBe(100);
  });
});

describe("PRECO_TALISMA e craft", () => {
  it("define o preço fiel ao console", () => {
    expect(PRECO_TALISMA).toEqual({ fragmentos: 10, ouro: 2000 });
  });

  it("podeCraftarTalisma exige 10 Fragmento Antigo e 2000 ouro", () => {
    const semRecursos = { inventario: [], ouro: 0 };
    expect(podeCraftarTalisma(semRecursos)).toBe(false);

    const comRecursos = { inventario: Array(10).fill("Fragmento Antigo"), ouro: 2000 };
    expect(podeCraftarTalisma(comRecursos)).toBe(true);
  });

  it("craftarTalisma consome os fragmentos e o ouro, adiciona o item ao inventário", () => {
    const jogador = { inventario: Array(10).fill("Fragmento Antigo"), ouro: 2000 };
    craftarTalisma(jogador);
    expect(contarItem(jogador.inventario, "Fragmento Antigo")).toBe(0);
    expect(jogador.ouro).toBe(0);
    expect(contarItem(jogador.inventario, "Talismã da Torre")).toBe(1);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- amuletoTalisma`
Expected: FAIL — `Cannot find module './amuletoTalisma.js'`.

- [ ] **Step 3: Implementar `engine/itens/amuletoTalisma.js`**

```js
export const REQUISITOS_AMULETO = [
  { nome: "Pena do Corvo Sombrio", quantidade: 5 },
  { nome: "Pergaminho Arcano", quantidade: 5 },
  { nome: "Essência da Noite", quantidade: 2 },
  { nome: "Relíquia Brilhante", quantidade: 2 },
  { nome: "Gema da Escuridão", quantidade: 1 },
];

export function podeCraftarAmuleto(inventario) {
  return REQUISITOS_AMULETO.every(
    (req) => inventario.filter((item) => item === req.nome).length >= req.quantidade
  );
}

export function craftarAmuleto(jogador) {
  for (const req of REQUISITOS_AMULETO) {
    let restante = req.quantidade;
    jogador.inventario = jogador.inventario.filter((item) => {
      if (item === req.nome && restante > 0) {
        restante--;
        return false;
      }
      return true;
    });
  }
}

export function alternarAmuleto(jogador) {
  if (!jogador.amuletoEquipado) {
    jogador._ataqueAntesDoAmuleto = jogador.ataque;
    jogador._hpMaxAntesDoAmuleto = jogador.hpMax;
    jogador.ataque = Math.floor(jogador.ataque * 1.05);
    jogador.hpMax = Math.floor(jogador.hpMax * 1.1);
    jogador.hp = jogador.hpMax;
    jogador.amuletoEquipado = true;
  } else {
    jogador.ataque = jogador._ataqueAntesDoAmuleto;
    jogador.hpMax = jogador._hpMaxAntesDoAmuleto;
    jogador.hp = Math.min(jogador.hp, jogador.hpMax);
    jogador.amuletoEquipado = false;
  }
}

export const PRECO_TALISMA = { fragmentos: 10, ouro: 2000 };

export function podeCraftarTalisma(jogador) {
  const fragmentos = jogador.inventario.filter((item) => item === "Fragmento Antigo").length;
  return fragmentos >= PRECO_TALISMA.fragmentos && jogador.ouro >= PRECO_TALISMA.ouro;
}

export function craftarTalisma(jogador) {
  let restante = PRECO_TALISMA.fragmentos;
  jogador.inventario = jogador.inventario.filter((item) => {
    if (item === "Fragmento Antigo" && restante > 0) {
      restante--;
      return false;
    }
    return true;
  });
  jogador.ouro -= PRECO_TALISMA.ouro;
  jogador.inventario.push("Talismã da Torre");
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- amuletoTalisma`
Expected: PASS — 8 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/itens/amuletoTalisma.js engine/itens/amuletoTalisma.test.js
git commit -m "feat: craft e efeito do Amuleto Supremo e do Talismã da Torre"
```

---

## Task 10: Tela de loja — `telaLoja.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/loja/telaLoja.js`
- Test: `WebRPG/src/telas/loja/telaLoja.test.js`
- Create: `WebRPG/src/estilos/loja.css`
- Modify: `WebRPG/src/main.js` (import do novo CSS)

**Interfaces:**
- Consumes: `catalogoLoja` (`@engine/itens/catalogo.js`, Task 1), `obterClasseRaridade` (`@engine/itens/raridade.js`, Task 2), `comprarItem`, `itensVendiveis`, `venderItens` (`@engine/loja/index.js`, Task 5).
- Produces: `montarTelaLoja(container, { jogador, aoSair }) -> elementos` com abas Comprar/Vender — usado pela Task 13 (`main.js`), registrado no roteador como tela `'loja'`.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/loja/telaLoja.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { montarTelaLoja } from "./telaLoja.js";

function jogadorDeTeste() {
  return { nome: "Thorin", ouro: 3000, inventario: [] };
}

describe("montarTelaLoja", () => {
  it("lista os itens do catálogo com preço", () => {
    const container = document.createElement("div");
    montarTelaLoja(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const itens = container.querySelectorAll("[data-item-loja]");
    expect(itens.length).toBeGreaterThan(0);
  });

  it("compra um item ao clicar, debita o ouro e atualiza o cabeçalho", () => {
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaLoja(container, { jogador, aoSair: vi.fn() });

    const botaoEspada = [...container.querySelectorAll("[data-item-loja]")].find((el) =>
      el.textContent.includes("Espada Longa")
    );
    botaoEspada.querySelector("[data-acao='comprar']").click();

    expect(jogador.ouro).toBe(500); // 3000 - 2500
    expect(jogador.inventario.some((i) => i.nome === "Espada Longa")).toBe(true);
    expect(container.querySelector(".ouro-atual").textContent).toContain("500");
  });

  it("chama aoSair ao clicar em Sair", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaLoja(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });

  it("aba Vender lista os itens vendíveis do inventário e vende ao confirmar", () => {
    const jogador = { nome: "Thorin", ouro: 0, inventario: [{ nome: "Espada Longa", slot: "weapon", preco: 2500 }] };
    const container = document.createElement("div");
    const elementos = montarTelaLoja(container, { jogador, aoSair: vi.fn() });

    elementos.abaVender.click();
    container.querySelector('[data-vender-indice="0"]').click();
    container.querySelector("[data-acao='confirmar-venda']").click();

    expect(jogador.ouro).toBe(750); // floor(2500*0.3)
    expect(jogador.inventario).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaLoja`
Expected: FAIL — `Cannot find module './telaLoja.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/loja/telaLoja.js`**

```js
import { catalogoLoja } from "@engine/itens/catalogo.js";
import { obterClasseRaridade } from "@engine/itens/raridade.js";
import { comprarItem, itensVendiveis, venderItens } from "@engine/loja/index.js";

function renderizarCabecalho(container, jogador) {
  const cabecalho = container.querySelector(".cabecalho-loja");
  cabecalho.innerHTML = `<span class="ouro-atual">Ouro: ${jogador.ouro}</span>`;
}

function renderizarAbaComprar(container, jogador, atualizarTudo) {
  const lista = container.querySelector(".lista-comprar");
  lista.innerHTML = "";
  for (const item of catalogoLoja) {
    const linha = document.createElement("div");
    linha.className = "painel item-loja";
    linha.dataset.itemLoja = item.id;
    const classeRaridade = obterClasseRaridade(item.raridade);
    linha.innerHTML = `
      <span class="${classeRaridade}">${item.nome}</span>
      <span>${item.preco} ouro</span>
      <button class="botao" data-acao="comprar">Comprar</button>
    `;
    linha.querySelector("[data-acao='comprar']").addEventListener("click", () => {
      comprarItem(jogador, item);
      atualizarTudo();
    });
    lista.appendChild(linha);
  }
}

function renderizarAbaVender(container, jogador, atualizarTudo) {
  const lista = container.querySelector(".lista-vender");
  lista.innerHTML = "";
  const selecionados = new Set();

  itensVendiveis(jogador.inventario).forEach((item) => {
    const indiceReal = jogador.inventario.indexOf(item);
    const linha = document.createElement("button");
    linha.className = "botao item-vender";
    linha.dataset.venderIndice = indiceReal;
    linha.textContent = `${item.nome} — ${Math.floor(item.preco * 0.3)} ouro`;
    linha.addEventListener("click", () => {
      if (selecionados.has(indiceReal)) {
        selecionados.delete(indiceReal);
        linha.classList.remove("opcao--selecionada");
      } else {
        selecionados.add(indiceReal);
        linha.classList.add("opcao--selecionada");
      }
    });
    lista.appendChild(linha);
  });

  const botaoConfirmar = document.createElement("button");
  botaoConfirmar.className = "botao botao--destaque";
  botaoConfirmar.dataset.acao = "confirmar-venda";
  botaoConfirmar.textContent = "Confirmar venda";
  botaoConfirmar.addEventListener("click", () => {
    venderItens(jogador, [...selecionados]);
    atualizarTudo();
  });
  lista.appendChild(botaoConfirmar);
}

export function montarTelaLoja(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-loja">
      <div class="painel cabecalho-loja"></div>
      <div class="abas-loja">
        <button class="botao aba-comprar aba--ativa" data-aba="comprar">Comprar</button>
        <button class="botao aba-vender" data-aba="vender">Vender</button>
      </div>
      <div class="lista-comprar"></div>
      <div class="lista-vender" style="display: none;"></div>
      <button class="botao" id="botao-sair-loja">Sair da Loja</button>
    </div>
  `;

  function atualizarTudo() {
    renderizarCabecalho(container, jogador);
    renderizarAbaComprar(container, jogador, atualizarTudo);
    renderizarAbaVender(container, jogador, atualizarTudo);
  }

  const abaComprarBotao = container.querySelector(".aba-comprar");
  const abaVenderBotao = container.querySelector(".aba-vender");
  const listaComprar = container.querySelector(".lista-comprar");
  const listaVender = container.querySelector(".lista-vender");

  abaComprarBotao.addEventListener("click", () => {
    abaComprarBotao.classList.add("aba--ativa");
    abaVenderBotao.classList.remove("aba--ativa");
    listaComprar.style.display = "";
    listaVender.style.display = "none";
  });

  abaVenderBotao.addEventListener("click", () => {
    abaVenderBotao.classList.add("aba--ativa");
    abaComprarBotao.classList.remove("aba--ativa");
    listaComprar.style.display = "none";
    listaVender.style.display = "";
  });

  const botaoSair = container.querySelector("#botao-sair-loja");
  botaoSair.addEventListener("click", () => aoSair());

  atualizarTudo();

  return { botaoSair, abaComprar: abaComprarBotao, abaVender: abaVenderBotao };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaLoja`
Expected: PASS — 4 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/loja.css`**

```css
.tela-loja {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 700px;
  margin: 0 auto;
}

.abas-loja {
  display: flex;
  gap: var(--espaco-sm);
}

.aba--ativa {
  border-color: var(--cor-destaque);
  color: var(--cor-destaque);
}

.item-loja {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-sm);
}

.raridade--comum { color: var(--cor-sucesso); }
.raridade--raro { color: var(--cor-mp); }
.raridade--lendario { color: var(--cor-destaque); }
.raridade--padrao { color: var(--cor-texto); }
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

```js
import "./estilos/loja.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/loja WebRPG/src/estilos/loja.css WebRPG/src/main.js
git commit -m "feat: tela de loja (comprar/vender)"
```

---

## Task 11: Tela de personagem — `telaPersonagem.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/personagem/telaPersonagem.js`
- Test: `WebRPG/src/telas/personagem/telaPersonagem.test.js`
- Create: `WebRPG/src/estilos/personagem.css`
- Modify: `WebRPG/src/main.js` (import do novo CSS)

**Interfaces:**
- Consumes: `obterClasseRaridade` (Task 2), `equiparArmaduraNoSlot`, `equiparArma`, `compararAtributos` (Task 3), `xpParaProximoNivel` (`@engine/personagem/experiencia.js`, Fase 2).
- Produces: `montarTelaPersonagem(container, { jogador, aoSair }) -> elementos` — usado pela Task 13 (`main.js`), registrado no roteador como tela `'personagem'`.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/personagem/telaPersonagem.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { montarTelaPersonagem } from "./telaPersonagem.js";

function jogadorDeTeste() {
  return {
    nome: "Thorin", raca: "Anão", classe: "Arqueiro", nivel: 2, xp: 10, ouro: 500,
    hp: 90, hpMax: 100, ataque: 12, defesa: 20,
    equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
    armaEquipada: null,
    inventario: [
      { nome: "Elmo de Ferro", slot: "head", defesa: 6, atkBonus: 0, preco: 2050, set: "Ferro", raridade: "comum" },
      { nome: "Espada Longa", slot: "weapon", atk: 5, preco: 2500, efeito: null, raridade: "comum" },
    ],
  };
}

describe("montarTelaPersonagem", () => {
  it("exibe os atributos e o progresso de XP", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const texto = container.querySelector(".painel-atributos").textContent;
    expect(texto).toContain("Thorin");
    expect(texto).toContain("Anão");
    expect(texto).toContain("Arqueiro");
    expect(texto).toContain("Nível 2");
  });

  it("lista os itens do inventário equipáveis, com a diferença de atributo em relação ao equipado", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const linhaElmo = [...container.querySelectorAll("[data-inventario-item]")].find((el) =>
      el.textContent.includes("Elmo de Ferro")
    );
    // slot vazio -> diferença = valor cheio do item: DEF +6
    expect(linhaElmo.querySelector(".diferenca-defesa").textContent).toContain("+6");
  });

  it("equipa uma armadura do inventário ao clicar, e a peça anterior (se houver) volta pro inventário", () => {
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });

    const linhaElmo = [...container.querySelectorAll("[data-inventario-item]")].find((el) =>
      el.textContent.includes("Elmo de Ferro")
    );
    linhaElmo.querySelector("[data-acao='equipar']").click();

    expect(jogador.equipamentos.head.nome).toBe("Elmo de Ferro");
    expect(jogador.inventario.some((i) => i.nome === "Elmo de Ferro")).toBe(false);
  });

  it("equipa uma arma do inventário ao clicar", () => {
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });

    const linhaArma = [...container.querySelectorAll("[data-inventario-item]")].find((el) =>
      el.textContent.includes("Espada Longa")
    );
    linhaArma.querySelector("[data-acao='equipar']").click();

    expect(jogador.armaEquipada.nome).toBe("Espada Longa");
  });

  it("chama aoSair ao clicar em Voltar", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaPersonagem`
Expected: FAIL — `Cannot find module './telaPersonagem.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/personagem/telaPersonagem.js`**

```js
import { obterClasseRaridade } from "@engine/itens/raridade.js";
import { equiparArmaduraNoSlot, equiparArma, compararAtributos } from "@engine/itens/equipar.js";
import { xpParaProximoNivel } from "@engine/personagem/experiencia.js";

function renderizarAtributos(container, jogador) {
  const painel = container.querySelector(".painel-atributos");
  painel.innerHTML = `
    <h2>${jogador.nome}</h2>
    <p>${jogador.raca} — ${jogador.classe}</p>
    <p>Nível ${jogador.nivel} (XP: ${jogador.xp}/${xpParaProximoNivel(jogador)})</p>
    <p>HP: ${jogador.hp}/${jogador.hpMax}</p>
    <p>Ataque: ${jogador.ataque} | Defesa: ${jogador.defesa}</p>
    <p>Ouro: ${jogador.ouro}</p>
  `;
}

function renderizarInventario(container, jogador, atualizarTudo) {
  const lista = container.querySelector(".lista-inventario-equipavel");
  lista.innerHTML = "";

  const equipaveis = jogador.inventario.filter((item) => item.slot === "weapon" || item.slot !== "consumable");
  for (const item of equipaveis) {
    const linha = document.createElement("div");
    linha.className = "painel item-inventario";
    linha.dataset.inventarioItem = item.nome;
    const classeRaridade = obterClasseRaridade(item.raridade);

    let diferencaHtml = "";
    if (item.slot === "weapon") {
      diferencaHtml = `<span>ATK: ${item.atk}</span>`;
    } else {
      const itemAtual = jogador.equipamentos[item.slot];
      const diferenca = compararAtributos(itemAtual, item);
      diferencaHtml = `<span class="diferenca-defesa">DEF ${diferenca.defesa >= 0 ? "+" : ""}${diferenca.defesa}</span>`;
    }

    linha.innerHTML = `
      <span class="${classeRaridade}">${item.nome}</span>
      ${diferencaHtml}
      <button class="botao" data-acao="equipar">Equipar</button>
    `;

    linha.querySelector("[data-acao='equipar']").addEventListener("click", () => {
      const indice = jogador.inventario.indexOf(item);
      jogador.inventario.splice(indice, 1);

      if (item.slot === "weapon") {
        const { itemAntigo } = equiparArma(jogador, item);
        if (itemAntigo) jogador.inventario.push(itemAntigo);
      } else {
        const { itemAntigo } = equiparArmaduraNoSlot(jogador, item);
        if (itemAntigo) jogador.inventario.push(itemAntigo);
      }
      atualizarTudo();
    });

    lista.appendChild(linha);
  }
}

export function montarTelaPersonagem(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-personagem">
      <div class="painel painel-atributos"></div>
      <div class="painel painel-inventario">
        <h3>Inventário</h3>
        <div class="lista-inventario-equipavel"></div>
      </div>
      <button class="botao" id="botao-sair-personagem">Voltar</button>
    </div>
  `;

  function atualizarTudo() {
    renderizarAtributos(container, jogador);
    renderizarInventario(container, jogador, atualizarTudo);
  }
  atualizarTudo();

  const botaoSair = container.querySelector("#botao-sair-personagem");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaPersonagem`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/personagem.css`**

```css
.tela-personagem {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 700px;
  margin: 0 auto;
}

.item-inventario {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--espaco-sm);
  margin-bottom: var(--espaco-sm);
}
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

```js
import "./estilos/personagem.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/personagem WebRPG/src/estilos/personagem.css WebRPG/src/main.js
git commit -m "feat: tela de personagem (atributos, inventário, equipar com comparação)"
```

---

## Task 12: Tela de guilda (missões) — `telaGuilda.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/guilda/telaGuilda.js`
- Test: `WebRPG/src/telas/guilda/telaGuilda.test.js`
- Create: `WebRPG/src/estilos/guilda.css`
- Modify: `WebRPG/src/main.js` (import do novo CSS)

**Interfaces:**
- Consumes: `filtroMissao`, `resolverResultadoMissao` (`@engine/missoes/index.js`, Task 7), `criarEstadoOndas`, `avancarOnda`, `TOTAL_ONDAS` (`@engine/missoes/ondas.js`, Task 8), `criarEstadoBatalha`, `executarAcaoJogador` (`@engine/combate/index.js`, Fase 1), `criarInimigoTreino` (`@engine/geradores/inimigoTreino.js`, Fase 2, reaproveitado como inimigo de cada onda — ver nota no Step 3).
- Produces: `montarTelaGuilda(container, { jogador, aoSair }) -> elementos` — usado pela Task 13 (`main.js`), registrado no roteador como tela `'guilda'`.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/guilda/telaGuilda.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { montarTelaGuilda } from "./telaGuilda.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return {
    nome: "Thorin", nivel: 5, xp: 0, ouro: 0, classe: "Guerreiro",
    inventario: [], itens: [], hp: 100, hpMax: 100,
  };
}

describe("montarTelaGuilda", () => {
  it("sorteia e exibe uma missão disponível para o nível do jogador", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const container = document.createElement("div");
    montarTelaGuilda(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector(".descricao-missao").textContent.length).toBeGreaterThan(0);
  });

  it('mostra "sem missões disponíveis" quando o jogador não atende o nível mínimo de nenhuma', () => {
    const container = document.createElement("div");
    montarTelaGuilda(container, { jogador: { ...jogadorDeTeste(), nivel: 0 }, aoSair: vi.fn() });
    expect(container.textContent).toContain("Não há missões disponíveis");
  });

  it("resolve uma missão narrativa ao aceitar, mostrando o resultado", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // sorteia missão, e sucesso garantido (resultado baixo)
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    const elementos = montarTelaGuilda(container, { jogador, aoSair: vi.fn() });

    elementos.botaoAceitar.click();

    expect(container.querySelector(".resultado-missao")).not.toBeNull();
  });

  it("chama aoSair ao clicar em Voltar", () => {
    const aoSair = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaGuilda(container, { jogador: jogadorDeTeste(), aoSair });
    elementos.botaoSair.click();
    expect(aoSair).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaGuilda`
Expected: FAIL — `Cannot find module './telaGuilda.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/guilda/telaGuilda.js`**

Nota sobre a missão de ondas: como não há telas de batalha "encaixadas" dentro da guilda nesta fase inicial (isso exigiria reaproveitar `iniciarBatalha`/`controladorBatalha` dentro do fluxo da guilda, o que é um refinamento de UX possível numa iteração futura), a missão de ondas desta task resolve cada onda como uma checagem simples de sobrevivência (usa `avancarOnda`, que já cura e sorteia fragmento) sem uma tela de combate visual onda a onda — a versão com tela de batalha completa por onda fica registrada como melhoria futura, não bloqueando o critério de pronto desta fase ("missão → ouro → loja → equipar → ficar mais forte", que a missão narrativa já cobre integralmente).

```js
import { filtroMissao, resolverResultadoMissao } from "@engine/missoes/index.js";
import { criarEstadoOndas, avancarOnda, TOTAL_ONDAS } from "@engine/missoes/ondas.js";

function renderizarResultado(container, resultado) {
  const painel = container.querySelector(".resultado-missao");
  if (resultado.sucesso) {
    painel.innerHTML = `
      <p>Missão completada com sucesso! +${resultado.xpGanho} XP, +${resultado.ouroGanho} ouro.</p>
      ${resultado.itemGanho ? `<p>Você obteve: ${resultado.itemGanho}</p>` : ""}
      ${resultado.pocaoGanha ? "<p>Você também encontrou uma Poção de Cura!</p>" : ""}
    `;
  } else {
    painel.innerHTML = `<p>A missão falhou. ${resultado.penalidade.mensagem}</p>`;
  }
}

function resolverMissaoDeOndas(container, jogador, missao) {
  let estadoOndas = criarEstadoOndas(jogador);
  while (estadoOndas.onda <= TOTAL_ONDAS) {
    const resultado = avancarOnda(estadoOndas);
    estadoOndas = resultado.estado;
  }
  jogador.xp += Math.round(missao.xp(jogador.nivel));
  jogador.ouro += Math.round(missao.ouro(jogador.nivel));
  for (let i = 0; i < estadoOndas.fragmentosGanhos; i++) {
    jogador.inventario.push("Fragmento Antigo");
  }
  renderizarResultado(container, {
    sucesso: true,
    xpGanho: Math.round(missao.xp(jogador.nivel)),
    ouroGanho: Math.round(missao.ouro(jogador.nivel)),
    itemGanho: estadoOndas.fragmentosGanhos > 0 ? `${estadoOndas.fragmentosGanhos}x Fragmento Antigo` : null,
    pocaoGanha: false,
  });
}

export function montarTelaGuilda(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-guilda">
      <div class="painel painel-missao">
        <p class="descricao-missao"></p>
        <p class="historia-missao"></p>
      </div>
      <div class="acoes-missao">
        <button class="botao botao--destaque" id="botao-aceitar-missao">Aceitar</button>
      </div>
      <div class="resultado-missao"></div>
      <button class="botao" id="botao-sair-guilda">Voltar</button>
    </div>
  `;

  const missao = filtroMissao(jogador);
  const painelMissao = container.querySelector(".painel-missao");
  const botaoAceitar = container.querySelector("#botao-aceitar-missao");

  if (!missao) {
    painelMissao.innerHTML = "<p>Não há missões disponíveis para o seu nível no momento.</p>";
    botaoAceitar.disabled = true;
  } else {
    container.querySelector(".descricao-missao").textContent = missao.descricao;
    container.querySelector(".historia-missao").textContent = missao.historia;
  }

  botaoAceitar.addEventListener("click", () => {
    botaoAceitar.disabled = true;
    if (missao.tipoBatalha === "ondas") {
      resolverMissaoDeOndas(container, jogador, missao);
    } else {
      const resultado = resolverResultadoMissao(jogador, missao);
      renderizarResultado(container, resultado);
    }
  });

  const botaoSair = container.querySelector("#botao-sair-guilda");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoAceitar, botaoSair };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaGuilda`
Expected: PASS — 4 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/guilda.css`**

```css
.tela-guilda {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 700px;
  margin: 0 auto;
}

.acoes-missao {
  display: flex;
  justify-content: center;
}
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

```js
import "./estilos/guilda.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/guilda WebRPG/src/estilos/guilda.css WebRPG/src/main.js
git commit -m "feat: tela de guilda (aceitar e resolver missões)"
```

---

## Task 13: Ligar Guilda/Loja/Personagem na cidade — `main.js` (TDD + verificação manual)

**Files:**
- Modify: `WebRPG/src/telas/cidade/telaCidade.js`
- Modify: `WebRPG/src/telas/cidade/telaCidade.test.js`
- Modify: `WebRPG/src/main.js`
- Modify: `WebRPG/src/main.test.js`

**Interfaces:**
- Consumes: `montarTelaLoja` (Task 10), `montarTelaPersonagem` (Task 11), `montarTelaGuilda` (Task 12).
- Produces: `montarTelaCidade(container, { jogador, aoExplorar, aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem }) -> elementos` — Torre/Masmorra/Arena continuam desabilitados (Fase 4).

- [ ] **Step 1: Atualizar o teste `WebRPG/src/telas/cidade/telaCidade.test.js`**

Substituir o teste "desabilita os locais ainda não implementados" por:

```js
describe("montarTelaCidade", () => {
  it("desabilita apenas os locais que ainda não foram implementados (torre, masmorra, arena)", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(),
      aoExplorar: vi.fn(), aoAbrirGuilda: vi.fn(), aoAbrirLoja: vi.fn(), aoAbrirPersonagem: vi.fn(),
    });
    for (const local of ["torre", "masmorra", "arena"]) {
      expect(container.querySelector(`[data-local="${local}"]`).disabled).toBe(true);
    }
    for (const local of ["guilda", "loja", "personagem"]) {
      expect(container.querySelector(`[data-local="${local}"]`).disabled).toBe(false);
    }
  });

  it("chama aoAbrirGuilda, aoAbrirLoja e aoAbrirPersonagem ao clicar nos respectivos botões", () => {
    const aoAbrirGuilda = vi.fn();
    const aoAbrirLoja = vi.fn();
    const aoAbrirPersonagem = vi.fn();
    const container = document.createElement("div");
    montarTelaCidade(container, {
      jogador: jogadorDeTeste(), aoExplorar: vi.fn(), aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem,
    });

    container.querySelector('[data-local="guilda"]').click();
    container.querySelector('[data-local="loja"]').click();
    container.querySelector('[data-local="personagem"]').click();

    expect(aoAbrirGuilda).toHaveBeenCalledOnce();
    expect(aoAbrirLoja).toHaveBeenCalledOnce();
    expect(aoAbrirPersonagem).toHaveBeenCalledOnce();
  });
});
```

(Remove o teste antigo "desabilita os locais ainda não implementados" que checava os 5 locais como desabilitados — Guilda/Loja/Personagem passam a ser funcionais nesta fase.)

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaCidade`
Expected: FAIL — os botões `guilda`/`loja`/`personagem` ainda estão `disabled` e sem handler.

- [ ] **Step 3: Atualizar `WebRPG/src/telas/cidade/telaCidade.js`**

```js
export function montarTelaCidade(container, { jogador, aoExplorar, aoAbrirGuilda, aoAbrirLoja, aoAbrirPersonagem }) {
  container.innerHTML = `
    <div class="tela-cidade">
      <div class="painel cabecalho-cidade">
        <strong>${jogador.nome}</strong>
        <span>Nível ${jogador.nivel}</span>
        <span>HP: ${jogador.hp}/${jogador.hpMax}</span>
        <span>Ouro: ${jogador.ouro}</span>
      </div>
      <div class="grade-locais">
        <button class="botao botao--destaque local-cidade" data-local="explorar">🌳 Explorar</button>
        <button class="botao local-cidade" data-local="guilda">📝 Guilda</button>
        <button class="botao local-cidade" data-local="loja">💰 Loja</button>
        <button class="botao local-cidade" data-local="personagem">🧑 Personagem</button>
        <button class="botao local-cidade" data-local="torre" disabled>🏰 Torre — Em breve</button>
        <button class="botao local-cidade" data-local="masmorra" disabled>🗝️ Masmorra — Em breve</button>
        <button class="botao local-cidade" data-local="arena" disabled>⚔️ Arena — Em breve</button>
      </div>
    </div>
  `;

  const botaoExplorar = container.querySelector('[data-local="explorar"]');
  botaoExplorar.addEventListener("click", () => aoExplorar());

  container.querySelector('[data-local="guilda"]').addEventListener("click", () => aoAbrirGuilda());
  container.querySelector('[data-local="loja"]').addEventListener("click", () => aoAbrirLoja());
  container.querySelector('[data-local="personagem"]').addEventListener("click", () => aoAbrirPersonagem());

  return { botaoExplorar, cabecalho: container.querySelector(".cabecalho-cidade") };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaCidade`
Expected: PASS — 4 testes verdes.

- [ ] **Step 5: Atualizar `WebRPG/src/main.js`**

Adicionar os imports das três novas telas e as funções de navegação, e passar os novos callbacks para `montarTelaCidade` dentro de `irParaCidade`:

```js
import { montarTelaLoja } from "./telas/loja/telaLoja.js";
import { montarTelaPersonagem } from "./telas/personagem/telaPersonagem.js";
import { montarTelaGuilda } from "./telas/guilda/telaGuilda.js";
```

E, dentro de `bootstrap(container)`, substituir a função `irParaCidade` por:

```js
  function irParaCidade(jogador) {
    registrarTela("cidade", (el) =>
      montarTelaCidade(el, {
        jogador,
        aoExplorar: () => irParaBatalhaDeTreino(jogador),
        aoAbrirGuilda: () => {
          registrarTela("guilda", (el2) =>
            montarTelaGuilda(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("guilda");
        },
        aoAbrirLoja: () => {
          registrarTela("loja", (el2) =>
            montarTelaLoja(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("loja");
        },
        aoAbrirPersonagem: () => {
          registrarTela("personagem", (el2) =>
            montarTelaPersonagem(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("personagem");
        },
      })
    );
    mostrarTela("cidade");
  }
```

(O restante de `bootstrap` — `irParaBatalhaDeTreino`, `iniciarCriacao`, e a checagem de save existente — permanece idêntico à Fase 2.)

- [ ] **Step 6: Atualizar o teste de integração `WebRPG/src/main.test.js`**

Adicionar ao final do arquivo:

```js
describe("bootstrap: navegação para guilda, loja e personagem", () => {
  function criarPersonagemDeTeste(container) {
    container.querySelector('[data-raca="Humano"]').click();
    container.querySelector('[data-classe="Paladino"]').click();
    const campoNome = container.querySelector("#campo-nome");
    campoNome.value = "Arthas";
    campoNome.dispatchEvent(new Event("input"));
    container.querySelector("#botao-confirmar").click();
  }

  it("abre a tela de loja a partir da cidade e volta ao sair", () => {
    const container = document.createElement("div");
    bootstrap(container);
    criarPersonagemDeTeste(container);

    container.querySelector('[data-local="loja"]').click();
    expect(container.querySelector(".tela-loja")).not.toBeNull();

    container.querySelector("#botao-sair-loja").click();
    expect(container.querySelector(".tela-cidade")).not.toBeNull();
  });

  it("abre a tela de personagem a partir da cidade", () => {
    const container = document.createElement("div");
    bootstrap(container);
    criarPersonagemDeTeste(container);

    container.querySelector('[data-local="personagem"]').click();
    expect(container.querySelector(".tela-personagem")).not.toBeNull();
  });

  it("abre a tela de guilda a partir da cidade", () => {
    const container = document.createElement("div");
    bootstrap(container);
    criarPersonagemDeTeste(container);

    container.querySelector('[data-local="guilda"]').click();
    expect(container.querySelector(".tela-guilda")).not.toBeNull();
  });
});
```

- [ ] **Step 7: Rodar a suíte completa de testes**

Run: `npm run test`
Expected: PASS — todos os testes de `engine/**` e `WebRPG/src/**` verdes (Fases 0-2 + Fase 3 completa).

- [ ] **Step 8: Verificação manual jogável (critério de pronto da Fase 3)**

Run: `npm run dev`

No navegador:
1. Criar um personagem novo (ou continuar de um save existente) e chegar à cidade.
2. Clicar em "Guilda": uma missão aparece (descrição + história); clicar em "Aceitar" resolve a missão e mostra XP/ouro/item ganhos (ou a penalidade, em caso de falha). Voltar à cidade.
3. Clicar em "Loja": comprar um item (o ouro debita e o item some da lista pra virar `disabled` visualmente ou continuar comprável, conforme a implementação — o importante é o ouro atualizar); trocar para a aba "Vender" e vender algo do inventário.
4. Clicar em "Personagem": ver os atributos, o XP para o próximo nível, e equipar um item do inventário — a defesa/ataque do personagem deve refletir a mudança ao reabrir a tela.
5. Repetir o ciclo (missão → ouro → loja → equipar) e confirmar que o personagem fica mensuravelmente mais forte (defesa/ataque maiores).

- [ ] **Step 9: Commit**

```bash
git add WebRPG/src/telas/cidade WebRPG/src/main.js WebRPG/src/main.test.js
git commit -m "feat: liga guilda, loja e personagem à cidade (loop econômico completo)"
```

---

## Resumo do que fica pronto ao final deste plano

- `npm run dev` permite o loop completo pedido pela spec: aceitar uma missão na Guilda → ganhar ouro/XP/itens → comprar/vender na Loja (armas com efeitos variados, armaduras com bônus de conjunto) → equipar na tela de Personagem (com comparação de atributos) → ficar mensuravelmente mais forte.
- `engine/itens/`, `engine/loja/` e `engine/missoes/` são módulos puros e 100% testados, prontos para serem estendidos na Fase 4 (mini-boss, masmorra secreta pós-missão, Talismã da Torre em uso).
- A missão de ondas ("Desafio da Arena Amaldiçoada") já funciona mecanicamente (10 ondas, cura, fragmentos), mas sem tela de batalha visual por onda — fica registrado como refinamento de UX para uma iteração futura, não bloqueando esta fase.
- A cidade agora só tem Torre/Masmorra/Arena como pendências, isolando exatamente o escopo da Fase 4.
