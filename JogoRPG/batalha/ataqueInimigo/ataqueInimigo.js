import { executarHabilidadeEspecial } from "./../../masmorra/habilidadesInimigos.js";
import { colors } from "./../../utilitarios.js";
import { processarSangramento } from "./funcionAuxiliares/sangramento.js";
import { ataqueEsqueletos } from "./funcionAuxiliares/esqueletos.js";
import { calcularDanoInimigo } from "./funcionAuxiliares/calcularDanoInimigo.js";

// --- ATAQUE DO INIMIGO ---
export function ataqueInimigo(inimigo, jogador, esqueletosInvocados) {
  if (inimigo.hp <= 0) return;

  processarSangramento(inimigo);
  if (inimigo.hp <= 0) return;

  esqueletosInvocados = ataqueEsqueletos(inimigo, esqueletosInvocados);
  if (inimigo.hp <= 0) return;

  const usouHabilidade = executarHabilidadeEspecial(inimigo, jogador);
  if (usouHabilidade) return;

  let danoInimigo = calcularDanoInimigo(inimigo, jogador);

  // Absorção por esqueleto
  if (esqueletosInvocados.length > 0 && danoInimigo > 0) {
    const esqueletoAlvo = esqueletosInvocados[0];
    esqueletoAlvo.hp -= danoInimigo;
    console.log(
      `${colors.blue}🛡 Um esqueleto absorveu ${danoInimigo} de dano!${colors.reset}`
    );
    if (esqueletoAlvo.hp <= 0)
      console.log(`${colors.red}💔 Um esqueleto foi destruído!${colors.reset}`);
    danoInimigo = 0;
  }

  jogador.hp = Math.max(0, jogador.hp - danoInimigo);

  console.log(
    danoInimigo > 0
      ? `${inimigo.nome} atacou e causou ${colors.red}${danoInimigo}${colors.reset} de dano.`
      : `${inimigo.nome} atacou, mas você não recebeu dano!`
  );
}
