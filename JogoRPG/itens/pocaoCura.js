import { colors, rand } from "./../utilitarios.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

// --- Usar Poção ---
export function usarPocao(jogador) {
    // 1. Identifica os itens de cura que o jogador possui
    const temPocaoCura = jogador.inventario.some(
        (item) => item.nome === "Poção de Cura"
    );
    const temNectar = jogador.inventario.some(
        (item) => item.nome === "Néctar da Vida Eterna"
    );

    // 2. Lógica para quando não há itens de cura
    if (!temPocaoCura && !temNectar) {
        console.log("❌ Você não possui nenhum item de cura no seu inventário!");
        return false;
    }

    // 3. Lógica para quando o jogador tem apenas um tipo de item
    if (temNectar && !temPocaoCura) {
        // Se só tiver o Néctar, pergunta se quer usar o item especial
        const confirmar = prompt(
            `Você tem apenas um item especial: ${colors.magenta}Néctar da Vida Eterna.${colors.reset} Deseja usá-lo? (sim/não)`
        );
        if (confirmar.toLowerCase() === "sim") {
            const index = jogador.inventario.findIndex(
                (item) => item.nome === "Néctar da Vida Eterna"
            );
            if (index !== -1) {
                jogador.inventario.splice(index, 1);
                jogador.hp = jogador.hpMax;
                console.log(
                    `💖 ${colors.magenta}Você usou o Néctar da Vida Eterna e sua vida foi completamente restaurada!${colors.reset}`
                );
                console.log(`HP: ${jogador.hp}/${jogador.hpMax}`);
                return true;
            }
        }
        console.log("Ação cancelada.");
        return false;
    }

    // 4. Lógica para quando o jogador tem apenas poções de cura
    if (temPocaoCura && !temNectar) {
        // Usa a poção de cura diretamente, sem menu
        const index = jogador.inventario.findIndex(
            (item) => item.nome === "Poção de Cura"
        );
        jogador.inventario.splice(index, 1);
        const cura = rand(30, 50);
        jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
        console.log(
            `💊 Você usou uma Poção de Cura e recuperou ${cura} HP! (HP: ${jogador.hp}/${jogador.hpMax})`
        );
        return true;
    }

    // 5. Lógica para quando o jogador tem ambos os itens
    if (temPocaoCura && temNectar) {
        console.log("\nQual item de cura você deseja usar?");
        console.log(" [1] Poção de Cura (Recupera uma pequena quantidade de HP)");
        console.log(" [2] Néctar da Vida Eterna (Restaura 100% da vida)");

        // Simula a entrada do usuário com 'prompt'
        const escolha = prompt("Digite o número da sua escolha:");

        switch (escolha) {
            case "1":
                // Lógica de uso da poção de cura
                const indexPocao = jogador.inventario.findIndex(
                    (item) => item.nome === "Poção de Cura"
                );
                jogador.inventario.splice(indexPocao, 1);
                const cura = rand(30, 50);
                jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
                console.log(
                    `💊 Você usou uma Poção de Cura e recuperou ${cura} HP! (HP: ${jogador.hp}/${jogador.hpMax})`
                );
                return true;

            case "2":
                // Lógica de uso do Néctar (com confirmação)
                const confirmarNectar = prompt(
                    `Você tem apenas um item especial: ${colors.magenta}Néctar da Vida Eterna.${colors.reset} Deseja usá-lo? (sim/não)`
                );
                // A correção está nesta linha: a variável é 'confirmarNectar'
                if (confirmarNectar.toLowerCase() === "sim") {
                    const indexNectar = jogador.inventario.findIndex(
                        (item) => item.nome === "Néctar da Vida Eterna"
                    );
                    if (indexNectar !== -1) {
                        jogador.inventario.splice(indexNectar, 1);
                        jogador.hp = jogador.hpMax;
                        console.log(
                            `💖 ${colors.magenta}Você usou o Néctar da Vida Eterna e sua vida foi completamente restaurada!${colors.reset}`
                        );
                        console.log(`HP: ${jogador.hp}/${jogador.hpMax}`);
                        return true;
                    }
                }
                console.log("Ação cancelada.");
                return false;

            default:
                console.log("Escolha inválida. Ação cancelada.");
                return false;
        }
    }
}