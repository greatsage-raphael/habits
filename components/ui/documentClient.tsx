'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '../ui/loadingDots';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from '@react-pdf-viewer/toolbar';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { useChat } from 'ai/react';
import Toggle from '../ui/toggle';
import { useStreamingChat } from '../../hooks/useStreamingChat';
import { generateContractSummary } from '@/scripts/generate';

export default function DocumentClient({
  chatId,
  userImage,
  pdfUrl,
  rawText,
  prompt,
}: {
  chatId?: string;
  userImage?: string;
  pdfUrl?: string;
  rawText?: string;
  prompt?: string;
}) {
  const toolbarPluginInstance = toolbarPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [chatOnlyView, setChatOnlyView] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useStreamingChat({
    chatId,
    onResponse(response) {
      const sourcesHeader = response.headers.get('x-sources');
      let sources = [];
      try {
        sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
      } catch (err) {
        console.error('Error decoding sourcesHeader:', err);
      }

      const messageIndexHeader = response.headers.get('x-message-index');
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    onError: (e) => {
      setError(e.message);
    },
    onFinish() {
      // Handle completion if needed
    },
  });

  // Handle initial prompt setting
  useEffect(() => {
    if (prompt) setInput(prompt);
  }, [prompt, setInput]);

  //console.log("rawText", rawText)

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // Prevent empty chat submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && messages) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  let userProfilePic = userImage ? userImage : '/profile-icon.png';

  const extractSourcePageNumber = (source: {
    metadata: Record<string, any>;
  }) => {
    console.log('Source metadata:', source.metadata);
    return source.metadata['loc.pageNumber'] ?? source.metadata.loc?.pageNumber;
  };

  useEffect(() => {
    const handleSummary = async () => {
      const summary = await generateContractSummary(rawText ?? '');
      let stream = '';
      for await (const chunk of summary.stream) {
        const chunkText = chunk.text();
        //console.log(chunkText);
        stream += chunkText;
        setSummary((prevCode: string) => prevCode + chunkText);
      }
    };

    handleSummary();
  }, [rawText]);

  return (
    <div className="no-scrollbar mx-auto -mt-2 flex flex-col">
      <Toggle chatOnlyView={chatOnlyView} setChatOnlyView={setChatOnlyView} />
      <div className="flex w-full flex-col justify-between p-2 sm:space-y-20 lg:flex-row lg:space-y-0">
        {/* Left hand side */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div
            className={`!important h-[90vh] w-full flex-col text-white ${
              chatOnlyView ? 'hidden' : 'flex'
            }`}
          >
            <div
              className="align-center flex bg-[#eeeeee] p-1"
              style={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
            </div>
            <Viewer
              fileUrl={pdfUrl as string}
              plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
            />
          </div>
        </Worker>
        {/* Right hand side */}
        <div className="align-center no-scrollbar flex h-[90vh] w-full flex-col justify-between">
          <div
            className={`no-scrollbar flex h-[80vh] min-h-min w-full items-center justify-center border bg-white sm:h-[85vh]
            `}
          >
            <div
              ref={messageListRef}
              className="mt-4 h-[calc(100vh-200px)] w-full overflow-y-auto rounded-md"
            >
              {messages.length === 0 && (
                <>
                  <h1>Summary: </h1>
                  <ReactMarkdown className="prose max-w-full break-words">
                    {summary}
                  </ReactMarkdown>
                </>
              )}
              {messages.map((message, index) => {
                const sources = sourcesForMessages[index] || undefined;
                const isLastMessage =
                  !isLoading && index === messages.length - 1;
                const previousMessages = index !== messages.length - 1;
                return (
                  <div key={`chatMessage-${index}`}>
                    <div
                      className={`p-4 text-black ${
                        message.role === 'assistant'
                          ? 'bg-gray-100'
                          : isLoading && index === messages.length - 1
                            ? 'animate-pulse bg-white'
                            : 'bg-white'
                      }`}
                    >
                      <div className="flex">
                        <Image
                          key={index}
                          src={
                            message.role === 'assistant'
                              ? '/bot-icon.png'
                              : userProfilePic
                          }
                          alt="profile image"
                          width={message.role === 'assistant' ? '35' : '33'}
                          height="30"
                          className="mr-4 h-full rounded-sm"
                          priority
                        />
                        <ReactMarkdown className="prose max-w-full break-words">
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {/* Display the sources */}
                      {(isLastMessage || previousMessages) && sources && (
                        <div className="ml-14 mt-3 flex flex-wrap gap-2">
                          {sources
                            .filter((source: any, index: number, self: any) => {
                              const pageNumber =
                                extractSourcePageNumber(source);
                              return (
                                self.findIndex(
                                  (s: any) =>
                                    extractSourcePageNumber(s) === pageNumber,
                                ) === index
                              );
                            })
                            .map((source: any) => (
                              <button
                                key={extractSourcePageNumber(source)}
                                className="rounded-lg border bg-gray-200 px-3 py-1 transition hover:bg-gray-100"
                                onClick={() =>
                                  pageNavigationPluginInstance.jumpToPage(
                                    Number(extractSourcePageNumber(source)) - 1,
                                  )
                                }
                              >
                                p. {extractSourcePageNumber(source)}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex h-[20vh] items-center justify-center sm:h-[15vh]">
            <form
              onSubmit={(e) => handleSubmit(e)}
              className="relative w-full px-4 pt-2 sm:pt-10"
            >
              <textarea
                className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 pr-10 text-black focus:outline-gray-400"
                disabled={isLoading}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                rows={3}
                autoFocus={false}
                maxLength={512}
                id="userInput"
                name="userInput"
                placeholder={
                  isLoading ? 'Waiting for response...' : 'Ask me anything...'
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-6 top-[40px] flex rounded-sm border-none bg-transparent px-2 py-1 text-gray-600 transition duration-300 ease-in-out sm:top-[71px]"
              >
                {isLoading ? (
                  <div className="">
                    <LoadingDots color="#000" style="small" />
                  </div>
                ) : (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-6 w-6 rotate-90 transform fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
          {error && (
            <div className="rounded-md border border-red-400 p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
