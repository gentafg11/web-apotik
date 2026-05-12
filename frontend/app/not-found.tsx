export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page not found</p>
      <a href="/login" className="mt-4 text-indigo-600 hover:underline">
        Go to Login
      </a>
    </div>
  );
}