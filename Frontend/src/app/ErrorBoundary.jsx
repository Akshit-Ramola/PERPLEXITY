import React from 'react';
import { useRouteError, Link } from 'react-router';

export default function ErrorBoundary() {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
            <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-red-900/30 rounded-2xl p-8 shadow-2xl shadow-red-900/20 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-4">Oops!</h1>
                <p className="text-gray-400 mb-6">Sorry, an unexpected error has occurred.</p>
                <div className="mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-left overflow-auto max-h-48">
                    <p className="text-red-400 font-mono text-sm">
                        {error.statusText || error.message}
                    </p>
                </div>
                <Link
                    to="/"
                    className="inline-flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 transition-all transform hover:scale-[1.02]"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}
