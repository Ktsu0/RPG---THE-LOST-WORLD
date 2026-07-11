import { tocarAnimacao } from "./sprites.js";
import { tocarEfeito } from "@audio/tocador.js";

function mostrarNumeroDano(elementoCombatente, valor, critico) {
  const numero = document.createElement("div");
  numero.className = critico ? "numero-dano numero-dano--critico" : "numero-dano";
  numero.textContent = critico ? `${valor}!` : `${valor}`;
  elementoCombatente.appendChild(numero);
  setTimeout(() => numero.remove(), 900);
}

function tremerPalco(elementoPalco) {
  elementoPalco.classList.remove("palco-batalha--tremendo");
  void elementoPalco.offsetWidth;
  elementoPalco.classList.add("palco-batalha--tremendo");
}

function flashDano(elementoSprite) {
  elementoSprite.classList.remove("sprite--flash");
  void elementoSprite.offsetWidth;
  elementoSprite.classList.add("sprite--flash");
}

const espera = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function reproduzirEventos(eventos, elementos) {
  const { spriteJogador, spriteInimigo, combatenteJogador, combatenteInimigo, palco } =
    elementos;
  const personagemJogadorAtual = elementos.personagemJogador ?? "soldado";
  const personagemInimigoAtual = elementos.personagemInimigo ?? "orc";

  for (const evento of eventos) {
    switch (evento.tipo) {
      case "dano": {
        const alvoSprite = evento.alvo === "inimigo" ? spriteInimigo : spriteJogador;
        const alvoCombatente =
          evento.alvo === "inimigo" ? combatenteInimigo : combatenteJogador;
        const autorSprite = evento.autor === "jogador" ? spriteJogador : spriteInimigo;
        const personagemAutor = evento.autor === "jogador" ? personagemJogadorAtual : personagemInimigoAtual;
        const personagemAlvo = evento.alvo === "jogador" ? personagemJogadorAtual : personagemInimigoAtual;

        await tocarAnimacao(autorSprite, personagemAutor, "ataque");
        flashDano(alvoSprite);
        mostrarNumeroDano(alvoCombatente, evento.valor, evento.critico);
        tocarEfeito(evento.critico ? "critico" : "golpe");
        if (evento.critico) tremerPalco(palco);
        await tocarAnimacao(alvoSprite, personagemAlvo, "dano");
        break;
      }
      case "esquiva":
      case "bloqueio":
        await espera(400);
        break;
      case "sangramento_tick":
      case "envenenamento_tick": {
        const alvoCombatente =
          evento.alvo === "inimigo" ? combatenteInimigo : combatenteJogador;
        mostrarNumeroDano(alvoCombatente, evento.dano, false);
        await espera(400);
        break;
      }
      case "cura_xama":
      case "sangramento_aplicado":
      case "envenenamento_aplicado":
        await espera(300);
        break;
      case "morte": {
        const personagem = evento.alvo === "jogador" ? personagemJogadorAtual : personagemInimigoAtual;
        const sprite = evento.alvo === "jogador" ? spriteJogador : spriteInimigo;
        await tocarAnimacao(sprite, personagem, "morte");
        break;
      }
      case "vitoria":
        tocarEfeito("moeda");
        await espera(500);
        break;
      case "fuga":
      case "derrota":
        await espera(500);
        break;
      default:
        break;
    }
  }
}
