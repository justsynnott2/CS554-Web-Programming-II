import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';
import { feetInchesToInches } from '../utils/heightConverter';
import './Auth.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        age: undefined,
        height: undefined,
        weight: undefined
    });
    const [heightFeet, setHeightFeet] = useState<string>('');
    const [heightInches, setHeightInches] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {register} = useAuth();
    const navigate = useNavigate();

    const isStrongPassword = (password: string): boolean => {
        const pw = password.trim();
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{16,}$/.test(pw);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'age' || name === 'height' || name === 'weight' ? value ? parseFloat(value): undefined : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!isStrongPassword(formData.password)) {
            setError('Password must be at least 16 characters long and include uppercase, lowercase, number, and symbol');
            return;
        }

        if (formData.password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        try {
            const registrationData: RegisterData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            };
            if (formData.age !== undefined && formData.age !== null && !isNaN(formData.age) && formData.age > 0) {
                registrationData.age = formData.age;
            }
            if (heightFeet && heightInches) {
                const feet = parseFloat(heightFeet);
                const inches = parseFloat(heightInches);
                if (!isNaN(feet) && !isNaN(inches) && feet >= 2 && feet <= 8 && inches >= 0 && inches < 12) {
                    registrationData.height = feetInchesToInches(feet, inches);
                }
            }
            if (formData.weight !== undefined && formData.weight !== null && !isNaN(formData.weight) && formData.weight > 0) {
                registrationData.weight = formData.weight;
            }
            await register(registrationData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration Failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (
        <div className='auth-container'>
            <h1 className="auth-page-title">Fitness and Calorie Tracker</h1>
            <div className='auth-split'>
                <div className='auth-image-side'>
                    <div className='auth-overlay'>
                        <img src="/logo_app.png" alt="Fitness and Calorie Tracker" className='auth-logo' />
                        <h1 className='auth-tagline'>Start Your Fitness<br />Journey Today</h1>
                    </div>
                </div>
                <div className='auth-form-side'>
                    <div className='auth-form-container'>
                        <h2 className='auth-title'>Create Your Account Today!</h2>
                        <p className='auth-subtitle'>Already have an account? <Link to="/login" className='auth-link'>Login</Link></p>
                        {error && (<div className='auth-error'>{error}</div>)}
                        <form onSubmit={handleSubmit} className='auth-form'>
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label htmlFor="firstName">First Name <span className="required-asterisk">*</span></label>
                                    <input id='firstName' type="text" name='firstName' value={formData.firstName} onChange={handleChange} placeholder='Enter your first name' required className='form-input' />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor="lastName">Last Name <span className="required-asterisk">*</span></label>
                                    <input id='lastName' type="text" name='lastName' value={formData.lastName} onChange={handleChange} placeholder='Enter your last name' required className='form-input' />
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor="email">Email <span className="required-asterisk">*</span></label>
                                <input id='email' type="email" name='email' value={formData.email} onChange={handleChange} placeholder='Enter your email' required className='form-input' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor="password">Password <span className="required-asterisk">*</span></label>
                                <div className='password-input-wrapper'>
                                    <input id='password' type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={handleChange} placeholder='Enter your password' required className='form-input' />
                                    <button type='button' className='password-toggle' onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor="confirmPassword">Confirm Password <span className="required-asterisk">*</span></label>
                                <div className='password-input-wrapper'>
                                    <input id='confirmPassword' type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='Confirm your password' required className='form-input' />
                                    <button type='button' className='password-toggle' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</button>
                                </div>
                            </div>
                            <div className='form-row form-row-three'>
                                <div className='form-group'>
                                    <label htmlFor="age">Age</label>
                                    <input id='age' type="number" name='age' value={formData.age || ''} onChange={handleChange} placeholder='Enter your age (optional)' className='form-input' />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor="height">Height</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            id='heightFeet' 
                                            type="number" 
                                            value={heightFeet} 
                                            onChange={(e) => setHeightFeet(e.target.value)} 
                                            placeholder='Feet' 
                                            min="2"
                                            max="8"
                                            className='form-input' 
                                            style={{ flex: 1 }}
                                        />
                                        <input 
                                            id='heightInches' 
                                            type="number" 
                                            value={heightInches} 
                                            onChange={(e) => setHeightInches(e.target.value)} 
                                            placeholder='Inches' 
                                            min="0"
                                            max="11"
                                            className='form-input' 
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label htmlFor="weight">Weight</label>
                                    <input id='weight' type="number" name='weight' min="44" max="1100" step="0.1" value={formData.weight || ''} onChange={handleChange} placeholder='Enter your weight (optional) in lbs' className='form-input' />
                                </div>
                            </div>
                            <button type='submit' disabled={loading} className='auth-button'>{loading ? 'Registering...' : 'Register'}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;