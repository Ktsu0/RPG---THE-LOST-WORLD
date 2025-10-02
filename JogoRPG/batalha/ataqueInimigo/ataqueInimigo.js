import { executarHabilidadeEspecial } from "./../../masmorra/habilidadesInimigos.js";
import { colors, rand } from "./../../utilitarios.js";
import { processarSangramento } from "./funcionAuxiliares/sangramento.js";
import { ataqueEsqueletos } from "./funcionAuxiliares/esqueletos.js";
import { calcularDanoInimigo } from "./funcionAuxiliares/calcularDanoInimigo.js";
import { processarRegeneracao } from "./funcionAuxiliares/regen.js";

export function ataqueInimigo(inimigo, jogador, esqueletosInvocados) {
  if (inimigo.hp <= 0) return; // 1️⃣ Processa efeitos do inimigo

  processarSangramento(inimigo);
  if (inimigo.hp <= 0) return;

  processarRegeneracao(inimigo);

  esqueletosInvocados = ataqueEsqueletos(inimigo, esqueletosInvocados);
  if (inimigo.hp <= 0) return; // 3️⃣ Executar habilidade especial do inimigo

  const resultado = executarHabilidadeEspecial(inimigo, jogador);

  switch (resultado) {
    case "ataque_duplo": {
      const dano1 = calcularDanoInimigo(inimigo, jogador);
      const dano2 = calcularDanoInimigo(inimigo, jogador);

      const totalDano = dano1 + dano2;

      jogador.hp = Math.max(0, jogador.hp - totalDano);
      console.log(
        `⚔️ ${inimigo.nome} atacou duas vezes e causou ${colors.red}${totalDano}${colors.reset} de dano!`
      );
      return;
    }
    case "dano_extra":
      break;
    case true:
      return;

    default:
      break;
  } // 4️⃣ Ataque normal do inimigo (se não foi impedido por habilidade especial)

  let danoInimigo = calcularDanoInimigo(inimigo, jogador); // 5️⃣ Absorção por esqueletos

  if (esqueletosInvocados.length > 0 && danoInimigo > 0) {
    const esqueletoAlvo = esqueletosInvocados[0];
    esqueletoAlvo.hp -= danoInimigo;
    console.log(
      `${colors.blue}🛡 Um esqueleto absorveu ${danoInimigo} de dano!${colors.reset}`
    );
    if (esqueletoAlvo.hp <= 0) {
      console.log(`${colors.red}💔 Um esqueleto foi destruído!${colors.reset}`);
      esqueletosInvocados.shift();
    }
    danoInimigo = 0;
  } // 6️⃣ Aplica dano final ao jogador

  jogador.hp = Math.max(0, jogador.hp - danoInimigo);

  console.log(
    danoInimigo > 0
      ? `${inimigo.nome} atacou e causou ${colors.red}${danoInimigo}${colors.reset} de dano.`
      : `${inimigo.nome} atacou, mas você não recebeu dano!`
  );

  if (inimigo.habilidade === "envenenamento" && rand(1, 100) <= 20) {
    jogador.status.push({
      tipo: "envenenamento",
      duracao: rand(3, 5),
      dano: 5,
    });
    console.log(
      `\n🤢 ${inimigo.nome} envenenou você como efeito colateral do ataque!`
    );
  }
  if (inimigo.habilidade === "petrificar" && rand(1, 100) <= 20) {
    const bonus = Math.floor(inimigo.defesa * 0.05) + 1;
    inimigo.defesa += bonus;

    console.log(
      `\n🗿 ${inimigo.nome} se petrificou e ganhou mais ${colors.blue}10% de Defesa extra!${colors.reset}`
    );
  }
}
