import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { languages } from './config/languages';

function LanguagePage() {
  const { languageCode } = useParams();
  const language = languages.find(lang => lang.code === languageCode);
  
  // State to track which translations are visible
  const [visibleTranslations, setVisibleTranslations] = useState(new Set());
  
  // State to track TTS availability and status
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [runtimeError, setRuntimeError] = useState('');
  const [speakingRank, setSpeakingRank] = useState(null);
  const utteranceRef = useRef(null);
  
  // Import the language data dynamically
  const [words, setWords] = useState([]);
  
  // Load language data
  useEffect(() => {
    import(`./config/${languageCode}.json`)
      .then(module => setWords(module.default.slice(0, 100)))
      .catch(err => console.error('Error loading language data:', err));
  }, [languageCode]);
  
  // Check TTS availability
  useEffect(() => {
    // Check if Web Speech API is available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTtsAvailable(true);
      
      // Load voices (some browsers need this to be triggered)
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      // Some browsers fire voiceschanged event when voices are loaded
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    } else {
      setTtsAvailable(false);
      setTtsError('Text-to-Speech is not supported in your browser. Try using Chrome, Edge, Safari, or Firefox.');
    }
    
    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Language not found</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }
  
  const toggleTranslation = (rank) => {
    setVisibleTranslations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rank)) {
        newSet.delete(rank);
      } else {
        newSet.add(rank);
      }
      return newSet;
    });
  };
  
  // Map language codes to proper locale codes for TTS
  const localeMap = {
    'de': 'de-DE',
    'es': 'es-ES',
    'it': 'it-IT',
    'cz': 'cs-CZ',
    'ar': 'ar-SA'
  };
  
  const speakWord = (word, rank) => {
    // Check if Web Speech API is available (should not happen due to disabled buttons)
    if (!window.speechSynthesis) {
      return;
    }
    
    // Clear any previous runtime errors
    setRuntimeError('');
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setSpeakingRank(null);
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(word);
    utteranceRef.current = utterance;
    
    // Set the language for the utterance
    utterance.lang = localeMap[languageCode] || languageCode;
    
    // Set speech rate (slightly slower for better pronunciation)
    utterance.rate = 0.9;
    
    // Handle events
    utterance.onstart = () => {
      setSpeakingRank(rank);
    };
    
    utterance.onend = () => {
      setSpeakingRank(null);
      utteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeakingRank(null);
      utteranceRef.current = null;
      
      if (event.error === 'not-allowed') {
        setRuntimeError('Text-to-Speech was blocked. Please check your browser permissions.');
      } else if (event.error === 'network') {
        setRuntimeError('Text-to-Speech requires an internet connection.');
      } else {
        setRuntimeError('Text-to-Speech failed. Your browser may not support this language.');
      }
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setRuntimeError(''), 5000);
    };
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    const targetLang = localeMap[languageCode] || languageCode;
    
    // Try to find a voice that matches the language
    const matchingVoice = voices.find(voice => 
      voice.lang.startsWith(targetLang) || 
      voice.lang.startsWith(languageCode)
    );
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    // Speak the word
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking word:', error);
      setRuntimeError('Text-to-Speech failed. Please try again.');
      setSpeakingRank(null);
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setRuntimeError(''), 5000);
    }
  };
  
  const getBackgroundColor = (pos) => {
    if (pos.includes('noun')) return 'bg-yellow-100';
    if (pos.includes('verb')) return 'bg-green-100';
    if (pos.includes('adjective')) return 'bg-blue-100';
    return '';
  };
  
  const getPosAbbreviation = (pos) => {
    const abbreviations = {
      'noun': 'n.',
      'verb': 'v.',
      'adjective': 'adj.',
      'adverb': 'adv.',
      'pronoun': 'pron.',
      'preposition': 'prep.',
      'conjunction': 'conj.',
      'article': 'art.',
      'particle': 'part.',
      'interjection': 'interj.'
    };
    
    // Handle compound pos like "preposition+article"
    if (pos.includes('+')) {
      return pos.split('+').map(p => abbreviations[p.trim()] || p).join('+');
    }
    if (pos.includes('/')) {
      return pos.split('/').map(p => abbreviations[p.trim()] || p).join('/');
    }
    
    return abbreviations[pos] || pos;
  };
  
  const getGenderAbbreviation = (gender) => {
    if (!gender) return '';
    
    const abbreviations = {
      'masculine': 'm.',
      'feminine': 'f.',
      'neuter': 'n.',
      'plural': 'pl.'
    };
    
    // Handle compound genders like "masculine/neuter"
    if (gender.includes('/')) {
      return gender.split('/').map(g => abbreviations[g.trim()] || g).join('/');
    }
    
    return abbreviations[gender] || gender;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white hover:underline">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Top 1000 words</h1>
        </div>
      </header>
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <span className="text-5xl">{language.emoji}</span>
            <span>{language.name}</span>
          </h2>
          
          {/* TTS availability notice */}
          {!ttsAvailable && ttsError && (
            <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
              <p className="font-semibold">⚠️ Text-to-Speech Not Available</p>
              <p className="text-sm mt-1">{ttsError}</p>
              <p className="text-sm mt-2">
                <strong>Supported browsers:</strong> Chrome, Edge, Safari (desktop & mobile), Firefox (desktop)
              </p>
              <p className="text-sm mt-1">
                <strong>Not supported:</strong> DuckDuckGo browser, some mobile browsers
              </p>
            </div>
          )}
          
          {/* TTS runtime error notice */}
          {runtimeError && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-semibold">🔴 Text-to-Speech Error</p>
              <p className="text-sm mt-1">{runtimeError}</p>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-lg rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Rank</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Word</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Part of Speech</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Gender</th>
                  <th className="py-3 px-4 text-center font-semibold text-gray-700">Audio</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Translation</th>
                </tr>
              </thead>
              <tbody>
                {words.map((wordData) => (
                  <tr key={wordData.rank} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{wordData.rank}</td>
                    <td className={`py-3 px-4 font-semibold ${getBackgroundColor(wordData.pos)}`}>
                      {wordData.word}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {getPosAbbreviation(wordData.pos)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {getGenderAbbreviation(wordData.gender)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => speakWord(wordData.word, wordData.rank)}
                        className={`text-xl transition-all ${
                          !ttsAvailable 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : speakingRank === wordData.rank
                              ? 'text-green-600 animate-pulse'
                              : 'text-gray-400 hover:text-gray-600'
                        }`}
                        disabled={!ttsAvailable}
                        aria-label={`Play audio pronunciation for ${wordData.word}`}
                        title={!ttsAvailable ? 'Text-to-Speech not available in this browser' : 'Click to hear pronunciation'}
                      >
                        🔊
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {visibleTranslations.has(wordData.rank) ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{wordData.english.join(', ')}</span>
                          <button
                            onClick={() => toggleTranslation(wordData.rank)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Hide translation"
                          >
                            👁️
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleTranslation(wordData.rank)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Show translation"
                        >
                          👁️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-4 px-6 text-center">
        <p>© Anna Kosieradzka</p>
      </footer>
    </div>
  );
}

export default LanguagePage;
