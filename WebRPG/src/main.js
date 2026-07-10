import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/paineis.css";
import "./estilos/batalha.css";
import "./estilos/criacao.css";
import "./estilos/cidade.css";
import "./estilos/loja.css";
import "./estilos/personagem.css";
import { inicializarRoteador, registrarTela, mostrarTela } from "./rotas/roteador.js";
import { montarTelaCriacao } from "./telas/criacao/telaCriacao.js";
import { montarTelaCidade } from "./telas/cidade/telaCidade.js";
import { iniciarBatalha } from "./telas/batalha/controladorBatalha.js";
import { criarInimigoTreino } from "@engine/geradores/inimigoTreino.js";
import { checarLevelUp } from "@engine/personagem/experiencia.js";
import { salvarNoNavegador, carregarDoNavegador, existeSaveNoNavegador } from "./armazenamento/localStorage.js";

export function bootstrap(container) {
  inicializarRoteador(container);

  function irParaCidade(jogador) {
    registrarTela("cidade", (el) =>
      montarTelaCidade(el, {
        jogador,
        aoExplorar: () => irParaBatalhaDeTreino(jogador),
      })
    );
    mostrarTela("cidade");
  }

  function irParaBatalhaDeTreino(jogador) {
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
