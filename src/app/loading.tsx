export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="text-center">
        <p className="text-2xl font-semibold text-indigo-600 font-roboto">読み込み中...</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
