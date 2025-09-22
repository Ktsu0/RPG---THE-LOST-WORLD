import { loja } from "../../loja/itensLoja/itensLoja.js";
import { rand, colors } from "./../../utilitarios.js";
import { equiparItem } from "./../equipamentos/equiparItem.js";
import { getRaridadeCor } from "./../../codigosUniversais.js";

// --- Processar drop de item ---
export function processarDropDeItem(jogador, bonus = 0, bonusDropItem = 0) {
  const chanceDropTotal = 10 + bonus + bonusDropItem;
  let itemDropado = null;

  if (rand(1, 100) <= chanceDropTotal) {
    // Determina raridade
    const rollRaridade = rand(1, 100);
    let raridadeDropada =
      rollRaridade <= 70 ? "comum" : rollRaridade <= 95 ? "raro" : "lendario";

    // Filtra itens da loja pela raridade
    const itensDisponiveis = loja.filter(
      (i) => i.slot !== "consumable" && i.raridade === raridadeDropada
    );

    if (itensDisponiveis.length > 0) {
      const drop = itensDisponiveis[rand(0, itensDisponiveis.length - 1)];
      itemDropado = drop;
      const corRaridade = getRaridadeCor(raridadeDropada);
      console.log(
        `🎁 Você encontrou um item: ${corRaridade}${drop.nome}${colors.reset}`
      );
      equiparItem(jogador, drop);
    } else {
      console.log("O inimigo não deixou nenhum item de valor desta raridade.");
    }
  } else {
    console.log("O inimigo não deixou nada de valor.");
  }

  return itemDropado;
}
