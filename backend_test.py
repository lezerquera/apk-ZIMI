#!/usr/bin/env python3
"""
ZIMI Backend API Testing Suite
Tests all core API endpoints, CORS configuration, environment variables, and database connectivity.
"""

import requests
import json
import os
import sys
from datetime import datetime
import uuid

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("ERROR: Could not find REACT_APP_BACKEND_URL in frontend/.env")
    sys.exit(1)

API_BASE = f"{BACKEND_URL}/api"
print(f"Testing backend API at: {API_BASE}")

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.patient_id = None
        self.appointment_id = None
        self.message_id = None
        
    def log_test(self, test_name, success, details="", error=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": str(error) if error else None,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if error:
            print(f"    Error: {error}")
        print()

    def test_root_endpoint(self):
        """Test GET /api/ endpoint"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "ZIMI" in data.get("message", ""):
                    self.log_test("Root Endpoint", True, f"Response: {data}")
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response: {data}")
            else:
                self.log_test("Root Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Root Endpoint", False, error=e)

    def test_services_endpoint(self):
        """Test GET /api/services endpoint"""
        try:
            response = requests.get(f"{API_BASE}/services", timeout=10)
            if response.status_code == 200:
                services = response.json()
                if isinstance(services, list) and len(services) > 0:
                    service_names = [s.get("nombre") for s in services]
                    self.log_test("Services Endpoint", True, f"Found {len(services)} services: {service_names[:3]}...")
                else:
                    self.log_test("Services Endpoint", False, "No services returned")
            else:
                self.log_test("Services Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Services Endpoint", False, error=e)

    def test_doctor_info_endpoint(self):
        """Test GET /api/doctor-info endpoint"""
        try:
            response = requests.get(f"{API_BASE}/doctor-info", timeout=10)
            if response.status_code == 200:
                doctor = response.json()
                if doctor.get("nombre") and doctor.get("especialidades"):
                    self.log_test("Doctor Info Endpoint", True, f"Doctor: {doctor.get('nombre')}")
                else:
                    self.log_test("Doctor Info Endpoint", False, "Missing doctor information")
            else:
                self.log_test("Doctor Info Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Doctor Info Endpoint", False, error=e)

    def test_contact_info_endpoint(self):
        """Test GET /api/contact-info endpoint"""
        try:
            response = requests.get(f"{API_BASE}/contact-info", timeout=10)
            if response.status_code == 200:
                contact = response.json()
                if contact.get("telefono") and contact.get("email"):
                    self.log_test("Contact Info Endpoint", True, f"Phone: {contact.get('telefono')}")
                else:
                    self.log_test("Contact Info Endpoint", False, "Missing contact information")
            else:
                self.log_test("Contact Info Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Contact Info Endpoint", False, error=e)

    def test_appointment_creation(self):
        """Test POST /api/appointments endpoint"""
        try:
            appointment_data = {
                "patient_name": "Maria Rodriguez",
                "patient_email": "maria.rodriguez@email.com",
                "patient_phone": "+1 305 555 0123",
                "service_type": "acupuntura",
                "appointment_type": "presencial",
                "fecha_solicitada": "2025-01-20",
                "hora_solicitada": "10:00",
                "mensaje": "Primera consulta para dolor de espalda"
            }
            
            response = requests.post(f"{API_BASE}/appointments", 
                                   json=appointment_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                appointment = response.json()
                if appointment.get("id") and appointment.get("patient_name"):
                    self.appointment_id = appointment.get("id")
                    self.log_test("Appointment Creation", True, f"Created appointment ID: {self.appointment_id}")
                else:
                    self.log_test("Appointment Creation", False, "Missing appointment data")
            else:
                self.log_test("Appointment Creation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Appointment Creation", False, error=e)

    def test_get_appointments(self):
        """Test GET /api/appointments endpoint"""
        try:
            response = requests.get(f"{API_BASE}/appointments", timeout=10)
            if response.status_code == 200:
                appointments = response.json()
                if isinstance(appointments, list):
                    self.log_test("Get Appointments", True, f"Retrieved {len(appointments)} appointments")
                else:
                    self.log_test("Get Appointments", False, "Invalid appointments response")
            else:
                self.log_test("Get Appointments", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Appointments", False, error=e)

    def test_appointment_confirmation(self):
        """Test PUT /api/appointments/{appointment_id}/confirm endpoint with date assignment"""
        if not self.appointment_id:
            self.log_test("Appointment Confirmation", False, "No appointment ID available for testing")
            return
            
        try:
            # Test appointment confirmation with all fields
            confirmation_data = {
                "assigned_date": "2025-01-25",
                "assigned_time": "14:30",
                "telemedicine_link": "https://meet.google.com/abc-defg-hij",
                "doctor_notes": "Por favor traiga sus estudios médicos previos. Llegue 10 minutos antes."
            }
            
            response = requests.put(f"{API_BASE}/appointments/{self.appointment_id}/confirm", 
                                  json=confirmation_data, 
                                  timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if (result.get("message") and 
                    result.get("patient_notified") and 
                    result.get("appointment_details")):
                    
                    details = result.get("appointment_details")
                    if (details.get("assigned_date") == confirmation_data["assigned_date"] and
                        details.get("assigned_time") == confirmation_data["assigned_time"] and
                        details.get("telemedicine_link") == confirmation_data["telemedicine_link"] and
                        details.get("doctor_notes") == confirmation_data["doctor_notes"]):
                        
                        self.log_test("Appointment Confirmation", True, 
                                    f"Appointment confirmed with date: {details['assigned_date']}, time: {details['assigned_time']}")
                    else:
                        self.log_test("Appointment Confirmation", False, "Confirmation data mismatch")
                else:
                    self.log_test("Appointment Confirmation", False, "Missing confirmation response data")
            else:
                self.log_test("Appointment Confirmation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Appointment Confirmation", False, error=e)

    def test_appointment_model_updates(self):
        """Test that confirmed appointments include new fields"""
        if not self.appointment_id:
            self.log_test("Appointment Model Updates", False, "No appointment ID available for testing")
            return
            
        try:
            # Get the confirmed appointment to verify new fields
            response = requests.get(f"{API_BASE}/appointments", timeout=10)
            if response.status_code == 200:
                appointments = response.json()
                confirmed_appointment = None
                
                for appointment in appointments:
                    if appointment.get("id") == self.appointment_id:
                        confirmed_appointment = appointment
                        break
                
                if confirmed_appointment:
                    # Check for new fields
                    has_assigned_date = confirmed_appointment.get("assigned_date") is not None
                    has_assigned_time = confirmed_appointment.get("assigned_time") is not None
                    has_doctor_notes = confirmed_appointment.get("doctor_notes") is not None
                    has_status_confirmed = confirmed_appointment.get("status") == "confirmada"
                    
                    if has_assigned_date and has_assigned_time and has_doctor_notes and has_status_confirmed:
                        self.log_test("Appointment Model Updates", True, 
                                    f"Appointment model includes new fields: assigned_date={confirmed_appointment['assigned_date']}, assigned_time={confirmed_appointment['assigned_time']}")
                    else:
                        missing_fields = []
                        if not has_assigned_date: missing_fields.append("assigned_date")
                        if not has_assigned_time: missing_fields.append("assigned_time")
                        if not has_doctor_notes: missing_fields.append("doctor_notes")
                        if not has_status_confirmed: missing_fields.append("status=confirmada")
                        
                        self.log_test("Appointment Model Updates", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Appointment Model Updates", False, "Could not find confirmed appointment")
            else:
                self.log_test("Appointment Model Updates", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Appointment Model Updates", False, error=e)

    def test_patient_registration(self):
        """Test POST /api/auth/register endpoint"""
        try:
            patient_data = {
                "nombre": "Carlos",
                "apellido": "Mendez",
                "email": "carlos.mendez@email.com",
                "telefono": "+1 305 555 0456",
                "fecha_nacimiento": "1985-03-15",
                "direccion": "123 Main St, Miami, FL 33101"
            }
            
            response = requests.post(f"{API_BASE}/auth/register", 
                                   json=patient_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("patient_id"):
                    self.patient_id = result.get("patient_id")
                    self.log_test("Patient Registration", True, f"Registered patient ID: {self.patient_id}")
                else:
                    self.log_test("Patient Registration", False, "Missing patient ID")
            else:
                self.log_test("Patient Registration", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Patient Registration", False, error=e)

    def test_patient_login(self):
        """Test POST /api/auth/login endpoint"""
        try:
            # Use the registered patient's credentials
            login_data = {
                "email": "carlos.mendez@email.com",
                "phone": "+1 305 555 0456"
            }
            
            response = requests.post(f"{API_BASE}/auth/login", 
                                   params=login_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("patient_id"):
                    self.log_test("Patient Login", True, f"Login successful for patient: {result.get('patient_name')}")
                else:
                    self.log_test("Patient Login", False, "Missing patient data in login response")
            else:
                self.log_test("Patient Login", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Patient Login", False, error=e)

    def test_admin_login(self):
        """Test POST /api/auth/admin/login endpoint"""
        try:
            admin_data = {
                "email": "admin@drzerquera.com",
                "password": "ZimiAdmin2025!"
            }
            
            response = requests.post(f"{API_BASE}/auth/admin/login", 
                                   params=admin_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("role") == "admin":
                    self.log_test("Admin Login", True, "Admin login successful")
                else:
                    self.log_test("Admin Login", False, "Invalid admin role")
            else:
                self.log_test("Admin Login", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Admin Login", False, error=e)

    def test_message_system(self):
        """Test message system endpoints"""
        if not self.patient_id:
            self.log_test("Message System", False, "No patient ID available for testing")
            return
            
        try:
            # Test sending a message
            message_data = {
                "receiver_id": "admin",
                "receiver_name": "Dr. Zerquera",
                "subject": "Consulta sobre tratamiento",
                "message": "Tengo algunas preguntas sobre el tratamiento de acupuntura.",
                "message_type": "general"
            }
            
            response = requests.post(f"{API_BASE}/messages", 
                                   json=message_data,
                                   params={
                                       "sender_id": self.patient_id,
                                       "sender_name": "Carlos Mendez"
                                   },
                                   timeout=10)
            
            if response.status_code == 200:
                message = response.json()
                self.message_id = message.get("id")
                self.log_test("Send Message", True, f"Message sent with ID: {self.message_id}")
                
                # Test getting messages
                response = requests.get(f"{API_BASE}/messages/{self.patient_id}", timeout=10)
                if response.status_code == 200:
                    messages = response.json()
                    self.log_test("Get Messages", True, f"Retrieved {len(messages)} messages")
                else:
                    self.log_test("Get Messages", False, f"Status: {response.status_code}")
                    
            else:
                self.log_test("Send Message", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Message System", False, error=e)

    def test_flyer_management(self):
        """Test flyer management endpoints"""
        try:
            # Test getting all flyers
            response = requests.get(f"{API_BASE}/flyers", timeout=10)
            if response.status_code == 200:
                flyers = response.json()
                self.log_test("Get All Flyers", True, f"Retrieved {len(flyers)} flyers")
            else:
                self.log_test("Get All Flyers", False, f"Status: {response.status_code}")
            
            # Test getting specific service flyer
            response = requests.get(f"{API_BASE}/flyers/acupuntura", timeout=10)
            if response.status_code == 200:
                flyer = response.json()
                if flyer.get("service_id") == "acupuntura":
                    self.log_test("Get Service Flyer", True, "Retrieved acupuntura flyer")
                else:
                    self.log_test("Get Service Flyer", False, "Invalid flyer data")
            else:
                self.log_test("Get Service Flyer", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Flyer Management", False, error=e)

    def test_additional_endpoints(self):
        """Test additional endpoints"""
        endpoints = [
            ("/team", "Team Info"),
            ("/insurance", "Insurance Info"),
            ("/testimonials", "Testimonials")
        ]
        
        for endpoint, name in endpoints:
            try:
                response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test(name, True, f"Retrieved {name.lower()}")
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, error=e)

    def test_cors_configuration(self):
        """Test CORS configuration"""
        try:
            # Test preflight request
            headers = {
                'Origin': 'https://app.drzerquera.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            response = requests.options(f"{API_BASE}/services", headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            if cors_headers['Access-Control-Allow-Origin']:
                self.log_test("CORS Configuration", True, f"CORS headers present: {cors_headers}")
            else:
                self.log_test("CORS Configuration", False, "Missing CORS headers")
                
        except Exception as e:
            self.log_test("CORS Configuration", False, error=e)

    def test_error_handling(self):
        """Test error handling"""
        try:
            # Test 404 error
            response = requests.get(f"{API_BASE}/nonexistent-endpoint", timeout=10)
            if response.status_code == 404:
                self.log_test("404 Error Handling", True, "Correctly returns 404 for non-existent endpoint")
            else:
                self.log_test("404 Error Handling", False, f"Unexpected status: {response.status_code}")
            
            # Test invalid appointment data
            invalid_data = {"invalid": "data"}
            response = requests.post(f"{API_BASE}/appointments", json=invalid_data, timeout=10)
            if response.status_code in [400, 422]:  # Bad request or validation error
                self.log_test("Validation Error Handling", True, "Correctly handles invalid data")
            else:
                self.log_test("Validation Error Handling", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Error Handling", False, error=e)

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("ZIMI BACKEND API TESTING SUITE")
        print("=" * 60)
        print()
        
        # Core API endpoints
        self.test_root_endpoint()
        self.test_services_endpoint()
        self.test_doctor_info_endpoint()
        self.test_contact_info_endpoint()
        
        # Authentication
        self.test_patient_registration()
        self.test_patient_login()
        self.test_admin_login()
        
        # Appointments
        self.test_appointment_creation()
        self.test_get_appointments()
        
        # Message system
        self.test_message_system()
        
        # Flyer management
        self.test_flyer_management()
        
        # Additional endpoints
        self.test_additional_endpoints()
        
        # Configuration tests
        self.test_cors_configuration()
        self.test_error_handling()
        
        # Summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        print()
        
        if failed > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result.get('error', 'Unknown error')}")
            print()
        
        print("BACKEND API STATUS:", "✅ WORKING" if failed == 0 else f"❌ {failed} ISSUES FOUND")
        print("=" * 60)

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()