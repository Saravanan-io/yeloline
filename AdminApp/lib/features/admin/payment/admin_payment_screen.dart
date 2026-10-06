import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class AdminPaymentScreen extends StatefulWidget {
  const AdminPaymentScreen({super.key});

  @override
  State<AdminPaymentScreen> createState() => _AdminPaymentScreenState();
}

class _AdminPaymentScreenState extends State<AdminPaymentScreen> {
  final _formKey = GlobalKey<FormState>();

  String _selectedSite = 'Skyline Residency';
  String _selectedClient = 'Rahul Patel';
  String _paymentMode = 'Cash';
  DateTime _paymentDate = DateTime.now();

  final _amountController = TextEditingController();
  final _refNoController = TextEditingController();
  final _notesController = TextEditingController();

  static const double _projectValue = 3850000;
  static const double _totalReceivedBefore = 1950000;

  double get _currentPayment => double.tryParse(_amountController.text.replaceAll(',', '')) ?? 0.0;
  double get _updatedTotalReceived => _totalReceivedBefore + _currentPayment;
  double get _remainingReceivable => (_projectValue - _updatedTotalReceived).clamp(0.0, double.infinity);

  String get _refHint {
    switch (_paymentMode) {
      case 'GPay / UPI':
        return 'Enter UPI Transaction ID / Ref No.';
      case 'Bank':
        return 'Enter UTR / Cheque No.';
      case 'Cash':
      default:
        return 'Enter Receipt / Voucher No.';
    }
  }

  @override
  void initState() {
    super.initState();
    _amountController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _amountController.dispose();
    _refNoController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _savePayment() {
    if (!_formKey.currentState!.validate()) return;

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

  @override
  Widget build(BuildContext context) {
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

          // Main Form Card (Matching Reference Image 1 & 3)
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
                    value: _selectedSite,
                    items: ['Skyline Residency', 'Thindal Residence', 'Emerald Heights'],
                    icon: Icons.business_rounded,
                    onChanged: (val) => setState(() => _selectedSite = val!),
                  ),
                  const SizedBox(height: 16),

                  // Client
                  _buildLabel('Client'),
                  _buildDropdown(
                    value: _selectedClient,
                    items: ['Rahul Patel', 'Mr. Rajkumar Thindal', 'Vikram Shah'],
                    icon: Icons.person_outline_rounded,
                    onChanged: (val) => setState(() => _selectedClient = val!),
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
                              const Icon(Icons.calendar_month_rounded, size: 18, color: AppColors.darkCharcoal),
                              const SizedBox(width: 10),
                              Text(
                                '${_paymentDate.day} ${_getMonthName(_paymentDate.month)} ${_paymentDate.year}',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                              ),
                            ],
                          ),
                          const Icon(Icons.calendar_today_rounded, size: 18, color: AppColors.textSecondary),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Amount Received (₹)
                  _buildLabel('Amount Received (₹)'),
                  TextFormField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.green.shade800),
                    decoration: _inputDecoration('Enter amount received', Icons.currency_rupee_rounded),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Please enter amount' : null,
                  ),
                  const SizedBox(height: 16),

                  // Payment Mode (Cash, GPay / UPI, Bank)
                  _buildLabel('Payment Mode'),
                  Row(
                    children: [
                      Expanded(child: _buildToggleButton('Cash', Icons.payments_rounded, _paymentMode == 'Cash', () => setState(() => _paymentMode = 'Cash'))),
                      const SizedBox(width: 8),
                      Expanded(child: _buildToggleButton('GPay / UPI', Icons.qr_code_rounded, _paymentMode == 'GPay / UPI', () => setState(() => _paymentMode = 'GPay / UPI'))),
                      const SizedBox(width: 8),
                      Expanded(child: _buildToggleButton('Bank', Icons.account_balance_rounded, _paymentMode == 'Bank', () => setState(() => _paymentMode = 'Bank'))),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Reference Number
                  _buildLabel('Reference Number'),
                  TextFormField(
                    controller: _refNoController,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
                    decoration: _inputDecoration(_refHint, Icons.pin_rounded),
                  ),
                  const SizedBox(height: 16),

                  // Notes
                  _buildLabel('Notes'),
                  TextFormField(
                    controller: _notesController,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
                    decoration: _inputDecoration('Enter note', Icons.note_alt_rounded),
                  ),

                  const SizedBox(height: 20),

                  // FINANCIAL SUMMARY CARD (Reference Image 1 & 3)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.cardWhite,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primaryYellow.withValues(alpha: 0.5)),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryYellow,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.analytics_rounded, size: 16, color: AppColors.darkCharcoal),
                                ),
                                const SizedBox(width: 8),
                                const Text(
                                  'FINANCIAL SUMMARY',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.5),
                                ),
                              ],
                            ),
                            const Row(
                              children: [
                                Text('View Details', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.darkYellow)),
                                Icon(Icons.chevron_right_rounded, size: 16, color: AppColors.darkYellow),
                              ],
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        _buildFinancialRow('Project Value', '₹${_formatNumber(_projectValue)}'),
                        _buildFinancialRow('Total Received Before', '₹${_formatNumber(_totalReceivedBefore)}'),
                        _buildFinancialRow('Current Payment', '₹${_formatNumber(_currentPayment)}', valueColor: Colors.green.shade700),
                        _buildFinancialRow('Updated Total Received', '₹${_formatNumber(_updatedTotalReceived)}'),
                        _buildFinancialRow('Remaining Receivable', '₹${_formatNumber(_remainingReceivable)}', valueColor: Colors.red.shade700),
                      ],
                    ),
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
          value: value,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.darkCharcoal),
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

  Widget _buildToggleButton(String label, IconData icon, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.darkCharcoal : AppColors.cardWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? AppColors.darkCharcoal : AppColors.borderLight, width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 15, color: isSelected ? AppColors.primaryYellow : AppColors.textSecondary),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFinancialRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: valueColor ?? AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AppColors.textMuted,
      ),
      prefixIcon: Icon(icon, color: AppColors.textSecondary, size: 18),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5)),
    );
  }

  String _formatNumber(double val) {
    return val.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},');
  }

  String _getMonthName(int month) {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    return months[(month - 1) % 12];
  }
}
