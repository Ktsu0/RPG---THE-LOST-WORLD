import { importarSave } from "../../armazenamento/localStorage.js";

export function montarTelaTitulo(container, { aoNovaJornada, aoContinuar, temSave, modoSaveCorrompido, aoImportar }) {
  container.innerHTML = `
    <div class="tela-titulo">
      <h1 class="logo-titulo">THE LOST WORLD</h1>
      ${
        modoSaveCorrompido
          ? `<p class="aviso-save-corrompido">Seu save está corrompido ou incompatível. Comece uma nova jornada ou importe um backup exportado.</p>`
          : ""
      }
      <div class="menu-titulo">
        <button class="botao botao--destaque" id="botao-nova-jornada">Nova Jornada</button>
        <button class="botao" id="botao-continuar" ${temSave ? "" : "disabled"}>Continuar</button>
        ${
          modoSaveCorrompido
            ? `<label class="botao" for="input-importar-titulo">Importar Backup</label>
               <input type="file" id="input-importar-titulo" accept="application/json" hidden />`
            : ""
        }
      </div>
    </div>
  `;

  container.querySelector("#botao-nova-jornada").addEventListener("click", () => aoNovaJornada());

  const botaoContinuar = container.querySelector("#botao-continuar");
  if (temSave) {
    botaoContinuar.addEventListener("click", () => aoContinuar());
  }

  if (modoSaveCorrompido) {
    container.querySelector("#input-importar-titulo").addEventListener("change", (evento) => {
      const arquivo = evento.target.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => {
        const { valido, jogador } = importarSave(String(leitor.result));
        if (valido) aoImportar(jogador);
      };
      leitor.readAsText(arquivo);
    });
  }

  return {
    botaoNovaJornada: container.querySelector("#botao-nova-jornada"),
    botaoContinuar,
  };
}
