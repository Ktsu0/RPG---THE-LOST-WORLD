import { listarRacas } from "@engine/personagem/racas.js";
import { listarClasses } from "@engine/personagem/classes.js";
import { calcularAtributosIniciais, criarPersonagem } from "@engine/personagem/criarPersonagem.js";
import { caminhoAsset } from "../../caminhos.js";

export function montarTelaCriacao(container, { aoConfirmar }) {
  container.innerHTML = `
    <div class="tela-criacao">
      <div class="sprite-preview">
        <div class="sprite" data-personagem="soldado" style="background-image: url(${caminhoAsset("assets/personagens/soldado/idle.png")}); --sprite-frames: 6;"></div>
      </div>
      <div class="painel selecao-raca">
        <h2>Raça</h2>
        <div class="lista-opcoes" data-lista="racas"></div>
      </div>
      <div class="painel selecao-classe">
        <h2>Classe</h2>
        <div class="lista-opcoes" data-lista="classes"></div>
      </div>
      <div class="painel painel-preview">
        <h2>Atributos</h2>
        <p class="preview-vazio">Escolha raça e classe para ver o preview.</p>
      </div>
      <div class="painel campo-nome-painel">
        <label for="campo-nome">Nome do personagem</label>
        <input type="text" id="campo-nome" class="campo-nome" />
      </div>
      <button class="botao botao--destaque" id="botao-confirmar" disabled>Começar Jornada</button>
    </div>
  `;

  const listaRacas = container.querySelector('[data-lista="racas"]');
  for (const raca of listarRacas()) {
    const botao = document.createElement("button");
    botao.className = "botao opcao-raca";
    botao.dataset.raca = raca.nome;
    botao.textContent = `${raca.nome} — ${raca.descricao}`;
    listaRacas.appendChild(botao);
  }

  const listaClasses = container.querySelector('[data-lista="classes"]');
  for (const classe of listarClasses()) {
    const botao = document.createElement("button");
    botao.className = "botao opcao-classe";
    botao.dataset.classe = classe.nome;
    botao.textContent = `${classe.nome} — ${classe.descricao}`;
    listaClasses.appendChild(botao);
  }

  const painelPreview = container.querySelector(".painel-preview");
  const campoNome = container.querySelector("#campo-nome");
  const botaoConfirmar = container.querySelector("#botao-confirmar");

  const estado = { racaNome: null, classeNome: null };

  function atualizarPreview() {
    if (!estado.racaNome || !estado.classeNome) return;
    const atributos = calcularAtributosIniciais(estado.racaNome, estado.classeNome);
    painelPreview.innerHTML = `
      <h2>Atributos</h2>
      <p>HP: ${atributos.hpMax}</p>
      <p>Ataque: ${atributos.ataque}</p>
      <p>Defesa: ${atributos.defesa}</p>
    `;
  }

  function atualizarBotaoConfirmar() {
    botaoConfirmar.disabled = !(estado.racaNome && estado.classeNome && campoNome.value.trim());
  }

  for (const botao of listaRacas.querySelectorAll("[data-raca]")) {
    botao.addEventListener("click", () => {
      for (const b of listaRacas.querySelectorAll("[data-raca]")) b.classList.remove("opcao--selecionada");
      botao.classList.add("opcao--selecionada");
      estado.racaNome = botao.dataset.raca;
      atualizarPreview();
      atualizarBotaoConfirmar();
    });
  }

  for (const botao of listaClasses.querySelectorAll("[data-classe]")) {
    botao.addEventListener("click", () => {
      for (const b of listaClasses.querySelectorAll("[data-classe]")) b.classList.remove("opcao--selecionada");
      botao.classList.add("opcao--selecionada");
      estado.classeNome = botao.dataset.classe;
      atualizarPreview();
      atualizarBotaoConfirmar();
    });
  }

  campoNome.addEventListener("input", atualizarBotaoConfirmar);

  botaoConfirmar.addEventListener("click", () => {
    const jogador = criarPersonagem({
      nome: campoNome.value,
      racaNome: estado.racaNome,
      classeNome: estado.classeNome,
    });
    aoConfirmar(jogador);
  });

  return { botaoConfirmar, campoNome, painelPreview };
}
