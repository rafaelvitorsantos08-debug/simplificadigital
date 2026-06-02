import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { default as mercadopago, MercadoPagoConfig, Preference } from "mercadopago";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes para Mercado Pago
  app.post("/api/create-preference", async (req, res) => {
    try {
      const { planType, amount, email, uid } = req.body;
      
      const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!mpToken) {
        return res.status(500).json({ error: "Token do Mercado Pago não configurado. Adicione MERCADOPAGO_ACCESS_TOKEN nas configurações." });
      }

      // Inicializa o cliente do Mercado Pago com o token do usuário
      const client = new MercadoPagoConfig({ accessToken: mpToken });
      const preference = new Preference(client);

      const response = await preference.create({
        body: {
          items: [
             {
               id: planType,
               title: `Plano ${planType} - Simplifica Digital`,
               quantity: 1,
               unit_price: Number(amount)
             }
          ],
          payer: {
             email: email
          },
          external_reference: uid,
          auto_return: "approved",
          back_urls: {
             success: `${process.env.APP_URL || 'http://localhost:3000'}/`,
             failure: `${process.env.APP_URL || 'http://localhost:3000'}/`,
             pending: `${process.env.APP_URL || 'http://localhost:3000'}/`
          }
        }
      });
      
      res.json({ id: response.id, init_point: response.init_point });
    } catch (e: any) {
      console.error("Erro ao criar preferência MP:", e);
      res.status(500).json({ error: e.message || "Erro interno no servidor." });
    }
  });

  // Webhook para receber notificação de pagamento pago.
  app.post("/api/webhook/mercadopago", async (req, res) => {
      // Neste endpoint você conectaria com o Firebase Admin SDK 
      // para atualizar status do usuário (isPro, isPlus, etc).
      console.log('Webhook Mercado Pago recebido:', req.body);
      res.sendStatus(200);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
