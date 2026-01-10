import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyse les données de santé pour fournir des conseils personnalisés.
 */
export const getHealthInsights = async (healthData: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyse ces données de santé pour un sapeur-pompier et donne 3 conseils courts, opérationnels et percutants : ${JSON.stringify(healthData)}. Réponds uniquement en JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text).insights;
  } catch (error) {
    console.error("Gemini Health Insights Error:", error);
    return ["Maintenez une hydratation constante.", "Surveillez votre récupération cardiaque.", "Progressez par paliers pour éviter les blessures."];
  }
};

/**
 * Génère un message d'encouragement dynamique pour la synthèse vocale.
 */
export const getAIVoiceCoach = async (context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `En tant que coach expert pour pompiers, donne un message d'encouragement ou un conseil technique très court (maximum 12 mots) pour la situation suivante : ${context}. Sois motivant et autoritaire.`,
    });
    return response.text;
  } catch (error) {
    return "Allez soldat, on maintient l'effort !";
  }
};

/**
 * Analyse une séance terminée pour le résumé de l'historique.
 */
export const getWorkoutAnalysis = async (workout: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `En tant que coach expert pour sapeurs-pompiers, analyse cette séance : 
      Titre: ${workout.title}, Durée: ${workout.duration}, Intensité: ${workout.intensity}, 
      Calories: ${workout.calories}, Exercices: ${JSON.stringify(workout.exercises)}.
      Donne un résumé motivant et 2 axes d'amélioration opérationnelle. Réponds uniquement en JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "tips"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Workout Analysis Error:", error);
    return {
      summary: "Belle séance effectuée avec régularité.",
      tips: ["Gardez le dos droit sur les charges.", "Travaillez votre souffle."]
    };
  }
};

// --- AUDIO TTS LOGIC ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Lit un texte avec la voix Gemini TTS.
 */
export const speakEncouragement = async (text: string) => {
  try {
    const savedUser = localStorage.getItem('firefit_user');
    const userVoice = savedUser ? JSON.parse(savedUser).voicePreference : 'male';
    const voiceName = userVoice === 'female' ? 'Puck' : 'Kore';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioCtx,
        24000,
        1
      );
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};