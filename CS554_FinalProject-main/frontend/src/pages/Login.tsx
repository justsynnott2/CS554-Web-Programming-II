import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (loading) {
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            await login({email, password});
            setError('');
            navigate('/dashboard');
        } catch (err: any) {
            let errorMessage = 'Login Failed';
            if (err?.message) {
                errorMessage = err.message;
            } else if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                errorMessage = err.response.data.errors.join(', ');
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };
    return (
        <div className="auth-container">
            <h1 className="auth-page-title">Fitness and Calorie Tracker</h1>
            <div className='auth-split'>
                <div className='auth-image-side'>
                    <div className='auth-overlay'>
                        <img src="/logo_app.png" alt="Fitness and Calorie Tracker" className='auth-logo' />
                        <h1 className='auth-tagline'>Track your Progress, <br />Achieve Your Goals</h1>
                    </div>
                </div>
                <div className='auth-form-side'>
                    <div className='auth-form-container'>
                        <h2 className='auth-title'>Welcome Back!</h2>
                        <p className='auth-subtitle'>Don't have an account? <Link to="/register" className='auth-link'>Sign up</Link></p>
                        {error && (
                            <div 
                                key={error} 
                                className='auth-error'
                                style={{ display: 'block', visibility: 'visible' }}
                            >
                                {error}
                            </div>
                        )}
                        <form ref={formRef} onSubmit={handleSubmit} className='auth-form' noValidate>
                            <div className='form-group'>
                                <label htmlFor="email">Email <span className="required-asterisk">*</span></label>
                                <input id='email' type='email' value={email} onChange={handleEmailChange} placeholder='Enter your email' required className='form-input' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor="password">Password <span className="required-asterisk">*</span></label>
                                <div className='password-input-wrapper'>
                                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={handlePasswordChange} placeholder='Enter your password' required className='form-input' />
                                <button type='button' className='password-toggle' onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
                                </div>
                            </div>
                            <button 
                                type='submit' 
                                disabled={loading} 
                                className='auth-button'
                                onClick={(e) => {
                                    if (loading) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;