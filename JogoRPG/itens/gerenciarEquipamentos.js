import { ARMOR_SLOTS, jogador } from "./../jogo.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Gerenciar Equipamentos ---
export function gerenciarEquipamentos() {
    console.log("\n=== GERENCIAR EQUIPAMENTOS ===");

    while (true) {
        console.log("\n[1] Trocar Armadura  [2] Trocar Arma  [0] Sair");
        const escolha = prompt("Escolha: ");

        if (escolha === "1") {
            gerenciarArmaduras(jogador);
        } else if (escolha === "2") {
            gerenciarArmas(jogador);
        } else if (escolha === "0") {
            break;
        } else {
            console.log("Opção inválida.");
        }
    }
}

function gerenciarArmaduras(jogador) {
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
    aplicarBonusDeConjunto(jogador);
}

function gerenciarArmas(jogador) {
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

export function aplicarBonusDeConjunto(jogador) {
    // Reseta bônus antes de aplicar
    jogador.bonusEsquiva = 0;
    jogador.bonusCritico = 0;
    jogador.bonusBloqueio = 0;
    jogador.bonusHP = 0;
    jogador.bonusAtk = 0;

    const setsEquipados = {};
    for (const slot in jogador.equipamentos) {
        const item = jogador.equipamentos[slot];
        if (item && item.set) {
            setsEquipados[item.set] = (setsEquipados[item.set] || 0) + 1;
        }
    }

    for (const set in setsEquipados) {
        if (setsEquipados[set] === 5) {
            let bonusMensagem = "";
            switch (set) {
                case "Ferro":
                    bonusMensagem = "+15% chance de bloquear ataque!";
                    jogador.bonusBloqueio += 15;
                    break;
                case "Ligeiro":
                    bonusMensagem = "+15% esquiva!";
                    jogador.bonusEsquiva += 15;
                    break;
                case "Sombra":
                    bonusMensagem = "+10% crítico e +10% esquiva!";
                    jogador.bonusEsquiva += 10;
                    jogador.bonusCritico += 10;
                    break;
                case "Dragão":
                    bonusMensagem = "+10% HP e +10% ATK!";
                    jogador.bonusHP += 10;
                    jogador.bonusAtk += 10;
                    break;
            }

            console.log(`✅ Você equipou todo o conjunto ${set}!`);
            console.log(`🎁 Bônus aplicado: ${bonusMensagem}`);
        }
    }

    // ✅ Aplica bônus dinâmicos sem sobrescrever base
    jogador.hpMaxFinal = Math.floor(jogador.hpMax * (1 + jogador.bonusHP));
    jogador.ataqueFinal = Math.floor(jogador.ataque * (1 + jogador.bonusAtk));
}