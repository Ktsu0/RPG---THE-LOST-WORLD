import { colors, rand } from "./../utilitarios.js";

// A função agora é assíncrona
export async function usarPocao(jogador) {
  // Conta quantos itens de cada tipo o jogador possui
  let qtdPocao = jogador.inventario.filter(
    (i) => i.nome === "Poção de Cura"
  ).length;
  let qtdNectar = jogador.inventario.filter(
    (i) => i.nome === "Néctar da Vida Eterna"
  ).length;

  if (qtdPocao === 0 && qtdNectar === 0) {
    console.log(
      `${colors.red}❌ Você não possui nenhum item de cura no seu inventário!${colors.reset}`
    );
    return false;
  }

  console.log(
    `\n${colors.white}=== ITENS DE CURA DISPONÍVEIS ===${colors.reset}`
  );
  if (qtdPocao > 0)
    console.log(
      ` [1] ${colors.cyan}Poção de Cura${colors.reset} (${colors.green}${qtdPocao} disponíveis${colors.reset})`
    );
  if (qtdNectar > 0)
    console.log(
      ` [2] ${colors.magenta}Néctar da Vida Eterna${colors.reset} (${colors.green}${qtdNectar} disponíveis${colors.reset})`
    );
  console.log("[0] Cancelar");

  // Await pela escolha do jogador
  const escolha = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });

  switch (escolha) {
    case "1": {
      if (qtdPocao === 0) {
        console.log(
          `${colors.red}Você não possui Poção de Cura.${colors.reset}`
        );
        return false;
      }
      const indexPocao = jogador.inventario.findIndex(
        (i) => i.nome === "Poção de Cura"
      );
      jogador.inventario.splice(indexPocao, 1);

      const curaMin = Math.floor(jogador.hpMax * 0.15);
      const curaMax = Math.floor(jogador.hpMax * 0.25);
      const cura = rand(curaMin, curaMax);

      jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);

      console.log(
        `🧪 ${colors.cyan}Você usou uma Poção de Cura e recuperou ${cura} HP!${colors.reset} (HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset})`
      );

      return true;
    }
    case "2": {
      if (qtdNectar === 0) {
        console.log(
          `${colors.red}Você não possui Néctar da Vida Eterna.${colors.reset}`
        );
        return false;
      }

      // Await pela confirmação do jogador
      const confirmar = await new Promise((resolve) => {
        process.stdin.once("data", (key) => {
          resolve(key.toString().trim());
        });
      });

      if (confirmar.toLowerCase() !== "sim") {
        console.log(`${colors.yellow}Ação cancelada.${colors.reset}`);
        return false;
      }

      const indexNectar = jogador.inventario.findIndex(
        (i) => i.nome === "Néctar da Vida Eterna"
      );
      jogador.inventario.splice(indexNectar, 1);
      jogador.hp = jogador.hpMax;

      console.log(
        `💖 ${colors.magenta}Você usou o Néctar da Vida Eterna e sua vida foi completamente restaurada!${colors.reset}`
      );
      console.log(
        `HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset}`
      );
      return true;
    }
    case "0":
      console.log(`${colors.yellow}Ação cancelada.${colors.reset}`);
      return false;

    default:
      console.log(
        `${colors.red}Escolha inválida. Ação cancelada.${colors.reset}`
      );
      return false;
  }
}
