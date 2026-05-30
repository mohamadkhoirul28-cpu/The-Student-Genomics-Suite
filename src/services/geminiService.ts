const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

/**
 * Tier 1: Direct Gemini API call from browser
 * Gemini supports CORS — no backend proxy needed!
 */
export async function callGeminiDirect(
  prompt: string, 
  apiKey: string
): Promise<string> {
  console.log('[Gemini Direct] Calling API...');
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,  // ← INCREASED from 1024 to 4096
        topP: 0.8,
        topK: 40
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
    console.error('[Gemini Direct] API error:', errorMsg);
    throw new Error(`Gemini API error: ${errorMsg}`);
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  console.log('[Gemini Direct] Success, response length:', text.length);
  return text;
}

/**
 * Tier 2: Test if API key is valid
 */
export async function testGeminiConnection(apiKey: string): Promise<boolean> {
  try {
    const result = await callGeminiDirect(
      'Say "api connected" and nothing else.', 
      apiKey
    );
    return result.toLowerCase().includes('connected') || result.toLowerCase().includes('api');
  } catch (err) {
    console.error('[Gemini Direct] Connection test failed:', err);
    return false;
  }
}
