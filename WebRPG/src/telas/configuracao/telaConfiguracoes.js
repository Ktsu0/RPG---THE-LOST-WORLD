import { obterVolumeEfeitos, definirVolumeEfeitos } from "@audio/tocador.js";
import { obterVolumeMusica, definirVolumeMusica } from "@audio/musica.js";
import { exportarSave } from "../../armazenamento/localStorage.js";

export function montarTelaConfiguracoes(container, { jogador, aoSair }) {
  container.innerHTML = `
    <div class="tela-configuracao">
      <div class="painel">
        <label>Volume dos Efeitos</label>
        <input type="range" min="0" max="1" step="0.1" data-volume="efeitos" value="${obterVolumeEfeitos()}" />
        <label>Volume da Música</label>
        <input type="range" min="0" max="1" step="0.1" data-volume="musica" value="${obterVolumeMusica()}" />
      </div>
      <div class="painel">
        <button class="botao" id="botao-exportar-save">Exportar Save</button>
      </div>
      <button class="botao botao--destaque" id="botao-sair-configuracao">Voltar</button>
    </div>
  `;

  container.querySelector('[data-volume="efeitos"]').addEventListener("input", (evento) => {
    definirVolumeEfeitos(Number(evento.target.value));
  });

  container.querySelector('[data-volume="musica"]').addEventListener("input", (evento) => {
    definirVolumeMusica(Number(evento.target.value));
  });

  container.querySelector("#botao-exportar-save").addEventListener("click", () => {
    exportarSave(jogador);
  });

  const botaoSair = container.querySelector("#botao-sair-configuracao");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair };
}
