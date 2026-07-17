# Lista Mestra de Conteúdo & Sprites — GodotRPG

**Data:** 2026-07-17
**Origem:** planilha do usuário (`The Lost Word.csv`, exportada do OneDrive), convertida de
Windows-1252 para UTF-8 e reorganizada por categoria. Nenhum sprite estava marcado como feito
(todas as linhas tinham `FALSO`) — é a lista de referência do que precisa existir, não um
inventário do que já existe.

**Como usar este documento:** é a fonte da verdade de **nomes e conteúdo** para as Fases 1, 6
e 8 de [`2026-07-17-godot-visual-design.md`](./2026-07-17-godot-visual-design.md) (motor
portado, masmorras, bestiário). Onde este documento diverge do que já está codificado em
`engine/`, isso é sinalizado explicitamente na seção 8 — **decisão do usuário necessária**
antes de portar esses módulos.

---

## 1. Explorar (mundo aberto)

### 1.1 Monstros (10)
Goblin Ladrão · Lobo das Sombras · Bandido Veterano · Arauto do Pântano · Espectro Errante ·
Elemental de Fogo · Aranha Venenosa Gigante · Cavaleiro Amaldiçoado · Gárgula de Pedra · Súcubo

### 1.2 MiniBosses (15)
Capitão Sombrio · Sentinela Perdido · Ladrão de Sepulturas · Guerreiro Orc · Cão Infernal ·
Guardião de Ruínas · Assassino das Sombras · Minotauro Guardião · Troll da Rocha ·
Xamã do Gelo · Feiticeiro Caído · Dragão Corrompido · Senhor dos Ghouls · Hydra ·
Dominador de Mentes

### 1.3 Ambientes (8 — 4 biomas × variante normal/neve)
Floresta / Floresta - Neve · Montanha / Montanha - Neve · Rio / Rio - Neve ·
Planície / Planície - Neve

---

## 2. Itens

### 2.1 Armas (10)
Espada Longa · Arco Élfico · Adaga Sombria · Martelo de Guerra · Cajado do Caos ·
Cajado Congelante · Machado Flamejante · Lança Sagrada · Punhais Gêmeos · Foice do Ceifador

### 2.2 Armaduras (20 = 4 conjuntos × 5 peças: elmo/peitoral/manoplas/grevas/botas)
**Conjunto Ferro:** Elmo de Ferro · Peitoral de Ferro · Manoplas de Ferro · Grevas de Ferro · Botas de Ferro
**Conjunto Leve/Velo:** Capuz de Velo · Túnica Ligeira · Luvas Leves · Calças Ligeiras · Botas Ágeis
**Conjunto Sombras:** Máscara das Sombras · Peitoral das Sombras · Luvas das Sombras · Calças das Sombras · Botas das Sombras
**Conjunto Dragão:** Elmo do Dragão · Peitoral do Dragão · Manoplas do Dragão · Grevas do Dragão · Botas do Dragão

### 2.3 Itens Especiais (17 — consumíveis, materiais de craft, relíquias)
Poção de Cura · Orbe da Fênix Flamejante · Coração Flamejante · Fragmento do Sol Caído ·
Néctar da Vida Eterna · Bússola do Destino · Fragmento Antigo · Pena do Corvo Sombrio ·
Pergaminho Arcano · Flor da Aurora · Essência da Noite · Relíquia Brilhante ·
Página Amaldiçoada · Máscara Sombria · Gema da Escuridão · Escama de Dragão Azul ·
Coração de Magma

### 2.4 Traps/Baús (7)
Vinhas · Espinhos · Estacas · Saco de Dinheiro · Baú de Madeira · Baú de Ouro · Baú Místico

---

## 3. Masmorra

### 3.1 Monstros comuns (31, com sobreposição proposital com o bestiário de "Explorar")
Esqueleto Errante · Zumbi Corrompido · Rato Gigante · Espectro Errante · Lobo das Sombras ·
Aranha Venenosa Gigante · Bandido Veterano · Guerreiro Congelado · Harpia Gelada ·
Caranguejo de Cristal · Lacaio de Fogo · Golem de Lava · Escorpião Flamejante ·
Acólito Corrompido · Livro Animado · Gárgula de Pedra · Rato Gigante · Bandido Veterano ·
Arauto do Pântano · Répteis do Lodo · Híbrido Putrefato · Mosca Gigante · Sentinela Obscura ·
Acólito Maldito · Cavaleiro Amaldiçoado · Elemental de Fogo · Metalúnculo ·
Operário Enlouquecido · Eco Errante · Guardião de Pedra · Magus Errático

### 3.2 MiniBosses — pool solto na planilha (30 nomes), **sem grupo por tema confiável só pela planilha**
Coveiro Profano · Ceifador · Mago Negro · Xamã Antigo · Lobo Espectral · Predador Ancestral ·
Lorde Glacial · Gárgula de Gelo · Urso de Cristal · Titã de Magma · Behemoth ·
Leviatã Vulcânico · Bibliotecário Louco · Escriba Herege · Guardião dos Segredos ·
Predador do Subsolo · Gárgula de Minério · Colosso de Pedra · Xamã do Pântano ·
Bruxa da Decomposição · Devorador do Pântano · Sacerdote das Trevas · Entidade das Trevas ·
Sentinela do Abismo · Mestre Ferreiro · Centurião Metálico · Arcanista de Ferros ·
Senhor do Eco · Mestre das Runas · Sentinela Temporal

**Correção desta revisão:** a hipótese inicial de "3 minibosses fixos por tema, na ordem da
planilha" não se sustentou — conferindo linha a linha, só o **1º** miniboss de cada linha
alinha com o tema/boss daquela linha; os outros 20 são uma lista solta sem tema indicado pela
planilha. A tabela 3.3 abaixo usa a fonte real e completa (ver nota).

### 3.3 As 10 masmorras completas — fonte real: `JogoRPG/masmorra/masmorra.js:56-215` (`DUNGEON_TEMPLATES`)

**Descoberta desta revisão:** o console original (`JogoRPG/`) já tem a estrutura **completa**
de cada masmorra — mobs, os 3 minibosses certos, boss, tema, dificuldade e até os parâmetros
de geração (`trapChance`, `secretChance`, `treasureMultiplier`) — nunca totalmente portada para
`engine/masmorra/gerador.js` (que hoje usa nomes genéricos e recicla bosses da Torre). Esta é
a fonte a usar ao portar `scripts/engine/masmorra/gerador.gd` no Godot, **não** a planilha
isolada nem o `engine/` atual. Only 3 nomes de boss foram atualizados por decisão do usuário
(2026-07-17, ver linha "Boss final" marcada abaixo) para bater com a revisão mais recente da
planilha.

| # | Nome / Tema | Dificuldade | Mobs | Minibosses | Boss final | trap% | secret% | tesouro× |
|---|---|---|---|---|---|---|---|---|
| 0 | Catacumbas Sombras (cripta) | 1 | Esqueleto Errante, Zumbi Corrompido, Rato Gigante, Espectro Sombrio | Coveiro Errante, Ceifador, Mago Negro | Kaelthos, Mestre das Catacumbas (Necromancia) | 20 | 18 | 1.1 |
| 1 | Ruínas da Floresta (floresta) | 2 | Lobo Selvagem, Aranha Venenosa, Bandido da Selva | Feiticeiro das Asas Negras, Lobo Espectral, Ent Enraizado | Verdanth, Guardião Primordial da Selva (Raízes Presas) | 12 | 22 | 1.0 |
| 2 | Caverna do Gelo (gelo) | 5 | Guerreiro Congelado, Harpia Gelada, Caranguejo de Cristal | Lorde Glacial, Górgula de Gelo, Urso de Cristal | Aurlion, o Dragão Glacial (Sopro Glaciar) | 10 | 15 | 1.2 |
| 3 | Fornalha Infernal (fogo) | 5 | Lacaio de Fogo, Golem de Lava, Escorpião Flamejante | Forjador Ardente, Senhor das Brasas, Ancião de Magma | Ignarok, Senhor das Chamas Eternas (Erupção Infernal) | 25 | 10 | 1.4 |
| 4 | Biblioteca Antiga (arcano) | 3 | Acólito Corrompido, Livro Animado, Gárgula de Pedra | Bibliotecário Louco, Escriba Profano, Ancião Arcano | Thal'Mor, Guardião dos Segredos Proibidos (Feitiços Antigos) | 8 | 30 | 1.3 |
| 5 | Mina Abandonada (mina) | 2 | Rato do Subsolo, Bandido Mineiro, Autômato Danificado | Capataz Caído, Gárgula de Minério, Homem de Pedra das Minas | **Dolgarth, o Golem das Profundezas** (Impacto Sísmico) — nome atualizado 2026-07-17, era "Golem Minerador, Sentinela das Profundezas" | 18 | 14 | 1.0 |
| 6 | Pântano Putrefato (pântano) | 3 | Répteis do Lodo, Híbrido Putrefato, Mosca Gigante | Xamã Venenoso, Feiticeira do Brejo, Monstro da Lama | Morghul, o Decompositor (Praga da Corrupção) | 22 | 16 | 0.9 |
| 7 | Templo das Sombras (templo) | 7 | Sentinela Obscura, Acólito Maldito, Neófito Sombrio | Sacerdote Negro, Arauto das Trevas, Sentinela Eterna | **Vel'Thyra, Soberana das Trevas** — nome atualizado 2026-07-17, era "Sombra Suprema, Guardiã das Trevas" (poder: Lâmina Etérea) | 20 | 18 | 1.2 |
| 8 | Forja Elemental (forja) | 5 | Faísca Viva, Metalúnculo, Operário Enlouquecido | Mestre Ferreiro, Centurião Metálico, Arcanista de Ferros | Forjador Elemental, Senhor do Martelo (Martelo Incandescente) | 15 | 12 | 1.5 |
| 9 | Torre dos Ecos (torre) | 10 | Eco Errante, Guardião de Pedra, Magus Errático | Senhor do Eco, Mestre das Runas, Sentinela Temporal | **Zerakth, Guardião do Fluxo Temporal** — nome atualizado 2026-07-17, era "Lorde do Tempo, Mestre das Areias" (poder: Ruptura Temporal) | 14 | 20 | 1.6 |

Nomes das seções 3.1/3.2 acima (bestiário solto da planilha) que **não aparecem** nesta tabela
ficam como pool adicional de conteúdo (mundo aberto/variações), não como parte fixa de uma
masmorra específica.

### 3.4 Especiais (3 — modo Arena, listado dentro da seção Masmorra na planilha)
Ambiente Ondas · Arena Infinita · Loja Arena Infinita

---

## 4. Missão

### 4.1 Parte Visual (4)
Pergaminhos · Recompensas · Missão Falhada/Sucesso · Penalidade

### 4.2 Armaduras/Armas — ícones genéricos de recompensa por raridade (18 = 6 slots × 3 tiers)
Elmo 1/2/3 · Peitoral 1/2/3 · Calça 1/2/3 · Bota 1/2/3 · Manopla 1/2/3 · Arma 1/2/3

---

## 5. Torre / Castelo Final

### 5.1 Ambiente genérico (1)
AmbienteTorre (um único cenário de fundo para toda a Torre/Castelo, não um por boss)

### 5.2 Os 10 bosses (idênticos, em ordem, à sala e ao boss — já existem em `engine/torre/bosses.js`)
Guardião de Pedra · Sentinela de Ferro · Mago Sombrio · Lobo Alfa · Cavaleiro Sombrio ·
Hidra das Sombras · Golem Titânico · Senhor dos Mortos · Dragão Negro · Lorde do Caos

---

## 6. Personagens

### 6.1 Raças (7)
Anão · Elfo · Humano · Morto-Vivo · Orc · Bestial · Dragonoide

### 6.2 Classes (6)
Arqueiro · Paladino · Assassino · Bárbaro · Necromante · Xamã

---

## 7. Telas de UI (7)
Tela de Save · Tela de Derrota · Animação de Descansar · Menu de Configuração ·
Inventário · Sistema de Loja · Aba de Status

---

## 8. Divergências com `engine/` — decisão pendente do usuário

Comparado módulo a módulo com o motor JS existente (fonte: leitura direta de `engine/`):

| Item | Já existe em `engine/` | O que a planilha pede | Decisão necessária |
|---|---|---|---|
| **Bosses da Torre/Castelo** | 10 nomes em `engine/torre/bosses.js`, na mesma ordem | Idêntico (seção 5.2 acima) | Nenhuma — **confirmado igual**, só falta arte. |
| **Raças** | 7 em `engine/personagem/racas.js` (`Dragonoide`, `Morto-vivo`) | 7 na planilha (`Bragonoide`, `Morto-Vivo`) | Provável erro de digitação na planilha — **assumir os nomes do `engine/` como corretos** ao portar, salvo confirmação em contrário. |
| **Classes** | 6 em `engine/personagem/classes.js` | 6 idênticas | Nenhuma — confirmado igual. |
| **Masmorras — temas, mobs, minibosses, bosses e parâmetros de geração** | `engine/masmorra/gerador.js` (porte web) tem 10 templates simplificados, com nomes genéricos e bosses reciclados da Torre | Fonte real e completa já existe em `JogoRPG/masmorra/masmorra.js:56-215` (`DUNGEON_TEMPLATES`), nunca totalmente portada; 3 nomes de boss atualizados por decisão do usuário para bater com a revisão mais recente da planilha (ver tabela completa na seção 3.3) | ✅ **Resolvido (2026-07-17).** `scripts/engine/masmorra/gerador.gd` porta a estrutura de `JogoRPG/masmorra/masmorra.js`, não a versão simplificada de `engine/`. Tabela definitiva: seção 3.3 acima. |
| **Bestiário "Explorar" (mundo aberto)** | `engine/mundo/monstrosSelvagens.js` gera inimigos selvagens de forma procedural/genérica, sem uma lista fixa de 10 monstros + 15 minibosses nomeados | Lista fixa de nomes (seção 1) | Definir se o mundo aberto passa a sortear **entre esses nomes fixos** (mais consistente com o resto do bestiário nomeado) ou continua puramente procedural. |
| **Telas de UI faltantes** | Save/load, derrota, config, inventário e loja já existem **funcionalmente** no `WebRPG/` (a versão a ser descartada) — a lógica de motor (não a UI) já existe em `engine/save`, `engine/loja`, etc. | Lista pede a **arte/cena** dessas 7 telas (seção 7) | Sem divergência de conteúdo — é literalmente o trabalho de UI já previsto nas Fases 3/5 do plano Godot; "Animação Descansar" é a única tela sem equivalente funcional prévio (nem no `WebRPG/`, nem no `JogoRPG/` — checar se é uma mecânica nova de descanso/regeneração fora de batalha, a esclarecer com o usuário). |

**Recomendação:** resolver a linha "Masmorras — temas e bosses" (a única divergência de
conteúdo real, não só de arte) **antes de iniciar a Fase 1** do plano Godot, já que ela decide
os nomes que vão para dentro do motor portado (`scripts/engine/masmorra/gerador.gd`) e para os
testes GUT correspondentes.
