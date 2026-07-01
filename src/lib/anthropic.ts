import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const MODEL = 'claude-sonnet-4-5'

export async function callAgent(systemPrompt: string, userMessage: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8096,
    messages: [{ role: 'user', content: userMessage }],
    system: systemPrompt,
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')
  return content.text
}
