import { rand, colors } from "./../utilitarios.js";

export async function tentarSairMasmorra(state) {
  console.log("Deseja realmente sair? (s/n): ");
  const confirmouSaida = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim().toLowerCase());
    });
  });

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

export async function tentarSairTorre() {
  const chanceDeFuga = 0.6; // 60% de chance de sucesso

  // Pede confirmação antes de tentar a fuga
  console.log("Deseja realmente sair da Torre? (s/n): ");
  const confirmouSaida = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim().toLowerCase());
    });
  });

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
