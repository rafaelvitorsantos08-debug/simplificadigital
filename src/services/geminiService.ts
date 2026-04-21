import { GoogleGenAI } from '@google/genai';

const getApiKey = () => {
  // Try mapping injected define variables first, then import meta.
  // We use direct static references so Vite can textually replace them at build time.
  // @ts-ignore
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada. Defina na aba de Environment Variables da Vercel e FAÇA UM NOVO DEPLOY para aplicar.');
  }
  return apiKey;
};

const MODEL_NAME = 'gemini-2.5-flash';

export async function processAudioSale(audioBlob: Blob, inventoryNames: string[] = []): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            
            const inventoryContext = inventoryNames.length > 0 
                ? ` Aqui está a lista dos produtos atuais do meu estoque: [${inventoryNames.join(', ')}]. Tente encontrar uma correspondência exata nesta lista se a venda for sobre algum deles, caso não encontre, grave o nome extraído livremente.`
                : '';

            try {
                const response = await ai.models.generateContent({
                    model: MODEL_NAME,
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    inlineData: {
                                        data: base64Data,
                                        mimeType: 'audio/webm'
                                    }
                                },
                                {
                                    text: `Você é um assistente de vendas. Escute o áudio e extraia: 1) Nome do Produto/Serviço. 2) Valor da venda. 3) Método de pagamento.${inventoryContext} Responda APENAS em um JSON estruturado com {"produto": "...", "valor": 50.00, "pagamento": "PIX"}. Retorne as chaves em minúsculo e apenas esse objeto JSON.`
                                }
                            ]
                        }
                    ],
                    config: {
                        responseMimeType: "application/json"
                    }
                });

                const textOutput = response.text;
                if(textOutput) {
                   resolve(JSON.parse(textOutput));
                } else {
                   reject("A IA não retornou texto.");
                }
            } catch (error) {
                console.error("Erro no Gemini:", error);
                reject(error);
            }
        };
        reader.onerror = reject;
    });
}

export async function processPhotoSale(base64Image: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const base64Data = base64Image.split(',')[1];
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: 'image/jpeg'
                            }
                        },
                        {
                            text: 'Analise esta imagem (recibo, produto ou comprovante) e extraia: 1) Nome do Produto/Serviço. 2) Valor total. 3) Método de pagamento. Responda APENAS em JSON estruturado com {"produto": "...", "valor": 100.00, "pagamento": "..."}. Se algum campo não for encontrado, tente deduzir ou deixe null.'
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json"
            }
        });

        const textOutput = response.text;
        if(textOutput) {
           return JSON.parse(textOutput);
        }
        throw new Error("Sem resposta válida");
    } catch (error) {
        console.error("Erro no Gemini:", error);
        throw error;
    }
}
