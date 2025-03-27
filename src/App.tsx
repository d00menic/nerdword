import React, { useState, useCallback, useEffect } from 'react';
import { Volume2, Heart, Home, Trophy, Timer, Skull, CheckCircle, XCircle, Calendar, Sparkles } from 'lucide-react';
import { wordLists, WeekLevel } from './data/words';

interface WordAttempt {
  word: string;
  attempts: string[];
  success: boolean;
  attemptsCount: number;
}

function GameSummary({ 
  wordAttempts, 
  level, 
  score, 
  onPlayAgain, 
  onHome 
}: { 
  wordAttempts: WordAttempt[];
  level: WeekLevel;
  score: number;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const displayLevel = level === 'allWeeks' ? 'All Weeks' : `Week ${level.slice(-1)}`;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xl w-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold text-gray-800">
          {displayLevel} Summary
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500" size={20} />
            <span className="text-sm text-gray-600">{currentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            <span className="text-lg font-semibold">{score}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          {wordAttempts.map((attempt, index) => (
            <div 
              key={index}
              className={`py-2 px-3 rounded-lg ${
                attempt.success && attempt.attemptsCount === 1
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {attempt.success && attempt.attemptsCount === 1 ? (
                    <CheckCircle className="text-green-500" size={18} />
                  ) : (
                    <XCircle className="text-red-500" size={18} />
                  )}
                  <span className="font-medium">{attempt.word}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {attempt.attemptsCount} {attempt.attemptsCount === 1 ? 'try' : 'tries'}
                </span>
              </div>
              
              {attempt.attemptsCount > 1 && (
                <div className="mt-1 space-y-0.5">
                  {attempt.attempts.map((tryAttempt, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-gray-500 text-xs">Try {i + 1}:</span>{' '}
                      {[...tryAttempt].map((char, charIndex) => (
                        <span
                          key={charIndex}
                          className={
                            char !== attempt.word[charIndex]
                              ? 'text-red-500 font-medium'
                              : 'text-gray-700'
                          }
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-lg transition-colors text-lg font-medium"
          >
            Play Again
          </button>
          <button
            onClick={onHome}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-colors text-lg font-medium"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(4);
  const [gameStarted, setGameStarted] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [wordTimeLeft, setWordTimeLeft] = useState(10);
  const [isTimeMode, setIsTimeMode] = useState(false);
  const [isHardMode, setIsHardMode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<WeekLevel | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [wordAttempts, setWordAttempts] = useState<WordAttempt[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [currentWordAttempts, setCurrentWordAttempts] = useState<string[]>([]);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const speakWord = useCallback(() => {
    if (!currentWord) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }, [currentWord]);

  useEffect(() => {
    let timer: number;
    if (gameStarted && isTimeMode && wordTimeLeft > 0) {
      timer = window.setInterval(() => {
        setWordTimeLeft((prev) => {
          if (prev <= 1) {
            setLives((prevLives) => {
              const newLives = prevLives - 1;
              if (newLives <= 0) {
                endGame();
                return 0;
              }
              getNewWord(currentLevel as WeekLevel);
              return newLives;
            });
            return isHardMode ? 5 : 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, isTimeMode, wordTimeLeft, currentLevel, isHardMode]);

  const endGame = () => {
    setShowSummary(true);
    setGameStarted(false);
  };

  const startGame = (level: WeekLevel, timeMode: boolean, hardMode: boolean = false) => {
    setCurrentLevel(level);
    setGameStarted(true);
    setScore(0);
    setLives(4);
    setIsTimeMode(timeMode);
    setIsHardMode(hardMode);
    setWordTimeLeft(hardMode ? 5 : 10);
    setUsedWords([]);
    setFailedAttempts(0);
    setWordAttempts([]);
    setShowSummary(false);
    setCurrentWordAttempts([]);
    getNewWord(level);
  };

  const getNewWord = (level: WeekLevel) => {
    if (!level) return;
    
    window.speechSynthesis.cancel();
    
    const words = wordLists[level];
    const availableWords = words.filter(word => !usedWords.includes(word));
    
    if (availableWords.length === 0) {
      endGame();
      return;
    }
    
    const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    setCurrentWord(newWord);
    setUserInput('');
    setFailedAttempts(0);
    setUsedWords(prev => [...prev, newWord]);
    setWordTimeLeft(isHardMode ? 5 : 10);
    setCurrentWordAttempts([]);
    
    const utterance = new SpeechSynthesisUtterance(newWord);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (value.length <= currentWord.length) {
      setUserInput(value);
    }
  };

  const focusInput = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };

  const isVowel = (char: string): boolean => {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLevel) return;
    
    const isCorrect = userInput.toLowerCase() === currentWord.toLowerCase();
    const newAttempts = [...currentWordAttempts, userInput];
    
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('highScore', newScore.toString());
      }
      
      setWordAttempts(prev => [...prev, {
        word: currentWord,
        attempts: newAttempts,
        success: true,
        attemptsCount: newAttempts.length
      }]);
      
      getNewWord(currentLevel);
    } else {
      setCurrentWordAttempts(newAttempts);
      setLives(lives - 1);
      setFailedAttempts(prev => prev + 1);
      setUserInput('');
      
      if (lives <= 1) {
        setWordAttempts(prev => [...prev, {
          word: currentWord,
          attempts: newAttempts,
          success: false,
          attemptsCount: newAttempts.length
        }]);
        endGame();
      }
    }
  };

  if (showSummary && currentLevel) {
    return (
      <div className="min-h-screen animate-gradient flex items-center justify-center p-4">
        <GameSummary
          wordAttempts={wordAttempts}
          level={currentLevel}
          score={score}
          onPlayAgain={() => startGame(currentLevel, isTimeMode, isHardMode)}
          onHome={() => setShowSummary(false)}
        />
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen animate-gradient flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Spell-a-thon
            </h1>
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} />
              <span className="text-lg font-semibold">{highScore}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => startGame('allWeeks', false)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg transition-colors text-lg font-medium flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                All Weeks
              </button>
              <button
                onClick={() => startGame('allWeeks', true, false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-lg transition-colors"
                aria-label="Time challenge for All Weeks"
                title="10 seconds per word"
              >
                <Timer size={24} />
              </button>
              <button
                onClick={() => startGame('allWeeks', true, true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white p-3 rounded-lg transition-colors"
                aria-label="Hard mode for All Weeks"
                title="5 seconds per word"
              >
                <Skull size={24} />
              </button>
            </div>

            {(['week4', 'week3', 'week2', 'week1'] as WeekLevel[]).map((level) => (
              <div key={level} className="flex gap-2">
                <button
                  onClick={() => startGame(level, false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors text-lg font-medium"
                >
                  Week {level.slice(-1)}
                </button>
                <button
                  onClick={() => startGame(level, true, false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
                  aria-label={`Time challenge for Week ${level.slice(-1)}`}
                  title="10 seconds per word"
                >
                  <Timer size={24} />
                </button>
                <button
                  onClick={() => startGame(level, true, true)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors"
                  aria-label={`Hard mode for Week ${level.slice(-1)}`}
                  title="5 seconds per word"
                >
                  <Skull size={24} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-gradient flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGameStarted(false)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              <span className="font-semibold">{score}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isTimeMode ? (
              <div className="flex items-center gap-2">
                {isHardMode ? (
                  <Skull className="text-red-500" size={20} />
                ) : (
                  <Timer className="text-blue-500" size={20} />
                )}
                <span className={`font-medium ${wordTimeLeft <= 3 ? 'text-red-500' : isHardMode ? 'text-red-500' : 'text-blue-500'}`}>
                  {wordTimeLeft}s
                </span>
              </div>
            ) : (
              [...Array(lives)].map((_, i) => (
                <Heart
                  key={i}
                  size={24}
                  className="text-red-500 fill-current"
                />
              ))
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-2">
            Word {usedWords.length} of {currentLevel ? wordLists[currentLevel].length : 0}
          </div>
          <button
            onClick={speakWord}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 transition-colors"
            aria-label="Speak word"
          >
            <Volume2 size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div 
            onClick={focusInput}
            className="grid grid-cols-10 gap-1 cursor-text"
          >
            {currentWord.split('').map((letter, index) => {
              const showVowel = failedAttempts >= 2 && isVowel(letter);
              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center border-2 text-lg font-medium
                    ${userInput[index] ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    rounded transition-colors`}
                >
                  {userInput[index] || (showVowel ? (
                    <span className="text-gray-400">{letter}</span>
                  ) : '')}
                </div>
              );
            })}
          </div>

          <input
            ref={setInputRef}
            type="text"
            value={userInput}
            onChange={handleInput}
            className="sr-only"
            autoFocus
          />
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Click anywhere in the boxes to start typing
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;