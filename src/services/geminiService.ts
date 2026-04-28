import { GoogleGenAI } from '@google/genai';

const getApiKey = () => {
  // @ts-ignore
  let apiKey = process.env.GEMINI_API_KEY || process.env.API_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_GEMINI_KEY;
  
  if (apiKey === 'undefined' || apiKey === 'null') {
      apiKey = null;
  }

  if (!apiKey) {
      apiKey = localStorage.getItem('custom_gemini_api_key');
      if (!apiKey) {
          apiKey = window.prompt("Chave da API do Gemini não encontrada no ambiente (Vercel).\nPara continuar usando as funções de IA, por favor cole sua GEMINI_API_KEY abaixo:");
          if (apiKey && apiKey.trim().length > 0) {
              localStorage.setItem('custom_gemini_api_key', apiKey.trim());
          } else {
              throw new Error("Chave da API não fornecida. Operação cancelada.");
          }
      }
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
                                    text: `Você é um assistente de vendas. Escute o áudio e extraia: 1) Nome do Produto/Serviço. 2) Valor da venda. 3) Método de pagamento.${inventoryContext} ATENÇÃO: Se o áudio estiver vazio, mudo, tiver só ruídos ou não conter nenhuma informação óbvia sobre uma venda, você DEVE retornar o JSON {"error": "Nenhuma venda identificada no áudio"}. Caso detecte a venda, responda APENAS em um JSON estruturado com {"produto": "...", "valor": 50.00, "pagamento": "PIX"}. NUNCA invente dados. Retorne as chaves em minúsculo e apenas esse objeto JSON.`
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
                   const parsed = JSON.parse(textOutput);
                   if (parsed.error) {
                       reject(new Error(parsed.error));
                   } else if (!parsed.produto || parsed.produto.toLowerCase() === 'não identificado' || parsed.valor === 0) {
                       reject(new Error("Aúdio inválido ou informações da venda estão incompletas. Fale o produto e o valor claramente."));
                   } else {
                       resolve(parsed);
                   }
                } else {
                   reject(new Error("A IA não retornou texto."));
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
                            text: 'Analise esta imagem (recibo, produto ou comprovante) e extraia: 1) Nome do Produto/Serviço. 2) Valor total. 3) Método de pagamento. Se não houver nada relacionado a uma venda ou recibo, retorne {"error": "Nenhuma venda identificada na imagem"}. Caso contrário, responda APENAS em JSON estruturado com {"produto": "...", "valor": 100.00, "pagamento": "..."}. NUNCA invente dados e assegure-se de usar letras minúsculas nas chaves.'
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json"
            }
        });

        const textOutput = response.text;
        if (textOutput) {
           const parsed = JSON.parse(textOutput);
           if (parsed.error) {
               throw new Error(parsed.error);
           } else if (!parsed.produto || parsed.produto.toLowerCase() === 'não identificado' || parsed.valor === 0) {
               throw new Error("Imagem inválida ou informações da venda estão incompletas. Fotografe um comprovante nítido.");
           } else {
               return parsed;
           }
        }
        throw new Error("Sem resposta válida");
    } catch (error) {
        console.error("Erro no Gemini:", error);
        throw error;
    }
}

export async function processTextSale(textInput: string, inventoryNames: string[] = []): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
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
                            text: `Você é um assistente de vendas. Leia o seguinte texto e extraia: 1) Nome do Produto/Serviço. 2) Valor da venda. 3) Método de pagamento.${inventoryContext} Texto: "${textInput}" ATENÇÃO: Se o texto for irrelevante ou não contiver informação sobre uma venda, você DEVE retornar o JSON {"error": "Nenhuma venda identificada no texto"}. Caso detecte a venda, responda APENAS em um JSON estruturado com {"produto": "...", "valor": 50.00, "pagamento": "PIX"}. NUNCA invente dados. Retorne as chaves em minúsculo e apenas esse objeto JSON.`
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
            const parsed = JSON.parse(textOutput);
            if (parsed.error) {
                throw new Error(parsed.error);
            } else if (!parsed.produto || parsed.produto.toLowerCase() === 'não identificado' || parsed.valor === 0) {
                throw new Error("Texto inválido ou informações da venda estão incompletas. Escreva o produto e o valor claramente.");
            } else {
                return parsed;
            }
        }
        throw new Error("Sem resposta válida");
    } catch (error) {
        console.error("Erro no Gemini (texto):", error);
        throw error;
    }
}
