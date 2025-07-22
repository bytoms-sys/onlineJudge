import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="space-y-20">
      {/* Hero Section - Enhanced */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl mx-4 sm:mx-8 lg:mx-auto max-w-7xl">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 px-6 py-16 sm:px-10 sm:py-24 lg:py-32 flex flex-col lg:flex-row justify-between items-center">
          <div className="lg:max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              <span className="block">Improve your</span>
              <span className="block mt-2 text-indigo-200">coding skills</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-100 max-w-lg mx-auto lg:mx-0">
              Practice with coding challenges, compete with others, and enhance your problem-solving abilities.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to={isAuthenticated ? "/problems" : "/login"}
                className="rounded-md bg-white px-8 py-4 text-lg font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white/75 transition-all"
              >
                {isAuthenticated ? "Solve Problems" : "Get Started"}
              </Link>
              <Link
                to="/leaderboard"
                className="rounded-md bg-indigo-700/30 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white border border-indigo-400/30 hover:bg-indigo-700/40 focus:outline-none focus:ring-2 focus:ring-white/75 transition-all"
              >
                Leaderboard
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative mt-10 lg:mt-0">
            <div className="w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-xl">
              <div className="w-56 h-56 bg-white/5 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-20 h-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced */}
      <div className="py-16 px-4 sm:px-6 lg:py-24 lg:px-8 bg-white rounded-xl shadow-lg mx-4 sm:mx-8 lg:mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="inline-block px-4 py-1 text-sm font-semibold bg-indigo-100 text-indigo-700 rounded-full mb-3">Features</h2>
          <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Everything you need to improve
          </p>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Our platform provides the tools you need to become a better programmer.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Coding Challenges</h3>
            <p className="text-gray-600">
              Hundreds of problems to solve, ranging from easy to hard to improve your skills.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Testing</h3>
            <p className="text-gray-600">
              Submit your code and get instant feedback on your solution's correctness and efficiency.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Leaderboard</h3>
            <p className="text-gray-600">
              Compare your progress with other programmers and track your improvement over time.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl mx-4 sm:mx-8 lg:mx-auto max-w-7xl overflow-hidden">
        <div className="relative px-6 py-16 sm:px-10 sm:py-24 lg:py-32 text-center">
          <div className="absolute inset-0 bg-indigo-800/20 mix-blend-multiply"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start coding?
            </h2>
            <p className="mt-6 mx-auto max-w-lg text-xl text-indigo-100">
              Join thousands of developers improving their skills daily.
            </p>
            <div className="mt-10">
              <Link
                to={isAuthenticated ? "/problems" : "/register"}
                className="rounded-md bg-white px-8 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
              >
                {isAuthenticated ? "Browse Problems" : "Create Free Account"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;