import OCRComponent from './components/OCRComponent';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <OCRComponent />
      </div>
    </div>
  );
}
