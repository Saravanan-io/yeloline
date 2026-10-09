import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';

class AddPurchaseScreen extends StatefulWidget {
  const AddPurchaseScreen({super.key});

  @override
  State<AddPurchaseScreen> createState() => _AddPurchaseScreenState();
}

class _AddPurchaseScreenState extends State<AddPurchaseScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedSite;
  String _department = 'Masonry';
  String _supplierName = 'Shree Ganesh Bricks';
  String _product = 'Red Bricks';
  String? _enteredBy;
  DateTime _purchaseDate = DateTime.now();

  final List<String> _departmentList = ['Masonry', 'Electrical', 'Plumbing', 'Shuttering', 'Tiles', 'Carpentry', 'Painting'];
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
  final List<String> _productList = ['Red Bricks', '53 Grade OPC Cement', '12mm Steel Rods', 'Vitrified Floor Tiles 2x2'];

  final _totalAmountController = TextEditingController();

  double get _totalPurchase => double.tryParse(_totalAmountController.text.replaceAll(',', '')) ?? 0.0;

  @override
  void initState() {
    super.initState();
    _totalAmountController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _totalAmountController.dispose();
    super.dispose();
  }

  Future<void> _showAddDepartmentDialog() async {
    final controller = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.foundation_rounded, color: AppColors.darkCharcoal),
            SizedBox(width: 8),
            Text('Add New Department', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Enter department name',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryYellow, foregroundColor: AppColors.darkCharcoal),
            onPressed: () {
              final val = controller.text.trim();
              if (val.isNotEmpty) Navigator.pop(ctx, val);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      setState(() {
        if (!_departmentList.contains(result)) {
          _departmentList.add(result);
        }
        _department = result;
      });
    }
  }

  Future<void> _showAddSupplierDialog() async {
    final controller = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.store_rounded, color: AppColors.darkCharcoal),
            SizedBox(width: 8),
            Text('Add New Supplier', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Enter supplier name',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryYellow, foregroundColor: AppColors.darkCharcoal),
            onPressed: () {
              final val = controller.text.trim();
              if (val.isNotEmpty) Navigator.pop(ctx, val);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      setState(() {
        if (!_supplierList.contains(result)) {
          _supplierList.add(result);
        }
        _supplierName = result;
      });
    }
  }

  Future<void> _showAddProductDialog() async {
    final controller = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.inventory_2_rounded, color: AppColors.darkCharcoal),
            SizedBox(width: 8),
            Text('Add New Product / Material', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Enter product or material name',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryYellow, foregroundColor: AppColors.darkCharcoal),
            onPressed: () {
              final val = controller.text.trim();
              if (val.isNotEmpty) Navigator.pop(ctx, val);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      setState(() {
        if (!_productList.contains(result)) {
          _productList.add(result);
        }
        _product = result;
      });
    }
  }

  Future<void> _savePurchase() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSite == null || _selectedSite!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a site')),
      );
      return;
    }

    try {
      final poId = 'PO-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
      final dateStr = '${_purchaseDate.year}-${_purchaseDate.month.toString().padLeft(2, '0')}-${_purchaseDate.day.toString().padLeft(2, '0')}';
      await FirebaseFirestore.instance.collection('purchases').doc(poId).set({
        'purchase_id': poId,
        'site_name': _selectedSite,
        'department': _department,
        'vendor_name': _supplierName,
        'material_category': _product,
        'order_date': dateStr,
        'total_amount': _totalPurchase,
        'amount_paid': 0,
        'entered_by': _enteredBy ?? 'Suriya Prakash',
        'delivery_status': 'Ordered',
        'payment_status': 'Unpaid',
        'created_at': FieldValue.serverTimestamp(),
      });

      _totalAmountController.clear();

      if (mounted) {
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
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving purchase: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  String _formatNumber(double numVal) {
    final intVal = numVal.toInt();
    final str = intVal.toString();
    if (str.length <= 3) return str;
    final last3 = str.substring(str.length - 3);
    final rest = str.substring(0, str.length - 3);
    final parts = <String>[];
    var pos = rest.length;
    while (pos > 0) {
      final start = (pos - 2) < 0 ? 0 : pos - 2;
      parts.insert(0, rest.substring(start, pos));
      pos -= 2;
    }
    return '${parts.join(',')},$last3';
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
          'Material Purchase Entry',
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

                // Main Form Card Container
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
                          icon: Icons.location_on_rounded,
                          onChanged: (val) => setState(() => _selectedSite = val!),
                        ),
                        const SizedBox(height: 16),

                        // Department
                        _buildLabel('Department'),
                        _buildSearchableDropdown(
                          title: 'Select Department',
                          value: _department,
                          items: _departmentList,
                          icon: Icons.foundation_rounded,
                          onChanged: (val) => setState(() => _department = val),
                          onAddNew: _showAddDepartmentDialog,
                          addNewLabel: '+ Add New Department',
                        ),
                        const SizedBox(height: 16),

                        // Supplier Name
                        _buildLabel('Supplier Name'),
                        _buildSearchableDropdown(
                          title: 'Select Supplier Name',
                          value: _supplierName,
                          items: _supplierList,
                          icon: Icons.store_rounded,
                          onChanged: (val) => setState(() => _supplierName = val),
                          onAddNew: _showAddSupplierDialog,
                          addNewLabel: '+ Add New Supplier',
                        ),
                        const SizedBox(height: 16),

                        // Product / Material
                        _buildLabel('Product / Material'),
                        _buildSearchableDropdown(
                          title: 'Select Product / Material',
                          value: _product,
                          items: _productList,
                          icon: Icons.inventory_2_rounded,
                          onChanged: (val) => setState(() => _product = val),
                          onAddNew: _showAddProductDialog,
                          addNewLabel: '+ Add New Product',
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

                        // Total Purchase Amount (₹)
                        _buildLabel('Total Purchase Amount (₹)'),
                        TextFormField(
                          controller: _totalAmountController,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                          decoration: _inputDecoration('Enter total amount', Icons.currency_rupee_rounded),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return 'Please enter total amount';
                            final val = double.tryParse(v.replaceAll(',', ''));
                            if (val == null || val <= 0) return 'Enter a valid amount';
                            return null;
                          },
                        ),
                        const SizedBox(height: 20),

                        // PURCHASE SUMMARY CARD
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.lightYellowBg,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.primaryYellow),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'TOTAL PURCHASE ORDER',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5),
                              ),
                              Text(
                                '₹${_formatNumber(_totalPurchase)}',
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.darkCharcoal),
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
                    Text(hintText, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textMuted)),
                  ],
                )
              : null,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.darkCharcoal),
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
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

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textMuted),
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
                  value ?? title,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: AppColors.textSecondary),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 8),
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
          Expanded(
            child: filteredItems.isEmpty
                ? const Center(
                    child: Text('No matching options found', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
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
                        leading: Icon(widget.icon, size: 20, color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary),
                        title: Text(
                          item,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                            color: isSelected ? AppColors.darkCharcoal : AppColors.textPrimary,
                          ),
                        ),
                        trailing: isSelected ? const Icon(Icons.check_circle_rounded, color: AppColors.darkCharcoal, size: 20) : null,
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
