import { batalhaBossTorre, criarBossTorre, torreBosses } from "./bossTorre.js";
import { colors } from "./../utilitarios.js";
import { tentarSairTorre } from "../masmorra/sairMasmorra.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

export function entrarNaTorre(jogador) {
    if (!jogador.inventario.includes("Talismã da Torre")) {
        console.log(
            `${colors.red}⚠️ Você precisa do Talismã da Torre para entrar. Colete 10 Fragmentos Antigos e 2000 de ouro para construí-lo!${colors.reset}`
        );
        return;
    }
    const talismaIndex = jogador.inventario.indexOf("Talismã da Torre");
    jogador.inventario.splice(talismaIndex, 1);

    console.log(
        `\n🏰 Você entrou na Torre do Destino! O Talismã se desfez na entrada.`
    );

    for (let i = 0; i < torreBosses.length; i++) {
        const boss = criarBossTorre(i, jogador);

        console.log(
            `\n⚔️ Boss ${i + 1}: ${boss.nome} (HP: ${boss.hp}, ATK: ${boss.atk})`
        );

        const venceu = batalhaBossTorre(boss, jogador);
        if (!venceu) {
            console.log("❌ Você foi derrotado e expulso da torre!");
            return;
        }

        const heal = Math.floor(jogador.hpMax * 0.75);
        jogador.hp = Math.min(jogador.hpMax, jogador.hp + heal);
        console.log(`✅ Você recupera ${heal} HP após o combate.`);

        const opcao = prompt("[1] Continuar | [2] Sair da Torre: ");
        if (opcao === "2") {
            // Apenas informa que a tentativa de fuga começou
            console.log("Você tenta sair da torre...");

            // Chama a função que já exibe a mensagem de sucesso/falha
            const saiuComSucesso = tentarSairTorre(jogador);

            if (saiuComSucesso) {
                console.log("Os bosses da torre serão resetados!");
                return; // Sai da função de loop da torre
            }
        }
    }
    console.log(
        `${colors.blue}🎉 Você derrotou todos os bosses e salvou a princesa! FIM DE JOGO!${colors.reset}`
    );
    process.exit();
}