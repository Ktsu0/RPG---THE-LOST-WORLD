import { rand, colors } from "./../utilitarios.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

export function tentarSairMasmorra(state) {
    const confirmouSaida = prompt("Deseja realmente sair? (s/n): ").toLowerCase();

    if (confirmouSaida !== "s") {
        console.log("Você decide continuar explorando a masmorra.");
        return false;
    }
    const secretMessages = [
        "Sua fuga ecoa pelas paredes da masmorra. Para os que ficaram, seu nome é sinônimo de covardia.",
        "Você se retira da masmorra, mas os monstros que sobraram agora conhecem sua fraqueza.",
        "O eco de sua fuga agora é uma piada entre os monstros.",
        "Seu nome é agora uma lenda.\nDe fracasso entre os monstros que você deixou para trás.",
    ];
    const mensagemSecreta = secretMessages[rand(0, secretMessages.length - 1)];
    console.log(`\n${colors.green}${mensagemSecreta}${colors.reset}`);

    state.masmorraAtual = null; // Limpa o estado da masmorra
    return true;
}

export function tentarSairTorre(jogador) {
    const chanceDeFuga = 0.6; // 60% de chance de sucesso

    // Pede confirmação antes de tentar a fuga
    const confirmouSaida = prompt(
        "Deseja realmente sair da Torre? (s/n): "
    ).toLowerCase();

    if (confirmouSaida !== "s") {
        console.log("Você decide não arriscar e permanece na Torre.");
        return false;
    }

    // Tenta a fuga
    if (Math.random() <= chanceDeFuga) {
        console.log(
            `${colors.green}🏃 Você conseguiu sair da torre com sucesso!${colors.reset}`
        );
        return true;
    } else {
        console.log(
            `${colors.red}❌ Sua tentativa de fuga falhou! A batalha continua...${colors.reset}`
        );
        return false;
    }
}