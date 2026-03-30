import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setLoading, setError, createNewChat, addNewMessage, addMessages, removeChat } from "../chat.slice";
import { useDispatch } from "react-redux";

export const useChat = () => {
    const dispatch = useDispatch();

    async function handleSendMessage({ message, chatId, signal }) {
        dispatch(setLoading(true))
        try {
            const data = await sendMessage({ message, chatId, signal })
            const { chat, aiMessage } = data
            if (!chatId && chat) {
                dispatch(createNewChat({ chatId: chat._id, title: chat.title }))
            }
            const activeChatId = chatId || (chat && chat._id)
            dispatch(addNewMessage({ chatId: activeChatId, content: message, role: "user" }))
            dispatch(addNewMessage({ chatId: activeChatId, content: aiMessage.content, role: "ai" }))
            dispatch(setCurrentChatId(activeChatId))
        } catch (error) {
            console.error("Failed to send message", error)
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId, chats) {

        if (chats[chatId]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }

        dispatch(setCurrentChatId(chatId))
    }

    function handleNewChat() {
        dispatch(setCurrentChatId(null))
    }

    async function handleDeleteChat(chatId) {
        dispatch(removeChat(chatId))
        try {
            await deleteChat(chatId)
        } catch (error) {
            console.error("Failed to delete chat", error)
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleNewChat,
        handleDeleteChat,
    }
}