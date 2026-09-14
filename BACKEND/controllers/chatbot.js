const SYSTEM_PROMPT = `
Tu es l'assistant virtuel de Staydar, une plateforme de location d'appartements en Algerie.
Tu guides les utilisateurs sur l'utilisation du site UNIQUEMENT.
Fonctionnalites du site :
- Recherche et filtrage des logements par ville, type, prix et note
- Notation des logements de 1 a 5 etoiles
- Reservation : cliquer sur "Reserver" ouvre la fiche de contact du proprietaire (connexion requise)
- Inscription / connexion par email ou avec Google
- Gestion du profil : nom, email, telephone, adresse
- Devenir hote : publier son propre logement depuis la page profil
- Panneau admin pour la gestion des utilisateurs
Reponds en francais, de facon concise et amicale.
Si la question ne concerne pas Staydar, reponds poliment que tu ne peux aider qu'avec l'utilisation du site Staydar.
`;

export const chatWithBot = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const { message, history = [] } = req.body || {};

  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const contents = history
    .filter((m) => m && typeof m.content === 'string')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(502).json({ error: 'Gemini API request failed' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || null;

    if (!reply) {
      return res.status(502).json({ error: 'No reply from Gemini API' });
    }

    return res.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    return res.status(500).json({ error: 'Chatbot service unavailable' });
  }
};