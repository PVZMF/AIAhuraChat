"use client"
import { Bot, Moon, Send, Sun } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from '@/lib/utils'
import ThemeToggle from "./themeToggle";


interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}
export default function ChatbotWidget() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isDark, setIsDark] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    // Load messages from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('chatMessages')
        if (saved) {
            const parsed = JSON.parse(saved)
            setMessages(parsed.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            })))
        }

        const darkMode = localStorage.getItem('darkMode') === 'true'
        setIsDark(darkMode)
        if (darkMode) {
            document.documentElement.classList.add('dark')
        }
    }, [])

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages))
        }
    }, [messages])

    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }

            // Fallback: scroll container directly
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
            }
        }

        // Immediate scroll
        scrollToBottom()

        // Delayed scroll to ensure DOM has updated
        const timeoutId = setTimeout(scrollToBottom, 100)

        return () => clearTimeout(timeoutId)
    }, [messages, isTyping])

    const sendMessage = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        try {
            // Send request to local API with OpenAI-like structure
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messages.concat(userMessage).map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                })
            })

            if (!response.ok) {
                throw new Error('خطا در دریافت پاسخ')
            }

            const data = await response.json()

            // Parse OpenAI-like response structure
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }


    return (
        <div dir="rtl" className="flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[90vh] bg-chat-container-bg backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-chat-message-border">
                <div className="bg-linear-to-r from-chat-header-from to-chat-header-to p-6 flex items-center justify-between">
                    <div className="flex items-center justify-center gap-4">
                        <div className=" size-14 rounded-full bg-linear-to-br from-chat-bot-avatar-from to-chat-bot-avatar-to flex items-center justify-center text-white shadow-md">
                            <Bot />
                        </div>
                        <div>
                            <h1 className="text-white text-xl font-bold">دستیار هوشمند</h1>
                            <p className="text-white/80 text-sm">آنلاین و آماده پاسخگویی</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    dir="ltr"
                    className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    سلام! چطور می‌تونم کمکتون کنم؟
                                </h2>
                                <p className="text-muted-foreground">
                                    پیام خود را بنویسید تا گفتگو را شروع کنیم
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'flex gap-3 items-start',
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        {message.role === 'assistant' && <div className={cn(
                                            'w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-sm',
                                            'bg-linaer-to-br from-chat-bot-avatar-from to-chat-bot-avatar-to'
                                        )}>
                                            🤖
                                        </div>}
                                        <div className={cn(
                                            'flex flex-col gap-1 max-w-[70%]',
                                            message.role === 'user' ? 'items-end' : 'items-start'
                                        )}>
                                            <div className={cn(
                                                'px-4 py-3 rounded-2xl shadow-sm',
                                                message.role === 'assistant'
                                                    ? 'bg-linear-to-br from-chat-user-message-from to-chat-user-message-to text-white rounded-tl-xs'
                                                    : 'bg-chat-bot-message-bg text-chat-bot-message-text rounded-tr-xs border border-chat-message-border'
                                            )}>
                                                <p className="text-sm leading-relaxed wrap-break-word">{message.content}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground px-2">
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex gap-3 items-start justify-start">
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-chat-bot-avatar-from to-chat-bot-avatar-to flex items-center justify-center text-sm">
                                            🤖
                                        </div>
                                        <div className="bg-chat-bot-message-bg px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-chat-message-border">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                </div>

                <div className="border-t bg-card/50 dark:backdrop-blur-sm">
                    <div className="border-t dark:border-border bg-card/50 dark:backdrop-blur-sm p-2">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);

                                        const el = e.target;
                                        el.style.height = "auto";         // reset
                                        el.style.height = `${Math.min(el.scrollHeight, 8 * 24)}px`;
                                    }}
                                    onKeyPress={handleKeyPress}
                                    aria-label="پیام خود را بنویسید"
                                    rows={3}
                                    className="w-full rounded-2xl bg-chat-input-bg text-right pr-4 pl-4 py-2 resize-none overflow-auto max-h-[calc(1.5rem*8+1rem)] border-0 focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground dark:shadow-inner"
                                    disabled={isTyping}
                                    placeholder="پیام خود را بنویسید"
                                />
                            </div>
                            <button
                                title="ارسال پیام"
                                onClick={sendMessage}
                                disabled={!input.trim() || isTyping}
                                className="rounded-2xl mb-2 bg-linear-to-r from-chat-user-message-from to-chat-user-message-to hover:opacity-90 text-white px-3 py-3 shadow-lg disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
