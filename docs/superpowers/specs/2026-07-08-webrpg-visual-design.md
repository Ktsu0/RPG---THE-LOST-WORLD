# Especificação: WebRPG — Versão Visual do RPG "The Lost World"

**Data:** 2026-07-08 (revisado 2026-07-10 — ver seção 10)
**Status:** Fases 0-5 implementadas e concluídas (ver `docs/superpowers/docs.md`). Fase 6 (seção 10) aprovada e planejada, ainda não implementada.

## 1. Objetivo

Transformar o RPG de console (`JogoRPG/`, ~87 arquivos JS) em um jogo visual completo no navegador (`WebRPG/`), preservando toda a lógica de jogo existente (batalha, torre, masmorra, arena, missões, loja, itens, saves) e elevando a experiência visual e de usuário ao padrão de referência **Knights of Pen & Paper** (Behold Studios): palco em pixel art com sprites animados, interface robusta, legível e cheia de feedback.

O protótipo web atual (~1.240 linhas: `index.html`, `main.js`, `data.js`) serve de referência, mas pode ser reescrito/reestruturado livremente.

## 2. Decisões aprovadas

| Decisão | Escolha |
|---|---|
| Estilo visual | JRPG pixel art lateral (herói à esquerda, inimigo à direita) |
| Arquitetura | **Motor compartilhado**: lógica pura extraída para `engine/`, consumida pelo console E pelo web |
| Histórias de missão (IA/Gemini) | **Somente histórias pré-escritas** na versão web (sem IA, sem chave de API) |
| Tecnologia | **HTML/CSS/JS + Vite** (sem framework de jogo; DOM para UI, CSS para animação de sprites) |
| Masmorras | **Grade explorável com névoa de guerra** (renderiza a grade do `gerarMasmorra()` atual) |
| Estratégia de execução | **Fatia vertical**: batalha completa primeiro, depois os demais sistemas |
| Deploy | Site estático (compatível com GitHub Pages) |

## 3. Arquitetura

### 3.1 Motor compartilhado (`engine/`)

Nova pasta na raiz do repositório com **lógica pura**: zero `console.log`, zero `lerInput()`, zero DOM.

```
engine/
├── combate/      turnos, dano, crítico, esquiva, efeitos de status
│                 (veneno, sangramento, paralisia, teia, invulnerabilidade,
│                  regeneração, cura xamã, esqueletos, buff defesa, dano extra…)
├── personagem/   raças, classes, bônus, atributos, level up
├── itens/        equipamentos, efeitos, raridades, drops, sets/conjuntos,
│                 amuletos e talismãs
├── geradores/    masmorra em grade, inimigos, mini-boss, andares da torre,
│                 ondas da arena
├── economia/     loja, compra/venda, preços
├── historias/    banco de histórias pré-escritas por tipo de missão
├── save/         esquema JSON único e versionado
└── mundo/        (Fase 6, seção 10) grade de tiles caminháveis, posição do
                  jogador, colisão e gatilhos de hotspot — mesma lógica pura
                  reaproveitada pela cidade, torre e masmorra navegáveis
```

### 3.2 Padrão de comunicação: máquina de estados + eventos

O motor expõe ações (`batalha.acaoJogador('atacar')`) e devolve **listas de eventos** que descrevem o que aconteceu:

```js
[
  { tipo: 'dano', alvo: 'inimigo', valor: 23, critico: true },
  { tipo: 'status_aplicado', status: 'sangramento', alvo: 'inimigo' },
  { tipo: 'morte', alvo: 'inimigo' },
  { tipo: 'drop', item: 'Foice do Ceifador', raridade: 'lendario' }
]
```

- **Adaptador console** (`JogoRPG/`): converte eventos em texto colorido — o jogo de console continua funcionando durante e após a migração.
- **Adaptador web** (`WebRPG/`): converte eventos em animações e atualizações de UI, tocados em **fila sequencial** (nunca simultâneos), com timeout de segurança para a UI jamais travar.

### 3.3 Migração gradual

Extrai-se para o `engine/` apenas o sistema que a fase atual precisa (batalha primeiro). Nunca refatorar os 87 arquivos de uma vez. A cada extração, o console é adaptado para consumir o motor e revalidado.

## 4. Experiência do usuário

### 4.1 Princípios (padrão Knights of Pen & Paper)

1. **Palco pixel art + UI robusta**: sprites animados no cenário; painéis chunky, botões grandes, texto legível.
2. **Informação sempre visível**: HP/MP/ouro em todas as telas; na batalha, efeitos de status como ícones com tooltip explicativo (nome, efeito, turnos restantes).
3. **Feedback em tudo ("juice")**: números de dano voando, tremor de tela no crítico, flash ao ser atingido, piscar vermelho no veneno. Nenhuma ação sem resposta visual.
4. **Log de combate**: painel discreto e rolável narrando a luta (herança do console).
5. **Cores de raridade consistentes**: o mapeamento do `getRaridadeCor()` vira a paleta oficial (comum → lendário) usada identicamente em loja, inventário, drops e tooltips.
6. **Tipografia dupla**: fonte pixel (Press Start 2P) apenas em títulos e números de dano; fonte limpa (Google Fonts) no corpo de texto.

### 4.2 Mapa de telas

```
Título → Criação de Personagem (wizard: raça → classe → nome,
   │       preview do sprite animado e bônus em tempo real)
   ▼
CIDADE (mapa de tiles navegável, ver seção 10 — personagem anda pelo cenário
   │       e entra nos prédios em vez de escolher de uma lista de botões)
   ├── Guilda     → missões (ondas, mini-boss, histórias pré-escritas)
   ├── Loja       → armas, armaduras, sets com bônus visíveis, consumíveis
   ├── Torre      → andares progressivos, bosses, regra anti-grind
   ├── Masmorra   → grade explorável com névoa de guerra (mesmo renderer de tiles da cidade)
   ├── Arena      → arena infinita, bênçãos, fragmentos, loja da arena
   ├── Personagem → status, inventário, equipar (comparação ↑↓), amuletos/talismãs
   └── Config     → save/load, exportar/importar, volume
```

### 4.3 Tela de batalha

- Cenário de fundo **parallax por local** (floresta/missão, pedra escura/torre, cripta/masmorra).
- Herói à esquerda, inimigo à direita; animações **idle / ataque / dano / morte** via sprite sheets com CSS `steps()`.
- Barras de HP/MP com drenagem suave, nome + nível, fileira de ícones de status.
- Barra de ações: **Atacar · Habilidade · Item · Defender · Fugir** — botões grandes, ícone + custo de MP visível.
- Eventos do motor tocados em fila de animação sequencial.

### 4.4 Masmorra (grade explorável)

- A grade do `gerarMasmorra()` renderizada como salas conectadas.
- Jogador inicia na entrada e **clica em salas adjacentes** para explorar; salas ocultas sob névoa até alcançadas.
- Tipos de sala com ícones: inimigo, baú, memento, vazia (chance de evento), boss/saída.
- Sala de inimigo → transição para tela de batalha → retorno ao mapa ao vencer.

## 5. Plano de arte (todos os assets baixados localmente — proibido hotlink)

**Status:** esta seção descreve o plano original (2026-07-08). Nenhuma linha desta
tabela além de "Herói + Orc animados" foi de fato baixada e integrada — ver
diagnóstico na seção 10. A seção 10.2 detalha as ferramentas e o processo
concreto para fechar cada lacuna.

| Necessidade | Fonte | Custo | Status |
|---|---|---|---|
| Herói + Orc animados | Tiny RPG Character Asset Pack — Soldier & Orc (já no repo) | grátis | ✅ integrado |
| ~10 monstros animados | LuizMelo — Monsters Creatures Fantasy e packs irmãos (itch.io) | grátis | ❌ pendente (Fase 6c) |
| Tilesets de cenário (cidade, torre, masmorra, arena) | Kenney (kenney.nl) + itch.io, montados no **Tiled** | grátis | ❌ pendente (Fase 6b) |
| UI pixel (painéis, botões, molduras) | Kenney UI Pack + packs "Pixel UI" (itch.io) | grátis | ❌ pendente (Fase 6b) |
| Ícones de itens pixel (substituem Font Awesome) | packs de ícones RPG (itch.io / OpenGameArt) | grátis | ❌ pendente (Fase 6b) |
| Fontes | Press Start 2P + fonte de corpo (Google Fonts) | grátis | ❌ pendente — CSS referencia `"Press Start 2P"` mas nenhum arquivo de fonte existe no repo; cai silenciosamente para `monospace` do sistema |
| Sons (golpe, crítico, moeda, level up) | Kenney Audio + packs RPG itch.io | grátis | ❌ pendente (Fase 6d) — tocador já existe e é tolerante a assets ausentes |
| Retoques/ícones sem pack pronto | desenhados à mão no **Piskel** (piskelapp.com, roda no navegador) | grátis | conforme necessidade, Fase 6b/6c |

**Raça × classe (7×6 = 42 combos, inviável):** o sprite de batalha vem da **classe** (6 sprites); a identidade da **raça** aparece no retrato/moldura e nos bônus.

**Licenças:** conferir e registrar a licença de cada pack baixado (arquivo `WebRPG/assets/CREDITS.md` com autor, link e licença).

## 6. Fases de construção (cada fase termina jogável)

| Fase | Entrega | Critério de pronto | Status |
|---|---|---|---|
| **0 — Fundação** | Vite, estrutura `engine/`, design system CSS (paleta, raridades, tipografia, painéis, `image-rendering: pixelated`), roteador de telas, assets baixados e organizados | `npm run dev` abre o esqueleto navegável com o design system aplicado | ✅ concluída |
| **1 — Batalha** | Núcleo de combate extraído para `engine/combate/` com eventos; console adaptado e funcionando; tela de batalha completa (sprites, fila de animação, dano, tremor, barras, log) | Batalha Soldado vs Orc completa e bonita, com veneno/sangramento visualmente funcionais; console joga igual a antes | ✅ concluída (com bug de CSS, ver 10.1) |
| **2 — Identidade** | Wizard de criação com preview animado, cidade hub clicável, save/load localStorage + exportar/importar, auto-save | Criar personagem → cidade → batalha → recarregar página → continuar do save | ✅ concluída (mecânica) |
| **3 — Economia** | Missões da guilda (ondas, mini-boss, histórias), loja com sets, tela de personagem (equipar com comparação ↑↓, amuletos/talismãs) | Loop completo: missão → ouro → loja → equipar → ficar mais forte | ✅ concluída (mecânica) |
| **4 — Profundidade** | Torre (andares, bosses, anti-grind), masmorra em grade com névoa, arena infinita (bênçãos, fragmentos) | Os três modos jogáveis do início ao fim | ✅ concluída (mecânica) |
| **5 — Polimento** | Sons, música, transições, partículas, telas de vitória/derrota, responsividade mobile, onboarding, revisão final tela a tela | Cada tela revisada contra o padrão de referência; jogável no celular | ✅ concluída (sistemas existem, mas sem os arquivos de áudio reais — ver 10.1) |
| **6 — Arte de Verdade & Mapas Navegáveis** | Ver seção 10 para o plano completo: conserta o bug da barra de HP/MP, tela de Título, cenários e cidade/torre/masmorra em tiles navegáveis (Tiled), roster completo de monstros, UI pixel real, áudio de verdade | Cada critério de pronto do plano original (linha "1 — Batalha" acima, etc.) finalmente bate com o que a tela mostra, comparado lado a lado com a referência Knights of Pen & Paper | ❌ planejada, não implementada |

"Concluída (mecânica)" = a lógica de jogo e o fluxo funcionam de ponta a ponta, mas a tela ainda não tem os assets visuais que a seção 4 descreve — é exatamente o que a Fase 6 resolve.

## 7. Saves e tratamento de erros

- **Esquema JSON único e versionado** (`versao: 1`), compartilhado: console salva em arquivo (como hoje), web em `localStorage`.
- Exportar save = baixar `.json`; importar = selecionar/arrastar arquivo. Permite levar o save entre console e web.
- Save corrompido/inválido: o jogo **não trava** — oferece novo jogo ou importar backup.
- Auto-save após batalhas e compras (conforme MELHORIAS_TECNICAS.md).
- Fila de animações com timeout de segurança: erro inesperado nunca deixa a UI presa.

## 8. Testes

- **Vitest** sobre o `engine/` (lógica pura, sem mocks de console/DOM): fórmulas de dano/crítico/esquiva, cada efeito de status, drops por raridade, bônus de set, geração de masmorra (grade sempre tem caminho válido até o boss).
- Os testes do motor são a **rede de segurança da refatoração**: passar no motor = console e web corretos.
- UI: checklist manual por fase (fluxo criar → cidade → batalha → loot → save → recarregar → continuar).

## 9. Fora de escopo (por decisão)

- Geração de histórias por IA na versão web (fica exclusiva do console, que já a possui).
- Backend/servidor de qualquer tipo — o site é 100% estático.
- **Framework de jogo (Phaser/PixiJS/Godot)** — reconfirmado em 2026-07-10 (ver seção 10.1): as 6 fases já estão construídas sobre Vite/DOM puro, com `engine/` testado. A Fase 6 adiciona um **renderer de tiles próprio e pequeno** (leitura de export do Tiled, não o motor Tiled em si) dentro dessa mesma arquitetura, não uma migração de motor.
- Sprites únicos por combinação raça×classe.
- Multiplayer, ranking online, conquistas.

## 10. Revisão 2026-07-10 — diagnóstico visual e Fase 6 "Arte de Verdade & Mapas Navegáveis"

Sessão que rodou o jogo de fato (`npm run dev` + screenshots) para comparar com
esta spec. Confirmação: **as fases 0-5 cumprem a lógica de jogo, mas nenhuma
delas cumpre o padrão visual desta spec (seção 4)** porque o plano de arte
(seção 5, versão original) nunca foi executado — só o pack Soldado/Orc foi
baixado. O resultado joga certo e parece um formulário.

### 10.1 Achados concretos

| # | Achado | Onde | Tipo |
|---|---|---|---|
| 1 | `.barra` (HP/MP) não tem `width`; dentro de `.painel-status` (`flex-column`, `align-items: center`) ela encolhe a ~1px — a barra está lá, atualiza certo, mas é invisível | `WebRPG/src/estilos/paineis.css:38` | Bug de CSS, correção de 1 linha |
| 2 | `--fonte-pixel: "Press Start 2P"` nunca foi baixada nem tem `@font-face` — cai silenciosamente pra `monospace` do sistema | `WebRPG/src/estilos/variaveis.css:14` | Asset faltando |
| 3 | `assets/cenarios/` e `assets/ui/` vazias — nenhum cenário parallax, nenhuma peça de UI kit; o CSS/JS não referencia nenhum caminho dentro delas | `WebRPG/assets/` | Asset faltando |
| 4 | Só `assets/personagens/{soldado,orc}` existem — Torre/Masmorra/Arena não têm sprites próprios de monstro apesar do motor já suportar esses inimigos | `WebRPG/assets/personagens/` | Asset faltando |
| 5 | `assets/audio/` vazia — tocador de som/música existe e é "tolerante a assets ausentes" (decisão correta de engenharia), mas não toca nada hoje | `WebRPG/assets/audio/` | Asset faltando |
| 6 | Não existe tela de Título — o roteador só registra `criacao`, o jogo abre direto no formulário | `WebRPG/src/rotas/roteador.js` | Tela faltando |
| 7 | Cidade é uma lista de botões com emoji, não um lugar — nenhum cenário, nenhum senso de espaço | `WebRPG/src/telas/cidade/` | Gap de experiência, resolvido pelo mapa navegável (10.3) |

### 10.2 Ferramentas de produção de arte (gratuitas, sem servidor)

A pergunta não é "trocar de motor" — é **como produzir os assets** que faltam
pra alimentar o motor Vite/DOM que já existe. Divisão por tipo de asset:

| Tipo de asset | Ferramenta | Papel |
|---|---|---|
| Sprites de personagem/monstro | Packs prontos primeiro (LuizMelo, itch.io) — só desenhar do zero no **Piskel** (piskelapp.com) ou **Pixilart** (pixilart.com) se faltar algum bicho específico no pack | Ambos rodam 100% no navegador, exportam spritesheet/PNG direto |
| Cenários e mapas (cidade, andares da torre, salas da masmorra, arena) | **Tiled** (mapeditor.org) sobre tilesets do Kenney/itch.io | Tiled monta o mapa (chão, paredes, prédios) e exporta JSON; um renderer próprio e pequeno em `WebRPG/src` lê esse JSON e desenha os tiles com `<canvas>` ou DOM — sem adotar o motor Tiled/Godot/Phaser em runtime |
| UI (painéis, botões, molduras, ícones) | Kenney UI Pack pronto; recortes/ajustes finos no Piskel se necessário | Substitui as caixas CSS lisas atuais |
| Áudio | Kenney Audio + packs RPG do itch.io, prontos | Só copiar pra `assets/audio/` — o tocador já existe |
| Fonte pixel | Baixar "Press Start 2P" (Google Fonts, grátis) e servir localmente via `@font-face` (nunca hotlink) | Resolve o achado #2 |

**Licenciamento:** todo pack baixado — incluindo os montados no Tiled — continua
registrado em `WebRPG/assets/CREDITS.md` (autor, link, licença), como já
determinado na seção 5.

### 10.3 Cidade, torre e masmorra viram mapas navegáveis

Decisão (substitui a cidade "hub de botões" da seção 4.2 original): cidade,
andares da torre e salas da masmorra passam a ser **grades de tiles onde o
personagem anda de verdade** (WASD ou clique-para-andar, câmera segue),
usando o mesmo renderer de tiles e a mesma lógica pura em `engine/mundo/`
(seção 3.1): grade caminhável, posição do jogador, colisão contra paredes,
gatilho de hotspot ao pisar numa célula especial (porta da guilda, entrada
da loja, sala de inimigo etc). A masmorra já tinha grade + névoa de guerra
(seção 4.4 original); o que muda é que agora ela é desenhada com tiles de
verdade em vez de painel de salas abstratas, e a cidade/torre ganham o mesmo
tratamento pela primeira vez.

### 10.4 Fase 6, detalhada

| Etapa | Entrega | Depende de | Esforço |
|---|---|---|---|
| **6a — Correções rápidas** | Corrigir `.barra` (achado #1); baixar e servir a fonte pixel (achado #2); construir tela de Título com logo e menu Nova Jornada/Continuar (achado #6) | nada (só código + 1 download de fonte) | horas |
| **6b — Mundo em tiles** | `engine/mundo/` (grade, colisão, hotspots) + renderer de tiles em `WebRPG/src`; tilesets via Tiled/Kenney para cidade, torre e masmorra; UI kit real substituindo as caixas CSS | 6a (tela de título já define o padrão visual) | maior etapa da fase |
| **6c — Bestiário visual** | Sprites dos ~10 monstros (LuizMelo/itch.io) ligados a cada inimigo do catálogo em missões/torre/masmorra/arena | pode rodar em paralelo com 6b | 1 sessão |
| **6d — Áudio de verdade** | Baixar e copiar os arquivos de som/música já esperados pelo tocador existente | independente | 1 sessão |

**Critério de pronto da Fase 6:** jogar do Título até uma masmorra completa
sem ver nenhuma caixa CSS lisa, nenhuma barra invisível, nenhum texto em
fonte de sistema onde deveria ser pixel — e a cidade/torre/masmorra andáveis
em tiles, não clicáveis por lista.

## 11. Revisão 2026-07-11 — Fase 8 "Bestiário Completo & Conteúdo de Masmorra" e Fase 9 "Cenários Parallax & Áudio Definitivo"

Fases 6 e 7 (seção 10) foram implementadas e concluídas (ver `docs/superpowers/docs.md`).
Esta seção diagnostica o que ainda falta depois delas e define as próximas
duas fases — ambas fecham dívidas de conteúdo já **documentadas explicitamente**
em commits/CREDITS.md anteriores, não gaps novos.

**Atualização 2026-07-14:** Fases 8 e 9 foram implementadas e concluídas (ver `docs/superpowers/docs.md`). Achados #1-#3 (bestiário completo, templates de masmorra, ícones de item) fechados na Fase 8; achados #4-#5 (cenário de fundo por local, música ambiente de verdade + Torre/Masmorra com música própria) fechados na Fase 9. Única pendência residual: Hidra das Sombras e Dragão Negro seguem no fallback visual "orc" (achado #1) por falta de pack de dragão gratuito com licença clara — documentado em `WebRPG/assets/CREDITS.md`.

### 11.1 Achados

| # | Achado | Onde | Origem |
|---|---|---|---|
| 1 | 9 dos 25 nomes de inimigo do jogo (todos já usados como boss da Torre ou mob/boss de masmorra) ainda caem no sprite padrão "orc" por falta de arquétipo baixado: Guardião de Pedra, Sentinela de Ferro, Mago Sombrio, Lobo Alfa, Hidra das Sombras, Dragão Negro, Salamandra de Fogo, Escorpião de Magma, Senhor das Chamas | `WebRPG/src/telas/batalha/mapaSprites.js` | `WebRPG/assets/CREDITS.md`, listado desde a Fase 7 |
| 2 | Só 3 dos 10 templates de masmorra do `JogoRPG` original foram portados — decisão explícita da Fase 4 que adiou os 7 restantes para "uma iteração futura" | `engine/masmorra/gerador.js` | Fase 4, decisão documentada #4 |
| 3 | Itens da loja/personagem são só texto colorido por raridade — nenhum ícone, mesmo com o design system (seção 4.1) prometendo "UI robusta" em toda a experiência | `WebRPG/src/telas/loja/telaLoja.js`, `WebRPG/src/telas/personagem/` | Nunca antes diagnosticado — achado nesta revisão |
| 4 | Nenhum cenário de fundo por local de batalha — `.palco-batalha`/`.palco-torre` são gradiente/CSS lisos; a seção 4.3 pede explicitamente "cenário de fundo parallax por local (floresta/missão, pedra escura/torre, cripta/masmorra)" | `WebRPG/src/estilos/batalha.css`, `torre.css` | Seção 4.3, nunca implementado |
| 5 | Música ainda são jingles curtos de poucos segundos em loop, não faixas ambiente de verdade; Torre/Masmorra/Arena não tocam nenhuma música própria (só cidade/batalha) | `WebRPG/assets/audio/musica/`, `WebRPG/src/telas/torre|masmorra|arena/` | CREDITS.md, limitação conhecida da Fase 7 |

### 11.2 Fase 8 — Bestiário Completo & Conteúdo de Masmorra

| Etapa | Entrega | Depende de |
|---|---|---|
| 8a | Baixar ~5 arquétipos novos de sprite e mapear os 9 nomes restantes (achado #1) | nada |
| 8b | Adicionar os 7 templates de masmorra restantes (achado #2), reaproveitando arquétipos já mapeados sempre que possível | 8a (para os nomes novos que os templates introduzirem) |
| 8c | Ícones de item por slot (achado #3) — 7 ícones (`head/chest/hands/legs/feet/weapon/consumable`), mesmo padrão data-driven de `spriteParaInimigo` | nada, roda em paralelo com 8a/8b |

**Critério de pronto:** todo inimigo do jogo (Torre, Masmorra, treino) mostra um sprite condizente com seu nome — zero fallback silencioso para "orc" seria o ideal, mas arquétipos genuinamente ausentes no material gratuito disponível continuam documentados em CREDITS.md; a masmorra tem 10 templates jogáveis; todo item na loja/personagem mostra um ícone.

### 11.3 Fase 9 — Cenários Parallax & Áudio Definitivo

| Etapa | Entrega | Depende de |
|---|---|---|
| 9a | Cenário de fundo por local de batalha (achado #4): treino/floresta, masmorra/cripta, torre/pedra escura | nada |
| 9b | Música própria para Torre e Masmorra + faixas de cidade/batalha substituídas por loops mais longos (achado #5) | nada, roda em paralelo com 9a |
| 9c | Revisão visual final tela a tela contra a referência Knights of Pen & Paper (critério original da Fase 5, seção 6) | 9a/9b |

**Critério de pronto:** jogar do Título a uma masmorra e à Torre com cenário de fundo condizente com o local, som ambiente tocando em todo modo de jogo com conteúdo próprio, e nenhuma tela restante parecendo "um formulário" quando comparada à referência.

### 11.4 Fora de escopo (Fases 8-9)

- **Tela de batalha visual (sprites/palco) para Arena e Guilda** — ambas resolvem combate só em log de texto hoje; isso é uma mudança de UI maior que uma finalização de conteúdo/asset, e não estava listada em nenhum achado anterior. Fica como possível fase futura, não parte de 8/9.
- **Pathfinding/tile rendering para a Torre** — a Torre mantém sua UI própria de texto+sprite único (decisão já tomada na Fase 7, Task 4); não reaberta aqui.

## 12. Revisão 2026-07-11 — Fases finais: Fase 10 "Combate Completo & Masmorras Selecionáveis" e Fase 11 "Save Completo & Lançamento"

Última rodada de diagnóstico contra a spec inteira (seções 2, 4.1, 4.3 e 7), feita
lendo o código real. As Fases 10-11 fecham **tudo** que a spec ainda promete e o
jogo não entrega — depois delas, esta spec está concluída.

**Atualização 2026-07-14:** Fase 10 implementada e concluída (ver `docs/superpowers/docs.md`). Achados #1, #2, #3 e #6 fechados: barra de ações completa (Atacar · Item · Defender · Fugir), poção finalmente bebível com a dupla contabilidade unificada (verificado end-to-end: poção ganha em missão da guilda aparece corretamente na contagem do botão de item na batalha seguinte), ícones de status com tooltip, e os 10 templates de masmorra selecionáveis. Achados #4-#5 (Fase 11) seguem pendentes.

### 12.1 Achados

| # | Achado | Onde | Origem na spec |
|---|---|---|---|
| 1 | A barra de ações da batalha só tem **Atacar · Fugir** — a spec pede "Atacar · Habilidade · Item · Defender · Fugir". Não existe ação de defender nem de usar item no motor de turno (`executarRodada` só reconhece `"fugir"` vs. atacar) | `WebRPG/src/telas/batalha/telaBatalha.js:22-23`, `engine/combate/turno.js:69` | Seção 4.3 |
| 2 | A **Poção de Cura é comprável mas inutilizável**: a loja vende (vai para `jogador.inventario` como objeto), missões premiam (vai para `jogador.itens` como string), a penalidade de fuga da masmorra rouba (`"pocao"`) — mas **nenhum código em lugar nenhum permite beber uma**. Bônus do achado: existem duas contabilidades de poção incompatíveis (string em `itens` vs. objeto em `inventario`) | `engine/itens/catalogo.js:50`, `engine/missoes/index.js:70-71`, `engine/masmorra/index.js:41` | Seção 4.3 ("Item") |
| 3 | **Nenhum ícone de status com tooltip** — veneno/sangramento/paralisia/invulnerável só aparecem como texto no log; a spec pede "fileira de ícones com tooltip explicativo (nome, efeito, turnos restantes)" | `WebRPG/src/telas/batalha/` (nenhuma `.icones-status` existe) | Seção 4.1, princípio #2 |
| 4 | **Importar save não tem UI**: `importarSave()` existe em `localStorage.js` mas nenhuma tela chama; Configurações só tem "Exportar Save". Save corrompido no "Continuar" cai silenciosamente na criação, sem avisar nem oferecer importar backup | `WebRPG/src/armazenamento/localStorage.js:31`, `WebRPG/src/telas/configuracao/telaConfiguracoes.js`, `WebRPG/src/main.js:123-129` | Seção 7 |
| 5 | **Deploy GitHub Pages nunca foi configurado**: sem workflow (`.github/workflows/` não existe), sem `base` no `vite.config.js`, e todos os caminhos de asset são absolutos (`/assets/...`) em JS e CSS — quebram sob o subcaminho `https://<user>.github.io/<repo>/`. Suspeita adicional a confirmar na fase: `vite.config.js` não define `publicDir`, então o build de produção pode nem estar copiando `WebRPG/assets/` para `dist/` | `vite.config.js`, `WebRPG/src/audio/*.js`, `WebRPG/src/telas/batalha/sprites.js:31`, `WebRPG/src/estilos/*.css` | Seção 2 ("Deploy: site estático compatível com GitHub Pages") |
| 6 | Os **10 templates de masmorra não são selecionáveis** — a UI sempre usa `templatesMasmorra[0]` (pendência anotada explicitamente na Fase 8, Task 2) | `WebRPG/src/telas/masmorra/telaMasmorra.js` | Seção 4.4 + Fase 8 |

### 12.2 Correções de spec (documentadas, não bugs)

1. **MP não existe e não vai existir.** A spec (seções 4.1/4.3) menciona barras e custo de MP, mas nem o console (`JogoRPG/`) nem o motor jamais tiveram um campo de mana — as habilidades de classe deste jogo são **passivas por chance** (esquiva do Arqueiro, bloqueio do Paladino, cura do Xamã, fúria do Bárbaro...), não magias ativas com custo. Corrigir a spec é mais honesto que inventar um sistema de MP que o jogo original nunca teve. Toda menção a MP fica lida como "HP" daqui em diante.
2. **O botão "Habilidade" da seção 4.3 não se aplica** — pela mesma razão: as habilidades disparam sozinhas. A barra de ações final é **Atacar · Item · Defender · Fugir** (4 botões). A habilidade passiva da classe fica visível no painel de status do combatente (Fase 10, junto dos ícones de status), cumprindo o espírito de "informação sempre visível" sem inventar mecânica nova.

### 12.3 Fase 10 — Combate Completo & Masmorras Selecionáveis

| Etapa | Entrega | Depende de |
|---|---|---|
| 10a | Motor: ação `defender` (achado #1) e ação `usar_pocao` + API única de poção resolvendo a dupla contabilidade (achado #2) | nada |
| 10b | UI: barra de ações vira Atacar · Item (N) · Defender · Fugir; fileira de ícones de status com tooltip (achado #3) | 10a |
| 10c | Seletor de masmorra: escolher entre os 10 templates ao entrar (achado #6) | nada, paralelo a 10a/10b |

**Critério de pronto:** uma batalha usa as 4 ações com efeito visível; poção comprada na loja ou ganha em missão é bebida em batalha e a contagem bate; todo status ativo aparece como ícone com tooltip de nome/efeito/turnos; a masmorra oferece os 10 temas.

### 12.4 Fase 11 — Save Completo & Lançamento

| Etapa | Entrega | Depende de |
|---|---|---|
| 11a | UI de importar save (Configurações + oferta de importar quando o save do navegador está corrompido) (achado #4) | nada |
| 11b | Build de produção íntegro sob subcaminho: `publicDir`/`base` corretos, caminhos de asset auditados (achado #5, parte 1) | nada |
| 11c | Workflow GitHub Actions: testes como gate → build → deploy no GitHub Pages (achado #5, parte 2) | 11b |
| 11d | Checklist final da spec inteira (seções 4, 6 e 7, tela a tela) e encerramento do documento | 11a-11c |

**Critério de pronto:** o jogo roda completo numa URL pública do GitHub Pages, sem nenhum 404 de asset; um save exportado numa máquina importa em outra; save corrompido nunca trava o jogo e oferece as duas saídas da seção 7; o checklist final da spec passa inteiro — **spec concluída**.

### 12.5 Fora de escopo (definitivo)

Herdado da seção 11.4 e mantido fora do encerramento da spec: tela de batalha visual para Arena/Guilda, Torre em tiles, e os itens da seção 9 (IA, backend, multiplayer, sprites por raça×classe). Se algum vier a acontecer, será uma spec nova, não uma extensão desta.

## 13. Revisão 2026-07-14 — o que ainda falta depois da Fase 11

Depois da Fase 11 a spec está formalmente encerrada (build publicado, save completo,
combate completo no modo principal). Esta revisão registra o que uma leitura mais
funda do código ainda encontra — gaps reais, verificados no código, não
suposição — para orientar uma eventual continuação (Fase 12 em diante) sem
reabrir o encerramento da spec em si.

### 13.1 Achados

| # | Achado | Onde | Evidência |
|---|---|---|---|
| 1 | **Salas de tesouro/armadilha/segredo da masmorra são puramente decorativas.** `SIMBOLO_POR_TIPO` desenha `trap`/`secret`/`treasure` na grade, mas `verificarEncontro()` só reage a `monstro`/`miniboss`/`boss` — pisar num `$`, `trap` ou `?` não dá loot, não causa dano, não dispara nada. O console original tinha lógica para essas salas (armadilha causa dano, segredo revela algo, tesouro dá item) que nunca foi portada para o web | `WebRPG/src/telas/masmorra/telaMasmorra.js` (`SIMBOLO_POR_TIPO`, `TIPOS_COM_ENCONTRO`) | Confirmado por leitura direta — `TIPOS_COM_ENCONTRO` é um `Set` de só 3 valores |
| 2 | **Arena e Guilda resolvem combate só em log de texto** — nenhuma das duas usa `montarTelaBatalha`/`iniciarBatalha`; não há palco, sprite, cenário de fundo (Fase 9) nem as 4 ações da Fase 10 (Poção/Defender não existem nesses modos) | `WebRPG/src/telas/arena/telaArena.js`, `WebRPG/src/telas/guilda/telaGuilda.js` | Já registrado como fora de escopo nas seções 11.4/12.5; repetido aqui como candidato de conteúdo, não mudança de decisão |
| 3 | **A Torre tem sprite do boss (Fase 7) mas o combate em si continua todo em texto** — mesmo problema do achado #2: sem as ações de Item/Defender da Fase 10, sem cenário de fundo por golpe, sem ícones de status | `WebRPG/src/telas/torre/telaTorre.js` | Confirmado — a tela não importa `iniciarBatalha` nem `telaBatalha.js` |
| 4 | **Consumíveis além da Poção de Cura nunca foram portados.** O console (`JogoRPG/`) tem o Néctar da Vida Eterna (poção maior) e 5 mementos lendários únicos de masmorra (Orbe da Fênix Flamejante, Coração Flamejante, Fragmento do Sol Caído, Néctar da Vida Eterna, Bússola do Destino) — o motor web só tem a Poção de Cura (`engine/itens/catalogo.js`) | `JogoRPG/masmorra/masmorra.js:20-50` | Nomes e contexto confirmados na leitura desta revisão |
| 5 | **Não existe UI para equipar amuleto/talismã.** O motor já suporta (`engine/itens/amuletoTalisma.js`, campo `jogador.amuletoEquipado` inclusive somado no cálculo de ataque/defesa da tela de Personagem), mas nenhuma tela em `WebRPG/src/telas/` renderiza um slot ou botão para ligar/desligar o amuleto — o único lugar que referencia `amuletoEquipado` no código web é um fixture de teste (`telaTorre.test.js`), nunca uma tela real | `engine/itens/amuletoTalisma.js`, `WebRPG/src/telas/personagem/telaPersonagem.js` | Confirmado — busca por `amuletoEquipado` em `WebRPG/src` só retorna o teste |
| 6 | **Level up é matematicamente correto mas invisível.** `checarLevelUp(jogador)` devolve uma lista de eventos `{tipo: "level_up", nivel, hpMax}` (o mesmo padrão de evento usado em todo o resto do motor), mas o único call site do jogo (`WebRPG/src/main.js`, ao vencer uma batalha de treino) descarta o retorno sem usar — o jogador sobe de nível silenciosamente, sem nenhuma celebração visual/sonora, violando o princípio "nenhuma ação sem resposta visual" da seção 4.1 #3 | `WebRPG/src/main.js` (`checarLevelUp(jogador);`, valor de retorno ignorado), `engine/personagem/experiencia.js:20` | Confirmado — `checarLevelUp` já produz o evento certo, só falta a UI consumir |
| 7 | **Craftar/alternar o amuleto e o Talismã da Torre não tem nenhuma UI.** O amuleto (no console, "Amuleto Supremo") é o item raro que **dá bônus permanente de status ao jogador** (+5% ataque, +10% HP máximo) e só pode ser criado se o jogador conseguir juntar um conjunto específico de itens vindos de missões e exploração — no motor web, simplificado para 5 materiais (`Pena do Corvo Sombrio`, `Pergaminho Arcano`, `Essência da Noite`, `Relíquia Brilhante`, `Gema da Escuridão`, todos já dropáveis de missões reais da Guilda). O motor tem tudo pronto — `podeCraftarAmuleto`/`craftarAmuleto`, `alternarAmuleto` (aplica/remove o bônus), `podeCraftarTalisma`/`craftarTalisma` (10 "Fragmento Antigo" + 2000 ouro) — mas **nenhuma tela chama qualquer uma dessas 5 funções**. O jogador consegue farmar todos os materiais (inclusive a missão especial de 10 ondas da Guilda e as ondas da Arena, que já dropam "Fragmento Antigo" de verdade) mas nunca consegue de fato craftar nem equipar o amuleto ou o talismã | `engine/itens/amuletoTalisma.js` (nenhuma das 5 exports é chamada em `WebRPG/src`), `engine/missoes/ondas.js`, `WebRPG/src/telas/guilda/telaGuilda.js:17-35`, `WebRPG/src/telas/arena/telaArena.js:56-62`, `JogoRPG/itens/amuletoTalisma/amuleto/menuAmuleto.js` (versão console, "Amuleto Supremo", 10 itens distintos) | Confirmado por busca — zero call sites em `WebRPG/src/telas/` |
| 8 | **Vencer uma batalha nunca dropa item — só XP e ouro.** `concederRecompensaVitoria` (chamada em todo fim de combate, incluindo masmorra/torre) só lê `inimigo.xp`/`inimigo.ouro`; não existe nenhum evento `drop`/chance de item por matar um monstro, miniboss ou boss. Itens só entram no inventário via missão da Guilda (achado já coberto) ou compra na loja. Consequência em cascata: os bônus passivos `dropOuro`/`dropItem` do Arqueiro e do Assassino (`engine/personagem/classes.js`) são **campos de dado nunca lidos por nenhum código** — mesma categoria do achado `dano_extra`/`defesa_extra` já documentado como dado morto na Fase 4 | `engine/combate/recompensas.js` (função inteira, 10 linhas), `engine/personagem/classes.js` (`dropOuro`, `dropItem`) | Confirmado — `recompensas.js` não tem nenhum branch de item; `dropOuro`/`dropItem` não aparecem em nenhum `.js` fora de `classes.js` e seus testes |
| 9 | **O herói sempre usa o sprite "soldado" em batalha, não importa a raça/classe escolhida.** A spec (seção 5) planejou 6 sprites (um por classe); só o par Soldado/Orc da Fase 1 existe, e `telaBatalha.js`/`telaCriacao.js` **hardcodam** `"soldado"` literalmente, sem ler `jogador.classe` — um Bárbaro e um Xamã aparecem visualmente idênticos em combate | `WebRPG/src/telas/batalha/telaBatalha.js:31` (`criarCombatente(jogador.nome \|\| "Você", "soldado")`), `WebRPG/src/telas/criacao/telaCriacao.js:9` (preview também fixo em "soldado") | Confirmado — busca por `"soldado"` no código mostra o literal fixo em ambos os pontos |
| 10 | **O Talismã da Torre não tem nenhum efeito de jogo — mesmo se craftado, nada verifica sua posse.** No console, o Talismã é uma **chave obrigatória**: `entrarNaTorre()` bloqueia a entrada inteira se `jogador.inventario` não contiver `"Talismã da Torre"`, e o item é **consumido** ao entrar ("o amuleto brilha intensamente e se desintegra, transformando-se na chave etérea que abre os portões"). No motor web, `engine/torre/index.js` (`criarEstadoTorre`/`avancarAndar`/`executarTurnoTorre`) **não tem nenhuma verificação de posse do talismã** — a Torre está sempre aberta, sem gate nenhum, tornando o item (mesmo que o achado #7 seja resolvido) inútil na prática. **Bônus do mesmo achado:** o console também tem uma sequência de final de jogo ao derrotar o 10º boss (Lorde do Caos) que nunca foi portada — mensagem de vitória, item-troféu "Cálice da Vitória" e bônus de 10000 ouro; o motor web só emite `fim: "torre_completa"` sem nenhuma recompensa ou celebração especial | `JogoRPG/torre/entrarTorre.js:6-12` (gate), `:53-68` (final: Cálice da Vitória + 10000 ouro), `engine/torre/index.js:45` (`fim: "torre_completa"`, sem tratamento especial) | Confirmado — nenhum arquivo em `engine/torre/` ou `WebRPG/src/telas/torre/` referencia "Talismã da Torre" ou qualquer verificação de item para liberar acesso |

### 13.2 Não são achados — checados e confirmados como já resolvidos

Para não duplicar trabalho numa fase futura: os itens abaixo foram checados nesta
revisão e **já têm cobertura completa**, mesmo não sendo óbvio à primeira vista.

- **Inventário**: a separação de dados é real e consistente — `jogador.equipamentos` (slots `head/chest/hands/legs/feet`, um item cada), `jogador.armaEquipada` (a arma ativa), `jogador.inventario` (itens soltos, não equipados) e `jogador.itens`/`jogador.amuletoEquipado` (materiais de craft/estado do amuleto) são campos distintos e bem definidos em `criarPersonagem` (`engine/personagem/criarPersonagem.js`); a única divergência é a dupla contabilidade de poção já corrigida na Fase 10 (achado 12.1 #2).
- **Equipar armas/armaduras**: `engine/itens/equipar.js` + `telaPersonagem.js` funcionam de ponta a ponta, com comparação de atributos (↑↓) antes de trocar — confirmado nas revisões anteriores.
- **Habilidades únicas de inimigo**: todas as 6 (invulnerável, paralisia/teia, roubo e fuga, petrificar, regeneração, bloquear+contra-atacar) estão implementadas e testadas desde a Fase 4 (`engine/combate/habilidadesInimigo.js`, `turno.js`) — funcionando de verdade em batalha, não só como dado.
- **Loja**: cobre os 4 conjuntos de armadura completos (20 peças), as 10 armas com efeito único cada, e tem aba de Vender além de Comprar — catálogo completo, nada faltando aqui.
- **Torre**: os 10 bosses têm mecânica própria implementada e testada (`engine/torre/bosses.js`/`index.js`, Fase 4) e sprite (Fase 7) — mas 6 dos 10 ainda caem no fallback visual "orc" enquanto a Fase 8 (sprites restantes) não for executada; a Torre em si (a tela) ainda usa combate em texto puro, não a tela de batalha com sprite (achado #3 acima).
- **Lógica de upar e classes**: `engine/personagem/experiencia.js`/`classes.js` corretos e testados — só a celebração visual está faltando (achado #6), não a lógica.
- **Missões**: chance de sucesso, ouro, XP, item, poção extra e missão-bônus (`chanceMissaoExtra`) todas funcionam (`engine/missoes/index.js`); a chance de a missão levar a uma masmorra bônus (`chanceMasmorra`) existe no dado do catálogo mas **não é lida em lugar nenhum do código web** — é o mesmo padrão de dado morto do achado #8 (a ser incluído numa fase futura se confirmado necessário).
- **Missão de 10 ondas → fragmento → Talismã da Torre**: a cadeia mecânica inteira funciona — a missão lendária "Desafio da Arena Amaldiçoada" (`tipoBatalha: "ondas"`, `engine/missoes/ondas.js`, `TOTAL_ONDAS=10`) resolve as 10 ondas e credita "Fragmento Antigo"; a Arena (modo separado, ondas infinitas) também dropa o mesmo fragmento; `craftarTalisma` (10 fragmentos + 2000 ouro) já existe. **O único elo faltando é a UI de craft (achado #7)** — o jogador consegue juntar os fragmentos hoje, só não consegue gastá-los.
- **Drops de missão por raridade**: funcionam (`resolverResultadoMissao`, chance por raridade comum/raro/lendário + bônus do Assassino). O que não existe é drop por **matar um monstro em combate** (achado #8) — são dois sistemas de loot diferentes, e só o de missão está pronto.
- Amuletos/talismãs no *cálculo* de combate — o bônus já entra em `calcularAtaqueJogador`/`calcularDefesaJogador`; falta só a UI de craft/equipar (achados #5 e #7), não a lógica.
- Ícones de status, cenário por local, 4 ações de batalha — cobertos nas Fases 9-10 (quando executadas), mas **só no modo de treino e na masmorra** (ver achados #2/#3 — Arena/Guilda/Torre ficam de fora).

### 13.3 Estado de execução (importante para não confundir "planejado" com "no jogo")

Até esta revisão (2026-07-14), **apenas as Fases 0-7 foram de fato implementadas** (ver `docs/superpowers/docs.md`) — as Fases 8-11 (seções 11-12) **ainda são só planos escritos**, não código. Na prática isso significa que, hoje, jogando o WebRPG:
- a masmorra ainda tem só 3 dos 10 temas (Fase 8 não executada);
- 9 nomes de inimigo ainda caem no sprite "orc" (Fase 8 não executada);
- a batalha ainda só tem Atacar/Fugir, sem Poção/Defender nem ícones de status (Fase 10 não executada);
- não há seletor de masmorra, importar save, nem deploy no GitHub Pages (Fases 10-11 não executadas).

Os achados #1-#10 desta seção 13 são **adicionais** a essas quatro fases já planejadas — sobrevivem mesmo depois que as Fases 8-11 forem executadas.

### 13.4 Fora de escopo (mantido)

Confirma o que a seção 12.5 já fechou: sprites únicos por **combinação** raça×classe (42 combos, seção 9) continuam fora de escopo. **Atenção à distinção**: isso é diferente do achado #9 acima — a seção 5 sempre planejou 6 sprites **por classe** (não por combo), e esses 6 nunca foram construídos (só existe 1, sempre "soldado"); ao contrário dos combos, os 6 sprites de classe **não estão** na lista de fora de escopo — são um gap real, é só que nunca chegou a ser feito. IA/backend/multiplayer permanecem fora de escopo sem ressalva.
Os achados #1-#10 acima **não têm fase numerada nem plano escrito nesta revisão** —
ficam registrados como candidatos para uma eventual Fase 12 em diante, a serem
planejados quando/se o trabalho for retomado.
