import { colors } from "./../utilitarios.js";
import { ICONS } from "./../icons.js";

const PERCENTUAL_VENDA = 0.30; // 30% do valor original

export async function venderItens(jogador) {
  console.log(`\n${ICONS.LOJA} ${colors.bright}${colors.cyan}=== VENDER ITENS ===${colors.reset}`);
  console.log(`${colors.yellow}Você recebe 30% do valor original dos itens.${colors.reset}\n`);

  // Filtra itens que podem ser vendidos (armas e armaduras)
  const itensVendiveis = jogador.inventario.filter(
    (item) => item.slot === "weapon" || 
    (item.slot && item.slot !== "consumable")
  );

  if (itensVendiveis.length === 0) {
    console.log(`${colors.red}Você não possui armas ou armaduras para vender.${colors.reset}`);
    return;
  }

  // Array para armazenar itens selecionados para venda
  let itensSelecionados = [];
  let continuarSelecionando = true;

  while (continuarSelecionando) {
    // Limpa a tela e mostra o estado atual
    console.log(`\n${colors.cyan}=== ITENS DISPONÍVEIS PARA VENDA ===${colors.reset}`);
    console.log(`${colors.gray}Seu ouro atual: ${colors.yellow}${jogador.ouro}${colors.reset}\n`);

    // Mostra itens disponíveis
    itensVendiveis.forEach((item, index) => {
      const valorVenda = Math.floor(item.preco * PERCENTUAL_VENDA);
      const jaSelecionado = itensSelecionados.includes(index);
      const marcador = jaSelecionado ? `${colors.green}[✓]${colors.reset}` : `${colors.gray}[ ]${colors.reset}`;
      
      const icone = item.slot === "weapon" ? ICONS.ARMA : ICONS.ARMADURA;
      console.log(
        `${marcador} [${index + 1}] ${icone} ${colors.white}${item.nome}${colors.reset} - ${colors.yellow}${valorVenda}${colors.reset} ouro ${colors.gray}(${item.preco} original)${colors.reset}`
      );
    });

    // Mostra itens selecionados e total
    if (itensSelecionados.length > 0) {
      const totalVenda = itensSelecionados.reduce((total, idx) => {
        return total + Math.floor(itensVendiveis[idx].preco * PERCENTUAL_VENDA);
      }, 0);
      
      console.log(`\n${colors.green}Itens selecionados: ${itensSelecionados.length}${colors.reset}`);
      console.log(`${colors.green}Total da venda: ${colors.yellow}${totalVenda}${colors.reset} ${colors.green}ouro${colors.reset}`);
    }

    // Opções
    console.log(`\n${colors.cyan}Opções:${colors.reset}`);
    console.log(`${colors.white}[Número]${colors.reset} - Adicionar/Remover item da seleção`);
    console.log(`${colors.green}[V]${colors.reset} - Vender itens selecionados`);
    console.log(`${colors.yellow}[L]${colors.reset} - Limpar seleção`);
    console.log(`${colors.red}[0]${colors.reset} - Cancelar e voltar`);

    const escolha = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim().toLowerCase());
      });
    });

    // Processar escolha
    if (escolha === "0") {
      console.log(`${colors.yellow}Venda cancelada.${colors.reset}`);
      continuarSelecionando = false;
    } else if (escolha === "v") {
      if (itensSelecionados.length === 0) {
        console.log(`${colors.red}Nenhum item selecionado para venda!${colors.reset}`);
        await aguardar(1500);
      } else {
        // Confirmar venda
        const totalVenda = itensSelecionados.reduce((total, idx) => {
          return total + Math.floor(itensVendiveis[idx].preco * PERCENTUAL_VENDA);
        }, 0);

        console.log(`\n${colors.yellow}Confirmar venda de ${itensSelecionados.length} item(ns) por ${totalVenda} ouro? (s/n)${colors.reset}`);
        
        const confirmacao = await new Promise((resolve) => {
          process.stdin.once("data", (key) => {
            resolve(key.toString().trim().toLowerCase());
          });
        });

        if (confirmacao === "s") {
          // Realizar venda
          // Ordena índices em ordem decrescente para remover corretamente
          const indicesOrdenados = [...itensSelecionados].sort((a, b) => b - a);
          
          indicesOrdenados.forEach((idx) => {
            const item = itensVendiveis[idx];
            const indexNoInventario = jogador.inventario.indexOf(item);
            if (indexNoInventario !== -1) {
              jogador.inventario.splice(indexNoInventario, 1);
            }
          });

          jogador.ouro += totalVenda;

          console.log(`\n${ICONS.SUCESSO} ${colors.green}Venda realizada com sucesso!${colors.reset}`);
          console.log(`${ICONS.OURO} ${colors.yellow}+${totalVenda} ouro${colors.reset}`);
          console.log(`${colors.gray}Ouro total: ${colors.yellow}${jogador.ouro}${colors.reset}`);
          
          continuarSelecionando = false;
        } else {
          console.log(`${colors.yellow}Venda cancelada.${colors.reset}`);
          await aguardar(1000);
        }
      }
    } else if (escolha === "l") {
      itensSelecionados = [];
      console.log(`${colors.yellow}Seleção limpa.${colors.reset}`);
      await aguardar(1000);
    } else {
      // Tentar adicionar/remover item
      const numero = parseInt(escolha);
      if (!isNaN(numero) && numero >= 1 && numero <= itensVendiveis.length) {
        const index = numero - 1;
        const posicao = itensSelecionados.indexOf(index);
        
        if (posicao !== -1) {
          // Item já selecionado, remover
          itensSelecionados.splice(posicao, 1);
          console.log(`${colors.yellow}Item removido da seleção.${colors.reset}`);
        } else {
          // Adicionar item
          itensSelecionados.push(index);
          console.log(`${colors.green}Item adicionado à seleção.${colors.reset}`);
        }
        await aguardar(500);
      } else {
        console.log(`${colors.red}Opção inválida!${colors.reset}`);
        await aguardar(1000);
      }
    }
  }
}

// Função auxiliar para aguardar
function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
