import { useState, useEffect, useRef } from "react";

import "./aiAssistant.css";
import { sendAiMessage } from "../../Services/aiApi";
import { Ear } from "lucide-react";

// Matches partcode-style tokens like "3DB28034AFAA", "084794A.205", "1AB472710002"
// Requires at least one digit so plain words ("stock", "give", "put") never match.
const PARTCODE_REGEX = /\b(?=[A-Za-z0-9.\-]*\d)[A-Za-z0-9][A-Za-z0-9.\-]{4,}\b/;

// Matches "pick" or "put" appearing anywhere as a whole word
// (covers "put", "stock put", "I want to put", etc.)
const PICK_PUT_REGEX = /\b(yes|find)\b/i;

export default function AiAssistant() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
    //   content: (
    //     <>
    //       Hello! 👋 <strong>Inventory AI</strong>. Ask me about{" "}
    //       <strong style={{ color: "#2563eb" }}>Partcodes</strong>,{" "}
    //       <strong style={{ color: "#16a34a" }}>Stock</strong>,{" "}
    //       <strong style={{ color: "#9333ea" }}>Locations</strong>,{" "}
    //       <strong style={{ color: "#ea580c" }}>Receving</strong> or{" "}
    //       <strong style={{ color: "#dc2626" }}>Issuance</strong>.
    //     </>
    //   )
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // remembers the last partcode mentioned, so a lone "pick"/"put" reply
  // can be combined with it before being sent to the API
  const [lastPartcode, setLastPartcode] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const [conversationId, setConversationId] = useState(
    crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  );

  const sendMessage = async () => {
  const rawText = input.trim();

  if (!rawText || loading) return;

  let textToSend = rawText;

  const mentionsPickOrPut = PICK_PUT_REGEX.test(rawText);
  const partcodeInMessage = rawText.match(PARTCODE_REGEX);

  if (mentionsPickOrPut && !partcodeInMessage && lastPartcode) {
    textToSend = `${lastPartcode} ${rawText}`;
  } else if (partcodeInMessage) {
    setLastPartcode(partcodeInMessage[0]);
  }

  setMessages(prev => [
    ...prev,
    {
      role: "user",
      content: textToSend
    }
  ]);

  setInput("");
  setLoading(true);

  try {
    const response = await sendAiMessage(
      textToSend,
      conversationId
    );

    const assistantMessage = {
      role: "assistant",
      content: response.message
    };

    setMessages(prev => [
      ...prev,
      assistantMessage
    ]);

    // 🔊 AUTO READ NEW RESPONSE
    if (autoSpeak && response.message) {
      setTimeout(() => {
        // User may have turned auto speak OFF
        if (autoSpeak) {
          // Current assistant message index:
          // previous messages + user message + this assistant message
          const messageIndex = messages.length + 1;

          speakMessage(
            response.message,
            messageIndex
          );
        }
      }, 300);
    }

  } catch (error) {

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: "Sorry, I couldn't process your request."
      }
    ]);

  } finally {
    setLoading(false);
  }
};
  const handleKeyDown = (event) => {

    if (event.key === "Enter" && !event.shiftKey) {

      event.preventDefault();
      sendMessage();
    }
  };

  const isTyping = input.trim().length > 0;

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState("600px");

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top;
        setContainerHeight(`calc(100vh - ${top + 16}px)`);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

 const speakMessage = (text, index) => {

  if (!text || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  setSpeakingIndex(null);

  const cleanText = text
  // Remove markdown
  .replace(/[*_#]/g, "")
  // Remove emojis and symbols
  .replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,
    ""
  )
  // Remove extra spaces
  .replace(/\s+/g, " ")
  .trim();

  const utterance =
    new SpeechSynthesisUtterance(cleanText);

  const voices =
    window.speechSynthesis.getVoices();

  const femaleVoice = voices.find(voice =>
    /female|zira|samantha|aria|jenny|susan|hazel|google uk english female/i
      .test(voice.name)
  );

  const indianFemaleVoice = voices.find(voice =>
    /en-IN/i.test(voice.lang) &&
    /female|veena|heera/i.test(voice.name)
  );

  utterance.voice =
    indianFemaleVoice ||
    femaleVoice ||
    voices.find(
      voice => voice.lang === "en-IN"
    );

  utterance.lang =
    utterance.voice?.lang || "en-IN";

  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  // 🟢 Started speaking
  utterance.onstart = () => {
    setSpeakingIndex(index);
  };

  // 🔵 Finished
  utterance.onend = () => {
    setSpeakingIndex(null);
  };

  // 🔴 Error / cancelled
  utterance.onerror = () => {
    setSpeakingIndex(null);
  };

  window.speechSynthesis.speak(utterance);
};


useEffect(() => {
  window.speechSynthesis.getVoices();

  const loadVoices = () => {
    window.speechSynthesis.getVoices();
  };

  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

  return () => {
    window.speechSynthesis.removeEventListener(
      "voiceschanged",
      loadVoices
    );
  };
}, []);

  return (
    <div
      className="ai-container"
      ref={containerRef}
      style={{ height: containerHeight, maxHeight: containerHeight }}
    >

      <div className="ai-header">
        <div>
          <h3>MMP Smart AI</h3>
          <span>Inventory Assistant</span>
        </div>

        <button
  onClick={() => {
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);

    setMessages([
      {
        role: "assistant",
        content:
          "Hello! 👋 I’m MIRA, your virtual assistant for stock, receiving, issuance, and location-wise inventory. How can I assist you today?"
      }
    ]);

    setLastPartcode(null);
  }}
>
  New Chat
</button>
      </div>

      <div className="ai-messages">

        {messages.map((message, index) => (

          <div
            key={index}
            className={`message-row ${message.role}`}
          >

            <div className="message-bubble">

  {message.content}

  {message.role === "assistant" && typeof message.content === "string" && (
//     <button
//   className={`speak-button ${
//     speakingIndex === index ? "speaking" : ""
//   }`}
//   onClick={() => speakMessage(message.content, index)}
//   title={speakingIndex === index ? "Speaking..." : "Read aloud"}
// >
//   {speakingIndex === index ? "🔊" : "🔊"}
// </button>
<button
  className={`speak-button ${
    speakingIndex === index ? "speaking" : ""
  }`}
  onClick={() => {

    // 🔊 Currently speaking this message
    if (speakingIndex === index) {

      // Stop speech
      window.speechSynthesis.cancel();

      // Turn auto reading OFF
      setAutoSpeak(false);

      setSpeakingIndex(null);

      return;
    }

    // 🔇 Currently Auto Speak is OFF
    // Click → turn ON + immediately speak this message
    if (!autoSpeak) {

      setAutoSpeak(true);

      speakMessage(
        message.content,
        index
      );

      return;
    }

    // Auto Speak ON but this message isn't speaking
    speakMessage(
      message.content,
      index
    );
  }}
  title={
    speakingIndex === index
      ? "Stop speaking"
      : autoSpeak
        ? "Speaking enabled"
        : "Turn speaking ON"
  }
>
  {speakingIndex === index
    ? "🔊"
    : autoSpeak
      ? "🔊"
      : "🔇"}
</button>
  )}

</div>

          </div>

        ))}

        {loading && (
          <div className="message-row assistant thinking-row">

            <div className="thinking-avatar">
              🧠
            </div>

            <div className="thinking-bubble">

              <span>Thinking</span>

              <div className="thinking-dots">
                <i></i>
                <i></i>
                <i></i>
              </div>

            </div>

          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      <div className="ai-input-container">

        {/* status row — sits ABOVE the textarea, never overlaps typed text */}
        <div className="typing-status">
          {isTyping ? (
            <>
              <div className="typing-ai-icon">🤖</div>
              <div className="typing-text">
                 <span className="ear-icon"></span> Listening
                 <span>✨</span>
                  <span>✦</span>
                  <span>✨</span>
                <div className="typing-sparkles">
                  
                  <span>
  <Ear size={22} strokeWidth={2} />
</span>

{/* <span>👂</span> */}
{/* 
<span>🦻</span> */}

                </div>
              </div>
            </>
          ) : (
            <div className="ready-status">
              🤖 <span>Ready to assist</span>
            </div>
          )}
        </div>

        {/* input row — textarea + send button */}
        <div className="ai-input-row">

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about MatManPro..."
            rows={1}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            ➤
          </button>

        </div>

      </div>

    </div>
  );
}
