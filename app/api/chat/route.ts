import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { messages } = body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'پیام‌ها معتبر نیستند' },
                { status: 400 }
            )
        }

        const lastMessage = messages[messages.length - 1]

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock responses based on user input
        const mockResponses = [
            'سلام! من یک دستیار هوشمند هستم. چطور می‌تونم کمکتون کنم؟',
            'این یک پاسخ فرضی از هوش مصنوعی است.',
            'سوال جالبی پرسیدید! بذارید بهش فکر کنم...',
            'متوجه منظورتون شدم. این موضوع رو می‌تونم بررسی کنم.',
            'ممنون که با من در میان گذاشتید. چیز دیگه‌ای هم هست که بتونم کمکتون کنم؟'
        ]

        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
        const contextualResponse = `پاسخ فرضی به: ${lastMessage.content}\n\n${randomResponse}`

        // Return OpenAI-like structure
        return NextResponse.json({
            choices: [
                {
                    message: {
                        role: 'assistant',
                        content: contextualResponse
                    }
                }
            ]
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'خطا در پردازش درخواست' },
            { status: 500 }
        )
    }
}
