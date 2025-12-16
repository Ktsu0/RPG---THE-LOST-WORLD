import { colors, rand, lerInput, exibirTitulo } from "./../utilitarios.js";
import { aplicarStatusPorTurno } from "../itens/equipamentos/efeitos/armasEfeitos.js";
import { verificarFimDeJogo } from "./../verificar/derrota/derrota.js";
import { finalizarVitoria } from "./../verificar/vitoria/vitoria.js";
import { ataqueJogador } from "./ataqueJogador/ataqueJogador.js";
import { ataqueInimigo } from "./ataqueInimigo/ataqueInimigo.js";
import { processarCuraXama } from "./../personagem/habilidades.js";
import { exibirStatusBatalha } from "./../codigosUniversais.js";
import { usarPocao } from "../itens/pocaoCura.js";
import { salvarJogo } from "../sistema/saveSystem.js";

/**
 * Sistema Unificado de Batalha
 * @param {Object} inimigo - Objeto do inimigo
 * @param {Object} jogador - Objeto do jogador
 * @param {Object} configuracao - Opções extras { modo: 'normal'|'onda'|'torre', dificuldade: 1, itens: [] }
 */
export async function sistemaBatalha(inimigo, jogador, configuracao = {}) {
  const modo = configuracao.modo || 'normal';
  
  exibirTitulo(`CRONICAS: ${inimigo.nome}`, colors.red);
  console.log(`${colors.gray}HP INIMIGO: ${inimigo.hp}${colors.reset}`);

  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;
    console.log(`\n--- Rodada ${rodadas} ---`);

    // 1. Processamento de Turno (Passivo)
    processarCuraXama(jogador);
    aplicarStatusPorTurno(jogador, inimigo);
    
    // Verifica se morreu por status
    if (inimigo.hp <= 0) break;
    if (jogador.hp <= 0) break;

    // 2. Interface de Status
    exibirStatusBatalha(jogador, inimigo);

    // 3. Ação do Jogador
    const escolha = await lerInput(
      `${colors.red}[1] Atacar${colors.reset}  ${colors.blue}[2] Usar Poção${colors.reset}  ${colors.gray}[3] Fugir${colors.reset}: `
    );

    if (escolha === '1') {
      // Usando o sistema de ataque existente, mas adaptando para ser mais genérico se necessário
      // Nota: ataqueJogador pode precisar de ajustes se for muito acoplado ao sistema antigo,
      // mas por enquanto vamos manter a compatibilidade.
      await ataqueJogador(inimigo, jogador, rodadas, esqueletosInvocados, escolha);
      
      // Auto-save após ação crítica? Talvez pesado demais. Melhor no fim da batalha.
    } 
    else if (escolha === '2') {
      await usarPocao(jogador);
    } 
    else if (escolha === '3') {
        // Fuga
        if (modo === 'torre' || modo === 'onda') {
            console.log(`${colors.red}🚫 Você não pode fugir desta batalha!${colors.reset}`);
        } else {
            if (rand(1, 100) > 40) { // 60% chance
                console.log(`${colors.green}💨 Você fugiu com sucesso!${colors.reset}`);
                return false; // Fuga = false (não ganhou, mas sobreviveu)
            } else {
                console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
            }
        }
    } 
    else {
      console.log(`${colors.yellow}Opção inválida! Perdeu a vez.${colors.reset}`);
    }

    if (inimigo.hp <= 0) break;

    // 4. Ação do Inimigo
    await ataqueInimigo(inimigo, jogador, esqueletosInvocados);
    
    // 5. Verificar Fim de Jogo (Morte Jogador)
    if (verificarFimDeJogo(jogador)) {
        console.log(`${colors.red}💀 Você foi derrotado!${colors.reset}`);
        // Salva o estado de derrota
        salvarJogo(jogador);
        return false;
    }
  }

  // Pós-Batalha
  salvarJogo(jogador); // Salva o estado final da batalha

  if (inimigo.hp <= 0) {
    console.log(`${colors.green}🎉 INIMIGO DERROTADO!${colors.reset}`);
    // Se for modo normal, dá recompensas normais.
    // Se for onda/torre, a recompensa é gerida pelo controlador da onda.
    if (modo === 'normal') {
        finalizarVitoria(inimigo, jogador, configuracao.dificuldade, configuracao.itens);
    }
    return true;
  }

  return false;
}
