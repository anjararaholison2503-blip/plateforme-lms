const catchAsync = require('../utils/catchAsync');
const aiProvider = require('../services/aiProvider');

exports.chatWithAssistant = catchAsync(async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message requis' });
  }

  // Si on est en mode simulation, on renvoie une réponse prédéfinie
  if (aiProvider.isSimulation()) {
    // On simule un petit délai pour faire "réel"
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ 
      success: true, 
      data: { 
        reply: `Ceci est une réponse simulée. Vous avez dit : "${message}". (Configurez une clé API pour une vraie réponse).` 
      }
    });
  }

  try {
    const prompt = `Tu es l'assistant virtuel de la plateforme LMS MasterClass. Tu aides les étudiants et les enseignants. Sois bref, poli et utile. Question de l'utilisateur : "${message}"`;
    
    // On passe le prompt à notre provider (OpenAI ou Gemini)
    const aiResponse = await aiProvider.callAI(prompt, { json: false });
    
    res.json({ success: true, data: { reply: aiResponse } });
  } catch (err) {
    console.error("Erreur Chatbot:", err);
    res.status(500).json({ success: false, message: "L'assistant est temporairement indisponible." });
  }
});