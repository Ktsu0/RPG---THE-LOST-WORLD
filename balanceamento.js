import { GoogleGenerativeAI } from "@google/generative-ai";
import promptSync from "prompt-sync";
import dotenv from "dotenv";

// Carregar variáveis do .env
dotenv.config();

// Inicializa input
const prompt = promptSync();

// Inicializa IA com a chave do .env
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function main() {
    const pergunta = prompt("Digite sua pergunta para a IA: ");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(pergunta);

        // Resposta vem encapsulada → usar .response.text()
        const resposta = result.response.text();

        console.log("\n✨ Resposta da IA:");
        console.log(resposta);
    } catch (err) {
        console.error("❌ Erro ao chamar API Gemini:", err);
    }
}

await main();