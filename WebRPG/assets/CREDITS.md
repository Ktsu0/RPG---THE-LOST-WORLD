# Créditos de Assets — WebRPG

Registro de origem e licença de cada asset visual/sonoro usado no jogo. Nenhum asset é referenciado por hotlink — todos são copiados para dentro de `WebRPG/assets/`.

## Já no repositório

- **Tiny RPG Character Asset Pack v1.03 — Free Soldier & Orc**
  Local original: `WebRPG/assets/Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/`
  Organizado em: `WebRPG/assets/personagens/soldado/` (idle, ataque, dano, morte) e `WebRPG/assets/personagens/orc/` (idle, ataque, dano, morte) — concluído na Task 13.
  Uso: sprites de batalha do herói (classe base) e do inimigo Orc.
  Licença: conferir o arquivo de licença original dentro da pasta do pack antes de redistribuir o jogo publicamente.

- **RPG Urban Pack** (Kenney)
  Local original: `WebRPG/assets/cenarios/rpg-urban-pack/`
  Organizado em: `WebRPG/assets/cenarios/cidade/` (chao.png, parede.png) — usado pelo mapa de tiles da cidade.
  Fonte: https://kenney.nl/assets/rpg-urban-pack
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório mas incentivado).

- **Pixel UI Pack** (Kenney)
  Local original: `WebRPG/assets/ui/pixel-ui-pack/`
  Organizado em: `WebRPG/assets/ui/base/` (painel.png = 9-Slice/Outline/blue.png, botao.png = 9-Slice/Outline/yellow.png) — usado como `border-image` em `.painel` e `.botao` (paineis.css).
  Fonte: https://kenney.nl/assets/pixel-ui-pack
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório mas incentivado).

## A baixar manualmente (checklist)

Estes packs ainda não estão no repositório. Cada um precisa ser baixado manualmente (geralmente um `.zip` do itch.io), extraído, e ter os arquivos usados copiados para a subpasta indicada — mantendo este arquivo atualizado com o nome exato do pack e a licença declarada pelo autor.

- [ ] **Monstros adicionais** — perfil do criador LuizMelo no itch.io (`https://luizmelo.itch.io/`): buscar pacotes "Monsters Creatures Fantasy" ou similares. Destino: `WebRPG/assets/personagens/`.
- [ ] **Cenários de fundo (parallax)** — perfil do criador ansimuz no itch.io (`https://ansimuz.itch.io/`): buscar pacotes de "platformer/adventure background". Destino: `WebRPG/assets/cenarios/`.
- [ ] **Ícones de itens em pixel art** — buscar packs de ícones de RPG no itch.io ou OpenGameArt.org. Destino: `WebRPG/assets/ui/icones/`.
- [ ] **Sons (golpe, crítico, moeda, level up)** — Kenney Audio (`https://kenney.itch.io/`) ou packs de áudio RPG no itch.io. Destino: `WebRPG/assets/audio/`. Necessário apenas a partir da Fase 5 (Polimento).

Ao baixar um pack, adicione uma entrada acima com: nome exato do pack, autor, URL da página específica do pack, e a licença declarada.
