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
