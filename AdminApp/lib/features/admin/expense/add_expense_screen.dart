import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';

class AddExpenseScreen extends StatefulWidget {
  const AddExpenseScreen({super.key});

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedSite;
  String _selectedCategory = 'Masonry';
  String _expenseType = 'Labour';
  String _paymentMode = 'Cash';
  String? _enteredBy;
  String? _selectedLabour;
  String? _selectedSupplier;
  DateTime _selectedDate = DateTime.now();

  final _amountController = TextEditingController();

  final List<String> _categoryList = [
    'Masonry',
    'Shuttering',
    'Tiles',
    'Painting',
    'Doors and windows',
    'Carpentry',
    'Lathe Work',
    'Electrical',
    'Plumbing',
    'Engineer\'s Misc.',
    'Additional Work',
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
    super.dispose();
  }

  void _showAddLabourDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Add New Labour', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        content: TextField(
          controller: controller,
          autofocus: true,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: 'Enter worker name (e.g. Raju Master)',
            hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              final val = controller.text.trim();
              if (val.isNotEmpty) {
                setState(() {
                  if (!_labourList.contains(val)) {
                    _labourList.add(val);
                  }
                  _selectedLabour = val;
                });
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryYellow, foregroundColor: AppColors.darkCharcoal),
            child: const Text('Add', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showAddSupplierDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Add New Supplier', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        content: TextField(
          controller: controller,
          autofocus: true,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: 'Enter supplier name (e.g. Metro Steels)',
            hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              final val = controller.text.trim();
              if (val.isNotEmpty) {
                setState(() {
                  if (!_supplierList.contains(val)) {
                    _supplierList.add(val);
                  }
                  _selectedSupplier = val;
                });
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryYellow, foregroundColor: AppColors.darkCharcoal),
            child: const Text('Add', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _saveExpense() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSite == null || _selectedSite!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a site')),
      );
      return;
    }

    final enteredAmount = double.tryParse(_amountController.text.trim().replaceAll(',', '')) ?? 0.0;
    if (enteredAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount greater than 0')),
      );
      return;
    }

    try {
      final expId = 'EXP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
      final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
      final detailsNote = _expenseType == 'Labour'
          ? (_selectedLabour != null ? 'Labour: $_selectedLabour' : '')
          : (_selectedSupplier != null ? 'Supplier: $_selectedSupplier' : '');

      // 1. Record expense in Firestore 'expenses' collection
      await FirebaseFirestore.instance.collection('expenses').doc(expId).set({
        'expense_id': expId,
        'site_name': _selectedSite,
        'work_category': _selectedCategory,
        'category': _expenseType,
        'amount': enteredAmount,
        'date': dateStr,
        'payment_mode': _paymentMode,
        'entered_by': _enteredBy ?? 'Suriya Prakash',
        'supplier_name': _expenseType == 'Material' ? (_selectedSupplier ?? '') : '',
        'vendor_name': _expenseType == 'Material' ? (_selectedSupplier ?? '') : '',
        'notes': detailsNote,
        'created_at': FieldValue.serverTimestamp(),
      });


      // 2. Direct sync: Update site's budget_items & total_expense in 'sites' collection
      try {
        final sitesRef = FirebaseFirestore.instance.collection('sites');
        QuerySnapshot siteQuery = await sitesRef.where('site_name', isEqualTo: _selectedSite).limit(1).get();
        if (siteQuery.docs.isEmpty) {
          siteQuery = await sitesRef.where('title', isEqualTo: _selectedSite).limit(1).get();
        }
        if (siteQuery.docs.isEmpty) {
          siteQuery = await sitesRef.where('site_id', isEqualTo: _selectedSite).limit(1).get();
        }

        const defaultTitles = [
          'Masonry work expenses',
          'Shuttering work expenses',
          'Tiles work expenses',
          'Painting work expenses',
          'Doors and windows',
          'Lathe Work expenses',
          'Electrical work expenses',
          'Plumbing work expenses',
          "Engineer's Misc.",
          'Additional Work'
        ];

        for (final siteDoc in siteQuery.docs) {
          final data = siteDoc.data() as Map<String, dynamic>;
          final rawBudget = (data['budget_items'] as List<dynamic>?) ?? [];

          List<Map<String, dynamic>> updatedBudget = [];
          if (rawBudget.isNotEmpty) {
            updatedBudget = rawBudget.map((item) => Map<String, dynamic>.from(item as Map)).toList();
          } else {
            updatedBudget = List.generate(defaultTitles.length, (i) => {
              'sno': i + 1,
              'work_item': defaultTitles[i],
              'description': defaultTitles[i],
              'estimated_amount': 0,
              'expense_amount': 0,
              'balance': 0,
            });
          }

          // Find row matching _selectedCategory
          int matchedIdx = -1;
          for (int i = 0; i < updatedBudget.length; i++) {
            final desc = (updatedBudget[i]['work_item'] ?? updatedBudget[i]['description'] ?? '').toString().toLowerCase();
            final cat = _selectedCategory.toLowerCase();
            if (desc.contains(cat) || cat.contains(desc)) {
              matchedIdx = i;
              break;
            }
            if (_selectedCategory == 'Carpentry' && (desc.contains('door') || desc.contains('window'))) {
              matchedIdx = i;
              break;
            }
          }

          if (matchedIdx != -1) {
            final curExp = (num.tryParse(updatedBudget[matchedIdx]['expense_amount']?.toString() ?? '0') ?? 0).toDouble();
            final curEst = (num.tryParse(updatedBudget[matchedIdx]['estimated_amount']?.toString() ?? '0') ?? 0).toDouble();
            final newExp = curExp + enteredAmount;
            updatedBudget[matchedIdx]['expense_amount'] = newExp;
            updatedBudget[matchedIdx]['balance'] = curEst - newExp;
          }

          final newTotalExp = updatedBudget.fold<double>(0.0, (acc, it) =>
            acc + (num.tryParse(it['expense_amount']?.toString() ?? '0') ?? 0).toDouble()
          );

          await siteDoc.reference.update({
            'budget_items': updatedBudget,
            'total_expense': newTotalExp,
          });
        }
      } catch (siteErr) {
        debugPrint('Note: direct site budget_items update note: $siteErr');
      }

      _amountController.clear();

      if (mounted) {
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
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving expense: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: AppColors.darkCharcoal,
        scrolledUnderElevation: 0.0,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: Colors.white,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Add Expense',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.3,
          ),
        ),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('sites').snapshots(),
        builder: (context, snapshot) {
          final siteDocs = snapshot.data?.docs ?? [];
          final siteList = siteDocs.map((d) {
            final m = d.data() as Map<String, dynamic>;
            return (m['site_name'] ?? m['title'] ?? m['site_id'] ?? d.id).toString();
          }).toList();

          if (siteList.isNotEmpty && (_selectedSite == null || !siteList.contains(_selectedSite))) {
            _selectedSite = siteList.first;
          }

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
                      'Quickly record labour & material expenses',
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
                          value: _selectedSite ?? (siteList.isNotEmpty ? siteList.first : 'No sites available'),
                          items: siteList.isNotEmpty ? siteList : ['No sites available'],
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

                        // Expense Type (Labour / Material Toggle)
                        _buildLabel('Expense Type'),
                        Row(
                          children: [
                            Expanded(child: _buildToggleButton('Labour', Icons.groups_rounded, _expenseType == 'Labour', () => setState(() => _expenseType = 'Labour'))),
                            const SizedBox(width: 10),
                            Expanded(child: _buildToggleButton('Material', Icons.inventory_2_rounded, _expenseType == 'Material', () => setState(() => _expenseType = 'Material'))),
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
                            onAddNew: _showAddLabourDialog,
                            addNewLabel: '+ Add New Labour',
                          ),
                          const SizedBox(height: 16),
                        ] else if (_expenseType == 'Material') ...[
                          _buildLabel('Supplier Name'),
                          _buildSearchableDropdown(
                            title: 'Select Supplier Name',
                            value: _selectedSupplier,
                            hintText: 'Select Supplier Name',
                            items: _supplierList,
                            icon: Icons.store_rounded,
                            onChanged: (val) => setState(() => _selectedSupplier = val),
                            onAddNew: _showAddSupplierDialog,
                            addNewLabel: '+ Add New Supplier',
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
                                  'This screen records labour and site expenses. Material purchases can also be tracked directly in the Purchase tab.',
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
        },
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
    VoidCallback? onAddNew,
    String? addNewLabel,
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
              onAddNew: onAddNew,
              addNewLabel: addNewLabel,
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
  final VoidCallback? onAddNew;
  final String? addNewLabel;

  const _SearchablePickerSheet({
    required this.title,
    required this.items,
    required this.selectedValue,
    required this.icon,
    required this.onSelect,
    this.onAddNew,
    this.addNewLabel,
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

          // Add New Button if provided
          if (widget.onAddNew != null) ...[
            InkWell(
              onTap: () {
                Navigator.pop(context);
                widget.onAddNew!();
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.lightYellowBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primaryYellow, width: 1.5),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.add_circle_outline_rounded, color: AppColors.darkCharcoal, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      widget.addNewLabel ?? '+ Add New',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.darkCharcoal),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],

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
