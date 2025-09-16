import { processarDropDeItem } from "./../../itens/dropItem/chanceDrop.js";
import { checarLevelUp } from "./../../personagem/experiencia.js";
import { rand, colors } from "./../../utilitarios.js";

// --- Auxiliares ---
function aplicarCoraçãoFlamejante(jogador) {
  if (jogador.masmorraAtual) {
    const coracao = jogador.inventario.find(
      (i) => i.nome === "Coração Flamejante"
    );
    if (coracao) {
      const hpRestaurado = 10;
      jogador.hp = Math.min(jogador.hp + hpRestaurado, jogador.hpMax);
      console.log(
        `\n💖 ${colors.magenta}O Coração Flamejante brilha! Você recuperou ${hpRestaurado} HP!${colors.reset}`
      );
    }
  }
}

function adicionarItemUnico(jogador, item) {
  const jaTem = jogador.inventario.some((i) => i.nome === item.nome);
  if (jaTem) {
    console.log(
      `\n🌌 A energia do ${item.nome} não pode ser acumulada. Ela se dissipa.`
    );
  } else {
    jogador.inventario.push(item);
    console.log(`\n🎉 Você obteve um item: ${item.nome}!`);
  }
}

function processarDrops(jogador, inimigo) {
  const bonusDropItem =
    ((jogador.bonusClasse && jogador.bonusClasse.dropItem) || 0) +
    (jogador.masmorraAtual ? 10 : 0);

  // Drop poção
  if (rand(1, 100) <= 15 + bonusDropItem) {
    const novaPocao = {
      nome: "Poção de Cura",
      slot: "consumable",
      preco: 200,
      cura: 50,
    };
    jogador.inventario.push(novaPocao);
    console.log(`\n🍷 Você encontrou uma Poção de Cura!`);
  }

  // Drop adicional do inimigo
  processarDropDeItem(jogador, bonusDropItem);

  // Drop de recompensa especial
  if (inimigo.recompensa) {
    adicionarItemUnico(jogador, inimigo.recompensa);
  }
}

// --- FUNÇÃO PRINCIPAL ---
export function finalizarVitoria(inimigo, jogador) {
  const xpGanho = inimigo.xp || Math.floor(inimigo.hpMax / 5 + inimigo.atk * 2);
  let ouroGanho = Math.floor(
    (inimigo.ouro || rand(50, 100)) *
      (inimigo.tipo === "boss" ? inimigo.dificuldade : 1)
  );

  jogador.xp += xpGanho;
  jogador.ouro += ouroGanho;

  console.log(
    `\n${colors.green}Você derrotou o ${inimigo.nome}!${colors.reset}`
  );
  console.log(`💰 Ouro ganho: ${ouroGanho}`);
  console.log(`✨ XP ganho: ${xpGanho}`);

  aplicarCoraçãoFlamejante(jogador);
  processarDrops(jogador, inimigo);

  checarLevelUp(jogador);
}
