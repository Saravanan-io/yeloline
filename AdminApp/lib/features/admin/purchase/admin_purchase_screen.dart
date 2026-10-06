import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class AdminPurchaseScreen extends StatefulWidget {
  const AdminPurchaseScreen({super.key});

  @override
  State<AdminPurchaseScreen> createState() => _AdminPurchaseScreenState();
}

class _AdminPurchaseScreenState extends State<AdminPurchaseScreen> {
  final _formKey = GlobalKey<FormState>();

  String _selectedSite = 'Skyline Residency';
  String _department = 'Masonry';
  String _supplierName = 'Shree Ganesh Bricks';
  String _product = 'Red Bricks';
  String? _enteredBy;
  DateTime _purchaseDate = DateTime.now();

  final _totalAmountController = TextEditingController();
  final _paidAmountController = TextEditingController();

  double get _totalPurchase => double.tryParse(_totalAmountController.text.replaceAll(',', '')) ?? 0.0;
  double get _amountPaid => double.tryParse(_paidAmountController.text.replaceAll(',', '')) ?? 0.0;
  double get _creditBalance => (_totalPurchase - _amountPaid).clamp(0.0, double.infinity);

  @override
  void initState() {
    super.initState();
    _totalAmountController.addListener(() => setState(() {}));
    _paidAmountController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _totalAmountController.dispose();
    _paidAmountController.dispose();
    super.dispose();
  }

  void _savePurchase() {
    if (!_formKey.currentState!.validate()) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.white),
            SizedBox(width: 8),
            Text('Material purchase saved successfully!'),
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
                'Inventory & Supply',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
              ),
              SizedBox(height: 2),
              Text(
                'Material Purchase Entry',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              SizedBox(height: 2),
              Text(
                'Record material purchase in a few taps',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Main Form Card Container (Matching Reference Image 2)
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
                    icon: Icons.location_on_rounded,
                    onChanged: (val) => setState(() => _selectedSite = val!),
                  ),
                  const SizedBox(height: 16),

                  // Department
                  _buildLabel('Department'),
                  _buildDropdown(
                    value: _department,
                    items: ['Masonry', 'Electrical', 'Plumbing', 'Shuttering', 'Tiles', 'Carpentry', 'Painting'],
                    icon: Icons.foundation_rounded,
                    onChanged: (val) => setState(() => _department = val!),
                  ),
                  const SizedBox(height: 16),

                  // Supplier Name
                  _buildLabel('Supplier Name'),
                  _buildDropdown(
                    value: _supplierName,
                    items: ['Shree Ganesh Bricks', 'Ultratech Cement Supplies', 'Tata Tiscon Steel', 'Kajaria Tiles'],
                    icon: Icons.store_rounded,
                    onChanged: (val) => setState(() => _supplierName = val!),
                  ),
                  const SizedBox(height: 16),

                  // Product / Material
                  _buildLabel('Product / Material'),
                  _buildDropdown(
                    value: _product,
                    items: ['Red Bricks', '53 Grade OPC Cement', '12mm Steel Rods', 'Vitrified Floor Tiles 2x2'],
                    icon: Icons.inventory_2_rounded,
                    onChanged: (val) => setState(() => _product = val!),
                  ),
                  const SizedBox(height: 16),

                  // Date of Purchase
                  _buildLabel('Date of Purchase'),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _purchaseDate,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                      );
                      if (picked != null) setState(() => _purchaseDate = picked);
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
                                '${_purchaseDate.day} ${_getMonthName(_purchaseDate.month)} ${_purchaseDate.year}',
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

                  // Total Purchase Amount (₹)
                  _buildLabel('Total Purchase Amount (₹)'),
                  TextFormField(
                    controller: _totalAmountController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                    decoration: _inputDecoration('Enter total amount', Icons.currency_rupee_rounded),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Please enter total purchase amount' : null,
                  ),
                  const SizedBox(height: 16),

                  // Amount Paid (₹)
                  _buildLabel('Amount Paid (₹)'),
                  TextFormField(
                    controller: _paidAmountController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Colors.green.shade800),
                    decoration: _inputDecoration('Enter amount paid', Icons.account_balance_wallet_rounded),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Please enter amount paid' : null,
                  ),

                  const SizedBox(height: 20),

                  // PURCHASE SUMMARY CARD (Reference Image 2)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.lightYellowBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.primaryYellow),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'PURCHASE SUMMARY',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.8),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _buildSummaryItem('Total Purchase', '₹${_formatNumber(_totalPurchase)}', AppColors.textPrimary),
                            Container(width: 1, height: 32, color: AppColors.primaryYellow.withValues(alpha: 0.5)),
                            _buildSummaryItem('Total Paid', '₹${_formatNumber(_amountPaid)}', Colors.green.shade800),
                            Container(width: 1, height: 32, color: AppColors.primaryYellow.withValues(alpha: 0.5)),
                            _buildSummaryItem('Credit Balance', '₹${_formatNumber(_creditBalance)}', AppColors.darkYellow),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Info Notice Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue.shade200),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.info_outline_rounded, color: Colors.blue, size: 20),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Credit Balance is auto-calculated. You can reduce this balance later using Payment section.',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Entered By Dropdown
                  _buildLabel('Entered By'),
                  _buildDropdown(
                    value: _enteredBy,
                    hintText: 'Select Name',
                    items: const ['Suriya Prakash', 'Bala'],
                    icon: Icons.person_rounded,
                    onChanged: (val) => setState(() => _enteredBy = val),
                  ),

                  const SizedBox(height: 24),

                  // Save Material Purchase Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _savePurchase,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryYellow,
                        foregroundColor: AppColors.darkCharcoal,
                        elevation: 3,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.save_rounded, size: 20),
                          SizedBox(width: 8),
                          Text('Save Material Purchase', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
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
    String? value,
    required List<String> items,
    required IconData icon,
    String? hintText,
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
          hint: hintText != null
              ? Row(
                  children: [
                    Icon(icon, size: 18, color: AppColors.textSecondary),
                    const SizedBox(width: 10),
                    Text(
                      hintText,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textMuted),
                    ),
                  ],
                )
              : null,
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

  Widget _buildSummaryItem(String label, String value, Color valueColor) {
    return Expanded(
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w400, color: AppColors.textSecondary)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: valueColor),
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
