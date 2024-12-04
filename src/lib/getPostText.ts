import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Crear __dirname para ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al directorio base del proyecto
const baseDir: string = path.resolve(__dirname, "..", "..", "src");

// Ruta al archivo de seguimiento de frases no usadas
const tempFilePath: string = path.join(baseDir, "lib", "frases_no_usadas.json");

async function getUnusedPhrases(
  filePath: string
): Promise<{ allPhrases: string[]; unusedPhrases: string[] }> {
  try {
    // Leer el archivo frases.txt
    const fileContent: string = await fs.readFile(filePath, "utf-8");
    const allPhrases: string[] = fileContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (allPhrases.length === 0) {
      throw new Error(
        "El archivo frases.txt está vacío o no contiene frases válidas."
      );
    }

    let unusedPhrases: string[] = [];
    try {
      // Leer el archivo temporal de frases no usadas
      const tempContent: string = await fs.readFile(tempFilePath, "utf-8");
      const parsedContent = JSON.parse(tempContent);

      if (Array.isArray(parsedContent)) {
        unusedPhrases = parsedContent.filter((phrase) =>
          allPhrases.includes(phrase)
        );
      } else {
        console.warn(
          "El archivo frases_no_usadas.json no contiene un array válido. Restableciendo frases."
        );
        unusedPhrases = [...allPhrases];
      }
    } catch (error: any) {
      // Si no existe el archivo o hay un error, restablecer con todas las frases
      if (error.code !== "ENOENT") {
        console.warn("Error al leer frases_no_usadas.json:", error.message);
      }
      unusedPhrases = [...allPhrases];
    }

    // Si ya se usaron todas las frases, restablecer
    if (unusedPhrases.length === 0) {
      unusedPhrases = [...allPhrases];
    }

    return { allPhrases, unusedPhrases };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      throw new Error("No se pudo obtener las frases."); // Re-lanzar si es necesario
    } else {
      console.error("Error desconocido:", error);
      throw new Error("Ocurrió un error inesperado.");
    }
  }
}

async function saveUnusedPhrases(unusedPhrases: string[]): Promise<void> {
  try {
    // Guardar las frases no usadas en el archivo temporal
    await fs.writeFile(
      tempFilePath,
      JSON.stringify(unusedPhrases, null, 2),
      "utf-8"
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Error al guardar el archivo de frases no usadas:",
        error.message
      );
    } else {
      console.error(
        "Error desconocido al guardar el archivo de frases no usadas:",
        error
      );
    }
  }
}

export default async function getPostText(): Promise<string> {
  try {
    // Ruta absoluta a frases.txt
    const filePath: string = path.join(baseDir, "lib", "frases.txt");

    // Obtener frases y frases no usadas
    const { unusedPhrases } = await getUnusedPhrases(filePath);

    if (unusedPhrases.length === 0) {
      throw new Error("No hay frases disponibles para mostrar.");
    }

    // Elegir una frase aleatoria
    const randomIndex: number = Math.floor(
      Math.random() * unusedPhrases.length
    );
    const randomPhrase: string = unusedPhrases[randomIndex];

    // Actualizar las frases no usadas
    unusedPhrases.splice(randomIndex, 1); // Eliminar la frase seleccionada
    await saveUnusedPhrases(unusedPhrases);

    return randomPhrase;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error al obtener una frase:", error.message);
      throw new Error("No se pudo obtener la frase.");
    } else {
      console.error("Error desconocido al obtener una frase:", error);
      throw new Error(
        "No se pudo obtener la frase debido a un error desconocido."
      );
    }
  }
}
