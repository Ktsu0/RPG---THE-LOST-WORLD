import { caminhoAsset } from "../caminhos.js";
import { listarEspeciesSelvagens } from "@engine/mundo/monstrosSelvagens.js";
import { carregarSpriteJogador, criarSpriteJogador, criarControlesJogador, moverJogadorComTeclado } from "./jogadorMundo.js";

const TILE = 16;
const COLUNAS = 22;
const LINHAS = 16;
const VELOCIDADE_JOGADOR = 90;
const VELOCIDADE_MONSTRO = 28;

// Traçado fixo da zona de exploração: bordas são obstáculo, a lagoa central
// (também obstáculo, só decorativa) e o resto é grama caminhável.
const OBSTACULOS_FIXOS = (() => {
  const celulas = [];
  for (let x = 0; x < COLUNAS; x++) {
    celulas.push([x, 0], [x, LINHAS - 1]);
  }
  for (let y = 0; y < LINHAS; y++) {
    celulas.push([0, y], [COLUNAS - 1, y]);
  }
  return celulas;
})();

const LAGOA = [
  [10, 6], [11, 6], [12, 6],
  [10, 7], [11, 7], [12, 7],
  [10, 8], [11, 8], [12, 8],
];

// O import de "phaser" é dinâmico (não no topo do arquivo) porque só é seguro
// em navegador de verdade — o pacote sonda `canvas.getContext('2d')` assim que
// é carregado, e isso derruba a suíte de testes inteira sob jsdom (que não
// implementa contexto 2d de canvas). Como nenhum teste hoje entra nesta tela,
// adiar o import evita quebrar WebRPG/src/main.test.js sem precisar de um
// polyfill de canvas.
export function montarFaseExploracao(container, { jogador, aoEncontrarMonstro }) {
  const especies = listarEspeciesSelvagens();

  let jogo = null;
  let cancelado = false;

  import("phaser")
    .then(({ default: Phaser }) => {
      if (cancelado) return;
      jogo = criarJogo(Phaser);
    })
    // Sob jsdom (suíte de testes) o Phaser sonda canvas.getContext('2d') ao
    // carregar e isso rejeita a promise — não há navegador de verdade ali
    // para desenhar mesmo, então não há nada a fazer além de não derrubar a
    // suíte com uma unhandled rejection.
    .catch(() => {});

  function criarJogo(Phaser) {
    class CenaExploracao extends Phaser.Scene {
      preload() {
        this.frameJogador = carregarSpriteJogador(this, jogador);
        this.load.image("tile-grama", caminhoAsset("assets/cenarios/mundo/grama.png"));
        this.load.image("tile-agua", caminhoAsset("assets/cenarios/rpg-urban-pack/Tiles/tile_0172.png"));
        this.load.image("tile-obstaculo", caminhoAsset("assets/cenarios/cidade/parede.png"));
        for (const especie of especies) {
          this.load.image(`monstro-${especie.id}`, caminhoAsset(`assets/personagens/${especie.id}/idle.png`));
        }
      }

      create() {
        this.physics.world.setBounds(0, 0, COLUNAS * TILE, LINHAS * TILE);
        this.cameras.main.setBounds(0, 0, COLUNAS * TILE, LINHAS * TILE);
        this.cameras.main.setBackgroundColor("#14121a");

        for (let y = 0; y < LINHAS; y++) {
          for (let x = 0; x < COLUNAS; x++) {
            this.add.image(x * TILE, y * TILE, "tile-grama").setOrigin(0);
          }
        }

        const obstaculos = this.physics.add.staticGroup();
        for (const [x, y] of OBSTACULOS_FIXOS) {
          obstaculos.add(this.add.image(x * TILE, y * TILE, "tile-obstaculo").setOrigin(0));
        }
        for (const [x, y] of LAGOA) {
          obstaculos.add(this.add.image(x * TILE, y * TILE, "tile-agua").setOrigin(0));
        }
        obstaculos.getChildren().forEach((filho) => filho.body.updateFromGameObject());

        const centroX = Math.floor(COLUNAS / 2) * TILE;
        const centroY = (LINHAS - 3) * TILE;
        this.jogadorSprite = criarSpriteJogador(this, centroX, centroY, this.frameJogador);
        this.physics.add.collider(this.jogadorSprite, obstaculos);

        this.monstrosGrupo = this.physics.add.group();
        const posicoesMonstros = [
          [4, 4], [18, 4], [4, 12], [18, 12], [6, 9], [16, 9],
        ];
        posicoesMonstros.forEach(([x, y], indice) => {
          const especie = especies[indice % especies.length];
          const monstro = this.physics.add.image(x * TILE, y * TILE, `monstro-${especie.id}`, undefined);
          monstro.setCrop(0, 0, monstro.height, monstro.height);
          monstro.body.setSize(monstro.height, monstro.height);
          monstro.setScale((TILE * 2.2) / monstro.height);
          monstro.especieId = especie.id;
          monstro.setCollideWorldBounds(true);
          monstro.setBounce(1, 1);
          this.monstrosGrupo.add(monstro);
          this.escolherNovaDirecao(monstro);
        });

        this.physics.add.collider(this.monstrosGrupo, obstaculos);
        this.physics.add.collider(this.monstrosGrupo, this.monstrosGrupo);
        this.horaDeCriacao = this.time.now;
        this.physics.add.overlap(this.jogadorSprite, this.monstrosGrupo, (_jogadorSprite, monstro) => {
          if (this.encontroEmAndamento) return;
          // Mesma trava de segurança de faseCidade.js: ignora overlap nos
          // primeiros instantes após montar a cena.
          if (this.time.now - this.horaDeCriacao < 400) return;
          this.encontroEmAndamento = true;
          monstro.destroy();
          aoEncontrarMonstro(monstro.especieId);
        });

        this.time.addEvent({
          delay: 2200,
          loop: true,
          callback: () => {
            this.monstrosGrupo.getChildren().forEach((monstro) => this.escolherNovaDirecao(monstro));
          },
        });

        this.cameras.main.startFollow(this.jogadorSprite, true, 0.15, 0.15);
        this.controles = criarControlesJogador(this);
      }

      escolherNovaDirecao(monstro) {
        const direcoes = [
          [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
        ];
        const [dx, dy] = direcoes[Math.floor(Math.random() * direcoes.length)];
        monstro.setVelocity(dx * VELOCIDADE_MONSTRO, dy * VELOCIDADE_MONSTRO);
      }

      update() {
        if (this.encontroEmAndamento) {
          this.jogadorSprite.setVelocity(0, 0);
          return;
        }
        moverJogadorComTeclado(this.jogadorSprite, this.controles, VELOCIDADE_JOGADOR);
      }
    }

    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: COLUNAS * TILE,
      height: LINHAS * TILE,
      pixelArt: true,
      physics: { default: "arcade", arcade: { debug: false } },
      scale: { zoom: 2.8 },
      scene: CenaExploracao,
    });
  }

  return {
    destruir: () => {
      cancelado = true;
      jogo?.destroy(true);
    },
  };
}
