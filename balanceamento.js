process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

console.log("Teste stdin: pressione WASD ou Ctrl+C para sair");

process.stdin.on("data", (key) => {
  if (key === "\u0003") {
    console.log("Saindo...");
    process.exit();
  }
  console.log("Você pressionou:", key);
});
