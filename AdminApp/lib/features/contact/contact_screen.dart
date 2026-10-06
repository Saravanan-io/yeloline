import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/firebase_service.dart';
import '../../core/utils/url_helper.dart';
import '../../widgets/icons/whatsapp_icon.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _contactController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _contactController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isSubmitting = true;
      });
      try {
        await FirebaseService().submitContactEnquiry(
          name: _nameController.text,
          contact: _contactController.text,
          message: _messageController.text,
        );
      } catch (e) {
        debugPrint('Error submitting contact enquiry: $e');
      } finally {
        if (mounted) {
          setState(() {
            _isSubmitting = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Message Sent Successfully to Yeloline!', style: TextStyle(fontWeight: FontWeight.w700)),
              backgroundColor: AppColors.darkCharcoal,
              behavior: SnackBarBehavior.floating,
            ),
          );
          _nameController.clear();
          _contactController.clear();
          _messageController.clear();
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Map<String, dynamic>>(
      stream: FirebaseService().streamCompanySettings(),
      builder: (context, snapshot) {
        final settings = snapshot.data ?? {};
        final phone = settings['company_phone']?.toString() ?? '+91 98765 43210';
        final whatsapp = settings['company_whatsapp']?.toString() ?? '+91 98765 43210';
        final officeAddress = settings['office_address']?.toString() ?? 'YeloLine Tower, Perundurai Road, Erode, Tamil Nadu 638011';

        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Get in Touch',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'We are here to discuss your upcoming construction project.',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),

              // Quick Action Cards
              Row(
                children: [
                  Expanded(
                    child: _buildContactCard(
                      context,
                      icon: Icons.phone_in_talk_rounded,
                      title: 'Call Us',
                      subtitle: phone,
                      color: AppColors.primaryYellow,
                      onTap: () => UrlHelper.makePhoneCall(phone.replaceAll(' ', '')),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildContactCard(
                      context,
                      customIcon: const WhatsAppIcon(size: 22, color: AppColors.darkCharcoal),
                      title: 'WhatsApp',
                      subtitle: whatsapp,
                      color: const Color(0xFF25D366),
                      onTap: () => UrlHelper.openWhatsApp(whatsapp.replaceAll(' ', '')),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Location Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        color: AppColors.lightYellowBg,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.location_on_rounded, color: AppColors.darkCharcoal, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Head Office Location',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            officeAddress,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary, height: 1.3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

          // Message Form with Strict Validation
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardWhite,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Send Us a Message',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _nameController,
                    style: const TextStyle(fontWeight: FontWeight.w400, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Your Name *',
                      labelStyle: const TextStyle(fontWeight: FontWeight.w500),
                      hintText: 'Enter full name',
                      hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13, fontWeight: FontWeight.w400),
                      prefixIcon: const Icon(Icons.person_outline_rounded),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _contactController,
                    style: const TextStyle(fontWeight: FontWeight.w400, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Phone / Email *',
                      labelStyle: const TextStyle(fontWeight: FontWeight.w500),
                      hintText: 'e.g. 9876543210 or name@example.com',
                      hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13, fontWeight: FontWeight.w400),
                      prefixIcon: const Icon(Icons.email_outlined),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Please enter phone or email';
                      final trimmed = v.trim();
                      if (RegExp(r'^\d+$').hasMatch(trimmed)) {
                        if (trimmed.startsWith('0')) return 'Phone number cannot start with 0';
                        if (trimmed.length != 10) return 'Phone number must be exactly 10 digits';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _messageController,
                    style: const TextStyle(fontWeight: FontWeight.w400, fontSize: 14),
                    maxLines: 3,
                    decoration: InputDecoration(
                      labelText: 'Your Message *',
                      labelStyle: const TextStyle(fontWeight: FontWeight.w500),
                      hintText: 'Type your message or project requirements...',
                      hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13, fontWeight: FontWeight.w400),
                      alignLabelWithHint: true,
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your message' : null,
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitForm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryYellow,
                        foregroundColor: AppColors.darkCharcoal,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.darkCharcoal),
                            )
                          : const Text('Send Message', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
      },
    );
  }

  Widget _buildContactCard(
    BuildContext context, {
    IconData? icon,
    Widget? customIcon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: customIcon ?? Icon(icon!, color: AppColors.darkCharcoal, size: 22),
            ),
            const SizedBox(height: 12),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            ),
            const SizedBox(height: 2),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(subtitle, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w400, color: AppColors.textSecondary)),
            ),
          ],
        ),
      ),
    );
  }
}
