import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class AdminExpenseScreen extends StatefulWidget {
  const AdminExpenseScreen({super.key});

  @override
  State<AdminExpenseScreen> createState() => _AdminExpenseScreenState();
}

class _AdminExpenseScreenState extends State<AdminExpenseScreen> {
  final _formKey = GlobalKey<FormState>();

  String _selectedSite = 'Skyline Residency, Ahmedabad';
  String _selectedCategory = 'Masonry';
  String _expenseType = 'Labour';
  String _paymentMode = 'Cash';
  String? _enteredBy;
  String? _selectedLabour;
  String? _selectedSupplier;
  DateTime _selectedDate = DateTime.now();

  final _amountController = TextEditingController();
  final _noteController = TextEditingController();

  final List<String> _siteList = [
    'Skyline Residency, Ahmedabad',
    'Thindal Residence',
    'Emerald Heights',
  ];

  final List<String> _categoryList = [
    'Masonry',
    'Electrical',
    'Plumbing',
    'Shuttering',
    'Tiles',
    'Carpentry',
    'Painting',
  ];

  final List<String> _labourList = [
    'Ramesh (Mason Master)',
    'Suresh (Helper)',
    'Kumar (Electrician)',
    'Murugan (Plumber)',
    'Venkatesh (Carpenter)',
    'Selvam (Painter)',
    'Prakash (Bar Bender)',
    'Karthik (Tile Fixer)',
    'Anbu (Welder)',
    'Manikandan (Centering Worker)',
  ];

  final List<String> _supplierList = [
    'Shree Ganesh Bricks',
    'Ultratech Cement Supplies',
    'Tata Tiscon Steel',
    'Kajaria Tiles Center',
    'Asian Paints World',
    'L&T Electrical Depot',
    'Supreme Pipes & Fittings',
    'Jaguar Hardware Store',
  ];

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _saveExpense() {
    if (!_formKey.currentState!.validate()) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.white),
            SizedBox(width: 8),
            Text('Expense recorded successfully!'),
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
          // Screen Title Header
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Expense Entry',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
              ),
              SizedBox(height: 2),
              Text(
                'Add Expense',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              SizedBox(height: 2),
              Text(
                'Quickly record labour & other expenses',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Form Card Container
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
                  _buildDropdown<String>(
                    value: _selectedSite,
                    items: _siteList,
                    icon: Icons.business_rounded,
                    onChanged: (val) => setState(() => _selectedSite = val!),
                  ),
                  const SizedBox(height: 16),

                  // Date
                  _buildLabel('Date'),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                      );
                      if (picked != null) setState(() => _selectedDate = picked);
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
                                '${_selectedDate.day} ${_getMonthName(_selectedDate.month)} ${_selectedDate.year}',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                              ),
                            ],
                          ),
                          const Icon(Icons.calendar_today_rounded, size: 18, color: AppColors.textSecondary),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Select Work Category
                  _buildLabel('Select Work Category'),
                  _buildDropdown<String>(
                    value: _selectedCategory,
                    items: _categoryList,
                    icon: Icons.category_rounded,
                    onChanged: (val) => setState(() => _selectedCategory = val!),
                  ),
                  const SizedBox(height: 16),

                  // Expense Type (Labour / Other Expense Toggle)
                  _buildLabel('Expense Type'),
                  Row(
                    children: [
                      Expanded(child: _buildToggleButton('Labour', Icons.groups_rounded, _expenseType == 'Labour', () => setState(() => _expenseType = 'Labour'))),
                      const SizedBox(width: 10),
                      Expanded(child: _buildToggleButton('Other Expense', Icons.inventory_2_rounded, _expenseType == 'Other Expense', () => setState(() => _expenseType = 'Other Expense'))),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Dynamic Searchable Dropdown for Labour or Supplier Name
                  if (_expenseType == 'Labour') ...[
                    _buildLabel('Labour'),
                    _buildSearchableDropdown(
                      title: 'Select Labour',
                      value: _selectedLabour,
                      hintText: 'Select Labour',
                      items: _labourList,
                      icon: Icons.person_search_rounded,
                      onChanged: (val) => setState(() => _selectedLabour = val),
                    ),
                    const SizedBox(height: 16),
                  ] else if (_expenseType == 'Other Expense') ...[
                    _buildLabel('Supplier Name'),
                    _buildSearchableDropdown(
                      title: 'Select Supplier Name',
                      value: _selectedSupplier,
                      hintText: 'Select Supplier Name',
                      items: _supplierList,
                      icon: Icons.store_rounded,
                      onChanged: (val) => setState(() => _selectedSupplier = val),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Payment Mode (Cash, GPay, Bank Toggle)
                  _buildLabel('Payment Mode'),
                  Row(
                    children: [
                      Expanded(child: _buildToggleButton('Cash', Icons.payments_rounded, _paymentMode == 'Cash', () => setState(() => _paymentMode = 'Cash'))),
                      const SizedBox(width: 8),
                      Expanded(child: _buildToggleButton('GPay', Icons.qr_code_rounded, _paymentMode == 'GPay', () => setState(() => _paymentMode = 'GPay'))),
                      const SizedBox(width: 8),
                      Expanded(child: _buildToggleButton('Bank', Icons.account_balance_rounded, _paymentMode == 'Bank', () => setState(() => _paymentMode = 'Bank'))),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Amount (₹)
                  _buildLabel('Amount (₹)'),
                  TextFormField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    decoration: _inputDecoration('Enter amount', Icons.currency_rupee_rounded),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Please enter amount' : null,
                  ),
                  const SizedBox(height: 16),

                  // Description or Note
                  _buildLabel('Description or Note'),
                  TextFormField(
                    controller: _noteController,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    decoration: _inputDecoration('Enter note', Icons.note_alt_rounded),
                  ),
                  const SizedBox(height: 16),

                  // Entered By Dropdown
                  _buildLabel('Entered By'),
                  _buildDropdown<String>(
                    value: _enteredBy,
                    hintText: 'Select Name',
                    items: const ['Suriya Prakash', 'Bala'],
                    icon: Icons.badge_rounded,
                    onChanged: (val) => setState(() => _enteredBy = val),
                  ),

                  const SizedBox(height: 20),

                  // Notice Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.lightYellowBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.primaryYellow.withValues(alpha: 0.6)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.info_rounded, color: AppColors.darkCharcoal, size: 20),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'This screen is for labour and other expenses. Material purchases are entered separately in Purchase tab.',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _saveExpense,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryYellow,
                        foregroundColor: AppColors.darkCharcoal,
                        elevation: 3,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_circle_outline_rounded, size: 20),
                          SizedBox(width: 8),
                          Text('Add Expense', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
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
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
      ),
    );
  }

  Widget _buildDropdown<T>({
    T? value,
    required List<T> items,
    required IconData icon,
    String? hintText,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
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
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          onChanged: onChanged,
          items: items.map((item) {
            return DropdownMenuItem<T>(
              value: item,
              child: Row(
                children: [
                  Icon(icon, size: 18, color: AppColors.darkCharcoal),
                  const SizedBox(width: 10),
                  Text(item.toString()),
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
          color: isSelected ? AppColors.primaryYellow : AppColors.cardWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? AppColors.primaryYellow : AppColors.borderLight, width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 15, color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary,
              ),
            ),
          ],
        ),
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

  String _getMonthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  Widget _buildSearchableDropdown({
    required String title,
    required String? value,
    required String hintText,
    required List<String> items,
    required IconData icon,
    required ValueChanged<String> onChanged,
  }) {
    return InkWell(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (ctx) {
            return _SearchablePickerSheet(
              title: title,
              items: items,
              selectedValue: value,
              icon: icon,
              onSelect: onChanged,
            );
          },
        );
      },
      borderRadius: BorderRadius.circular(12),
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
                Icon(icon, size: 18, color: AppColors.darkCharcoal),
                const SizedBox(width: 10),
                Text(
                  value ?? hintText,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: value != null ? FontWeight.w700 : FontWeight.w400,
                    color: value != null ? AppColors.textPrimary : AppColors.textMuted,
                  ),
                ),
              ],
            ),
            const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.darkCharcoal),
          ],
        ),
      ),
    );
  }
}

class _SearchablePickerSheet extends StatefulWidget {
  final String title;
  final List<String> items;
  final String? selectedValue;
  final IconData icon;
  final ValueChanged<String> onSelect;

  const _SearchablePickerSheet({
    required this.title,
    required this.items,
    required this.selectedValue,
    required this.icon,
    required this.onSelect,
  });

  @override
  State<_SearchablePickerSheet> createState() => _SearchablePickerSheetState();
}

class _SearchablePickerSheetState extends State<_SearchablePickerSheet> {
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filteredItems = widget.items
        .where((item) => item.toLowerCase().contains(_query.toLowerCase()))
        .toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
      decoration: const BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 12,
        left: 16,
        right: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Title & Close Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: AppColors.textSecondary),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Search Box
          TextField(
            controller: _searchController,
            autofocus: false,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Search ${widget.title.replaceAll('Select ', '')}...',
              hintStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textMuted),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
              suffixIcon: _query.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textSecondary),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _query = '');
                      },
                    )
                  : null,
              filled: true,
              fillColor: AppColors.lightYellowBg.withValues(alpha: 0.4),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5)),
            ),
            onChanged: (val) => setState(() => _query = val),
          ),

          const SizedBox(height: 12),

          // List Items
          Expanded(
            child: filteredItems.isEmpty
                ? const Center(
                    child: Text(
                      'No matching options found',
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                    ),
                  )
                : ListView.separated(
                    itemCount: filteredItems.length,
                    separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderLight),
                    itemBuilder: (context, index) {
                      final item = filteredItems[index];
                      final isSelected = item == widget.selectedValue;

                      return ListTile(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        tileColor: isSelected ? AppColors.lightYellowBg : null,
                        leading: Icon(
                          widget.icon,
                          size: 20,
                          color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary,
                        ),
                        title: Text(
                          item,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                            color: isSelected ? AppColors.darkCharcoal : AppColors.textPrimary,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check_circle_rounded, color: AppColors.darkCharcoal, size: 20)
                            : null,
                        onTap: () {
                          widget.onSelect(item);
                          Navigator.pop(context);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
