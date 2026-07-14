import { listarRacas } from "@engine/personagem/racas.js";
import { listarClasses } from "@engine/personagem/classes.js";
import { calcularAtributosIniciais, criarPersonagem } from "@engine/personagem/criarPersonagem.js";
import { caminhoAsset } from "../../caminhos.js";

// Só existem sprites de herói prontos para "soldado" (guerreiro) e "mago"
// (conjurador) — ver WebRPG/public/assets/personagens/. Classes mágicas usam
// o sprite de mago, as demais (marciais) usam o soldado.
const CLASSES_ARCANAS = new Set(["Necromante", "Xamã"]);

// Frames do idle.png de cada sprite de herói — ver EXCECOES_FRAMES_POR_PERSONAGEM
// em WebRPG/src/telas/batalha/sprites.js (mago tem folha de 8 frames, soldado 6).
const FRAMES_IDLE_POR_SPRITE = { soldado: 6, mago: 8 };

function spriteParaClasse(classeNome) {
  return CLASSES_ARCANAS.has(classeNome) ? "mago" : "soldado";
}

export function montarTelaCriacao(container, { aoConfirmar }) {
  container.innerHTML = `
    <div class="tela-criacao">
      <div class="coluna-ficha">
        <div class="painel painel-retrato">
          <div class="sprite-preview">
            <div class="sprite" data-personagem="soldado" style="background-image: url(${caminhoAsset("assets/personagens/soldado/idle.png")}); --sprite-frames: 6;"></div>
          </div>
          <p class="retrato-legenda">Escolha uma classe para ver seu herói</p>
        </div>
        <div class="painel painel-preview">
          <h2>Atributos</h2>
          <p class="preview-vazio">Escolha raça e classe para ver o preview.</p>
        </div>
        <div class="painel campo-nome-painel">
          <label for="campo-nome">Nome do personagem</label>
          <input type="text" id="campo-nome" class="campo-nome" placeholder="Digite um nome" />
        </div>
        <button class="botao botao--destaque" id="botao-confirmar" disabled>Começar Jornada</button>
      </div>
      <div class="coluna-opcoes">
        <div class="painel selecao-raca">
          <h2>Raça</h2>
          <div class="lista-opcoes" data-lista="racas"></div>
        </div>
        <div class="painel selecao-classe">
          <h2>Classe</h2>
          <div class="lista-opcoes" data-lista="classes"></div>
        </div>
      </div>
    </div>
  `;

  const listaRacas = container.querySelector('[data-lista="racas"]');
  for (const raca of listarRacas()) {
    const botao = document.createElement("button");
    botao.className = "botao opcao opcao-raca";
    botao.dataset.raca = raca.nome;
    botao.innerHTML = `<strong>${raca.nome}</strong><span>${raca.descricao}</span>`;
    listaRacas.appendChild(botao);
  }

  const listaClasses = container.querySelector('[data-lista="classes"]');
  for (const classe of listarClasses()) {
    const botao = document.createElement("button");
    botao.className = "botao opcao opcao-classe";
    botao.dataset.classe = classe.nome;
    botao.innerHTML = `<strong>${classe.nome}</strong><span>${classe.descricao}</span>`;
    listaClasses.appendChild(botao);
  }

  const painelPreview = container.querySelector(".painel-preview");
  const campoNome = container.querySelector("#campo-nome");
  const botaoConfirmar = container.querySelector("#botao-confirmar");
  const sprite = container.querySelector(".sprite");
  const retratoLegenda = container.querySelector(".retrato-legenda");

  const estado = { racaNome: null, classeNome: null };

  function atualizarSprite(classeNome) {
    const nomeSprite = spriteParaClasse(classeNome);
    sprite.dataset.personagem = nomeSprite;
    sprite.style.backgroundImage = `url(${caminhoAsset(`assets/personagens/${nomeSprite}/idle.png`)})`;
    sprite.style.setProperty("--sprite-frames", FRAMES_IDLE_POR_SPRITE[nomeSprite]);
    retratoLegenda.textContent = classeNome;
  }

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
      atualizarSprite(estado.classeNome);
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
