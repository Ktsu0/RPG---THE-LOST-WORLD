// data.js agora apenas contém as configurações visuais extras necessárias para o WebRPG
// que não existem no JogoRPG original.

export const ENEMY_IMG_MAP = {
  "Goblin Ladrão":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/slime/slime-idle-1.png",
  "Lobo das Sombras":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/opossum/opossum-1.png",
  "Bandido Veterano":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/crab/crab-idle-1.png",
  "Arauto do Pântano":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/frog/frog-idle-1.png",
  "Espectro Errante":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/skeleton/skeleton-idle-1.png",
  "Elemental de Fogo":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/eagle/eagle-attack-1.png",
  "Aranha Venenosa Gigante":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/angry-pig/angry-pig-idle-1.png",
  "Cavaleiro Amaldiçoado":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/trunk/trunk-idle-1.png",
  "Gárgula de Pedra":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/bat/bat-1.png",
  Súcubo:
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/bee/bee-1.png",
};

export const HERO_SPRITE_MAP = {
  Humano:
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Characters/Hero/idle/hero-idle-1.png",
  Anão: "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Characters/Hero/crouch/hero-crouch-1.png",
  Elfo: "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Characters/Hero/jump/hero-jump-1.png",
  "Morto-vivo":
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/skeleton/skeleton-idle-1.png",
  Orc: "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/trunk/trunk-idle-1.png",
  Bestial:
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/opossum/opossum-1.png",
  Dragonoide:
    "https://raw.githubusercontent.com/ansimuz/adventure-platformer-assets/master/Enemies/eagle/eagle-attack-1.png",
};

export const CLASS_ABILITIES = {
  Arqueiro: [
    {
      name: "Agilidade Élfica",
      icon: "fa-person-running",
      desc: "+10% de Esquiva.",
    },
    {
      name: "Olho de Rapina",
      icon: "fa-bullseye",
      desc: "+10% de bônus em drop de ouro.",
    },
  ],
  Paladino: [
    {
      name: "Fé Inabalável",
      icon: "fa-shield-halved",
      desc: "+10% de chance de bloquear ataques.",
    },
    {
      name: "Golpe Sagrado",
      icon: "fa-sun",
      desc: "+10% de chance de acerto crítico.",
    },
  ],
  Assassino: [
    {
      name: "Lâmina Tóxica",
      icon: "fa-skull-crossbones",
      desc: "Ataques podem causar Sangramento.",
    },
    {
      name: "Mãos Leves",
      icon: "fa-hand-holding-dollar",
      desc: "+10% de chance de encontrar itens.",
    },
  ],
  Bárbaro: [
    {
      name: "Fúria Primal",
      icon: "fa-fire",
      desc: "Aumenta o ataque massivamente quando o HP está baixo.",
    },
    { name: "Pele de Ferro", icon: "fa-shield-heart", desc: "+8 de ATK base." },
  ],
  Necromante: [
    {
      name: "Exército de Ossos",
      icon: "fa-skull",
      desc: "Invoca um esqueleto para lutar ao seu lado.",
    },
    {
      name: "Toque Sombrio",
      icon: "fa-hand-dots",
      desc: "+5 de ATK base mágico.",
    },
  ],
  Xamã: [
    {
      name: "Comunhão Espiritual",
      icon: "fa-leaf",
      desc: "Recupera 5% do HP máximo a cada turno.",
    },
    { name: "Vento Veloz", icon: "fa-wind", desc: "+15% de Esquiva." },
  ],
};
