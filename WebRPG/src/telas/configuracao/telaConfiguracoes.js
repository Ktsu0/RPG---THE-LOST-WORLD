import { obterVolumeEfeitos, definirVolumeEfeitos } from "@audio/tocador.js";
import { obterVolumeMusica, definirVolumeMusica } from "@audio/musica.js";
import { exportarSave, importarSave, salvarNoNavegador } from "../../armazenamento/localStorage.js";

export function montarTelaConfiguracoes(container, { jogador, aoSair, aoImportar }) {
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
        <label class="botao" for="input-importar-save">Importar Save</label>
        <input type="file" id="input-importar-save" accept="application/json" hidden />
        <p class="erro-importacao" role="alert"></p>
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

  const erroImportacao = container.querySelector(".erro-importacao");

  function processarTextoImportado(texto) {
    const { valido, jogador: jogadorImportado, erro } = importarSave(texto);
    if (!valido) {
      erroImportacao.textContent = `Save inválido: ${erro ?? "arquivo não reconhecido"}. Nada foi alterado.`;
      return;
    }
    salvarNoNavegador(jogadorImportado);
    aoImportar(jogadorImportado);
  }

  container.querySelector("#input-importar-save").addEventListener("change", (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => processarTextoImportado(String(leitor.result));
    leitor.readAsText(arquivo);
  });

  const botaoSair = container.querySelector("#botao-sair-configuracao");
  botaoSair.addEventListener("click", () => aoSair());

  return { botaoSair, processarTextoImportado };
}
