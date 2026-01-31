import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { languages } from './config/languages';

function LanguagePage() {
  const { languageCode } = useParams();
  const language = languages.find(lang => lang.code === languageCode);
  
  // State to track which translations are visible
  const [visibleTranslations, setVisibleTranslations] = useState(new Set());
  
  // Import the language data dynamically
  const [words, setWords] = useState([]);
  
  // Load language data
  useEffect(() => {
    import(`./config/${languageCode}.json`)
      .then(module => setWords(module.default.slice(0, 100)))
      .catch(err => console.error('Error loading language data:', err));
  }, [languageCode]);
  
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
  
  const speakWord = (word) => {
    // Check if Web Speech API is available
    if (!window.speechSynthesis) {
      console.warn('Text-to-Speech is not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Set the language for the utterance
    utterance.lang = localeMap[languageCode] || languageCode;
    
    // Speak the word
    window.speechSynthesis.speak(utterance);
  };
  
  const getBackgroundColor = (pos) => {
    if (pos.includes('noun')) return 'bg-yellow-100';
    if (pos.includes('verb')) return 'bg-green-100';
    if (pos.includes('adjective')) return 'bg-blue-100';
    if (pos.includes('adverb')) return 'bg-red-100';
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
                        onClick={() => speakWord(wordData.word)}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                        aria-label={`Play audio pronunciation for ${wordData.word}`}
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
