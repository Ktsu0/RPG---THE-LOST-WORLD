import { menuAmuletoTalisma } from "./../menuPrincipal.js";
import { getRaridadeCor } from "./../../../codigosUniversais.js";
import { colors } from "./../../../utilitarios.js";

// A função agora é assíncrona
export async function menuTalismaSupremo(jogador) {
  // Exibir o menu e os requisitos
  console.log(
    `\n${colors.bright}🗼 Menu do Talismã da Torre 🗼${colors.reset}`
  );
  console.log(
    `${colors.white}Para criar o Amuleto Supremo você precisa dos seguintes itens:${colors.reset}`
  );

  const itensNecessarios = [
    { nome: "Fragmento Antigo", raridade: "lendario", max: 10 },
  ];
  const ouroNecessario = 2000;

  // Contar quantos itens o jogador possui
  itensNecessarios.forEach((item) => {
    item.qtd = jogador.inventario.filter((i) => i === item.nome).length;
  });

  // Exibir itens com cores de raridade e conclusão
  itensNecessarios.forEach((item) => {
    const corRaridade = getRaridadeCor(item.raridade);
    const corQtd = item.qtd >= item.max ? colors.green : colors.red;
    console.log(
      `${corRaridade}${item.nome} ${colors.bright}(${item.raridade})${colors.reset} [${corQtd}${item.qtd}${colors.reset}/${item.max}]`
    );
  });

  // Exibir ouro necessário
  const corOuro = jogador.ouro >= ouroNecessario ? colors.green : colors.red;
  console.log(
    `Ouro necessário: [${corOuro}${jogador.ouro}/${ouroNecessario}${colors.reset}]`
  );

  // Aguarda a escolha do jogador de forma assíncrona
  const opcao = await new Promise((resolve) => {
    console.log(
      `${colors.green}[1] CRAFTAR${colors.reset} | ${colors.gray}[2] SAIR${colors.reset}`
    );
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });

  if (opcao === "1") {
    const possuiTodosItens = itensNecessarios.every(
      (item) => item.qtd >= item.max
    );
    const possuiOuro = jogador.ouro >= ouroNecessario;

    if (possuiTodosItens && possuiOuro) {
      console.log(
        `${colors.green}✅ Você criou o Talismã da Torre!${colors.reset}`
      );
      itensNecessarios.forEach((item) => {
        for (let i = 0; i < item.max; i++) {
          const idx = jogador.inventario.indexOf(item.nome);
          if (idx !== -1) jogador.inventario.splice(idx, 1);
        }
      });
      jogador.ouro -= ouroNecessario;
      jogador.inventario.push("Talismã da Torre");
    } else {
      console.log(
        `${colors.red}❌ Você não possui os itens e/ou o ouro necessários!${colors.reset}`
      );
    }
  } else if (opcao === "2") {
    console.log("Saindo...");
    menuAmuletoTalisma();
  } else {
    console.log("Opção inválida.");
  }
}
