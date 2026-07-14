# WebRPG Fase 14 — Mundo Vivo, Ferreiro & Castelo Final — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar a distância entre o jogo de hoje e a visão descrita pelo usuário em 2026-07-14 ("RPG estilo Rucoy Online"): dificuldade crescente conforme o jogador se afasta da cidade no mundo aberto (construído nesta mesma sessão, fora da spec original — ver `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`), um Ferreiro de verdade (tela própria de craft/upgrade de artefatos a partir de drops + coleta + recompensa de missão), masmorras secretas descobertas por mapas raros, relíquias lendárias com efeito passivo no mundo, e um final de jogo com Castelo + resgate da princesa.

**Pré-requisito — execute antes ou em paralelo:** as Fases 12 e 13 já estão **escritas e prontas**, só não foram executadas (`docs/superpowers/docs.md` marca as duas como "❌ Planejada"). Elas fecham metade do pedido do usuário sem nenhum design novo:
- **Fase 12** ([plano](./2026-07-14-webrpg-fase12-amuleto-talisma-torre.md)): craftar/equipar Amuleto Supremo e Talismã da Torre, a Torre passa a exigir e consumir o Talismã, vitória final ao vencer o 10º boss, level up visível (inclusive na masmorra).
- **Fase 13** ([plano](./2026-07-14-webrpg-fase13-loot-masmorra-heroi.md)): salas de armadilha/tesouro/segredo da masmorra funcionais, combate passa a dropar item (bônus de classe Arqueiro/Assassino finalmente funcionam), sprite do herói em **batalha** varia por classe (hoje só a criação de personagem e o mundo aberto — Fase "mundo vivo" desta sessão — respeitam a classe; a tela de batalha ainda hardcoda `"soldado"`), Néctar da Vida Eterna e relíquias de masmorra.

Esta Fase 14 **não duplica** o que 12/13 já cobrem — é o que sobra depois delas.

**Decisão assumida (sinalizar se estiver errada):** o pedido do usuário descreve um "Castelo" com 10 monstros e resgate da princesa. O motor já tem uma **Torre** com exatamente 10 bosses únicos (`engine/torre/bosses.js`), e a Fase 12 já vai fazer o Talismã abrir essa Torre. Este plano assume que **Castelo = a Torre já existente, só reapresentada/re-temada** (nome, textos, tela) — não um segundo sistema de 10 chefes duplicado do zero. Se a intenção era um lugar **separado** da Torre, isso muda a Task 5 inteira e precisa de decisão antes de implementar.

**Tech Stack:** Mesmo stack — Vite/vanilla JS, engine puro + Vitest, telas com Phaser onde há mapa andável (mundo aberto e cidade, construídos nesta sessão) e DOM/CSS onde é só UI de menu (loja, guilda, personagem, ferreiro).

## Global Constraints

- Rodar `npm test` (raiz do repo) depois de cada task.
- Nenhuma migração de save: todo campo novo no jogador precisa de fallback (`jogador.mapasSecretos ?? []`, etc.) para saves antigos continuarem válidos.
- Reaproveitar padrões já estabelecidos em vez de inventar camada nova: sistema de item/inventário (`engine/itens/`), sistema de missão/recompensa por raridade (`engine/missoes/`), gerador de masmorra por template (`engine/masmorra/gerador.js`), e o par `faseCidade.js`/`faseExploracao.js` + `jogadorMundo.js` (Phaser) para qualquer novo mapa andável.

---

### Task 1: Monstros mais fortes quanto mais longe da cidade

**Files:**
- Modify: `WebRPG/src/mundo/faseExploracao.js`
- Modify: `engine/mundo/monstrosSelvagens.js`
- Modify: `engine/mundo/monstrosSelvagens.test.js`

**Interfaces:**
- `criarInimigoSelvagem(id, nivelJogador, distancia = 0)` — `distancia` (0 a 1, normalizada) soma um multiplicador extra à escala já existente (ex.: até +80% em hp/atk na borda do mapa).
- `faseExploracao.js` calcula a distância euclidiana do monstro até o ponto de entrada (cidade) ao spawnar e passa esse valor para `aoEncontrarMonstro`.

**Notas:** hoje o mapa de exploração é uma única tela fixa (22×16 tiles); "mais longe" pode ser a distância dentro dessa tela por enquanto — não é pré-requisito ter múltiplas telas de mundo para esta task fazer sentido, só não é o "mundo infinito" do Rucoy ainda (ver Task de follow-up "mundo maior/por regiões", fora deste plano se o usuário quiser depois).

---

### Task 2: Ferreiro — forjar e melhorar artefatos

**Files:**
- Create: `engine/itens/ferreiro.js`, `engine/itens/ferreiro.test.js`
- Create: `WebRPG/src/telas/ferreiro/telaFerreiro.js`, `.test.js`
- Create: `WebRPG/src/estilos/ferreiro.css`
- Modify: `WebRPG/src/mundo/faseCidade.js` (novo hotspot `ferreiro`)
- Modify: `engine/mundo/mapas/cidade.js` (nova célula no traçado + legenda)
- Modify: `WebRPG/src/main.js` (rota `aoAbrirFerreiro`)

**Interfaces:**
- `listarReceitas()` — catálogo de artefatos craftáveis (materiais exigidos: drops de monstro + itens coletados no mapa + recompensas de missão já existentes, reaproveitando os mesmos nomes de item já usados por Amuleto/Talismã e pelas relíquias da Fase 13 — não inventar um pool de material novo).
- `podeForjar(inventario, receita)`, `forjar(jogador, receita)` — consome material, adiciona artefato com bônus de status ao inventário/equipamento.
- `podeMelhorar(artefato, materiais)`, `melhorar(jogador, artefato)` — upgrade incremental (ex.: +1/+2/+3) de um artefato já forjado, custo crescente.

**UI:** tela nova (padrão idêntico à Loja: lista + preview de atributo antes/depois), acessível por um prédio novo na cidade (mesmo esquema visual de `desenharPredio` já usado por `faseCidade.js`).

---

### Task 3: Masmorras secretas descobertas por mapa

**Files:**
- Create: `engine/mundo/mapasSecretos.js`, `.test.js`
- Modify: `engine/combate/recompensas.js` (chance muito rara de dropar `"Mapa de Masmorra Secreta"`, depende da Fase 13 já ter o drop de combate funcionando — ver pré-requisito)
- Modify: `engine/missoes/catalogo.js` ou `engine/missoes/index.js` (chance de recompensa incluir um mapa)
- Modify: `WebRPG/src/mundo/faseExploracao.js` (se `jogador.mapasSecretos` tiver um mapa não usado, marca um ponto fixo no mundo aberto com um marcador visual; pisar nele consome o mapa e abre uma masmorra gerada com o template do mapa)
- Modify: `WebRPG/src/telas/masmorra/telaMasmorra.js` (aceitar entrar por "masmorra secreta" além do fluxo normal por seletor de tema)

**Interfaces:**
- `sortearDropMapa(raridadeFonte)` — chance muito baixa (ex.: 2% em combate normal, maior em boss/miniboss e em recompensa de missão lendária).
- `gerarMasmorraSecreta(mapa)` — reaproveita `engine/masmorra/gerador.js` com um template temático marcado como "secreto" (pode ser um dos 10 já existentes, sorteado, ou um novo template dedicado — decisão de conteúdo, não de arquitetura).

---

### Task 4: Relíquias lendárias com efeito passivo no mundo

**Depende da Fase 13** ter portado as relíquias como itens de inventário reais (ela já entrega o Fragmento do Sol Caído revelando a grade da masmorra). Esta task completa os efeitos que a Fase 13 deliberadamente adiou, focando nos três que o usuário pediu explicitamente:

**Files:**
- Modify: `engine/itens/reliquias.js` (criado na Fase 13) ou `engine/personagem/criarPersonagem.js`
- Modify: `WebRPG/src/telas/batalha/controladorBatalha.js` (revive automático 1x e cura por turno, se o jogador tiver a relíquia equipada/no inventário)
- Modify: `WebRPG/src/mundo/faseExploracao.js` (relíquia que revela portas de masmorra secreta andando pelo mapa — mostra o marcador da Task 3 mesmo sem ainda ter usado o mapa, ou revela mapas escondidos com mais frequência)

**Interfaces:**
- `temRelíquiaRevive(jogador)` / consumida ao ressuscitar 1 vez por jornada (não recarrega sozinha — precisa forjar/achar outra, ou recarrega ao subir de nível — decisão de balanceamento a confirmar com o usuário antes de implementar).
- `curaPorTurno(jogador)` chamado no início de cada turno do jogador em `controladorBatalha.js`, condicional à posse da relíquia.

---

### Task 5: Castelo Final — Talismã abre o portão, 10 monstros, resgate da princesa

**Depende inteiramente da Fase 12** (Talismã craftável, gate de posse, consumo ao entrar). Esta task é reaproveitamento de conteúdo, não motor novo, sob a decisão assumida no topo deste plano (Castelo = Torre re-temada).

**Files:**
- Modify: `WebRPG/src/telas/torre/telaTorre.js` (textos: "Torre" → "Castelo", boss final NPC = resgate da princesa)
- Modify: `engine/torre/bosses.js` (garantir que os 10 bosses têm habilidade única cada — já é o caso hoje, conferir na Fase 8/13 se sprites cobrem todos)
- Modify: `WebRPG/src/telas/torre/telaTorre.js` (tela de vitória final: mensagem de resgate da princesa + troféu, já parcialmente coberta pela Fase 12 como "Cálice da Vitória" — só trocar o texto/flavor, não a mecânica)

**Se a decisão assumida estiver errada** (usuário queria um Castelo **separado** da Torre): esta task vira "construir um segundo sistema de 10 chefes do zero" — mesmo tamanho da Fase 4 inteira (Torre original). Confirmar antes de puxar esse fio.

---

## Ordem sugerida

1. Fase 12 (já escrita) — desbloqueia o Talismã/Torre/vitória, pré-requisito de tudo que envolve final de jogo.
2. Fase 13 (já escrita) — desbloqueia loot de combate, sprite de herói em batalha, relíquias — pré-requisito das Tasks 3 e 4 aqui.
3. Task 1 (dificuldade por distância) — independente, pode rodar a qualquer momento.
4. Task 2 (Ferreiro) — independente, mas mais gratificante depois que há loot de combate (Fase 13) alimentando as receitas.
5. Task 3 (masmorra secreta) — depende de Fase 13 (drop de combate).
6. Task 4 (relíquias passivas) — depende de Fase 13 (relíquias existirem) e desta Task 3 (revelar masmorra secreta).
7. Task 5 (Castelo final) — depende de Fase 12 (Talismã/Torre) — última, é o "fechamento" da jornada.
