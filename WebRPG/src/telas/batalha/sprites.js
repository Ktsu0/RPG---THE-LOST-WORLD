const ANIMACOES = {
  idle: { frames: 6, duracao: 1.2, loop: "infinite" },
  ataque: { frames: 6, duracao: 0.6, loop: "1" },
  dano: { frames: 4, duracao: 0.4, loop: "1" },
  morte: { frames: 4, duracao: 0.8, loop: "1" },
};

// O bestiário baixado do LuizMelo ("Monsters Creatures Fantasy") tem folhas de
// sprite com contagem de frames diferente da convenção soldado/orc (idle e ataque
// variam; dano/morte coincidem com o padrão de 4). Guarda só as exceções por
// personagem — quem não aparece aqui usa ANIMACOES sem alteração.
const EXCECOES_FRAMES_POR_PERSONAGEM = {
  goblin: { idle: 4, ataque: 8 },
  cogumelo: { idle: 4, ataque: 8 },
  esqueleto: { idle: 4, ataque: 8 },
  "olho-voador": { idle: 8, ataque: 8 },
};

function obterConfigAnimacao(personagem, nomeAnimacao) {
  const base = ANIMACOES[nomeAnimacao];
  if (!base) return null;
  const excecao = EXCECOES_FRAMES_POR_PERSONAGEM[personagem]?.[nomeAnimacao];
  return excecao === undefined ? base : { ...base, frames: excecao };
}

export function definirSprite(elemento, personagem, nomeAnimacao) {
  const config = obterConfigAnimacao(personagem, nomeAnimacao);
  if (!config) {
    throw new Error(`Animação "${nomeAnimacao}" não existe.`);
  }
  elemento.style.backgroundImage = `url(/assets/personagens/${personagem}/${nomeAnimacao}.png)`;
  elemento.style.setProperty("--sprite-frames", config.frames);
  elemento.style.setProperty("--sprite-duration", `${config.duracao}s`);
  elemento.style.setProperty("--sprite-loop", config.loop);
}

export function tocarAnimacao(elemento, personagem, nomeAnimacao) {
  definirSprite(elemento, personagem, nomeAnimacao);
  elemento.classList.remove("sprite--tocando");
  void elemento.offsetWidth; // força reflow para reiniciar a animação
  elemento.classList.add("sprite--tocando");

  const config = obterConfigAnimacao(personagem, nomeAnimacao);
  if (config.loop === "infinite") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    elemento.addEventListener("animationend", () => resolve(), { once: true });
  });
}
