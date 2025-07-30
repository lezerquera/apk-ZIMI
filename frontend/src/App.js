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

// Components
const Header = ({ currentPage, setCurrentPage, user, logout }) => {
  // Filter navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { id: 'inicio', label: 'Inicio', icon: '🏠' },
      { id: 'servicios', label: 'Servicios', icon: '⚕️' },
      { id: 'citas', label: 'Citas', icon: '📅' },
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

const MobileNav = ({ currentPage, setCurrentPage, user }) => {
  // Filter navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { id: 'inicio', icon: '🏠' },
      { id: 'servicios', icon: '⚕️' },
      { id: 'citas', icon: '📅' },
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
      <div className="flex justify-around py-2">
        {getNavItems().map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              currentPage === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1 capitalize">{item.id}</span>
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
              href="https://wa.me/19546698708"
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
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
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
            <a href="https://wa.me/19546698708" className="text-green-600 font-semibold">
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
    fecha_solicitada: '',
    hora_solicitada: '',
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
        fecha_solicitada: '',
        hora_solicitada: '',
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
              ¡Solicitud Enviada!
            </h2>
            <p className="text-gray-700 mb-6">
              Su solicitud de cita ha sido enviada exitosamente. 
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
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
          Solicitar Cita Médica
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Información Personal</h3>
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
                    value={appointmentData.patient_phone}
                    onChange={(e) => setAppointmentData({...appointmentData, patient_phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={appointmentData.patient_email}
                  onChange={(e) => setAppointmentData({...appointmentData, patient_email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Detalles de la Cita</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio Requerido *
                </label>
                <select
                  required
                  value={appointmentData.service_type}
                  onChange={(e) => setAppointmentData({...appointmentData, service_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione un servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="appointment_type"
                      value="presencial"
                      checked={appointmentData.appointment_type === 'presencial'}
                      onChange={(e) => setAppointmentData({...appointmentData, appointment_type: e.target.value})}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">🏥 Presencial</div>
                      <div className="text-sm text-gray-600">En nuestras instalaciones</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="appointment_type"
                      value="telemedicina"
                      checked={appointmentData.appointment_type === 'telemedicina'}
                      onChange={(e) => setAppointmentData({...appointmentData, appointment_type: e.target.value})}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">💻 Telemedicina</div>
                      <div className="text-sm text-gray-600">Consulta virtual</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Preferida *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentData.fecha_solicitada}
                    onChange={(e) => setAppointmentData({...appointmentData, fecha_solicitada: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Preferida *
                  </label>
                  <select
                    required
                    value={appointmentData.hora_solicitada}
                    onChange={(e) => setAppointmentData({...appointmentData, hora_solicitada: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccione hora</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje Adicional (Opcional)
              </label>
              <textarea
                rows={4}
                value={appointmentData.mensaje}
                onChange={(e) => setAppointmentData({...appointmentData, mensaje: e.target.value})}
                placeholder="Describa brevemente su condición o cualquier información adicional que considere importante..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {loading ? 'Enviando...' : 'Solicitar Cita'}
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
              href="https://wa.me/19546698708"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-green-600 hover:text-green-800"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
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
            📋 Instrucciones de Uso
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">✅ Confirmar Citas:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Haga clic en "Confirmar" para citas presenciales</li>
                <li>Use "💻 + Link" para telemedicina</li>
                <li>El paciente recibe confirmación automática</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📞 Contactar Pacientes:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Use "📞 Llamar" para contacto directo</li>
                <li>Use "📧 Email" para enviar mensajes</li>
                <li>La información se actualiza en tiempo real</li>
              </ul>
            </div>
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
      </div>
    </div>
  );
};

// Simple Notification System (Background only)
const useNotificationSystem = (user) => {
  useEffect(() => {
    if (user?.role !== 'admin') return;

    let interval;
    let lastCheck = Date.now();

    // Request notification permission quietly
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkForNewAppointments = async () => {
      try {
        const response = await axios.get(`${API}/appointments`);
        const appointments = response.data;
        
        // Find new appointments since last check
        const newAppointments = appointments.filter(apt => 
          new Date(apt.created_at).getTime() > lastCheck && 
          apt.status === 'solicitada'
        );

        if (newAppointments.length > 0) {
          newAppointments.forEach(apt => {
            const title = '🏥 Nueva Solicitud de Cita - ZIMI';
            const body = `${apt.patient_name} solicita ${apt.service_type.replace(/_/g, ' ')} para ${apt.fecha_solicitada}`;
            
            // Simple browser notification
            if (Notification.permission === 'granted') {
              new Notification(title, {
                body,
                icon: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
                tag: 'zimi-notification'
              });
            }
          });

          lastCheck = Date.now();
        }
      } catch (error) {
        console.error('Error checking for new appointments:', error);
      }
    };

    // Check every 60 seconds
    interval = setInterval(checkForNewAppointments, 60000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);
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
        {/* Header */}
        <div className="relative">
          <img 
            src={flyerData.image_url}
            alt={flyerData.title}
            className="w-full h-64 object-cover rounded-t-xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
          >
            <span className="text-gray-600 text-xl">✕</span>
          </button>
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
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                onClose();
                // This would trigger navigation to appointments
                window.location.hash = 'citas';
              }}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-all"
            >
              📅 Agendar Consulta de {service?.nombre}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Consulta personalizada con el Dr. Pablo Zerquera
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Profile Component
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
  const [currentPage, setCurrentPage] = useState('login'); // Start with login
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('zimi_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setCurrentPage('inicio');
      } catch (error) {
        localStorage.removeItem('zimi_user');
      }
    }
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
      case 'profile':
        return <PatientProfilePage setCurrentPage={setCurrentPage} user={user} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} user={user} />;
    }
  };

  // Don't render header for login/register pages
  const showHeader = isAuthenticated && !['login', 'register'].includes(currentPage);
  const showMobileNav = isAuthenticated && !['login', 'register'].includes(currentPage);

  return (
    <div className="App min-h-screen bg-gray-50">
      {showHeader && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user}
          logout={logout}
        />
      )}
      
      {/* Simple background notification system */}
      {isAuthenticated && user?.role === 'admin' && useNotificationSystem(user)}
      
      <main className={showMobileNav ? "pb-20 md:pb-0" : ""}>
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