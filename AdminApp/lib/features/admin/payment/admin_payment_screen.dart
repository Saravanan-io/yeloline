import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';

class AdminPaymentScreen extends StatefulWidget {
  const AdminPaymentScreen({super.key});

  @override
  State<AdminPaymentScreen> createState() => _AdminPaymentScreenState();
}

class _AdminPaymentScreenState extends State<AdminPaymentScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedSite;
  String? _selectedClient;
  String _paymentMode = 'Cash';
  String? _receivedBy;
  DateTime _paymentDate = DateTime.now();

  final _amountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _amountController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _savePayment() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSite == null || _selectedSite!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a site')),
      );
      return;
    }

    final amountNum = double.tryParse(_amountController.text.replaceAll(',', '')) ?? 0.0;
    try {
      final payId = 'PAY-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
      final dateStr = '${_paymentDate.year}-${_paymentDate.month.toString().padLeft(2, '0')}-${_paymentDate.day.toString().padLeft(2, '0')}';

      await FirebaseFirestore.instance.collection('payments').doc(payId).set({
        'payment_id': payId,
        'site_name': _selectedSite,
        'client_name': _selectedClient ?? '',
        'amount_received': amountNum,
        'payment_date': dateStr,
        'payment_mode': _paymentMode,
        'received_by': _receivedBy ?? 'Suriya Prakash',
        'entered_by': _receivedBy ?? 'Suriya Prakash',
        'created_at': FieldValue.serverTimestamp(),
      });

      _amountController.clear();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white),
                SizedBox(width: 8),
                Text('Payment recorded successfully!'),
              ],
            ),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving payment: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('sites').snapshots(),
      builder: (context, sitesSnap) {
        return StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance.collection('payments').snapshots(),
          builder: (context, paymentsSnap) {
            final siteDocs = sitesSnap.data?.docs ?? [];
            final siteList = siteDocs.map((d) {
              final m = d.data() as Map<String, dynamic>;
              return (m['site_name'] ?? m['title'] ?? m['site_id'] ?? d.id).toString();
            }).toList();

            if (siteList.isNotEmpty && (_selectedSite == null || !siteList.contains(_selectedSite))) {
              _selectedSite = siteList.first;
            }

            Map<String, dynamic>? selectedSiteData;
            if (siteDocs.isNotEmpty && _selectedSite != null) {
              dynamic matchDoc;
              for (final d in siteDocs) {
                final m = d.data() as Map<String, dynamic>;
                if ((m['site_name'] ?? m['title'] ?? m['site_id'] ?? d.id).toString() == _selectedSite) {
                  matchDoc = d;
                  break;
                }
              }
              matchDoc ??= siteDocs.first;
              selectedSiteData = matchDoc.data() as Map<String, dynamic>?;
            }

            final clientName = (selectedSiteData?['client_name'] ?? 'Client').toString();
            if (_selectedClient == null || _selectedClient != clientName) {
              _selectedClient = clientName;
            }

            return SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header Title
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Client Collections',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Payment Received',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Record client payments and update receivables',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Main Form Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.cardWhite,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 12, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Select Site
                          _buildLabel('Select Site'),
                          _buildDropdown(
                            value: _selectedSite ?? (siteList.isNotEmpty ? siteList.first : 'No sites available'),
                            items: siteList.isNotEmpty ? siteList : ['No sites available'],
                            icon: Icons.business_rounded,
                            onChanged: (val) => setState(() {
                              _selectedSite = val!;
                            }),
                          ),
                          const SizedBox(height: 16),

                          // Client
                          _buildLabel('Client'),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.person_outline_rounded, size: 20, color: AppColors.darkCharcoal),
                                const SizedBox(width: 10),
                                Text(
                                  _selectedClient ?? 'Client',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Date
                          _buildLabel('Date'),
                          InkWell(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _paymentDate,
                                firstDate: DateTime(2020),
                                lastDate: DateTime(2030),
                              );
                              if (picked != null) setState(() => _paymentDate = picked);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                              decoration: BoxDecoration(
                                color: AppColors.cardWhite,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.borderLight),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today_rounded, size: 18, color: AppColors.textSecondary),
                                      const SizedBox(width: 10),
                                      Text(
                                        '${_paymentDate.day.toString().padLeft(2, '0')}/${_paymentDate.month.toString().padLeft(2, '0')}/${_paymentDate.year}',
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                                      ),
                                    ],
                                  ),
                                  const Icon(Icons.edit_calendar_rounded, size: 18, color: AppColors.textSecondary),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Amount Received
                          _buildLabel('Amount Received (₹)'),
                          TextFormField(
                            controller: _amountController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            decoration: _inputDecoration('e.g. 50,000', Icons.currency_rupee_rounded),
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) return 'Please enter amount received';
                              if (double.tryParse(val.replaceAll(',', '')) == null) return 'Enter a valid number';
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          // Payment Mode Segmented Selector
                          _buildLabel('Payment Mode'),
                          Row(
                            children: [
                              _buildModeOption('Cash', Icons.payments_rounded),
                              const SizedBox(width: 8),
                              _buildModeOption('GPay / UPI', Icons.qr_code_rounded),
                              const SizedBox(width: 8),
                              _buildModeOption('Bank', Icons.account_balance_rounded),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Received By Dropdown
                          _buildLabel('Received By'),
                          _buildDropdown(
                            value: _receivedBy ?? 'Suriya Prakash',
                            items: const ['Suriya Prakash', 'Bala'],
                            icon: Icons.person_rounded,
                            onChanged: (val) => setState(() => _receivedBy = val),
                          ),
                          const SizedBox(height: 24),

                          // Save Payment Button
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _savePayment,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryYellow,
                                foregroundColor: AppColors.darkCharcoal,
                                elevation: 3,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.assignment_turned_in_rounded, size: 20),
                                  SizedBox(width: 8),
                                  Text('Save Payment', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required List<String> items,
    required IconData icon,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: items.contains(value) ? value : (items.isNotEmpty ? items.first : null),
          isExpanded: true,
          icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.darkCharcoal),
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
          onChanged: onChanged,
          items: items.map((item) {
            return DropdownMenuItem<String>(
              value: item,
              child: Row(
                children: [
                  Icon(icon, size: 18, color: AppColors.darkCharcoal),
                  const SizedBox(width: 10),
                  Text(item),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildModeOption(String label, IconData icon) {
    final isSelected = _paymentMode == label;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _paymentMode = label),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryYellow : AppColors.backgroundLight,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.darkYellow : AppColors.borderLight,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 18, color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(fontSize: 14, color: AppColors.textMuted),
      prefixIcon: Icon(icon, color: AppColors.textSecondary, size: 18),
      filled: true,
      fillColor: AppColors.cardWhite,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5)),
    );
  }
}
