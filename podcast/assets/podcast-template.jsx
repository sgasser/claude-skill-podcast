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

// Heuristic-based voice quality detection with whitelist bonuses
// Works for ALL languages and ALL 250+ Edge voices automatically

// Known high-quality voices (bonus points, but not required)
const PREMIUM_VOICES = {
  en: ['Aria', 'Jenny', 'Guy', 'Emma', 'Andrew', 'Samantha', 'Daniel', 'Karen', 'Alex'],
  de: ['Katja', 'Conrad', 'Seraphina', 'Florian', 'Anna', 'Petra'],
  fr: ['Denise', 'Henri', 'Amelie', 'Thomas'],
  es: ['Elvira', 'Lucia', 'Monica', 'Jorge'],
  it: ['Elsa', 'Diego', 'Isabella', 'Alice', 'Luca'],
  pt: ['Francisca', 'Antonio', 'Luciana'],
  nl: ['Colette', 'Fenna', 'Ellen'],
  pl: ['Zofia', 'Marek', 'Zosia'],
  ru: ['Svetlana', 'Dmitry', 'Milena'],
  ja: ['Nanami', 'Kyoko', 'Otoya'],
  zh: ['Xiaoxiao', 'Ting-Ting']
};

// Voices to absolutely never use (novelty/poor quality)
const VOICE_BLACKLIST = [
  'Albert', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Deranged',
  'Good News', 'Jester', 'Organ', 'Superstar', 'Trinoids', 'Whisper',
  'Wobble', 'Zarvox', 'Bad News', 'Princess', 'Ralph', 'Pipe Organ',
  'Kathy', 'Hysterical', 'Junior', 'Flo'
];

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

      // Get premium voices list for this language
      const premiumList = PREMIUM_VOICES[langCode] || PREMIUM_VOICES['en'];

      // Filter out blacklisted voices and filter by language
      let langVoices = allVoices.filter(v => {
        const isBlacklisted = VOICE_BLACKLIST.some(bad => v.name.includes(bad));
        return !isBlacklisted && v.lang.toLowerCase().startsWith(langCode);
      });

      // Fallback to English if no voices found for language
      if (langVoices.length === 0) {
        langVoices = allVoices.filter(v => {
          const isBlacklisted = VOICE_BLACKLIST.some(bad => v.name.includes(bad));
          return !isBlacklisted && v.lang.startsWith('en');
        });
      }

      // Ultimate fallback: if still no voices, take any non-blacklisted voice
      if (langVoices.length === 0) {
        langVoices = allVoices.filter(v => {
          const isBlacklisted = VOICE_BLACKLIST.some(bad => v.name.includes(bad));
          return !isBlacklisted;
        });
      }

      // HEURISTIC-BASED SCORING (works for ALL voices, ALL languages)
      const scored = langVoices.map(v => {
        let score = 0;

        // PRIMARY: Quality indicators (works for all 250+ Edge voices)
        if (v.name.includes('Neural'))    score += 500; // Highest quality
        if (v.name.includes('Natural'))   score += 500; // Highest quality
        if (v.name.includes('Wavenet'))   score += 400; // Google high quality
        if (v.name.includes('Premium'))   score += 300;
        if (v.name.includes('Enhanced'))  score += 300;

        // SECONDARY: Provider reputation
        if (v.name.includes('Microsoft')) score += 250;
        if (v.name.includes('Google'))    score += 200;
        if (!v.name.includes('Google') && !v.name.includes('Microsoft')) {
          // Likely Apple/native voices (good on iOS/macOS)
          score += 150;
        }

        // TERTIARY: Known premium voices (bonus)
        const isPremium = premiumList.some(name => v.name.includes(name));
        if (isPremium) score += 100;

        // PLATFORM-SPECIFIC: Prefer local voices
        if (v.localService) score += 50; // Offline-capable voices

        // BASELINE: All non-blacklisted voices get minimum score
        if (score === 0) score = 10;

        return { voice: v, score };
      });

      // Sort by score (highest first)
      scored.sort((a, b) => b.score - a.score);

      // Deduplicate by base name
      const uniqueVoices = [];
      const seenNames = new Set();
      for (const item of scored) {
        // Only split at '(' to remove language/region suffix, not at '-'
        const baseName = item.voice.name.split('(')[0].trim();
        if (!seenNames.has(baseName)) {
          seenNames.add(baseName);
          uniqueVoices.push(item.voice);
        }
      }

      // Get number of speakers needed
      const uniqueSpeakers = [...new Set(lines.map(l => l.speaker))];
      const numSpeakersNeeded = uniqueSpeakers.length;

      // Take top N unique voices
      let voicesToUse = uniqueVoices.slice(0, numSpeakersNeeded);

      // Fallback: if we don't have enough voices, use what we have
      if (voicesToUse.length < numSpeakersNeeded && uniqueVoices.length > 0) {
        voicesToUse = uniqueVoices;
      }

      // Final safety: if no voices at all, use first available voice (should never happen)
      if (voicesToUse.length === 0 && allVoices.length > 0) {
        voicesToUse = [allVoices[0]];
      }

      // Assign voices to speakers using modulo for cycling
      const assignments = {};
      uniqueSpeakers.forEach((spk, idx) => {
        assignments[spk] = voicesToUse[idx % voicesToUse.length];
      });

      setVoices(assignments);
      setVoicesReady(true);

      // Set debug info with scores for transparency
      const speaker1Voice = assignments[1];
      const speaker2Voice = assignments[2];
      const speaker1Score = speaker1Voice ? scored.find(s => s.voice === speaker1Voice)?.score : 0;
      const speaker2Score = speaker2Voice ? scored.find(s => s.voice === speaker2Voice)?.score : 0;

      setDebugInfo({
        platform: platform,
        voiceCount: allVoices.length,
        speaker1: speaker1Voice?.name || 'N/A',
        speaker2: speaker2Voice?.name || 'N/A',
        score1: speaker1Score,
        score2: speaker2Score
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
