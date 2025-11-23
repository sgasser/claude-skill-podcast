import React, { useState, useEffect, useRef } from 'react';

// === CONFIGURATION - SET BY CLAUDE ===
const PODCAST_SCRIPT = `<speaker1>Welcome to our podcast. What are we discussing today?
<speaker2>Today we're exploring an interesting topic with detailed information and facts. This demonstrates the podcast format with natural dialogue between host and expert.
<speaker1>Tell us more about the key aspects.
<speaker2>Here are the important details and insights. The expert provides comprehensive information while maintaining a conversational tone. Multiple sentences allow for thorough coverage.
<speaker1>That's a great overview. Thanks for sharing.`;

const PODCAST_TITLE = "Demo Podcast";
const PODCAST_LANGUAGE = 'en';
// === END CONFIGURATION ===

// Platform detection
const detectPlatform = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isMobile = isIOS || isAndroid;
  const isEdge = /edg/.test(ua);
  const isChrome = /chrome/.test(ua) && !isEdge;

  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  if (isEdge && !isMobile) return 'desktop_edge';
  if (isChrome && !isMobile) return 'desktop_chrome';
  return 'desktop';
};

// Desktop Edge voices (Microsoft Neural/Natural)
const DESKTOP_EDGE_VOICES = {
  de: ['Katja', 'Conrad', 'Seraphina', 'Florian', 'Amala', 'Killian'],
  en: ['Aria', 'Guy', 'Jenny', 'Davis', 'Sara', 'Ryan', 'Zira'],
  fr: ['Denise', 'Henri', 'Vivienne', 'Alain'],
  es: ['Elvira', 'Jorge', 'Lucia', 'Pablo'],
  it: ['Elsa', 'Diego', 'Isabella', 'Cosimo'],
  pt: ['Francisca', 'Antonio', 'Raquel'],
  nl: ['Colette', 'Fenna', 'Maarten'],
  pl: ['Zofia', 'Marek'],
  ru: ['Svetlana', 'Dmitry'],
  ja: ['Nanami', 'Keita'],
  zh: ['Xiaoxiao', 'Yunyang']
};

// Chrome Desktop voices (Google high-quality voices)
const CHROME_VOICES = {
  de: ['Google Deutsch'],
  en: ['Google UK English Female', 'Google UK English Male', 'Google US English'],
  fr: ['Google français'],
  es: ['Google español', 'Google español de Estados Unidos'],
  it: ['Google italiano'],
  pt: ['Google português do Brasil'],
  nl: ['Google Nederlands'],
  pl: ['Google polski'],
  ru: ['Google русский язык'],
  ja: ['Google 日本語'],
  zh: ['Google 普通话(中国大陆)']
};

// iOS voices (native Siri voices)
const IOS_VOICES = {
  de: ['Anna', 'Markus', 'Petra', 'Yannick'],
  en: ['Samantha', 'Daniel', 'Karen', 'Alex', 'Victoria', 'Fred'],
  fr: ['Amelie', 'Thomas', 'Audrey'],
  es: ['Monica', 'Jorge', 'Paulina'],
  it: ['Alice', 'Luca'],
  pt: ['Luciana', 'Joana'],
  nl: ['Ellen', 'Xander'],
  pl: ['Zosia', 'Krzysztof'],
  ru: ['Milena', 'Yuri'],
  ja: ['Kyoko', 'Otoya'],
  zh: ['Ting-Ting', 'Sin-Ji']
};

// Android voices (Google TTS)
const ANDROID_VOICES = {
  de: ['Google Deutsch', 'de-DE-Wavenet'],
  en: ['Google UK English Female', 'Google US English', 'en-US-Wavenet'],
  fr: ['Google français', 'fr-FR-Wavenet'],
  es: ['Google español', 'es-ES-Wavenet'],
  it: ['Google italiano', 'it-IT-Wavenet'],
  pt: ['Google português', 'pt-BR-Wavenet'],
  nl: ['Google Nederlands', 'nl-NL-Wavenet'],
  pl: ['Google polski', 'pl-PL-Wavenet'],
  ru: ['Google русский', 'ru-RU-Wavenet'],
  ja: ['Google 日本語', 'ja-JP-Wavenet'],
  zh: ['Google 普通话', 'zh-CN-Wavenet']
};

const parseScript = (text) => {
  const lines = [];
  const regex = /<speaker([1-4])>([^<]+)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    lines.push({ speaker: parseInt(match[1]), text: match[2].trim() });
  }
  return lines;
};

const speakerConfig = {
  1: { pitch: 1.05, rate: 0.95, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  2: { pitch: 0.88, rate: 0.93, color: 'bg-slate-100 text-slate-600 border-slate-300' },
  3: { pitch: 1.0, rate: 0.9, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  4: { pitch: 0.8, rate: 0.92, color: 'bg-purple-50 text-purple-600 border-purple-200' },
};

const PodcastPlayer = () => {
  const [voices, setVoices] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [voicesReady, setVoicesReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ platform: '', voiceCount: 0 });
  const synthRef = useRef(window.speechSynthesis);
  const playingRef = useRef(false);
  const lines = parseScript(PODCAST_SCRIPT);
  const lineRefs = useRef([]);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = synthRef.current.getVoices();
      if (allVoices.length === 0) return;

      const platform = detectPlatform();
      const langCode = PODCAST_LANGUAGE.split('-')[0];

      // Get platform-specific preferred voices
      let preferredNames;
      if (platform === 'ios') {
        preferredNames = IOS_VOICES[langCode] || IOS_VOICES['en'];
      } else if (platform === 'android') {
        preferredNames = ANDROID_VOICES[langCode] || ANDROID_VOICES['en'];
      } else if (platform === 'desktop_edge') {
        preferredNames = DESKTOP_EDGE_VOICES[langCode] || DESKTOP_EDGE_VOICES['en'];
      } else if (platform === 'desktop_chrome') {
        preferredNames = CHROME_VOICES[langCode] || CHROME_VOICES['en'];
      } else {
        // Fallback for other desktop browsers
        preferredNames = CHROME_VOICES[langCode] || CHROME_VOICES['en'];
      }

      // Filter voices by language
      let langVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith(langCode));
      if (langVoices.length === 0) langVoices = allVoices.filter(v => v.lang.startsWith('en'));

      // Score voices based on platform preferences
      const scored = langVoices.map(v => {
        let score = 0;

        // Match against preferred voice names
        const nameMatch = preferredNames.findIndex(n => v.name.includes(n));
        if (nameMatch >= 0) score += 100 - nameMatch;

        // Platform-specific scoring
        if (platform === 'desktop_edge') {
          // Edge: prioritize Microsoft voices
          if (v.name.includes('Microsoft')) score += 50;
          if (v.name.includes('Neural') || v.name.includes('Natural')) score += 40;
        } else if (platform === 'desktop_chrome') {
          // Chrome: prioritize Google voices
          if (v.name.includes('Google')) score += 50;
          if (v.name.includes('Natural')) score += 30;
        } else if (platform === 'android') {
          // Android: prioritize Google voices
          if (v.name.includes('Google')) score += 50;
          if (v.name.includes('Wavenet')) score += 30;
        } else if (platform === 'ios') {
          // iOS: prioritize native Siri voices (no Google/Microsoft prefix)
          if (!v.name.includes('Google') && !v.name.includes('Microsoft')) score += 50;
        } else {
          // Other desktop browsers: prefer Google voices if available
          if (v.name.includes('Google')) score += 40;
        }

        return { voice: v, score };
      });

      scored.sort((a, b) => b.score - a.score);

      // Deduplicate by name - keep only first occurrence of each voice name
      const uniqueVoices = [];
      const seenNames = new Set();
      for (const item of scored) {
        const baseName = item.voice.name.split('(')[0].trim();
        if (!seenNames.has(baseName)) {
          seenNames.add(baseName);
          uniqueVoices.push(item.voice);
        }
      }

      // Get number of speakers needed
      const uniqueSpeakers = [...new Set(lines.map(l => l.speaker))];
      const numSpeakersNeeded = uniqueSpeakers.length;

      // Take top N unique voices, fallback to all voices if needed
      let voicesToUse = uniqueVoices.slice(0, numSpeakersNeeded);
      if (voicesToUse.length < numSpeakersNeeded) {
        voicesToUse = allVoices.slice(0, numSpeakersNeeded);
      }

      // Assign voices to speakers
      const assignments = {};
      uniqueSpeakers.forEach((spk, idx) => {
        assignments[spk] = voicesToUse[idx % voicesToUse.length];
      });

      setVoices(assignments);
      setVoicesReady(true);

      // Set debug info
      setDebugInfo({
        platform: platform,
        voiceCount: allVoices.length,
        speaker1: assignments[1]?.name || 'N/A',
        speaker2: assignments[2]?.name || 'N/A'
      });
    };

    speechSynthesis.onvoiceschanged = loadVoices;

    const fallbackTimer = setTimeout(() => {
      loadVoices();
    }, 500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (currentLine >= 0 && lineRefs.current[currentLine]) {
      lineRefs.current[currentLine].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLine]);

  const speakLine = (line, index) => {
    return new Promise((resolve) => {
      const voice = voices[line.speaker];
      const config = speakerConfig[line.speaker];
      
      const utterance = new SpeechSynthesisUtterance(line.text);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      
      utterance.onend = () => setTimeout(resolve, 350);
      utterance.onerror = () => resolve();
      
      setCurrentLine(index);
      synthRef.current.speak(utterance);
    });
  };

  const playFrom = async (startIndex = 0) => {
    if (isPlaying && !isPaused) {
      // Currently playing -> Stop
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      playingRef.current = false;
      setCurrentLine(-1);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    playingRef.current = true;

    for (let i = startIndex; i < lines.length; i++) {
      if (!playingRef.current) break;
      await speakLine(lines[i], i);
    }

    setIsPlaying(false);
    setIsPaused(false);
    playingRef.current = false;
    setCurrentLine(-1);
  };

  const togglePause = () => {
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const stop = () => {
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    playingRef.current = false;
    setCurrentLine(-1);
  };

  const handleLineClick = (index) => {
    if (isPlaying) {
      synthRef.current.cancel();
      playingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
    }
    setTimeout(() => playFrom(index), 100);
  };

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      togglePause();
    } else if (isPaused) {
      togglePause();
    } else {
      playFrom(0);
    }
  };

  const progress = currentLine >= 0 ? ((currentLine + 1) / lines.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-slate-700 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">🎙️</div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-white">{PODCAST_TITLE}</h1>
                <p className="text-slate-200 text-xs">
                  {lines.length} segments • {PODCAST_LANGUAGE.toUpperCase()}
                  {!voicesReady && ' • Loading voices...'}
                </p>
              </div>
            </div>
            {isPlaying && (
              <div className="mt-3 bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-400 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          {/* Debug Info */}
          {voicesReady && debugInfo.platform && (
            <div className="px-5 py-2 bg-blue-50 border-b border-blue-100">
              <p className="text-xs text-blue-700">
                <strong>Platform:</strong> {debugInfo.platform} •
                <strong> Voices available:</strong> {debugInfo.voiceCount} •
                <strong> Speaker 1:</strong> {debugInfo.speaker1} •
                <strong> Speaker 2:</strong> {debugInfo.speaker2}
              </p>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Transcript - clickable lines */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 h-80 overflow-y-auto">
              <div className="p-3 space-y-2">
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    ref={el => lineRefs.current[idx] = el}
                    onClick={() => handleLineClick(idx)}
                    className={`flex gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                      currentLine === idx
                        ? 'bg-blue-50 border border-blue-200 shadow-sm'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold shrink-0 border ${speakerConfig[line.speaker].color}`}>
                      {line.speaker}
                    </span>
                    <span className="text-gray-800 text-sm leading-relaxed">{line.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={handlePlayPause}
                disabled={!voicesReady}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  !voicesReady
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isPaused
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                      : isPlaying
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                {isPaused ? '▶️ Resume' : isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <button
                onClick={stop}
                disabled={!isPlaying && !isPaused}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  !isPlaying && !isPaused
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm'
                }`}
              >
                ⏹️
              </button>
            </div>

            <p className="text-gray-500 text-xs text-center">
              Click any line to start from there
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastPlayer;
