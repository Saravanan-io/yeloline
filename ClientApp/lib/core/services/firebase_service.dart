import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/foundation.dart';
import '../../models/project_model.dart';
import '../../models/quote_model.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseDatabase _rtdb = FirebaseDatabase.instance;

  // ---------------- PROJECTS (REAL-TIME STREAM) ----------------

  /// Real-time stream of portfolio projects from Firestore.
  /// Automatically falls back to [Project.sampleProjects] if Firestore is empty or unreachable.
  Stream<List<Project>> streamProjects() {
    return _firestore.collection('projects').snapshots().map((snapshot) {
      if (snapshot.docs.isEmpty) {
        return <Project>[];
      }
      return snapshot.docs.map((doc) {
        final data = doc.data();
        return Project.fromMap(data, doc.id);
      }).toList();
    }).handleError((error) {
      debugPrint('[FirebaseService] streamProjects error: $error');
      return <Project>[];
    });
  }

  // ---------------- GET QUOTE / LEADS ----------------

  /// Submit a user quote request to Firestore collection `enquiries`
  Future<bool> submitQuoteRequest(QuoteData quoteData) async {
    try {
      final now = DateTime.now();
      final dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      final enquiryId = 'ENQ-${now.year}-${now.millisecondsSinceEpoch.toString().substring(7)}';

      final areaNum = int.tryParse(quoteData.approximateArea) ?? 0;
      final estimatedCost = areaNum * 2350;

      final enquiryMap = {
        'enquiry_id': enquiryId,
        'client_name': quoteData.clientName.trim(),
        'client_phone': quoteData.mobileNumber.trim(),
        'whatsapp_number': quoteData.whatsAppNumber.isNotEmpty ? quoteData.whatsAppNumber.trim() : quoteData.mobileNumber.trim(),
        'client_email': '',
        'site_location': quoteData.location.trim(),
        'structure_type': quoteData.structure,
        'structure_spec': quoteData.structure,
        'cement_brand': quoteData.cement,
        'steel_brand': quoteData.steel,
        'bricks_blocks_spec': quoteData.bricks,
        'flooring_spec': quoteData.flooring,
        'doors_spec': quoteData.doors,
        'windows_spec': quoteData.windows,
        'plot_size': quoteData.plotSize,
        'builtup_area_sqft': areaNum,
        'number_of_floors': quoteData.numberOfFloors,
        'preferred_start_date': quoteData.preferredStartDate,
        'estimated_rate_per_sqft': quoteData.estimatedRateFormatted,
        'total_estimated_cost': estimatedCost,
        'enquiry_date': dateStr,
        'lead_stage': 'New Enquiry',
        'additional_notes': quoteData.additionalNotes.isNotEmpty ? quoteData.additionalNotes : 'Submitted from Yeloline Mobile App',
        'created_at': FieldValue.serverTimestamp(),
      };

      // Write to Firestore
      await _firestore.collection('enquiries').doc(enquiryId).set(enquiryMap);

      // Mirror to Realtime Database for instant push notification triggers
      try {
        await _rtdb.ref('enquiries/$enquiryId').set({
          'client_name': quoteData.clientName,
          'phone': quoteData.mobileNumber,
          'location': quoteData.location,
          'timestamp': ServerValue.timestamp,
        });
      } catch (rtdbErr) {
        debugPrint('[FirebaseService] RTDB mirror notice: $rtdbErr');
      }

      return true;
    } catch (e) {
      debugPrint('[FirebaseService] submitQuoteRequest error: $e');
      return false;
    }
  }

  // ---------------- RENOVATION VAN APPOINTMENTS ----------------

  /// Submit renovation appointment to Firestore collection `appointments`
  Future<bool> submitRenovationAppointment({
    required String customerName,
    required String phone,
    required String location,
    required String serviceRequired,
    required String timeSlot,
    required DateTime appointmentDate,
    String? notes,
  }) async {
    try {
      final now = DateTime.now();
      final dateStr = '${appointmentDate.year}-${appointmentDate.month.toString().padLeft(2, '0')}-${appointmentDate.day.toString().padLeft(2, '0')}';
      final aptId = 'APT-${now.millisecondsSinceEpoch.toString().substring(7)}';

      final appointmentMap = {
        'appointment_id': aptId,
        'customer_name': customerName.trim(),
        'phone': phone.trim(),
        'contact_phone': phone.trim(),
        'location': location.trim(),
        'service_type': serviceRequired,
        'service_required': serviceRequired,
        'appointment_date': dateStr,
        'time_slot': timeSlot,
        'status': 'Scheduled',
        'technician_name': 'Unassigned',
        'notes': notes ?? 'Booked via Renovation Van Mobile App',
        'created_at': FieldValue.serverTimestamp(),
      };

      await _firestore.collection('appointments').doc(aptId).set(appointmentMap);

      try {
        await _rtdb.ref('appointments/$aptId').set({
          'customer_name': customerName,
          'phone': phone,
          'status': 'Scheduled',
          'timestamp': ServerValue.timestamp,
        });
      } catch (_) {}

      return true;
    } catch (e) {
      debugPrint('[FirebaseService] submitRenovationAppointment error: $e');
      return false;
    }
  }

  // ---------------- CONTACT ENQUIRIES ----------------

  /// Submit contact enquiry to Firestore collection `contact_enquiries`
  Future<bool> submitContactEnquiry({
    required String name,
    required String contact,
    required String message,
  }) async {
    try {
      final now = DateTime.now();
      final contactId = 'CNT-${now.year}-${now.millisecondsSinceEpoch.toString().substring(7)}';

      final enquiryMap = {
        'contact_id': contactId,
        'client_name': name.trim(),
        'name': name.trim(),
        'contact': contact.trim(),
        'phone': contact.trim(),
        'message': message.trim(),
        'submission_date': '${now.day}/${now.month}/${now.year}',
        'status': 'New',
        'created_at': FieldValue.serverTimestamp(),
      };

      await _firestore.collection('contact_enquiries').doc(contactId).set(enquiryMap);
      return true;
    } catch (e) {
      debugPrint('[FirebaseService] submitContactEnquiry error: $e');
      return false;
    }
  }

  // ---------------- COMPANY SETTINGS (PHONE, WHATSAPP, ETC) ----------------

  /// Stream dynamic company settings updated by Admin in Admin Panel
  Stream<Map<String, dynamic>> streamCompanySettings() {
    return _firestore.collection('settings').doc('company').snapshots().map((snapshot) {
      if (snapshot.exists && snapshot.data() != null) {
        return snapshot.data()!;
      }
      return {
        'company_phone': '+91 98765 43210',
        'company_whatsapp': '+91 98765 43210',
        'company_email': 'contact@yeloline.com',
        'office_address': 'Perundurai Road, Erode, Tamil Nadu - 638052',
      };
    }).handleError((_) => {
      'company_phone': '+91 98765 43210',
      'company_whatsapp': '+91 98765 43210',
      'company_email': 'contact@yeloline.com',
      'office_address': 'Perundurai Road, Erode, Tamil Nadu - 638052',
    });
  }

  // ---------------- ADMIN MASTER SITES, EXPENSES, PURCHASES, PAYMENTS ----------------

  Stream<List<Map<String, dynamic>>> streamSites() {
    return _firestore.collection('sites').snapshots().map((snap) =>
      snap.docs.map((d) => {'id': d.id, ...d.data()}).toList()
    ).handleError((_) => <Map<String, dynamic>>[]);
  }

  Stream<List<Map<String, dynamic>>> streamExpenses() {
    return _firestore.collection('expenses').snapshots().map((snap) =>
      snap.docs.map((d) => {'id': d.id, ...d.data()}).toList()
    ).handleError((_) => <Map<String, dynamic>>[]);
  }

  Stream<List<Map<String, dynamic>>> streamPurchases() {
    return _firestore.collection('purchases').snapshots().map((snap) =>
      snap.docs.map((d) => {'id': d.id, ...d.data()}).toList()
    ).handleError((_) => <Map<String, dynamic>>[]);
  }

  Stream<List<Map<String, dynamic>>> streamPayments() {
    return _firestore.collection('payments').snapshots().map((snap) =>
      snap.docs.map((d) => {'id': d.id, ...d.data()}).toList()
    ).handleError((_) => <Map<String, dynamic>>[]);
  }
}
