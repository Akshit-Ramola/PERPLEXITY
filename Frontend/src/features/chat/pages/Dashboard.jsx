import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat';
const Dashboard = () => {
    const chat = useChat()

    const user = useSelector((state) => state.auth.user);

    console.log(user);

    useEffect(() => {
        chat.initializeSocketConnection()
    }, [])
    return (
        <main className='h-screen w-full flex bg-neutral-900 text-neutral-200 font-sans overflow-hidden'>
            {/* Sidebar */}
            <aside className='w-64 border-r border-neutral-800 flex flex-col p-4 flex-shrink-0 bg-neutral-900'>
                <div className='mb-8'>
                    <div className='border border-neutral-700 rounded-lg px-4 py-2 text-center font-bold tracking-widest bg-neutral-800 text-neutral-100 shadow-sm'>
                        PERPLEXITY
                    </div>
                </div>

                <div className='flex flex-col gap-2 overflow-y-auto pb-4'>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className='border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors cursor-pointer truncate'>
                            Chat Title {item}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Chat Area */}
            <section className='flex-1 flex flex-col relative bg-neutral-900/50'>
                {/* Chat Messages Container */}
                <div className='flex-1 overflow-y-auto p-4 md:p-8 lg:px-24 pb-32 flex flex-col gap-6'>

                    {/* User Message */}
                    <div className='self-end border border-neutral-700 bg-neutral-800 rounded-xl px-6 py-3 max-w-xl text-neutral-200 shadow-sm'>
                        User Message
                    </div>

                    {/* AI Message */}
                    <div className='w-full border border-neutral-700 bg-neutral-800/50 rounded-2xl p-8 min-h-[400px] shadow-sm text-neutral-300'>
                        Ai Message
                    </div>
                </div>

                {/* Input Area */}
                <div className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-900 via-neutral-900 to-transparent'>
                    <div className='max-w-4xl mx-auto'>
                        <div className='relative flex items-center border border-neutral-700 bg-neutral-800 rounded-2xl overflow-hidden shadow-lg focus-within:ring-1 focus-within:ring-neutral-500 transition-all'>
                            <input
                                type="text"
                                placeholder="Chat UserInput Area"
                                className='w-full bg-transparent px-6 py-4 outline-none text-neutral-200 placeholder-neutral-500'
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Dashboard