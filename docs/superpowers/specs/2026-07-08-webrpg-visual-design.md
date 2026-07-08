# Especificação: WebRPG — Versão Visual do RPG "The Lost World"

**Data:** 2026-07-08
**Status:** Aprovado pelo usuário (design validado em sessão de brainstorming)

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
└── save/         esquema JSON único e versionado
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
CIDADE (hub em pixel art com locais clicáveis)
   ├── Guilda     → missões (ondas, mini-boss, histórias pré-escritas)
   ├── Loja       → armas, armaduras, sets com bônus visíveis, consumíveis
   ├── Torre      → andares progressivos, bosses, regra anti-grind
   ├── Masmorra   → grade explorável com névoa de guerra
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

| Necessidade | Fonte | Custo |
|---|---|---|
| Herói + Orc animados | Tiny RPG Character Asset Pack — Soldier & Orc (já no repo) | grátis |
| ~10 monstros animados | LuizMelo — Monsters Creatures Fantasy e packs irmãos (itch.io) | grátis |
| Cenários parallax | ansimuz (itch.io), baixados localmente | grátis |
| UI pixel (painéis, botões, molduras) | Kenney UI Pack + packs "Pixel UI" (itch.io) | grátis |
| Ícones de itens pixel (substituem Font Awesome) | packs de ícones RPG (itch.io / OpenGameArt) | grátis |
| Fontes | Press Start 2P + fonte de corpo (Google Fonts) | grátis |
| Sons (golpe, crítico, moeda, level up) | Kenney Audio + packs RPG itch.io (Fase 5) | grátis |

**Raça × classe (7×6 = 42 combos, inviável):** o sprite de batalha vem da **classe** (6 sprites); a identidade da **raça** aparece no retrato/moldura e nos bônus.

**Licenças:** conferir e registrar a licença de cada pack baixado (arquivo `WebRPG/assets/CREDITS.md` com autor, link e licença).

## 6. Fases de construção (cada fase termina jogável)

| Fase | Entrega | Critério de pronto |
|---|---|---|
| **0 — Fundação** | Vite, estrutura `engine/`, design system CSS (paleta, raridades, tipografia, painéis, `image-rendering: pixelated`), roteador de telas, assets baixados e organizados | `npm run dev` abre o esqueleto navegável com o design system aplicado |
| **1 — Batalha** | Núcleo de combate extraído para `engine/combate/` com eventos; console adaptado e funcionando; tela de batalha completa (sprites, fila de animação, dano, tremor, barras, log) | Batalha Soldado vs Orc completa e bonita, com veneno/sangramento visualmente funcionais; console joga igual a antes |
| **2 — Identidade** | Wizard de criação com preview animado, cidade hub clicável, save/load localStorage + exportar/importar, auto-save | Criar personagem → cidade → batalha → recarregar página → continuar do save |
| **3 — Economia** | Missões da guilda (ondas, mini-boss, histórias), loja com sets, tela de personagem (equipar com comparação ↑↓, amuletos/talismãs) | Loop completo: missão → ouro → loja → equipar → ficar mais forte |
| **4 — Profundidade** | Torre (andares, bosses, anti-grind), masmorra em grade com névoa, arena infinita (bênçãos, fragmentos) | Os três modos jogáveis do início ao fim |
| **5 — Polimento** | Sons, música, transições, partículas, telas de vitória/derrota, responsividade mobile, onboarding, revisão final tela a tela | Cada tela revisada contra o padrão de referência; jogável no celular |

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
- Framework de jogo (Phaser/PixiJS) — pode ser reavaliado no futuro para efeitos avançados.
- Sprites únicos por combinação raça×classe.
- Multiplayer, ranking online, conquistas.
