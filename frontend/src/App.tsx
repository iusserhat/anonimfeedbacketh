import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';
import './index.css';

interface Message {
  id: number;
  content: string;
  timestamp: number;
}

function App() {
  const [feedback, setFeedback] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAppLoaded, setIsAppLoaded] = useState<boolean>(false);

  useEffect(() => {
    const initApp = async () => {
      await checkIfWalletIsConnected();
      setIsAppLoaded(true);
    };

    initApp();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        setErrorMessage('MetaMask yüklü değil. Lütfen MetaMask yükleyin.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletConnected(true);
        loadMessages();
      }
    } catch (error) {
      console.error('Cüzdan bağlantısı kontrol edilirken hata oluştu:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setErrorMessage('MetaMask yüklü değil. Lütfen MetaMask yükleyin.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      loadMessages();
    } catch (error) {
      console.error('Cüzdan bağlanırken hata oluştu:', error);
    }
  };

  const loadMessages = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const fetchedMessages = await contract.getMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata oluştu:', error);
      setErrorMessage('Mesajlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const sendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) return;
    
    try {
      setIsLoading(true);
      
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.sendMessage(feedback);
      await tx.wait();
      
      setFeedback('');
      await loadMessages();
    } catch (error) {
      console.error('Geri bildirim gönderilirken hata oluştu:', error);
      setErrorMessage('Geri bildirim gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="header-title text-xl font-bold">WEB3 Wanderers Anonim Feedback</h1>
            </div>
            <div className="flex items-center">
              {!walletConnected ? (
                <button
                  onClick={connectWallet}
                  className="btn-primary"
                >
                  Cüzdanı Bağla
                </button>
              ) : (
                <span className="text-green-600 font-medium bg-green-50 py-2 px-4 rounded-lg border border-green-200">
                  ✓ Cüzdan Bağlandı
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!isAppLoaded ? (
        <div className="container-center">
          <div className="feedback-form text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4">Uygulama yükleniyor...</p>
          </div>
        </div>
      ) : (
        <main className="container-center">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </p>
            </div>
          )}

          <div className="flex justify-center items-center h-full">
            <div className="w-full">
              {walletConnected ? (
                <>
                  <div className="feedback-form mb-8">
                    <h2 className="text-center mb-6">Geri Bildirim Gönder</h2>
                    <form onSubmit={sendFeedback} className="space-y-6">
                      <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                        <textarea
                          id="feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                          className="mt-1"
                          placeholder="Geri bildiriminizi buraya yazın..."
                        />
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`btn-primary ${isLoading ? 'btn-disabled' : ''}`}
                        >
                          {isLoading ? 'Gönderiliyor...' : 'Gönder'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="card">
                    <h2 className="text-center mb-6">Geri Bildirimler</h2>
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-100">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="mt-2">Henüz geri bildirim bulunmuyor.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {messages.map((message) => (
                          <div key={message.id.toString()} className="border-b border-gray-100 pb-4 hover:bg-gray-50 p-4 rounded-lg transition-colors duration-200">
                            <p className="text-gray-700">{message.content}</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(Number(message.timestamp) * 1000).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="feedback-form text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h2 className="mt-4 mb-6">Anonim Feedback</h2>
                  <p className="text-center text-gray-600 mb-6">Devam etmek için cüzdanınızı bağlayın.</p>
                  <button
                    onClick={connectWallet}
                    className="btn-primary mx-auto"
                  >
                    Cüzdanı Bağla
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
