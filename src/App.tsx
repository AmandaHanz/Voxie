import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  Download, 
  Mic, 
  Settings, 
  RefreshCw,
  Music,
  Sparkles,
  History,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';

// Voice type definition
interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

// Sample texts for quick testing
const SAMPLE_TEXTS = [
  "The sun sets beautifully over the horizon.",
  "A good book can take you to another world.",
  "The sound of rain is calming and peaceful.",
  "The ocean waves crash gently on the shore.",
  "A smile can brighten anyone's day."
];

function App() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [savedTexts, setSavedTexts] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        // In a real implementation, this would fetch from the Ballerina API
        // For demo purposes, we'll use a simulated response
        const simulatedVoices = [
          { id: 'en-US-1', name: 'Emma (US)', language: 'English (US)', gender: 'Female' },
          { id: 'en-US-2', name: 'Michael (US)', language: 'English (US)', gender: 'Male' },
          { id: 'en-GB-1', name: 'Olivia (UK)', language: 'English (UK)', gender: 'Female' },
          { id: 'en-GB-2', name: 'James (UK)', language: 'English (UK)', gender: 'Male' },
          { id: 'fr-FR-1', name: 'Sophie (FR)', language: 'French', gender: 'Female' },
          { id: 'es-ES-1', name: 'Isabella (ES)', language: 'Spanish', gender: 'Female' },
        ];
        
        
        setVoices(simulatedVoices);
        setSelectedVoice(simulatedVoices[0].id);
        
        // Check API health
        checkApiHealth();
      } catch (err) {
        console.error('Failed to fetch voices:', err);
        setError('Failed to load voices. Please try again later.');
        setApiStatus('error');
      }
    };
    
    fetchVoices();
    
    // Load saved items from localStorage
    const savedItems = localStorage.getItem('savedTexts');
    if (savedItems) {
      setSavedTexts(JSON.parse(savedItems));
    }
    
    const historyItems = localStorage.getItem('textHistory');
    if (historyItems) {
      setHistory(JSON.parse(historyItems));
    }
  }, []);
 
  const checkApiHealth = async () => {
    try {
      
      setTimeout(() => {
        setApiStatus('connected');
      }, 1000);
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus('error');
    }
  };

  // Save to localStorage when history or saved texts change
  useEffect(() => {
    localStorage.setItem('textHistory', JSON.stringify(history));
  }, [history]);
  
  useEffect(() => {
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
  }, [savedTexts]);

  // Generate speech from text
  const generateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Add to history if not already there
    if (!history.includes(text)) {
      setHistory(prev => [text, ...prev].slice(0, 10));
    }
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fakeAudioUrl = `data:audio/mp3;base64,${btoa(text + selectedVoice + Date.now())}`;
      setAudioUrl(fakeAudioUrl);
      
      // Set duration based on text length (simulated)
      const estimatedDuration = text.length * 0.05;
      setDuration(estimatedDuration);
      
      setIsLoading(false);
      setIsPlaying(true);
      
      // In a real implementation, we would set the audio source to the API response
      // For now, we'll use the browser's speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = pitch;
      utterance.volume = volume / 100;
      
      // Set up event handlers for the utterance
      utterance.onstart = () => {
        setIsPlaying(true);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      };
      
      utterance.onpause = () => {
        setIsPlaying(false);
      };
      
      utterance.onresume = () => {
        setIsPlaying(true);
      };
      
      // Start the speech synthesis
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
      
      // Simulate progress updates
      let progressInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          setCurrentTime(prev => {
            const newTime = prev + 0.1;
            setProgress((newTime / estimatedDuration) * 100);
            return newTime;
          });
        } else {
          clearInterval(progressInterval);
        }
      }, 100);
      
    } catch (err) {
      console.error('Speech generation failed:', err);
      setError('Failed to generate speech. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle play/pause
  const togglePlayback = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else if (text) {
        generateSpeech();
      }
    }
  };

  // Handle stop
  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle progress bar change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  // Use a sample text
  const useSampleText = (sample: string) => {
    setText(sample);
  };
  
  // Save current text
  const saveCurrentText = () => {
    if (text && !savedTexts.includes(text)) {
      setSavedTexts(prev => [text, ...prev]);
    }
  };
  
  // Use a saved or history text
  const useText = (savedText: string) => {
    setText(savedText);
    setShowHistory(false);
    setShowSaved(false);
  };
  
  // Remove a saved text
  const removeSavedText = (textToRemove: string) => {
    setSavedTexts(prev => prev.filter(t => t !== textToRemove));
  };
  
  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="w-full max-w-4xl overflow-hidden bg-white shadow-xl rounded-xl">
        {/* Header */}
        <div className="p-6 text-white bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="w-8 h-8" />
              <h1 className="text-2xl font-bold">VOXIE</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
                apiStatus === 'connected' 
                  ? 'bg-green-500/20 text-green-100' 
                  : apiStatus === 'connecting' 
                    ? 'bg-yellow-500/20 text-yellow-100' 
                    : 'bg-red-500/20 text-red-100'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus === 'connected' 
                    ? 'bg-green-400' 
                    : apiStatus === 'connecting' 
                      ? 'bg-yellow-400' 
                      : 'bg-red-400'
                }`}></span>
                {apiStatus === 'connected' 
                  ? 'API Connected' 
                  : apiStatus === 'connecting' 
                    ? 'Connecting...' 
                    : 'API Error'}
              </div>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 transition-colors rounded-full hover:bg-white/10"
                aria-label="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="mt-2 opacity-80">Your Voice Partner in Speech</p>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-start p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {/* Text Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">
                Enter your text
              </label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center px-2 py-1 space-x-1 text-xs text-gray-600 transition-colors hover:text-indigo-600"
                  aria-label="History"
                >
                  <History className="w-3 h-3" />
                  <span>History</span>
                </button>
                <button 
                  onClick={() => setShowSaved(!showSaved)}
                  className="flex items-center px-2 py-1 space-x-1 text-xs text-gray-600 transition-colors hover:text-indigo-600"
                  aria-label="Saved"
                >
                  <Save className="w-3 h-3" />
                  <span>Saved</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste text here..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute flex items-center space-x-2 bottom-2 right-2">
                <button
                  onClick={saveCurrentText}
                  disabled={!text.trim() || savedTexts.includes(text)}
                  className={`text-xs px-2 py-1 rounded ${
                    !text.trim() || savedTexts.includes(text)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  } transition-colors`}
                  aria-label="Save text"
                >
                  Save
                </button>
                <span className="text-xs text-gray-500">{text.length} characters</span>
              </div>
            </div>
            
            {/* History Dropdown */}
            {showHistory && (
              <div className="p-3 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Recent History</h3>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="flex items-center text-xs text-red-500 transition-colors hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <p className="text-xs italic text-gray-500">No history yet</p>
                ) : (
                  <div className="overflow-y-auto max-h-40">
                    {history.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 text-sm rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => useText(item)}
                      >
                        <span className="flex-1 truncate">{item}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            useText(item);
                          }}
                          className="ml-2 text-xs text-indigo-500 hover:text-indigo-700"
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Saved Texts Dropdown */}
            {showSaved && (
              <div className="p-3 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="mb-2 text-sm font-medium text-gray-700">Saved Texts</h3>
                {savedTexts.length === 0 ? (
                  <p className="text-xs italic text-gray-500">No saved texts yet</p>
                ) : (
                  <div className="overflow-y-auto max-h-40">
                    {savedTexts.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 text-sm rounded cursor-pointer hover:bg-gray-50"
                      >
                        <span className="flex-1 truncate">{item}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => useText(item)}
                            className="text-xs text-indigo-500 hover:text-indigo-700"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => removeSavedText(item)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sample Texts */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Sample Texts</h3>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => useSampleText(sample)}
                  className="px-3 py-1 text-xs text-indigo-700 transition-colors bg-indigo-100 rounded-full hover:bg-indigo-200"
                >
                  Sample {index + 1}
                </button>
              ))}
            </div>
          </div>
          
          {/* Voice Selection */}
          <div className="mb-6">
            <label htmlFor="voice-select" className="block mb-2 text-sm font-medium text-gray-700">
              Select Voice
            </label>
            <div className="relative">
              <select
                id="voice-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="block w-full py-2 pl-3 pr-10 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.language} ({v.gender})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Mic className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Settings Panel (Conditional) */}
          {showSettings && (
            <div className="p-4 mb-6 rounded-lg bg-gray-50">
              <h3 className="mb-3 text-sm font-medium text-gray-700">Advanced Settings</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Speed Control */}
                <div>
                  <label htmlFor="speed-control" className="block mb-1 text-xs font-medium text-gray-500">
                    Speed: {speed.toFixed(1)}x
                  </label>
                  <input
                    id="speed-control"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                
                {/* Pitch Control */}
                <div>
                  <label htmlFor="pitch-control" className="block mb-1 text-xs font-medium text-gray-500">
                    Pitch: {pitch.toFixed(1)}
                  </label>
                  <input
                    id="pitch-control"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                
                {/* Volume Control */}
                <div>
                  <label htmlFor="volume-control" className="block mb-1 text-xs font-medium text-gray-500">
                    Volume: {volume}%
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="text-gray-500 transition-colors hover:text-indigo-600"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      id="volume-control"
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
                
                {/* API Information */}
                <div className="col-span-1 pt-2 mt-2 border-t border-gray-200 md:col-span-2">
                  <h4 className="mb-1 text-xs font-medium text-gray-500">API Information</h4>
                  <div className="text-xs text-gray-600">
                    <p>Powered by Ballerina TTS API</p>
                    <p className="mt-1">Status: {apiStatus === 'connected' ? 'Connected' : apiStatus === 'connecting' ? 'Connecting...' : 'Error'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Audio Player Controls */}
          <div className="p-4 rounded-lg bg-gray-50">
            {/* Progress Bar */}
            <div className="flex items-center mb-2 space-x-2">
              <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <span className="text-xs text-gray-500">{formatTime(duration)}</span>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={stopPlayback}
                  className="p-2 text-gray-600 transition-colors hover:text-indigo-600"
                  aria-label="Stop"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button
                  onClick={togglePlayback}
                  disabled={!text.trim() && !isPlaying}
                  className={`p-3 rounded-full ${
                    isPlaying 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  } ${(!text.trim() && !isPlaying) ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 transition-colors hover:text-indigo-600"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={generateSpeech}
                  disabled={!text.trim() || isLoading}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    !text.trim() || isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } transition-colors`}
                  aria-label="Generate Speech"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Speech</span>
                    </>
                  )}
                </button>
                
                {audioUrl && (
                  <a
                    href={audioUrl}
                    download={`tts-${Date.now()}.mp3`}
                    className="p-2 text-gray-600 transition-colors hover:text-indigo-600"
                    aria-label="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Audio Element (hidden) */}
          <audio ref={audioRef} src={audioUrl} />
          
          {/* Footer */}
          <div className="pt-4 mt-6 text-center border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Powered by VOXIE | © 2025 Amanda Hansamali
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;