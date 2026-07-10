import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import "./estilos/batalha.css";
import "./estilos/criacao.css";
import "./estilos/cidade.css";
import "./estilos/loja.css";
import "./estilos/personagem.css";
import "./estilos/guilda.css";
import "./estilos/torre.css";
import "./estilos/masmorra.css";
import "./estilos/arena.css";
import "./estilos/configuracao.css";
import { inicializarRoteador, registrarTela, mostrarTela } from "./rotas/roteador.js";
import { montarTelaCriacao } from "./telas/criacao/telaCriacao.js";
import { montarTelaCidade } from "./telas/cidade/telaCidade.js";
import { iniciarBatalha } from "./telas/batalha/controladorBatalha.js";
import { montarTelaLoja } from "./telas/loja/telaLoja.js";
import { montarTelaPersonagem } from "./telas/personagem/telaPersonagem.js";
import { montarTelaGuilda } from "./telas/guilda/telaGuilda.js";
import { montarTelaTorre } from "./telas/torre/telaTorre.js";
import { montarTelaMasmorra } from "./telas/masmorra/telaMasmorra.js";
import { montarTelaArena } from "./telas/arena/telaArena.js";
import { montarTelaConfiguracoes } from "./telas/configuracao/telaConfiguracoes.js";
import { tocarMusica } from "@audio/musica.js";
import { criarInimigoTreino } from "@engine/geradores/inimigoTreino.js";
import { checarLevelUp } from "@engine/personagem/experiencia.js";
import { salvarNoNavegador, carregarDoNavegador, existeSaveNoNavegador } from "./armazenamento/localStorage.js";

export function bootstrap(container) {
  inicializarRoteador(container);

  function irParaCidade(jogador) {
    tocarMusica("cidade");
    registrarTela("cidade", (el) =>
      montarTelaCidade(el, {
        jogador,
        aoExplorar: () => irParaBatalhaDeTreino(jogador),
        aoAbrirGuilda: () => {
          registrarTela("guilda", (el2) =>
            montarTelaGuilda(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("guilda");
        },
        aoAbrirLoja: () => {
          registrarTela("loja", (el2) =>
            montarTelaLoja(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("loja");
        },
        aoAbrirPersonagem: () => {
          registrarTela("personagem", (el2) =>
            montarTelaPersonagem(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("personagem");
        },
        aoAbrirTorre: () => {
          registrarTela("torre", (el2) =>
            montarTelaTorre(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("torre");
        },
        aoAbrirMasmorra: () => {
          registrarTela("masmorra", (el2) =>
            montarTelaMasmorra(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("masmorra");
        },
        aoAbrirArena: () => {
          registrarTela("arena", (el2) =>
            montarTelaArena(el2, { jogador, aoSair: () => { salvarNoNavegador(jogador); irParaCidade(jogador); } })
          );
          mostrarTela("arena");
        },
        aoAbrirConfiguracao: () => {
          registrarTela("configuracao", (el2) =>
            montarTelaConfiguracoes(el2, { jogador, aoSair: () => irParaCidade(jogador) })
          );
          mostrarTela("configuracao");
        },
      })
    );
    mostrarTela("cidade");
  }

  function irParaBatalhaDeTreino(jogador) {
    tocarMusica("batalha");
    registrarTela("batalha", (el) =>
      iniciarBatalha(el, jogador, criarInimigoTreino(), {
        onFim: (fim) => {
          if (fim === "vitoria") {
            checarLevelUp(jogador);
          }
          salvarNoNavegador(jogador);
          irParaCidade(jogador);
        },
      })
    );
    mostrarTela("batalha");
  }

  function iniciarCriacao() {
    registrarTela("criacao", (el) =>
      montarTelaCriacao(el, {
        aoConfirmar: (jogador) => {
          salvarNoNavegador(jogador);
          irParaCidade(jogador);
        },
      })
    );
    mostrarTela("criacao");
  }

  if (existeSaveNoNavegador()) {
    const { valido, jogador } = carregarDoNavegador();
    if (valido) {
      irParaCidade(jogador);
      return;
    }
  }
  iniciarCriacao();
}

const app = document.getElementById("app");
if (app) {
  bootstrap(app);
}
