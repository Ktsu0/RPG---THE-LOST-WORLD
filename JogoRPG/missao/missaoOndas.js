import { batalhaOnda } from "./../batalha/batalha.js";
import { criarMiniBoss } from "./../inimigos/miniBoss.js";
import { criarInimigo } from "./../inimigos/monstros.js";
import { checarLevelUp } from "./../personagem/experiencia.js";
import { colors, rand } from "./../utilitarios.js";

export function batalhaOndas(jogador) {
  console.log(
    `${colors.bright}Você entrou na Arena Amaldiçoada! Prepare-se para o desafio!${colors.reset}`
  );
  console.log(
    `${colors.red}⚠️ Aviso: Não é possível fugir deste desafio! A derrota significa uma grande perda.${colors.reset}`
  );

  for (let onda = 1; onda <= 10; onda++) {
    console.log(`\n--- Onda ${onda} de 10 ---`);
    const inimigo = criarInimigo(jogador);
    const venceuOnda = batalhaOnda(inimigo, jogador);

    // Se o jogador perdeu a onda, a missão inteira falha.
    if (!venceuOnda) {
      console.log(
        `${colors.red}❌ Você foi derrotado na Onda ${onda}! A missão falhou.${colors.reset}`
      );
      jogador.hp = Math.floor(jogador.hpMax / 2);
      return false; // Sai da função, encerrando a missão.
    }

    // Lógica para recompensas por onda, só se a onda foi vencida.
    if (rand(1, 100) <= 5) {
      console.log(
        `${colors.green}🎉 Você encontrou um ${colors.bright}Fragmento Antigo${colors.reset}${colors.green} durante a batalha!${colors.reset}`
      );
      jogador.inventario.push("Fragmento Antigo");
    }
    jogador.hp = Math.floor(jogador.hp + jogador.hpMax * 0.1);
    console.log(
      `Seu HP foi restaurado para ${colors.green}${jogador.hp}${colors.reset}`
    );
  }

  // O código abaixo só é executado se o loop 'for' (todas as ondas) terminar sem 'return false'.
  console.log(
    `\n${colors.bright}${colors.red}O portal se fecha e um MiniBoss lendário surge!${colors.reset}`
  );
  jogador.hp = Math.floor(jogador.hp + jogador.hpMax * 0.3);
  console.log(
    `${colors.green}Seu HP foi restaurado para ${jogador.hp} antes da luta com o MiniBoss.${colors.reset}`
  );

  const miniboss = criarMiniBoss("lendario", jogador.nivel);
  const venceuBoss = batalhaOnda(miniboss, jogador, false);

  if (venceuBoss) {
    console.log(
      `${colors.green}🎉 Vitória! O MiniBoss foi derrotado!${colors.reset}`
    );
    if (rand(1, 100) <= 20) {
      console.log(
        `${colors.green}🎁 A sua perseverança foi recompensada! Você obteve o ${colors.bright}Fragmento Antigo${colors.reset}${colors.green} do MiniBoss!${colors.reset}`
      );
      jogador.inventario.push("Fragmento Antigo");
    } else {
      console.log(
        `${colors.cyan}O MiniBoss não deixou cair o Fragmento Antigo.`
      );
    }
    checarLevelUp(jogador);
    return true;
  } else {
    console.log(
      `${colors.red}❌ Você foi derrotado pelo MiniBoss! A missão falhou.${colors.reset}`
    );
    jogador.hp = Math.floor(jogador.hpMax / 2);
    return false;
  }
}
