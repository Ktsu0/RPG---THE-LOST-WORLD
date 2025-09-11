import { getRaridadeCor, loja } from "./../loja/itensLoja.js";
import { equiparItem } from "./../personagem/status.js";
import { rand, colors } from "./../utilitarios.js";

export function processarDropDeItem(jogador, bonus, bonusDropItem) {
  const chanceDropTotal = 15 + bonusDropItem + bonus;
  let itemDropado = null;

  if (rand(1, 100) <= chanceDropTotal) {
    const rollRaridade = rand(1, 100);
    let raridadeDropada = "";

    if (rollRaridade <= 70) {
      raridadeDropada = "comum";
    } else if (rollRaridade <= 95) {
      raridadeDropada = "raro";
    } else {
      raridadeDropada = "lendario";
    }

    const todosItens = [
      ...loja.filter((i) => i.slot !== "consumable"),
      ...armasDisponiveis,
    ];
    const itensSorteados = todosItens.filter(
      (i) => i.raridade === raridadeDropada
    );

    if (itensSorteados.length > 0) {
      const drop = itensSorteados[rand(0, itensSorteados.length - 1)];
      equiparItem(jogador, drop);
      itemDropado = drop;

      const corRaridade = getRaridadeCor(raridadeDropada);
      console.log(
        `Você encontrou um item ${corRaridade}${raridadeDropada}! ${colors.magenta}${drop.nome}${colors.reset}`
      );
      if (drop.slot !== "consumable") {
        console.log(`E o equipou!`);
      }
    } else {
      console.log("O inimigo não deixou nada de valor.");
    }
  } else {
    console.log("O inimigo não deixou nada de valor.");
  }
  return itemDropado;
}
