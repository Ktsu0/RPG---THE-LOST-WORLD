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

- **Monsters Creatures Fantasy** (LuizMelo)
  Local original: `WebRPG/assets/personagens/_pacote-luizmelo-base/` (o add-on de ataque "v1.3" baixado à parte não foi mantido — o pacote base já tinha os 4 estados de animação completos para os 4 arquétipos usados).
  Organizado em: `WebRPG/assets/personagens/goblin/`, `cogumelo/`, `esqueleto/`, `olho-voador/` (idle, ataque, dano, morte cada).
  Fonte: https://luizmelo.itch.io/monsters-creatures-fantasy
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório).
  Nota técnica: a contagem de frames de idle/ataque desse pacote (4/8) difere da convenção soldado/orc (6/6) — `WebRPG/src/telas/batalha/sprites.js` ganhou uma tabela de exceção por personagem para isso.

- **Evil Wizard** (LuizMelo) — Fase 8
  Organizado em: `WebRPG/assets/personagens/mago/` (idle, ataque, dano [Take Hit], morte).
  Fonte: https://luizmelo.itch.io/evil-wizard
  Licença: Creative Commons CC0 1.0 ("This package can be used freely and commercially - CC0(creative commons zero)").
  Nota técnica: frames reais (idle:8, ataque:8, dano:4, morte:8) diferem do padrão soldado/orc — exceção em `sprites.js`.
  Usado para: Mago Sombrio.

- **Fire Worm** (LuizMelo) — Fase 8
  Organizado em: `WebRPG/assets/personagens/elemental-fogo/` (idle, ataque, dano [Get Hit], morte — pasta `Worm/` do pacote; a pasta `Fire Ball/` do mesmo pacote não foi usada).
  Fonte: https://luizmelo.itch.io/fire-worm
  Licença: Creative Commons CC0 1.0 ("Credits are not required but I would appreciate it").
  Nota técnica: frames reais (idle:9, ataque:16, dano:3, morte:8) diferem do padrão soldado/orc — exceção em `sprites.js`.
  Usado para: Salamandra de Fogo, Escorpião de Magma, Senhor das Chamas.

- **FREE Enemy: Golem** (Admurin) — Fase 8
  Organizado em: `WebRPG/assets/personagens/golem-pedra/` (variante "A" de cada animação: IdleA→idle, AttackA→ataque, HitA→dano, DeathA→morte; variantes "B" e os arquivos `_FX`/`Upgrade`/`Run`/`Reset`/`Full` do pacote não foram usados).
  Fonte: https://admurin.itch.io/enemy-golem
  Licença: "name your own price" (gratuito), uso comercial e não-comercial permitido; proibida revenda/redistribuição do asset em si, uso para treinar IA, ou uso em NFT. Crédito apreciado, não obrigatório. (Licença mais restrita que CC0 puro — registrado aqui com precisão em vez de rotulado CC0.)
  Nota técnica: frames reais (idle:4, ataque:12, dano:5, morte:9) diferem do padrão soldado/orc — exceção em `sprites.js`.
  Usado para: Guardião de Pedra, Sentinela de Ferro.

- **Skull Wolf Pixel Art** (Atari Boy) — Fase 8
  Organizado em: `WebRPG/assets/personagens/lobo/` (recortado de uma única spritesheet "Massacre Sprite Sheet.png" com 4 linhas de 64px — linha 1 idle, linha 2 ataque, linha 3 dano, linha 4 morte — usando `sharp` para o recorte, mesma técnica já usada na Fase 7 para os tiles da masmorra).
  Fonte: https://atari-boy.itch.io/skull-wolf-pixel-art
  Licença: Creative Commons CC0 1.0 ("You can use this asset for personal and commercial purpose... Credit is not required").
  Nota técnica: frames reais (idle:6, ataque:5, dano:4, morte:8) — só ataque e morte divergem do padrão soldado/orc — exceção em `sprites.js`.
  Usado para: Lobo Alfa.

  **Cobertura do bestiário** (mapeamento completo em `WebRPG/src/telas/batalha/mapaSprites.js`): dos 25 nomes de inimigo do jogo, só **Hidra das Sombras** e **Dragão Negro** ainda caem no fallback "orc" — nenhum pack de dragão gratuito com licença clara e as 4 animações completas (idle/ataque/dano/morte) foi encontrado na busca da Fase 8 (os candidatos encontrados eram pagos, só tinham animação idle, ou tinham preço mínimo maior que zero). Pendência de conteúdo registrada para uma fase futura.

- **Roguelike/RPG Pack** (Kenney)
  Local original: `WebRPG/assets/cenarios/roguelike-rpg-pack/`
  Organizado em: `WebRPG/assets/cenarios/masmorra/` (chao.png = piso de interior recortado da spritesheet; oculta.png reusa o mesmo tile, escurecido via `filter: brightness(0.35)` em masmorra.css em vez de um segundo recorte — mais simples e com o mesmo resultado visual: "mesmo piso, mais escuro" para representar névoa de guerra).
  Fonte: https://kenney.nl/assets/roguelike-rpg-pack
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório mas incentivado).

- **Pixel UI Pack** (Kenney)
  Local original: `WebRPG/assets/ui/pixel-ui-pack/`
  Organizado em: `WebRPG/assets/ui/base/` (painel.png = 9-Slice/Outline/blue.png, botao.png = 9-Slice/Outline/yellow.png) — usado como `border-image` em `.painel` e `.botao` (paineis.css).
  Fonte: https://kenney.nl/assets/pixel-ui-pack
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório mas incentivado).

- **Kenney Impact Sounds + RPG Audio + Music Jingles**
  Locais originais: `WebRPG/assets/audio/_pacote-kenney-impact-sounds/`, `_pacote-kenney-rpg-audio/`, `_pacote-kenney-music-jingles/`.
  Organizado em: `WebRPG/assets/audio/efeitos/` (golpe.ogg = impactPunch_medium_000, critico.ogg = impactMetal_heavy_000, moeda.ogg = handleCoins) e `WebRPG/assets/audio/musica/` (cidade.ogg = Pizzicato jingles/jingles_PIZZI00, batalha.ogg = Steel jingles/jingles_STEEL00).
  Fontes: https://kenney.nl/assets/impact-sounds, https://kenney.nl/assets/rpg-audio, https://kenney.nl/assets/music-jingles
  Licença: Creative Commons CC0 1.0 (domínio público, uso comercial permitido, crédito não obrigatório mas incentivado).
  `WebRPG/src/audio/tocador.js` e `musica.js` tiveram a extensão trocada de `.mp3` (nunca existiu) para `.ogg` (formato real dos pacotes Kenney).
  Limitação conhecida: o pack de música (`music-jingles`) só tem jingles curtos (stingers de poucos segundos), não faixas ambiente longas — `cidade.ogg`/`batalha.ogg` tocam em loop uma jingle curta em vez de uma música de fundo propriamente dita. Substituir por faixas mais longas fica como pendência de conteúdo futura.

## A baixar manualmente (checklist)

Estes packs ainda não estão no repositório. Cada um precisa ser baixado manualmente (geralmente um `.zip` do itch.io), extraído, e ter os arquivos usados copiados para a subpasta indicada — mantendo este arquivo atualizado com o nome exato do pack e a licença declarada pelo autor.

- [ ] **Cenários de fundo (parallax)** — perfil do criador ansimuz no itch.io (`https://ansimuz.itch.io/`): buscar pacotes de "platformer/adventure background". Destino: `WebRPG/assets/cenarios/`.
- [ ] **Ícones de itens em pixel art** — buscar packs de ícones de RPG no itch.io ou OpenGameArt.org. Destino: `WebRPG/assets/ui/icones/`.
- [ ] **Música ambiente de verdade (loops longos)** — o pack usado atualmente (`music-jingles`) só tem jingles curtos; buscar um pack Kenney/itch.io com faixas de vários minutos para substituir `WebRPG/assets/audio/musica/cidade.ogg` e `batalha.ogg`.

Ao baixar um pack, adicione uma entrada acima com: nome exato do pack, autor, URL da página específica do pack, e a licença declarada.
