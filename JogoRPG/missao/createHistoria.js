import { promisify } from "util";
import https from "https";

const delay = promisify(setTimeout);

// === SUBSTITUA ESTE VALOR PELA SUA CHAVE DE API REAL ===
const API_KEY = "AIzaSyDSSlheMgY8F3Ow_wITUGO5oV1QrMeZmoY";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// Função para imprimir texto caractere por caractere
export async function printCharByChar(text, charDelay = 40) {
  for (const char of text) {
    process.stdout.write(char);
    await delay(charDelay);
  }
  process.stdout.write("\n");
}

// A função para gerar a história agora é exportada
export async function gerarHistoria(missao) {
  const systemPrompt =
    "Você é um mestre de RPG. Sua tarefa é criar uma breve e cativante introdução narrativa para uma missão, usando apenas a descrição e a história fornecidas. A narrativa deve ser envolvente e inspiradora. Não adicione diálogos ou escolhas. Apenas a narrativa. A história pode ter cerca de 4 a 6 frases.";
  const userQuery = `Gere uma história para a missão com a seguinte descrição: "${missao.descricao}" e história: "${missao.historia}".`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(`${API_URL}?key=${API_KEY}`, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          const candidate = result.candidates && result.candidates[0];
          const content = candidate && candidate.content;
          const part = content && content.parts && content.parts[0];
          const story = part && part.text;

          resolve(story || "Falha ao gerar história.");
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}
