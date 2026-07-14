# WebRPG — Controle de Fases

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
| 10 — Combate Completo & Masmorras Selecionáveis | Ações Item/Defender no motor e na UI, poção finalmente utilizável, ícones de status com tooltip, seletor dos 10 temas de masmorra | [2026-07-11-webrpg-fase10-combate-completo.md](./plans/2026-07-11-webrpg-fase10-combate-completo.md) | ❌ Planejada |
| 11 — Save Completo & Lançamento | Importar save (UI + save corrompido não trava), build de produção íntegro, deploy GitHub Pages, checklist final — encerra a spec | [2026-07-11-webrpg-fase11-save-lancamento.md](./plans/2026-07-11-webrpg-fase11-save-lancamento.md) | ❌ Planejada |
| 12 — Amuleto, Talismã & Portão da Torre | Craftar/equipar o Amuleto Supremo, craftar o Talismã da Torre, a Torre passa a exigir e consumir o Talismã, vitória final ao vencer o 10º boss, level up deixa de ser invisível (e passa a funcionar na masmorra) | [2026-07-14-webrpg-fase12-amuleto-talisma-torre.md](./plans/2026-07-14-webrpg-fase12-amuleto-talisma-torre.md) | ❌ Planejada |
| 13 — Loot Real, Masmorra Viva & Heróis com Rosto Próprio | Salas de armadilha/tesouro/segredo funcionais, monstros/bosses/minibosses passam a dropar item (e os bônus de classe dropOuro/dropItem finalmente funcionam), sprite do herói varia por classe, Néctar da Vida Eterna e relíquias de masmorra | [2026-07-14-webrpg-fase13-loot-masmorra-heroi.md](./plans/2026-07-14-webrpg-fase13-loot-masmorra-heroi.md) | ❌ Planejada |

**Critério de pronto de cada fase:** ver a coluna "Critério de pronto" da tabela na spec (seção 6).
Marcar ✅ só quando a verificação manual descrita no respectivo plano tiver sido feita.
