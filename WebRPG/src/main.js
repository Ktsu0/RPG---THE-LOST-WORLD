import "@fontsource/press-start-2p/400.css";
import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import "./estilos/itens.css";
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
import "./estilos/titulo.css";
import "./estilos/mundo.css";
import "./estilos/mundoAberto.css";
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
import { montarTelaTitulo } from "./telas/titulo/telaTitulo.js";
import { montarTelaMundoAberto } from "./telas/mundoAberto/telaMundoAberto.js";
import { tocarMusica } from "@audio/musica.js";
import { criarInimigoSelvagem } from "@engine/mundo/monstrosSelvagens.js";
import { salvarNoNavegador, carregarDoNavegador, existeSaveNoNavegador } from "./armazenamento/localStorage.js";

export function bootstrap(container) {
  inicializarRoteador(container);

  function irParaCidade(jogador) {
    tocarMusica("cidade");
    registrarTela("cidade", (el) =>
      montarTelaCidade(el, {
        jogador,
        aoExplorar: () => irParaMundoAberto(jogador),
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
            montarTelaConfiguracoes(el2, {
              jogador,
              aoSair: () => irParaCidade(jogador),
              aoImportar: (jogadorImportado) => irParaCidade(jogadorImportado),
            })
          );
          mostrarTela("configuracao");
        },
      })
    );
    mostrarTela("cidade");
  }

  function irParaMundoAberto(jogador) {
    tocarMusica("cidade");
    registrarTela("mundoAberto", (el) =>
      montarTelaMundoAberto(el, {
        jogador,
        aoEncontrarMonstro: (especieId) => irParaBatalhaSelvagem(jogador, especieId),
        aoSair: () => irParaCidade(jogador),
      })
    );
    mostrarTela("mundoAberto");
  }

  function irParaBatalhaSelvagem(jogador, especieId) {
    tocarMusica("batalha");
    registrarTela("batalha", (el) =>
      iniciarBatalha(el, jogador, criarInimigoSelvagem(especieId, jogador.nivel), {
        local: "treino",
        onFim: () => {
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

  function iniciarTitulo() {
    registrarTela("titulo", (el) =>
      montarTelaTitulo(el, {
        temSave: existeSaveNoNavegador(),
        aoNovaJornada: () => iniciarCriacao(),
        aoContinuar: () => {
          const { valido, jogador } = carregarDoNavegador();
          if (valido) {
            irParaCidade(jogador);
          } else {
            // Spec seção 7: save corrompido nunca trava e oferece novo jogo OU importar backup
            registrarTela("titulo", (el2) =>
              montarTelaTitulo(el2, {
                temSave: false,
                modoSaveCorrompido: true,
                aoNovaJornada: () => iniciarCriacao(),
                aoContinuar: () => {},
                aoImportar: (jogadorImportado) => {
                  salvarNoNavegador(jogadorImportado);
                  irParaCidade(jogadorImportado);
                },
              })
            );
            mostrarTela("titulo");
          }
        },
      })
    );
    mostrarTela("titulo");
  }

  iniciarTitulo();
}

const app = document.getElementById("app");
if (app) {
  bootstrap(app);
}
