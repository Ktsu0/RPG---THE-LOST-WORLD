import { getRaridadeCor } from "./../../../codigosUniversais.js";
import { colors } from "./../../../utilitarios.js";
import promptSync from "prompt-sync";
import { gerenciarAmuleto } from "./gerenciador.js";
import { menuAmuletoTalisma } from "./../menuPrincipal.js";
const prompt = promptSync();

// --- Menu Amuleto Supremo ---
export function menuAmuletoSupremo(jogador) {
  console.log(`\n${colors.bright}🔮 Menu do Amuleto 🔮${colors.reset}`);
  console.log(
    `${colors.white}Para criar o Amuleto Supremo você precisa dos seguintes itens:${colors.reset}`
  );

  const itensNecessarios = [
    { nome: "Pena do Corvo Sombrio", raridade: "comum", max: 5 },
    { nome: "Pergaminho Arcano", raridade: "comum", max: 5 },
    { nome: "Flor da Aurora", raridade: "comum", max: 5 },
    { nome: "Essência da Noite", raridade: "raro", max: 2 },
    { nome: "Relíquia Brilhante", raridade: "raro", max: 2 },
    { nome: "Página Amaldiçoada", raridade: "raro", max: 2 },
    { nome: "Máscara Sombria", raridade: "raro", max: 2 },
    { nome: "Gema da Escuridão", raridade: "lendario", max: 1 },
    { nome: "Escama de Dragão Azul", raridade: "lendario", max: 1 },
    { nome: "Coração de Magma", raridade: "lendario", max: 1 },
  ];

  // Contar quantos o jogador possui
  itensNecessarios.forEach((item) => {
    item.qtd = jogador.inventario.filter((i) => i === item.nome).length;
  });

  // Mostrar lista com cores
  itensNecessarios.forEach((item) => {
    const corRaridade = getRaridadeCor(item.raridade);
    const corQtd = item.qtd >= item.max ? colors.green : colors.red;
    console.log(
      `${corRaridade}${item.nome} ${colors.bright}(${item.raridade})${colors.reset}  [${corQtd}${item.qtd}${colors.reset}/${item.max}]`
    );
  });

  console.log(
    `\n${colors.magenta}Bônus do Amuleto Supremo: ${colors.bright}+5% ATK e +10% VIDA${colors.reset}`
  );

  const opcao = prompt(
    `${colors.green}[1] CRAFTAR${colors.reset} | ${colors.gray}[2] SAIR${colors.reset}: `
  );

  if (opcao === "1") {
    const possuiTodos = itensNecessarios.every((item) => item.qtd >= item.max);

    if (possuiTodos) {
      console.log(
        `${colors.green}Você criou o Amuleto Supremo!${colors.reset}`
      );
      gerenciarAmuleto(jogador);

      // Remove os itens usados
      itensNecessarios.forEach((item) => {
        for (let i = 0; i < item.max; i++) {
          const idx = jogador.inventario.indexOf(item.nome);
          if (idx !== -1) jogador.inventario.splice(idx, 1);
        }
      });

      jogador.inventario.push("Amuleto Supremo");
      jogador.amuletoEquipado = false; // ainda não equipado
    } else {
      console.log(
        `${colors.red}❌ Você não possui todos os itens necessários!${colors.reset}`
      );
    }
  } else {
    menuAmuletoTalisma(jogador);
  }
}
