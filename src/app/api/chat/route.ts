import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { getTextProvider, getVisionProvider, getImageProvider, getVideoProvider, getTTSProvider } from '@/lib/ai/router'
import type { AIMessage } from '@/lib/ai/types'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'
export const maxDuration = 120
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let user
  try {
    user = await requireAuth()
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await req.json() as {
      conversationId: string
      message: string
      imageUrls?: string[]
      model?: string
    }

    const { conversationId, message, imageUrls, model } = body

    // Verify conversation ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // last 20 messages for context
          select: { role: true, content: true },
        },
      },
    })

    if (!conversation) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), { status: 404 })
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'USER',
        content: message,
        contentType: imageUrls?.length ? 'IMAGE' : 'TEXT',
      },
    })

    // Build conversation history for AI
    const history: AIMessage[] = conversation.messages.map(m => ({
      role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: m.content,
    }))

    // Transform image URLs into base64 if they are local
    const processedImageUrls: string[] = []
    if (imageUrls) {
      for (const url of imageUrls) {
        if (url.startsWith('/api/files/')) {
          const fileId = url.split('/').pop()
          if (fileId) {
            const dbFile = await prisma.file.findUnique({ where: { id: fileId } })
            if (dbFile) {
              const filePath = join(/*turbopackIgnore: true*/ process.cwd(), dbFile.storageKey)
              try {
                const buffer = await readFile(filePath)
                const base64 = buffer.toString('base64')
                processedImageUrls.push(`data:${dbFile.mimeType};base64,${base64}`)
                continue
              } catch (e) {
                console.error('Failed to read local file for vision API', e)
              }
            }
          }
        }
        processedImageUrls.push(url)
      }
    }

    // Add the new user message
    const newMessage: AIMessage = {
      role: 'user',
      content: processedImageUrls.length
        ? [
            ...processedImageUrls.map(url => {
              if (url.startsWith('data:image/')) {
                return { type: 'image_url' as const, image_url: { url } }
              }
              return { type: 'file_url' as const, file_url: { url } }
            }),
            { type: 'text' as const, text: message },
          ]
        : message,
    }
    history.push(newMessage)

    // Choose provider based on whether images are included
    let fullResponse = ''

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let systemPrompt = `You are Akayam, an advanced AI assistant created to be a friendly, engaging, and highly capable companion. You excel at role-playing, teaching concepts clearly like an expert tutor, and having natural, friendly conversations (similar to ChatGPT). You strictly protect user privacy and confidentiality. Never ask for, extract, or store sensitive personal information like real passwords, addresses, or financial data. Be warm, empathetic, and adaptable to whatever role or teaching style the user requests. Provide clear, accurate, and well-structured responses. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Do not hallucinate or invent real-time live data (like current weather, news, or stock prices) if you do not have a tool to fetch it; honestly explain that you cannot access live data. When the user attaches files, documents, or images, thoroughly analyze them and extract insights in whatever language they ask for.`

          // Specialized tool workflows based on quick actions
          if (message.startsWith('Write a ')) {
            systemPrompt += ' You are now acting as an expert Writer and Copywriter. Produce high-quality, engaging, and well-structured written content based on the user\'s request. Focus on tone, clarity, and impact.'
          } else if (message.startsWith('Write code to ')) {
            systemPrompt += ' You are now acting as an expert Software Engineer. Provide robust, clean, secure, and well-documented code. Follow best practices. Explain your logic briefly but prioritize providing working code.'
          } else if (message.startsWith('Analyze this data and give me insights: ')) {
            systemPrompt += ' You are now acting as an expert Data Analyst. Break down the provided data, identify trends, correlations, anomalies, and key insights. Present your findings clearly using Markdown tables, bullet points, and structured headers.'
          } else if (message.startsWith('Summarize and analyze this document: ')) {
            systemPrompt += ' You are now acting as an expert Document Researcher. Provide a concise executive summary followed by key takeaways, main arguments, and a brief critical analysis of the provided text.'
          } else if (message.startsWith('Create a video concept for ')) {
            systemPrompt += ' You are now acting as a Creative Director. Provide a detailed video concept including visual style, pacing, target audience, script outline, and scene-by-scene breakdown.'
          }

          let generator: AsyncGenerator<string>

          const msgLower = message.toLowerCase()
          
          const imageMatch = message.match(/(?:generate|make|create)?.*(?:image|photo|pic).*?(?:of\s+)?([\s\S]*)/i) || message.match(/generate image\s*([\s\S]*)/i)
          const videoMatch = message.match(/(?:generate|make|create)?.*video.*?(?:of\s+)?([\s\S]*)/i) || message.match(/generate video\s*([\s\S]*)/i)
          const audioMatch = message.match(/(?:speak|say|voice|audio)(?:.*(?:for|of|:))?\s*["']?([^"']+)["']?/i) || message.match(/(?:generate|make|create)?.*(?:voice|audio|speak|sound).*?(?:of|for\s+)?([\s\S]*)/i)

          if (imageMatch && imageMatch[1].trim()) {
            const prompt = imageMatch[1].trim()
            const imageProvider = getImageProvider()
            if (!imageProvider.isConfigured()) {
              const msg = `**[]** Image generation API is unconfigured.\n\nPlease configure \`GEMINI_API_KEY\`.`
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
              fullResponse = msg
            } else {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: "*Generating image...*\n\n" })}\n\n`))
                const res = await imageProvider.generateImage({ prompt })
                let url = res.images[0]?.url
                if (!url && res.images[0]?.base64) {
                   url = `data:image/jpeg;base64,${res.images[0].base64}`
                }
                const msg = `![Generated Image](${url})\n\nHere is your image for: "${prompt}"`
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
                fullResponse = msg
              } catch (e: any) {
                throw new Error(`Image generation failed: ${e.message}`)
              }
            }
          } else if (videoMatch && videoMatch[1].trim()) {
            const prompt = videoMatch[1].trim()
            const videoProvider = getVideoProvider()
            if (!videoProvider.isConfigured()) {
              const msg = `**[]** Video generation API is unconfigured.\n\nPlease configure \`GEMINI_API_KEY\`.`
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
              fullResponse = msg
            } else {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: "*Submitting video generation request to Veo 3.1...*\n\n" })}\n\n`))
                const res = await videoProvider.generateVideo({ prompt })
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: `*Job ${res.jobId} is processing. This may take several minutes...*\n\n` })}\n\n`))
                // Note: Polling here for a long time could cause timeouts in some environments, but we'll try for up to 3 mins.
                let status = res
                let attempts = 0
                while (status.status === 'processing' && attempts < 18) { // 3 minutes (10s * 18)
                  await new Promise(r => setTimeout(r, 10000))
                  status = await videoProvider.getJobStatus(res.jobId)
                  attempts++
                }
                
                if (status.status === 'completed' && status.videoUrl) {
                  let msg = ''
                  if (status.videoUrl.includes('youtube.com/embed')) {
                    msg = `<iframe src="${status.videoUrl}" class="w-full aspect-video rounded-lg my-4" allowfullscreen></iframe>\n\nHere is your generated video.`
                  } else {
                    msg = `<video src="${status.videoUrl}" controls class="w-full rounded-lg my-4"></video>\n\nHere is your generated video.`
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
                  fullResponse = msg
                } else if (status.status === 'processing') {
                  throw new Error(`Video generation timed out waiting for job ${res.jobId}.`)
                } else {
                  throw new Error(`Video generation failed: ${status.error}`)
                }
              } catch (e: any) {
                throw new Error(e.message)
              }
            }
          } else if (audioMatch && audioMatch[1].trim()) {
            const text = audioMatch[1].trim()
            const ttsProvider = getTTSProvider()
            if (!ttsProvider.isConfigured()) {
              const msg = `**[]** TTS API is unconfigured.\n\nPlease configure \`GEMINI_API_KEY\`.`
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
              fullResponse = msg
            } else {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: "*Generating audio...*\n\n" })}\n\n`))
                const res = await ttsProvider.synthesize({ text })
                
                let url = (res as any).url
                if (!url) {
                  const b64 = res.audioBuffer.toString('base64')
                  url = `data:${res.mimeType};base64,${b64}`
                }
                
                const msg = `<audio src="${url}" controls class="w-full my-4"></audio>\n\n<a href="${url}" download="akayam-voice.mp3" class="text-cyan-400 hover:underline">Click here to download the audio</a>\n\nHere is your generated voice for: "${text}"`
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
                fullResponse = msg
              } catch (e: any) {
                throw new Error(`Audio generation failed: ${e.message}`)
              }
            }
          } else if (processedImageUrls.length) {
            const visionProvider = getVisionProvider()
            if (!visionProvider.isConfigured()) {
              const msg = `**[]** Vision/Document AI API is currently unconfigured. \n\nI received your message with ${processedImageUrls.length} file(s) or image(s).\n\nTo enable document and image analysis, please configure the \`GEMINI_API_KEY\` environment variable.`
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
              fullResponse = msg
            } else {
              generator = visionProvider.streamAnalyzeImage(processedImageUrls, message, history.slice(0, -1))
              for await (const chunk of generator) {
                fullResponse += chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              }
            }
          } else {
            const textProvider = getTextProvider()
            if (!textProvider.isConfigured()) {
              const msg = `**[]** AI API is currently unconfigured. \n\nI received your message: _"${message}"_\n\nTo enable full AI capabilities, please configure the \`GEMINI_API_KEY\` environment variable.`
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: msg })}\n\n`))
              fullResponse = msg
            } else {
              generator = textProvider.streamText({
                messages: history,
                systemPrompt,
                model,
                stream: true,
              })
              for await (const chunk of generator) {
                fullResponse += chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              }
            }
          }

          // Signal done
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

          // Save AI response to DB
          const aiMessage = await prisma.message.create({
            data: {
              conversationId,
              role: 'ASSISTANT',
              content: fullResponse,
              contentType: 'TEXT',
              model: model ?? 'gemini-3.8-flash',
            },
          })

          // Update conversation updatedAt
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          })

          // Auto-generate title if this is the first exchange
          if (conversation.messages.length === 0 && !conversation.title) {
            const newTitle = message.slice(0, 40) + (message.length > 40 ? '...' : '')
            prisma.conversation.update({
              where: { id: conversationId },
              data: { title: newTitle || 'New Conversation' },
            }).catch(console.error)
          }

        } catch (streamError: any) {
          const errMsg = streamError?.message || 'Something went wrong while generating your response. Please try again.'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: errMsg, error: true })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          console.error('[chat stream error]', streamError)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return new Response(JSON.stringify({ error: 'Chat request failed' }), { status: 500 })
  }
}

