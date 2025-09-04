import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Gerenciar Equipamentos ---
export function gerenciarEquipamentos() {
  console.log("\n=== GERENCIAR EQUIPAMENTOS ===");

  while (true) {
    console.log("\n[1] Trocar Armadura  [2] Trocar Arma  [0] Sair");
    const escolha = prompt("Escolha: ");

    if (escolha === "1") {
      gerenciarArmaduras();
    } else if (escolha === "2") {
      gerenciarArmas();
    } else if (escolha === "0") {
      break;
    } else {
      console.log("Opção inválida.");
    }
  }
}

function gerenciarArmaduras() {
  console.log("\n=== ARMADURAS ===");

  ARMOR_SLOTS.forEach((slot) => {
    const equipado = jogador.equipamentos[slot];
    const nome = equipado ? equipado.nome : "Nenhuma";
    console.log(` - ${slot}: ${nome}`);
  });

  console.log("\nSeu inventário de armaduras disponíveis:");
  const armadurasNoInventario = jogador.inventario.filter(
    (i) => i.slot && i.slot !== "consumable"
  );

  if (armadurasNoInventario.length === 0) {
    console.log("Nenhuma armadura disponível no inventário.");
    return;
  }

  armadurasNoInventario.forEach((item, index) => {
    console.log(
      `[${index + 1}] ${item.nome} (Slot: ${item.slot}, Def:${
        item.defesa
      } ATK+:${item.atkBonus} Set:${item.set})`
    );
  });
  console.log("[0] Voltar");

  const idxRaw = prompt("Escolha a armadura para equipar: ");
  const idx = parseInt(idxRaw);

  if (isNaN(idx) || idx < 0 || idx > armadurasNoInventario.length) {
    console.log("Escolha inválida.");
    return;
  }
  if (idx === 0) return;

  const armaduraEscolhida = armadurasNoInventario[idx - 1];

  // Guarda armadura atual no inventário
  if (jogador.equipamentos[armaduraEscolhida.slot]) {
    jogador.inventario.push(jogador.equipamentos[armaduraEscolhida.slot]);
  }

  // Equipa a nova armadura
  jogador.equipamentos[armaduraEscolhida.slot] = armaduraEscolhida;

  // Remove do inventário
  jogador.inventario = jogador.inventario.filter(
    (i) => i !== armaduraEscolhida
  );

  console.log(`✅ Equipou: ${armaduraEscolhida.nome}`);

  // Recalcula bônus de conjunto
  aplicarBonusDeConjunto();
}

function gerenciarArmas() {
  console.log("\n=== ARMAS ===");

  console.log(
    `Arma equipada: ${
      jogador.armaEquipada ? jogador.armaEquipada.nome : "Nenhuma"
    }`
  );

  const armasDisponiveis = jogador.inventario.filter(
    (i) => i.slot === "weapon"
  );

  if (armasDisponiveis.length === 0) {
    console.log("Nenhuma arma disponível no inventário.");
    return;
  }

  armasDisponiveis.forEach((arma, index) => {
    console.log(
      `[${index + 1}] ${arma.nome} (+${arma.atk} ATK, Efeito: ${
        arma.efeito || "Nenhum"
      })`
    );
  });
  console.log("[0] Voltar");

  const idxRaw = prompt("Escolha a arma para equipar: ");
  const idx = parseInt(idxRaw);

  if (isNaN(idx) || idx < 0 || idx > armasDisponiveis.length) {
    console.log("Escolha inválida.");
    return;
  }
  if (idx === 0) return;

  const armaEscolhida = armasDisponiveis[idx - 1];

  // Guarda arma atual no inventário
  if (jogador.armaEquipada) {
    jogador.inventario.push(jogador.armaEquipada);
  }

  // Equipa a nova arma
  jogador.armaEquipada = armaEscolhida;

  // Remove do inventário
  jogador.inventario = jogador.inventario.filter((i) => i !== armaEscolhida);

  console.log(`✅ Equipou: ${armaEscolhida.nome}`);
}
