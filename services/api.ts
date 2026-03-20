import { UserProfile } from "../types";

// RF-31: Credenciais do Vendedor de Teste
const MP_ACCESS_TOKEN = "TEST-5946053599534972-011015-3ef0b946877947653ca2213615c383b9-493587454"; 
export const MP_PUBLIC_KEY = "TEST-4438df60-8893-4f18-8dfa-fec565a838c1";

interface AuthResponse {
  user: UserProfile;
  token: string;
}

interface PaymentPreferenceResponse {
  sandbox_init_point: string;
  id: string;
}

// Inicialização do SDK no Frontend
try {
  // @ts-ignore
  if (window.MercadoPago) {
    // @ts-ignore
    const mp = new window.MercadoPago(MP_PUBLIC_KEY);
    console.log("Mercado Pago SDK initialized");
  }
} catch (e) {
  console.warn("Mercado Pago SDK not loaded");
}

export const api = {
  // RF-23: Authentication Logic (Mock Backend)
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        user: { name: 'Usuário Exemplo', email },
        token: 'mock_jwt_token_' + Date.now()
      };
    },

    register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        user: { name, email },
        token: 'mock_jwt_token_' + Date.now()
      };
    }
  },

  // RF-24: Payment Logic (Web Redirect)
  payment: {
    createPreference: async (planId: 'monthly' | 'yearly', user: UserProfile): Promise<PaymentPreferenceResponse> => {
      console.log("Creating Preference for Checkout Pro...");
      
      const isYearly = planId === 'yearly';
      const title = isYearly ? "Plano Anual MyCash Premium" : "Plano Mensal MyCash Premium";
      const price = isYearly ? 175.00 : 20.00;
      
      const [firstName, ...lastNameParts] = (user.name || "Usuário").split(" ");
      const lastName = lastNameParts.join(" ") || "App";

      // --- CORREÇÃO DE URL E REDIRECIONAMENTO ---
      // Usamos window.location.origin para garantir uma URL limpa (ex: https://meu-app.com ou http://localhost:5173)
      // Sem barras extras ou query params antigos.
      const origin = window.location.origin;
      
      // Definimos URLs simples. O Mercado Pago adicionará automaticamente ?collection_id=... etc.
      const backUrls = {
        success: `${origin}/?mp_status=success`,
        failure: `${origin}/?mp_status=failure`,
        pending: `${origin}/?mp_status=pending`
      };

      const preferenceData = {
        items: [
          {
            id: planId,
            title: title,
            description: isYearly ? "Acesso Premium por 1 ano" : "Acesso Premium Mensal",
            quantity: 1,
            currency_id: "BRL",
            unit_price: price,
            picture_url: "https://cdn-icons-png.flaticon.com/512/2454/2454282.png"
          }
        ],
        payer: {
          // E-mail genérico único para evitar conflito de "pagar a si mesmo"
          email: `test_user_${Date.now()}@test.com`,
          name: firstName,
          surname: lastName,
          // Não enviamos address/identification para evitar erros de validação no Sandbox
        },
        back_urls: backUrls,
        auto_return: "approved", // OBRIGATÓRIO para voltar sozinho em 10s
        binary_mode: true, // Apenas aprovado ou rejeitado
        statement_descriptor: "MYCASH APP",
        external_reference: `REF-${Date.now()}`
      };

      try {
        const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
          },
          body: JSON.stringify(preferenceData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("MP API Error:", errorData);
          throw new Error("Falha ao criar preferência.");
        }

        const data = await response.json();
        return {
          sandbox_init_point: data.sandbox_init_point, 
          id: data.id
        };
      } catch (error: any) {
        console.error("Payment Error:", error.message);
        
        // Fallback Seguro (Modo Demo) caso a API falhe ou bloqueie
        // Isso garante que você consiga testar o fluxo de "Sucesso" no app mesmo se o MP falhar
        console.warn("Ativando modo Demo de fallback.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          sandbox_init_point: `${origin}/?mp_status=success&demo_mode=true`,
          id: "mock_id"
        };
      }
    },

    verifyPayment: async (paymentId: string): Promise<boolean> => {
      // Simulação de verificação no backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true; 
    }
  }
};