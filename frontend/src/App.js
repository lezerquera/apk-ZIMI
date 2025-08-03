import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Authentication Context
const AuthContext = React.createContext();

// Auth Components
const LoginPage = ({ setCurrentPage, setUser, setIsAuthenticated }) => {
  const [loginType, setLoginType] = useState('patient'); // 'patient' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginType === 'patient') {
        const response = await axios.post(`${API}/auth/login`, {}, {
          params: {
            email: formData.email,
            phone: formData.phone
          }
        });
        
        setUser({
          id: response.data.patient_id,
          name: response.data.patient_name,
          email: response.data.patient_email,
          role: 'patient'
        });
        setIsAuthenticated(true);
        setCurrentPage('inicio');
      } else {
        const response = await axios.post(`${API}/auth/admin/login`, {}, {
          params: {
            email: formData.email,
            password: formData.password
          }
        });
        
        setUser({
          email: formData.email,
          role: 'admin',
          access_token: response.data.access_token
        });
        setIsAuthenticated(true);
        setCurrentPage('admin');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png" 
            alt="ZIMI Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h1>
        </div>

        {/* Login Type Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType('patient')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginType === 'patient'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👤 Paciente
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginType === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚙️ Administrador
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={loginType === 'admin' ? 'admin@drzerquera.com' : 'tu-email@ejemplo.com'}
            />
          </div>

          {loginType === 'patient' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1-555-0123"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contraseña de administrador"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {loginType === 'patient' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Primera vez aquí?{' '}
              <button
                onClick={() => setCurrentPage('register')}
                className="text-blue-600 hover:underline font-medium"
              >
                Registrarse
              </button>
            </p>
          </div>
        )}

        {loginType === 'admin' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Solo para personal autorizado.</span> 
              <br/>Contacte al administrador si necesita acceso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const RegisterPage = ({ setCurrentPage, setUser, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    numero_seguro: '',
    seguro: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      
      setUser({
        id: response.data.patient_id,
        name: response.data.patient_name,
        email: formData.email,
        role: 'patient'
      });
      setIsAuthenticated(true);
      setCurrentPage('inicio');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <img 
            src="https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png" 
            alt="ZIMI Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Registro de Paciente</h1>
          <p className="text-gray-600">Complete sus datos para crear su cuenta</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seguro Médico
              </label>
              <select
                value={formData.seguro}
                onChange={(e) => setFormData({...formData, seguro: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione su seguro</option>
                <option value="Ambetter">Ambetter</option>
                <option value="Aetna">Aetna</option>
                <option value="Careplus">Careplus</option>
                <option value="Doctor Health">Doctor Health</option>
                <option value="AvMed">AvMed</option>
                <option value="Oscar">Oscar</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dirección completa (opcional)"
            />
          </div>

          {formData.seguro && formData.seguro !== 'Otro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Seguro
              </label>
              <input
                type="text"
                value={formData.numero_seguro}
                onChange={(e) => setFormData({...formData, numero_seguro: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de póliza o identificación"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage('login')}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-semibold"
            >
              ← Volver al Login
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Messaging System Component
const MessagingPage = ({ setCurrentPage, user }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiver_id: '',
    receiver_name: '',
    subject: '',
    message: '',
    message_type: 'general'
  });
  const [patients, setPatients] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
    if (user?.role === 'admin') {
      fetchPatients();
    }
    
    // Refresh messages every 30 seconds
    const interval = setInterval(() => {
      fetchMessages();
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchMessages = async () => {
    try {
      // Use consistent ID for admin and user ID for patients
      const userId = user.role === 'admin' ? 'admin' : user.id;
      const response = await axios.get(`${API}/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // Use consistent ID for admin and user ID for patients
      const userId = user.role === 'admin' ? 'admin' : user.id;
      const response = await axios.get(`${API}/messages/unread/${userId}`);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API}/appointments`);
      const uniquePatients = response.data.reduce((acc, apt) => {
        if (!acc.find(p => p.id === apt.patient_id)) {
          acc.push({
            id: apt.patient_id,
            name: apt.patient_name,
            email: apt.patient_email
          });
        }
        return acc;
      }, []);
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const sendMessage = async () => {
    setLoading(true);
    try {
      // For patients sending to admin, set receiver_id to 'admin'
      const messageToSend = { ...newMessage };
      if (user?.role === 'patient') {
        messageToSend.receiver_id = 'admin';
        messageToSend.receiver_name = 'Dr. Zerquera';
      }

      await axios.post(`${API}/messages`, messageToSend, {
        params: {
          sender_id: user.role === 'admin' ? 'admin' : user.id,
          sender_name: user.role === 'admin' ? 'Dr. Zerquera' : user.name
        }
      });
      
      setNewMessage({
        receiver_id: '',
        receiver_name: '',
        subject: '',
        message: '',
        message_type: 'general'
      });
      setShowCompose(false);
      fetchMessages();
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '✅ Mensaje enviado exitosamente';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Error enviando el mensaje';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
    setLoading(false);
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`${API}/messages/${messageId}/read`);
      fetchMessages();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const replyToMessage = async (messageId, replyText) => {
    try {
      await axios.post(`${API}/messages/${messageId}/reply`, 
        { message: replyText },
        {
          params: {
            sender_id: user.role === 'admin' ? 'admin' : user.id,
            sender_name: user.role === 'admin' ? 'Dr. Zerquera' : user.name
          }
        }
      );
      fetchMessages();
      setSelectedMessage(null);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '✅ Respuesta enviada exitosamente';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    } catch (error) {
      console.error('Error replying to message:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Error enviando la respuesta';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'medical': return '🩺';
      case 'reminder': return '⏰';
      default: return '💬';
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'medical': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900">
              💬 Mensajes {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-lg ml-2">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'admin' 
                ? 'Comunicación con pacientes' 
                : 'Comunicación con Dr. Zerquera'
              }
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              ✏️ Nuevo Mensaje
            </button>
            <button
              onClick={() => setCurrentPage(user?.role === 'admin' ? 'admin' : 'inicio')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Volver
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Conversaciones ({messages.length})
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No hay mensajes</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.is_read && message.receiver_id === (user.role === 'admin' ? 'admin' : user.id)) {
                          markAsRead(message.id);
                        }
                      }}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        !message.is_read && message.receiver_id === (user.role === 'admin' ? 'admin' : user.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      } ${selectedMessage?.id === message.id ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">
                          {message.sender_id === (user.role === 'admin' ? 'admin' : user.id) ? `Para: ${message.receiver_name}` : `De: ${message.sender_name}`}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getMessageTypeColor(message.message_type)}`}>
                          {getMessageTypeIcon(message.message_type)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {message.message.length > 60 
                          ? `${message.message.substring(0, 60)}...` 
                          : message.message
                        }
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail/Compose */}
          <div className="lg:col-span-2">
            {showCompose ? (
              // Compose Message
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Nuevo Mensaje</h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {user?.role === 'admin' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Para (Paciente)
                      </label>
                      <select
                        value={newMessage.receiver_id}
                        onChange={(e) => {
                          const selectedPatient = patients.find(p => p.id === e.target.value);
                          setNewMessage({
                            ...newMessage,
                            receiver_id: e.target.value,
                            receiver_name: selectedPatient?.name || ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar paciente</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} ({patient.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <input type="hidden" />
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Para:</strong> Dr. Zerquera
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Mensaje
                    </label>
                    <select
                      value={newMessage.message_type}
                      onChange={(e) => setNewMessage({...newMessage, message_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">💬 General</option>
                      <option value="appointment">📅 Sobre Cita</option>
                      <option value="medical">🩺 Consulta Médica</option>
                      <option value="reminder">⏰ Recordatorio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Asunto del mensaje"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      value={newMessage.message}
                      onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Escriba su mensaje aquí..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={sendMessage}
                      disabled={loading || !newMessage.subject || !newMessage.message || (user?.role === 'admin' && !newMessage.receiver_id)}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {loading ? 'Enviando...' : '📤 Enviar Mensaje'}
                    </button>
                    <button
                      onClick={() => setShowCompose(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedMessage ? (
              // Message Detail
              <MessageDetailView 
                message={selectedMessage} 
                user={user} 
                onReply={replyToMessage}
                onClose={() => setSelectedMessage(null)}
              />
            ) : (
              // No message selected
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Seleccione un mensaje
                </h3>
                <p className="text-gray-600">
                  Elija una conversación de la lista para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Detail Component
const MessageDetailView = ({ message, user, onReply, onClose }) => {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(message.id, replyText);
      setReplyText('');
      setShowReply(false);
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'medical': return '🩺';
      case 'reminder': return '⏰';
      default: return '💬';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {getMessageTypeIcon(message.message_type)} {message.subject}
            </h3>
            <div className="text-sm text-gray-600">
              <p><strong>De:</strong> {message.sender_name}</p>
              <p><strong>Para:</strong> {message.receiver_name}</p>
              <p><strong>Fecha:</strong> {new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {message.message}
          </p>
        </div>

        {!showReply ? (
          <button
            onClick={() => setShowReply(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            📤 Responder
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Su respuesta:
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Escriba su respuesta aquí..."
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                📤 Enviar Respuesta
              </button>
              <button
                onClick={() => setShowReply(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Components
const Header = ({ currentPage, setCurrentPage, user, logout }) => {
  // Function to force clear cache and notifications
  const forceClearCache = () => {
    // Clear all notifications
    document.querySelectorAll('.fixed, [class*="notification"]').forEach(el => {
      if (el.style.zIndex > 30) el.remove();
    });
    
    // Clear localStorage
    localStorage.removeItem('zimi_notifications');
    localStorage.removeItem('zimi_cache');
    
    // Reload page
    window.location.reload(true);
  };

  // Filter navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { id: 'inicio', label: 'Inicio', icon: '🏠' },
      { id: 'servicios', label: 'Servicios', icon: '⚕️' },
      { id: 'citas', label: 'Citas', icon: '📅' },
      { id: 'mensajes', label: 'Mensajes', icon: '💬' },
      { id: 'doctor', label: 'Dr. Zerquera', icon: '👨‍⚕️' },
      { id: 'contacto', label: 'Contacto', icon: '📞' }
    ];

    // Add admin menu only for admin users
    if (user?.role === 'admin') {
      baseItems.push({ id: 'admin', label: 'Admin', icon: '⚙️' });
    }

    // Add profile for patients
    if (user?.role === 'patient') {
      baseItems.push({ id: 'profile', label: 'Mi Perfil', icon: '👤' });
    }

    return baseItems;
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png" 
              alt="ZIMI Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold">ZIMI</h1>
              <p className="text-sm text-blue-200">Medicina Integrativa</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {getNavItems().map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-100 hover:bg-blue-600'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">
                {user?.role === 'admin' ? '🔧 Administrador' : `👋 ${user?.name}`}
              </p>
              <p className="text-xs text-blue-200">{user?.email}</p>
            </div>
            
            {/* Cache clear button for admin */}
            {user?.role === 'admin' && (
              <button
                onClick={forceClearCache}
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                title="Limpiar caché y notificaciones"
              >
                🧹 Limpiar
              </button>
            )}
            
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Component to handle Emergent branding interference
const EmergentBrandingFix = () => {
  useEffect(() => {
    // Function to hide or reposition Emergent branding elements
    const hideEmergentBranding = () => {
      // Look for common Emergent branding selectors
      const selectors = [
        'div[class*="emergent"]',
        'div[id*="emergent"]', 
        'a[href*="emergent"]',
        'iframe[src*="emergent"]',
        '[class*="made-with"]',
        '[class*="powered-by"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Instead of hiding, move it up to not interfere with navigation
          if (element.style.position === 'fixed' && element.style.bottom) {
            element.style.bottom = '100px'; // Move above navigation bar
            element.style.zIndex = '9998'; // Below navigation but above content
          }
        });
      });
    };
    
    // Run immediately and also after a delay
    hideEmergentBranding();
    const timer = setTimeout(hideEmergentBranding, 1000);
    
    // Also run when DOM changes
    const observer = new MutationObserver(hideEmergentBranding);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
  
  return null; // This component doesn't render anything
};

const MobileNav = ({ currentPage, setCurrentPage, user }) => {
  // Filter navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { id: 'inicio', icon: '🏠' },
      { id: 'servicios', icon: '⚕️' },
      { id: 'citas', icon: '📅' },
      { id: 'mensajes', icon: '💬' },
      { id: 'doctor', icon: '👨‍⚕️' },
      { id: 'contacto', icon: '📞' }
    ];

    // Add admin menu only for admin users
    if (user?.role === 'admin') {
      baseItems.push({ id: 'admin', icon: '⚙️' });
    }

    // Add profile for patients
    if (user?.role === 'patient') {
      baseItems.push({ id: 'profile', icon: '👤' });
    }

    return baseItems;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-[9999] pb-safe">
      <div className="flex justify-around py-3 pb-6">
        {getNavItems().map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center py-3 px-2 rounded-lg transition-all min-w-[60px] ${
              currentPage === item.id 
                ? 'text-blue-600 bg-blue-50 transform scale-105' 
                : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium capitalize leading-tight">{item.id}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const HomePage = ({ setCurrentPage }) => {
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorResponse, testimonialsResponse] = await Promise.all([
          axios.get(`${API}/doctor-info`),
          axios.get(`${API}/testimonials`)
        ]);
        setDoctorInfo(doctorResponse.data);
        setTestimonials(testimonialsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Zerquera Integrative Medical Institute
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Cuidamos de su salud con medicina integrativa excepcional
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <a
              href="tel:+13052744351"
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              📞 Llamar Ahora
            </a>
            <a
              href="https://wa.me/13052744351"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Agendar Cita</h3>
              <p className="text-gray-600 mb-4">Presencial o Telemedicina</p>
              <button 
                onClick={() => setCurrentPage('citas')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                Solicitar Cita
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🩺</div>
              <h3 className="text-xl font-semibold mb-2">Servicios</h3>
              <p className="text-gray-600 mb-4">10+ Especialidades</p>
              <button 
                onClick={() => setCurrentPage('servicios')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                Ver Servicios
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-2">Telemedicina</h3>
              <p className="text-gray-600 mb-4">Consultas Virtuales</p>
              <button 
                onClick={() => setCurrentPage('citas')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                Consulta Virtual
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Section */}
      {doctorInfo && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src={doctorInfo.imagen}
                  alt="Dr. Pablo Zerquera"
                  className="w-full h-96 object-cover object-center rounded-lg shadow-lg"
                  style={{ objectPosition: 'center top' }}
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4 text-blue-900">
                  {doctorInfo.nombre}
                </h2>
                <p className="text-xl text-blue-600 mb-4">{doctorInfo.titulo}</p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {doctorInfo.filosofia}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorInfo.especialidades.map((esp, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>{esp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
              Lo que dicen nuestros pacientes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.testimonio}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.nombre}</p>
                    <p className="text-sm text-gray-500">{testimonial.rol}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Emergency Contact */}
      <section className="py-8 bg-red-50 border-l-4 border-red-500">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-red-700 mb-4">🚨 Emergencia Médica</h3>
          <p className="text-red-600 mb-4">Si tiene una emergencia médica, llame al 911 inmediatamente</p>
          <p className="text-gray-700">Para consultas urgentes, contáctenos:</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="tel:+13052744351" className="text-blue-600 font-semibold">
              📞 +1 305 274 4351
            </a>
            <a href="https://wa.me/13052744351" className="text-green-600 font-semibold">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

const ServicesPage = ({ setCurrentPage }) => {
  const [services, setServices] = useState([]);
  const [insurance, setInsurance] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showFlyer, setShowFlyer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, insuranceResponse] = await Promise.all([
          axios.get(`${API}/services`),
          axios.get(`${API}/insurance`)
        ]);
        setServices(servicesResponse.data);
        setInsurance(insuranceResponse.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchData();
  }, []);

  const openFlyer = (service) => {
    setSelectedService(service);
    setShowFlyer(true);
  };

  const closeFlyer = () => {
    setShowFlyer(false);
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
          Nuestros Servicios
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  {service.nombre}
                </h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  {service.descripcion}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{service.duracion}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-medium text-blue-600">{service.precio_estimado}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {service.disponible_telemedicina ? (
                      <>
                        <span className="text-green-500">💻</span>
                        <span className="text-sm text-green-600">Telemedicina</span>
                      </>
                    ) : (
                      <>
                        <span className="text-blue-500">🏥</span>
                        <span className="text-sm text-blue-600">Solo Presencial</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentPage('citas')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-all"
                  >
                    📅 Agendar
                  </button>
                  <button 
                    onClick={() => openFlyer(service)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm transition-all"
                  >
                    📋 Info Detallada
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insurance Section */}
        {insurance && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Seguros Aceptados</h2>
            <p className="text-gray-700 mb-4">{insurance.mensaje}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {insurance.seguros_aceptados.map((seguro, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg text-center">
                  <span className="font-medium text-blue-900">{seguro}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Navigation button for elderly users */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentPage('inicio')}
            className="back-button elderly-friendly-button flex items-center gap-2 mx-auto"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>

      {/* Service Flyer Modal */}
      <ServiceFlyerModal 
        service={selectedService}
        isOpen={showFlyer}
        onClose={closeFlyer}
      />
    </div>
  );
};

const AppointmentsPage = ({ setCurrentPage }) => {
  const [appointmentData, setAppointmentData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    service_type: '',
    appointment_type: 'presencial',
    urgency_level: '',
    mensaje: ''
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/appointments`, appointmentData);
      setSuccess(true);
      setAppointmentData({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        service_type: '',
        appointment_type: 'presencial',
        urgency_level: '',
        mensaje: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al solicitar la cita. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              ¡Solicitud de Consulta Enviada!
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-3">
                <span className="text-3xl mr-2">👨‍⚕️</span>
                <h3 className="text-xl font-semibold text-blue-900">Dr. Pablo Zerquera</h3>
              </div>
              <p className="text-blue-800 font-medium mb-3">
                Su solicitud está siendo revisada personalmente
              </p>
              <div className="text-sm text-blue-700 space-y-2">
                <p>✓ <strong>Revisión médica:</strong> El doctor evaluará su caso individualmente</p>
                <p>✓ <strong>Asignación de fecha:</strong> Se le proporcionará la fecha más apropiada</p>
                <p>✓ <strong>Confirmación:</strong> Recibirá respuesta en 24-48 horas</p>
                <p>✓ <strong>Contacto directo:</strong> Si es urgente, nos comunicaremos antes</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              El Dr. Zerquera ha recibido su solicitud y le asignará la fecha de consulta 
              más conveniente según su condición médica y nivel de urgencia indicado. 
              Nuestro equipo se pondrá en contacto con usted pronto para confirmar su cita.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Tiempo de respuesta estimado: 2-4 horas hábiles
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="tel:+13052744351"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  📞 Llamar Ahora
                </a>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  Nueva Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-4 text-blue-900">
          Solicitar Consulta Médica
        </h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🩺</span>
            <h2 className="text-xl font-semibold text-blue-900">Proceso Profesional de Citas</h2>
          </div>
          <p className="text-blue-800 leading-relaxed">
            El <strong>Dr. Pablo Zerquera</strong> evaluará personalmente su solicitud y le asignará 
            la fecha más apropiada según su condición médica y urgencia. Recibirá confirmación 
            detallada en <strong>24-48 horas</strong> con toda la información necesaria.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                👤 Información del Paciente
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={appointmentData.patient_name}
                    onChange={(e) => setAppointmentData({...appointmentData, patient_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Nombre y apellidos completos"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={appointmentData.patient_phone}
                    onChange={(e) => setAppointmentData({...appointmentData, patient_phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="+1-305-274-4351"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={appointmentData.patient_email}
                  onChange={(e) => setAppointmentData({...appointmentData, patient_email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="su-email@ejemplo.com"
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                🩺 Información Médica
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Servicio Requerido *
                  </label>
                  <select
                    required
                    value={appointmentData.service_type}
                    onChange={(e) => setAppointmentData({...appointmentData, service_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="">Seleccione el tipo de consulta</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.nombre}>
                        {service.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Urgencia *
                  </label>
                  <select
                    required
                    value={appointmentData.urgency_level || ''}
                    onChange={(e) => setAppointmentData({...appointmentData, urgency_level: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="">Seleccione nivel de urgencia</option>
                    <option value="normal">🟢 Normal - Consulta de rutina (2-3 semanas)</option>
                    <option value="moderada">🟡 Moderada - Requiere atención pronta (1 semana)</option>
                    <option value="urgente">🟠 Urgente - Necesita atención rápida (2-3 días)</option>
                    <option value="emergencia">🔴 Emergencia - Atención inmediata (24 horas)</option>
                  </select>
                </div>
              </div>
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la Consulta *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={appointmentData.mensaje}
                    onChange={(e) => setAppointmentData({...appointmentData, mensaje: e.target.value})}
                    placeholder="Describa detalladamente su condición, síntomas, duración y cualquier información relevante para el Dr. Zerquera..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    💡 <strong>Tip:</strong> Mientras más información proporcione, mejor podrá el doctor asignar el tiempo apropiado para su consulta.
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Type */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                📍 Modalidad de Consulta
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="appointment_type"
                    value="presencial"
                    checked={appointmentData.appointment_type === 'presencial'}
                    onChange={(e) => setAppointmentData({...appointmentData, appointment_type: e.target.value})}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-800">🏥 Consulta Presencial</div>
                    <div className="text-sm text-gray-600">En el consultorio del Dr. Zerquera</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="appointment_type"
                    value="telemedicina"
                    checked={appointmentData.appointment_type === 'telemedicina'}
                    onChange={(e) => setAppointmentData({...appointmentData, appointment_type: e.target.value})}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-800">💻 Telemedicina</div>
                    <div className="text-sm text-gray-600">Consulta virtual por videollamada</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Professional Assurance */}
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="text-2xl mr-3">👨‍⚕️</div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Compromiso Profesional</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>✓ El Dr. Zerquera revisará personalmente su solicitud</li>
                    <li>✓ Se le asignará la fecha más conveniente para su condición</li>
                    <li>✓ Recibirá confirmación con todos los detalles necesarios</li>
                    <li>✓ Si es urgente o emergencia, se priorizará su atención</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full elderly-friendly-button bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
            >
              {loading ? '⏳ Enviando...' : '📅 Solicitar Cita'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            ¿Necesita ayuda inmediata?
          </h3>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
            <a
              href="tel:+13052744351"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span>📞</span>
              <span>+1 305 274 4351</span>
            </a>
            <a
              href="https://wa.me/13052744351"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-green-600 hover:text-green-800"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
        
        {/* Navigation button for elderly users */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentPage('inicio')}
            className="back-button elderly-friendly-button flex items-center gap-2 mx-auto"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorPage = ({ setCurrentPage }) => {
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorResponse, teamResponse] = await Promise.all([
          axios.get(`${API}/doctor-info`),
          axios.get(`${API}/team`)
        ]);
        setDoctorInfo(doctorResponse.data);
        setTeam(teamResponse.data);
      } catch (error) {
        console.error('Error fetching doctor info:', error);
      }
    };
    fetchData();
  }, []);

  if (!doctorInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {doctorInfo.nombre}
              </h1>
              <p className="text-2xl text-blue-200 mb-6">{doctorInfo.titulo}</p>
              <p className="text-lg text-blue-100 leading-relaxed">
                {doctorInfo.filosofia}
              </p>
            </div>
            <div className="text-center">
              <img
                src={doctorInfo.imagen}
                alt={doctorInfo.nombre}
                className="w-full max-w-sm h-80 object-cover object-center rounded-lg shadow-2xl mx-auto border-4 border-white"
                style={{ objectPosition: 'center top' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
            Especialidades Médicas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorInfo.especialidades.map((especialidad, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚕️</span>
                  <h3 className="text-lg font-semibold text-blue-900">{especialidad}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educación */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
            Formación Académica
          </h2>
          <div className="max-w-4xl mx-auto">
            {doctorInfo.educacion.map((edu, index) => (
              <div key={index} className="flex items-start space-x-4 mb-8 p-6 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white p-3 rounded-full">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    {edu.titulo}
                  </h3>
                  <p className="text-lg text-gray-700 mb-1">{edu.institucion}</p>
                  <p className="text-gray-600">{edu.pais}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiencia */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
            Experiencia Profesional
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white p-4 rounded-full">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-blue-900 mb-4">
                    Liderazgo en Medicina Integrativa
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {doctorInfo.experiencia}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
            Nuestro Equipo Profesional
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍⚕️</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  {member.nombre}
                </h3>
                <p className="text-blue-600 font-medium mb-2">{member.titulo}</p>
                <p className="text-gray-600 mb-2">{member.rol}</p>
                <p className="text-sm text-gray-500">{member.especialidad}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar su journey hacia el bienestar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            El Dr. Zerquera y su equipo están aquí para ayudarle
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <a
              href="tel:+13052744351"
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              📞 Llamar Ahora
            </a>
            <button 
              onClick={() => setCurrentPage('citas')}
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              📅 Agendar Cita
            </button>
          </div>
          
          {/* Clear back button for elderly users */}
          <div className="mt-8 pt-6 border-t border-blue-600">
            <button 
              onClick={() => setCurrentPage('inicio')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 mx-auto"
            >
              ← Volver al Inicio
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const AdminPage = ({ setCurrentPage }) => {
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsResponse] = await Promise.all([
          axios.get(`${API}/appointments`)
        ]);
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const confirmAppointment = async (appointmentId, telemedicineLink = null) => {
    try {
      const url = `${API}/appointments/${appointmentId}/confirm`;
      const data = telemedicineLink ? { telemedicine_link: telemedicineLink } : {};
      
      await axios.put(url, data);
      
      // Refresh appointments
      const response = await axios.get(`${API}/appointments`);
      setAppointments(response.data);
      
      alert('Cita confirmada exitosamente');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Error al confirmar la cita');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'solicitada': return 'bg-yellow-100 text-yellow-800';
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">
            Panel de Administración ZIMI
          </h1>
          <button
            onClick={() => setCurrentPage('inicio')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Volver a Inicio
          </button>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Total Citas</h3>
            <p className="text-3xl font-bold text-blue-600">{appointments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Pendientes</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {appointments.filter(apt => apt.status === 'solicitada').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Confirmadas</h3>
            <p className="text-3xl font-bold text-green-600">
              {appointments.filter(apt => apt.status === 'confirmada').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Telemedicina</h3>
            <p className="text-3xl font-bold text-purple-600">
              {appointments.filter(apt => apt.appointment_type === 'telemedicina').length}
            </p>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Solicitudes de Citas ({appointments.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {appointment.patient_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {appointment.patient_id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{appointment.patient_email}</div>
                        <div className="text-gray-500">{appointment.patient_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {appointment.service_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.appointment_type === 'telemedicina' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {appointment.appointment_type === 'telemedicina' ? '💻 Telemedicina' : '🏥 Presencial'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{appointment.fecha_solicitada}</div>
                      <div className="text-gray-500">{appointment.hora_solicitada}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-y-2">
                      {appointment.status === 'solicitada' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => confirmAppointment(appointment.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 block"
                          >
                            ✅ Confirmar
                          </button>
                          {appointment.appointment_type === 'telemedicina' && (
                            <button
                              onClick={() => {
                                const link = prompt('Ingrese el link de telemedicina (ej: https://meet.google.com/abc-def-ghi):');
                                if (link) confirmAppointment(appointment.id, link);
                              }}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 block"
                            >
                              💻 + Link
                            </button>
                          )}
                        </div>
                      )}
                      <a
                        href={`tel:${appointment.patient_phone}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 block text-center"
                      >
                        📞 Llamar
                      </a>
                      <a
                        href={`mailto:${appointment.patient_email}`}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 block text-center"
                      >
                        📧 Email
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {appointments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay citas solicitadas
              </h3>
              <p className="text-gray-500">
                Las nuevas solicitudes aparecerán aquí automáticamente
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            📋 Panel de Administración
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">✅ Gestión de Citas:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Haga clic en "Confirmar" para citas presenciales</li>
                <li>Use "💻 + Link" para telemedicina</li>
                <li>El paciente recibe confirmación automática</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📞 Herramientas:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Use "📞 Llamar" para contacto directo</li>
                <li>Use "📧 Email" para enviar mensajes</li>
                <li>Gestione flyers de servicios</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setCurrentPage('flyer-management')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
              >
                🎨 Gestionar Flyers de Servicios
              </button>
              
              <button
                onClick={() => setCurrentPage('doctor-image-manager')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold"
              >
                📸 Cambiar Foto del Doctor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorImageManager = ({ setCurrentPage }) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const fetchCurrentImage = async () => {
    try {
      const response = await axios.get(`${API}/doctor-info`);
      setCurrentImage(response.data.imagen);
    } catch (error) {
      console.error('Error fetching current image:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!newImage) {
      alert('Por favor seleccione una imagen');
      return;
    }

    setLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        
        try {
          await axios.post(`${API}/admin/doctor-image`, {
            image_data: base64Data
          });
          
          setUploadSuccess(true);
          setCurrentImage(imagePreview);
          setNewImage(null);
          setImagePreview(null);
          
          // Reset file input
          const fileInput = document.getElementById('doctor-image-input');
          if (fileInput) fileInput.value = '';
          
          setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Error al subir la imagen. Por favor intente nuevamente.');
        }
      };
      reader.readAsDataURL(newImage);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              📸 Gestión de Imagen del Doctor
            </h1>
            <p className="text-gray-600">
              Actualice la foto del Dr. Zerquera que aparece en la aplicación
            </p>
          </div>

          {uploadSuccess && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <strong className="font-bold">¡Éxito!</strong>
              <span className="block sm:inline"> La imagen del doctor ha sido actualizada correctamente.</span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current Image */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🖼️ Imagen Actual
              </h2>
              <div className="border-2 border-gray-200 rounded-lg p-4">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Dr. Pablo Zerquera - Actual"
                    className="w-full h-80 object-cover object-center rounded-lg shadow-md"
                    style={{ objectPosition: 'center top' }}
                  />
                ) : (
                  <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <span className="text-6xl mb-4 block">👤</span>
                      <p>No hay imagen actual</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload New Image */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📤 Subir Nueva Imagen
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <input
                    type="file"
                    id="doctor-image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="doctor-image-input"
                    className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    📁 Seleccionar Imagen
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    JPG, PNG o GIF hasta 5MB
                  </p>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Vista Previa:</p>
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full h-80 object-cover object-center rounded-lg shadow-md"
                      style={{ objectPosition: 'center top' }}
                    />
                    
                    <div className="mt-4 text-center">
                      <button
                        onClick={uploadImage}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? '⏳ Subiendo...' : '✅ Confirmar y Subir'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              💡 Consejos para la mejor imagen
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">✅ Recomendaciones:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Imagen profesional y clara</li>
                  <li>Fondo neutro o de consultorio</li>
                  <li>Resolución mínima: 800x800 píxeles</li>
                  <li>Formato preferido: JPG o PNG</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⚠️ Evitar:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Imágenes borrosas o pixeladas</li>
                  <li>Fotos cortadas o mal encuadradas</li>
                  <li>Archivos muy pesados (+5MB)</li>
                  <li>Imágenes informales o no profesionales</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center space-x-4">
            <button
              onClick={() => setCurrentPage('admin')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
            >
              ← Volver al Panel de Admin
            </button>
            
            <button
              onClick={() => setCurrentPage('doctor')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              👀 Ver Página del Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage = ({ setCurrentPage }) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [contactForm, setContactForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${API}/contact-info`);
        setContactInfo(response.data);
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/contact`, contactForm);
      setSuccess(true);
      setContactForm({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      });
    } catch (error) {
      console.error('Error sending contact:', error);
      alert('Error al enviar el mensaje. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!contactInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando información de contacto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
          Contáctanos
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-blue-900">
                Información de Contacto
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold">Teléfono</p>
                    <a href={`tel:${contactInfo.telefono}`} className="text-blue-600 hover:underline">
                      {contactInfo.telefono}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-green-600 hover:underline">
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">Dirección</p>
                    <p className="text-gray-700">
                      {contactInfo.direccion.calle}<br/>
                      {contactInfo.direccion.ciudad}, {contactInfo.direccion.estado} {contactInfo.direccion.codigo_postal}<br/>
                      {contactInfo.direccion.pais}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-900">
                Horarios de Atención
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Lunes - Viernes:</span>
                  <span>{contactInfo.horarios.lunes_viernes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sábado:</span>
                  <span>{contactInfo.horarios.sabado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Domingo:</span>
                  <span className="text-red-600">{contactInfo.horarios.domingo}</span>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-900">
                Síguenos en Redes Sociales
              </h3>
              <div className="flex space-x-4">
                <a
                  href={contactInfo.redes_sociales.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all"
                >
                  📘
                </a>
                <a
                  href={contactInfo.redes_sociales.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-all"
                >
                  📺
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Contacto Rápido</h3>
              <div className="space-y-3">
                <a
                  href={`tel:${contactInfo.telefono}`}
                  className="block bg-white bg-opacity-20 p-3 rounded-lg hover:bg-opacity-30 transition-all"
                >
                  📞 Llamar Ahora
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-green-600 p-3 rounded-lg hover:bg-green-700 transition-all"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {success ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  ¡Mensaje Enviado!
                </h3>
                <p className="text-gray-700 mb-6">
                  Gracias por contactarnos. Responderemos a la brevedad posible.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Enviar Otro Mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-blue-900">
                  Envíanos un Mensaje
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.nombre}
                        onChange={(e) => setContactForm({...contactForm, nombre: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactForm.telefono}
                        onChange={(e) => setContactForm({...contactForm, telefono: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto *
                    </label>
                    <select
                      required
                      value={contactForm.asunto}
                      onChange={(e) => setContactForm({...contactForm, asunto: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione un asunto</option>
                      <option value="Cita médica">Cita médica</option>
                      <option value="Información de servicios">Información de servicios</option>
                      <option value="Seguros médicos">Seguros médicos</option>
                      <option value="Telemedicina">Telemedicina</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={contactForm.mensaje}
                      onChange={(e) => setContactForm({...contactForm, mensaje: e.target.value})}
                      placeholder="Escriba su mensaje aquí..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation button for elderly users */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentPage('inicio')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 mx-auto"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};


const ServiceFlyerModal = ({ service, isOpen, onClose }) => {
  const [flyerData, setFlyerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && service) {
      fetchFlyerData();
    }
  }, [isOpen, service]);

  const fetchFlyerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/flyers/${service.id}`);
      setFlyerData(response.data);
    } catch (error) {
      console.error('Error fetching flyer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !service) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!flyerData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with clear close button */}
        <div className="relative">
          <img 
            src={flyerData.image_url}
            alt={flyerData.title}
            className="w-full h-64 object-cover rounded-t-xl"
          />
          
          {/* Large, clear close button for elderly users */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="modal-close-button"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h2 className="text-3xl font-bold text-white">{flyerData.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="mr-2">✨</span> Beneficios
              </h3>
              <ul className="space-y-2">
                {flyerData.benefits?.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conditions */}
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span> Tratamos
              </h3>
              <ul className="space-y-2">
                {flyerData.conditions?.map((condition, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Process */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
              <span className="mr-2">🔄</span> Proceso de Tratamiento
            </h3>
            <div className="grid md:grid-cols-5 gap-4">
              {flyerData.process?.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Info */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">⏱️</div>
                <h4 className="font-semibold text-blue-900">Duración</h4>
                <p className="text-gray-700">{flyerData.duration}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">📅</div>
                <h4 className="font-semibold text-blue-900">Frecuencia</h4>
                <p className="text-gray-700">{flyerData.frequency}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🛡️</div>
                <h4 className="font-semibold text-blue-900">Seguridad</h4>
                <p className="text-gray-700">{flyerData.safety}</p>
              </div>
            </div>
          </div>

          {/* Special Offer */}
          {flyerData.offer_title && (
            <div className="mt-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{flyerData.offer_title}</h3>
                <div className="flex justify-center items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold">{flyerData.offer_price}</span>
                  {flyerData.offer_original_price && (
                    <span className="text-lg line-through opacity-75">{flyerData.offer_original_price}</span>
                  )}
                  {flyerData.offer_savings && (
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {flyerData.offer_savings}
                    </span>
                  )}
                </div>
                <p className="text-xl mb-4">{flyerData.offer_description}</p>
                <p className="text-sm opacity-90">¡Oferta limitada! Contacte ahora</p>
              </div>
            </div>
          )}

          {/* Location and Contact */}
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">📍</span> Ubicación
                </h4>
                <p className="text-gray-700">{flyerData.location}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">📞</span> Contacto
                </h4>
                <p className="text-gray-700">{flyerData.contact_phone}</p>
                <p className="text-blue-600">{flyerData.contact_website}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => {
                onClose();
                // This would trigger navigation to appointments
                window.location.hash = 'citas';
              }}
              className="elderly-friendly-button bg-blue-600 text-white hover:bg-blue-700 block w-full md:w-auto md:inline-block"
            >
              📅 Agendar Consulta de {service?.nombre}
            </button>
            <p className="text-sm text-gray-600 large-text">
              Consulta personalizada con el Dr. Pablo Zerquera
            </p>
            
            {/* Large back button for elderly users */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="back-button elderly-friendly-button w-full md:w-auto flex items-center justify-center gap-2"
              >
                ← Volver a Servicios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Flyer Management Page for Admin
const FlyerManagementPage = ({ setCurrentPage, user }) => {
  const [services, setServices] = useState([]);
  const [editingFlyer, setEditingFlyer] = useState(null);
  const [flyerData, setFlyerData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchFlyerData = async (serviceId) => {
    try {
      const response = await axios.get(`${API}/flyers/${serviceId}`);
      setFlyerData(response.data);
      setEditingFlyer(serviceId);
    } catch (error) {
      console.error('Error fetching flyer data:', error);
    }
  };

  const saveFlyerData = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/flyers/${editingFlyer}`, flyerData);
      alert('Flyer actualizado exitosamente');
      setEditingFlyer(null);
    } catch (error) {
      console.error('Error saving flyer:', error);
      alert('Error guardando el flyer');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...(flyerData[field] || [])];
    newArray[index] = value;
    setFlyerData({...flyerData, [field]: newArray});
  };

  const addArrayItem = (field) => {
    const newArray = [...(flyerData[field] || []), ''];
    setFlyerData({...flyerData, [field]: newArray});
  };

  const removeArrayItem = (field, index) => {
    const newArray = (flyerData[field] || []).filter((_, i) => i !== index);
    setFlyerData({...flyerData, [field]: newArray});
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Solo administradores pueden acceder a esta página</p>
          <button 
            onClick={() => setCurrentPage('inicio')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">
            Gestión de Flyers de Servicios
          </h1>
          <button
            onClick={() => setCurrentPage('admin')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Volver a Admin
          </button>
        </div>

        {!editingFlyer ? (
          // Services Grid
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-900">
                  {service.nombre}
                </h3>
                <p className="text-gray-700 mb-4 text-sm">
                  {service.descripcion}
                </p>
                <button
                  onClick={() => fetchFlyerData(service.id)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  ✏️ Editar Flyer
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Flyer Editor
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">
                Editando Flyer: {services.find(s => s.id === editingFlyer)?.nombre}
              </h2>
              <div className="space-x-4">
                <button
                  onClick={() => setEditingFlyer(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveFlyerData}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Flyer
                  </label>
                  <input
                    type="text"
                    value={flyerData.title || ''}
                    onChange={(e) => setFlyerData({...flyerData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={flyerData.image_url || ''}
                    onChange={(e) => setFlyerData({...flyerData, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={flyerData.duration || ''}
                    onChange={(e) => setFlyerData({...flyerData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia
                  </label>
                  <input
                    type="text"
                    value={flyerData.frequency || ''}
                    onChange={(e) => setFlyerData({...flyerData, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Información de Seguridad
                  </label>
                  <textarea
                    value={flyerData.safety || ''}
                    onChange={(e) => setFlyerData({...flyerData, safety: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Offer Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Oferta Especial
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Oferta
                  </label>
                  <input
                    type="text"
                    value={flyerData.offer_title || ''}
                    onChange={(e) => setFlyerData({...flyerData, offer_title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="OFERTA ESPECIAL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la Oferta
                  </label>
                  <input
                    type="text"
                    value={flyerData.offer_description || ''}
                    onChange={(e) => setFlyerData({...flyerData, offer_description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="20 Sesiones de Tratamiento"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Oferta
                    </label>
                    <input
                      type="text"
                      value={flyerData.offer_price || ''}
                      onChange={(e) => setFlyerData({...flyerData, offer_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="$1500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Original
                    </label>
                    <input
                      type="text"
                      value={flyerData.offer_original_price || ''}
                      onChange={(e) => setFlyerData({...flyerData, offer_original_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="$2000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ahorro
                    </label>
                    <input
                      type="text"
                      value={flyerData.offer_savings || ''}
                      onChange={(e) => setFlyerData({...flyerData, offer_savings: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ahorra $500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Beneficios</h3>
                <button
                  onClick={() => addArrayItem('benefits')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  + Agregar Beneficio
                </button>
              </div>
              <div className="space-y-2">
                {(flyerData.benefits || []).map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeArrayItem('benefits', index)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Condiciones que Tratamos</h3>
                <button
                  onClick={() => addArrayItem('conditions')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  + Agregar Condición
                </button>
              </div>
              <div className="space-y-2">
                {(flyerData.conditions || []).map((condition, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => handleArrayChange('conditions', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeArrayItem('conditions', index)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Proceso de Tratamiento</h3>
                <button
                  onClick={() => addArrayItem('process')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  + Agregar Paso
                </button>
              </div>
              <div className="space-y-2">
                {(flyerData.process || []).map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="bg-blue-100 text-blue-600 px-3 py-2 rounded font-semibold">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleArrayChange('process', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeArrayItem('process', index)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const PatientProfilePage = ({ setCurrentPage, user }) => {
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.id) return;
      
      try {
        const [profileResponse, appointmentsResponse] = await Promise.all([
          axios.get(`${API}/patient/${user.id}/profile`),
          axios.get(`${API}/patient/${user.id}/appointments`)
        ]);
        
        setPatientData(profileResponse.data);
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'solicitada': return 'bg-yellow-100 text-yellow-800';
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestione su información personal y vea su historial médico</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {patientData?.nombre} {patientData?.apellido}
                </h2>
                <p className="text-gray-600">Paciente ZIMI</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{patientData?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-gray-900">{patientData?.telefono}</p>
                </div>
                
                {patientData?.fecha_nacimiento && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <p className="text-gray-900">{patientData.fecha_nacimiento}</p>
                  </div>
                )}
                
                {patientData?.seguro && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seguro Médico</label>
                    <p className="text-gray-900">{patientData.seguro}</p>
                  </div>
                )}
                
                {patientData?.direccion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <p className="text-gray-900">{patientData.direccion}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => setCurrentPage('citas')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  📅 Nueva Cita
                </button>
              </div>
            </div>
          </div>

          {/* Appointments History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-2xl font-bold text-gray-800">
                  Historial de Citas ({appointments.length})
                </h3>
              </div>

              <div className="p-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">
                      No hay citas registradas
                    </h4>
                    <p className="text-gray-500 mb-6">
                      Solicite su primera cita médica con nosotros
                    </p>
                    <button
                      onClick={() => setCurrentPage('citas')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Solicitar Primera Cita
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg text-gray-800">
                            {appointment.service_type.replace(/_/g, ' ').toUpperCase()}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Fecha:</span> {appointment.fecha_solicitada}
                          </div>
                          <div>
                            <span className="font-medium">Hora:</span> {appointment.hora_solicitada}
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {
                              appointment.appointment_type === 'telemedicina' ? '💻 Telemedicina' : '🏥 Presencial'
                            }
                          </div>
                          <div>
                            <span className="font-medium">Creada:</span> {new Date(appointment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {appointment.mensaje && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <span className="font-medium">Nota:</span> {appointment.mensaje}
                          </div>
                        )}
                        
                        {appointment.telemedicine_link && (
                          <div className="mt-2">
                            <a
                              href={appointment.telemedicine_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                              💻 Unirse a Consulta Virtual →
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Changed from uiReady to isLoading

  // Initialize app and restore user session
  useEffect(() => {
    const initializeApp = () => {
      const savedUser = localStorage.getItem('zimi_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setCurrentPage('inicio');
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('zimi_user');
        }
      }
      // Always set loading to false after initialization
      setIsLoading(false);
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save user to localStorage when authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem('zimi_user', JSON.stringify(user));
    }
  }, [user, isAuthenticated]);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
    localStorage.removeItem('zimi_user');
  };

  const renderPage = () => {
    // Authentication required pages
    if (!isAuthenticated) {
      switch (currentPage) {
        case 'login':
          return <LoginPage setCurrentPage={setCurrentPage} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />;
        case 'register':
          return <RegisterPage setCurrentPage={setCurrentPage} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />;
        default:
          return <LoginPage setCurrentPage={setCurrentPage} setUser={setUser} setIsAuthenticated={setIsAuthenticated} />;
      }
    }

    // Authenticated pages
    switch (currentPage) {
      case 'inicio':
        return <HomePage setCurrentPage={setCurrentPage} user={user} />;
      case 'servicios':
        return <ServicesPage setCurrentPage={setCurrentPage} user={user} />;
      case 'citas':
        return <AppointmentsPage setCurrentPage={setCurrentPage} user={user} />;
      case 'mensajes':
        return <MessagingPage setCurrentPage={setCurrentPage} user={user} />;
      case 'doctor':
        return <DoctorPage setCurrentPage={setCurrentPage} user={user} />;
      case 'contacto':
        return <ContactPage setCurrentPage={setCurrentPage} user={user} />;
      case 'admin':
        // Restrict admin access to admin users only
        if (user?.role === 'admin') {
          return <AdminPage setCurrentPage={setCurrentPage} user={user} />;
        } else {
          // Redirect non-admin users back to home
          setCurrentPage('inicio');
          return <HomePage setCurrentPage={setCurrentPage} user={user} />;
        }
      case 'flyer-management':
        // Admin only page for flyer management
        if (user?.role === 'admin') {
          return <FlyerManagementPage setCurrentPage={setCurrentPage} user={user} />;
        } else {
          setCurrentPage('inicio');
          return <HomePage setCurrentPage={setCurrentPage} user={user} />;
        }
      case 'doctor-image-manager':
        // Admin only page for doctor image management
        if (user?.role === 'admin') {
          return <DoctorImageManager setCurrentPage={setCurrentPage} user={user} />;
        } else {
          setCurrentPage('inicio');
          return <HomePage setCurrentPage={setCurrentPage} user={user} />;
        }
      case 'profile':
        return <PatientProfilePage setCurrentPage={setCurrentPage} user={user} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} user={user} />;
    }
  };

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-0">
        <div className="text-center">
          <img 
            src="https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png" 
            alt="ZIMI Logo" 
            className="h-20 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-gray-600">Cargando ZIMI...</p>
        </div>
      </div>
    );
  }

  // Don't render header for login/register pages
  const showHeader = isAuthenticated && !['login', 'register'].includes(currentPage);
  // FIXED: Mobile nav should show during loading if user was previously authenticated
  const showMobileNav = (isAuthenticated || (!isLoading && localStorage.getItem('zimi_user'))) && !['login', 'register', 'flyer-management'].includes(currentPage);

  return (
    <div className="App min-h-screen bg-gray-50">
      {/* Component to handle Emergent branding interference */}
      <EmergentBrandingFix />
      
      {showHeader && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user}
          logout={logout}
        />
      )}
      
      <main className={showMobileNav ? "pb-32 md:pb-0" : ""}>
        {renderPage()}
      </main>
      {showMobileNav && (
        <MobileNav 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user}
        />
      )}
    </div>
  );
}

export default App;