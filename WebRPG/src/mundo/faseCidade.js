import { caminhoAsset } from "../caminhos.js";
import { criarMapaCidade, POSICAO_INICIAL_CIDADE } from "@engine/mundo/mapas/cidade.js";
import { carregarSpriteJogador, criarSpriteJogador, criarControlesJogador, moverJogadorComTeclado } from "./jogadorMundo.js";

const TILE = 16;
const VELOCIDADE_JOGADOR = 80;

// Uma cor por hotspot só para dar identidade visual rápida ao prédio (não há
// arte de fachada de casas pronta nos packs já baixados — ver conversa/CREDITS.md).
// "explorar" não é prédio, é a saída da cidade — por isso o esquema diferente.
const ESQUEMA_HOTSPOT = {
  guilda: { parede: 0xb08d2f, telhado: 0x7a4a1e },
  loja: { parede: 0x3f9c58, telhado: 0x235c33 },
  personagem: { parede: 0x4a6fd6, telhado: 0x2c4494 },
  torre: { parede: 0x8a8a9a, telhado: 0x54545f },
  configuracao: { parede: 0x2fa8a8, telhado: 0x1c6868 },
  masmorra: { parede: 0x6b2b2b, telhado: 0x3d1414 },
  arena: { parede: 0xd67a2b, telhado: 0x8a4c14 },
};

function desenharPredio(scene, x, y, rotulo, cores, indiceNaLinha, larguraMapa) {
  const cx = x * TILE + TILE / 2;
  const cy = y * TILE + TILE / 2;

  scene.add.rectangle(cx, cy + 2, TILE * 1.5, TILE * 1.2, cores.parede).setStrokeStyle(2, 0x14121a);
  scene.add.triangle(
    cx, cy - TILE * 0.7,
    -TILE * 0.95, 0,
    TILE * 0.95, 0,
    0, -TILE * 0.8,
    cores.telhado
  ).setStrokeStyle(2, 0x14121a);
  scene.add.rectangle(cx, cy + TILE * 0.5, TILE * 0.4, TILE * 0.45, 0x14121a);
  // Rótulo fica ABAIXO do prédio (não acima do telhado) — a cidade tem só 7
  // linhas de grade (ver engine/mundo/mapas/cidade.js) e os prédios da linha 1
  // já ficam colados na parede do topo, sem espaço vertical pra escrever ali.
  // Prédios vizinhos ficam só 2 tiles um do outro (menos que a largura de um
  // nome como "Configuração"), então o rótulo alterna de altura conforme a
  // posição na fileira — senão os textos vizinhos colidem e viram uma sopa
  // de letras ilegível (achado ao verificar visualmente).
  // 3 alturas (não 2) — com 2, um prédio e o vizinho-do-vizinho (2 posições
  // adiante na fileira) caem na mesma altura, e o texto ancorado na borda de
  // um alcança o outro (achado ao verificar visualmente: "Configuração"
  // esticando até colidir com "Personagem").
  const ALTURAS_ROTULO = [TILE * 1.5, TILE * 2.15, TILE * 2.8];
  const alturaRotulo = ALTURAS_ROTULO[indiceNaLinha % ALTURAS_ROTULO.length];
  // Prédios bem perto da borda do mapa (Guilda/Masmorra à esquerda,
  // Configuração/Arena à direita) tinham o rótulo cortado pela borda da
  // câmera — texto centralizado em cima do prédio "vaza" pro lado de fora do
  // mundo. Ancorar o texto crescendo pra dentro só nesses casos extremos
  // resolve sem precisar aumentar os limites do mundo.
  let origemX = 0.5;
  let deslocamentoX = 0;
  if (cx < TILE * 2.5) {
    origemX = 0;
    deslocamentoX = TILE * 0.3;
  } else if (cx > larguraMapa - TILE * 2.5) {
    origemX = 1;
    deslocamentoX = -TILE * 0.3;
  }
  scene.add.text(cx + deslocamentoX, cy + alturaRotulo, rotulo, {
    fontSize: "8px",
    fontFamily: "monospace",
    color: "#e8e3f0",
    align: "center",
  }).setOrigin(origemX, 0.5);
}

function desenharSaida(scene, x, y, rotulo) {
  const cx = x * TILE + TILE / 2;
  const cy = y * TILE + TILE / 2;
  scene.add.rectangle(cx, cy, TILE * 1.5, TILE * 1.5, 0x3fae5a, 0.5).setStrokeStyle(2, 0x235c33);
  scene.add.text(cx, cy - TILE * 1.2, rotulo, {
    fontSize: "11px",
    fontFamily: "monospace",
    color: "#8be8a8",
    align: "center",
  }).setOrigin(0.5);
}

// O import de "phaser" é dinâmico — ver o mesmo comentário em faseExploracao.js
// (o pacote sonda canvas.getContext('2d') ao ser carregado e derruba jsdom).
export function montarFaseCidade(container, { jogador, aoAtivarHotspot }) {
  const grade = criarMapaCidade();

  let jogo = null;
  let cancelado = false;
  const colunas = grade[0].length;
  const linhas = grade.length;

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
    class CenaCidade extends Phaser.Scene {
      preload() {
        this.frameJogador = carregarSpriteJogador(this, jogador);
        this.load.image("tile-grama", caminhoAsset("assets/cenarios/mundo/grama.png"));
        this.load.image("tile-obstaculo", caminhoAsset("assets/cenarios/cidade/parede.png"));
      }

      create() {
        this.physics.world.setBounds(0, 0, colunas * TILE, linhas * TILE);
        this.cameras.main.setBounds(0, 0, colunas * TILE, linhas * TILE);
        this.cameras.main.setBackgroundColor("#14121a");

        for (let y = 0; y < linhas; y++) {
          for (let x = 0; x < colunas; x++) {
            this.add.image(x * TILE, y * TILE, "tile-grama").setOrigin(0);
          }
        }

        const obstaculos = this.physics.add.staticGroup();
        const hotspots = this.physics.add.staticGroup();

        for (let y = 0; y < linhas; y++) {
          for (let x = 0; x < colunas; x++) {
            const celula = grade[y][x];
            if (celula.tipo === "parede") {
              obstaculos.add(this.add.image(x * TILE, y * TILE, "tile-obstaculo").setOrigin(0));
            } else if (celula.tipo === "hotspot") {
              const { hotspot, rotulo } = celula.conteudo;
              if (hotspot === "explorar") {
                desenharSaida(this, x, y, rotulo);
              } else {
                desenharPredio(this, x, y, rotulo, ESQUEMA_HOTSPOT[hotspot], Math.floor(x / 2), colunas * TILE);
              }
              const zona = this.add.zone(x * TILE + TILE / 2, y * TILE + TILE / 2, TILE, TILE);
              this.physics.add.existing(zona, true);
              zona.hotspotId = hotspot;
              hotspots.add(zona);
            }
          }
        }
        obstaculos.getChildren().forEach((filho) => filho.body.updateFromGameObject());

        this.jogadorSprite = criarSpriteJogador(
          this,
          POSICAO_INICIAL_CIDADE.x * TILE + TILE / 2,
          POSICAO_INICIAL_CIDADE.y * TILE + TILE / 2,
          this.frameJogador
        );
        this.physics.add.collider(this.jogadorSprite, obstaculos);

        this.horaDeCriacao = this.time.now;
        this.physics.add.overlap(this.jogadorSprite, hotspots, (_jogadorSprite, zona) => {
          if (this.emTransicao) return;
          // Trava de segurança: ignora overlap nos primeiros instantes após
          // montar a cena. Sem isso, um jogador que nasce perto o bastante de
          // um hotspot (ex. "Explorar", a 2 tiles do ponto de partida) pode
          // disparar a troca de tela sozinho, por causa da hitbox do sprite,
          // sem o jogador sequer ter andado — já aconteceu de verdade ao
          // aumentar a escala do personagem nesta mesma fase.
          if (this.time.now - this.horaDeCriacao < 400) return;
          this.emTransicao = true;
          aoAtivarHotspot(zona.hotspotId);
        });

        this.cameras.main.startFollow(this.jogadorSprite, true, 0.15, 0.15);
        this.controles = criarControlesJogador(this);
      }

      update() {
        if (this.emTransicao) {
          this.jogadorSprite.setVelocity(0, 0);
          return;
        }
        moverJogadorComTeclado(this.jogadorSprite, this.controles, VELOCIDADE_JOGADOR);
      }
    }

    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: colunas * TILE,
      height: linhas * TILE,
      pixelArt: true,
      physics: { default: "arcade", arcade: { debug: false } },
      scale: { zoom: 4.6 },
      scene: CenaCidade,
    });
  }

  return {
    destruir: () => {
      cancelado = true;
      jogo?.destroy(true);
    },
  };
}
