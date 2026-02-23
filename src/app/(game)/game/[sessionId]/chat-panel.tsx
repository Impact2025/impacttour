'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  sessionId: string
  teamToken: string
  teamName: string
  variant: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ChatPanel({ sessionId, teamToken, teamName, variant, isOpen: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = (v: boolean) => {
    setInternalOpen(v)
    onOpenChange?.(v)
  }
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [persona, setPersona] = useState<string>('Scout')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const personaName = variant === 'familietocht' ? 'Buddy' : 'Scout'

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [isOpen, messages])

  const sendMessage = async (messageText?: string) => {
    const text = messageText ?? input.trim()
    if (!text || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    if (!messageText) setInput('')
    setLastMessage(text)
    setIsLoading(true)
    setHasError(false)

    try {
      const res = await fetch('/api/game/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          teamToken,
          message: userMessage.content,
          history: messages,
        }),
      })

      const data = await res.json()
      if (res.ok && data.reply) {
        setPersona(data.persona ?? personaName)
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply ?? 'Even geduld, ik ben er zo!' },
        ])
      }
    } catch {
      setHasError(true)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Oeps, verbindingsprobleem.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (!lastMessage) return
    // Verwijder het laatste fout-bericht van de assistent
    setMessages((prev) => prev.slice(0, -1))
    setHasError(false)
    sendMessage(lastMessage)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="absolute inset-0 z-[2000] flex flex-col bg-white">
          {/* Header */}
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 border-2 border-green-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {personaName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm leading-none">{persona}</p>
                <p className="text-green-200 text-xs">Jullie assistent</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-green-200 hover:text-white text-sm px-2 py-1"
            >
              × Sluiten
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-green-700">
                  {personaName.charAt(0)}
                </div>
                <p className="font-semibold text-gray-700">Hoi {teamName}!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ik ben {personaName}. Vraag me alles over de tocht!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold mr-2 self-end mb-0.5 shrink-0">
                    {personaName.charAt(0)}
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Retry knop als er een fout was */}
            {hasError && lastMessage && (
              <div className="flex justify-start pl-9">
                <button
                  onClick={handleRetry}
                  className="text-xs text-green-600 underline"
                >
                  Opnieuw proberen
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0">
                {personaName.charAt(0)}
              </div>
                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-xs text-gray-400 ml-1">{personaName} denkt na...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Vraag ${personaName} iets...`}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Floating chat button (alleen zichtbaar als panel dicht is) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-20 right-4 z-[1000] w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-green-700 active:scale-95 transition-transform"
          aria-label="Chat met assistent"
        >
          <span className="text-sm font-bold">{personaName.charAt(0)}</span>
        </button>
      )}
    </>
  )
}
