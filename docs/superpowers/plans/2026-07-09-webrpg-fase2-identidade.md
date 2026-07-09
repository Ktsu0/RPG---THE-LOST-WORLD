# WebRPG — Fase 2 (Identidade) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a identidade do jogador no WebRPG: wizard de criação de personagem com preview de atributos em tempo real, cidade-hub clicável, save/load em `localStorage` (com exportar/importar `.json`) e auto-save após batalhas — fechando o critério de pronto da spec: "Criar personagem → cidade → batalha → recarregar página → continuar do save".

**Architecture:** `engine/personagem/` (raças, classes, criação, XP/level-up) e `engine/save/` (schema versionado, serialização) são módulos puros — sem `localStorage`, sem DOM, sem `console.log` — testados com Vitest puro (sem jsdom necessário, mas o projeto já roda tudo em ambiente jsdom por config). `WebRPG/src/armazenamento/localStorage.js` é o único lugar que toca `localStorage`/`Blob`/download, consumindo o `engine/save/`. Duas telas novas em `WebRPG/src/telas/`: `criacao/` (wizard) e `cidade/` (hub), registradas no roteador já existente (`WebRPG/src/rotas/roteador.js`, Fase 0). `WebRPG/src/main.js` ganha uma função `bootstrap(container)` (em vez de código solto no topo do módulo) que decide entre carregar save existente ou mostrar a criação — isso também torna o fluxo completo testável sem precisar de um F5 real de navegador (o teste de integração desta fase simula "recarregar a página" chamando `bootstrap` duas vezes sobre o mesmo `localStorage`).

**Tech Stack:** Mesmo stack da Fase 0/1 — Vite, Vitest + jsdom, JavaScript ESM puro, CSS puro. Nenhuma dependência nova.

## Global Constraints

- Todo texto de UI, nomes de função e variáveis em português, seguindo o padrão já usado no `JogoRPG/` e no `engine/combate/` existente (`criarPersonagem`, `xpParaProximoNivel`, etc).
- Nenhuma imagem via hotlink: todo asset visual vem de `WebRPG/assets/` local.
- `engine/` é uma camada independente: nunca importa de `JogoRPG/` nem de `WebRPG/`.
- `JogoRPG/` (console) não é modificado nesta fase — mesma decisão de escopo da Fase 0/1, migração gradual.
- Aleatoriedade em testes é controlada exclusivamente via `vi.spyOn(Math, 'random')` — sem bibliotecas extras de RNG determinístico.
- `engine/save/` nunca importa `localStorage`, `fs`, ou qualquer API de armazenamento — é puramente serialização/validação de dados. Armazenamento físico é responsabilidade exclusiva de `WebRPG/src/armazenamento/`.
- Fiel ao `JogoRPG/` nas fórmulas e valores numéricos, exceto onde este documento explicitamente decide corrigir um bug (ver "Correções documentadas" abaixo) — nunca corrigir silenciosamente.

## Correções documentadas (divergências intencionais do console)

1. **Índice de classe 1-based → array 0-based.** O `JogoRPG/personagem/criacao/classe.js` usa um dicionário `classesBonus` indexado por string numérica `"1"`-`"6"` que só funciona por causa de coerção implícita de chave em JS. O `engine/personagem/classes.js` usa um array 0-indexed padrão (`classes[0]` = Arqueiro) com busca por nome (`obterClasse(nome)`), eliminando a indexação mágica. O comportamento observável (bônus por classe) é idêntico.
2. **Ouro inicial: 50, não 100.** `WebRPG/legado/main.js:174` (protótipo pré-Vite) criava personagem com `ouro: 100`, mas a fonte de verdade `JogoRPG/personagem/criacao/criacaoPersonagem.js:30` usa `ouro: 50`. Esta fase usa `50`, fiel ao console; o legado não é fonte de verdade de regras, só de UI.
3. **Versionamento de save real.** O console não tem `schemaVersion` (só um `try/catch` em volta do `JSON.parse`, e um patch manual ad-hoc de `equipamentos` em `jogo.js:41-48` para saves antigos). O `engine/save/` desta fase introduz `{ versao: 1, jogador }` como formato real, com validação de versão — trata-se de uma extensão necessária (a spec seção 7 já pede "Esquema JSON único e versionado"), não uma mudança de comportamento de gameplay.

## Fora de escopo desta fase

- **Sprite por classe no preview de criação.** A spec (seção 4.1) pede preview do sprite animado por classe, mas só o sprite do Soldado (genérico) está em `WebRPG/assets/personagens/` até agora (Fase 1). O preview desta fase reusa o sprite `soldado` (idle) para qualquer combinação raça/classe — trocar por sprites por classe fica para quando os assets de monstros/personagens adicionais forem baixados (ver `WebRPG/assets/CREDITS.md`).
- **Cidade com cenário em pixel art clicável de verdade.** Sem os assets de UI/cenário (Kenney, ansimuz — pendentes no CREDITS.md), a tela de cidade desta fase é uma lista de botões grandes em um painel (mesmo design system da Fase 0), não um mapa clicável com sprites de prédios. Isso é consistente com a Fase 1, que também usou um palco de gradiente CSS em vez de parallax.
- **Guilda, Loja, Torre, Masmorra, Arena.** A cidade-hub desta fase lista esses locais como botões desabilitados com o texto "Em breve" — eles são implementados nas Fases 3 e 4. O único local funcional além de "Personagem" é "Explorar", que dispara uma batalha de treino fixa (Soldado vs Orc, reaproveitando a Fase 1) só para fechar o loop criar → cidade → batalha → save → reload → continuar.
- **Level up com escolha de atributo.** `checarLevelUp` aplica ganhos fixos (`+15 HP, +2 ATK, +1 DEF` por nível), fiel ao console — não há árvore de talentos nem escolha do jogador.
- **Múltiplos slots de save.** Um único save por navegador (`localStorage`), fiel ao console (um único arquivo `saves/save_automatico.json`).

---

## Task 1: Dados de raças — `engine/personagem/racas.js` (TDD)

**Files:**
- Create: `engine/personagem/racas.js`
- Test: `engine/personagem/racas.test.js`

**Interfaces:**
- Produces: `listarRacas() -> Array<{nome, descricao, bonus, restricoes}>`, `obterRaca(nome) -> {nome, descricao, bonus: {hp,atk,def,critChance}, restricoes}` (lança erro se a raça não existir) — usados pela Task 3 (`criarPersonagem.js`) e pela Task 7 (tela de criação).

Fiel a `JogoRPG/personagem/criacao/raca.js:1-30` (array `racasDisponiveis`), removendo a UI de prompt/exibição (isso é responsabilidade da tela web).

- [ ] **Step 1: Escrever o teste `engine/personagem/racas.test.js`**

```js
import { describe, it, expect } from "vitest";
import { listarRacas, obterRaca } from "./racas.js";

describe("listarRacas", () => {
  it("retorna as 7 raças disponíveis", () => {
    const racas = listarRacas();
    expect(racas).toHaveLength(7);
    expect(racas.map((r) => r.nome)).toEqual([
      "Anão", "Elfo", "Humano", "Morto-vivo", "Orc", "Bestial", "Dragonoide",
    ]);
  });
});

describe("obterRaca", () => {
  it("retorna o bônus correto do Anão", () => {
    const raca = obterRaca("Anão");
    expect(raca.bonus).toEqual({ hp: 0, atk: -3, def: 15, critChance: 0 });
    expect(raca.restricoes).toEqual({});
  });

  it("retorna a restrição semArmadura do Dragonoide", () => {
    const raca = obterRaca("Dragonoide");
    expect(raca.bonus).toEqual({ hp: 15, atk: 5, def: 0, critChance: 0 });
    expect(raca.restricoes).toEqual({ semArmadura: true });
  });

  it("retorna o bônus de crítico do Bestial", () => {
    const raca = obterRaca("Bestial");
    expect(raca.bonus.critChance).toBe(10);
  });

  it("lança erro para uma raça que não existe", () => {
    expect(() => obterRaca("Anjo")).toThrow('Raça "Anjo" não existe.');
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- personagem/racas`
Expected: FAIL — `Cannot find module './racas.js'`.

- [ ] **Step 3: Implementar `engine/personagem/racas.js`**

```js
export const racas = [
  { nome: "Anão", descricao: "+15 DEF, -3 ATK", bonus: { hp: 0, atk: -3, def: 15, critChance: 0 }, restricoes: {} },
  { nome: "Elfo", descricao: "+20 HP, -2 ATK", bonus: { hp: 20, atk: -2, def: 0, critChance: 0 }, restricoes: {} },
  { nome: "Humano", descricao: "Balanceado", bonus: { hp: 0, atk: 0, def: 0, critChance: 0 }, restricoes: {} },
  { nome: "Morto-vivo", descricao: "+5 ATK, -10 HP", bonus: { hp: -10, atk: 5, def: 0, critChance: 0 }, restricoes: {} },
  { nome: "Orc", descricao: "+8 ATK, -5 DEF", bonus: { hp: 0, atk: 8, def: -5, critChance: 0 }, restricoes: {} },
  { nome: "Bestial", descricao: "+10% Crítico, -7 HP", bonus: { hp: -7, atk: 0, def: 0, critChance: 10 }, restricoes: {} },
  { nome: "Dragonoide", descricao: "+15 HP, +5 ATK, não pode usar armaduras", bonus: { hp: 15, atk: 5, def: 0, critChance: 0 }, restricoes: { semArmadura: true } },
];

export function listarRacas() {
  return racas;
}

export function obterRaca(nome) {
  const raca = racas.find((r) => r.nome === nome);
  if (!raca) {
    throw new Error(`Raça "${nome}" não existe.`);
  }
  return raca;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- personagem/racas`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/personagem/racas.js engine/personagem/racas.test.js
git commit -m "feat: dados de raças do engine de personagem"
```

---

## Task 2: Dados de classes — `engine/personagem/classes.js` (TDD)

**Files:**
- Create: `engine/personagem/classes.js`
- Test: `engine/personagem/classes.test.js`

**Interfaces:**
- Produces: `listarClasses() -> Array<{nome, descricao, bonus}>`, `obterClasse(nome) -> {nome, descricao, bonus: {habilidade,atk,def,dropOuro,dropItem,critChance,esquiva,bloqueioChance}}` (lança erro se a classe não existir) — usados pela Task 3 e pela Task 7.

Fiel a `JogoRPG/personagem/criacao/classe.js:1-40` (`classesDisponiveis` + `classesBonus`), aplicando a correção documentada #1 (array 0-indexed em vez do dicionário 1-indexed por coerção implícita).

- [ ] **Step 1: Escrever o teste `engine/personagem/classes.test.js`**

```js
import { describe, it, expect } from "vitest";
import { listarClasses, obterClasse } from "./classes.js";

describe("listarClasses", () => {
  it("retorna as 6 classes disponíveis, na ordem do console", () => {
    const classes = listarClasses();
    expect(classes).toHaveLength(6);
    expect(classes.map((c) => c.nome)).toEqual([
      "Arqueiro", "Paladino", "Assassino", "Bárbaro", "Necromante", "Xamã",
    ]);
  });
});

describe("obterClasse", () => {
  it("retorna o bônus do Arqueiro (esquiva + drop de ouro)", () => {
    const classe = obterClasse("Arqueiro");
    expect(classe.bonus).toEqual({
      habilidade: "esquiva", atk: 0, def: 0, dropOuro: 10, dropItem: 0,
      critChance: 0, esquiva: 10, bloqueioChance: 0,
    });
  });

  it("retorna o bônus de ataque do Bárbaro", () => {
    const classe = obterClasse("Bárbaro");
    expect(classe.bonus.atk).toBe(8);
    expect(classe.bonus.habilidade).toBe("furia");
  });

  it("retorna o bônus de esquiva do Xamã", () => {
    const classe = obterClasse("Xamã");
    expect(classe.bonus.esquiva).toBe(15);
    expect(classe.bonus.habilidade).toBe("cura");
  });

  it("lança erro para uma classe que não existe", () => {
    expect(() => obterClasse("Ferreiro")).toThrow('Classe "Ferreiro" não existe.');
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- personagem/classes`
Expected: FAIL — `Cannot find module './classes.js'`.

- [ ] **Step 3: Implementar `engine/personagem/classes.js`**

```js
export const classes = [
  { nome: "Arqueiro", descricao: "Esquiva + bônus drop de ouro", bonus: { habilidade: "esquiva", atk: 0, def: 0, dropOuro: 10, dropItem: 0, critChance: 0, esquiva: 10, bloqueioChance: 0 } },
  { nome: "Paladino", descricao: "Crítico + chance de bloquear ataques", bonus: { habilidade: "bloqueio", atk: 0, def: 0, dropOuro: 0, dropItem: 0, critChance: 10, esquiva: 0, bloqueioChance: 10 } },
  { nome: "Assassino", descricao: "Sangramento + bônus drop de itens", bonus: { habilidade: "sangramento", atk: 0, def: 0, dropOuro: 0, dropItem: 10, critChance: 0, esquiva: 0, bloqueioChance: 0 } },
  { nome: "Bárbaro", descricao: "Fúria quando HP baixo", bonus: { habilidade: "furia", atk: 8, def: 0, dropOuro: 0, dropItem: 0, critChance: 0, esquiva: 0, bloqueioChance: 0 } },
  { nome: "Necromante", descricao: "Invocar esqueleto aliado", bonus: { habilidade: "invocacao", atk: 5, def: 0, dropOuro: 0, dropItem: 0, critChance: 0, esquiva: 0, bloqueioChance: 0 } },
  { nome: "Xamã", descricao: "Chance de cura de 5% HP por turno + bônus esquiva", bonus: { habilidade: "cura", atk: 0, def: 0, dropOuro: 0, dropItem: 0, critChance: 0, esquiva: 15, bloqueioChance: 0 } },
];

export function listarClasses() {
  return classes;
}

export function obterClasse(nome) {
  const classe = classes.find((c) => c.nome === nome);
  if (!classe) {
    throw new Error(`Classe "${nome}" não existe.`);
  }
  return classe;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- personagem/classes`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/personagem/classes.js engine/personagem/classes.test.js
git commit -m "feat: dados de classes do engine de personagem"
```

---

## Task 3: Criação de personagem — `engine/personagem/criarPersonagem.js` (TDD)

**Files:**
- Create: `engine/personagem/criarPersonagem.js`
- Test: `engine/personagem/criarPersonagem.test.js`

**Interfaces:**
- Consumes: `obterRaca` (Task 1), `obterClasse` (Task 2).
- Produces: `validarNome(nome) -> boolean`, `calcularAtributosIniciais(racaNome, classeNome) -> {hp, hpMax, ataque, defesa}`, `criarPersonagem({nome, racaNome, classeNome}) -> jogador` (lança erro se nome/raça/classe inválidos) — `calcularAtributosIniciais` é reusado pela Task 7 (preview ao vivo no wizard, sem precisar de nome); `criarPersonagem` é usado pela Task 7 (confirmação final) e pela Task 11 (`main.js`).

Fiel a `JogoRPG/personagem/criacao/criacaoPersonagem.js:1-51`, removendo `prompt-sync`/`process.stdout` e aplicando a correção documentada #2 (`ouro: 50`).

- [ ] **Step 1: Escrever o teste `engine/personagem/criarPersonagem.test.js`**

```js
import { describe, it, expect } from "vitest";
import { validarNome, calcularAtributosIniciais, criarPersonagem } from "./criarPersonagem.js";

describe("validarNome", () => {
  it("aceita um nome não vazio", () => {
    expect(validarNome("Thorin")).toBe(true);
  });

  it("rejeita string vazia", () => {
    expect(validarNome("")).toBe(false);
  });

  it("rejeita string só com espaços", () => {
    expect(validarNome("   ")).toBe(false);
  });

  it("rejeita valores não-string", () => {
    expect(validarNome(undefined)).toBe(false);
    expect(validarNome(null)).toBe(false);
  });
});

describe("calcularAtributosIniciais", () => {
  it("combina bônus de raça e classe (Anão + Arqueiro)", () => {
    const atributos = calcularAtributosIniciais("Anão", "Arqueiro");
    // hp = 100 + 0 (Anão), ataque = 5 + (-3) + 0 = 2, defesa = 5 + 15 + 0 = 20
    expect(atributos).toEqual({ hp: 100, hpMax: 100, ataque: 2, defesa: 20 });
  });

  it("combina bônus de raça e classe (Morto-vivo + Bárbaro)", () => {
    const atributos = calcularAtributosIniciais("Morto-vivo", "Bárbaro");
    // hp = 100 - 10 = 90, ataque = 5 + 5 + 8 = 18, defesa = 5 + 0 + 0 = 5
    expect(atributos).toEqual({ hp: 90, hpMax: 90, ataque: 18, defesa: 5 });
  });
});

describe("criarPersonagem", () => {
  it("cria um jogador com o shape completo esperado pelo engine de combate", () => {
    const jogador = criarPersonagem({ nome: "Thorin", racaNome: "Anão", classeNome: "Arqueiro" });

    expect(jogador).toEqual({
      nome: "Thorin",
      raca: "Anão",
      classe: "Arqueiro",
      habilidadeClasse: "esquiva",
      bonusClasse: {
        habilidade: "esquiva", atk: 0, def: 0, dropOuro: 10, dropItem: 0,
        critChance: 0, esquiva: 10, bloqueioChance: 0,
      },
      hp: 100, hpMax: 100,
      nivel: 1, xp: 0, ouro: 50,
      ataque: 2, defesa: 20,
      bonusRaca: { hp: 0, atk: -3, def: 15, critChance: 0 },
      restricoes: {},
      equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
      itens: [], inventario: [], armas: [],
      armaEquipada: null, amuletoEquipado: false, status: [],
      ativarHistoria: true,
    });
  });

  it("remove espaços extras do nome", () => {
    const jogador = criarPersonagem({ nome: "  Gimli  ", racaNome: "Anão", classeNome: "Paladino" });
    expect(jogador.nome).toBe("Gimli");
  });

  it("aplica a restrição semArmadura do Dragonoide", () => {
    const jogador = criarPersonagem({ nome: "Draco", racaNome: "Dragonoide", classeNome: "Xamã" });
    expect(jogador.restricoes).toEqual({ semArmadura: true });
  });

  it("lança erro quando o nome é inválido", () => {
    expect(() => criarPersonagem({ nome: "  ", racaNome: "Anão", classeNome: "Arqueiro" })).toThrow(
      "Nome do personagem não pode ser vazio."
    );
  });

  it("lança erro quando a raça não existe", () => {
    expect(() => criarPersonagem({ nome: "X", racaNome: "Anjo", classeNome: "Arqueiro" })).toThrow(
      'Raça "Anjo" não existe.'
    );
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- personagem/criarPersonagem`
Expected: FAIL — `Cannot find module './criarPersonagem.js'`.

- [ ] **Step 3: Implementar `engine/personagem/criarPersonagem.js`**

```js
import { obterRaca } from "./racas.js";
import { obterClasse } from "./classes.js";

export function validarNome(nome) {
  return typeof nome === "string" && nome.trim().length > 0;
}

export function calcularAtributosIniciais(racaNome, classeNome) {
  const { bonus: bonusRaca } = obterRaca(racaNome);
  const { bonus: bonusClasse } = obterClasse(classeNome);
  return {
    hp: 100 + bonusRaca.hp,
    hpMax: 100 + bonusRaca.hp,
    ataque: 5 + bonusRaca.atk + bonusClasse.atk,
    defesa: 5 + bonusRaca.def + bonusClasse.def,
  };
}

export function criarPersonagem({ nome, racaNome, classeNome }) {
  if (!validarNome(nome)) {
    throw new Error("Nome do personagem não pode ser vazio.");
  }
  const raca = obterRaca(racaNome);
  const classe = obterClasse(classeNome);
  const atributos = calcularAtributosIniciais(racaNome, classeNome);

  return {
    nome: nome.trim(),
    raca: raca.nome,
    classe: classe.nome,
    habilidadeClasse: classe.bonus.habilidade,
    bonusClasse: classe.bonus,
    hp: atributos.hp,
    hpMax: atributos.hpMax,
    nivel: 1,
    xp: 0,
    ouro: 50,
    ataque: atributos.ataque,
    defesa: atributos.defesa,
    bonusRaca: raca.bonus,
    restricoes: raca.restricoes,
    equipamentos: { head: null, chest: null, hands: null, legs: null, feet: null },
    itens: [],
    inventario: [],
    armas: [],
    armaEquipada: null,
    amuletoEquipado: false,
    status: [],
    ativarHistoria: true,
  };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- personagem/criarPersonagem`
Expected: PASS — 11 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/personagem/criarPersonagem.js engine/personagem/criarPersonagem.test.js
git commit -m "feat: criação de personagem do engine (raça + classe + nome)"
```

---

## Task 4: XP e level up — `engine/personagem/experiencia.js` (TDD)

**Files:**
- Create: `engine/personagem/experiencia.js`
- Test: `engine/personagem/experiencia.test.js`

**Interfaces:**
- Produces: `xpParaProximoNivel(jogador) -> number`, `checarLevelUp(jogador) -> Array<{tipo: 'level_up', nivel, hpMax}>` (muta `jogador` e retorna a lista de eventos de level up ocorridos) — usado pela Task 11 (`main.js`, após vitória em batalha).

Fiel a `JogoRPG/personagem/experiencia.js:1-22` e `JogoRPG/config/game.js` (`GAME_CONFIG.leveling`), removendo `console.log` e retornando eventos em vez de imprimir.

- [ ] **Step 1: Escrever o teste `engine/personagem/experiencia.test.js`**

```js
import { describe, it, expect } from "vitest";
import { xpParaProximoNivel, checarLevelUp } from "./experiencia.js";

describe("xpParaProximoNivel", () => {
  it("calcula floor(50 * nivel^1.4) para o nível 1", () => {
    expect(xpParaProximoNivel({ nivel: 1 })).toBe(50);
  });

  it("calcula floor(50 * nivel^1.4) para o nível 3", () => {
    // 50 * 3^1.4 = 50 * 4.6555... = 232.77... -> floor = 232
    expect(xpParaProximoNivel({ nivel: 3 })).toBe(232);
  });
});

describe("checarLevelUp", () => {
  it("não sobe de nível quando o XP é insuficiente", () => {
    const jogador = { nivel: 1, xp: 10, hpMax: 100, hp: 80, ataque: 5, defesa: 5 };
    const eventos = checarLevelUp(jogador);
    expect(eventos).toEqual([]);
    expect(jogador.nivel).toBe(1);
    expect(jogador.xp).toBe(10);
  });

  it("sobe um nível, restaura o HP e aplica os ganhos de atributo", () => {
    const jogador = { nivel: 1, xp: 50, hpMax: 100, hp: 40, ataque: 5, defesa: 5 };
    const eventos = checarLevelUp(jogador);
    expect(eventos).toEqual([{ tipo: "level_up", nivel: 2, hpMax: 115 }]);
    expect(jogador.nivel).toBe(2);
    expect(jogador.xp).toBe(0);
    expect(jogador.hpMax).toBe(115);
    expect(jogador.hp).toBe(115);
    expect(jogador.ataque).toBe(7);
    expect(jogador.defesa).toBe(6);
  });

  it("sobe múltiplos níveis numa única chamada quando o XP acumulado é suficiente", () => {
    const jogador = { nivel: 1, xp: 300, hpMax: 100, hp: 100, ataque: 5, defesa: 5 };
    const eventos = checarLevelUp(jogador);
    // nível 1->2 custa floor(50*1^1.4)=50 (sobra 250), nível 2->3 custa floor(50*2^1.4)=131 (sobra 119)
    // -> nível 3, não alcança o custo do nível 3->4 (floor(50*3^1.4)=232)
    expect(eventos).toHaveLength(2);
    expect(jogador.nivel).toBe(3);
    expect(jogador.xp).toBe(119);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- personagem/experiencia`
Expected: FAIL — `Cannot find module './experiencia.js'`.

- [ ] **Step 3: Implementar `engine/personagem/experiencia.js`**

```js
const LEVELING_CONFIG = {
  baseXp: 50,
  exponent: 1.4,
  statsGain: { hp: 15, atk: 2, def: 1 },
};

export function xpParaProximoNivel(jogador) {
  return Math.floor(LEVELING_CONFIG.baseXp * Math.pow(jogador.nivel, LEVELING_CONFIG.exponent));
}

export function checarLevelUp(jogador) {
  const eventos = [];
  while (jogador.xp >= xpParaProximoNivel(jogador)) {
    jogador.xp -= xpParaProximoNivel(jogador);
    jogador.nivel += 1;
    jogador.hpMax += LEVELING_CONFIG.statsGain.hp;
    jogador.ataque += LEVELING_CONFIG.statsGain.atk;
    jogador.defesa += LEVELING_CONFIG.statsGain.def;
    jogador.hp = jogador.hpMax;
    eventos.push({ tipo: "level_up", nivel: jogador.nivel, hpMax: jogador.hpMax });
  }
  return eventos;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- personagem/experiencia`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/personagem/experiencia.js engine/personagem/experiencia.test.js
git commit -m "feat: XP e level up do engine de personagem"
```

---

## Task 5: Schema de save versionado — `engine/save/index.js` (TDD)

**Files:**
- Create: `engine/save/index.js`
- Test: `engine/save/index.test.js`

**Interfaces:**
- Produces: `criarSave(jogador) -> {versao: 1, jogador}`, `serializarSave(jogador) -> string`, `desserializarSave(texto) -> {valido: boolean, jogador: object|null, erro: string|null}` — usados pela Task 6 (`WebRPG/src/armazenamento/localStorage.js`).

Introduz o esquema JSON versionado pedido pela spec seção 7 ("Esquema JSON único e versionado"). Sem equivalente 1:1 no console (ver "Correções documentadas" #3) — o console só faz `JSON.stringify(jogador)`/`JSON.parse` direto, sem wrapper nem versão.

- [ ] **Step 1: Escrever o teste `engine/save/index.test.js`**

```js
import { describe, it, expect } from "vitest";
import { criarSave, serializarSave, desserializarSave } from "./index.js";

function jogadorDeTeste() {
  return { nome: "Thorin", nivel: 3, hp: 80, hpMax: 100 };
}

describe("criarSave", () => {
  it("envolve o jogador num objeto versionado", () => {
    expect(criarSave(jogadorDeTeste())).toEqual({ versao: 1, jogador: jogadorDeTeste() });
  });
});

describe("serializarSave e desserializarSave", () => {
  it("faz o round-trip preservando o jogador", () => {
    const texto = serializarSave(jogadorDeTeste());
    const resultado = desserializarSave(texto);
    expect(resultado).toEqual({ valido: true, jogador: jogadorDeTeste(), erro: null });
  });

  it("retorna inválido para um texto que não é JSON", () => {
    const resultado = desserializarSave("{ isso não é json");
    expect(resultado.valido).toBe(false);
    expect(resultado.jogador).toBeNull();
    expect(resultado.erro).toBe("Save corrompido (JSON inválido).");
  });

  it("retorna inválido quando falta o campo jogador", () => {
    const resultado = desserializarSave(JSON.stringify({ versao: 1 }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toBe("Formato de save inválido.");
  });

  it("retorna inválido quando a versão não bate", () => {
    const resultado = desserializarSave(JSON.stringify({ versao: 99, jogador: jogadorDeTeste() }));
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toBe("Versão de save incompatível (esperado 1, recebido 99).");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- save/index`
Expected: FAIL — `Cannot find module './index.js'`.

- [ ] **Step 3: Implementar `engine/save/index.js`**

```js
const VERSAO_SAVE = 1;

export function criarSave(jogador) {
  return { versao: VERSAO_SAVE, jogador };
}

export function serializarSave(jogador) {
  return JSON.stringify(criarSave(jogador));
}

export function desserializarSave(texto) {
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch (erro) {
    return { valido: false, jogador: null, erro: "Save corrompido (JSON inválido)." };
  }

  if (!dados || typeof dados !== "object" || !dados.jogador || typeof dados.jogador !== "object") {
    return { valido: false, jogador: null, erro: "Formato de save inválido." };
  }

  if (dados.versao !== VERSAO_SAVE) {
    return {
      valido: false,
      jogador: null,
      erro: `Versão de save incompatível (esperado ${VERSAO_SAVE}, recebido ${dados.versao}).`,
    };
  }

  return { valido: true, jogador: dados.jogador, erro: null };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- save/index`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/save/index.js engine/save/index.test.js
git commit -m "feat: schema de save versionado do engine"
```

---

## Task 6: Armazenamento no navegador — `WebRPG/src/armazenamento/localStorage.js` (TDD)

**Files:**
- Create: `WebRPG/src/armazenamento/localStorage.js`
- Test: `WebRPG/src/armazenamento/localStorage.test.js`

**Interfaces:**
- Consumes: `serializarSave`, `desserializarSave` (`@engine/save/index.js`, Task 5).
- Produces: `salvarNoNavegador(jogador)`, `carregarDoNavegador() -> {valido, jogador, erro}`, `existeSaveNoNavegador() -> boolean`, `exportarSave(jogador)` (dispara download do `.json`), `importarSave(textoArquivo) -> {valido, jogador, erro}` — todos usados pela Task 11 (`main.js`).

Único ponto de contato com `localStorage`/`Blob`/download do projeto — mantém `engine/save/` agnóstico de armazenamento, conforme a spec seção 7.

- [ ] **Step 1: Escrever o teste `WebRPG/src/armazenamento/localStorage.test.js`**

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  salvarNoNavegador,
  carregarDoNavegador,
  existeSaveNoNavegador,
  exportarSave,
  importarSave,
} from "./localStorage.js";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function jogadorDeTeste() {
  return { nome: "Testudo", hp: 10 };
}

describe("salvarNoNavegador e carregarDoNavegador", () => {
  it("retorna inválido (sem erro) quando não há save salvo", () => {
    expect(carregarDoNavegador()).toEqual({ valido: false, jogador: null, erro: null });
  });

  it("salva e recupera o jogador corretamente", () => {
    salvarNoNavegador(jogadorDeTeste());
    expect(carregarDoNavegador()).toEqual({ valido: true, jogador: jogadorDeTeste(), erro: null });
  });
});

describe("existeSaveNoNavegador", () => {
  it("retorna false antes de salvar e true depois", () => {
    expect(existeSaveNoNavegador()).toBe(false);
    salvarNoNavegador(jogadorDeTeste());
    expect(existeSaveNoNavegador()).toBe(true);
  });
});

describe("importarSave", () => {
  it("aceita um texto de save válido", () => {
    const texto = JSON.stringify({ versao: 1, jogador: jogadorDeTeste() });
    expect(importarSave(texto)).toEqual({ valido: true, jogador: jogadorDeTeste(), erro: null });
  });

  it("rejeita um texto corrompido", () => {
    const resultado = importarSave("{ isso não é json");
    expect(resultado.valido).toBe(false);
  });
});

describe("exportarSave", () => {
  it("cria uma URL de blob e dispara o download via link", () => {
    const criarObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    const revogarObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clique = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    exportarSave(jogadorDeTeste());

    expect(criarObjectURL).toHaveBeenCalledOnce();
    expect(clique).toHaveBeenCalledOnce();
    expect(revogarObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- armazenamento/localStorage`
Expected: FAIL — `Cannot find module './localStorage.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/armazenamento/localStorage.js`**

```js
import { serializarSave, desserializarSave } from "@engine/save/index.js";

const CHAVE_SAVE = "webrpg_save";

export function salvarNoNavegador(jogador) {
  localStorage.setItem(CHAVE_SAVE, serializarSave(jogador));
}

export function carregarDoNavegador() {
  const texto = localStorage.getItem(CHAVE_SAVE);
  if (!texto) {
    return { valido: false, jogador: null, erro: null };
  }
  return desserializarSave(texto);
}

export function existeSaveNoNavegador() {
  return localStorage.getItem(CHAVE_SAVE) !== null;
}

export function exportarSave(jogador) {
  const blob = new Blob([serializarSave(jogador)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `the-lost-world-save-${jogador.nome}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importarSave(textoArquivo) {
  return desserializarSave(textoArquivo);
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- armazenamento/localStorage`
Expected: PASS — 6 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add WebRPG/src/armazenamento/localStorage.js WebRPG/src/armazenamento/localStorage.test.js
git commit -m "feat: armazenamento de save no navegador (localStorage + exportar/importar)"
```

---

## Task 7: Tela de criação de personagem — `telaCriacao.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/criacao/telaCriacao.js`
- Test: `WebRPG/src/telas/criacao/telaCriacao.test.js`
- Create: `WebRPG/src/estilos/criacao.css`
- Modify: `WebRPG/src/main.js` (import do novo CSS)

**Interfaces:**
- Consumes: `listarRacas` (Task 1), `listarClasses` (Task 2), `calcularAtributosIniciais`, `criarPersonagem` (Task 3).
- Produces: `montarTelaCriacao(container, { aoConfirmar }) -> elementos`, onde `elementos` inclui `botaoConfirmar`, `campoNome`, `painelPreview` — usado pela Task 11 (`main.js`), registrado no roteador como tela `'criacao'`.

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/criacao/telaCriacao.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { montarTelaCriacao } from "./telaCriacao.js";

describe("montarTelaCriacao", () => {
  it("renderiza um botão para cada raça e cada classe", () => {
    const container = document.createElement("div");
    montarTelaCriacao(container, { aoConfirmar: vi.fn() });
    expect(container.querySelectorAll('[data-raca]')).toHaveLength(7);
    expect(container.querySelectorAll('[data-classe]')).toHaveLength(6);
  });

  it("o botão confirmar começa desabilitado", () => {
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar: vi.fn() });
    expect(elementos.botaoConfirmar.disabled).toBe(true);
  });

  it("atualiza o preview de atributos ao escolher raça e classe", () => {
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar: vi.fn() });

    container.querySelector('[data-raca="Anão"]').click();
    container.querySelector('[data-classe="Arqueiro"]').click();

    // hp = 100, ataque = 5 + (-3) + 0 = 2, defesa = 5 + 15 + 0 = 20
    expect(elementos.painelPreview.textContent).toContain("HP: 100");
    expect(elementos.painelPreview.textContent).toContain("Ataque: 2");
    expect(elementos.painelPreview.textContent).toContain("Defesa: 20");
  });

  it("habilita o botão confirmar somente quando raça, classe e nome estão preenchidos", () => {
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar: vi.fn() });

    container.querySelector('[data-raca="Humano"]').click();
    expect(elementos.botaoConfirmar.disabled).toBe(true);

    container.querySelector('[data-classe="Paladino"]').click();
    expect(elementos.botaoConfirmar.disabled).toBe(true);

    elementos.campoNome.value = "Arthas";
    elementos.campoNome.dispatchEvent(new Event("input"));
    expect(elementos.botaoConfirmar.disabled).toBe(false);
  });

  it("chama aoConfirmar com o jogador criado ao clicar em confirmar", () => {
    const aoConfirmar = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaCriacao(container, { aoConfirmar });

    container.querySelector('[data-raca="Elfo"]').click();
    container.querySelector('[data-classe="Xamã"]').click();
    elementos.campoNome.value = "Aelindra";
    elementos.campoNome.dispatchEvent(new Event("input"));
    elementos.botaoConfirmar.click();

    expect(aoConfirmar).toHaveBeenCalledOnce();
    const jogadorCriado = aoConfirmar.mock.calls[0][0];
    expect(jogadorCriado.nome).toBe("Aelindra");
    expect(jogadorCriado.raca).toBe("Elfo");
    expect(jogadorCriado.classe).toBe("Xamã");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaCriacao`
Expected: FAIL — `Cannot find module './telaCriacao.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/criacao/telaCriacao.js`**

```js
import { listarRacas } from "@engine/personagem/racas.js";
import { listarClasses } from "@engine/personagem/classes.js";
import { calcularAtributosIniciais, criarPersonagem } from "@engine/personagem/criarPersonagem.js";

export function montarTelaCriacao(container, { aoConfirmar }) {
  container.innerHTML = `
    <div class="tela-criacao">
      <div class="sprite-preview">
        <div class="sprite" data-personagem="soldado" style="background-image: url(/assets/personagens/soldado/idle.png); --sprite-frames: 6;"></div>
      </div>
      <div class="painel selecao-raca">
        <h2>Raça</h2>
        <div class="lista-opcoes" data-lista="racas"></div>
      </div>
      <div class="painel selecao-classe">
        <h2>Classe</h2>
        <div class="lista-opcoes" data-lista="classes"></div>
      </div>
      <div class="painel painel-preview">
        <h2>Atributos</h2>
        <p class="preview-vazio">Escolha raça e classe para ver o preview.</p>
      </div>
      <div class="painel campo-nome-painel">
        <label for="campo-nome">Nome do personagem</label>
        <input type="text" id="campo-nome" class="campo-nome" />
      </div>
      <button class="botao botao--destaque" id="botao-confirmar" disabled>Começar Jornada</button>
    </div>
  `;

  const listaRacas = container.querySelector('[data-lista="racas"]');
  for (const raca of listarRacas()) {
    const botao = document.createElement("button");
    botao.className = "botao opcao-raca";
    botao.dataset.raca = raca.nome;
    botao.textContent = `${raca.nome} — ${raca.descricao}`;
    listaRacas.appendChild(botao);
  }

  const listaClasses = container.querySelector('[data-lista="classes"]');
  for (const classe of listarClasses()) {
    const botao = document.createElement("button");
    botao.className = "botao opcao-classe";
    botao.dataset.classe = classe.nome;
    botao.textContent = `${classe.nome} — ${classe.descricao}`;
    listaClasses.appendChild(botao);
  }

  const painelPreview = container.querySelector(".painel-preview");
  const campoNome = container.querySelector("#campo-nome");
  const botaoConfirmar = container.querySelector("#botao-confirmar");

  const estado = { racaNome: null, classeNome: null };

  function atualizarPreview() {
    if (!estado.racaNome || !estado.classeNome) return;
    const atributos = calcularAtributosIniciais(estado.racaNome, estado.classeNome);
    painelPreview.innerHTML = `
      <h2>Atributos</h2>
      <p>HP: ${atributos.hpMax}</p>
      <p>Ataque: ${atributos.ataque}</p>
      <p>Defesa: ${atributos.defesa}</p>
    `;
  }

  function atualizarBotaoConfirmar() {
    botaoConfirmar.disabled = !(estado.racaNome && estado.classeNome && campoNome.value.trim());
  }

  for (const botao of listaRacas.querySelectorAll("[data-raca]")) {
    botao.addEventListener("click", () => {
      for (const b of listaRacas.querySelectorAll("[data-raca]")) b.classList.remove("opcao--selecionada");
      botao.classList.add("opcao--selecionada");
      estado.racaNome = botao.dataset.raca;
      atualizarPreview();
      atualizarBotaoConfirmar();
    });
  }

  for (const botao of listaClasses.querySelectorAll("[data-classe]")) {
    botao.addEventListener("click", () => {
      for (const b of listaClasses.querySelectorAll("[data-classe]")) b.classList.remove("opcao--selecionada");
      botao.classList.add("opcao--selecionada");
      estado.classeNome = botao.dataset.classe;
      atualizarPreview();
      atualizarBotaoConfirmar();
    });
  }

  campoNome.addEventListener("input", atualizarBotaoConfirmar);

  botaoConfirmar.addEventListener("click", () => {
    const jogador = criarPersonagem({
      nome: campoNome.value,
      racaNome: estado.racaNome,
      classeNome: estado.classeNome,
    });
    aoConfirmar(jogador);
  });

  return { botaoConfirmar, campoNome, painelPreview };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaCriacao`
Expected: PASS — 5 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/criacao.css`**

```css
.tela-criacao {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
  max-width: 900px;
  margin: 0 auto;
}

.sprite-preview {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: var(--espaco-md);
}

.sprite-preview .sprite {
  width: 100px;
  height: 100px;
  background-repeat: no-repeat;
  background-size: auto 100%;
  transform: scale(2);
  animation: sprite-play 1.2s steps(6) infinite;
}

.lista-opcoes {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}

.opcao--selecionada {
  border-color: var(--cor-destaque) !important;
  color: var(--cor-destaque);
}

.painel-preview {
  grid-column: 1 / -1;
}

.campo-nome-painel {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}

.campo-nome {
  font-family: var(--fonte-corpo);
  padding: var(--espaco-sm);
  background: var(--cor-fundo);
  border: 2px solid var(--cor-borda);
  border-radius: var(--raio-painel);
  color: var(--cor-texto);
}

#botao-confirmar {
  grid-column: 1 / -1;
}
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

Adicionar a linha abaixo do bloco de imports de estilo existente:

```js
import "./estilos/criacao.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/criacao WebRPG/src/estilos/criacao.css WebRPG/src/main.js
git commit -m "feat: tela de criação de personagem com preview ao vivo"
```

---

## Task 8: Tela de cidade (hub) — `telaCidade.js` (TDD)

**Files:**
- Create: `WebRPG/src/telas/cidade/telaCidade.js`
- Test: `WebRPG/src/telas/cidade/telaCidade.test.js`
- Create: `WebRPG/src/estilos/cidade.css`
- Modify: `WebRPG/src/main.js` (import do novo CSS)

**Interfaces:**
- Produces: `montarTelaCidade(container, { jogador, aoExplorar }) -> elementos`, onde `elementos` inclui `botaoExplorar`, `cabecalho` — usado pela Task 11 (`main.js`), registrado no roteador como tela `'cidade'`. Locais "Guilda", "Loja", "Torre", "Masmorra", "Arena" aparecem como botões desabilitados com texto "Em breve" (implementados nas Fases 3/4).

- [ ] **Step 1: Escrever o teste `WebRPG/src/telas/cidade/telaCidade.test.js`**

```js
import { describe, it, expect, vi } from "vitest";
import { montarTelaCidade } from "./telaCidade.js";

function jogadorDeTeste() {
  return { nome: "Thorin", nivel: 3, hp: 80, hpMax: 100, ouro: 120 };
}

describe("montarTelaCidade", () => {
  it("exibe nome, nível, HP e ouro do jogador no cabeçalho", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), aoExplorar: vi.fn() });
    const texto = container.querySelector(".cabecalho-cidade").textContent;
    expect(texto).toContain("Thorin");
    expect(texto).toContain("Nível 3");
    expect(texto).toContain("80/100");
    expect(texto).toContain("120");
  });

  it("desabilita os locais ainda não implementados", () => {
    const container = document.createElement("div");
    montarTelaCidade(container, { jogador: jogadorDeTeste(), aoExplorar: vi.fn() });
    for (const local of ["guilda", "loja", "torre", "masmorra", "arena"]) {
      const botao = container.querySelector(`[data-local="${local}"]`);
      expect(botao.disabled).toBe(true);
      expect(botao.textContent).toContain("Em breve");
    }
  });

  it("chama aoExplorar ao clicar no botão Explorar", () => {
    const aoExplorar = vi.fn();
    const container = document.createElement("div");
    const elementos = montarTelaCidade(container, { jogador: jogadorDeTeste(), aoExplorar });
    elementos.botaoExplorar.click();
    expect(aoExplorar).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- telaCidade`
Expected: FAIL — `Cannot find module './telaCidade.js'`.

- [ ] **Step 3: Implementar `WebRPG/src/telas/cidade/telaCidade.js`**

```js
export function montarTelaCidade(container, { jogador, aoExplorar }) {
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
        <button class="botao local-cidade" data-local="guilda" disabled>📝 Guilda — Em breve</button>
        <button class="botao local-cidade" data-local="loja" disabled>💰 Loja — Em breve</button>
        <button class="botao local-cidade" data-local="torre" disabled>🏰 Torre — Em breve</button>
        <button class="botao local-cidade" data-local="masmorra" disabled>🗝️ Masmorra — Em breve</button>
        <button class="botao local-cidade" data-local="arena" disabled>⚔️ Arena — Em breve</button>
      </div>
    </div>
  `;

  const botaoExplorar = container.querySelector('[data-local="explorar"]');
  botaoExplorar.addEventListener("click", () => aoExplorar());

  return { botaoExplorar, cabecalho: container.querySelector(".cabecalho-cidade") };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- telaCidade`
Expected: PASS — 3 testes verdes.

- [ ] **Step 5: Criar `WebRPG/src/estilos/cidade.css`**

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

.grade-locais {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaco-sm);
}

.local-cidade {
  padding: var(--espaco-md);
  text-align: left;
}
```

- [ ] **Step 6: Importar o novo CSS em `WebRPG/src/main.js`**

```js
import "./estilos/cidade.css";
```

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/telas/cidade WebRPG/src/estilos/cidade.css WebRPG/src/main.js
git commit -m "feat: tela de cidade (hub) com locais clicáveis"
```

---

## Task 9: Callback de fim de batalha em `controladorBatalha.js` (TDD)

**Files:**
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.test.js`

**Interfaces:**
- Produces: `iniciarBatalha(container, jogador, inimigoOriginal, { onFim } = {})` — `onFim(fim, estado)` é chamado (se fornecido) sempre que uma rodada termina a batalha (`fim` é `'vitoria'`, `'derrota'` ou `'fuga'`) — usado pela Task 11 (`main.js`) para acionar level-up, auto-save e retorno à cidade.

Extensão retrocompatível: chamadas existentes de `iniciarBatalha(container, jogador, inimigo)` sem o quarto argumento continuam funcionando (Fase 1 não é alterada em comportamento).

- [ ] **Step 1: Substituir o mock do módulo `@engine/combate/index.js` no topo de `WebRPG/src/telas/batalha/controladorBatalha.test.js`**

O mock atual sempre retorna `fim: null`, o que impede testar `onFim`. Trocar por uma versão que devolve `fim: "vitoria"`:

```js
vi.mock("@engine/combate/index.js", () => ({
  criarEstadoBatalha: (jogador, inimigo) => ({ jogador, inimigo, rodada: 0 }),
  executarAcaoJogador: (estado) => ({
    estado: {
      ...estado,
      jogador: { ...estado.jogador, hp: 93 },
      inimigo: { ...estado.inimigo, hp: 0 },
    },
    eventos: [
      { tipo: "dano", autor: "jogador", alvo: "inimigo", valor: 30, critico: false },
      { tipo: "morte", alvo: "inimigo" },
      { tipo: "vitoria", xpGanho: 15, ouroGanho: 20 },
    ],
    fim: "vitoria",
  }),
}));
```

Como os 3 testes existentes de `iniciarBatalha` (Fase 1) não checam o valor de `fim`, essa troca de mock não quebra nenhum deles — apenas habilita testar `onFim` nesta task.

- [ ] **Step 2: Adicionar os testes de `onFim` ao final do arquivo**

```js
describe("iniciarBatalha com onFim", () => {
  it("chama onFim('vitoria', estado) quando a batalha termina em vitória", async () => {
    const onFim = vi.fn();
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo, { onFim });

    await elementos.executarAcao("atacar");

    expect(onFim).toHaveBeenCalledOnce();
    expect(onFim).toHaveBeenCalledWith("vitoria", expect.objectContaining({ fim: "vitoria" }));
  });

  it("não quebra quando onFim não é fornecido", async () => {
    const container = document.createElement("div");
    const { jogador, inimigo } = criarFixtures();
    const elementos = iniciarBatalha(container, jogador, inimigo);

    await expect(elementos.executarAcao("atacar")).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 3: Rodar e confirmar falha**

Run: `npm run test -- controladorBatalha`
Expected: FAIL — `onFim` nunca é chamado (a implementação atual não aceita nem invoca essa opção); os 3 testes antigos continuam passando (a troca do mock não afeta o que eles verificam).

- [ ] **Step 4: Implementar a mudança em `WebRPG/src/telas/batalha/controladorBatalha.js`**

Alterar a assinatura de `iniciarBatalha` e o corpo de `executar`:

```js
export function iniciarBatalha(container, jogador, inimigoOriginal, { onFim } = {}) {
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
    } else if (onFim) {
      onFim(resultado.fim, estado);
    }
  }

  elementos.botaoAtacar.addEventListener("click", () => executar("atacar"));
  elementos.botaoFugir.addEventListener("click", () => executar("fugir"));

  return { ...elementos, executarAcao: executar };
}
```

(Apenas a assinatura da função e o bloco `if (!resultado.fim) {...} else if (onFim) {...}` mudam; o resto do arquivo permanece idêntico ao da Fase 1.)

- [ ] **Step 5: Rodar e confirmar sucesso**

Run: `npm run test -- controladorBatalha`
Expected: PASS — 5 testes verdes (3 antigos + 2 novos).

- [ ] **Step 6: Commit**

```bash
git add WebRPG/src/telas/batalha/controladorBatalha.js WebRPG/src/telas/batalha/controladorBatalha.test.js
git commit -m "feat: callback onFim em iniciarBatalha para reagir a vitória/derrota/fuga"
```

---

## Task 10: Inimigo de treino para o botão Explorar — `engine/geradores/inimigoTreino.js` (TDD)

**Files:**
- Create: `engine/geradores/inimigoTreino.js`
- Test: `engine/geradores/inimigoTreino.test.js`

**Interfaces:**
- Produces: `criarInimigoTreino() -> inimigo` (sempre um Orc fixo, mesmo shape usado pela Fase 1) — usado pela Task 11 (`main.js`, botão "Explorar" da cidade).

Esta função existe só para a cidade ter algo jogável nesta fase sem depender do sistema de missões real (Fase 3). Ela não porta nenhuma lógica do console — é um placeholder documentado (ver "Fora de escopo").

- [ ] **Step 1: Escrever o teste `engine/geradores/inimigoTreino.test.js`**

```js
import { describe, it, expect } from "vitest";
import { criarInimigoTreino } from "./inimigoTreino.js";

describe("criarInimigoTreino", () => {
  it("retorna um Orc com o shape esperado pelo engine de combate", () => {
    const inimigo = criarInimigoTreino();
    expect(inimigo).toEqual({
      nome: "Orc",
      atk: 9,
      defesa: 3,
      hp: 40,
      hpMax: 40,
      xp: 18,
      ouro: 15,
      habilidade: "envenenamento",
      status: [],
    });
  });

  it("retorna uma nova instância a cada chamada (sem estado compartilhado)", () => {
    const a = criarInimigoTreino();
    const b = criarInimigoTreino();
    a.hp = 0;
    expect(b.hp).toBe(40);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- inimigoTreino`
Expected: FAIL — `Cannot find module './inimigoTreino.js'`.

- [ ] **Step 3: Implementar `engine/geradores/inimigoTreino.js`**

```js
export function criarInimigoTreino() {
  return {
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
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- inimigoTreino`
Expected: PASS — 2 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add engine/geradores/inimigoTreino.js engine/geradores/inimigoTreino.test.js
git commit -m "feat: gerador de inimigo de treino para o botão Explorar da cidade"
```

---

## Task 11: Bootstrap final — `main.js` (criação → cidade → batalha → save → reload) (TDD + verificação manual)

**Files:**
- Modify: `WebRPG/src/main.js`
- Test: `WebRPG/src/main.test.js`

**Interfaces:**
- Consumes: `montarTelaCriacao` (Task 7), `montarTelaCidade` (Task 8), `iniciarBatalha` com `onFim` (Task 9), `criarInimigoTreino` (Task 10), `checarLevelUp` (Task 4), `salvarNoNavegador`, `carregarDoNavegador`, `existeSaveNoNavegador` (Task 6).
- Produces: `bootstrap(container)` — decide entre carregar o save existente ou mostrar a tela de criação, e liga toda a navegação `criação → cidade → batalha → cidade`. Exportada para ser testável (o teste de integração chama `bootstrap` duas vezes sobre o mesmo `localStorage` para simular "recarregar a página").

- [ ] **Step 1: Escrever o teste de integração `WebRPG/src/main.test.js`**

```js
import { describe, it, expect, beforeEach } from "vitest";
import { bootstrap } from "./main.js";

beforeEach(() => {
  localStorage.clear();
});

describe("bootstrap", () => {
  it("mostra a tela de criação quando não há save", () => {
    const container = document.createElement("div");
    bootstrap(container);
    expect(container.querySelector(".tela-criacao")).not.toBeNull();
  });

  it("cria personagem, salva, e mostra a cidade", () => {
    const container = document.createElement("div");
    bootstrap(container);

    container.querySelector('[data-raca="Humano"]').click();
    container.querySelector('[data-classe="Paladino"]').click();
    const campoNome = container.querySelector("#campo-nome");
    campoNome.value = "Arthas";
    campoNome.dispatchEvent(new Event("input"));
    container.querySelector("#botao-confirmar").click();

    expect(container.querySelector(".tela-cidade")).not.toBeNull();
    expect(container.querySelector(".cabecalho-cidade").textContent).toContain("Arthas");
    expect(localStorage.getItem("webrpg_save")).not.toBeNull();
  });

  it('simula um "reload" (segunda chamada de bootstrap) continuando do save existente', () => {
    const primeiroContainer = document.createElement("div");
    bootstrap(primeiroContainer);
    primeiroContainer.querySelector('[data-raca="Elfo"]').click();
    primeiroContainer.querySelector('[data-classe="Xamã"]').click();
    const campoNome = primeiroContainer.querySelector("#campo-nome");
    campoNome.value = "Aelindra";
    campoNome.dispatchEvent(new Event("input"));
    primeiroContainer.querySelector("#botao-confirmar").click();

    // "Recarregar a página": novo container, bootstrap chamado de novo, mesmo localStorage
    const segundoContainer = document.createElement("div");
    bootstrap(segundoContainer);

    expect(segundoContainer.querySelector(".tela-cidade")).not.toBeNull();
    expect(segundoContainer.querySelector(".cabecalho-cidade").textContent).toContain("Aelindra");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test -- main.test`
Expected: FAIL — `bootstrap is not a function` (ainda não exportado por `main.js`).

- [ ] **Step 3: Reescrever `WebRPG/src/main.js` inteiro**

```js
import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import "./estilos/batalha.css";
import "./estilos/criacao.css";
import "./estilos/cidade.css";
import { inicializarRoteador, registrarTela, mostrarTela } from "./rotas/roteador.js";
import { montarTelaCriacao } from "./telas/criacao/telaCriacao.js";
import { montarTelaCidade } from "./telas/cidade/telaCidade.js";
import { iniciarBatalha } from "./telas/batalha/controladorBatalha.js";
import { criarInimigoTreino } from "@engine/geradores/inimigoTreino.js";
import { checarLevelUp } from "@engine/personagem/experiencia.js";
import { salvarNoNavegador, carregarDoNavegador, existeSaveNoNavegador } from "./armazenamento/localStorage.js";

export function bootstrap(container) {
  inicializarRoteador(container);

  function irParaCidade(jogador) {
    registrarTela("cidade", (el) =>
      montarTelaCidade(el, {
        jogador,
        aoExplorar: () => irParaBatalhaDeTreino(jogador),
      })
    );
    mostrarTela("cidade");
  }

  function irParaBatalhaDeTreino(jogador) {
    registrarTela("batalha", (el) =>
      iniciarBatalha(el, jogador, criarInimigoTreino(), {
        onFim: (fim) => {
          if (fim === "vitoria") {
            checarLevelUp(jogador);
          }
          salvarNoNavegador(jogador);
          irParaCidade(jogador);
        },
      })
    );
    mostrarTela("batalha");
  }

  function iniciarCriacao() {
    registrarTela("criacao", (el) =>
      montarTelaCriacao(el, {
        aoConfirmar: (jogador) => {
          salvarNoNavegador(jogador);
          irParaCidade(jogador);
        },
      })
    );
    mostrarTela("criacao");
  }

  if (existeSaveNoNavegador()) {
    const { valido, jogador } = carregarDoNavegador();
    if (valido) {
      irParaCidade(jogador);
      return;
    }
  }
  iniciarCriacao();
}

const app = document.getElementById("app");
if (app) {
  bootstrap(app);
}
```

Nota: o `if (app)` no final evita que `bootstrap` rode automaticamente quando `main.js` é importado por um teste que só quer a função exportada (em `document.getElementById("app")` retorna `null` no jsdom de teste, já que o teste monta seu próprio `container` e chama `bootstrap` diretamente).

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm run test -- main.test`
Expected: PASS — 3 testes verdes.

- [ ] **Step 5: Rodar a suíte completa de testes**

Run: `npm run test`
Expected: PASS — todos os testes de `engine/**` e `WebRPG/src/**` verdes (Fase 0/1 + os desta fase).

- [ ] **Step 6: Verificação manual jogável (critério de pronto da Fase 2)**

Run: `npm run dev`

No navegador (com o `localStorage` do site limpo, ex. aba anônima):
1. A tela de criação carrega: escolher uma raça, uma classe, digitar um nome — o preview de HP/Ataque/Defesa atualiza a cada escolha, e "Começar Jornada" só habilita quando os três estão preenchidos.
2. Clicar em "Começar Jornada" leva à cidade, mostrando nome/nível/HP/ouro no cabeçalho e os botões de local (Guilda/Loja/Torre/Masmorra/Arena desabilitados com "Em breve").
3. Clicar em "Explorar" inicia uma batalha (Soldado vs Orc, mesma tela da Fase 1). Vencer ou perder volta para a cidade.
4. **Recarregar a página (F5).** A tela de criação não aparece de novo — o jogo carrega direto na cidade, com o mesmo personagem (nome, nível, HP atual, ouro).

- [ ] **Step 7: Commit**

```bash
git add WebRPG/src/main.js WebRPG/src/main.test.js
git commit -m "feat: bootstrap completo (criação → cidade → batalha → save → reload)"
```

---

## Resumo do que fica pronto ao final deste plano

- `npm run dev` abre a criação de personagem (raça + classe + nome, preview de atributos ao vivo), leva à cidade-hub, permite uma batalha de treino, salva automaticamente no `localStorage` após a batalha, e recarregar a página continua exatamente de onde parou — fechando o critério de pronto da Fase 2 da spec.
- `engine/personagem/` (raças, classes, criação, XP/level-up) e `engine/save/` (schema versionado) são módulos puros e 100% testados, prontos para serem consumidos pelas Fases 3 e 4.
- A cidade já lista todos os locais futuros (Guilda, Loja, Torre, Masmorra, Arena) como desabilitados — as Fases 3/4 só precisam trocar `disabled` por um handler real, sem redesenhar a tela.
- Exportar/importar save (`.json`) já está implementado em `WebRPG/src/armazenamento/localStorage.js`, mesmo que a UI de botão para isso ainda não esteja na cidade (pode ser adicionado na tela de Configurações, fora do escopo desta fase).
