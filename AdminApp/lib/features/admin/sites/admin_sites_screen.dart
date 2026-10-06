import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class DeptBudgetItem {
  final IconData icon;
  final String title;
  final String matBudget;
  final String labBudget;
  final String totalBudget;
  final String spent;
  final String remaining;
  final double progress;
  final Color statusColor;

  const DeptBudgetItem({
    required this.icon,
    required this.title,
    required this.matBudget,
    required this.labBudget,
    required this.totalBudget,
    required this.spent,
    required this.remaining,
    required this.progress,
    required this.statusColor,
  });
}

class AdminSitesScreen extends StatefulWidget {
  const AdminSitesScreen({super.key});

  @override
  State<AdminSitesScreen> createState() => _AdminSitesScreenState();
}

class _AdminSitesScreenState extends State<AdminSitesScreen> {
  String _selectedSite = 'Thindal Residence';
  bool _expandAll = false;
  final Set<int> _expandedIndices = {}; // All closed by default

  final List<String> _siteList = [
    'Thindal Residence',
    'Skyline Residency',
    'Emerald Heights',
  ];

  final List<DeptBudgetItem> _deptItems = const [
    DeptBudgetItem(
      icon: Icons.foundation_rounded,
      title: 'Masonry',
      matBudget: '₹92,60,000',
      labBudget: '₹49,90,000',
      totalBudget: '₹1,42,50,000',
      spent: '₹88,75,000',
      remaining: '₹53,75,000',
      progress: 0.62,
      statusColor: Colors.green,
    ),
    DeptBudgetItem(
      icon: Icons.electric_bolt_rounded,
      title: 'Electrical',
      matBudget: '₹45,00,000',
      labBudget: '₹40,50,000',
      totalBudget: '₹85,50,000',
      spent: '₹45,00,000',
      remaining: '₹40,50,000',
      progress: 0.53,
      statusColor: Colors.green,
    ),
    DeptBudgetItem(
      icon: Icons.plumbing_rounded,
      title: 'Plumbing',
      matBudget: '₹32,00,000',
      labBudget: '₹21,00,000',
      totalBudget: '₹53,00,000',
      spent: '₹38,00,000',
      remaining: '₹15,00,000',
      progress: 0.72,
      statusColor: Colors.green,
    ),
    DeptBudgetItem(
      icon: Icons.grid_on_rounded,
      title: 'Shuttering',
      matBudget: '₹22,80,000',
      labBudget: '₹19,50,000',
      totalBudget: '₹42,30,000',
      spent: '₹42,30,000',
      remaining: '₹0',
      progress: 1.00,
      statusColor: Colors.red,
    ),
    DeptBudgetItem(
      icon: Icons.window_rounded,
      title: 'Tiles',
      matBudget: '₹16,00,000',
      labBudget: '₹12,50,000',
      totalBudget: '₹28,50,000',
      spent: '₹18,75,000',
      remaining: '₹9,75,000',
      progress: 0.66,
      statusColor: Colors.green,
    ),
    DeptBudgetItem(
      icon: Icons.construction_rounded,
      title: 'Lathe / Fabrication',
      matBudget: '₹9,00,000',
      labBudget: '₹6,00,000',
      totalBudget: '₹15,00,000',
      spent: '₹7,50,000',
      remaining: '₹7,50,000',
      progress: 0.50,
      statusColor: Colors.green,
    ),
    DeptBudgetItem(
      icon: Icons.carpenter_rounded,
      title: 'Carpentry',
      matBudget: '₹12,00,000',
      labBudget: '₹9,00,000',
      totalBudget: '₹21,00,000',
      spent: '₹10,50,000',
      remaining: '₹10,50,000',
      progress: 0.50,
      statusColor: Colors.green,
    ),
    DeptBudgetItem(
      icon: Icons.format_paint_rounded,
      title: 'Painting',
      matBudget: '₹10,00,000',
      labBudget: '₹8,00,000',
      totalBudget: '₹18,00,000',
      spent: '₹9,00,000',
      remaining: '₹9,00,000',
      progress: 0.50,
      statusColor: Colors.green,
    ),
  ];

  void _toggleExpandAll() {
    setState(() {
      _expandAll = !_expandAll;
      if (_expandAll) {
        _expandedIndices.addAll(List.generate(_deptItems.length, (i) => i));
      } else {
        _expandedIndices.clear();
      }
    });
  }

  void _toggleItem(int index) {
    setState(() {
      if (_expandedIndices.contains(index)) {
        _expandedIndices.remove(index);
      } else {
        _expandedIndices.add(index);
      }
      _expandAll = _expandedIndices.length == _deptItems.length;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Screen Header & Site Dropdown Selector
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Site Financial Overview',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.cardWhite,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedSite,
                        icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.darkCharcoal, size: 24),
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedSite = val);
                        },
                        items: _siteList.map((site) {
                          return DropdownMenuItem(value: site, child: Text(site));
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Site Details & Budgets',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // 2. Main Site Summary Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardWhite,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.borderLight),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Site Profile Header + Progress Circle
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.network(
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
                        width: 72,
                        height: 72,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 72,
                            height: 72,
                            color: AppColors.lightYellowBg,
                            child: const Icon(Icons.apartment_rounded, color: AppColors.darkYellow, size: 36),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 8,
                            runSpacing: 4,
                            children: [
                              Text(
                                _selectedSite,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600, // Image 1: Medium Bold
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.3,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.green.shade200),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: const BoxDecoration(
                                        color: Colors.green,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      'Ongoing',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.green.shade800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          const Row(
                            children: [
                              Icon(Icons.person_outline_rounded, size: 14, color: AppColors.textSecondary),
                              SizedBox(width: 5),
                              Expanded(
                                child: Text(
                                  'Mr. Rajkumar Thindal',
                                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Row(
                            children: [
                              Icon(Icons.location_on_outlined, size: 14, color: AppColors.textSecondary),
                              SizedBox(width: 5),
                              Expanded(
                                child: Text(
                                  'Erode, Tamil Nadu • YLC-2024-17',
                                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Donut Progress Badge
                    Container(
                      width: 76,
                      height: 76,
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.lightYellowBg,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.primaryYellow, width: 2.5),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryYellow.withValues(alpha: 0.2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '62%',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkCharcoal, height: 1.0),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'On Track',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Colors.green),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Divider(height: 1, color: AppColors.borderLight),
                ),

                // Financial Overview Metrics Grid (Image 2: Heading Semi Bold, Amount Medium Bold)
                Column(
                  children: [
                    // Row 1: Quoted & Additional
                    Row(
                      children: [
                        Expanded(
                          child: _buildMetricTile(
                            label: 'Original Quote',
                            value: '₹3,85,000',
                            bgColor: const Color(0xFFF8FAFC),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildMetricTile(
                            label: 'Additional Work',
                            value: '₹45,000',
                            bgColor: const Color(0xFFF8FAFC),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Row 2: Revised & Received
                    Row(
                      children: [
                        Expanded(
                          child: _buildMetricTile(
                            label: 'Revised Budget',
                            value: '₹4,30,000',
                            valueColor: AppColors.darkYellow,
                            bgColor: AppColors.lightYellowBg,
                            borderColor: AppColors.primaryYellow.withValues(alpha: 0.5),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildMetricTile(
                            label: 'Total Received',
                            value: '₹2,15,000',
                            valueColor: Colors.blue.shade800,
                            bgColor: Colors.blue.shade50.withValues(alpha: 0.5),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Row 3: Spent & Receivable
                    Row(
                      children: [
                        Expanded(
                          child: _buildMetricTile(
                            label: 'Total Spent',
                            value: '₹1,42,500',
                            valueColor: AppColors.darkCharcoal,
                            bgColor: const Color(0xFFF8FAFC),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildMetricTile(
                            label: 'Total Receivable',
                            value: '₹1,70,000',
                            valueColor: const Color(0xFF047857),
                            bgColor: const Color(0xFFECFDF5),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Available Project Balance Banner (Image 3: Subtitle as regular text)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.green.shade50, const Color(0xFFECFDF5)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(7),
                              decoration: BoxDecoration(
                                color: Colors.green.shade100,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.account_balance_wallet_rounded, size: 18, color: Colors.green),
                            ),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Available Project Balance',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    'Unspent cash in hand',
                                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w400), // Image 3: Regular text
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                          color: Colors.green.shade700,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.green.shade700.withValues(alpha: 0.3),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Text(
                          '₹72,500',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // 3. Department-wise Budget Allocation Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Expanded(
                child: Text(
                  'Department-wise Budget Allocation',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: _toggleExpandAll,
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _expandAll ? 'Collapse All' : 'Expand All',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.darkYellow,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        _expandAll ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                        size: 18,
                        color: AppColors.darkYellow,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Department Items List
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _deptItems.length,
            itemBuilder: (context, index) {
              final item = _deptItems[index];
              final isExpanded = _expandedIndices.contains(index);

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isExpanded ? AppColors.primaryYellow.withValues(alpha: 0.8) : AppColors.borderLight,
                    width: isExpanded ? 1.5 : 1.0,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Card Header Row (Always Visible)
                    InkWell(
                      onTap: () => _toggleItem(index),
                      borderRadius: BorderRadius.circular(16),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: AppColors.lightYellowBg,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(item.icon, size: 22, color: AppColors.darkCharcoal),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            item.title,
                                            style: const TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: BoxDecoration(
                                              color: item.statusColor,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        'Budget: ${item.totalBudget}',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textSecondary,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text(
                                      'Remaining',
                                      style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      item.remaining,
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w400, // Image 4: Regular text
                                        color: item.statusColor,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 10),
                                Icon(
                                  isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                                  size: 22,
                                  color: AppColors.textPrimary,
                                ),
                              ],
                            ),

                            // Mini Progress Bar on Card Header
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: item.progress,
                                      minHeight: 6,
                                      backgroundColor: const Color(0xFFF1F5F9),
                                      valueColor: AlwaysStoppedAnimation<Color>(item.statusColor),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  'Spent: ${item.spent}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w400,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Expanded Details Section
                    if (isExpanded) ...[
                      const Divider(height: 1, color: AppColors.borderLight),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: const BoxDecoration(
                          color: Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: _buildDetailSubTile(
                                label: 'Material Budget',
                                value: item.matBudget,
                                icon: Icons.inventory_2_outlined,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildDetailSubTile(
                                label: 'Labor Budget',
                                value: item.labBudget,
                                icon: Icons.groups_outlined,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildDetailSubTile(
                                label: 'Utilized %',
                                value: '${(item.progress * 100).toInt()}%',
                                icon: Icons.pie_chart_outline_rounded,
                                valueColor: item.statusColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // 4. Site Purchase Data Section
          const Text(
            'Site Purchase data',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _buildSitePurchaseCard(
                  title: 'Total Purchase',
                  amount: '₹1,20,000',
                  icon: Icons.shopping_bag_rounded,
                  color: AppColors.darkCharcoal,
                  bgColor: AppColors.lightYellowBg,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSitePurchaseCard(
                  title: 'Total Paid',
                  amount: '₹85,000',
                  icon: Icons.check_circle_rounded,
                  color: Colors.green.shade800,
                  bgColor: Colors.green.shade50,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSitePurchaseCard(
                  title: 'Total Credit',
                  amount: '₹35,000',
                  icon: Icons.credit_score_rounded,
                  color: Colors.red.shade800,
                  bgColor: Colors.red.shade50,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSitePurchaseCard({
    required String title,
    required String amount,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 15, color: color),
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              amount,
              style: TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String label,
    required String value,
    Color? valueColor,
    required Color bgColor,
    Color? borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor ?? AppColors.borderLight.withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600), // Image 2: Heading semi bold
            maxLines: 2,
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600, // Image 2: Amount medium bold
                color: valueColor ?? AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailSubTile({
    required String label,
    required String value,
    required IconData icon,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.textMuted),
          const SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w400),
                  maxLines: 2,
                ),
                const SizedBox(height: 3),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: valueColor ?? AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
