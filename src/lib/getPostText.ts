import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Crear __dirname para ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al directorio base del proyecto
const baseDir = path.resolve(__dirname, "..", "..", "src");

export default async function getPostText() {
  try {
    // Ruta absoluta a frases.txt
    const filePath = path.join(baseDir, "lib", "frases.txt");
    const fileContent = await fs.readFile(filePath, "utf-8");

    // Dividir el contenido del archivo en un array de frases
    const frases = fileContent.split("\n").filter((line) => line.trim() !== "");

    // Elegir una frase aleatoria
    const randomIndex = Math.floor(Math.random() * frases.length);
    return frases[randomIndex];
  } catch (error) {
    console.error("Error al leer el archivo frases.txt:", error);
    throw new Error("No se pudo obtener la frase.");
  }
}
