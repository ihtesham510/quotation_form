import { useState } from 'react'
import { api } from 'convex/_generated/api'
import { useAction } from 'convex/react'
import { useThreadMessages } from '@convex-dev/agent/react'
import {
  ExpandableChat,
  ExpandableChatBody,
  ExpandableChatFooter,
  ExpandableChatHeader,
} from '@/components/ui/expandable-chat'
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat-bubble'
import { ChatMessageList } from '@/components/ui/chat-message-list'
import { ChatInput } from '@/components/ui/chat-input'
import { Button } from '@/components/ui/button'
import { SendIcon, LoaderIcon } from 'lucide-react'

export function ChatBot() {
  const [threadId, setThread] = useState<string>()
  const [message, setMessage] = useState<string>()
  const sendMessage = useAction(api.conversation.continueConversation)
  const [loading, setLoading] = useState(false)
  const handleSendMessage = async () => {
    if (!message || message === '') return
    setLoading(true)
    const id = await sendMessage({ message, threadId })
    setLoading(false)
    setThread(id)
    setMessage('')
    setMessage(undefined)
  }
  return (
    <ExpandableChat size="lg">
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <h1 className="text-xl font-semibold">Chat with our assistant ✨</h1>
        <p className="text-sm text-muted-foreground">
          Try asking for pircing and quotes.
        </p>
      </ExpandableChatHeader>
      {threadId ? (
        <ListMessages threadId={threadId} />
      ) : (
        <ExpandableChatBody className="flex justify-center items-center">
          <div>Send a message</div>
        </ExpandableChatBody>
      )}

      <ExpandableChatFooter>
        <div className="flex p-3 pt-0 gap-4 justify-between">
          <ChatInput
            value={message}
            placeholder="Send Message"
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="ml-auto gap-1.5"
            onClick={handleSendMessage}
          >
            {loading ? (
              <LoaderIcon className="size-3.5 animate-spin" />
            ) : (
              <SendIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}

function ListMessages({ threadId }: { threadId: string }) {
  const messages = useThreadMessages(
    api.conversation.listThreadMessages,
    { threadId },
    { initialNumItems: 50 },
  )

  const isLoading = messages.isLoading

  return (
    <ExpandableChatBody>
      <ChatMessageList>
        {messages.results.map((message) => {
          if (!message.message?.content) return null
          if (
            message.message?.role === 'system' ||
            message.message?.role === 'tool'
          )
            return null
          const getContent = () => {
            const content = message.message?.content
            if (!content) return ''
            if (typeof content === 'string') return content
            const c = content[0]
            if (c.type === 'text') {
              return c.text
            }
          }

          return (
            <ChatBubble
              key={message.id}
              variant={message.message?.role === 'user' ? 'sent' : 'received'}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={
                  message.message?.role === 'user'
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop'
                    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop'
                }
                fallback={message.message?.role === 'user' ? 'US' : 'AI'}
              />
              <ChatBubbleMessage
                variant={message.message?.role ? 'sent' : 'received'}
              >
                <MessageRenderer message={getContent() ?? ''} />
              </ChatBubbleMessage>
            </ChatBubble>
          )
        })}

        {isLoading && (
          <ChatBubble variant="received">
            <ChatBubbleAvatar
              className="h-8 w-8 shrink-0"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
              fallback="AI"
            />
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        )}
      </ChatMessageList>
    </ExpandableChatBody>
  )
}

const MessageRenderer: React.FC<{ message: string }> = ({ message }) => {
  const parseMessage = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      // Skip empty lines
      if (!trimmedLine) {
        elements.push(<br key={`br-${index}`} />)
        return
      }

      // Check if line is a numbered list item (1. **Text**: Description)
      const numberedMatch = trimmedLine.match(
        /^(\d+)\.\s*\*\*(.*?)\*\*:\s*(.*)$/,
      )
      if (numberedMatch) {
        const [, number, title, description] = numberedMatch
        elements.push(
          <div key={index} className="mb-3">
            <span className="font-semibold text-blue-600">{number}. </span>
            <span className="font-bold text-gray-800">{title}</span>
            <span className="text-gray-600">: {description}</span>
          </div>,
        )
        return
      }

      // Check if line is a bullet point with bold text
      const bulletMatch = trimmedLine.match(/^-\s*\*\*(.*?)\*\*:\s*(.*)$/)
      if (bulletMatch) {
        const [, title, description] = bulletMatch
        elements.push(
          <div key={index} className="mb-2 ml-4 flex items-start">
            <span className="text-blue-500 mr-2 mt-1">•</span>
            <div>
              <span className="font-semibold text-gray-800">{title}</span>
              <span className="text-gray-600">: {description}</span>
            </div>
          </div>,
        )
        return
      }

      // Check if line contains **bold** text
      const boldMatch = trimmedLine.match(/\*\*(.*?)\*\*/g)
      if (boldMatch) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/)
        const formattedParts = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={partIndex} className="font-bold text-gray-800">
                {part.slice(2, -2)}
              </span>
            )
          }
          return part
        })

        elements.push(
          <div key={index} className="mb-2">
            {formattedParts}
          </div>,
        )
        return
      }

      // Regular text
      elements.push(
        <div key={index} className="mb-2 text-gray-700">
          {trimmedLine}
        </div>,
      )
    })

    return elements
  }

  return <div className="prose prose-sm">{parseMessage(message)}</div>
}
