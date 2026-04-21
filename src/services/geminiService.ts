const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada. Defina na Vercel e faça um novo deploy.');
  }
  return apiKey;
};

const MODEL_NAME = 'gemini-1.5-flash';

export async function processAudioSale(audioBlob: Blob): Promise<any> {
    const apiKey = getApiKey();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    inlineData: {
                                        data: base64Data,
                                        mimeType: 'audio/webm'
                                    }
                                },
                                {
                                    text: 'Você é um assistente de vendas. Escute o áudio e extraia: 1) Nome do Produto/Serviço. 2) Valor da venda. 3) Método de pagamento. Responda APENAS em um JSON estruturado com {"produto": "...", "valor": 50.00, "pagamento": "PIX"}'
                                }
                            ]
                        }],
                        generationConfig: {
                            responseMimeType: "application/json"
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`Erro na API (${response.status})`);
                }

                const data = await response.json();
                const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
                
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
    const apiKey = getApiKey();
    const base64Data = base64Image.split(',')[1];
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
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
                }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API (${response.status})`);
        }

        const data = await response.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if(textOutput) {
           return JSON.parse(textOutput);
        }
        throw new Error("Sem resposta válida");
    } catch (error) {
        console.error("Erro no Gemini:", error);
        throw error;
    }
}
