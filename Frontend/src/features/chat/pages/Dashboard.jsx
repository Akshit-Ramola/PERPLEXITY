import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'
import remarkGfm from 'remark-gfm'
import CreateTask from '../components/CreateTask'

const TypewriterMarkdown = ({ content, isPaused, onComplete }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const currentIndexRef = useRef(0);

    useEffect(() => {
        setDisplayedContent('');
        setIsTyping(true);
        currentIndexRef.current = 0;
    }, [content]);

    useEffect(() => {
        if (isPaused || !isTyping) {
            setIsTyping(false);
            if (isPaused && onComplete) onComplete();
            return;
        }

        const interval = setInterval(() => {
            if (currentIndexRef.current < content.length) {
                setDisplayedContent(content.slice(0, currentIndexRef.current + 1));
                currentIndexRef.current++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
                if (onComplete) onComplete();
            }
        }, 5);

        return () => clearInterval(interval);
    }, [content, isPaused, isTyping, onComplete]);

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
    const [isTyping, setIsTyping] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [optimisticMsg, setOptimisticMsg] = useState(null)
    const [animatingMessageId, setAnimatingMessageId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('chat')
    const searchInputRef = useRef(null)
    const abortControllerRef = useRef(null)
    const previousMessagesLengthRef = useRef(0)

    const chats = useSelector((state) => state.chat.chats)
    const currentChatId = useSelector((state) => state.chat.currentChatId)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        chat.initializeSocketConnection()
        chat.handleGetChats()
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
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
        setIsTyping(false)
        setIsPaused(false)
        setOptimisticMsg(trimmedMessage)

        abortControllerRef.current = new AbortController()

        try {
            await chat.handleSendMessage({ 
                message: trimmedMessage, 
                chatId: currentChatId,
                signal: abortControllerRef.current.signal
            })
            setIsTyping(true)
        } catch (error) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                console.log("Response generation was stopped.")
            } else {
                console.error("Message submission failed:", error)
                setChatInput(trimmedMessage) // Restore input on failure
            }
        } finally {
            setIsThinking(false)
            setOptimisticMsg(null)
            abortControllerRef.current = null
        }
    }

    const handleStop = () => {
        setIsPaused(true)
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsThinking(false)
        setIsTyping(false)
    }

    const openChat = (chatId) => {
        chat.handleOpenChat(chatId, chats)
        setActiveTab('chat')
    }

    const filteredChats = Object.values(chats).filter(c => 
        (c.title || 'New Conversation').toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <main className='min-h-screen w-full bg-[#0e0e0e] text-[#e8e8e6] font-sans selection:bg-cyan-900'>
            <section className='mx-auto flex h-screen w-full'>
                <aside className='hidden h-full w-[260px] shrink-0 border-r border-white/5 bg-[#121212] p-4 md:flex md:flex-col'>
                    <div className='flex items-center gap-3 mb-8 px-2 mt-2'>
                        <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/50">P</div>
                        <h1 className='text-xl font-medium tracking-wide'>Perplexity</h1>
                    </div>

                    <button
                        onClick={() => { chat.handleNewChat(); setActiveTab('chat'); }}
                        className='mb-4 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-[#e8e8e6] transition hover:bg-[#1f1f1f]'
                    >
                        <svg className="h-[18px] w-[18px] text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        New chat
                    </button>

                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`mb-6 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold transition ${activeTab === 'tasks' ? 'bg-[#1f1f1f] text-white' : 'text-[#e8e8e6] hover:bg-[#1f1f1f]'}`}
                    >
                        <svg className="h-[18px] w-[18px] text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Automated Tasks
                    </button>

                    <div className='group relative mb-6 px-1'>
                        <div className="pointer-events-none absolute inset-y-0 left-1 flex items-center pl-3">
                            <svg className="h-[14px] w-[14px] text-[#8e8e93] font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            ref={searchInputRef}
                            type='text'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='block w-full rounded-full border border-white/10 bg-[#232326] py-[6px] pl-9 pr-14 text-[13px] text-white placeholder-[#8e8e93] focus:border-cyan-800/50 focus:bg-[#2b2b2e] focus:outline-none transition-colors'
                            placeholder='Search chats'
                        />
                        <div className="absolute inset-y-0 right-1 flex items-center pr-3 pointer-events-none border-l border-white/10 pl-2 my-1.5 ml-2">
                            <span className="text-[10px] text-[#6e6e73] font-semibold tracking-wide">Ctrl + K</span>
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                        <div className='text-xs font-semibold text-[#8e8e93] px-2 mb-3 uppercase tracking-wider'>Library</div>
                        {filteredChats.map((c, index) => (
                            <div 
                                key={index} 
                                className={`group relative flex w-full items-center rounded-lg transition ${currentChatId === c.id ? 'bg-[#2a2a2a]' : 'hover:bg-[#1f1f1f]'}`}
                            >
                                <button
                                    onClick={() => { openChat(c.id) }}
                                    type='button'
                                    className={`flex-1 truncate cursor-pointer px-3 py-2 text-left text-sm pr-8 ${currentChatId === c.id ? 'text-white font-medium' : 'bg-transparent text-[#a0a0a5] group-hover:text-[#e8e8e6]'}`}
                                >
                                    {c.title || 'New Conversation'}
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        chat.handleDeleteChat(c.id);
                                    }}
                                    className={`absolute right-1.5 p-1 rounded-md text-[#8e8e93] hover:text-[#ff6b6b] hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all ${currentChatId === c.id ? 'opacity-100' : ''}`}
                                    title="Delete chat"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>

                {activeTab === 'chat' ? (
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
                                                    <TypewriterMarkdown 
                                                        content={msg.content} 
                                                        isPaused={isPaused} 
                                                        onComplete={() => {
                                                            setIsTyping(false);
                                                            setAnimatingMessageId(null);
                                                        }} 
                                                    />
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
                                                <svg className="w-4 h-4 animate-spin text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
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
                                    disabled={isThinking && !isPaused}
                                />
                                { (isThinking || isTyping) && !isPaused ? (
                                    <button
                                        type='button'
                                        onClick={handleStop}
                                        className='absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#333333] text-white transition hover:bg-[#444444]'
                                    >
                                        <div className="w-3.5 h-3.5 bg-current rounded-sm"></div>
                                    </button>
                                ) : (
                                    <button
                                        type='submit'
                                        disabled={!chatInput.trim() || (isThinking && !isPaused)}
                                        className='absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed'
                                    >
                                        <svg className="w-5 h-5 ml-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </button>
                                )}
                            </form>
                            <div className="mt-3 text-center text-xs text-[#6e6e73]">
                                AI can make mistakes. Verify important information.
                            </div>
                        </div>
                    </div>
                </section>
                ) : (
                    <CreateTask />
                )}
            </section>
        </main>
    )
}

export default Dashboard