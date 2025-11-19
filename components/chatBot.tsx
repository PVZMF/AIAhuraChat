"use client"

import { Bot, MessageSquareMore, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from '@/lib/utils'
import ThemeToggle from "./themeToggle";
import ThreePoint from "./progress/threePoint";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function ChatbotWidget() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [apiEndpoint, setApiEndpoint] = useState<'chat' | 'chatMock'>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Load messages from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("chatMessages");
        if (saved) {
            setMessages(JSON.parse(saved).map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            })));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        };
        scrollToBottom();
        const timeout = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeout);
    }, [messages, isTyping]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch(`/api/${apiEndpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                }),
            });

            if (!response.ok) throw new Error("خطا در دریافت پاسخ");

            let assistantContent = "";

            if (apiEndpoint === "chatMock") {
                // JSON parse برای API شبیه سازی
                const data = await response.json();
                assistantContent = data.choices?.[0]?.message?.content ?? "خطا در دریافت پاسخ";
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: assistantContent,
                    timestamp: new Date(),
                }]);
            } else {
                // API اصلی — استریم
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        assistantContent += decoder.decode(value, { stream: true });

                        setMessages(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.role === "assistant") {
                                return [...prev.slice(0, -1), { ...last, content: assistantContent }];
                            } else {
                                return [...prev, { id: Date.now().toString(), role: "assistant", content: assistantContent, timestamp: new Date() }];
                            }
                        });
                    }
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }

    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date: Date) => new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(date);

    return (
        <div dir="rtl" className="flex flex-col items-center justify-center p-4 gap-2">
            {/* API selector */}
            <div className="flex gap-2 mb-2">
                <button
                    className={cn("px-4 py-2 rounded-lg font-semibold", apiEndpoint === 'chat' ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700")}
                    onClick={() => setApiEndpoint('chat')}
                >
                    API اصلی
                </button>
                <button
                    className={cn("px-4 py-2 rounded-lg font-semibold", apiEndpoint === 'chatMock' ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700")}
                    onClick={() => setApiEndpoint('chatMock')}
                >
                    API شبیه‌سازی
                </button>
            </div>

            {/* Chat container */}
            <div className="w-full max-w-6xl h-[80vh] bg-chat-container-bg backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-chat-message-border">
                {/* Header */}
                <div className="bg-linear-to-r from-chat-header-from to-chat-header-to py-4 px-2 lg:px-4 flex items-center justify-between">
                    <div className="flex items-center justify-center gap-2">
                        <div className="size-12 rounded-full bg-white/30 flex items-center justify-center text-white shadow-md">
                            <Bot />
                        </div>
                        <div>
                            <h1 className="text-white text-lg lg:text-xl font-bold">دستیار هوشمند</h1>
                            <p className="text-white/80 text-xs lg:text-sm">آنلاین و آماده پاسخگویی</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Messages */}
                <div ref={chatContainerRef} dir="ltr" className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <MessageSquareMore size={40} className="text-6xl mb-4" />
                            <h2 className="text-base lg:text-lg font-bold text-foreground mb-2">سلام! چطور می‌تونم کمکتون کنم؟</h2>
                            <p className="text-muted-foreground text-sm lg:text-base">پیام خود را بنویسید تا گفتگو را شروع کنیم</p>
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => (
                                <div key={msg.id} className={cn("flex gap-3 items-start", msg.role === "user" ? "justify-end" : "justify-start")}>
                                    {msg.role === "assistant" && <div className="w-4 h-4 rounded-full bg-linear-to-br from-chat-bot-avatar-from to-chat-bot-avatar-to flex items-center justify-center text-sm">🤖</div>}
                                    <div className={cn("flex flex-col gap-1 max-w-[70%]", msg.role === "user" ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "px-4 py-3 rounded-2xl shadow-sm",
                                            msg.role === "assistant"
                                                ? "bg-linear-to-br from-chat-user-message-from to-chat-user-message-to text-white rounded-tl-xs"
                                                : "bg-chat-bot-message-bg text-chat-bot-message-text rounded-tr-xs border border-chat-message-border"
                                        )}>
                                            <p className="text-sm leading-relaxed wrap-break-word">{msg.content}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground px-2">{formatTime(msg.timestamp)}</span>
                                    </div>
                                </div>
                            ))}
                            {isTyping && apiEndpoint === "chatMock" && (
                                <div className="flex gap-3 items-start justify-start h-20">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-chat-bot-avatar-from to-chat-bot-avatar-to flex items-center justify-center text-sm">🤖</div>
                                    <ThreePoint />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="border-t bg-card/50 dark:backdrop-blur-sm mt-2 p-2">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    const el = e.target;
                                    el.style.height = "auto";
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
                            className="rounded-2xl mb-2.5 bg-linear-to-r from-chat-user-message-from to-chat-user-message-to hover:opacity-90 text-white px-3 py-3 shadow-lg disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
