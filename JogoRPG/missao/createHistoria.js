import { GoogleGenerativeAI } from "@google/generative-ai";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config(); // Carrega API_KEY do .env

const delay = promisify(setTimeout);

// Inicializa a IA com a chave do .env
const ai = new GoogleGenerativeAI(process.env.API_KEY);

// Função para imprimir texto caractere por caractere
export async function printCharByChar(text, charDelay = 40) {
    for (const char of text) {
        process.stdout.write(char);
        await delay(charDelay);
    }
    process.stdout.write("\n");
}

// Gera a história usando Gemini
export async function gerarHistoria(missao) {
    const systemPrompt =
        "Você é um mestre de RPG. Sua tarefa é criar uma breve e cativante introdução narrativa para uma missão, usando apenas a descrição e a história fornecidas. A narrativa deve ser envolvente e inspiradora. Não adicione diálogos ou escolhas. Apenas a narrativa. A história pode ter cerca de 4 a 6 frases.";

    const userQuery = `Descrição: "${missao.descricao}". História: "${missao.historia}".`;

    try {
        // Usando o método correto para gerar conteúdo
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const response = await model.generateContent({
            contents: [
                { role: "system", parts: [{ text: systemPrompt }] },
                { role: "user", parts: [{ text: userQuery }] },
            ],
        });

        // Retorna o texto limpo
        return response.response.text();
    } catch (error) {
        console.error("Erro ao chamar API Gemini:", error);
        return "Falha ao gerar história.";
    }
}