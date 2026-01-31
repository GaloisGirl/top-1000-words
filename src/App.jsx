import { Link } from 'react-router-dom';
import { languages } from './config/languages'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold">Top 100 words</h1>
      </header>
      
      <main className="flex-grow flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Select a language
          </h2>
          
          <div className="flex flex-col gap-4 w-full">
            {languages.map((language) => (
              <Link
                key={language.name}
                to={`/language/${language.code}`}
                className="w-full py-4 px-6 text-2xl font-semibold border-4 border-blue-600 rounded-2xl bg-white text-gray-800 hover:bg-blue-50 transition-colors flex items-center justify-center gap-3"
              >
                <span className="text-3xl">{language.emoji}</span>
                <span>{language.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-4 px-6 text-center">
        <p>© Anna Kosieradzka</p>
      </footer>
    </div>
  )
}

export default App
