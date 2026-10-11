import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const { verifyEmail } = useContext(AuthContext);

    useEffect(() => {
        const verify = async () => {
            try {
                const data = await verifyEmail(token);
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Failed to verify email. The link may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        } else {
            setStatus('error');
            setMessage('No verification token provided.');
        }
    }, [token, verifyEmail]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-4">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900">Verifying Email...</h2>
                        <p className="text-sm text-gray-500 mt-2">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center py-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-extrabold text-gray-900">Email Verified!</h2>
                        <p className="text-md text-gray-600 mt-2">{message}</p>
                        <Link 
                            to="/login" 
                            className="mt-6 inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                            Continue to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-4">
                        <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-extrabold text-gray-900">Verification Failed</h2>
                        <p className="text-md text-gray-600 mt-2">{message}</p>
                        <Link 
                            to="/login" 
                            className="mt-6 inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyEmailPage;
