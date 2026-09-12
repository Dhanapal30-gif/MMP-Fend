import { useState, useEffect, useRef } from "react";

import "./aiAssistant.css";

import { sendAiMessage } from "../../Services/aiApi";

import { Ear } from "lucide-react";

/* =====================================================
   REGEX
===================================================== */

const PARTCODE_REGEX =
  /\b(?=[A-Za-z0-9._-]*\d)[A-Za-z0-9][A-Za-z0-9._-]{4,}\b/;

const PICK_PUT_REGEX = /\b(yes|find)\b/i;

/* =====================================================
   DEFAULT QUESTIONS
===================================================== */

const DEFAULT_QUESTIONS = [
  {
    en: "Today’s Received Partcode List",
    hi: "आज प्राप्त हुए पार्टकोड की सूची",
  },
  {
    en: "Today’s Received Partcode and Quantity List",
    hi: "आज प्राप्त हुए पार्टकोड और मात्रा की सूची",
  },
  {
    en: "Today’s Issued Partcode List",
    hi: "आज जारी किए गए पार्टकोड की सूची",
  },
  {
    en: "Today’s Issued Partcode and Quantity List",
    hi: "आज जारी किए गए पार्टकोड और मात्रा की सूची",
  },
  {
    en: "Out-of-stock partcodes",
    hi: "स्टॉक में उपलब्ध नहीं पार्टकोड",
  },
  {
    en: "Total partcode stock",
    hi: "पार्टकोड के अनुसार कुल स्टॉक",
  },
];

/* =====================================================
   UI TEXT
===================================================== */
const UI = {
  en: {
    title: "MMP Smart AI",
    subtitle: "Inventory Assistant",
    greeting:
      "Good afternoon! I’m MIRA, your virtual assistant. What would you like to know?",
    placeholder: "Ask about MatManPro...",
    ready: "Ready to assist",
    listening: "Listening",
    thinking: "Thinking",
    newChat: "New Chat",
    error: "Sorry, I couldn't process your request.",
    outOfStockTitle: "Out-of-stock partcodes",
    serialNo: "S.No",
    partcode: "Partcode",
    description: "Description",
    quantity: "Qty",
    totalOutOfStock: "Total out-of-stock partcodes",
    outOfStockSpeech:
      "Out-of-stock partcodes list is displayed. Total out-of-stock partcodes:",
  },

  hi: {
    title: "MMP स्मार्ट AI",
    subtitle: "इन्वेंटरी असिस्टेंट",
    greeting:
      "नमस्ते! मैं MIRA हूँ, आपकी वर्चुअल असिस्टेंट। आप क्या जानना चाहते हैं?",
    placeholder: "MatManPro के बारे में पूछें...",
    ready: "सहायता के लिए तैयार",
    listening: "सुन रहा हूँ",
    thinking: "सोच रहा हूँ",
    newChat: "नई चैट",
    error:
      "क्षमा करें, आपकी रिक्वेस्ट को प्रोसेस नहीं किया जा सका।",
    outOfStockTitle:
      "स्टॉक में उपलब्ध नहीं पार्टकोड",
    serialNo: "क्रमांक",
    partcode: "पार्टकोड",
    description: "विवरण",
    quantity: "मात्रा",
    totalOutOfStock:
      "कुल आउट-ऑफ-स्टॉक पार्टकोड",
    outOfStockSpeech:
      "स्टॉक में उपलब्ध नहीं पार्टकोड की सूची दिखाई गई है। कुल स्टॉक में उपलब्ध नहीं पार्टकोड:",
  },
};

/* =====================================================
   PROTECT TECHNICAL VALUES
===================================================== */

const protectTechnicalValues = (text) => {
  const values = [];

  const protectedText = text.replace(
    /\b[A-Za-z0-9][A-Za-z0-9._-]*\d[A-Za-z0-9._-]*\b|\b\d+(?:\.\d+)?\b/g,
    (value) => {
      const key = `ZXQKEEP${values.length}ZXQ`;
      values.push(value);
      return key;
    }
  );

  return {
    protectedText,
    values,
  };
};

/* =====================================================
   RESTORE TECHNICAL VALUES
===================================================== */

const restoreTechnicalValues = (text, values) => {
  return text.replace(
    /ZXQKEEP(\d+)ZXQ/g,
    (_, index) => values[Number(index)] ?? ""
  );
};

/* =====================================================
   ENGLISH -> HINDI TRANSLATION
===================================================== */
/* =====================================================
   ENGLISH -> HINDI TRANSLATION
   LARGE RESPONSE SAFE VERSION
===================================================== */

const translateText = async (
  text,
  targetLanguage
) => {
  if (!text || targetLanguage === "en") {
    return text;
  }

  const {
    protectedText,
    values,
  } = protectTechnicalValues(text);

  /*
   * IMPORTANT:
   *
   * Do NOT send a 700-line response
   * in one request.
   *
   * Keep chunks small.
   */
  const chunks =
    protectedText.match(/[\s\S]{1,1500}/g) || [
      protectedText,
    ];

  const translatedChunks = [];

  /*
   * Process one chunk at a time.
   *
   * Promise.all() was causing too many
   * Google Translate requests for large
   * out-of-stock responses.
   */
  for (const chunk of chunks) {
    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: "en",
        tl: targetLanguage,
        dt: "t",
        q: chunk,
      });

      const result = await fetch(
        `https://translate.googleapis.com/translate_a/single?${params.toString()}`
      );

      if (!result.ok) {
        throw new Error(
          `Translation failed: ${result.status}`
        );
      }

      const data = await result.json();

      const translatedChunk =
        (data?.[0] || [])
          .map(
            (item) => item?.[0] || ""
          )
          .join("");

      translatedChunks.push(
        translatedChunk
      );
    } catch (error) {
      console.error(
        "Chunk translation failed:",
        error
      );

      /*
       * If one chunk fails, keep the original
       * English chunk instead of breaking the
       * entire response.
       */
      translatedChunks.push(chunk);
    }
  }

  return restoreTechnicalValues(
    translatedChunks.join(""),
    values
  );
};

/* =====================================================
   HINDI -> ENGLISH TRANSLATION
===================================================== */
/* =====================================================
   HINDI -> ENGLISH TRANSLATION
   LARGE RESPONSE SAFE VERSION
===================================================== */

const translateHindiToEnglish = async (
  text
) => {
  if (!text) {
    return text;
  }

  const {
    protectedText,
    values,
  } = protectTechnicalValues(text);

  const chunks =
    protectedText.match(/[\s\S]{1,1500}/g) || [
      protectedText,
    ];

  const translatedChunks = [];

  for (const chunk of chunks) {
    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: "hi",
        tl: "en",
        dt: "t",
        q: chunk,
      });

      const result = await fetch(
        `https://translate.googleapis.com/translate_a/single?${params.toString()}`
      );

      if (!result.ok) {
        throw new Error(
          `Translation failed: ${result.status}`
        );
      }

      const data = await result.json();

      const translatedChunk =
        (data?.[0] || [])
          .map(
            (item) => item?.[0] || ""
          )
          .join("");

      translatedChunks.push(
        translatedChunk
      );
    } catch (error) {
      console.error(
        "Hindi -> English chunk translation failed:",
        error
      );

      translatedChunks.push(chunk);
    }
  }

  return restoreTechnicalValues(
    translatedChunks.join(""),
    values
  );
};

/* =====================================================
   OUT-OF-STOCK TABLE PARSER
===================================================== */

/*
 Example backend response:

 Out-of-stock partcodes:

 - 084066A.103 - FSPC HARVESTED MODULES : 0
 - 084713A.101 - FXCA 850 RFBB ASSEMBLY : 0
 - 084713A.102 - RFBB : 0

 Total out-of-stock partcodes: 3

 This parser also works when the backend returns
 everything in ONE LINE.
*/

const getOutOfStockRows = (content) => {
  if (
    typeof content !== "string" ||
    !content
      .toLowerCase()
      .includes("out-of-stock partcodes:")
  ) {
    return [];
  }

  const rows = [];

  /*
   * Find every:
   *
   * - PARTCODE - DESCRIPTION : QTY
   *
   * globally, even when all records are on one line.
   */
  const rowRegex =
    /-\s*([A-Za-z0-9][A-Za-z0-9._-]*\d[A-Za-z0-9._-]*)\s*-\s*(.*?)\s*:\s*(-?\d+(?:\.\d+)?)/g;

  let match;

  while ((match = rowRegex.exec(content)) !== null) {
    rows.push({
      partcode: match[1].trim(),
      description: match[2].trim(),
      qty: match[3].trim(),
    });
  }

  return rows;
};

/* =====================================================
   OUT-OF-STOCK TOTAL
===================================================== */

const getOutOfStockTotal = (content) => {
  if (typeof content !== "string") {
    return null;
  }

  const match = content.match(
    /Total out-of-stock partcodes:\s*(\d+)/i
  );

  return match ? match[1] : null;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function AiAssistant() {
  /* ===================================================
     STATE
  =================================================== */

  const [language, setLanguage] = useState("en");

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [lastPartcode, setLastPartcode] = useState(null);

  const [speakingIndex, setSpeakingIndex] =
    useState(null);

  const [autoSpeak, setAutoSpeak] = useState(true);

  const [conversationId, setConversationId] =
    useState(
      window.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}`
    );

  const messagesEndRef = useRef(null);

  const containerRef = useRef(null);

  const [containerHeight, setContainerHeight] =
    useState("600px");

  /* ===================================================
     IMPORTANT REFS
  =================================================== */

  const languageRef = useRef(language);

  const autoSpeakRef = useRef(autoSpeak);

  const languageChangeId = useRef(0);

  /* ===================================================
     CURRENT UI TEXT
  =================================================== */

  const t = UI[language];

  /* ===================================================
     KEEP LANGUAGE REF UPDATED
  =================================================== */

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  /* ===================================================
     KEEP AUTO SPEAK REF UPDATED
  =================================================== */

  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  /* ===================================================
     INITIAL GREETING
  =================================================== */

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: UI.en.greeting,
        englishContent: UI.en.greeting,
        isGreeting: true,
      },
    ]);
  }, []);

  /* ===================================================
     LANGUAGE CHANGE
  =================================================== */

  useEffect(() => {
    const changeConversationLanguage = async () => {
      const wasAutoSpeaking =
        autoSpeakRef.current;

      window.speechSynthesis?.cancel();

      setSpeakingIndex(null);

      const changeId =
        ++languageChangeId.current;

      /* =================================================
         ENGLISH
      ================================================= */

      if (language === "en") {
        setMessages((prev) =>
          prev.map((message) => ({
            ...message,
            content:
              message.englishContent ??
              message.content,
          }))
        );

        if (wasAutoSpeaking) {
          const currentMessages = messages;

          const latestAssistant = [
            ...currentMessages,
          ]
            .map((message, index) => ({
              message,
              index,
            }))
            .reverse()
            .find(
              ({ message }) =>
                message.role === "assistant" &&
                typeof message.content ===
                  "string"
            );

          if (latestAssistant) {
            setTimeout(() => {
              if (
                autoSpeakRef.current &&
                languageRef.current === "en"
              ) {
                const englishText =
                  latestAssistant.message
                    .englishContent ??
                  latestAssistant.message.content;

                speakMessage(
                  englishText,
                  latestAssistant.index,
                  "en"
                );
              }
            }, 500);
          }
        }

        return;
      }

      /* =================================================
         HINDI
      ================================================= */

      const currentMessages = messages;

      const translatedMessages =
        await Promise.all(
          currentMessages.map(
            async (message) => {
              const englishContent =
                message.englishContent ??
                message.content;

              if (message.isGreeting) {
                return {
                  ...message,
                  englishContent:
                    UI.en.greeting,
                  content: UI.hi.greeting,
                };
              }

              try {
                const translatedContent =
                  await translateText(
                    englishContent,
                    "hi"
                  );

                return {
                  ...message,
                  englishContent,
                  content: translatedContent,
                };
              } catch (error) {
                console.error(
                  "Conversation translation error:",
                  error
                );

                return {
                  ...message,
                  englishContent,
                  content: englishContent,
                };
              }
            }
          )
        );

      if (
        changeId !== languageChangeId.current
      ) {
        return;
      }

      setMessages((prev) =>
        prev.map(
          (message, index) =>
            translatedMessages[index] ??
            message
        )
      );

      if (wasAutoSpeaking) {
        const latestAssistant = [
          ...translatedMessages,
        ]
          .map((message, index) => ({
            message,
            index,
          }))
          .reverse()
          .find(
            ({ message }) =>
              message.role === "assistant" &&
              typeof message.content ===
                "string"
          );

        if (latestAssistant) {
          setTimeout(() => {
            if (
              autoSpeakRef.current &&
              languageRef.current === "hi"
            ) {
              speakMessage(
                latestAssistant.message
                  .content,
                latestAssistant.index,
                "hi"
              );
            }
          }, 500);
        }
      }
    };

    changeConversationLanguage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  /* ===================================================
     CONTAINER HEIGHT
  =================================================== */

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const top =
          containerRef.current.getBoundingClientRect()
            .top;

        setContainerHeight(
          `calc(100vh - ${top + 16}px)`
        );
      }
    };

    updateHeight();

    window.addEventListener(
      "resize",
      updateHeight
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateHeight
      );
    };
  }, []);

  /* ===================================================
     AUTO SCROLL
  =================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =====================================================
     SPEAK MESSAGE
  ===================================================== */
/* =====================================================
   SPEAK MESSAGE
   LARGE RESPONSE SAFE VERSION
===================================================== */
const speakMessage = (
  text,
  index,
  languageOverride = null
) => {
  if (
    !text ||
    !window.speechSynthesis ||
    !window.SpeechSynthesisUtterance
  ) {
    console.error(
      "Speech synthesis is not supported."
    );
    return;
  }

  const speechLanguage =
    languageOverride ||
    languageRef.current;

  window.speechSynthesis.cancel();

  setSpeakingIndex(null);

  const cleanText = String(text)
    .replace(/[*_#]/g, "")
    .replace(
      /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    return;
  }

  /*
   * Keep speech chunks small.
   */
  const speechChunks =
    cleanText.match(/.{1,160}(?:\s|$)/g) || [
      cleanText,
    ];

  let currentChunk = 0;
  let stopped = false;

  const getVoices = () => {
    return window.speechSynthesis.getVoices() || [];
  };

  const speakNextChunk = () => {
    if (stopped) {
      return;
    }

    if (
      !autoSpeakRef.current ||
      languageRef.current !== speechLanguage
    ) {
      setSpeakingIndex(null);
      return;
    }

    if (
      currentChunk >= speechChunks.length
    ) {
      setSpeakingIndex(null);
      return;
    }

    const chunk =
      speechChunks[currentChunk];

    const utterance =
      new SpeechSynthesisUtterance(chunk);

    const voices = getVoices();

    /*
     * ================================
     * HINDI VOICE
     * ================================
     */
    if (speechLanguage === "hi") {
      const hindiVoice =
        voices.find(
          (voice) =>
            /^hi-IN$/i.test(voice.lang)
        ) ||
        voices.find(
          (voice) =>
            /^hi/i.test(voice.lang)
        ) ||
        voices.find(
          (voice) =>
            /hindi/i.test(voice.name)
        );

      if (hindiVoice) {
        utterance.voice =
          hindiVoice;
        utterance.lang =
          hindiVoice.lang || "hi-IN";
      } else {
        /*
         * Even if Chrome has not loaded
         * the Hindi voice yet, force
         * Hindi language.
         */
        utterance.lang = "hi-IN";

        console.warn(
          "Hindi voice not found. Using hi-IN fallback."
        );
      }
    }

    /*
     * ================================
     * ENGLISH VOICE
     * ================================
     */
    else {
      const indianFemaleVoice =
        voices.find(
          (voice) =>
            /en-IN/i.test(voice.lang) &&
            /female|veena|heera/i.test(
              voice.name
            )
        );

      const femaleVoice =
        voices.find(
          (voice) =>
            /female|zira|samantha|aria|jenny|susan|hazel/i.test(
              voice.name
            )
        );

      const indianEnglishVoice =
        voices.find(
          (voice) =>
            /en-IN/i.test(voice.lang)
        );

      utterance.voice =
        indianFemaleVoice ||
        femaleVoice ||
        indianEnglishVoice ||
        null;

      utterance.lang =
        utterance.voice?.lang ||
        "en-IN";
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeakingIndex(index);
    };

    utterance.onend = () => {
      if (stopped) {
        return;
      }

      currentChunk++;

      setTimeout(() => {
        /*
         * Chrome sometimes pauses speech
         * unexpectedly.
         */
        if (
          window.speechSynthesis.paused
        ) {
          window.speechSynthesis.resume();
        }

        speakNextChunk();
      }, 100);
    };

    utterance.onerror = (event) => {
      console.error(
        "Speech synthesis error:",
        event
      );

      currentChunk++;

      setTimeout(() => {
        if (
          !stopped &&
          autoSpeakRef.current &&
          languageRef.current ===
            speechLanguage
        ) {
          speakNextChunk();
        } else {
          setSpeakingIndex(null);
        }
      }, 150);
    };

    /*
     * Chrome sometimes needs resume()
     * before starting speech.
     */
    window.speechSynthesis.resume();

    window.speechSynthesis.speak(
      utterance
    );
  };

  /*
   * Small delay gives Chrome time to
   * initialize the speech engine.
   */
  setTimeout(() => {
    if (
      autoSpeakRef.current &&
      languageRef.current === speechLanguage
    ) {
      speakNextChunk();
    }
  }, 100);
};

  /* =====================================================
     LOAD BROWSER VOICES
  ===================================================== */

  useEffect(() => {
    if (!window.speechSynthesis) {
      return;
    }

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );
    };
  }, []);

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const sendMessage = async (
    questionFromButton = null
  ) => {
    const rawText = (
      questionFromButton ?? input
    ).trim();

    if (!rawText || loading) {
      return;
    }

    let textToSend = rawText;

    /* =================================================
       PICK / PUT DETECTION
    ================================================= */

    const mentionsPickOrPut =
      PICK_PUT_REGEX.test(rawText);

    const partcodeInMessage =
      rawText.match(PARTCODE_REGEX);

    if (
      mentionsPickOrPut &&
      !partcodeInMessage &&
      lastPartcode
    ) {
      textToSend = `${lastPartcode} ${rawText}`;
    } else if (partcodeInMessage) {
      setLastPartcode(
        partcodeInMessage[0]
      );
    }

    setInput("");

    setLoading(true);

    try {
      /* =================================================
         HINDI -> ENGLISH
      ================================================= */

      if (languageRef.current === "hi") {
        textToSend =
          await translateHindiToEnglish(
            textToSend
          );
      }

      /* =================================================
         SAVE USER MESSAGE
      ================================================= */

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: rawText,
          englishContent: textToSend,
        },
      ]);

      /* =================================================
         CALL EXISTING ENGLISH BACKEND
      ================================================= */

      const response =
        await sendAiMessage(
          textToSend,
          conversationId
        );

      const englishMessage =
        response.message;

      /* =================================================
         GET CURRENT LANGUAGE
      ================================================= */

      const currentLanguage =
        languageRef.current;

      /* =================================================
         TRANSLATE BACKEND RESPONSE
      ================================================= */

      const displayMessage =
        currentLanguage === "hi"
          ? await translateText(
              englishMessage,
              "hi"
            )
          : englishMessage;

      /* =================================================
         ADD ASSISTANT MESSAGE
      ================================================= */

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: displayMessage,
          englishContent:
            englishMessage,
        },
      ]);

      /* =================================================
         AUTO SPEAK RESPONSE
      ================================================= */

      if (
        autoSpeakRef.current &&
        displayMessage
      ) {
        const assistantIndex =
          messages.length + 1;

        setTimeout(() => {
          if (
            !autoSpeakRef.current
          ) {
            return;
          }

          if (
            languageRef.current !==
            currentLanguage
          ) {
            return;
          }

          speakMessage(
            displayMessage,
            assistantIndex,
            currentLanguage
          );
        }, 300);
      }
    } catch (error) {
      console.error(
        "AI / translation error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t.error,
          englishContent:
            UI.en.error,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DEFAULT QUESTION
  ===================================================== */

  const handleQuestionClick = (
    question
  ) => {
    if (!loading) {
      sendMessage(
        language === "hi"
          ? question.hi
          : question.en
      );
    }
  };

  /* =====================================================
     ENTER KEY
  ===================================================== */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  /* =====================================================
     NEW CHAT
  ===================================================== */

  const handleNewChat = () => {
    window.speechSynthesis?.cancel();

    setSpeakingIndex(null);

    const newId =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;

    setConversationId(newId);

    setLastPartcode(null);

    setInput("");

    setMessages([
      {
        role: "assistant",
        content: t.greeting,
        englishContent:
          UI.en.greeting,
        isGreeting: true,
      },
    ]);
  };

  /* =====================================================
     INPUT STATE
  ===================================================== */

  const isTyping =
    input.trim().length > 0;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="ai-container"
      ref={containerRef}
      style={{
        height: containerHeight,
        maxHeight: containerHeight,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="ai-header">
        <div>
          <h3>{t.title}</h3>

          <span>{t.subtitle}</span>
        </div>

        <div className="ai-header-actions">
          {/* =================================================
              LANGUAGE SELECTOR
          ================================================= */}

          <select
            className="language-selector"
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value
              )
            }
          >
            <option value="en">
              English
            </option>

            <option value="hi">
              हिंदी
            </option>
          </select>

          {/* =================================================
              NEW CHAT
          ================================================= */}

          <button
            onClick={handleNewChat}
          >
            {t.newChat}
          </button>
        </div>
      </div>

      {/* =================================================
          MESSAGES
      ================================================= */}

      <div className="ai-messages">
        {messages.map(
          (message, index) => {
            /*
             * IMPORTANT:
             *
             * Always use englishContent for detecting
             * the out-of-stock response.
             *
             * This means the table continues to work
             * even when the current UI language is Hindi.
             */
            const sourceContent =
              message.englishContent ??
              message.content;

            const outOfStockRows =
              message.role === "assistant"
                ? getOutOfStockRows(
                    sourceContent
                  )
                : [];

            const outOfStockTotal =
              message.role === "assistant"
                ? getOutOfStockTotal(
                    sourceContent
                  )
                : null;

            const isOutOfStockTable =
              outOfStockRows.length > 0;

            return (
              <div
                key={index}
                className={`message-row ${message.role}`}
              >
                <div className="message-bubble">
                  {/* =================================================
                      OUT-OF-STOCK TABLE
                  ================================================= */}

                  {isOutOfStockTable ? (
                    <>
                      <div
                        style={{
                          marginBottom:
                            "10px",
                        }}
                      >
                        <strong>
                          {t.outOfStockTitle}
                        </strong>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          overflowX:
                            "auto",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse:
                              "collapse",
                            fontSize:
                              "14px",
                          }}
                        >
                          <thead>
                            <tr>
                              <th
                                style={{
                                  border:
                                    "1px solid #ddd",
                                  padding:
                                    "8px",
                                  textAlign:
                                    "left",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {t.serialNo}
                              </th>

                              <th
                                style={{
                                  border:
                                    "1px solid #ddd",
                                  padding:
                                    "8px",
                                  textAlign:
                                    "left",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {t.partcode}
                              </th>

                              <th
                                style={{
                                  border:
                                    "1px solid #ddd",
                                  padding:
                                    "8px",
                                  textAlign:
                                    "left",
                                }}
                              >
                                {t.description}
                              </th>

                              <th
                                style={{
                                  border:
                                    "1px solid #ddd",
                                  padding:
                                    "8px",
                                  textAlign:
                                    "right",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {t.quantity}
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {outOfStockRows.map(
                              (
                                row,
                                rowIndex
                              ) => (
                                <tr
                                  key={`${row.partcode}-${rowIndex}`}
                                >
                                  <td
                                    style={{
                                      border:
                                        "1px solid #ddd",
                                      padding:
                                        "8px",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {rowIndex +
                                      1}
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #ddd",
                                      padding:
                                        "8px",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {
                                      row.partcode
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #ddd",
                                      padding:
                                        "8px",
                                    }}
                                  >
                                    {
                                      row.description
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #ddd",
                                      padding:
                                        "8px",
                                      textAlign:
                                        "right",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {row.qty}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>

                      {outOfStockTotal && (
                        <div
                          style={{
                            marginTop:
                              "10px",
                          }}
                        >
                          <strong>
                            {
                              t.totalOutOfStock
                            }
                            :{" "}
                            {
                              outOfStockTotal
                            }
                          </strong>
                        </div>
                      )}
                    </>
                  ) : (
                    /* =================================================
                       NORMAL MESSAGE
                    ================================================= */

                    message.content
                  )}

                  {/* =================================================
                      SPEAK BUTTON
                  ================================================= */}

                  {message.role ===
                    "assistant" &&
                    typeof message.content ===
                      "string" && (
                      <button
                        className={`speak-button ${
                          speakingIndex ===
                          index
                            ? "speaking"
                            : ""
                        }`}
                        onClick={() => {
                          /* =========================================
                             CURRENTLY SPEAKING
                          ========================================= */

                          if (
                            speakingIndex ===
                            index
                          ) {
                            window.speechSynthesis.cancel();

                            autoSpeakRef.current =
                              false;

                            setAutoSpeak(
                              false
                            );

                            setSpeakingIndex(
                              null
                            );

                            return;
                          }

                          /* =========================================
                             MANUAL SPEAK
                          ========================================= */

                          autoSpeakRef.current =
                            true;

                          setAutoSpeak(
                            true
                          );

                          /*
                           * Speak the currently displayed
                           * message in the selected language.
                           */
                          speakMessage(
                            message.content,
                            index,
                            languageRef.current
                          );
                        }}
                        title={
                          speakingIndex ===
                          index
                            ? "Stop speaking"
                            : autoSpeak
                            ? "Speaking enabled"
                            : "Turn speaking ON"
                        }
                      >
                        {speakingIndex ===
                        index
                          ? "🔊"
                          : autoSpeak
                          ? "🔊"
                          : "🔇"}
                      </button>
                    )}
                </div>
              </div>
            );
          }
        )}

        {/* =================================================
            DEFAULT QUESTIONS
        ================================================= */}

        <div className="default-question-container">
          {DEFAULT_QUESTIONS.map(
            (question, index) => (
              <button
                key={index}
                className="default-question"
                onClick={() =>
                  handleQuestionClick(
                    question
                  )
                }
                disabled={loading}
              >
                {language === "hi"
                  ? question.hi
                  : question.en}
              </button>
            )
          )}
        </div>

        {/* =================================================
            THINKING
        ================================================= */}

        {loading && (
          <div className="message-row assistant thinking-row">
            <div className="thinking-avatar">
              🧠
            </div>

            <div className="thinking-bubble">
              <span>
                {t.thinking}
              </span>

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

      {/* =================================================
          INPUT AREA
      ================================================= */}

      <div className="ai-input-container">
        {/* =================================================
            STATUS
        ================================================= */}

        <div className="typing-status">
          {isTyping ? (
            <>
              <div className="typing-ai-icon">
                🤖
              </div>

              <div className="typing-text">
                <span className="ear-icon"></span>

                {t.listening}

                <span>✨</span>

                <span>✦</span>

                <span>✨</span>

                <div className="typing-sparkles">
                  <span>
                    <Ear
                      size={22}
                      strokeWidth={2}
                    />
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="ready-status">
              🤖{" "}
              <span>
                {t.ready}
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            INPUT ROW
        ================================================= */}

        <div className="ai-input-row">
          <textarea
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder={
              t.placeholder
            }
            rows={1}
          />

          <button
            onClick={() =>
              sendMessage()
            }
            disabled={
              loading ||
              !input.trim()
            }
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}