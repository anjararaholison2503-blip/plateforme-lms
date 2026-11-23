const catchAsync = require('../utils/catchAsync');
const aiProvider = require('../services/aiProvider');

exports.chatWithAssistant = catchAsync(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message requis' });
  }

  // Mode simulation
  if (aiProvider.isSimulation()) {
    return res.json({ 
      success: true, 
      data: { reply: `[Mode Simulation] Vous avez dit : "${message}"` }
    });
  }

  try {
    const prompt = `Tu es l'assistant virtuel de la plateforme LMS MasterClass. Réponds brièvement, poliment et utilement à l'étudiant. 
    
Question : "${message}"

Réponse :`;

    console.log(`🤖 [Chatbot] Envoi à ${aiProvider.getProviderName()}: "${message}"`);
    
    const aiResponse = await aiProvider.callAI(prompt, { temperature: 0.7 });
    
    console.log(`✅ [Chatbot] Réponse reçue: ${String(aiResponse).substring(0, 100)}...`);

    // Si c'est l'objet simulation (fallback), on gère
    if (aiResponse && typeof aiResponse === 'object' && aiResponse.__simulation) {
      return res.json({ 
        success: true, 
        data: { reply: `[Simulation] ${message}` }
      });
    }
    
    // Sinon, c'est une string (réponse réelle)
    res.json({ success: true, data: { reply: String(aiResponse) } });
    
  } catch (err) {
    console.error(`❌ [Chatbot] Erreur ${aiProvider.getProviderName()}:`, err.message);
    res.status(500).json({ 
      success: false, 
      message: "L'assistant est temporairement indisponible.",
      details: err.message 
    });
  }
});