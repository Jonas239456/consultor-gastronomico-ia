"use client";

import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export default function OCRComponent() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [language, setLanguage] = useState<string>('eng');
  const [error, setError] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tamanho da imagem (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem é muito grande! Use uma imagem menor que 5MB.');
        return;
      }

      setError('');
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const recognizeText = async () => {
    if (!image) {
      setError('Por favor, selecione uma imagem primeiro!');
      return;
    }

    setLoading(true);
    setText('');
    setError('');
    setProgress(0);

    try {
      console.log('Iniciando OCR com idioma:', language);
      
      const worker = await createWorker(language, 1, {
        logger: (m) => {
          console.log('Progresso:', m);
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      console.log('Processando imagem...');
      const { data: { text } } = await worker.recognize(image);
      
      console.log('Texto extraído:', text);
      setText(text.trim());
      
      await worker.terminate();
      console.log('OCR finalizado com sucesso!');
      
    } catch (error: any) {
      console.error('Erro no OCR:', error);
      setError(`Erro ao processar imagem: ${error.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setText('');
    setProgress(0);
    setError('');
  };

  const copyToClipboard = () => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => alert('Texto copiado para a área de transferência!'))
        .catch(() => alert('Erro ao copiar texto'));
    }
  };

  const downloadText = () => {
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'texto-extraido.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const languages = [
    { code: 'eng', name: '🇺🇸 Inglês' },
    { code: 'por', name: '🇧🇷 Português' },
    { code: 'spa', name: '🇪🇸 Espanhol' },
    { code: 'fra', name: '🇫🇷 Francês' },
    { code: 'deu', name: '🇩🇪 Alemão' },
    { code: 'ita', name: '🇮🇹 Italiano' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
          <span className="text-3xl">📷</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Extrair Texto de Imagens
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Faça upload de uma imagem e extraia o texto automaticamente
        </p>
      </div>

      {/* Área Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Upload e Configurações */}
        <div className="space-y-6">
          {/* Card: Seletor de Idioma */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <span className="mr-2">🌐</span> Idioma do Texto
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-lg border transition-all ${language === lang.code
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Atualmente selecionado: <strong>{languages.find(l => l.code === language)?.name}</strong>
            </p>
          </div>

          {/* Card: Upload de Imagem */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <span className="mr-2">📤</span> Upload da Imagem
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-colors hover:border-blue-400">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📁</span>
              </div>
              
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <label 
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="text-blue-500 font-medium">Clique para selecionar</span> ou arraste uma imagem
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Suporta JPG, PNG, BMP, WEBP (max 5MB)
                </p>
              </label>
            </div>

            {image && (
              <div className="mt-4">
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                  ✅ Imagem carregada com sucesso!
                </p>
                <button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Trocar imagem
                </button>
              </div>
            )}
          </div>

          {/* Card: Botões de Ação */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="mr-2">⚡</span> Ações
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={recognizeText}
                disabled={!image || loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${!image || loading
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processando... {progress}%
                  </div>
                ) : (
                  '🔍 Extrair Texto'
                )}
              </button>
              
              <button
                onClick={clearAll}
                className="py-3 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                🗑️ Limpar Tudo
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-6">
          {/* Card: Preview da Imagem */}
          {image && (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="mr-2">👁️</span> Preview da Imagem
              </h3>
              <div className="relative">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-auto max-h-72 object-contain rounded-lg border border-gray-300 dark:border-gray-700"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p>Processando... {progress}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card: Resultado do Texto */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <span className="mr-2">📝</span> Texto Extraído
              </h3>
              
              {text && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    title="Copiar texto"
                  >
                    📋
                  </button>
                  <button
                    onClick={downloadText}
                    className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    title="Baixar como arquivo"
                  >
                    💾
                  </button>
                </div>
              )}
            </div>
            
            {error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : text ? (
              <div className="h-72 overflow-y-auto">
                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-sans">
                    {text}
                  </pre>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {text.split(/\s+/).length} palavras • {text.length} caracteres
                </p>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {image 
                    ? 'Clique em "Extrair Texto" para começar'
                    : 'Faça upload de uma imagem para extrair o texto'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dicas */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">💡 Dicas para melhor resultado:</h4>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <span className="mr-2">✅</span> Use imagens com boa iluminação
          </li>
          <li className="flex items-center">
            <span className="mr-2">✅</span> Texto deve estar legível
          </li>
          <li className="flex items-center">
            <span className="mr-2">✅</span> Escolha o idioma correto
          </li>
        </ul>
      </div>
    </div>
  );
}
