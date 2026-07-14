const ICONES_POR_TIPO = {
  envenenamento: { glifo: "☠", nome: "Envenenado", efeito: "perde HP a cada turno" },
  sangramento: { glifo: "🩸", nome: "Sangrando", efeito: "perde HP a cada turno" },
  paralisado: { glifo: "🕸", nome: "Paralisado", efeito: "perde o turno de ataque" },
  invulneravel: { glifo: "🛡", nome: "Invulnerável", efeito: "ignora todo dano recebido" },
};
const ICONE_GENERICO = { glifo: "✦", nome: "Efeito ativo", efeito: "efeito desconhecido" };

export function renderizarIconesStatus(elemento, combatente) {
  elemento.innerHTML = "";
  for (const efeito of combatente.status ?? []) {
    const config = ICONES_POR_TIPO[efeito.tipo] ?? ICONE_GENERICO;
    const span = document.createElement("span");
    span.className = "icone-status";
    span.textContent = config.glifo;
    const plural = efeito.duracao === 1 ? "turno restante" : "turnos restantes";
    span.title = `${config.nome}: ${config.efeito} (${efeito.duracao} ${plural})`;
    elemento.appendChild(span);
  }
}
