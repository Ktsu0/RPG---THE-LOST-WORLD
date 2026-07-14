# WebRPG Fase 12 — Amuleto, Talismã & Portão da Torre (o "zerar o jogo") — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar os achados #5, #6, #7 e #10 da spec seção 13.1 (`docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`) — o sistema de progressão de fim de jogo mais elaborado do motor está **100% implementado e 100% inacessível**. O **Amuleto Supremo** (item raro que dá +5% ataque/+10% HP máximo, craftável só se o jogador conseguir juntar 5 materiais que vêm de missões/exploração distintas) e o **Talismã da Torre** (a chave obrigatória para entrar na Torre dos bosses finais — no console ele é *consumido* ao entrar, "se desintegra, transformando-se na chave etérea que abre os portões") têm toda a lógica pronta em `engine/itens/amuletoTalisma.js`, mas nenhuma tela jamais chama essas funções. Pior: mesmo que o jogador craftasse o Talismã hoje, **nada no motor da Torre verifica sua posse** — a Torre está sempre aberta, e vencer o 10º boss (Lorde do Caos) não dá o "Cálice da Vitória" nem os 10000 de ouro de bônus que o console dá, nem mostra nenhuma celebração — o jogo não tem uma vitória final de verdade hoje. Esta fase entrega os dois itens funcionais de ponta a ponta: craftar → equipar → a Torre exigir e consumir o Talismã → vencer os 10 bosses → final de jogo de verdade.

**Architecture:** Nenhuma camada nova. Tasks 1-2 são só UI consumindo funções que já existem em `engine/itens/amuletoTalisma.js` (Fase 3) — a única mudança de motor é `craftarAmuleto` passar a marcar `jogador.amuletoCraftado = true` (hoje ele só consome os materiais, sem deixar rastro de que o craft aconteceu, o que impossibilitaria a UI saber quando mostrar "Craftar" vs. "Equipar"). Task 3 adiciona um gate a `engine/torre/index.js`, no mesmo padrão já usado pela Arena (`podeAcessarArena`, `engine/arena/index.js`, Fase 4). Task 4 corrige dois estados da Torre que hoje ficam quebrados/mudos (derrota e vitória final) — achado encontrado ao escrever este plano, não estava na spec. Task 5 centraliza a celebração de level up no adaptador de batalha compartilhado (`controladorBatalha.js`, usado por treino **e** masmorra), corrigindo de quebra um bug mais sério descoberto na pesquisa: **batalhas de masmorra nunca chamam `checarLevelUp` — o jogador pode nunca subir de nível só jogando masmorra.**

**Tech Stack:** Mesmo stack — Vite/vanilla JS, Vitest + jsdom. Nenhum asset novo obrigatório.

## Global Constraints

- `jogador.inventario` já mistura objetos de equipamento (`{nome, slot, ...}`) com strings soltas de material/item-chave (`"Fragmento Antigo"`, `"Talismã da Torre"`, os 5 materiais do amuleto) — padrão já estabelecido desde a Fase 3, não mudar.
- Nenhuma migração de save: todo campo novo (`jogador.amuletoCraftado`) precisa de fallback `?? false` em qualquer leitura, para saves antigos (sem o campo) continuarem válidos — mesmo padrão já usado para `jogador.itens ?? []` na Fase 10.
- `executarTurnoTorre`/`criarEstadoTorre`/`avancarAndar` (Fase 4) mudam de comportamento só onde este plano descreve explicitamente — o resto da mecânica de boss (defesa crescente, sopro de dragão, invocação de esqueletos etc.) não é tocado.
- Rodar `npm test` (raiz do repo) depois de cada task.

---

### Task 1: Amuleto Supremo — craftar e equipar

**Files:**
- Modify: `engine/itens/amuletoTalisma.js`
- Modify: `engine/itens/amuletoTalisma.test.js`
- Modify: `engine/personagem/criarPersonagem.js`
- Modify: `engine/personagem/criarPersonagem.test.js`
- Modify: `WebRPG/src/telas/personagem/telaPersonagem.js`
- Modify: `WebRPG/src/telas/personagem/telaPersonagem.test.js`
- Modify: `WebRPG/src/estilos/personagem.css`

**Interfaces:**
- Consumes: `REQUISITOS_AMULETO`, `podeCraftarAmuleto(inventario)`, `alternarAmuleto(jogador)` (existentes, inalterados).
- Produces: `craftarAmuleto(jogador)` passa a também setar `jogador.amuletoCraftado = true` (além de consumir os materiais, comportamento já existente). `criarPersonagem` inclui `amuletoCraftado: false` no shape inicial. A UI ganha um novo painel `.painel-amuleto` na tela de Personagem.

- [ ] **Step 1: Teste que falha em `amuletoTalisma.test.js`**

No describe `craftarAmuleto`, adicionar:

```js
  it("marca amuletoCraftado como true além de consumir os materiais", () => {
    const inventario = REQUISITOS_AMULETO.flatMap((r) => Array(r.quantidade).fill(r.nome));
    const jogador = { inventario, amuletoEquipado: false, amuletoCraftado: false };
    craftarAmuleto(jogador);
    expect(jogador.amuletoCraftado).toBe(true);
  });
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- amuletoTalisma`
Expected: FAIL — `amuletoCraftado` continua `false`.

- [ ] **Step 3: Implementar em `amuletoTalisma.js`**

Encontrar:

```js
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
```

Substituir por (só adiciona a última linha):

```js
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
  jogador.amuletoCraftado = true;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- amuletoTalisma`
Expected: PASS.

- [ ] **Step 5: Adicionar o campo a `criarPersonagem.js`**

Encontrar a linha `amuletoEquipado: false,` em `engine/personagem/criarPersonagem.js` e adicionar logo abaixo:

```js
    amuletoCraftado: false,
```

Adicionar ao teste correspondente em `criarPersonagem.test.js` (o teste que já verifica o shape completo do jogador criado) a asserção `expect(jogador.amuletoCraftado).toBe(false);`.

Run: `npm test -- criarPersonagem`
Expected: PASS.

- [ ] **Step 6: Teste que falha em `telaPersonagem.test.js`**

Adicionar ao `jogadorDeTeste()` os campos `itens: [], amuletoCraftado: false, amuletoEquipado: false` (o fixture atual não tem nenhum dos dois — conferir o shape exato antes de editar, já que outros testes do arquivo usam a mesma função). Adicionar:

```js
describe("painel do Amuleto Supremo", () => {
  function jogadorComMateriaisCompletos() {
    return {
      ...jogadorDeTeste(),
      inventario: [
        ...jogadorDeTeste().inventario,
        "Pena do Corvo Sombrio", "Pergaminho Arcano", "Essência da Noite",
        "Relíquia Brilhante", "Gema da Escuridão",
      ],
      amuletoCraftado: false, amuletoEquipado: false,
    };
  }

  it("mostra o progresso de cada material necessário", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    const texto = container.querySelector(".painel-amuleto").textContent;
    expect(texto).toContain("Pena do Corvo Sombrio");
    expect(texto).toContain("0/5");
  });

  it("habilita Craftar só quando todos os materiais estão completos", () => {
    const container = document.createElement("div");
    montarTelaPersonagem(container, { jogador: jogadorDeTeste(), aoSair: vi.fn() });
    expect(container.querySelector("#botao-craftar-amuleto").disabled).toBe(true);

    const container2 = document.createElement("div");
    montarTelaPersonagem(container2, { jogador: jogadorComMateriaisCompletos(), aoSair: vi.fn() });
    expect(container2.querySelector("#botao-craftar-amuleto").disabled).toBe(false);
  });

  it("craftar consome os materiais e troca o botão por Equipar/Desequipar", () => {
    const container = document.createElement("div");
    const jogador = jogadorComMateriaisCompletos();
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    container.querySelector("#botao-craftar-amuleto").click();
    expect(jogador.amuletoCraftado).toBe(true);
    expect(container.querySelector("#botao-alternar-amuleto")).not.toBeNull();
    expect(container.querySelector("#botao-craftar-amuleto")).toBeNull();
  });

  it("equipar aplica o bônus e desequipar reverte", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorComMateriaisCompletos(), amuletoCraftado: true };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    const botao = container.querySelector("#botao-alternar-amuleto");
    const ataqueAntes = jogador.ataque;
    botao.click();
    expect(jogador.amuletoEquipado).toBe(true);
    expect(jogador.ataque).toBeGreaterThan(ataqueAntes);
  });
});
```

- [ ] **Step 7: Rodar e confirmar falha**

Run: `npm test -- telaPersonagem`
Expected: FAIL — `.painel-amuleto` não existe.

- [ ] **Step 8: Implementar em `telaPersonagem.js`**

Adicionar o import:

```js
import { REQUISITOS_AMULETO, podeCraftarAmuleto, craftarAmuleto, alternarAmuleto } from "@engine/itens/amuletoTalisma.js";
```

Adicionar uma função de renderização (mesmo padrão de `renderizarAtributos`/`renderizarInventario` já existentes):

```js
function renderizarPainelAmuleto(container, jogador, atualizarTudo) {
  const painel = container.querySelector(".painel-amuleto");
  const progresso = REQUISITOS_AMULETO.map((req) => {
    const qtd = jogador.inventario.filter((item) => item === req.nome).length;
    return `<li>${req.nome}: ${qtd}/${req.quantidade}</li>`;
  }).join("");

  if (!jogador.amuletoCraftado) {
    const podeCraftar = podeCraftarAmuleto(jogador.inventario);
    painel.innerHTML = `
      <h3>Amuleto Supremo</h3>
      <p>+5% Ataque, +10% HP máximo quando equipado.</p>
      <ul>${progresso}</ul>
      <button class="botao" id="botao-craftar-amuleto" ${podeCraftar ? "" : "disabled"}>Craftar Amuleto</button>
    `;
    painel.querySelector("#botao-craftar-amuleto").addEventListener("click", () => {
      craftarAmuleto(jogador);
      atualizarTudo();
    });
  } else {
    painel.innerHTML = `
      <h3>Amuleto Supremo</h3>
      <p>Status: ${jogador.amuletoEquipado ? "Equipado" : "Guardado"}</p>
      <button class="botao" id="botao-alternar-amuleto">${jogador.amuletoEquipado ? "Desequipar" : "Equipar"}</button>
    `;
    painel.querySelector("#botao-alternar-amuleto").addEventListener("click", () => {
      alternarAmuleto(jogador);
      atualizarTudo();
    });
  }
}
```

No template de `montarTelaPersonagem`, adicionar `<div class="painel painel-amuleto"></div>` depois do `painel-atributos`, e chamar `renderizarPainelAmuleto(container, jogador, atualizarTudo)` dentro de `atualizarTudo()`.

- [ ] **Step 9: Rodar e confirmar sucesso**

Run: `npm test -- telaPersonagem`
Expected: PASS.

- [ ] **Step 10: CSS mínimo**

Em `WebRPG/src/estilos/personagem.css`, adicionar (mesmo padrão de lista/painel já usado no resto do arquivo — conferir classes existentes antes de duplicar regras):

```css
.painel-amuleto ul {
  list-style: none;
  padding: 0;
  font-size: 13px;
}
```

- [ ] **Step 11: Verificar manualmente**

Run: `npm run dev`. Ganhar as 5 missões que dropam os materiais do amuleto (Resgatar aldeão → Pena do Corvo Sombrio; Salvar sábio → Pergaminho Arcano; Proteger caravana → Essência da Noite; Roubar relíquias → Relíquia Brilhante; Recuperar espada amaldiçoada → Gema da Escuridão — todas já existem em `engine/missoes/catalogo.js`) e conferir na tela de Personagem: progresso atualiza, craftar habilita só com tudo completo, equipar/desequipar muda ataque/HP máximo visivelmente.

- [ ] **Step 12: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add engine/itens/amuletoTalisma.js engine/itens/amuletoTalisma.test.js engine/personagem/criarPersonagem.js engine/personagem/criarPersonagem.test.js WebRPG/src/telas/personagem WebRPG/src/estilos/personagem.css
git commit -m "feat: craftar e equipar o Amuleto Supremo (motor pronto desde a Fase 3, sem UI ate agora)"
```

---

### Task 2: Talismã da Torre — craftar

**Files:**
- Modify: `WebRPG/src/telas/personagem/telaPersonagem.js`
- Modify: `WebRPG/src/telas/personagem/telaPersonagem.test.js`

**Interfaces:**
- Consumes: `PRECO_TALISMA`, `podeCraftarTalisma(jogador)`, `craftarTalisma(jogador)` (existentes, inalterados — `craftarTalisma` já empurra a string `"Talismã da Torre"` para `jogador.inventario`, não precisa de campo novo).
- Produces: novo painel `.painel-talisma` na tela de Personagem.

- [ ] **Step 1: Teste que falha em `telaPersonagem.test.js`**

```js
describe("painel do Talismã da Torre", () => {
  it("mostra o progresso de fragmentos e ouro", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), inventario: [...jogadorDeTeste().inventario, "Fragmento Antigo", "Fragmento Antigo"], ouro: 500 };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    const texto = container.querySelector(".painel-talisma").textContent;
    expect(texto).toContain("2/10");
    expect(texto).toContain("500/2000");
  });

  it("craftar consome fragmentos e ouro, e some o botao (o item vai pro inventario)", () => {
    const container = document.createElement("div");
    const jogador = {
      ...jogadorDeTeste(),
      inventario: [...jogadorDeTeste().inventario, ...Array(10).fill("Fragmento Antigo")],
      ouro: 2000,
    };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    container.querySelector("#botao-craftar-talisma").click();
    expect(jogador.inventario.filter((i) => i === "Talismã da Torre")).toHaveLength(1);
    expect(jogador.ouro).toBe(0);
  });

  it("mostra que ja possui um talisma pronto, sem oferecer craftar de novo", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), inventario: [...jogadorDeTeste().inventario, "Talismã da Torre"] };
    montarTelaPersonagem(container, { jogador, aoSair: vi.fn() });
    expect(container.querySelector(".painel-talisma").textContent).toContain("pronto");
    expect(container.querySelector("#botao-craftar-talisma")).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- telaPersonagem`
Expected: FAIL — `.painel-talisma` não existe.

- [ ] **Step 3: Implementar**

Adicionar ao import já criado na Task 1:

```js
import {
  REQUISITOS_AMULETO, podeCraftarAmuleto, craftarAmuleto, alternarAmuleto,
  PRECO_TALISMA, podeCraftarTalisma, craftarTalisma,
} from "@engine/itens/amuletoTalisma.js";
```

Nova função de renderização:

```js
function renderizarPainelTalisma(container, jogador, atualizarTudo) {
  const painel = container.querySelector(".painel-talisma");
  const jaTemTalisma = jogador.inventario.includes("Talismã da Torre");
  const fragmentos = jogador.inventario.filter((i) => i === "Fragmento Antigo").length;

  if (jaTemTalisma) {
    painel.innerHTML = `<h3>Talismã da Torre</h3><p>Você tem um Talismã pronto para uso — leve-o à Torre.</p>`;
    return;
  }

  const podeCraftar = podeCraftarTalisma(jogador);
  painel.innerHTML = `
    <h3>Talismã da Torre</h3>
    <p>A chave que abre os portões da Torre dos bosses finais — é consumida ao entrar.</p>
    <ul>
      <li>Fragmento Antigo: ${fragmentos}/${PRECO_TALISMA.fragmentos}</li>
      <li>Ouro: ${jogador.ouro}/${PRECO_TALISMA.ouro}</li>
    </ul>
    <button class="botao" id="botao-craftar-talisma" ${podeCraftar ? "" : "disabled"}>Craftar Talismã</button>
  `;
  painel.querySelector("#botao-craftar-talisma").addEventListener("click", () => {
    craftarTalisma(jogador);
    atualizarTudo();
  });
}
```

No template, adicionar `<div class="painel painel-talisma"></div>` (ao lado de `.painel-amuleto`), e chamar `renderizarPainelTalisma(container, jogador, atualizarTudo)` dentro de `atualizarTudo()`.

- [ ] **Step 4: Rodar e confirmar sucesso, rodar a suíte completa**

Run: `npm test -- telaPersonagem && npm test`
Expected: PASS.

- [ ] **Step 5: Verificar manualmente e commitar**

Run: `npm run dev`. Farmar 10 Fragmento Antigo (missão "Desafio da Arena Amaldiçoada" da Guilda, ou a Arena) + 2000 ouro, craftar o Talismã na tela de Personagem.

```bash
git add WebRPG/src/telas/personagem
git commit -m "feat: craftar o Talisma da Torre na tela de Personagem"
```

---

### Task 3: Portão da Torre — exige e consome o Talismã

**Files:**
- Modify: `engine/torre/index.js`
- Modify: `engine/torre/index.test.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.test.js`
- Modify: `WebRPG/src/estilos/torre.css`

**Interfaces:**
- Produces: `podeAcessarTorre(jogador) → boolean` (`jogador.inventario.includes("Talismã da Torre")`), `consumirTalismaDaTorre(jogador)` (remove uma ocorrência do inventário) — mesmo padrão de `podeAcessarArena`/`NIVEL_MINIMO_ARENA` já usado pela Arena (`engine/arena/index.js`, Fase 4).

Fiel ao console (`JogoRPG/torre/entrarTorre.js:6-14`): sem o Talismã, a entrada é bloqueada com uma mensagem explicando como consegui-lo; com o Talismã, ele é consumido (removido do inventário) no momento da entrada — cada tentativa de Torre custa um Talismã, incentivando o jogador a se preparar antes.

**Atenção — fixture de teste desatualizada:** `telaTorre.test.js`'s `jogadorDeTeste()` já tem `inventario: [{ nome: "Talismã da Torre" }]`, mas como **objeto**, não como a **string** que `craftarTalisma` de fato produz (`jogador.inventario.push("Talismã da Torre")`, Task 2). Esse fixture precisa ser corrigido para `inventario: ["Talismã da Torre"]` neste task — senão os 4 testes existentes desse arquivo passam a falhar contra o gate novo, mesmo sem nenhuma mudança de comportamento real (só o fixture nunca bateu com o dado real).

- [ ] **Step 1: Teste que falha em `engine/torre/index.test.js`**

```js
describe("podeAcessarTorre e consumirTalismaDaTorre", () => {
  it("bloqueia sem o Talismã da Torre no inventário", () => {
    expect(podeAcessarTorre({ inventario: [] })).toBe(false);
  });

  it("libera com o Talismã da Torre no inventário", () => {
    expect(podeAcessarTorre({ inventario: ["Talismã da Torre"] })).toBe(true);
  });

  it("consumirTalismaDaTorre remove uma unidade do inventário", () => {
    const jogador = { inventario: ["Talismã da Torre", "Poção de Cura"] };
    consumirTalismaDaTorre(jogador);
    expect(jogador.inventario).toEqual(["Poção de Cura"]);
  });
});
```

(Adicionar `podeAcessarTorre, consumirTalismaDaTorre` ao import do topo do arquivo de teste.)

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- torre/index`
Expected: FAIL.

- [ ] **Step 3: Implementar em `engine/torre/index.js`**

Adicionar ao final do arquivo:

```js
export function podeAcessarTorre(jogador) {
  return jogador.inventario.includes("Talismã da Torre");
}

export function consumirTalismaDaTorre(jogador) {
  const indice = jogador.inventario.indexOf("Talismã da Torre");
  if (indice !== -1) jogador.inventario.splice(indice, 1);
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- torre/index`
Expected: PASS.

- [ ] **Step 5: Corrigir o fixture desatualizado em `telaTorre.test.js`**

Encontrar:

```js
    inventario: [{ nome: "Talismã da Torre" }],
```

Substituir por:

```js
    inventario: ["Talismã da Torre"],
```

- [ ] **Step 6: Escrever os testes novos em `telaTorre.test.js`**

```js
  it("bloqueia a entrada sem o Talisma da Torre, com mensagem explicativa", () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), inventario: [] };
    montarTelaTorre(container, { jogador, aoSair: vi.fn() });
    expect(container.textContent).toContain("Talismã da Torre");
    expect(container.querySelector(".acoes-torre")).toBeNull();
  });

  it("consome o Talisma da Torre ao entrar com sucesso", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    montarTelaTorre(container, { jogador, aoSair: vi.fn() });
    expect(jogador.inventario).not.toContain("Talismã da Torre");
  });
```

- [ ] **Step 7: Rodar e confirmar falha**

Run: `npm test -- telaTorre`
Expected: FAIL nos 2 testes novos (o gate ainda não existe); os 4 testes antigos devem voltar a passar já com o Step 5 aplicado (ainda sem o gate implementado, então passam por acidente — confirmar no Step 9 que continuam passando **depois** do gate também).

- [ ] **Step 8: Implementar o gate em `telaTorre.js`**

Adicionar o import:

```js
import { criarEstadoTorre, avancarAndar, executarTurnoTorre, podeAcessarTorre, consumirTalismaDaTorre } from "@engine/torre/index.js";
```

No início de `montarTelaTorre`, antes do `container.innerHTML` atual:

```js
export function montarTelaTorre(container, { jogador, aoSair }) {
  if (!podeAcessarTorre(jogador)) {
    container.innerHTML = `
      <div class="painel">
        <p>Você precisa do Talismã da Torre para entrar.</p>
        <p>Construa um na tela de Personagem: 10 Fragmento Antigo + 2000 ouro.</p>
        <button class="botao" id="botao-sair-torre-bloqueada">Voltar</button>
      </div>
    `;
    container.querySelector("#botao-sair-torre-bloqueada").addEventListener("click", () => aoSair());
    return { botaoSair: null };
  }

  consumirTalismaDaTorre(jogador);

  container.innerHTML = `
```

(o restante do template e da função continuam exatamente iguais — só a abertura da função ganha o gate acima.)

- [ ] **Step 9: Rodar e confirmar sucesso, incluindo os 4 testes antigos**

Run: `npm test -- telaTorre`
Expected: PASS (6 testes — os 4 antigos + os 2 novos).

- [ ] **Step 10: Verificar manualmente**

Run: `npm run dev`. Tentar entrar na Torre sem Talismã: bloqueado com a mensagem. Craftar o Talismã (Task 2) e entrar: funciona, e o inventário perde o Talismã (conferir na tela de Personagem depois de sair).

- [ ] **Step 11: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add engine/torre/index.js engine/torre/index.test.js WebRPG/src/telas/torre
git commit -m "feat: a Torre agora exige e consome o Talisma da Torre para entrar (fiel ao console - antes estava sempre aberta)"
```

---

### Task 4: A Torre trata derrota/fuga corretamente, e vencer o 10º boss é uma vitória de verdade

**Files:**
- Modify: `engine/torre/index.js`
- Modify: `engine/torre/index.test.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.test.js`
- Modify: `WebRPG/src/estilos/torre.css`

**Interfaces:**
- `executarTurnoTorre` (existente) passa a, no ramo `fim === "torre_completa"`, aplicar a recompensa final diretamente (`jogador.ouro += 10000`, `jogador.inventario.push("Cálice da Vitória")`) e emitir um evento `{tipo: "torre_completa", ouroBonus: 10000, item: "Cálice da Vitória"}` — mesma lógica do motor, não da UI (padrão do projeto: eventos descrevem o que já aconteceu).
- `telaTorre.js`'s `executar()` ganha tratamento explícito para `resultado.fim === "derrota"`, `"fuga"` e `"torre_completa"` — hoje só `"venceu_andar"` é tratado; os outros três deixam a tela num estado morto (botões continuam clicáveis sem boss válido, ou sem nenhuma indicação de que a tentativa acabou).

**Achado encontrado ao escrever este plano (não estava na spec):** `telaTorre.js`'s `executar()` só reage a `resultado.fim === "venceu_andar"`. Em **derrota** (`jogador.hp <= 0`) e **fuga bem-sucedida**, a função não faz nada além de logar a mensagem — os botões Atacar/Fugir continuam ativos, e clicar Atacar de novo tentaria acessar `boss.habilidades` de um boss potencialmente nulo (após derrota, o jogo trava numa tela sem saída clara). Em **vitória completa** (10º boss morto), `estado.bossAtual` vira `null` e a tela mostra um cabeçalho vazio sem nenhuma celebração nem devolução à cidade — o mesmo tipo de "beco sem saída silencioso" descrito no achado #10. Este task corrige os três.

- [ ] **Step 1: Teste que falha em `engine/torre/index.test.js`**

```js
  it("ao vencer o 10º boss, aplica o bonus final e emite o evento torre_completa", () => {
    let { estado } = avancarAndar(criarEstadoTorre(jogadorBase()));
    // Força o estado pro último andar (10º) e o boss quase morto
    estado = { ...estado, andar: 10 };
    estado.bossAtual.hp = 1;
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.5); // dano do jogador; block do boss nao dispara

    const resultado = executarTurnoTorre(estado, "atacar");

    expect(resultado.fim).toBe("torre_completa");
    expect(resultado.estado.jogador.ouro).toBeGreaterThanOrEqual(10000);
    expect(resultado.estado.jogador.inventario).toContain("Cálice da Vitória");
    expect(resultado.eventos.some((e) => e.tipo === "torre_completa")).toBe(true);
  });
```

(Ajustar o mock de `Math.random` conforme necessário para garantir que o golpe realmente abata o boss — mesma técnica já usada no teste equivalente da Fase 4, "vencer o boss cura 35%..." no mesmo arquivo; usar `jogadorBase()` com `inventario: []` incluso, já que o teste de recompensa não depende de itens prévios.)

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- torre/index`
Expected: FAIL — hoje `torre_completa` não aplica bônus nem emite evento próprio.

- [ ] **Step 3: Implementar em `engine/torre/index.js`**

Encontrar:

```js
    if (boss.hp <= 0) {
      eventos.push({ tipo: "morte", alvo: "boss" });
      jogador.hp = Math.min(jogador.hpMax, Math.floor(jogador.hp + jogador.hpMax * 0.35));
      jogador.xp += boss.xp;
      jogador.ouro += boss.ouro;
      const fim = estado.andar >= torreBosses.length ? "torre_completa" : "venceu_andar";
      return { estado: { jogador, andar: estado.andar, bossAtual: null }, eventos, fim };
    }
```

Substituir por:

```js
    if (boss.hp <= 0) {
      eventos.push({ tipo: "morte", alvo: "boss" });
      jogador.hp = Math.min(jogador.hpMax, Math.floor(jogador.hp + jogador.hpMax * 0.35));
      jogador.xp += boss.xp;
      jogador.ouro += boss.ouro;
      const fim = estado.andar >= torreBosses.length ? "torre_completa" : "venceu_andar";
      if (fim === "torre_completa") {
        const ouroBonus = 10000;
        jogador.ouro += ouroBonus;
        jogador.inventario.push("Cálice da Vitória");
        eventos.push({ tipo: "torre_completa", ouroBonus, item: "Cálice da Vitória" });
      }
      return { estado: { jogador, andar: estado.andar, bossAtual: null }, eventos, fim };
    }
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- torre/index`
Expected: PASS.

- [ ] **Step 5: Testes que falham em `telaTorre.test.js`**

```js
  it("derrota desabilita as acoes e mostra como voltar a cidade", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99); // boss sempre acerta
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), hp: 1, hpMax: 1 };
    const elementos = montarTelaTorre(container, { jogador, aoSair: vi.fn() });
    await elementos.executarAcao("atacar");
    expect(container.querySelector('[data-acao="atacar"]').disabled).toBe(true);
    expect(container.textContent).toContain("Derrotado");
  });

  it("vencer o 10º boss mostra a tela de vitoria final", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const container = document.createElement("div");
    const jogador = jogadorDeTeste();
    const elementos = montarTelaTorre(container, { jogador, aoSair: vi.fn() });
    // Simula estar no ultimo andar com o boss quase morto via mock de dano alto —
    // mais simples: chamar executarAcao repetidamente ate a torre_completa aparecer,
    // OU (preferivel, mais explicito) expor um ponto de entrada de teste que force o andar.
    // Ver nota abaixo.
    expect(container.querySelector(".overlay-fim-torre")).not.toBeNull(); // classe some ate acontecer; ajustar conforme a implementacao real do Step 6
  });
```

**Nota para o executor:** o segundo teste acima está esboçado — a forma mais simples de testar "vencer o 10º boss" sem reescrever toda a mecânica de dano é subir o nível do jogador/baixar o HP dos bosses artificialmente no fixture, ou (mais direto) testar unicamente via `engine/torre/index.test.js` (já feito no Step 1) e, na camada de UI, testar apenas que **quando `executarTurnoTorre` retorna `fim: "torre_completa"`, a função `executar()` de `telaTorre.js` mostra o overlay** — isolando com um pequeno helper de teste que monta o estado já no andar 10 (mesma técnica do Step 1) e injeta esse estado antes de chamar `elementos.executarAcao`. Ajustar o teste real para a forma mais simples que exercite esse caminho, mantendo a asserção de que `.overlay-fim-torre` aparece com o texto do Cálice da Vitória.

- [ ] **Step 6: Implementar em `telaTorre.js`**

Adicionar ao template (dentro de `.tela-torre`, ao final):

```html
<div class="overlay-fim-torre overlay-fim-torre--oculto"></div>
```

Adicionar após `atualizarCabecalho()`:

```js
  const overlayFimTorre = container.querySelector(".overlay-fim-torre");
  const acoesTorre = container.querySelector(".acoes-torre");

  function desabilitarAcoes() {
    for (const botao of acoesTorre.querySelectorAll("button")) botao.disabled = true;
  }

  function mostrarFimDeTentativa({ titulo, mensagem }) {
    desabilitarAcoes();
    overlayFimTorre.innerHTML = `
      <h2 class="texto-pixel">${titulo}</h2>
      <p>${mensagem}</p>
      <button class="botao botao--destaque" id="botao-voltar-cidade-torre">Voltar à Cidade</button>
    `;
    overlayFimTorre.classList.remove("overlay-fim-torre--oculto");
    container.querySelector("#botao-voltar-cidade-torre").addEventListener("click", () => aoSair());
  }
```

No corpo de `executar()`, encontrar:

```js
    if (resultado.fim === "venceu_andar") {
      ({ estado } = avancarAndar(estado));
      atualizarCabecalho();
    }
```

Substituir por:

```js
    if (resultado.fim === "venceu_andar") {
      ({ estado } = avancarAndar(estado));
      atualizarCabecalho();
    } else if (resultado.fim === "torre_completa") {
      const eventoFinal = resultado.eventos.find((e) => e.tipo === "torre_completa");
      mostrarFimDeTentativa({
        titulo: "Você derrotou o Lorde do Caos!",
        mensagem: `A maldição da Torre foi quebrada. Você recebe o Cálice da Vitória e +${eventoFinal.ouroBonus} de ouro!`,
      });
    } else if (resultado.fim === "derrota") {
      mostrarFimDeTentativa({ titulo: "Derrotado...", mensagem: "Você precisará de outro Talismã da Torre para tentar de novo." });
    } else if (resultado.fim === "fuga" && resultado.eventos.some((e) => e.tipo === "fuga" && e.sucesso)) {
      mostrarFimDeTentativa({ titulo: "Você fugiu da Torre", mensagem: "O Talismã já foi consumido — será preciso outro para tentar de novo." });
    }
```

- [ ] **Step 7: CSS mínimo**

Em `WebRPG/src/estilos/torre.css`, adicionar (mesmo padrão de `.overlay-fim` já usado em `batalha.css` — reaproveitar o visual, não reinventar):

```css
.overlay-fim-torre {
  position: absolute;
  inset: 0;
  background: rgba(20, 18, 26, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--espaco-md);
  text-align: center;
  z-index: 10;
}

.overlay-fim-torre--oculto {
  display: none;
}
```

(A `.tela-torre` precisa de `position: relative` para o overlay se posicionar corretamente — conferir se já existe essa regra antes de duplicar.)

- [ ] **Step 8: Rodar e confirmar sucesso**

Run: `npm test -- telaTorre`
Expected: PASS.

- [ ] **Step 9: Verificar manualmente**

Run: `npm run dev`. Forçar uma derrota (entrar na Torre com HP baixo) — confirmar que os botões desabilitam e "Voltar à Cidade" funciona. Se for viável navegar até o 10º boss numa sessão de teste manual (nível alto o bastante), confirmar a tela de vitória final com o Cálice da Vitória.

- [ ] **Step 10: Rodar a suíte completa e commitar**

Run: `npm test`

```bash
git add engine/torre/index.js engine/torre/index.test.js WebRPG/src/telas/torre WebRPG/src/estilos/torre.css
git commit -m "fix: Torre trata derrota/fuga corretamente (ficava travada) e vencer o 10o boss agora e uma vitoria de verdade (Calice da Vitoria + 10000 ouro, fiel ao console)"
```

---

### Task 5: Level up deixa de ser invisível — e passa a funcionar também na masmorra

**Files:**
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.js`
- Modify: `WebRPG/src/telas/batalha/telaBatalha.test.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.test.js`
- Modify: `WebRPG/src/main.js`
- Modify: `WebRPG/src/telas/guilda/telaGuilda.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.js`
- Modify: `WebRPG/src/telas/torre/telaTorre.test.js`

**Interfaces:**
- `mostrarOverlayFim(elementos, { tipo, xpGanho, ouroGanho, eventosLevelUp })` ganha o campo opcional `eventosLevelUp` (array de `{tipo: "level_up", nivel, hpMax}, já produzido por `checarLevelUp`, Fase 2) — quando não vazio, mostra uma linha extra "🎉 Nível X! HP máximo: Y".
- `iniciarBatalha` (`controladorBatalha.js`) passa a chamar `checarLevelUp(estado.jogador)` internamente ao vencer, e repassar o resultado pro overlay — **remove** a chamada duplicada que hoje só existe em `main.js`.

**Achado encontrado ao escrever este plano, mais sério que o registrado na spec (achado #6 falava só em "invisível"):** `checarLevelUp` só é chamado num único lugar do jogo inteiro — `WebRPG/src/main.js`, no fim de uma batalha de **treino**. Batalhas de **masmorra** (que também usam `iniciarBatalha`, Fase 7) nunca chamam `checarLevelUp` — o jogador pode terminar o jogo só explorando masmorras e **nunca subir de nível**. Missões da Guilda já calculam `eventosLevelUp` corretamente dentro do motor (`engine/missoes/index.js:75`, e a variante de 10 ondas em `telaGuilda.js`), mas a UI da Guilda também nunca exibe isso. A Torre nunca chama `checarLevelUp` em lugar nenhum. Este task move a chamada para o único ponto compartilhado por treino e masmorra (`iniciarBatalha`), corrigindo os dois de uma vez, e adiciona a chamada/exibição que faltava em Guilda e Torre.

- [ ] **Step 1: Teste que falha em `telaBatalha.test.js`**

```js
describe("mostrarOverlayFim com level up", () => {
  it("mostra uma linha extra quando eventosLevelUp não está vazio", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    mostrarOverlayFim(elementos, {
      tipo: "vitoria", xpGanho: 10, ouroGanho: 5,
      eventosLevelUp: [{ tipo: "level_up", nivel: 4, hpMax: 145 }],
    });
    expect(elementos.overlayFim.textContent).toContain("Nível 4");
    expect(elementos.overlayFim.textContent).toContain("145");
  });

  it("nao mostra nada extra quando eventosLevelUp esta vazio ou ausente", () => {
    const container = document.createElement("div");
    const elementos = montarTelaBatalha(container, {
      jogador: { nome: "Herói", hp: 80, hpMax: 100 },
      inimigo: { nome: "Orc", hp: 15, hpMax: 30 },
    });
    mostrarOverlayFim(elementos, { tipo: "vitoria", xpGanho: 10, ouroGanho: 5 });
    expect(elementos.overlayFim.textContent).not.toContain("Nível");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- telaBatalha`
Expected: FAIL.

- [ ] **Step 3: Implementar em `telaBatalha.js`**

Encontrar:

```js
export function mostrarOverlayFim(elementos, { tipo, xpGanho, ouroGanho }) {
  const titulo = tipo === "vitoria" ? "Vitória!" : "Derrota...";
  const detalhe = tipo === "vitoria" ? `+${xpGanho} XP, +${ouroGanho} ouro` : "Tente novamente.";
  elementos.overlayFim.innerHTML = `
    <h1 class="texto-pixel">${titulo}</h1>
    <p>${detalhe}</p>
  `;
  elementos.overlayFim.classList.remove("overlay-fim--oculto");
}
```

Substituir por:

```js
export function mostrarOverlayFim(elementos, { tipo, xpGanho, ouroGanho, eventosLevelUp = [] }) {
  const titulo = tipo === "vitoria" ? "Vitória!" : "Derrota...";
  const detalhe = tipo === "vitoria" ? `+${xpGanho} XP, +${ouroGanho} ouro` : "Tente novamente.";
  const ultimoLevelUp = eventosLevelUp[eventosLevelUp.length - 1];
  const linhaLevelUp = ultimoLevelUp
    ? `<p class="texto-level-up">🎉 Nível ${ultimoLevelUp.nivel}! HP máximo: ${ultimoLevelUp.hpMax}</p>`
    : "";
  elementos.overlayFim.innerHTML = `
    <h1 class="texto-pixel">${titulo}</h1>
    <p>${detalhe}</p>
    ${linhaLevelUp}
  `;
  elementos.overlayFim.classList.remove("overlay-fim--oculto");
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- telaBatalha`
Expected: PASS.

- [ ] **Step 5: Teste que falha em `controladorBatalha.test.js`**

Adicionar (verificando que `iniciarBatalha` chama `checarLevelUp` e não deixa a checagem para o chamador):

```js
  it("ao vencer com XP suficiente pra upar, o jogador sobe de nivel e o overlay mostra isso", async () => {
    const container = document.createElement("div");
    const jogador = { ...jogadorDeTeste(), nivel: 1, xp: 0, hp: 200, hpMax: 200, ataque: 999, defesa: 999 };
    const inimigo = { ...inimigoDeTeste(), hp: 1, xp: 9999, ouro: 10 };
    const elementos = iniciarBatalha(container, jogador, inimigo);
    await elementos.executarAcao("atacar");
    expect(jogador.nivel).toBeGreaterThan(1);
    expect(container.querySelector(".overlay-fim").textContent).toContain("Nível");
  });
```

(Conferir os nomes exatos dos fixtures `jogadorDeTeste`/`inimigoDeTeste` já usados no arquivo antes de reutilizar — ajustar campos conforme o shape real esperado por `criarEstadoBatalha`.)

- [ ] **Step 6: Rodar e confirmar falha**

Run: `npm test -- controladorBatalha`
Expected: FAIL — `iniciarBatalha` ainda não chama `checarLevelUp`.

- [ ] **Step 7: Implementar em `controladorBatalha.js`**

Adicionar o import:

```js
import { checarLevelUp } from "@engine/personagem/experiencia.js";
```

Encontrar:

```js
      if (resultado.fim === "vitoria" || resultado.fim === "derrota") {
        const eventoVitoria = resultado.eventos.find((e) => e.tipo === "vitoria");
        mostrarOverlayFim(elementos, {
          tipo: resultado.fim,
          xpGanho: eventoVitoria?.xpGanho,
          ouroGanho: eventoVitoria?.ouroGanho,
        });
```

Substituir por:

```js
      if (resultado.fim === "vitoria" || resultado.fim === "derrota") {
        const eventoVitoria = resultado.eventos.find((e) => e.tipo === "vitoria");
        const eventosLevelUp = resultado.fim === "vitoria" ? checarLevelUp(estado.jogador) : [];
        mostrarOverlayFim(elementos, {
          tipo: resultado.fim,
          xpGanho: eventoVitoria?.xpGanho,
          ouroGanho: eventoVitoria?.ouroGanho,
          eventosLevelUp,
        });
```

- [ ] **Step 8: Remover a chamada duplicada em `main.js`**

Encontrar em `irParaBatalhaDeTreino`:

```js
        onFim: (fim) => {
          if (fim === "vitoria") {
            checarLevelUp(jogador);
          }
          salvarNoNavegador(jogador);
          irParaCidade(jogador);
        },
```

Substituir por (a checagem já aconteceu dentro de `iniciarBatalha` agora):

```js
        onFim: (fim) => {
          salvarNoNavegador(jogador);
          irParaCidade(jogador);
        },
```

Remover o import agora não usado `import { checarLevelUp } from "@engine/personagem/experiencia.js";` de `main.js` **só se** nenhum outro trecho do arquivo o usa (conferir com `grep -n checarLevelUp WebRPG/src/main.js` antes de remover).

- [ ] **Step 9: Rodar e confirmar sucesso**

Run: `npm test -- controladorBatalha`
Expected: PASS. A masmorra (que já usa `iniciarBatalha` desde a Fase 7) ganha o level up de graça, sem editar `telaMasmorra.js`.

- [ ] **Step 10: Level up na Guilda**

Em `WebRPG/src/telas/guilda/telaGuilda.js`, `renderizarResultado` já recebe `resultado.eventosLevelUp` (produzido por `resolverResultadoMissao`, que já chama `checarLevelUp` internamente desde a Fase 2/3 — só nunca foi exibido). Encontrar:

```js
    painel.innerHTML = `
      <p>Missão completada com sucesso! +${resultado.xpGanho} XP, +${resultado.ouroGanho} ouro.</p>
      ${resultado.itemGanho ? `<p>Você obteve: ${resultado.itemGanho}</p>` : ""}
      ${resultado.pocaoGanha ? "<p>Você também encontrou uma Poção de Cura!</p>" : ""}
    `;
```

Substituir por:

```js
    const ultimoLevelUp = resultado.eventosLevelUp?.[resultado.eventosLevelUp.length - 1];
    painel.innerHTML = `
      <p>Missão completada com sucesso! +${resultado.xpGanho} XP, +${resultado.ouroGanho} ouro.</p>
      ${resultado.itemGanho ? `<p>Você obteve: ${resultado.itemGanho}</p>` : ""}
      ${resultado.pocaoGanha ? "<p>Você também encontrou uma Poção de Cura!</p>" : ""}
      ${ultimoLevelUp ? `<p>🎉 Nível ${ultimoLevelUp.nivel}! HP máximo: ${ultimoLevelUp.hpMax}</p>` : ""}
    `;
```

Em `resolverMissaoDeOndas` (a missão especial de 10 ondas, que monta seu próprio objeto de resultado à mão em vez de usar `resolverResultadoMissao`), adicionar a chamada que falta: importar `checarLevelUp` de `@engine/personagem/experiencia.js` e, depois de `jogador.xp += ...`/`jogador.ouro += ...`, chamar `const eventosLevelUp = checarLevelUp(jogador);` e incluir `eventosLevelUp` no objeto passado para `renderizarResultado`.

Adicionar um teste em `telaGuilda.test.js` cobrindo o caso "XP suficiente pra upar mostra a linha de level up" (conferir os fixtures/mocks já usados no arquivo para missões antes de escrever, já que `filtroMissao` depende de `Math.random`).

- [ ] **Step 11: Level up na Torre**

Em `telaTorre.js`, importar `checarLevelUp` de `@engine/personagem/experiencia.js`. No ramo de `"venceu_andar"` e `"torre_completa"` de `executar()` (Task 4), adicionar a chamada e (opcionalmente) incluir no log:

```js
    if (resultado.fim === "venceu_andar") {
      const eventosLevelUp = checarLevelUp(estado.jogador);
      for (const evento of eventosLevelUp) {
        const linha = document.createElement("p");
        linha.textContent = `🎉 Nível ${evento.nivel}! HP máximo: ${evento.hpMax}`;
        log.appendChild(linha);
      }
      ({ estado } = avancarAndar(estado));
      atualizarCabecalho();
    } else if (resultado.fim === "torre_completa") {
      checarLevelUp(estado.jogador);
      // ...resto do ramo da Task 4, sem mudança...
```

Adicionar um teste em `telaTorre.test.js` cobrindo "vencer um andar com XP suficiente sobe de nível e loga a mensagem".

- [ ] **Step 12: Rodar a suíte completa**

Run: `npm test`
Expected: PASS (o encontro da masmorra da Fase 7 e o combate de treino continuam passando sem edição de fixture — `eventosLevelUp` é opcional em `mostrarOverlayFim`).

- [ ] **Step 13: Verificar manualmente**

Run: `npm run dev`. Treino: vencer uma batalha com XP suficiente pra upar mostra a linha extra no overlay. Masmorra: vencer um encontro com XP suficiente também mostra (confirma a correção do bug). Guilda: completar uma missão com XP suficiente mostra a linha. Torre: vencer um andar com XP suficiente loga a mensagem.

- [ ] **Step 14: Commit**

```bash
git add WebRPG/src/telas/batalha WebRPG/src/main.js WebRPG/src/telas/guilda WebRPG/src/telas/torre
git commit -m "fix: level up deixa de ser invisivel em treino/guilda/torre, e passa a funcionar de verdade na masmorra (nunca tinha sido chamado la)"
```

---

### Task 6: Playtest checklist de fim de fase

**Files:**
- Modify: `docs/superpowers/docs.md`
- Modify: `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` (marcar os achados #5, #6, #7, #10 da seção 13 como resolvidos)

- [ ] Farmar os 5 materiais do Amuleto Supremo via missões da Guilda; craftar e equipar na tela de Personagem; conferir ataque/HP máximo subindo.
- [ ] Farmar 10 Fragmento Antigo (missão de 10 ondas da Guilda + Arena) e 2000 ouro; craftar o Talismã da Torre.
- [ ] Tentar entrar na Torre sem Talismã: bloqueado, com instrução clara. Craftar o Talismã e entrar: funciona, e o item é consumido.
- [ ] Forçar uma derrota na Torre: tela mostra "Derrotado" e devolve à cidade sem travar.
- [ ] Vencer uma batalha de treino, uma missão da Guilda, um encontro de masmorra e um andar da Torre, cada um com XP suficiente pra upar: todos mostram a celebração de level up.
- [ ] (Se viável no tempo de teste manual) alcançar e vencer o 10º boss da Torre: tela de vitória final com Cálice da Vitória e +10000 ouro.
- [ ] Console do navegador sem erros/404s no fluxo todo.
- [ ] `npm test` (suíte completa) e `npm run build` passam.
- [ ] Atualizar `docs/superpowers/docs.md`: adicionar a linha da Fase 12 como ✅ Concluída.
- [ ] Atualizar a spec (seção 13): marcar os achados #5, #6, #7, #10 como resolvidos por esta fase, seguindo o mesmo padrão de fechamento usado pelas seções 10-12 anteriores.
- [ ] **Reportar o resultado.** Se algum item da lista falhar, anotar exatamente qual e por quê.

---

## Self-Review

**Cobertura da spec** (seção 13.1, achados #5, #6, #7, #10):
- Amuleto Supremo craftável e equipável → Task 1. ✅
- Talismã da Torre craftável → Task 2. ✅
- Torre exige e consome o Talismã (achado #10, parte 1) → Task 3. ✅
- Vencer o 10º boss é uma vitória de verdade (achado #10, parte 2) + Torre não trava mais em derrota/fuga (achado novo, encontrado nesta pesquisa) → Task 4. ✅
- Level up visível (achado #6) — **escopo ampliado** ao descobrir que masmorra nunca upava e Guilda/Torre também nunca mostravam, não só "invisível" no treino → Task 5. ✅

**Consistência de assinatura:** `mostrarOverlayFim` ganha um campo opcional (`eventosLevelUp = []`) — retrocompatível com os únicos outros 2 call sites do projeto. `podeAcessarTorre`/`consumirTalismaDaTorre` seguem exatamente o mesmo formato de `podeAcessarArena` (Fase 4), mesma convenção do motor.

**Riscos conhecidos:** o teste de "vencer o 10º boss" na camada de UI (Task 4, Step 5) precisa de um ponto de entrada mais direto para forçar o estado no último andar — a nota deixada no plano orienta o executor a resolver isso com o mesmo tipo de fixture manipulado já usado em `engine/torre/index.test.js` (Fase 4). O Amuleto Supremo do console real exige 10 itens distintos (não 5) — este plano mantém a simplificação já existente no motor web (`REQUISITOS_AMULETO`, 5 materiais) por ser o que já está implementado e testado; expandir para os 10 itens originais é uma decisão de conteúdo separada, não reaberta aqui.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-14-webrpg-fase12-amuleto-talisma-torre.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
