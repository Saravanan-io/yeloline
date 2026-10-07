import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/firebase_service.dart';

class RenovationScreen extends StatefulWidget {
  const RenovationScreen({super.key});

  @override
  State<RenovationScreen> createState() => _RenovationScreenState();
}

class _RenovationScreenState extends State<RenovationScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;
  int _selectedVanImage = 0;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String _selectedLocation = 'Erode, Tamil Nadu';
  String _selectedServiceRequired = 'Plumbing & Electrical';
  String _selectedTimeSlot = 'Morning (9:00 AM - 12:00 PM)';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));

  final List<String> _locations = [
    'Erode, Tamil Nadu',
    'Ahmedabad, Gujarat',
    'Vadodara, Gujarat',
    'Surat, Gujarat',
    'Rajkot, Gujarat',
  ];

  final List<String> _serviceOptions = [
    'Plumbing & Electrical',
    'Masonry & Structural Repair',
    'General Home Maintenance',
  ];

  final List<String> _timeSlots = [
    'Morning (9:00 AM - 12:00 PM)',
    'Afternoon (12:00 PM - 3:00 PM)',
    'Evening (3:00 PM - 6:00 PM)',
  ];

  final List<Map<String, dynamic>> _services = [
    {'name': 'Plumbing', 'icon': Icons.plumbing_rounded},
    {'name': 'Electrical', 'icon': Icons.lightbulb_outline_rounded},
    {'name': 'Masonry', 'icon': Icons.grid_view_rounded},
    {'name': 'General Maintenance', 'icon': Icons.build_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Banner - Renovation Van
          _buildRenovationVanHero(),

          const SizedBox(height: 20),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Services Offered',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 12),

                // Services Grid (2x2 grid for 4 services)
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 2.3,
                  ),
                  itemCount: _services.length,
                  itemBuilder: (context, index) {
                    final s = _services[index];
                    final name = s['name'] as String;
                    final icon = s['icon'] as IconData;

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          final match = _serviceOptions.firstWhere(
                            (opt) => opt.toLowerCase().contains(name.toLowerCase()),
                            orElse: () => _serviceOptions.first,
                          );
                          _selectedServiceRequired = match;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.cardWhite,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: AppColors.borderLight,
                            width: 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: AppColors.primaryYellow,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primaryYellow.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  ),
                                ],
                              ),
                              child: Icon(
                                icon,
                                color: AppColors.darkCharcoal,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                name,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 24),

                // Book Your Renovation Van Form
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.cardWhite,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.borderLight),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.10),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 3,
                              height: 18,
                              color: AppColors.primaryYellow,
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Book Your Renovation Van',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Client Name
                        TextFormField(
                          controller: _nameController,
                          decoration: const InputDecoration(
                            labelText: 'Client Name *',
                            prefixIcon: Icon(Icons.person_outline_rounded, size: 20),
                          ),
                          validator: (v) => v == null || v.isEmpty ? 'Please enter name' : null,
                        ),
                        const SizedBox(height: 12),

                        // Phone Number
                        TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(10),
                            TextInputFormatter.withFunction((oldValue, newValue) {
                              if (newValue.text.startsWith('0')) {
                                return oldValue;
                              }
                              return newValue;
                            }),
                          ],
                          decoration: const InputDecoration(
                            labelText: 'Phone Number *',
                            hintText: 'e.g. 9876543210',
                            prefixIcon: Icon(Icons.phone_outlined, size: 20),
                          ),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'Please enter phone number';
                            if (v.trim().startsWith('0')) return 'Phone number cannot start with 0';
                            if (v.trim().length != 10) return 'Phone number must be exactly 10 digits';
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),

                        // Location Dropdown
                        DropdownButtonFormField<String>(
                          initialValue: _selectedLocation,
                          isExpanded: true,
                          decoration: const InputDecoration(
                            labelText: 'Location',
                            prefixIcon: Icon(Icons.location_on_outlined, size: 20),
                          ),
                          items: _locations.map((loc) {
                            return DropdownMenuItem(
                              value: loc,
                              child: Text(
                                loc,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedLocation = val);
                          },
                        ),
                        const SizedBox(height: 12),

                        // Service Required Dropdown
                        DropdownButtonFormField<String>(
                          initialValue: _selectedServiceRequired,
                          isExpanded: true,
                          decoration: const InputDecoration(
                            labelText: 'Service Required',
                            prefixIcon: Icon(Icons.build_outlined, size: 20),
                          ),
                          items: _serviceOptions.map((serv) {
                            return DropdownMenuItem(
                              value: serv,
                              child: Text(
                                serv,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedServiceRequired = val);
                          },
                        ),
                        const SizedBox(height: 12),

                        // Date & Time Selectors Row / Vertical
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () async {
                                  final picked = await showDatePicker(
                                    context: context,
                                    initialDate: _selectedDate,
                                    firstDate: DateTime.now(),
                                    lastDate: DateTime.now().add(const Duration(days: 60)),
                                  );
                                  if (picked != null) {
                                    setState(() => _selectedDate = picked);
                                  }
                                },
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
                                ),
                                icon: const Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.darkYellow),
                                label: Text(
                                  '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                                  style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: AppColors.textPrimary),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Preferred Time Slot Dropdown
                        DropdownButtonFormField<String>(
                          initialValue: _selectedTimeSlot,
                          isExpanded: true,
                          decoration: const InputDecoration(
                            labelText: 'Preferred Time Slot',
                            prefixIcon: Icon(Icons.access_time_rounded, size: 20),
                          ),
                          items: _timeSlots.map((slot) {
                            return DropdownMenuItem(
                              value: slot,
                              child: Text(
                                slot,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedTimeSlot = val);
                          },
                        ),

                        const SizedBox(height: 12),

                        // Additional Notes
                        TextFormField(
                          controller: _notesController,
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'Additional Notes (Optional)',
                            prefixIcon: Icon(Icons.description_outlined, size: 18),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Book Appointment CTA
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isSubmitting
                                ? null
                                : () async {
                                    if (_formKey.currentState!.validate()) {
                                      setState(() {
                                        _isSubmitting = true;
                                      });
                                      try {
                                        await FirebaseService().submitRenovationAppointment(
                                          customerName: _nameController.text,
                                          phone: _phoneController.text,
                                          location: _selectedLocation,
                                          serviceRequired: _selectedServiceRequired,
                                          timeSlot: _selectedTimeSlot,
                                          appointmentDate: _selectedDate,
                                          notes: _notesController.text,
                                        );
                                      } catch (e) {
                                        debugPrint('Appointment booking error: $e');
                                      } finally {
                                        if (mounted) {
                                          setState(() {
                                            _isSubmitting = false;
                                          });
                                        }
                                      }
                                      if (!context.mounted) return;
                                      _showConfirmationModal(context);
                                    }
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryYellow,
                              foregroundColor: AppColors.darkCharcoal,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: _isSubmitting
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.darkCharcoal),
                                  )
                                : const Text('Book Appointment', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRenovationVanHero() {
    final imagePaths = ['assets/renovan_side.png', 'assets/renovan_front.png'];
    final imageLabels = ['Side View', 'Front View'];

    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primaryYellow, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // RenoVan Real Image Showcase
          Stack(
            children: [
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Container(
                  key: ValueKey<int>(_selectedVanImage),
                  height: 230,
                  width: double.infinity,
                  color: const Color(0xFFE5E7EB),
                  child: Image.asset(
                    imagePaths[_selectedVanImage],
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Image.asset(
                        'assets/header.png',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: AppColors.darkCharcoal,
                            child: const Center(
                              child: Icon(Icons.directions_bus_rounded, size: 60, color: AppColors.primaryYellow),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.darkCharcoal,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primaryYellow),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.directions_bus_rounded, color: AppColors.primaryYellow, size: 14),
                      SizedBox(width: 6),
                      Text(
                        'RENOVAN • HOME ON WHEELS',
                        style: TextStyle(
                          color: AppColors.primaryYellow,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // View Switcher Overlay Buttons (Side View vs Front View)
              Positioned(
                bottom: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.darkCharcoal.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(2, (idx) {
                      final isSelected = _selectedVanImage == idx;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedVanImage = idx),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primaryYellow : Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            imageLabels[idx],
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? AppColors.darkCharcoal : Colors.white70,
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
              ),
            ],
          ),

          // Content & Slogan Details
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.darkCharcoal,
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'One Call. One Van. RenoVan',
                      style: TextStyle(
                        color: AppColors.primaryYellow,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'TN 42 U 1659',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 4),
                Text(
                  'From Leak to Light, We make it Right',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Doorstep maintenance & renovation: Electrical, Plumbing, Masonry Work & General Repairs.',
                  style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showConfirmationModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: const BoxDecoration(
                  color: AppColors.primaryYellow,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded, color: AppColors.darkCharcoal, size: 36),
              ),
              const SizedBox(height: 16),
              const Text(
                'Appointment Request Sent!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Our Renovation Van technician will reach your site at $_selectedLocation on ${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}.',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Great, Got it!', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
