import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'
import remarkGfm from 'remark-gfm'

const TypewriterMarkdown = ({ content }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        setDisplayedContent('');
        setIsTyping(true);
        let currentIndex = 0;
        const speed = 15; // ms per char

        const interval = setInterval(() => {
            if (currentIndex < content.length) {
                setDisplayedContent(content.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [content]);

    return (
        <div className={isTyping ? "opacity-90" : ""}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className='mb-4 text-base leading-relaxed'>{children}</p>,
                    ul: ({ children }) => <ul className='mb-4 list-disc pl-5 space-y-1'>{children}</ul>,
                    ol: ({ children }) => <ol className='mb-4 list-decimal pl-5 space-y-1'>{children}</ol>,
                    code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <pre className='mb-4 overflow-x-auto rounded-xl bg-[#1e1e1e] p-4 font-mono text-sm border border-white/10'>
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        ) : (
                            <code className='rounded bg-white/10 px-1 py-0.5 text-sm' {...props}>
                                {children}
                            </code>
                        )
                    },
                    h1: ({ children }) => <h1 className='text-2xl font-bold mb-4'>{children}</h1>,
                    h2: ({ children }) => <h2 className='text-xl font-bold mb-3'>{children}</h2>,
                    h3: ({ children }) => <h3 className='text-lg font-bold mb-3'>{children}</h3>,
                    a: ({ children, href }) => <a href={href} className='text-blue-400 hover:underline' target='_blank' rel='noopener noreferrer'>{children}</a>,
                }}
                remarkPlugins={[remarkGfm]}
            >
                {displayedContent}
            </ReactMarkdown>
            {isTyping && <span className="ml-1 inline-block w-2 h-4 bg-white/60 animate-pulse align-middle" />}
        </div>
    );
};

const Dashboard = () => {
    const chat = useChat()
    const [chatInput, setChatInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [optimisticMsg, setOptimisticMsg] = useState(null)
    const [animatingMessageId, setAnimatingMessageId] = useState(null)
    const previousMessagesLengthRef = useRef(0)
    
    const chats = useSelector((state) => state.chat.chats)
    const currentChatId = useSelector((state) => state.chat.currentChatId)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        chat.initializeSocketConnection()
        chat.handleGetChats()
    }, [])
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const currentMessages = chats[currentChatId]?.messages || []

    useEffect(() => {
        if (currentMessages.length > previousMessagesLengthRef.current) {
            const lastMsg = currentMessages[currentMessages.length - 1]
            if (lastMsg && lastMsg.role === 'ai') {
                setAnimatingMessageId(lastMsg.id || currentMessages.length - 1)
            }
            scrollToBottom()
        }
        previousMessagesLengthRef.current = currentMessages.length
    }, [currentMessages])
    
    useEffect(() => {
        if (isThinking || optimisticMsg) {
            scrollToBottom()
        }
    }, [isThinking, optimisticMsg])

    const handleSubmitMessage = async (event) => {
        event.preventDefault()

        const trimmedMessage = chatInput.trim()
        if (!trimmedMessage) {
            return
        }

        setChatInput('')
        setIsThinking(true)
        setOptimisticMsg(trimmedMessage)

        await chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
        
        setIsThinking(false)
        setOptimisticMsg(null)
    }

    const openChat = (chatId) => {
        chat.handleOpenChat(chatId, chats)
    }

    return (
        <main className='min-h-screen w-full bg-[#0e0e0e] text-[#e8e8e6] font-sans selection:bg-cyan-900'>
            <section className='mx-auto flex h-screen w-full'>
                <aside className='hidden h-full w-[260px] shrink-0 border-r border-white/5 bg-[#121212] p-4 md:flex md:flex-col'>
                    <div className='flex items-center gap-3 mb-8 px-2 mt-2'>
                        <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/50">P</div>
                        <h1 className='text-xl font-medium tracking-wide'>Perplexity</h1>
                    </div>

                    <div className='flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                        <div className='text-xs font-semibold text-[#8e8e93] px-2 mb-3 uppercase tracking-wider'>Library</div>
                        {Object.values(chats).map((c, index) => (
                            <button
                                onClick={() => { openChat(c.id) }}
                                key={index}
                                type='button'
                                className={`w-full truncate cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition ${currentChatId === c.id ? 'bg-[#2a2a2a] text-white font-medium' : 'bg-transparent text-[#a0a0a5] hover:bg-[#1f1f1f] hover:text-[#e8e8e6]'}`}
                            >
                                {c.title || 'New Conversation'}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className='relative flex h-full min-w-0 flex-1 flex-col'>
                    <div className='flex-1 overflow-y-auto pb-[130px] pt-8 px-4'>
                        <div className='mx-auto max-w-3xl space-y-8'>
                            {currentMessages.length === 0 && !optimisticMsg && (
                                <div className='mt-32 flex flex-col items-center justify-center text-center'>
                                    <h2 className='text-3xl font-medium mb-4 text-white/90'>Where knowledge begins</h2>
                                    <p className='text-[#a0a0a5] text-lg max-w-md'>Ask anything to get answers backed by up-to-date sources.</p>
                                </div>
                            )}

                            {currentMessages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex flex-col w-full px-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className='max-w-[80%] rounded-2xl rounded-tr-sm bg-[#1e1e20] px-5 py-3.5 text-[15px] leading-relaxed text-[#e8e8e6] border border-white/5'>
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className='w-full text-[15px] text-[#d1d5db]'>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-cyan-700/20 text-cyan-400 flex items-center justify-center text-xs border border-cyan-800/50">
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </div>
                                                <span className="font-semibold text-[#e8e8e6]">Answer</span>
                                            </div>
                                            <div className='pl-9'>
                                                {animatingMessageId === (msg.id || idx) ? (
                                                    <TypewriterMarkdown content={msg.content} />
                                                ) : (
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ children }) => <p className='mb-4 text-base leading-relaxed'>{children}</p>,
                                                            ul: ({ children }) => <ul className='mb-4 list-disc pl-5 space-y-1'>{children}</ul>,
                                                            ol: ({ children }) => <ol className='mb-4 list-decimal pl-5 space-y-1'>{children}</ol>,
                                                            code: ({ node, inline, className, children, ...props }) => {
                                                                const match = /language-(\w+)/.exec(className || '')
                                                                return !inline && match ? (
                                                                    <pre className='mb-4 overflow-x-auto rounded-xl bg-[#1e1e1e] p-4 font-mono text-sm border border-white/10'>
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                ) : (
                                                                    <code className='rounded bg-white/10 px-1 py-0.5 text-sm' {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            },
                                                            h1: ({ children }) => <h1 className='text-2xl font-bold mb-4'>{children}</h1>,
                                                            h2: ({ children }) => <h2 className='text-xl font-bold mb-3'>{children}</h2>,
                                                            h3: ({ children }) => <h3 className='text-lg font-bold mb-3'>{children}</h3>,
                                                            a: ({ children, href }) => <a href={href} className='text-blue-400 hover:underline' target='_blank' rel='noopener noreferrer'>{children}</a>,
                                                        }}
                                                        remarkPlugins={[remarkGfm]}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {optimisticMsg && (
                                <div className={`flex flex-col w-full px-2 items-end`}>
                                    <div className='max-w-[80%] rounded-2xl rounded-tr-sm bg-[#1e1e20] px-5 py-3.5 text-[15px] leading-relaxed text-[#e8e8e6] border border-white/5'>
                                        {optimisticMsg}
                                    </div>
                                </div>
                            )}

                            {isThinking && (
                                <div className={`flex flex-col w-full px-2 items-start mt-4`}>
                                    <div className='w-full text-[15px] text-[#d1d5db]'>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-[#1e1e20] text-[#a0a0a5] flex items-center justify-center text-xs border border-white/5">
                                                <svg className="w-4 h-4 animate-spin text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                                            </div>
                                            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">Analyzing sources...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    </div>

                    <div className='absolute bottom-0 w-full bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e] to-transparent pt-12 pb-6'>
                        <div className="mx-auto max-w-3xl px-4">
                            <form onSubmit={handleSubmitMessage} className='relative flex items-center overflow-hidden rounded-full border border-white/10 bg-[#1e1e20] shadow-xl focus-within:border-cyan-800/50 focus-within:bg-[#252528] transition-all duration-300'>
                                <input
                                    type='text'
                                    value={chatInput}
                                    onChange={(event) => setChatInput(event.target.value)}
                                    placeholder='Ask anything...'
                                    className='w-full bg-transparent pl-6 pr-14 py-4 text-[15px] text-[#e8e8e6] outline-none placeholder:text-[#8e8e93]'
                                    disabled={isThinking}
                                />
                                <button
                                    type='submit'
                                    disabled={!chatInput.trim() || isThinking}
                                    className='absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed'
                                >
                                    <svg className="w-5 h-5 ml-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </form>
                            <div className="mt-3 text-center text-xs text-[#6e6e73]">
                                AI can make mistakes. Verify important information.
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </main>
    )
}

export default Dashboard