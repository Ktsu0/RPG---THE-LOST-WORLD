# Especificação: GodotRPG — Versão Godot Engine do RPG "The Lost World"

**Data:** 2026-07-17
**Status:** Rascunho — aguardando início da Fase 0.

## 1. Objetivo

Reconstruir a camada visual do RPG num projeto **Godot Engine (4.x)** novo, substituindo a
tentativa anterior em HTML/CSS/JS/Phaser (`WebRPG/`). A tentativa web não deu certo como
experiência visual (ver `docs/superpowers/specs/2026-07-08-webrpg-visual-design.md`, seções
10-13 — sucessivos diagnósticos de "joga certo, parece formulário"); a decisão agora é usar
um motor de jogo de verdade, feito para isso.

**Visão de gameplay** (definida pelo usuário em 2026-07-17), estilo **Rucoy Online**:

- Mundo aberto com uma cidade central: loja, guilda, ferreiro, missões extra.
- Fora da cidade, monstros vagando — dificuldade cresce com a distância da cidade.
- Guilda oferece missões de escolta, caça, coleta, entre outras.
- Objetivo final: construir o **Talismã**, que abre o portão do **Castelo**; lá dentro, 10
  monstros com habilidades próprias guardam a **princesa**; vencer todos = zerar o jogo.
- Ferreiro melhora/cria **artefatos** a partir de drop de monstro, coleta no mapa e
  recompensa de missão; artefatos dão buffs de status.
- Loja vende **conjuntos de armadura e armas** com efeitos especiais (sangramento,
  crítico, etc.).
- **Masmorras secretas**: descobertas explorando o mundo — mapas raros dropam de monstros
  (muito raro) ou vêm de coleta/missão. Dentro: monstros temáticos, miniboss, boss forte,
  itens lendários (revive 1x, cura por turno, revela portas de masmorra secreta andando).
- Criação de personagem: raça + classe, cada combinação dando atributos diferentes.
- Sistema de level up.

**Descoberta chave desta revisão:** quase tudo isso **já foi projetado e, em boa parte, já
tem lógica pronta e testada** em JavaScript puro (`engine/`), fruto das Fases 0-14 do plano
WebRPG (`docs/superpowers/docs.md`) — incluindo as Fases 12-14, que já cobrem Talismã/Castelo/
princesa, Ferreiro, masmorras secretas e relíquias lendárias, mas nunca foram executadas em
código. Este documento não reprojeta o jogo do zero: **reaproveita esse design e, onde já
existe, porta a lógica testada para GDScript**, e resolve com um motor de jogo de verdade
exatamente o problema que a spec web nunca conseguiu resolver — a parte visual.

## 2. Decisões aprovadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Motor | **Godot 4.x** (recomendado: a versão estável mais recente no início da Fase 0 — 4.3 ou superior) | Motor de jogo dedicado, editor de tilemap/animação nativo, exporta para Web (HTML5/WASM) e Desktop a partir do mesmo projeto. |
| Estilo de combate | **Turnos** (Atacar · Item · Defender · Fugir), como o jogo atual — **não** tempo real | Decisão do usuário (2026-07-17): reaproveita 100% da lógica de combate já pronta e testada (`engine/combate/`), só portando para GDScript. "Estilo Rucoy" fica na referência de mundo/exploração, não na mecânica de batalha. |
| Multiplayer | **Single-player**, sem servidor | Decisão do usuário (2026-07-17): "estilo Rucoy" descreve o gameplay (mundo aberto, cidade, monstros vagando), não a arquitetura online. Sem backend, sem sincronização de estado. |
| Linguagem de script | **GDScript** | Nativa do Godot, mais simples que C# para portar as ~33 suítes de teste e ~30 módulos de `engine/`, que já são JS simples orientado a função pura + dado (sem classes complexas nem tipos que dependam de recursos exclusivos de outra linguagem). |
| Lógica de jogo | **Porta `engine/` (JS) → `godotrpg/scripts/engine/` (GDScript)**, módulo por módulo, preservando nomes de pasta/arquivo e comportamento testado | `engine/` já é lógica pura (zero DOM/console) organizada exatamente como um motor de jogo separa regras de apresentação — o padrão "funções devolvem lista de eventos" (seção 3.2 da spec web) se traduz quase 1:1 para sinais/eventos consumidos por cenas Godot. |
| Testes | **GUT** (Godot Unit Test, addon gratuito) | Equivalente ao Vitest usado hoje; os 33 arquivos `*.test.js` de `engine/` servem de roteiro para os testes GDScript — mesmos casos, mesmos valores esperados. |
| Assets visuais/sonoros | **Reaproveitar os já baixados e licenciados** em `WebRPG/public/assets/` (ver seção 5) | Todo o trabalho de garimpo de sprites/tiles/áudio com licença CC0/CC-BY já foi feito nas Fases 0, 6-9 do plano web — remonta-los do zero seria jogar fora trabalho válido só porque o "motor" ao redor deles não funcionou. |
| Save | Godot `user://save.json`, mesmo schema versionado (`versao: N`) já usado pelo `engine/save/index.js` | Mantém compatibilidade de formato — dá para escrever um conversor de save WebRPG → GodotRPG se algum dia for preciso, mesmo não sendo objetivo desta fase. |
| Deploy | **Export Web (HTML5/WASM)** do Godot, publicado no mesmo GitHub Pages | Mantém o jogo jogável no navegador sem instalar nada, como está hoje. Export Desktop (Windows/Linux) fica como opção secundária, não bloqueia a Fase 0. |
| `WebRPG/` (projeto Vite/Phaser) | **Remover do repositório** ao final da Fase 0, depois que os assets tiverem sido copiados para o projeto Godot | Decisão do usuário (2026-07-17). **Ação destrutiva — só será executada mediante confirmação explícita no momento da Fase 0**, não como parte deste documento de planejamento. |
| `engine/` (JS) e `JogoRPG/` (console) | **Mantidos durante a migração** como referência de comportamento a portar; reavaliar remoção de `engine/` só depois que a Fase 1 (porte do motor) estiver completa e verificada 1:1 contra os testes GDScript | `JogoRPG/` é o console original, independente do Godot, e não faz parte desta migração — continua existindo por conta própria. `engine/` é a fonte da verdade dos valores/fórmulas testados até serem portados. |

## 3. Arquitetura

### 3.1 Estrutura do projeto Godot

```
godotrpg/                          # novo projeto Godot na raiz do repositório
├── project.godot
├── scripts/
│   ├── engine/                    # port 1:1 de engine/ (JS) — lógica pura, sem nó de cena
│   │   ├── combate/                 turno.gd, calculo_dano.gd, efeitos_de_status.gd,
│   │   │                            habilidades_inimigo.gd, recompensas.gd, drops.gd, aleatorio.gd
│   │   ├── personagem/              racas.gd, classes.gd, criar_personagem.gd, experiencia.gd
│   │   ├── itens/                   catalogo.gd, equipar.gd, raridade.gd, pocao.gd, nectar.gd,
│   │   │                            amuleto_talisma.gd, efeitos_arma.gd, ferreiro.gd, reliquias.gd
│   │   ├── geradores/               inimigo_treino.gd
│   │   ├── loja/                    loja.gd
│   │   ├── missoes/                 catalogo.gd, index.gd, ondas.gd
│   │   ├── masmorra/                gerador.gd, index.gd, inimigo_da_sala.gd, salas.gd
│   │   ├── mundo/                   grade.gd, mapas/cidade.gd, monstros_selvagens.gd,
│   │   │                            mapas_secretos.gd
│   │   ├── torre/                   bosses.gd, index.gd
│   │   ├── arena/                   index.gd
│   │   └── save/                    index.gd
│   └── telas/                     # scripts de cena (UI, animação, input) — o "adaptador Godot",
│                                     equivalente ao adaptador web/console da spec anterior
├── scenes/
│   ├── titulo/, criacao/, cidade/, mundo/, batalha/, loja/, guilda/, ferreiro/,
│   │   masmorra/, torre_castelo/, personagem/, configuracao/
├── assets/                        # copiado de WebRPG/public/assets/, reorganizado para
│                                     import nativo do Godot (ver seção 5) + CREDITS.md preservado
└── tests/                         # suíte GUT, espelhando engine/**/*.test.js
```

### 3.2 Padrão de comunicação: o mesmo "motor de eventos" da spec web

`engine/` já resolveu esse problema — cada ação do motor devolve uma lista de eventos
descrevendo o que aconteceu (`{tipo: "dano", alvo: "inimigo", valor: 23, critico: true}`,
`{tipo: "status_aplicado", ...}`, `{tipo: "morte", ...}`, `{tipo: "drop", ...}`). Este padrão
é **preservado tal como está** na porta para GDScript: cada função de `scripts/engine/`
devolve um `Array[Dictionary]` de eventos; as cenas em `scripts/telas/` consomem essa lista
numa fila sequencial (via `Tween`/`await` do Godot, no lugar do "timeout de segurança" que a
versão web precisou simular em cima de CSS) para animar dano, crítico, morte, drop, etc.

Não é um padrão novo a inventar — é o mesmo padrão já testado em produção, só trocando quem
consome a lista de eventos (DOM → nós de cena Godot).

### 3.3 Estratégia de porte: 1:1 primeiro, melhorar depois

Cada módulo de `engine/` tem um arquivo de teste (`*.test.js`) com os valores exatos que a
lógica precisa produzir (fórmulas de dano, chance de crítico/esquiva, drops por raridade,
bônus de raça/classe, geração de masmorra). A migração para GDScript segue módulo por módulo:

1. Ler o `.js` + `.test.js` do módulo.
2. Escrever o `.gd` equivalente com a mesma assinatura de função (traduzida para `snake_case`,
   convenção GDScript) e o mesmo comportamento.
3. Escrever os testes GUT espelhando exatamente os casos do `.test.js` original.
4. Só then seguir para o próximo módulo.

Isso transforma uma reescrita arriscada em tradução mecânica verificável — o "novo" motor
nunca fica sem cobertura de teste equivalente ao antigo.

## 3.4 Lista mestra de conteúdo e sprites

O usuário forneceu uma planilha (`The Lost Word.csv`) com a lista completa de todo sprite,
ambiente e tela necessários — bestiário do mundo aberto, das masmorras, conjuntos de
equipamento, itens especiais, telas de UI. Reorganizada e comparada módulo a módulo com
`engine/` em
[`2026-07-17-lista-mestra-conteudo-sprites.md`](./2026-07-17-lista-mestra-conteudo-sprites.md).

**Achado principal dessa comparação:** os 10 bosses da Torre/Castelo, as 6 classes e as 7
raças já batem exatamente com o que está em `engine/`. Os **10 temas de masmorra completos**
(mobs, 3 minibosses corretos por tema, boss, `trapChance`/`secretChance`/`treasureMultiplier`)
**já existem prontos em `JogoRPG/masmorra/masmorra.js:56-215` (`DUNGEON_TEMPLATES`)** — nunca
foram totalmente portados para `engine/masmorra/gerador.js` (que hoje usa nomes genéricos e
recicla bosses da Torre). **Decisão do usuário (2026-07-17):** a Fase 1 porta
`scripts/engine/masmorra/gerador.gd` a partir de `JogoRPG/masmorra/masmorra.js`, não do
`engine/` simplificado — com 3 nomes de boss atualizados para bater com a planilha (Dolgarth,
Vel'Thyra, Zerakth). Tabela definitiva com os 10 templates: seção 3.3 do documento linkado.

## 4. Plano de aproveitamento de assets (nada é baixado do zero)

Todo asset abaixo já está em `WebRPG/public/assets/` com licença registrada em
`WebRPG/public/assets/CREDITS.md` (CC0 em quase tudo; Kyrise's Icon Pack é CC-BY 4.0 e exige
crédito — manter a atribuição). O trabalho da Fase 0 é **copiar e reimportar como recurso
nativo do Godot**, não regarimpar.

| Asset | Onde está hoje | Como entra no Godot |
|---|---|---|
| Soldado + Orc animados (idle/ataque/dano/morte) | `Tiny RPG Character Asset Pack.../Characters(100x100)/` | `SpriteFrames` de `AnimatedSprite2D`, um por personagem |
| ~10 arquétipos de monstro (goblin, cogumelo, esqueleto, olho-voador, mago, elemental-fogo, golem-pedra, lobo) | `personagens/{nome}/` (Fases 7-8) | Idem — mapeamento nome-de-inimigo → `SpriteFrames`, equivalente a `mapaSprites.js` mas em GDScript/Resource |
| Tiles de cidade, masmorra, mundo aberto (chão, parede, grama) | `cenarios/{cidade,masmorra,mundo}/` | `TileSet` nativo do Godot (o editor de TileMap do Godot substitui o renderer de tiles próprio que a versão web teve que construir à mão sobre JSON do Tiled — ganho direto de trocar de motor) |
| Cenários de fundo parallax (floresta, cripta, pedra-escura) | `cenarios/parallax/` | `ParallaxBackground`/`ParallaxLayer` nativo |
| UI pixel (painéis, botões) | `ui/base/` (Kenney Pixel UI Pack) | `StyleBoxTexture`/tema Godot (`Theme` resource) aplicado a `Control` |
| Ícones de item por slot | `ui/icones/` (Kyrise — **CC-BY, crédito obrigatório**) | `Texture2D` em `TextureRect`/ícone de slot de inventário |
| Fonte pixel (Press Start 2P) | `@fontsource/press-start-2p` (pacote npm, arquivo `.ttf`/`.woff` real) | `FontFile` importado, usado em títulos/números de dano |
| SFX (golpe, crítico, moeda, passos) | `audio/efeitos/` | `AudioStreamPlayer` com `AudioStreamOggVorbis`/`.ogg` nativo |
| Música ambiente (cidade, batalha, torre, masmorra) | `audio/musica/` (AlkaKrab) | `AudioStreamPlayer` em loop |

**Pendência conhecida (herdada, não nova):** Hidra das Sombras e Dragão Negro não têm sprite
próprio — nenhum pack de dragão gratuito com licença clara foi encontrado na Fase 8 do plano
web. Continuam no fallback visual (era "orc" na versão web; decidir o fallback equivalente no
Godot na hora de montar o bestiário).

**Créditos:** `godotrpg/assets/CREDITS.md` nasce como cópia do `CREDITS.md` atual — a origem e
licença de cada asset não muda por trocar de motor.

## 5. Mapa de telas (cenas Godot)

```
Título → Criação de Personagem (raça → classe → nome, preview do sprite
   │       animado e bônus em tempo real)
   ▼
MUNDO ABERTO (TileMap navegável, CharacterBody2D, câmera segue o jogador)
   │
   ├── CIDADE (hotspot central do mundo aberto)
   │      ├── Loja       → armas/armaduras em conjuntos, efeitos especiais, compra/venda
   │      ├── Guilda     → missões: escolta, caça, coleta, ondas
   │      ├── Ferreiro   → forjar/melhorar artefatos (drop + coleta + recompensa de missão)
   │      ├── Personagem → status, inventário, equipar, amuleto/talismã
   │      └── Config     → save/load, exportar/importar, volume
   │
   ├── ZONAS SELVAGENS (fora da cidade, mesmo mundo aberto) → monstros vagando, dificuldade
   │      cresce com a distância da cidade → encontro dispara BATALHA (turnos)
   │
   ├── MASMORRAS → grade explorável com névoa de guerra; normais (10 temas, seletor) ou
   │      secretas (reveladas por mapa raro dropado/coletado/de missão); salas de
   │      armadilha/tesouro/segredo funcionais; boss/miniboss ao fim
   │
   └── CASTELO (a "Torre" reaproveitada e re-temada) → exige e consome o Talismã da Torre
          para entrar; 10 monstros com habilidade própria; vencer o 10º = resgatar a
          princesa, vitória final do jogo
```

### 5.1 Tela de batalha (turnos)

Igual ao que a spec web sempre pediu (seção 4.3 da spec anterior), agora com um motor que
faz isso nativamente: herói à esquerda, inimigo à direita, `AnimatedSprite2D` para
idle/ataque/dano/morte, barras de HP com `TextureProgressBar`, fileira de ícones de status
com tooltip, barra de ações **Atacar · Item · Defender · Fugir**, log de combate rolável,
números de dano/crítico como `Label` com `Tween` (voando, tremor de tela no crítico).

## 6. Fases de construção

Cada fase termina com o jogo rodável no editor Godot (F5) até aquele ponto. As Fases 12-14 do
plano web (Talismã/Castelo, Ferreiro, masmorras secretas, relíquias, mundo com dificuldade por
distância) **não são etapas extras aqui — já nascem dentro das fases abaixo**, porque o design
delas já está pronto e só nunca foi implementado em nenhuma engine.

| Fase | Entrega | Depende de |
|---|---|---|
| **0 — Fundação Godot** | Projeto Godot criado; assets copiados de `WebRPG/public/assets/` e reimportados (seção 4); estrutura de pastas (seção 3.1); tema/paleta/fonte pixel aplicados; tela de Título navegável. **Remover `WebRPG/` do repo** (mediante confirmação) depois que os assets estiverem copiados. | nada |
| **1 — Motor portado** | `engine/` (JS) → `scripts/engine/` (GDScript), módulo por módulo (seção 3.3): personagem/raças/classes, itens/equipar/raridade/poção, combate/turno/dano/status/recompensas/drops. **Exceção:** `masmorra/gerador.gd` porta de `JogoRPG/masmorra/masmorra.js` (dado completo, não do `engine/` simplificado — ver seção 3.4 e a lista mestra). Suíte GUT espelhando os 33 arquivos de teste de `engine/` + os 10 templates de masmorra. | Fase 0 |
| **2 — Batalha** | Cena de batalha completa (seção 5.1) consumindo os eventos do motor portado — Atacar/Item/Defender/Fugir, ícones de status, log, drops visíveis. | Fase 1 |
| **3 — Identidade** | Wizard de criação com preview animado; save/load em `user://` (schema versionado); tela de Personagem (equipar com comparação ↑↓, amuleto/talismã). | Fase 1-2 |
| **4 — Mundo Aberto & Cidade** | `TileMap` de cidade + zona selvagem; `CharacterBody2D` do jogador; câmera; monstros vagando com dificuldade por distância da cidade; hotspots (loja/guilda/ferreiro/portão do castelo). | Fase 1 |
| **5 — Loja, Guilda & Ferreiro** | Loja (conjuntos de armadura/arma com efeito especial — sangramento, crítico etc., compra/venda); Guilda (missões de escolta/caça/coleta/ondas); Ferreiro (forjar/melhorar artefato com material de drop+coleta+recompensa). | Fase 3-4 |
| **6 — Masmorras** | Grade explorável com névoa de guerra; 10 temas selecionáveis; salas de armadilha/tesouro/segredo funcionais; masmorras secretas via mapa raro (drop muito raro de monstro, coleta ou missão). | Fase 2, 4 |
| **7 — Castelo Final** | Talismã como chave obrigatória e consumível; 10 monstros com habilidade própria cada; vitória final = resgate da princesa. | Fase 2, 5 (Talismã craftável no Ferreiro/Guilda), 6 |
| **8 — Bestiário & Itens Lendários** | Sprite próprio para os inimigos restantes (dentro do possível — ver pendência da seção 4); itens lendários de masmorra com efeito passivo (revive 1x, cura por turno, revela porta de masmorra secreta andando pelo mundo). | Fase 6-7 |
| **9 — Polimento & Áudio** | Música ambiente por zona, SFX, transições de tela, partículas, telas de vitória/derrota, responsividade (se exportado pra Web). | Fases 2-8 |
| **10 — Build & Lançamento** | Export Web (HTML5/WASM) publicado no GitHub Pages no lugar do `WebRPG/` removido; export Desktop opcional; checklist final tela a tela. | Fases 0-9 |

**Critério de pronto de cada fase:** jogável de ponta a ponta no editor Godot até aquele
ponto, sem crash, com os testes GUT do motor portado até ali passando.

## 7. Saves e tratamento de erros

- Mesmo esquema JSON único e versionado (`versao: N`) já definido em `engine/save/index.js` —
  a Fase 1 porta esse módulo como qualquer outro.
- Godot: `user://save.json` via `FileAccess`. Exportar = copiar/baixar o arquivo; importar =
  seletor de arquivo (`FileDialog`, ou input de texto colado no export Web, já que Web export
  não tem acesso livre ao sistema de arquivos do usuário — decisão de UX a confirmar na Fase 3).
- Save corrompido/inválido não trava o jogo — oferece novo jogo ou importar backup (mesma regra
  da spec anterior, seção 7).

## 8. Testes

- **GUT** sobre `scripts/engine/`: fórmulas de dano/crítico/esquiva, efeitos de status, drops
  por raridade, bônus de raça/classe/set, geração de masmorra (grade sempre tem caminho válido
  até o boss) — espelhando 1:1 os 33 arquivos `*.test.js` de `engine/` (seção 3.3).
  - Rodar via `godot --headless -s addons/gut/gut_cmdln.gd` (CI-friendly, sem editor gráfico).
- UI/cenas: checklist manual por fase (fluxo criar → mundo → cidade → batalha → loot → save →
  recarregar → continuar), mesmo padrão da spec anterior.

## 9. Fora de escopo (por decisão)

- **Multiplayer/servidor** — decisão do usuário (seção 2); "estilo Rucoy" é só referência de
  gameplay solo, não arquitetura online.
- **Combate em tempo real** — decisão do usuário (seção 2); mantém turnos.
- Geração de histórias por IA (o console `JogoRPG/` já tinha isso via Gemini; nunca fez parte
  da versão web nem entra na versão Godot).
- Sprites únicos por **combinação** raça×classe (42 combos) — mesma decisão herdada da spec
  web (sprite de batalha vem da classe; raça aparece no retrato/bônus).
- Ranking online, conquistas.

## 10. O que muda no repositório

- **`WebRPG/`** (projeto Vite/Phaser): removido ao final da Fase 0, depois de confirmar que
  todo asset necessário foi copiado para `godotrpg/assets/`. **Ação destrutiva — pedir
  confirmação explícita antes de executar, não faz parte deste documento.**
- **`engine/`** (lógica JS pura): mantido como referência de porte durante a Fase 1; reavaliar
  remoção só depois da Fase 1 completa e verificada (todos os módulos portados e com testes
  GUT equivalentes passando).
- **`JogoRPG/`** (console original): não afetado — projeto independente, continua existindo.
- **Novo:** `godotrpg/` na raiz, com a estrutura da seção 3.1.
- **`docs/superpowers/docs.md`**: ganha uma seção de controle de fases para o GodotRPG,
  separada da tabela de fases do WebRPG (que fica congelada como registro histórico).

## 11. Perguntas em aberto para a Fase 0

Registradas aqui para não bloquear a redação deste plano, mas precisam de resposta antes ou
durante a Fase 0:

1. **Import/export de save no export Web**: `FileDialog` de leitura/escrita de arquivo tem
   suporte limitado no Godot Web export — decidir entre (a) copiar/colar o JSON num
   `TextEdit`, (b) usar a API de download do navegador via `JavaScriptBridge` (Godot Web expõe
   essa ponte só quando necessário, sem reintroduzir toda uma camada de lógica em JS — só I/O
   de arquivo), ou (c) abrir mão de export/import no Web e manter só no build Desktop.
2. **Nome definitivo do projeto/pasta** (`godotrpg/` é um placeholder neste documento).
3. **Fallback visual para Hidra das Sombras/Dragão Negro** (seção 4, pendência herdada) —
   manter "orc" como no web, ou buscar de novo agora que há mais tempo de projeto.
