import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Header = ({ currentPage, setCurrentPage }) => (
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
          {[
            { id: 'inicio', label: 'Inicio', icon: '🏠' },
            { id: 'servicios', label: 'Servicios', icon: '⚕️' },
            { id: 'citas', label: 'Citas', icon: '📅' },
            { id: 'doctor', label: 'Dr. Zerquera', icon: '👨‍⚕️' },
            { id: 'contacto', label: 'Contacto', icon: '📞' }
          ].map(item => (
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
      </div>
    </div>
  </header>
);

const MobileNav = ({ currentPage, setCurrentPage }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
    <div className="flex justify-around py-2">
      {[
        { id: 'inicio', icon: '🏠' },
        { id: 'servicios', icon: '⚕️' },
        { id: 'citas', icon: '📅' },
        { id: 'doctor', icon: '👨‍⚕️' },
        { id: 'contacto', icon: '📞' }
      ].map(item => (
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

const HomePage = () => {
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
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Solicitar Cita
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🩺</div>
              <h3 className="text-xl font-semibold mb-2">Servicios</h3>
              <p className="text-gray-600 mb-4">10+ Especialidades</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Ver Servicios
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-2">Telemedicina</h3>
              <p className="text-gray-600 mb-4">Consultas Virtuales</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
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

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [insurance, setInsurance] = useState(null);

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
                
                <div className="flex items-center justify-between">
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
                  
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Agendar
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
    </div>
  );
};

const AppointmentsPage = () => {
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

const DoctorPage = () => {
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
                className="w-80 h-80 object-cover rounded-full shadow-2xl mx-auto border-8 border-white"
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
            <button className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              📅 Agendar Cita
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactPage = () => {
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

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('inicio');

  const renderPage = () => {
    switch (currentPage) {
      case 'inicio':
        return <HomePage />;
      case 'servicios':
        return <ServicesPage />;
      case 'citas':
        return <AppointmentsPage />;
      case 'doctor':
        return <DoctorPage />;
      case 'contacto':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="pb-20 md:pb-0">
        {renderPage()}
      </main>
      <MobileNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;