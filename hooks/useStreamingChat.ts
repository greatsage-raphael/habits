import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

interface StreamChunk {
  text: string;
  done: boolean;
}

interface UseStreamingChatProps {
  chatId?: string;
  onResponse?: (response: Response) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
}

interface UseStreamingChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;  // Added this line
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function useStreamingChat({
  chatId,
  onResponse,
  onError,
  onFinish
}: UseStreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const appendMessage = useCallback((message: Partial<Message>) => {
    const id = message.id || nanoid();
    setMessages(prev => [...prev, { id, role: 'user', content: '', ...message }]);
    return id;
  }, []);

  const updateMessage = useCallback((id: string, content: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, content } : m))
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Append user message
    const userMessageId = appendMessage({
      content: input,
      role: 'user'
    });

    // Append initial assistant message
    const assistantMessageId = appendMessage({
      content: '',
      role: 'assistant'
    });

    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.concat({ id: userMessageId, content: input, role: 'user' }),
          chatId
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onResponse?.(response);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsedChunk: StreamChunk = JSON.parse(line.slice(5));
              
              if (parsedChunk.done) {
                onFinish?.();
                continue;
              }

              accumulatedContent += parsedChunk.text;
              updateMessage(assistantMessageId, accumulatedContent);
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (e) {
      const error = e as Error;
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Streaming error:', error);
        onError?.(error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading
  };
}