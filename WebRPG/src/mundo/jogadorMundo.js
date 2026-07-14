import { caminhoAsset } from "../caminhos.js";

const CLASSES_ARCANAS = new Set(["Necromante", "Xamã"]);

// Igual a WebRPG/src/telas/criacao/telaCriacao.js — só há sprite de herói pronto
// para guerreiro (soldado) e conjurador (mago), ver CREDITS.md.
export function spriteDoJogador(jogador) {
  return CLASSES_ARCANAS.has(jogador.classe) ? "mago" : "soldado";
}

export function tamanhoFrameIdle(nomeSprite) {
  return nomeSprite === "mago" ? 150 : 100;
}

export function carregarSpriteJogador(scene, jogador) {
  const nomeSprite = spriteDoJogador(jogador);
  const frame = tamanhoFrameIdle(nomeSprite);
  scene.load.spritesheet("sprite-jogador", caminhoAsset(`assets/personagens/${nomeSprite}/idle.png`), {
    frameWidth: frame,
    frameHeight: frame,
  });
  return frame;
}

export function criarSpriteJogador(scene, x, y, frame) {
  const sprite = scene.physics.add.sprite(x, y, "sprite-jogador", 0);
  sprite.setCollideWorldBounds(true);
  // Corpo de colisão só na área dos pés (não o frame inteiro) — com a folha de
  // sprite tendo tanta margem transparente ao redor do personagem, um corpo
  // maior que isso faz a "hitbox" ultrapassar bem além do desenho visível.
  // Isso já causou um bug real: com a escala maior, a hitbox chegava a
  // sobrepor o hotspot "Explorar" da cidade logo no ponto de partida, abrindo
  // o mundo aberto sozinho sem o jogador andar um passo sequer.
  sprite.body.setSize(frame * 0.4, frame * 0.2);
  sprite.body.setOffset(frame * 0.3, frame * 0.58);
  sprite.setScale(0.6);

  scene.anims.create({
    key: "jogador-idle-anim",
    frames: scene.anims.generateFrameNumbers("sprite-jogador", { start: 0, end: frame === 150 ? 7 : 5 }),
    frameRate: 6,
    repeat: -1,
  });
  sprite.play("jogador-idle-anim");

  return sprite;
}

export function criarControlesJogador(scene) {
  return {
    teclas: scene.input.keyboard.createCursorKeys(),
    teclasWasd: scene.input.keyboard.addKeys("W,A,S,D"),
  };
}

export function moverJogadorComTeclado(sprite, { teclas, teclasWasd }, velocidade) {
  const esquerda = teclas.left.isDown || teclasWasd.A.isDown;
  const direita = teclas.right.isDown || teclasWasd.D.isDown;
  const cima = teclas.up.isDown || teclasWasd.W.isDown;
  const baixo = teclas.down.isDown || teclasWasd.S.isDown;

  let vx = 0;
  let vy = 0;
  if (esquerda) vx -= velocidade;
  if (direita) vx += velocidade;
  if (cima) vy -= velocidade;
  if (baixo) vy += velocidade;

  if (vx !== 0 && vy !== 0) {
    const fator = Math.SQRT1_2;
    vx *= fator;
    vy *= fator;
  }

  sprite.setVelocity(vx, vy);
  if (vx < 0) sprite.setFlipX(true);
  else if (vx > 0) sprite.setFlipX(false);
}
