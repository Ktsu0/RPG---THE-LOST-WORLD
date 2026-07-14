# WebRPG Fase 8 — Bestiário Completo & Conteúdo de Masmorra — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar as três dívidas de conteúdo documentadas explicitamente em `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md` seção 11.1 (achados #1-#3): mapear os 9 nomes de inimigo que ainda caem no sprite padrão "orc", portar os 7 templates de masmorra que a Fase 4 adiou de propósito (decisão documentada #4 daquele plano), e dar um ícone a cada item da loja/personagem (nunca implementado, nenhuma fase anterior prometeu e não entregou isso — é um gap novo, achado nesta revisão).

**Architecture:** Nenhuma camada nova. Task 1 estende o padrão já existente `spriteParaInimigo`/`MAPA_SPRITE_POR_NOME` (`WebRPG/src/telas/batalha/mapaSprites.js`, Fase 7). Task 2 só adiciona entradas a `templatesMasmorra` (`engine/masmorra/gerador.js`, Fase 4) — nenhuma mudança de forma de dado. Task 3 introduz um único arquivo novo e pequeno (`WebRPG/src/itens/iconePorSlot.js`), espelhando exatamente o mesmo padrão data-driven (`nome/slot → chave de asset, com fallback`) já usado duas vezes neste projeto (`spriteParaInimigo`, e implicitamente `obterClasseRaridade`).

**Tech Stack:** Mesmo stack das Fases 6-7 — Vite/vanilla JS, Vitest + jsdom, packs CC0 (Kenney.nl / itch.io).

## Global Constraints

- Nenhum hotlink — todo asset copiado para dentro de `WebRPG/assets/` e registrado em `WebRPG/assets/CREDITS.md`.
- `engine/masmorra/`'s `templatesMasmorra` shape (`{id, nome, tema, mobs, minibosses, boss: {nome, poder}, trapChance, secretChance}`) não muda — Task 2 só acrescenta itens ao array.
- Os 7 templates novos **reaproveitam nomes de inimigo já existentes no roster de 26** (Orc + 25) em vez de inventar novos personagens — nenhum arquétipo de sprite adicional é necessário além dos 5 baixados na Task 1. Isso é uma escolha deliberada: o gap documentado (Fase 4 decisão #4) é sobre *variedade de layout/tema de masmorra*, não sobre criar mais personagens.
- Rodar `npm test` (raiz do repo) depois de cada task.

---

### Task 1: Bestiário completo — mapear os 9 nomes restantes

**Files:**
- Create: `WebRPG/assets/personagens/<5 pastas novas>/` (idle.png, ataque.png, dano.png, morte.png cada, mesmo padrão de `WebRPG/assets/personagens/orc/`)
- Modify: `WebRPG/src/telas/batalha/mapaSprites.js`
- Modify: `WebRPG/src/telas/batalha/mapaSprites.test.js`
- Possibly modify: `WebRPG/src/telas/batalha/sprites.js` (só se a contagem de frames dos novos sprites divergir de `ANIMACOES`, mesmo critério da Fase 7 Task 2)
- Modify: `WebRPG/assets/CREDITS.md`

**Interfaces:**
- Consome: `MAPA_SPRITE_POR_NOME`/`spriteParaInimigo` (Fase 7, inalterado em forma).
- Produz: nada novo para outras tasks — só preenche as 9 chaves que hoje caem em `SPRITE_PADRAO`.

Os 9 nomes a cobrir (confirmados em `WebRPG/assets/CREDITS.md`, todos já usados de verdade em `engine/torre/bosses.js` ou `engine/masmorra/gerador.js`): **Guardião de Pedra, Sentinela de Ferro** (bosses da Torre, tema pedra/armadura pesada), **Mago Sombrio** (boss da Torre), **Lobo Alfa** (boss da Torre), **Hidra das Sombras, Dragão Negro** (bosses da Torre, tema réptil/dragão), **Salamandra de Fogo, Escorpião de Magma, Senhor das Chamas** (mobs/boss do template "Covil Vulcânico").

Agrupamento recomendado (5 arquétipos cobrem os 9 nomes — mesma lógica de reaproveitamento já usada na Fase 7: "todo esqueleto/morto-vivo compartilha um sprite"):

| Arquétipo (pasta) | Nomes cobertos |
|---|---|
| `golem-pedra` | Guardião de Pedra, Sentinela de Ferro |
| `mago` | Mago Sombrio |
| `lobo` | Lobo Alfa |
| `dragao` | Hidra das Sombras, Dragão Negro |
| `elemental-fogo` | Salamandra de Fogo, Escorpião de Magma, Senhor das Chamas |

- [ ] **Step 1: Escrever os testes que falham em `mapaSprites.test.js`**

Adicionar ao final do arquivo:

```js
it.each([
  ["Guardião de Pedra", "golem-pedra"],
  ["Sentinela de Ferro", "golem-pedra"],
  ["Mago Sombrio", "mago"],
  ["Lobo Alfa", "lobo"],
  ["Hidra das Sombras", "dragao"],
  ["Dragão Negro", "dragao"],
  ["Salamandra de Fogo", "elemental-fogo"],
  ["Escorpião de Magma", "elemental-fogo"],
  ["Senhor das Chamas", "elemental-fogo"],
])('mapeia "%s" para o sprite "%s"', (nome, pasta) => {
  expect(spriteParaInimigo(nome)).toBe(pasta);
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- mapaSprites`
Expected: FAIL — as 9 chamadas retornam `"orc"` (fallback), não o arquétipo esperado.

- [ ] **Step 3: Baixar os 5 arquétipos**

Buscar packs CC0/gratuitos com esses 5 arquétipos. Ordem de preferência (consistência de estilo com o que já está no repo):

1. Verificar primeiro se `WebRPG/assets/personagens/_pacote-luizmelo-base/` (já baixado na Fase 7) tem algum arquétipo ainda não usado (`find WebRPG/assets/personagens/_pacote-luizmelo-base -iname "*.png" | sort` e comparar com os 4 já extraídos: goblin, cogumelo, esqueleto, olho-voador). Se sobrar algo aproveitável, usar antes de baixar outro pack.
2. Para o que faltar, buscar no itch.io/Kenney por packs livres com os arquétipos exatos: golem/guerreiro de pedra, mago/feiticeiro sombrio, lobo, dragão, elemental de fogo. Autores como `zerie`, `luizmelo` e `bdragon1727` no itch.io têm packs CC0/gratuitos com esses arquétipos — confirmar a licença declarada na página antes de baixar (mesma exigência de todas as fases anteriores).
3. Extrair para `WebRPG/assets/personagens/_pacote-<nome-do-pack>/` e organizar em `WebRPG/assets/personagens/{golem-pedra,mago,lobo,dragao,elemental-fogo}/` com `idle.png`, `ataque.png`, `dano.png`, `morte.png` cada, mesma convenção de `orc/`.

Se um arquétipo genuinamente não existir em nenhum pack gratuito encontrado, **não travar a task por isso** — deixar aquele nome específico no fallback "orc" e documentar em `CREDITS.md` (mesmo tratamento já dado a nomes sem cobertura em fases anteriores). O critério de pronto desta fase (seção 11.2 da spec) já prevê essa possibilidade.

- [ ] **Step 4: Preencher `MAPA_SPRITE_POR_NOME`**

Em `WebRPG/src/telas/batalha/mapaSprites.js`, adicionar as 9 entradas (ajustar as chaves de pasta caso o Step 3 tenha usado nomes diferentes dos sugeridos):

```js
const MAPA_SPRITE_POR_NOME = {
  Orc: "orc",
  "Esqueleto Errante": "esqueleto", "Cavaleiro Caído": "esqueleto", "Lich Menor": "esqueleto",
  "Senhor dos Mortos": "esqueleto", "Cavaleiro Sombrio": "esqueleto", "Lorde do Caos": "esqueleto",
  "Zumbi Apodrecido": "goblin", "Imp Menor": "goblin", "Comandante Ígneo": "goblin",
  "Golem de Cristal": "cogumelo", "Golem Titânico": "cogumelo", "Guardião de Cristal": "cogumelo", "Elemental de Cristal": "cogumelo",
  "Aranha da Cripta": "olho-voador", "Aranha Venenosa": "olho-voador", "Morcego Gigante": "olho-voador",
  "Guardião de Pedra": "golem-pedra",
  "Sentinela de Ferro": "golem-pedra",
  "Mago Sombrio": "mago",
  "Lobo Alfa": "lobo",
  "Hidra das Sombras": "dragao",
  "Dragão Negro": "dragao",
  "Salamandra de Fogo": "elemental-fogo",
  "Escorpião de Magma": "elemental-fogo",
  "Senhor das Chamas": "elemental-fogo",
};
```

- [ ] **Step 5: Rodar e confirmar sucesso**

Run: `npm test -- mapaSprites`
Expected: PASS (todos os testes, incluindo os 9 novos).

- [ ] **Step 6: Ajustar contagem de frames se necessário**

Rodar `npm run dev`, entrar numa batalha de treino, depois abrir a Torre e a Masmorra e observar as animações dos novos sprites. Se algum arquétipo tiver contagem de frames diferente da convenção soldado/orc (idle:6/ataque:6/dano:4/morte:4), adicionar uma entrada em `EXCECOES_FRAMES_POR_PERSONAGEM` (`WebRPG/src/telas/batalha/sprites.js`), exatamente como já feito para `goblin`/`cogumelo`/`esqueleto`/`olho-voador` na Fase 7 — só mexer nisso se a animação visivelmente travar ou pular quadros, não preventivamente.

- [ ] **Step 7: Registrar em CREDITS.md**

Atualizar `WebRPG/assets/CREDITS.md`: mover a entrada de bestiário para refletir os arquétipos novos (pack, autor, URL, licença) e atualizar a lista de "nomes sem arquétipo correspondente" — idealmente vazia agora, ou menor se algum arquétipo não foi encontrado (Step 3).

- [ ] **Step 8: Rodar a suíte completa e commitar**

Run: `npm test`
Expected: todos os testes passam.

```bash
git add WebRPG/assets/personagens WebRPG/src/telas/batalha/mapaSprites.js WebRPG/src/telas/batalha/mapaSprites.test.js WebRPG/assets/CREDITS.md
git commit -m "feat: cobre os 9 nomes de inimigo restantes com sprite real (fim do fallback silencioso para orc)"
```

(Se o Step 6 mexeu em `sprites.js`, incluir esse arquivo no commit também.)

---

### Task 2: Os 7 templates de masmorra restantes

**Files:**
- Modify: `engine/masmorra/gerador.js`
- Modify: `engine/masmorra/gerador.test.js`

**Interfaces:**
- Consome: nada novo — `templatesMasmorra` já é consumido por `engine/masmorra/index.js` (Fase 4) e `WebRPG/src/telas/masmorra/telaMasmorra.js` (Fase 7) sem assumir um tamanho fixo de array.
- Produz: `templatesMasmorra` cresce de 3 para 10 entradas.

Os 7 novos temas cobrem os temas do `JogoRPG` original ainda não portados (`floresta`, `gelo`, `arcano`, `mina`, `pântano`, `templo`, `forja` — confirmados em `JogoRPG/masmorra/masmorra.js:56-215`; o tema `torre` do décimo template original não é portado aqui de propósito, para não conflitar conceitualmente com o modo Torre já existente). Mobs/minibosses/bosses reaproveitam o roster de 26 nomes já mapeado pela Task 1 — nenhum nome novo, nenhum sprite novo além dos 5 da Task 1.

- [ ] **Step 1: Escrever os testes que falham em `gerador.test.js`**

Atualizar a asserção de tamanho (procurar `toHaveLength(3)` no describe `templatesMasmorra` e trocar para `toHaveLength(10)`), e adicionar:

```js
it("tem os 10 ids esperados, sem duplicatas", () => {
  const ids = templatesMasmorra.map((t) => t.id);
  expect(ids).toHaveLength(10);
  expect(new Set(ids).size).toBe(10);
});

it("cada um dos 7 templates novos tem os mesmos campos dos 3 originais", () => {
  const idsNovos = [
    "floresta-amaldicoada", "caverna-congelada", "biblioteca-arcana",
    "mina-abandonada", "pantano-podre", "templo-das-sombras", "forja-elemental",
  ];
  for (const id of idsNovos) {
    const t = templatesMasmorra.find((tpl) => tpl.id === id);
    expect(t).toBeDefined();
    expect(t.mobs.length).toBeGreaterThan(0);
    expect(t.minibosses.length).toBeGreaterThan(0);
    expect(t.boss.nome).toBeTruthy();
  }
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- masmorra/gerador`
Expected: FAIL — os 7 ids novos não existem, e a contagem antiga (3) não bate com a nova asserção (10).

- [ ] **Step 3: Adicionar os 7 templates a `templatesMasmorra`**

Em `engine/masmorra/gerador.js`, acrescentar ao array `templatesMasmorra` (depois de `"covil-vulcanico"`):

```js
  {
    id: "floresta-amaldicoada",
    nome: "Floresta Amaldiçoada",
    tema: "floresta",
    mobs: ["Zumbi Apodrecido", "Aranha Venenosa", "Imp Menor"],
    minibosses: ["Cavaleiro Caído"],
    boss: { nome: "Lobo Alfa", poder: 1.3 },
    trapChance: 14,
    secretChance: 11,
  },
  {
    id: "caverna-congelada",
    nome: "Caverna Congelada",
    tema: "gelo",
    mobs: ["Morcego Gigante", "Golem de Cristal", "Esqueleto Errante"],
    minibosses: ["Guardião de Cristal"],
    boss: { nome: "Hidra das Sombras", poder: 1.4 },
    trapChance: 16,
    secretChance: 9,
  },
  {
    id: "biblioteca-arcana",
    nome: "Biblioteca Arcana",
    tema: "arcano",
    mobs: ["Esqueleto Errante", "Aranha da Cripta", "Imp Menor"],
    minibosses: ["Cavaleiro Sombrio"],
    boss: { nome: "Mago Sombrio", poder: 1.35 },
    trapChance: 10,
    secretChance: 14,
  },
  {
    id: "mina-abandonada",
    nome: "Mina Abandonada",
    tema: "mina",
    mobs: ["Golem de Cristal", "Escorpião de Magma", "Zumbi Apodrecido"],
    minibosses: ["Golem Titânico"],
    boss: { nome: "Guardião de Pedra", poder: 1.3 },
    trapChance: 17,
    secretChance: 8,
  },
  {
    id: "pantano-podre",
    nome: "Pântano Podre",
    tema: "pântano",
    mobs: ["Aranha Venenosa", "Zumbi Apodrecido", "Escorpião de Magma"],
    minibosses: ["Comandante Ígneo"],
    boss: { nome: "Senhor dos Mortos", poder: 1.45 },
    trapChance: 15,
    secretChance: 10,
  },
  {
    id: "templo-das-sombras",
    nome: "Templo das Sombras",
    tema: "templo",
    mobs: ["Esqueleto Errante", "Aranha da Cripta", "Morcego Gigante"],
    minibosses: ["Cavaleiro Caído"],
    boss: { nome: "Dragão Negro", poder: 1.5 },
    trapChance: 13,
    secretChance: 13,
  },
  {
    id: "forja-elemental",
    nome: "Forja Elemental",
    tema: "forja",
    mobs: ["Salamandra de Fogo", "Escorpião de Magma", "Imp Menor"],
    minibosses: ["Comandante Ígneo"],
    boss: { nome: "Lorde do Caos", poder: 1.6 },
    trapChance: 18,
    secretChance: 7,
  },
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- masmorra/gerador`
Expected: PASS.

- [ ] **Step 5: Rodar a suíte completa do engine**

Run: `npm test -- engine`
Expected: PASS — sem regressão em Fases 1-7 (nenhum teste existente depende do tamanho exato de `templatesMasmorra` além do que foi atualizado no Step 1).

- [ ] **Step 6: Verificar manualmente**

Run: `npm run dev`, entrar na Masmorra várias vezes (o template usado hoje é sempre `templatesMasmorra[0]` — ver nota abaixo) e confirmar que nada quebrou visualmente.

Nota: `WebRPG/src/telas/masmorra/telaMasmorra.js` hoje sempre chama `criarSessaoMasmorra(jogador, templatesMasmorra[0].id)` — os 7 templates novos existem no motor mas **não são selecionáveis pela UI ainda** (não há tela de escolha de masmorra). Isso é consistente com o escopo desta task (fechar a dívida de *dados*, não construir seletor de masmorra) — deixar como pendência explícita em vez de expandir escopo silenciosamente: uma futura fase de UI pode adicionar um seletor de tema de masmorra na cidade.

- [ ] **Step 7: Commit**

```bash
git add engine/masmorra/gerador.js engine/masmorra/gerador.test.js
git commit -m "feat: adiciona os 7 templates de masmorra restantes (dívida documentada desde a Fase 4)"
```

---

### Task 3: Ícones de item por slot

**Files:**
- Create: `WebRPG/src/itens/iconePorSlot.js`
- Create: `WebRPG/src/itens/iconePorSlot.test.js`
- Create: `WebRPG/assets/ui/icones/` (7 ícones: head, chest, hands, legs, feet, weapon, consumable)
- Modify: `WebRPG/src/telas/loja/telaLoja.js`
- Modify: `WebRPG/src/telas/loja/telaLoja.test.js`
- Modify: `WebRPG/src/telas/personagem/telaPersonagem.js`
- Modify: `WebRPG/src/telas/personagem/telaPersonagem.test.js`
- Modify: `WebRPG/src/estilos/loja.css`, `WebRPG/src/estilos/personagem.css`
- Modify: `WebRPG/assets/CREDITS.md`

**Interfaces:**
- Produz: `iconePorSlot(slot: string) → string` (uma chave de asset em `WebRPG/assets/ui/icones/`, ex. `"weapon"`), com fallback `"generico"` para um slot desconhecido. Mesma forma de `spriteParaInimigo` — data-driven, com fallback explícito, testável em isolamento.
- Consumido por `telaLoja.js` (lista de compra e venda) e `telaPersonagem.js` (lista de inventário equipável).

Achado nesta revisão (spec seção 11.1, achado #3): todo item hoje é só texto colorido por raridade — nenhum ícone em lugar nenhum da UI, apesar do design system (spec seção 4.1) prometer "painéis chunky, botões grandes, texto legível" e ícones consistentes. Os slots existentes no catálogo (`engine/itens/catalogo.js`) são só 7: `head, chest, hands, legs, feet, weapon, consumable` — poucos o bastante para não precisar de um ícone por item individual (42 combinações de conjunto × peça seria over-engineering para o ganho visual).

- [ ] **Step 1: Escrever o teste que falha em `iconePorSlot.test.js`**

```js
import { describe, it, expect } from "vitest";
import { iconePorSlot } from "./iconePorSlot.js";

describe("iconePorSlot", () => {
  it.each([
    ["head", "head"],
    ["chest", "chest"],
    ["hands", "hands"],
    ["legs", "legs"],
    ["feet", "feet"],
    ["weapon", "weapon"],
    ["consumable", "consumable"],
  ])('mapeia o slot "%s" para o ícone "%s"', (slot, icone) => {
    expect(iconePorSlot(slot)).toBe(icone);
  });

  it("retorna o ícone genérico para um slot desconhecido", () => {
    expect(iconePorSlot("slot-nunca-visto")).toBe("generico");
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- iconePorSlot`
Expected: FAIL — `Failed to resolve import "./iconePorSlot.js"`.

- [ ] **Step 3: Implementar `iconePorSlot.js`**

```js
const SLOTS_VALIDOS = new Set(["head", "chest", "hands", "legs", "feet", "weapon", "consumable"]);

export function iconePorSlot(slot) {
  return SLOTS_VALIDOS.has(slot) ? slot : "generico";
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npm test -- iconePorSlot`
Expected: PASS (8 testes).

- [ ] **Step 5: Baixar os ícones**

Buscar um pack de ícones de RPG em pixel art gratuito (Kenney tem um "Fantasy Icons Pack"/"RPG Icon Pack" em `https://kenney.nl/assets?q=icon` — confirmar o nome/URL exato na página antes de baixar, mesma disciplina de licença das fases anteriores). Extrair para `WebRPG/assets/ui/icones-pack/` e copiar/renomear 8 ícones (7 slots + 1 genérico) para `WebRPG/assets/ui/icones/{head,chest,hands,legs,feet,weapon,consumable,generico}.png`.

- [ ] **Step 6: Aplicar os ícones em `telaLoja.js`**

Em `WebRPG/src/telas/loja/telaLoja.js`, importar `iconePorSlot`:

```js
import { iconePorSlot } from "../../itens/iconePorSlot.js";
```

Em `renderizarAbaComprar`, adicionar o ícone antes do nome do item:

```js
    linha.innerHTML = `
      <span class="icone-item icone-item--${iconePorSlot(item.slot)}"></span>
      <span class="${classeRaridade}">${item.nome}</span>
      <span>${item.preco} ouro</span>
      <button class="botao" data-acao="comprar">Comprar</button>
    `;
```

- [ ] **Step 7: Aplicar os ícones em `telaPersonagem.js`**

Em `WebRPG/src/telas/personagem/telaPersonagem.js`, mesmo import, e em `renderizarInventario`:

```js
    linha.innerHTML = `
      <span class="icone-item icone-item--${iconePorSlot(item.slot)}"></span>
      <span class="${classeRaridade}">${item.nome}</span>
      ${diferencaHtml}
      <button class="botao" data-acao="equipar">Equipar</button>
    `;
```

- [ ] **Step 8: Adicionar o CSS**

Em `WebRPG/src/estilos/loja.css` e `WebRPG/src/estilos/personagem.css` (ou um novo `WebRPG/src/estilos/itens.css` importado por ambos, se preferível para não duplicar a regra):

```css
.icone-item {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-size: contain;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  vertical-align: middle;
  margin-right: 6px;
}

.icone-item--head { background-image: url("/assets/ui/icones/head.png"); }
.icone-item--chest { background-image: url("/assets/ui/icones/chest.png"); }
.icone-item--hands { background-image: url("/assets/ui/icones/hands.png"); }
.icone-item--legs { background-image: url("/assets/ui/icones/legs.png"); }
.icone-item--feet { background-image: url("/assets/ui/icones/feet.png"); }
.icone-item--weapon { background-image: url("/assets/ui/icones/weapon.png"); }
.icone-item--consumable { background-image: url("/assets/ui/icones/consumable.png"); }
.icone-item--generico { background-image: url("/assets/ui/icones/generico.png"); }
```

- [ ] **Step 9: Testes de regressão em `telaLoja.test.js`/`telaPersonagem.test.js`**

Adicionar a cada arquivo um teste checando que a linha do item tem o elemento `.icone-item`:

```js
it("mostra um ícone para cada item da lista", () => {
  // ...montar a tela como os outros testes do arquivo já fazem...
  const icone = container.querySelector(".item-loja .icone-item"); // ou .item-inventario, em telaPersonagem
  expect(icone).not.toBeNull();
});
```

- [ ] **Step 10: Verificar manualmente**

Run: `npm run dev`, abrir a Loja (aba Comprar e Vender) e a tela de Personagem.
Expected: cada linha de item mostra um ícone pequeno antes do nome, condizente com o slot (arma vs. peça de armadura vs. poção).

- [ ] **Step 11: Registrar em CREDITS.md e rodar a suíte completa**

Adicionar a entrada do pack de ícones em `WebRPG/assets/CREDITS.md` (nome, autor, URL, licença).

Run: `npm test`
Expected: todos os testes passam.

- [ ] **Step 12: Commit**

```bash
git add WebRPG/src/itens WebRPG/assets/ui/icones* WebRPG/src/telas/loja WebRPG/src/telas/personagem WebRPG/src/estilos WebRPG/assets/CREDITS.md
git commit -m "feat: icones de item por slot na loja e na tela de personagem (nenhum item tinha icone ate agora)"
```

---

### Task 4: Playtest checklist de fim de fase

**Files:** nenhum (verificação manual, mesmo padrão de "UI: checklist manual por fase" da spec seção 8).

- [ ] Rodar `npm run dev`, limpar `localStorage`, criar um personagem.
- [ ] Entrar na Torre e avançar andares até encontrar cada um dos 6 bosses antes mapeados como "orc" (Guardião de Pedra, Sentinela de Ferro, Mago Sombrio, Lobo Alfa, Hidra das Sombras, Dragão Negro) — cada um mostra seu próprio sprite (Task 1), não mais o Orc.
- [ ] Entrar na Masmorra e confirmar que os mobs/boss do template ativo (Salamandra de Fogo, Escorpião de Magma, Senhor das Chamas, se calhar o template "Covil Vulcânico") mostram seus sprites reais em batalha.
- [ ] `npm test -- masmorra/gerador` mostra 10 templates.
- [ ] Loja (abas Comprar e Vender) e tela de Personagem mostram um ícone por item.
- [ ] Console do navegador sem 404s em `/assets/...` e sem erros não tratados, do Título até a Masmorra.
- [ ] `npm test` (suíte completa) e `npm run build` passam.
- [ ] Atualizar `docs/superpowers/docs.md`: marcar a linha da Fase 8 como ✅ Concluída.
- [ ] **Reportar o resultado.** Se algum item da lista falhar, anotar exatamente qual e por quê — não corrigir silenciosamente fora da task responsável por aquela área.

---

## Self-Review

**Cobertura da spec** (seção 11.1/11.2, achados #1-#3):
- 9 nomes de inimigo restantes → Task 1. ✅ (com a ressalva documentada no Step 3 de que um arquétipo genuinamente ausente em packs gratuitos pode continuar em CREDITS.md, mesmo tratamento de fases anteriores).
- 7 templates de masmorra restantes → Task 2. ✅ (com a ressalva documentada no Step 6 de que a UI ainda não tem seletor de tema — dívida de UI separada, não expandida silenciosamente para dentro desta task).
- Ícones de item → Task 3. ✅

**Consistência de tipo/assinatura:** `iconePorSlot(slot) → string` (Task 3) segue exatamente o mesmo contrato de `spriteParaInimigo(nome) → string` (Fase 7): entrada string, saída string, fallback explícito, zero side-effect, testável sem DOM.

**Placeholder scan:** nenhum placeholder tipo `<caminho-real-...>` nesta versão do plano além dos nomes de pack a confirmar nas Tasks 1 e 3 (que dependem de pesquisa em tempo de execução, mesmo padrão da Fase 7 Task 2).

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-11-webrpg-fase8-bestiario-completo.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
