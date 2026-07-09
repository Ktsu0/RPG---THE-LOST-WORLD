const ANIMACOES = {
  idle: { frames: 6, duracao: 1.2, loop: "infinite" },
  ataque: { frames: 6, duracao: 0.6, loop: "1" },
  dano: { frames: 4, duracao: 0.4, loop: "1" },
  morte: { frames: 4, duracao: 0.8, loop: "1" },
};

export function definirSprite(elemento, personagem, nomeAnimacao) {
  const config = ANIMACOES[nomeAnimacao];
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

  const config = ANIMACOES[nomeAnimacao];
  if (config.loop === "infinite") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    elemento.addEventListener("animationend", () => resolve(), { once: true });
  });
}
