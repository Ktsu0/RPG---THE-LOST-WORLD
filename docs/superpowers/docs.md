# GodotRPG — Controle de Fases

Checklist de progresso das fases de construção definidas em
[`specs/2026-07-17-godot-visual-design.md`](./specs/2026-07-17-godot-visual-design.md) (seção 6).
Decisão de 2026-07-17: a camada visual do jogo migra de `WebRPG/` (Vite/Phaser, ver seção
histórica abaixo) para um projeto Godot Engine novo, reaproveitando a lógica de `engine/` e os
assets já baixados em `WebRPG/public/assets/`. Cada fase tem um plano de implementação
detalhado em `plans/` (criado just-in-time, ao iniciar cada fase).

| Fase | Entrega | Plano | Status |
|---|---|---|---|
| 0 — Fundação Godot | Projeto Godot (`game/`), assets migrados, estrutura de pastas, tela de Título; `WebRPG/` removido do repo | — | ✅ Concluída (2026-07-17) |
| 1 — Motor portado | `engine/` (JS) → `scripts/engine/` (GDScript) módulo por módulo, suíte GUT espelhando os 33 testes | — | ❌ Planejada |
| 2 — Batalha | Cena de batalha por turnos (Atacar/Item/Defender/Fugir), ícones de status, log, drops | — | ❌ Planejada |
| 3 — Identidade | Wizard de criação, save/load `user://`, tela de Personagem | — | ❌ Planejada |
| 4 — Mundo Aberto & Cidade | TileMap navegável, monstros vagando por distância, hotspots da cidade | — | ❌ Planejada |
| 5 — Loja, Guilda & Ferreiro | Conjuntos de arma/armadura com efeito especial, missões, forjar/melhorar artefato | — | ❌ Planejada |
| 6 — Masmorras | Grade com névoa de guerra, 10 temas, salas de armadilha/tesouro/segredo, masmorras secretas | — | ❌ Planejada |
| 7 — Castelo Final | Talismã como chave obrigatória, 10 monstros, resgate da princesa | — | ❌ Planejada |
| 8 — Bestiário & Itens Lendários | Sprites restantes, relíquias com efeito passivo | — | ❌ Planejada |
| 9 — Polimento & Áudio | Música por zona, SFX, transições, telas de vitória/derrota | — | ❌ Planejada |
| 10 — Build & Lançamento | Export Web (HTML5/WASM) no GitHub Pages, export Desktop opcional | — | ❌ Planejada |

**Critério de pronto de cada fase:** ver a coluna "Depende de"/tabela de fases na spec
(seção 6) — jogável no editor Godot até aquele ponto, com os testes GUT do motor portado até
ali passando.

**Fase 0 — verificação (2026-07-17):** projeto em `game/project.godot`, Godot 4.7.1 (Steam).
`godot --headless --path game --import` reimportou os 858 assets sem erro; execução headless
(`--quit-after 30`) saiu com código 0, sem warning/erro. Cópia de assets conferida arquivo por
arquivo contra `WebRPG/public/assets/` (zero faltando) antes de remover `WebRPG/`. Suíte de
`engine/` (33 arquivos, 252 testes) revalidada depois da limpeza de `vite.config.js`/
`vitest.setup.js`/dependências mortas — continua 100% passando.

---

# WebRPG — Controle de Fases (histórico, congelado em 2026-07-17)

**Este projeto não recebe mais fases novas** — decisão de 2026-07-17 de migrar a camada
visual para Godot Engine (ver seção acima e
[`specs/2026-07-17-godot-visual-design.md`](./specs/2026-07-17-godot-visual-design.md)). A
pasta `WebRPG/` é removida do repositório na Fase 0 do GodotRPG, depois que os assets forem
copiados. `engine/` (lógica JS pura) é mantido temporariamente como referência de porte para
GDScript. Tabela abaixo preservada como registro do que foi de fato construído e verificado.

Checklist de progresso das fases de construção definidas em
[`specs/2026-07-08-webrpg-visual-design.md`](./specs/2026-07-08-webrpg-visual-design.md) (seção 6).
Cada fase tem um plano de implementação detalhado em `plans/`.

| Fase | Entrega | Plano | Status |
|---|---|---|---|
| 0 — Fundação | Vite, `engine/`, design system CSS, roteador de telas, assets base | [2026-07-08-webrpg-fase0-fase1.md](./plans/2026-07-08-webrpg-fase0-fase1.md) | ✅ Concluída |
| 1 — Batalha | `engine/combate/` com eventos, console adaptado, tela de batalha completa | [2026-07-08-webrpg-fase0-fase1.md](./plans/2026-07-08-webrpg-fase0-fase1.md) | ✅ Concluída |
| 2 — Identidade | Wizard de criação, cidade hub, save/load localStorage, auto-save | [2026-07-09-webrpg-fase2-identidade.md](./plans/2026-07-09-webrpg-fase2-identidade.md) | ✅ Concluída |
| 3 — Economia | Missões da guilda, loja com sets, tela de personagem (equipar) | [2026-07-09-webrpg-fase3-economia.md](./plans/2026-07-09-webrpg-fase3-economia.md) | ✅ Concluída |
| 4 — Profundidade | Torre, masmorra em grade, arena infinita | [2026-07-09-webrpg-fase4-profundidade.md](./plans/2026-07-09-webrpg-fase4-profundidade.md) | ✅ Concluída |
| 5 — Polimento | Sons, música, transições, responsividade mobile, onboarding | [2026-07-09-webrpg-fase5-polimento.md](./plans/2026-07-09-webrpg-fase5-polimento.md) | ✅ Concluída (mecânica — sem os assets visuais/sonoros reais, ver Fase 6/7) |
| 6 — Fundação Visual | Conserta barra de HP/MP e fonte pixel, tela de Título, mundo em tiles (cidade navegável), cenários e UI kit reais | [2026-07-10-webrpg-fase6-fundacao-visual.md](./plans/2026-07-10-webrpg-fase6-fundacao-visual.md) | ✅ Concluída |
| 7 — Bestiário e Áudio | Sprites reais de monstros, masmorra dispara combate de verdade, boss da torre com sprite, tileset da masmorra, áudio real | [2026-07-10-webrpg-fase7-bestiario-audio.md](./plans/2026-07-10-webrpg-fase7-bestiario-audio.md) | ✅ Concluída |
| 8 — Bestiário Completo & Conteúdo de Masmorra | Cobre os 9 nomes de inimigo restantes com sprite real, adiciona os 7 templates de masmorra que faltavam, ícones de item por slot | [2026-07-11-webrpg-fase8-bestiario-completo.md](./plans/2026-07-11-webrpg-fase8-bestiario-completo.md) | ✅ Concluída (7 de 9 nomes ganharam sprite — Hidra das Sombras/Dragão Negro seguem no fallback "orc", nenhum pack de dragão gratuito com licença clara e animações completas foi encontrado) |
| 9 — Cenários Parallax & Áudio Definitivo | Cenário de fundo por local de batalha, música própria de Torre/Masmorra e faixas mais longas, revisão visual final | [2026-07-11-webrpg-fase9-cenarios-audio.md](./plans/2026-07-11-webrpg-fase9-cenarios-audio.md) | ✅ Concluída |
| 10 — Combate Completo & Masmorras Selecionáveis | Ações Item/Defender no motor e na UI, poção finalmente utilizável, ícones de status com tooltip, seletor dos 10 temas de masmorra | [2026-07-11-webrpg-fase10-combate-completo.md](./plans/2026-07-11-webrpg-fase10-combate-completo.md) | ✅ Concluída |
| 11 — Save Completo & Lançamento | Importar save (UI + save corrompido não trava), build de produção íntegro, deploy GitHub Pages, checklist final — encerra a spec | [2026-07-11-webrpg-fase11-save-lancamento.md](./plans/2026-07-11-webrpg-fase11-save-lancamento.md) | ✅ Concluída — jogo publicado em https://ktsu0.github.io/RPG---THE-LOST-WORLD/ |
| 12 — Amuleto, Talismã & Portão da Torre | Craftar/equipar o Amuleto Supremo, craftar o Talismã da Torre, a Torre passa a exigir e consumir o Talismã, vitória final ao vencer o 10º boss, level up deixa de ser invisível (e passa a funcionar na masmorra) | [2026-07-14-webrpg-fase12-amuleto-talisma-torre.md](./plans/2026-07-14-webrpg-fase12-amuleto-talisma-torre.md) | ✅ Concluída |
| 13 — Loot Real, Masmorra Viva & Heróis com Rosto Próprio | Salas de armadilha/tesouro/segredo funcionais, monstros/bosses/minibosses passam a dropar item (e os bônus de classe dropOuro/dropItem finalmente funcionam), sprite do herói varia por classe, Néctar da Vida Eterna e relíquias de masmorra | [2026-07-14-webrpg-fase13-loot-masmorra-heroi.md](./plans/2026-07-14-webrpg-fase13-loot-masmorra-heroi.md) | ❌ Planejada |
| — Mundo Vivo (fora da numeração da spec original) | Cidade e exploração reconstruídas com Phaser: mapa andável de verdade (sprite, câmera, colisão), monstros vagando pelo mundo aberto que iniciam a batalha por turnos existente, cidade virou prédios reais por hotspot | Sem plano escrito — feito ao vivo em conversa (2026-07-14) | ✅ Concluída |
| 14 — Mundo Vivo, Ferreiro & Castelo Final | Dificuldade por distância da cidade, tela de Ferreiro (forjar/melhorar artefatos com drop+coleta+recompensa), masmorras secretas por mapa raro, relíquias lendárias com efeito passivo, Castelo final com Talismã + 10 monstros + resgate da princesa | [2026-07-14-webrpg-fase14-mundo-vivo-castelo-final.md](./plans/2026-07-14-webrpg-fase14-mundo-vivo-castelo-final.md) | ❌ Planejada — depende das Fases 12 e 13 |

**Critério de pronto de cada fase:** ver a coluna "Critério de pronto" da tabela na spec (seção 6).
Marcar ✅ só quando a verificação manual descrita no respectivo plano tiver sido feita.
