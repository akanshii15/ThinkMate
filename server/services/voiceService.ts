import { transcribeAudio } from "../_core/voiceTranscription";

/**
 * Transcribe audio file to text using Whisper API
 * @param audioUrl - URL to the audio file (must be publicly accessible)
 * @param language - Optional language code (e.g., 'en' for English)
 * @returns Transcribed text
 */
export async function transcribeDecisionProblem(
  audioUrl: string,
  language?: string
): Promise<string> {
  try {
    const result = await transcribeAudio({
      audioUrl,
      language: language || "en",
      prompt: "Transcribe the user's decision problem or question clearly",
    });

    if ('text' in result) {
      return result.text || "";
    }
    throw new Error(result.error || "Unknown transcription error");
  } catch (error: any) {
    console.error("Voice transcription error:", error);
    throw new Error(error?.message || "Failed to transcribe audio");
  }
}
