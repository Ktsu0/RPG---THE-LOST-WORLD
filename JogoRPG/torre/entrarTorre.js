import { batalhaBossTorre, criarBossTorre, torreBosses } from "./bossTorre.js";
import { colors } from "./../utilitarios.js";
import { tentarSairTorre } from "../masmorra/sairMasmorra.js";

export async function entrarNaTorre(jogador) {
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

    // Adicionamos 'await' aqui, pois a batalha será assíncrona
    const venceu = await batalhaBossTorre(boss, jogador);
    if (!venceu) {
      console.log("❌ Você foi derrotado e expulso da torre!");
      return;
    }

    const heal = Math.floor(jogador.hpMax * 0.75);
    jogador.hp = Math.min(jogador.hpMax, jogador.hp + heal);
    console.log(`✅ Você recupera ${heal} HP após o combate.`);

    // Substituímos o prompt por uma Promise assíncrona
    console.log("[1] Continuar | [2] Sair da Torre: ");
    const opcao = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });

    if (opcao === "2") {
      console.log("Você tenta sair da torre...");

      // Corrigimos aqui, pois a função tentarSairTorre também é assíncrona
      const saiuComSucesso = await tentarSairTorre(jogador);

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
