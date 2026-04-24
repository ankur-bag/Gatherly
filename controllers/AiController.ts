interface GeminiPart {
  text?: string
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[]
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
  error?: {
    message?: string
  }
}

async function callGemini(model: string, apiKey: string, prompt: string): Promise<{ revised?: string; error?: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  )

  const data = (await response.json()) as GeminiResponse

  if (!response.ok) {
    return { error: data.error?.message || `${response.status} ${response.statusText}` }
  }

  const revised = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim()
  if (!revised) {
    return { error: 'empty output from model' }
  }

  return { revised }
}

export async function improveEventDescription(userId: string, description: string): Promise<string> {
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const input = description.trim()
  if (!input) {
    throw new Error('Description is required')
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('AI service is not configured')
  }

  const prompt = [
    'Rewrite this event description in polished, engaging English.',
    'Keep the original meaning and factual details intact.',
    'Do not add any new facts, dates, locations, or promises.',
    'Return only the revised description text.',
    '',
    input,
  ].join('\n')

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash']
  const errors: string[] = []

  for (const model of models) {
    const result = await callGemini(model, apiKey, prompt)
    if (result.revised) {
      return result.revised
    }
    if (result.error) {
      errors.push(`${model}: ${result.error}`)
    }
  }

  throw new Error(`AI service request failed: ${errors.join(' | ')}`)
}
