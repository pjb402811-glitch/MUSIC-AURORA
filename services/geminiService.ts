import { GoogleGenAI, Type } from "@google/genai";
import { type MusicInfo } from '../types';

let ai: GoogleGenAI | null = null;

export const initializeAi = (apiKey: string) => {
    if (!apiKey) {
        console.error("API Key is missing for AI initialization.");
        ai = null;
        return;
    }
    ai = new GoogleGenAI({ apiKey });
};

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("AI client is not initialized. Please set the API Key.");
    }
    return ai;
};

const model = "gemini-2.5-flash";

export interface MusicInfoRequest {
    genre: string[];
    moods: string[];
    instruments: string[];
    songLength: string;
    musicStructure: string[];
    vocalTypes: string[];
    singingStyles: string[];
    tempo: string;
    rhythmGrooves: string[];
    mixingTextures: string[];
    sfx: string[];
    customPrompt?: string;
    generateLyrics: boolean;
    customLyricsPrompt?: string;
    manualLyrics?: string;
    manualSunoPrompt?: string;
}

export const generateMusicInfo = async ({ 
    genre, moods, instruments, songLength, customPrompt, generateLyrics, customLyricsPrompt, 
    manualLyrics, manualSunoPrompt, musicStructure, vocalTypes, 
    singingStyles, tempo, rhythmGrooves, mixingTextures, sfx 
}: MusicInfoRequest): Promise<MusicInfo> => {
    const isAcapella = genre.includes('아카펠라');
    const isInstrumental = vocalTypes.includes('보컬 없음 (Instrumental)');

    let instrumentalInstruction = '';
    if (isAcapella) {
        instrumentalInstruction = "The sunoPrompt must describe a purely acapella track. It should be composed entirely of human voices, such as beatboxing for percussion, vocal harmonies, and non-lyrical vocal melodies (e.g., 'oohs', 'aahs'). Crucially, do not include any lyrics, singing with words, rapping, or spoken word parts. The track must be purely instrumental using only the human voice as the instrument.";
    } else if (isInstrumental) {
        instrumentalInstruction = "The sunoPrompt must describe a purely instrumental track. Do not include any human voices, vocals, singing, rapping, or vocal samples.";
    }

    const generateLyricsForModel = generateLyrics && !isAcapella && !manualLyrics;

    let lyricInstruction = '';
    if (manualLyrics) {
        lyricInstruction = `The user has provided the following lyrics. Use these lyrics to inform your suggestions for title, description, tags, etc. Do not generate new lyrics.
---
Provided Lyrics:
${manualLyrics}
---`;
    } else if (generateLyricsForModel) {
        const vocalTypesText = vocalTypes.length > 0 ? ` The song should feature the following vocal types: ${vocalTypes.join(', ')}.` : '';
        const customLyricsText = customLyricsPrompt ? ` Additionally, a user has a specific request for the lyrics: "${customLyricsPrompt}". Please incorporate this.` : '';
        lyricInstruction = `Generate lyrics for the song in Korean, with a structure like [Verse], [Chorus].${vocalTypesText}${customLyricsText}`;
    }

    let sunoPromptInstruction = '';
    if (manualSunoPrompt) {
        sunoPromptInstruction = `The user has provided their own music generation prompt (sunoPrompt). Use this exact prompt in the final output. Your task is to generate the other fields (titles, artists, description, etc.) based on this provided prompt and other user requests.
---
Provided Suno Prompt:
${manualSunoPrompt}
---`;
    }
    
    const systemInstruction = `You are an expert music producer and creative director. Your task is to generate a rich set of information for a new music track based on user input. Return the response as a single, valid JSON object that conforms to the provided schema.`;

    const userPrompt = `Generate a rich set of information for a new music track based on the user's request below.

Provide:
1. "suggestedTitles": An array of 3 creative and suitable titles for the track in Korean.
2. "suggestedArtists": An array of 3 creative artist names that fit the genre and mood.
${manualSunoPrompt ? '' : '3. "sunoPrompt": A detailed prompt for an AI music generation service like Suno. This must be in English, using rich descriptive tags and phrases about music style, instrumentation, tempo, and feeling.'}
4. "description": A short, compelling album description in Korean.
5. "genre": An object with a "main" genre and an array of 2-3 relevant "subgenres".
6. "tags": An array of 5-7 relevant keywords/tags in Korean for music discovery.
${generateLyricsForModel ? '7. "lyrics": The generated lyrics in Korean.' : ''}

User's Request:
- Genres to blend: ${genre.join(', ')}
- Moods: ${moods.join(', ')}
${instruments.length > 0 ? `- Instruments: ${instruments.join(', ')}` : ''}
- Desired song length: ${songLength}
${musicStructure.length > 0 ? `- Music Structure: ${musicStructure.join(', ')}` : ''}
${vocalTypes.length > 0 ? `- Vocal Types: ${vocalTypes.join(', ')}` : ''}
${singingStyles.length > 0 ? `- Singing Styles: ${singingStyles.join(', ')}` : ''}
${tempo ? `- Tempo: ${tempo}` : ''}
${rhythmGrooves.length > 0 ? `- Rhythm/Groove: ${rhythmGrooves.join(', ')}` : ''}
${mixingTextures.length > 0 ? `- Mixing/Texture: ${mixingTextures.join(', ')}` : ''}
${sfx.length > 0 ? `- Sound Effects (SFX): ${sfx.join(', ')}` : ''}
- Additional details from user: ${customPrompt || 'None'}

${instrumentalInstruction}
${lyricInstruction}
${sunoPromptInstruction}
`;

    const schemaProperties: { [key: string]: any } = {
        suggestedTitles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3 suggested song titles in Korean." },
        suggestedArtists: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3 suggested artist names." },
        sunoPrompt: { type: Type.STRING, description: "A detailed prompt for AI music generation in English." },
        description: { type: Type.STRING, description: "A short album description in Korean." },
        genre: {
            type: Type.OBJECT,
            properties: {
                main: { type: Type.STRING, description: "The main genre that best describes the blended result." },
                subgenres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of relevant subgenres." }
            },
            required: ['main', 'subgenres']
        },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of relevant keywords or tags in Korean." },
    };

    if (generateLyricsForModel) {
        schemaProperties.lyrics = { type: Type.STRING, description: "Generated lyrics for the song in Korean, with structure like [Verse] and [Chorus]." };
    }
    // If user provides manual inputs, the AI doesn't need to generate them.
    if (manualSunoPrompt) delete schemaProperties.sunoPrompt;

    const contents = userPrompt;

    const response = await getAiClient().models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: schemaProperties,
            }
        }
    });

    const jsonText = (response.text ?? '').trim();
    const parsedJson = JSON.parse(jsonText || '{}');

    // Add back manual inputs if they were provided
    if (manualLyrics) {
      parsedJson.lyrics = manualLyrics;
    }
    if (manualSunoPrompt) {
      parsedJson.sunoPrompt = manualSunoPrompt;
    }
    
    // FIX: Add a robust validation layer to ensure the AI's response conforms to the expected MusicInfo structure.
    // This prevents crashes like "Cannot read properties of undefined" if the model omits a field.
    if (!parsedJson.suggestedTitles || !Array.isArray(parsedJson.suggestedTitles) || parsedJson.suggestedTitles.length === 0) {
      parsedJson.suggestedTitles = ['Untitled Track'];
    }
    if (!parsedJson.suggestedArtists || !Array.isArray(parsedJson.suggestedArtists) || parsedJson.suggestedArtists.length === 0) {
      parsedJson.suggestedArtists = ['Anonymous Artist'];
    }
    if (!parsedJson.genre) {
      parsedJson.genre = { main: genre[0] || 'Music', subgenres: [] };
    }
    if (!parsedJson.genre.main && genre.length > 0) {
        parsedJson.genre.main = genre[0];
    }
    if (!parsedJson.genre.subgenres) {
        parsedJson.genre.subgenres = [];
    }
    if (!parsedJson.sunoPrompt) parsedJson.sunoPrompt = "A beautiful song.";
    if (!parsedJson.description) parsedJson.description = "An AI-generated music track.";
    if (!parsedJson.tags) parsedJson.tags = [];
    if (generateLyricsForModel && !parsedJson.lyrics) {
      parsedJson.lyrics = "[가사 생성에 실패했습니다. 다시 시도해 주세요.]";
    }

    return parsedJson as MusicInfo;
};

export const analyzeLyricsForSuggestions = async (lyrics: string): Promise<{ genres: string[], moods: string[] }> => {
    const systemInstruction = `You are a music expert with a deep understanding of how lyrics correlate with musical genres and moods. Analyze the provided Korean lyrics and suggest suitable genres and moods. Respond only with a valid JSON object conforming to the schema.`;
    const userPrompt = `Please analyze the following lyrics and suggest 3-5 relevant genres and 3-5 relevant moods.
Lyrics:
---
${lyrics}
---`;

    const response = await getAiClient().models.generateContent({
        model,
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedGenres: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of 3-5 suggested genres in Korean."
                    },
                    suggestedMoods: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of 3-5 suggested moods in Korean."
                    }
                },
                required: ['suggestedGenres', 'suggestedMoods']
            }
        }
    });

    const jsonText = (response.text ?? '').trim();
    const parsed = JSON.parse(jsonText || '{}');
    return {
        genres: parsed.suggestedGenres || [],
        moods: parsed.suggestedMoods || []
    };
};

export const suggestInstruments = async (genres: string[], moods: string[], availableInstruments: string[]): Promise<string[]> => {
    const systemInstruction = `You are a music expert. Your task is to suggest musical instruments that fit a given set of genres and moods. You must only suggest instruments from the provided list. Respond with a JSON array of instrument names.`;
    const userPrompt = `Based on the genres "${genres.join(', ')}" and moods "${moods.join(', ')}", suggest 5 to 8 suitable instruments from the following list.

Available Instruments:
---
${availableInstruments.join('\n')}
---`;

    const response = await getAiClient().models.generateContent({
        model,
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 5-8 suggested instrument names from the provided list."
            }
        }
    });

    const jsonText = (response.text ?? '').trim();
    const parsed = JSON.parse(jsonText || '[]');
    // Filter to ensure AI only returned valid instruments
    return parsed.filter((instrument: string) => availableInstruments.includes(instrument));
};

export const regenerateSunoPrompt = async (musicInfo: MusicInfo, customRegenPrompt?: string): Promise<string> => {
    const systemInstruction = `You are an expert music producer. Your task is to generate a new, creative, and detailed prompt for an AI music generation service like Suno, based on the provided music concept. The prompt should be in English, using rich descriptive tags and phrases about music style, instrumentation, tempo, and feeling. Respond with ONLY the new Suno prompt text, without any extra formatting or explanation.`;
    const customRequestText = customRegenPrompt ? ` The user has provided specific feedback for this regeneration: "${customRegenPrompt}". Please incorporate this feedback into the new prompt.` : '';

    const userPrompt = `Generate a new Suno prompt based on the following music concept.
    ${customRequestText}

    Music Concept:
    - Genre: ${musicInfo.genre.main} (${musicInfo.genre.subgenres.join(', ')})
    - Description: ${musicInfo.description}
    - Tags: ${musicInfo.tags.join(', ')}
    `;

    const response = await getAiClient().models.generateContent({
        model,
        contents: userPrompt,
        config: {
            systemInstruction,
        }
    });

    return response.text?.trim() ?? '';
};

export const regenerateLyrics = async (musicInfo: MusicInfo, vocalTypes: string[], customLyricsPrompt?: string): Promise<string> => {
    const systemInstruction = `You are a professional lyricist. Your task is to write new, creative lyrics based on a music concept. The lyrics should be in Korean with a structure like [Verse], [Chorus]. Respond with ONLY the new lyrics, without any extra formatting or explanation.`;
    
    let vocalistText = '';
    if (vocalTypes.length > 0) {
        vocalistText = ` The lyrics should be suitable for the following vocal types: ${vocalTypes.join(', ')}.`;
    }
    
    const customLyricsText = customLyricsPrompt ? ` Additionally, the user has made a specific request for the lyrics: "${customLyricsPrompt}". Please incorporate this request.` : '';

    const userPrompt = `Please write new lyrics based on the music concept below.
    ${vocalistText}
    ${customLyricsText}

    Music Concept:
    - Title: ${musicInfo.suggestedTitles[0]}
    - Artist: ${musicInfo.suggestedArtists[0]}
    - Genre: ${musicInfo.genre.main}
    - Description: ${musicInfo.description}
    `;

    const response = await getAiClient().models.generateContent({
        model,
        contents: userPrompt,
        config: {
            systemInstruction,
        }
    });

    return response.text?.trim() ?? '';
};

export const suggestTitlesFromInfo = async (musicInfo: MusicInfo): Promise<string[]> => {
    const systemInstruction = `You are a creative copywriter and music A&R specialist. Based on the provided music information, generate a list of 5 new, compelling, and commercially viable song titles in Korean. Respond with only a JSON array of 5 strings.`;

    const userPrompt = `Generate 5 new song titles based on the following music information.

    Music Information:
    - Genre: ${musicInfo.genre.main}
    - Description: ${musicInfo.description}
    - Suno Prompt: ${musicInfo.sunoPrompt}
    - Lyrics: ${musicInfo.lyrics || 'No lyrics provided.'}
    `;

    const response = await getAiClient().models.generateContent({
        model,
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    const jsonText = (response.text ?? '').trim();
    return JSON.parse(jsonText || '[]');
};