import { useChat } from '@ai-sdk/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: '/api/chat' // your streaming route
    })

  return (
    <div className="flex h-[600px] max-h-screen w-full max-w-xl flex-col rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="text-sm font-semibold">Chat</div>
        <div className="text-[11px] uppercase tracking-wide text-gray-400">
          {isLoading ? 'Responding…' : 'Idle'}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3 text-sm">
        {messages.length === 0 && (
          <div className="mt-6 text-center text-xs text-gray-400">
            Start a conversation by typing below.
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {/* Prefer message.parts (new API), fall back to content */}
              {Array.isArray((message as any).parts) &&
              (message as any).parts.length > 0
                ? (message as any).parts.map((part: any, idx: number) => {
                    if (part.type === 'text')
                      return <span key={idx}>{part.text}</span>
                    if (part.type === 'tool-call') {
                      return (
                        <span key={idx} className="text-[11px] opacity-80">
                          ▸ Tool call: {part.toolName}
                        </span>
                      )
                    }
                    if (part.type === 'tool-result') {
                      return (
                        <span key={idx} className="text-[11px] opacity-80">
                          ▸ Tool result received
                        </span>
                      )
                    }
                    return null
                  })
                : message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
            Thinking…
          </div>
        )}

        {error && (
          <div className="text-xs text-red-500">
            {error.message ?? 'Something went wrong.'}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t px-3 py-2">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Send a message…"
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex h-9 items-center rounded-xl bg-blue-600 px-3 text-xs font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
