import { rand, colors } from "./../utilitarios.js";
import { ICONS } from "./../icons.js";

export async function tentarSairMasmorra(jogador) {
  // Verifica se o jogador está na entrada da masmorra
  const naEntrada = 
    jogador.masmorraAtual &&
    jogador.masmorraAtual.state &&
    jogador.masmorraAtual.state.x === jogador.masmorraAtual.dungeon.entrance.x &&
    jogador.masmorraAtual.state.y === jogador.masmorraAtual.dungeon.entrance.y;

  if (naEntrada) {
    // Está na entrada - pode sair sem penalidades
    console.log(
      `\n${ICONS.SAIDA} ${colors.cyan}Você está na entrada da masmorra.${colors.reset}`
    );
    console.log(`${colors.green}Deseja sair? (s/n):${colors.reset} `);
    
    const confirmouSaida = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim().toLowerCase());
      });
    });

    if (confirmouSaida !== "s") {
      console.log(
        `${colors.yellow}Você decide continuar explorando a masmorra.${colors.reset}`
      );
      return false;
    }

    const mensagensSaida = [
      "Você sai da masmorra em segurança, pronto para novas aventuras.",
      "A luz do dia te recebe enquanto você deixa a masmorra para trás.",
      "Você emerge da escuridão, vitorioso em sua decisão de sair.",
      "A masmorra ficará aqui, aguardando seu retorno.",
    ];
    const mensagem = mensagensSaida[rand(0, mensagensSaida.length - 1)];
    console.log(`\n${ICONS.SUCESSO} ${colors.green}${mensagem}${colors.reset}`);
    
    jogador.masmorraAtual = null;
    return true;
  } else {
    // NÃO está na entrada - terá penalidades
    console.log(
      `\n${ICONS.AVISO} ${colors.yellow}ATENÇÃO: Você não está na entrada da masmorra!${colors.reset}`
    );
    console.log(
      `${colors.red}Sair agora pode resultar em perda de itens ou ouro.${colors.reset}`
    );
    console.log(
      `${colors.cyan}Para sair sem penalidades, retorne à entrada da masmorra.${colors.reset}\n`
    );
    console.log(`${colors.yellow}Deseja arriscar e sair mesmo assim? (s/n):${colors.reset} `);

    const confirmouSaida = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim().toLowerCase());
      });
    });

    if (confirmouSaida !== "s") {
      console.log(
        `${colors.green}Você decide continuar explorando e buscar a entrada.${colors.reset}`
      );
      return false;
    }

    // Aplica penalidades - APENAS UMA PENALIDADE POR VEZ
    console.log(
      `\n${ICONS.FUGA} ${colors.yellow}Você foge às pressas da masmorra...${colors.reset}\n`
    );

    let perdeuAlgo = false;

    // 1. Tenta perder POÇÕES primeiro (40% de chance)
    const pocoes = jogador.inventario.filter((item) => item.nome === "Poção de Cura");
    if (!perdeuAlgo && pocoes.length > 0 && rand(1, 100) <= 40) {
      const quantidadePerder = Math.min(rand(1, 3), pocoes.length);
      for (let i = 0; i < quantidadePerder; i++) {
        const index = jogador.inventario.findIndex(
          (item) => item.nome === "Poção de Cura"
        );
        if (index !== -1) {
          jogador.inventario.splice(index, 1);
        }
      }
      console.log(
        `${ICONS.POCAO} ${colors.red}Você perdeu ${quantidadePerder} Poção(ões) de Cura na fuga!${colors.reset}`
      );
      perdeuAlgo = true;
    }

    // 2. Se não perdeu poção, tenta perder ARMADURA (15% de chance)
    if (!perdeuAlgo) {
      const armaduras = jogador.inventario.filter(
        (item) => item.slot && item.slot !== "weapon" && item.slot !== "consumable"
      );
      if (armaduras.length > 0 && rand(1, 100) <= 15) {
        const armaduraPerder = armaduras[rand(0, armaduras.length - 1)];
        const index = jogador.inventario.indexOf(armaduraPerder);
        jogador.inventario.splice(index, 1);
        console.log(
          `${ICONS.ARMADURA} ${colors.red}Você perdeu ${armaduraPerder.nome} na fuga!${colors.reset}`
        );
        perdeuAlgo = true;
      }
    }

    // 3. Se não perdeu armadura, tenta perder ARMA (10% de chance)
    if (!perdeuAlgo) {
      const armas = jogador.inventario.filter((item) => item.slot === "weapon");
      if (armas.length > 0 && rand(1, 100) <= 10) {
        const armaPerder = armas[rand(0, armas.length - 1)];
        const index = jogador.inventario.indexOf(armaPerder);
        jogador.inventario.splice(index, 1);
        console.log(
          `${ICONS.ARMA} ${colors.red}Você perdeu ${armaPerder.nome} na fuga!${colors.reset}`
        );
        perdeuAlgo = true;
      }
    }

    // 4. Se não perdeu nada ainda, tenta perder OURO (30% de chance)
    if (!perdeuAlgo && jogador.ouro > 0 && rand(1, 100) <= 30) {
      const ouroPerder = Math.floor(jogador.ouro * rand(10, 30) / 100);
      jogador.ouro -= ouroPerder;
      console.log(
        `${ICONS.OURO} ${colors.red}Você perdeu ${ouroPerder} de ouro na fuga!${colors.reset}`
      );
      perdeuAlgo = true;
    }

    // 5. Se não perdeu nada, teve sorte!
    if (!perdeuAlgo) {
      console.log(
        `${ICONS.SUCESSO} ${colors.green}Por sorte, você conseguiu fugir sem perder nada!${colors.reset}`
      );
    }

    const mensagensFuga = [
      "Sua fuga ecoa pelas paredes da masmorra. Para os que ficaram, seu nome é sinônimo de covardia.",
      "Você se retira da masmorra, mas os monstros que sobraram agora conhecem sua fraqueza.",
      "O eco de sua fuga agora é uma piada entre os monstros.",
      "Seu nome é agora uma lenda de fracasso entre os monstros que você deixou para trás.",
    ];
    const mensagemFuga = mensagensFuga[rand(0, mensagensFuga.length - 1)];
    console.log(`\n${colors.gray}${mensagemFuga}${colors.reset}\n`);

    jogador.masmorraAtual = null;
    return true;
  }
}

export async function tentarSairTorre() {
  const chanceDeFuga = 0.6; // 60% de chance de sucesso

  // Pede confirmação antes de tentar a fuga
  console.log(`${colors.yellow}Deseja realmente sair da Torre? (s/n):${colors.reset} `);
  const confirmouSaida = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim().toLowerCase());
    });
  });

  if (confirmouSaida !== "s") {
    console.log(
      `${colors.cyan}Você decide não arriscar e permanece na Torre.${colors.reset}`
    );
    return false;
  }

  // Tenta a fuga
  if (Math.random() <= chanceDeFuga) {
    console.log(
      `${ICONS.FUGA} ${colors.green}Você conseguiu sair da torre com sucesso!${colors.reset}`
    );
    return true;
  } else {
    console.log(
      `${ICONS.ERRO} ${colors.red}Sua tentativa de fuga falhou! A batalha continua...${colors.reset}`
    );
    return false;
  }
}

