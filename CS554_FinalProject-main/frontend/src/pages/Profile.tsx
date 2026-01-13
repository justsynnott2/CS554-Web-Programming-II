import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Navbar from '../components/Navbar';
import { inchesToFeetInches, feetInchesToInches, formatHeight } from '../utils/heightConverter';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${month} ${day}, ${year} (${hours}:${minutesStr} ${ampm})`;
};

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreviewUrl, setPicturePreviewUrl] = useState<string | null>(null);
  const [profilePicNonce, setProfilePicNonce] = useState<number>(() => Date.now());
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    age: user?.age || '',
    heightFeet: '',
    heightInches: '',
    weight: user?.weight || '',
  });

  useEffect(() => {
    if (user?.height) {
      const { feet, inches } = inchesToFeetInches(user.height);
      setFormData(prev => ({
        ...prev,
        heightFeet: feet.toString(),
        heightInches: inches.toString(),
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!pictureFile) {
      setPicturePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(pictureFile);
    setPicturePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pictureFile]);

  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePicNonce(Date.now());
      setAvatarLoadError(false);
    }
  }, [user?.profilePicture]);

  const getAvatarSrc = (): string | null => {
    if (picturePreviewUrl) return picturePreviewUrl;
    if (!user?.profilePicture) return null;
    const sep = user.profilePicture.includes('?') ? '&' : '?';
    return `${user.profilePicture}${sep}v=${profilePicNonce}`;
  };

  const getInitials = (): string => {
    const first = (user?.firstName || '').trim();
    const last = (user?.lastName || '').trim();
    const fi = first ? first[0].toUpperCase() : '';
    const li = last ? last[0].toUpperCase() : '';
    const initials = `${fi}${li}`.trim();
    return initials || 'U';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' 
        ? (value === '' ? '' : Number(value)) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors([]);
    setSuccess(null);

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? Number(formData.age) : undefined,
        height: (formData.heightFeet && formData.heightInches) 
          ? feetInchesToInches(Number(formData.heightFeet), Number(formData.heightInches))
          : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
      };

      const response = await userService.updateProfile(updateData);
      
      if (response.success && response.data) {
        updateUser(response.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const formattedErrors = errorData.errors.map((err: string) => {
            const colonIndex = err.indexOf(':');
            return colonIndex > 0 ? err.substring(colonIndex + 1).trim() : err;
          });
          setErrors(formattedErrors);
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError('An error occurred while updating your profile');
        }
      } else {
        setError(err.message || 'An error occurred while updating your profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user?.height) {
      const { feet, inches } = inchesToFeetInches(user.height);
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        age: user?.age || '',
        heightFeet: feet.toString(),
        heightInches: inches.toString(),
        weight: user?.weight || '',
      });
    } else {
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        age: user?.age || '',
        heightFeet: '',
        heightInches: '',
        weight: user?.weight || '',
      });
    }
    setIsEditing(false);
    setError(null);
    setErrors([]);
    setSuccess(null);
    setPictureFile(null);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;
  setPictureFile(file);
};

const handleUploadProfilePicture = async () => {
  setError(null);
  setErrors([]);
  setSuccess(null);

  if (!pictureFile) {
    setError('Please select a profile picture to upload');
    return;
  }

  try {
    setUploading(true);
    const response = await userService.uploadProfilePicture(pictureFile);
    if (response.success && response.data) {
      updateUser(response.data);
      setSuccess('Profile picture updated successfully!');
      setPictureFile(null);
    } else {
      setError(response.message || 'Failed to update profile picture');
    }
  } catch (err: any) {
    if (err.response?.data) {
      const errorData = err.response.data;
      if (err.response?.status === 404 && errorData?.message === 'User not found') {
        setError('Your session is out of sync with the server (user not found). Please log out and log back in.');
        return;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const formattedErrors = errorData.errors.map((err: string) => {
          const colonIndex = err.indexOf(':');
          return colonIndex > 0 ? err.substring(colonIndex + 1).trim() : err;
        });
        setErrors(formattedErrors);
      } else if (errorData.message) {
        setError(errorData.message);
      } else {
        setError('An error occurred while updating your profile picture');
      }
    } else {
      setError(err.message || 'An error occurred while updating your profile picture');
    }
  } finally {
    setUploading(false);
  }
};

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar isAuthenticated={true} onLogout={handleLogout} />
      <div className="p-5 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, index) => (
                  <li key={index} className="text-sm text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          {getAvatarSrc() && !avatarLoadError ? (
            <img
              src={getAvatarSrc() as string}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              onError={() => setAvatarLoadError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-700 font-semibold text-xl">
              {getInitials()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            {isEditing && picturePreviewUrl && (
              <p className="text-xs text-gray-500 mt-1">Previewing new profile picture (not saved yet)</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="150"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.age === '' && (
                  <p className="mt-1 text-xs text-gray-500">
                    {user.age ? 'Leaving this blank will keep your current age unchanged.' : 'Leaving this blank will keep your age unset.'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      id="heightFeet"
                      name="heightFeet"
                      value={formData.heightFeet}
                      onChange={handleInputChange}
                      min="2"
                      max="8"
                      placeholder="Feet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      id="heightInches"
                      name="heightInches"
                      value={formData.heightInches}
                      onChange={handleInputChange}
                      min="0"
                      max="11"
                      placeholder="Inches"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {(formData.heightFeet === '' || formData.heightInches === '') && (
                  <p className="mt-1 text-xs text-gray-500">
                    {user.height
                      ? 'Enter both feet and inches to update. Leaving this blank will keep your current height unchanged.'
                      : 'Enter both feet and inches to set your height. Leaving this blank will keep your height unset.'}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="44"
                  max="1100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.weight === '' && (
                  <p className="mt-1 text-xs text-gray-500">
                    {user.weight ? 'Leaving this blank will keep your current weight unchanged.' : 'Leaving this blank will keep your weight unset.'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="text-sm"
                />
                <button
                  type="button"
                  onClick={handleUploadProfilePicture}
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading || uploading}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                <p className="text-lg text-gray-900">
                  {user.firstName || 'Not set'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                <p className="text-lg text-gray-900">
                  {user.lastName || 'Not set'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p className="text-lg text-gray-900">{user.email || 'Not set'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Age</p>
                <p className="text-lg text-gray-900">
                  {user.age ? `${user.age} years` : 'Not set'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Height</p>
                <p className="text-lg text-gray-900">
                  {formatHeight(user.height)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Weight</p>
                <p className="text-lg text-gray-900">
                  {user.weight ? `${user.weight} lbs` : 'Not set'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Account Created On:</p>
              <p className="text-lg text-gray-900">
                {user.createdAt 
                  ? formatDate(user.createdAt) 
                  : 'Not set'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Profile;

