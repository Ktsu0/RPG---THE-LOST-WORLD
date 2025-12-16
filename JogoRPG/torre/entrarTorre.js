import { batalhaBossTorre, criarBossTorre, torreBosses } from "./bossTorre.js";
import { colors, lerInput } from "./../utilitarios.js";
import { tentarSairTorre } from "../masmorra/sairMasmorra.js";
import { ICONS } from "./../icons.js";

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
    `\n🏰 ${colors.magenta}A energia densa da Torre reage ao Talismã. O amuleto brilha intensamente e se desintegra, transformando-se na chave etérea que abre os portões.${colors.reset}`
  );

  for (let i = 0; i < torreBosses.length; i++) {
    const boss = criarBossTorre(i, jogador);

    console.log(
      `\n⚔️ Boss ${i + 1}: ${boss.nome} (HP: ${boss.hp}, ATK: ${boss.atk})`
    );

    const venceu = await batalhaBossTorre(boss, jogador);
    if (!venceu) {
      console.log("❌ Você foi derrotado e expulso da torre!");
      return;
    }

    // Cura reduzida para 35%
    const heal = Math.floor(jogador.hpMax * 0.35);
    jogador.hp = Math.min(jogador.hpMax, jogador.hp + heal);
    console.log(`✅ Você recupera ${heal} HP (35%) após o combate.`);

    if (i < torreBosses.length - 1) { // Só pergunta se quer sair se NÃO for o último boss
        const opcao = await lerInput("[1] Continuar | [2] Sair da Torre: ");
    
        if (opcao === "2") {
          console.log("Você tenta sair da torre...");
          const saiuComSucesso = await tentarSairTorre(jogador);
    
          if (saiuComSucesso) {
            console.log("Os bosses da torre serão resetados!");
            return; 
          }
        }
    }
  }
  
  // Final de Jogo Melhorado
  console.log(
    `\n${colors.bright}${colors.yellow}🎉 PARABÉNS! VOCÊ DERROTOU O LORDE DO CAOS! 🎉${colors.reset}`
  );
  console.log(`${colors.cyan}A maldição da Torre foi quebrada. O mundo começa a se curar.${colors.reset}`);
  console.log(`${colors.green}Você recebe o "Cálice da Vitória" como prova de sua conquista suprema!${colors.reset}`);
  
  jogador.inventario.push({ 
      nome: "Cálice da Vitória", 
      tipo: "item_chave", 
      descricao: "Prova de que você conquistou a Torre do Destino." 
  });
  
  // Bônus final
  jogador.ouro += 10000;
  console.log(`${ICONS.OURO} +10000 Ouro!`);
  
  await lerInput(`\n${colors.gray}Pressione ENTER para retornar ao mundo e continuar sua jornada...${colors.reset}`);
  
  // Não encerra o processo, apenas retorna ao menu principal
  return; 
}
