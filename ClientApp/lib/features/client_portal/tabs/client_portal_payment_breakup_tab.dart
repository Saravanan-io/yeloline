import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

class ClientPortalPaymentBreakupTab extends StatefulWidget {
  final String siteName;

  const ClientPortalPaymentBreakupTab({
    super.key,
    required this.siteName,
  });

  @override
  State<ClientPortalPaymentBreakupTab> createState() => _ClientPortalPaymentBreakupTabState();
}

class _ClientPortalPaymentBreakupTabState extends State<ClientPortalPaymentBreakupTab> {
  String _selectedFloorFilter = 'ALL';
  bool _isCardView = false;

  // Standard 10 payment milestones template (as configured in Admin Panel)
  static const List<Map<String, String>> _defaultMilestoneTemplates = [
    {'sno': '1', 'stage_name': 'MOBILIZATION ADVANCE (16%)', 'amount': '0', 'work_schedule': ''},
    {'sno': '2', 'stage_name': 'ON COMPLETION OF BASEMENT', 'amount': '0', 'work_schedule': ''},
    {'sno': '3', 'stage_name': "ON COMPLETION OF 7' LINTEL LEVEL RCC WORK", 'amount': '0', 'work_schedule': ''},
    {'sno': '4', 'stage_name': 'ON COMPLETION OF GROUND FLOOR ROOF CONCRETE', 'amount': '0', 'work_schedule': ''},
    {'sno': '5', 'stage_name': 'ON COMPLETION OF MEP CONCEALED WORK', 'amount': '0', 'work_schedule': ''},
    {'sno': '6', 'stage_name': 'ON COMPLETION OF WALL PLASTERING', 'amount': '0', 'work_schedule': ''},
    {'sno': '7', 'stage_name': 'ON COMPLETION OF TILE LAYING', 'amount': '0', 'work_schedule': ''},
    {'sno': '8', 'stage_name': 'ON COMPLETION OF UPVC WINDOW & DOOR FIXING', 'amount': '0', 'work_schedule': ''},
    {'sno': '9', 'stage_name': 'ON COMPLETION OF INTERIOR WALL PAINTING', 'amount': '0', 'work_schedule': ''},
    {'sno': '10', 'stage_name': 'ON COMPLETION OF ALL FINISHING WORKS', 'amount': '0', 'work_schedule': ''},
  ];

  List<Map<String, dynamic>> _generateDefaultStagesForFloor(String floorName) {
    final upper = floorName.trim().toUpperCase();
    return _defaultMilestoneTemplates.map((m) {
      String stageName = m['stage_name']!;
      if (m['sno'] == '4' && upper.isNotEmpty && !upper.contains('GROUND')) {
        stageName = 'ON COMPLETION OF $upper ROOF CONCRETE';
      }
      return {
        'sno': int.parse(m['sno']!),
        'stage_name': stageName,
        'amount': 0,
        'work_schedule': '',
      };
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('sites').snapshots(),
      builder: (context, sitesSnapshot) {
        return StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance.collection('payment_breakups').snapshots(),
          builder: (context, breakupsSnapshot) {
            if (sitesSnapshot.connectionState == ConnectionState.waiting &&
                breakupsSnapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: CircularProgressIndicator(color: AppColors.primaryYellow),
              );
            }

            // 1. Locate matching Site doc
            Map<String, dynamic>? siteData;
            if (sitesSnapshot.hasData && sitesSnapshot.data!.docs.isNotEmpty) {
              for (final doc in sitesSnapshot.data!.docs) {
                final raw = doc.data();
                if (raw is Map) {
                  final d = Map<String, dynamic>.from(raw);
                  final sName = (d['site_name'] ?? d['name'] ?? '').toString().trim().toLowerCase();
                  final sId = (d['site_id'] ?? doc.id).toString().trim().toLowerCase();
                  final target = widget.siteName.trim().toLowerCase();
                  if (sName == target || sId == target || sName.contains(target) || target.contains(sName)) {
                    siteData = d;
                    break;
                  }
                }
              }
            }

            // 2. Locate matching Payment Breakup doc
            Map<String, dynamic>? breakupData;
            if (breakupsSnapshot.hasData && breakupsSnapshot.data!.docs.isNotEmpty) {
              for (final doc in breakupsSnapshot.data!.docs) {
                final raw = doc.data();
                if (raw is Map) {
                  final d = Map<String, dynamic>.from(raw);
                  final sName = (d['site_name'] ?? '').toString().trim().toLowerCase();
                  final sId = (d['site_id'] ?? doc.id).toString().trim().toLowerCase();
                  final target = widget.siteName.trim().toLowerCase();
                  if (sName == target || sId == target || sName.contains(target) || target.contains(sName)) {
                    breakupData = d;
                    break;
                  }
                }
              }
            }

            // 3. Resolve multi-floor structure registered by admin
            final resolvedFloors = _resolveFloors(siteData, breakupData);

            return _buildMainContent(resolvedFloors);
          },
        );
      },
    );
  }

  /// Extracts and builds the floor sections based on admin registration in payment_breakups or sites
  List<Map<String, dynamic>> _resolveFloors(
    Map<String, dynamic>? siteData,
    Map<String, dynamic>? breakupData,
  ) {
    // A) If payment_breakups document already contains custom floors array:
    if (breakupData != null && breakupData['floors'] is List && (breakupData['floors'] as List).isNotEmpty) {
      final rawList = breakupData['floors'] as List;
      return rawList.map((f) {
        if (f is Map) {
          final floorMap = Map<String, dynamic>.from(f);
          final milestonesRaw = (floorMap['milestones'] as List?) ?? [];
          final milestones = milestonesRaw.map((m) {
            if (m is Map) return Map<String, dynamic>.from(m);
            return <String, dynamic>{};
          }).toList();
          return {
            'id': floorMap['id'] ?? 'floor',
            'floor_title': floorMap['floor_title'] ?? floorMap['floorTitle'] ?? 'GROUND FLOOR',
            'total_amount': floorMap['total_amount'] ?? _sumMilestones(milestones),
            'milestones': milestones,
          };
        }
        return <String, dynamic>{};
      }).where((f) => f.isNotEmpty).toList();
    }

    // B) If payment_breakups document has a flat milestones list (single floor):
    if (breakupData != null && breakupData['milestones'] is List && (breakupData['milestones'] as List).isNotEmpty) {
      final milestonesRaw = breakupData['milestones'] as List;
      final milestones = milestonesRaw.map((m) {
        if (m is Map) return Map<String, dynamic>.from(m);
        return <String, dynamic>{};
      }).toList();
      final title = breakupData['floor_title']?.toString() ?? 'GROUND FLOOR';
      return [
        {
          'id': 'floor_1',
          'floor_title': title,
          'total_amount': breakupData['total_amount'] ?? _sumMilestones(milestones),
          'milestones': milestones,
        }
      ];
    }

    // C) Fallback to registered floors from the Admin site record:
    List<String> registeredFloorNames = [];
    if (siteData != null) {
      if (siteData['floor_names'] is List && (siteData['floor_names'] as List).isNotEmpty) {
        registeredFloorNames = (siteData['floor_names'] as List)
            .map((e) => e.toString().trim())
            .where((e) => e.isNotEmpty)
            .toList();
      } else if (siteData['floors'] != null || siteData['number_of_floors'] != null) {
        final fStr = (siteData['floors'] ?? siteData['number_of_floors']).toString().toUpperCase();
        if (fStr.contains('G + 3') || fStr.contains('4 FLOORS') || fStr == '4') {
          registeredFloorNames = ['GROUND FLOOR', 'FIRST FLOOR', 'SECOND FLOOR', 'THIRD FLOOR'];
        } else if (fStr.contains('G + 2') || fStr.contains('3 FLOORS') || fStr == '3') {
          registeredFloorNames = ['GROUND FLOOR', 'FIRST FLOOR', 'SECOND FLOOR'];
        } else if (fStr.contains('G + 1') || fStr.contains('2 FLOORS') || fStr == '2') {
          registeredFloorNames = ['GROUND FLOOR', 'FIRST FLOOR'];
        } else if (fStr.contains('G +') || fStr.contains('GROUND')) {
          registeredFloorNames = ['GROUND FLOOR'];
        }
      }
    }

    if (registeredFloorNames.isEmpty) {
      registeredFloorNames = ['GROUND FLOOR'];
    }

    // Generate the 10 standard milestones for each registered floor
    return registeredFloorNames.asMap().entries.map((entry) {
      final idx = entry.key;
      final name = entry.value;
      final defaultStages = _generateDefaultStagesForFloor(name);
      return {
        'id': 'floor_${idx + 1}',
        'floor_title': name,
        'total_amount': 0,
        'milestones': defaultStages,
      };
    }).toList();
  }

  double _sumMilestones(List<Map<String, dynamic>> milestones) {
    double sum = 0.0;
    for (final m in milestones) {
      final a = m['amount'];
      if (a != null) {
        sum += double.tryParse(a.toString()) ?? 0.0;
      }
    }
    return sum;
  }

  Widget _buildMainContent(List<Map<String, dynamic>> floors) {
    // Filter floors if needed
    final displayedFloors = _selectedFloorFilter == 'ALL'
        ? floors
        : floors.where((f) => f['floor_title'] == _selectedFloorFilter).toList();

    double totalContractAmount = 0;
    int totalMilestoneCount = 0;
    for (final f in floors) {
      final mList = (f['milestones'] as List?) ?? [];
      totalMilestoneCount += mList.length;
      totalContractAmount += (f['total_amount'] as num?)?.toDouble() ?? _sumMilestones(mList.cast<Map<String, dynamic>>());
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final screenWidth = constraints.maxWidth;
        final isMobile = screenWidth < 680;

        return SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 12 : 24,
            vertical: 16,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Header Hero Card
              _buildHeroCard(
                totalContractAmount: totalContractAmount,
                totalMilestoneCount: totalMilestoneCount,
                floorCount: floors.length,
              ),

              const SizedBox(height: 18),

              // 2. Floor Switcher Pills & Responsive View Toggle Bar
              _buildControlBar(floors, isMobile),

              const SizedBox(height: 16),

              // 3. Render each Floor Section Card
              ...displayedFloors.asMap().entries.map((entry) {
                final floorIndex = entry.key;
                final floorData = entry.value;
                return _buildFloorSection(
                  floorIndex: floorIndex,
                  floorData: floorData,
                  totalContractAmount: totalContractAmount,
                  isMobile: isMobile,
                );
              }),

              const SizedBox(height: 32),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeroCard({
    required double totalContractAmount,
    required int totalMilestoneCount,
    required int floorCount,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryYellow,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '$floorCount REGISTERED ${floorCount == 1 ? 'FLOOR' : 'FLOORS'}',
                  style: const TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w900,
                    color: AppColors.darkCharcoal,
                    letterSpacing: 0.6,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_rounded, size: 12, color: Color(0xFF38BDF8)),
                    const SizedBox(width: 4),
                    Text(
                      'Admin Configured',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'TOTAL CONTRACT MILESTONE SCHEDULE',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF94A3B8),
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '₹ ${CurrencyFormatter.format(totalContractAmount)}',
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '($totalMilestoneCount total stages)',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.location_city_rounded, size: 14, color: AppColors.primaryYellow),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Project Site: ${widget.siteName}',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFE2E8F0),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildControlBar(List<Map<String, dynamic>> floors, bool isMobile) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Payment Breakup Stages',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.darkCharcoal,
              ),
            ),
            // View Mode Toggle Button
            InkWell(
              onTap: () {
                setState(() {
                  _isCardView = !_isCardView;
                });
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _isCardView ? Icons.table_chart_rounded : Icons.view_agenda_rounded,
                      size: 14,
                      color: const Color(0xFF475569),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _isCardView ? 'Table View' : 'Card View',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF334155),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),

        // Floor Filter Tabs if multi-floor
        if (floors.length > 1) ...[
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildFilterChip(
                label: 'ALL FLOORS (${floors.length})',
                isSelected: _selectedFloorFilter == 'ALL',
                onTap: () => setState(() => _selectedFloorFilter = 'ALL'),
              ),
              ...floors.map((f) {
                final title = f['floor_title']?.toString() ?? 'FLOOR';
                return _buildFilterChip(
                  label: title.toUpperCase(),
                  isSelected: _selectedFloorFilter == title,
                  onTap: () => setState(() => _selectedFloorFilter = title),
                );
              }),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFCBD5E1),
            width: 1.2,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w800,
            color: isSelected ? Colors.white : const Color(0xFF475569),
            letterSpacing: 0.3,
          ),
        ),
      ),
    );
  }

  Widget _buildFloorSection({
    required int floorIndex,
    required Map<String, dynamic> floorData,
    required double totalContractAmount,
    required bool isMobile,
  }) {
    final floorTitle = (floorData['floor_title'] ?? 'FLOOR #${floorIndex + 1}').toString();
    final milestones = (floorData['milestones'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final floorSubtotal = (floorData['total_amount'] as num?)?.toDouble() ?? _sumMilestones(milestones);
    final pctOfTotal = totalContractAmount > 0 ? ((floorSubtotal / totalContractAmount) * 100).toStringAsFixed(1) : '0';

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Floor Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              border: Border(
                bottom: BorderSide(color: Color(0xFFE2E8F0)),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDBEAFE),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.layers_rounded, size: 13, color: Color(0xFF2563EB)),
                          const SizedBox(width: 4),
                          Text(
                            'SECTION #${floorIndex + 1}',
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF1D4ED8),
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      floorTitle.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: AppColors.darkCharcoal,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
                        children: [
                          const TextSpan(text: 'Subtotal: ', style: TextStyle(fontWeight: FontWeight.w600)),
                          TextSpan(
                            text: '₹ ${CurrencyFormatter.format(floorSubtotal)}',
                            style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                    ),
                    if (floorSubtotal > 0 && totalContractAmount > 0)
                      Text(
                        '($pctOfTotal% of total)',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                      ),
                  ],
                ),
              ],
            ),
          ),

          // 2. Body: Either Responsive Aligned Table View (Default) or Mobile Cards View
          if (_isCardView)
            _buildFloorCardsView(milestones)
          else
            _buildSpreadsheetTable(
              milestones: milestones,
              floorIndex: floorIndex,
              floorTitle: floorTitle,
              floorSubtotal: floorSubtotal,
              isMobile: isMobile,
            ),
        ],
      ),
    );
  }

  /// Perfectly aligned, responsive table that fits 100% of width without horizontal scroll
  Widget _buildSpreadsheetTable({
    required List<Map<String, dynamic>> milestones,
    required int floorIndex,
    required String floorTitle,
    required double floorSubtotal,
    required bool isMobile,
  }) {
    if (milestones.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        alignment: Alignment.center,
        child: const Text(
          'No milestones configured for this floor.',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF94A3B8),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Table Header Row
        Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF1F5F9),
            border: Border(
              bottom: BorderSide(color: Color(0xFFCBD5E1), width: 1.2),
            ),
          ),
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 12 : 16,
            vertical: 10,
          ),
          child: isMobile
              ? const Row(
                  children: [
                    SizedBox(
                      width: 32,
                      child: Text(
                        '#',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF334155),
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'STAGE / MILESTONE',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF334155),
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                    SizedBox(width: 10),
                    SizedBox(
                      width: 110,
                      child: Text(
                        'AMOUNT (₹)',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF334155),
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                  ],
                )
              : const Row(
                  children: [
                    SizedBox(
                      width: 44,
                      child: Text(
                        'S.NO',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      flex: 5,
                      child: Text(
                        'STAGE / MILESTONE DESCRIPTION',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      flex: 3,
                      child: Text(
                        'WORK SCHEDULE / TARGET',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: Text(
                        'MILESTONE AMOUNT (₹)',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ),
                  ],
                ),
        ),

        // Milestone Rows
        ...milestones.asMap().entries.map((entry) {
          final idx = entry.key;
          final m = entry.value;
          final isEven = idx % 2 == 0;
          final sno = m['sno'] ?? (idx + 1);
          final stageName = (m['stage_name'] ?? 'STAGE ${idx + 1}').toString();
          final amount = m['amount'];
          final schedule = (m['work_schedule'] ?? '').toString().trim();

          final amountVal = amount != null ? double.tryParse(amount.toString()) : null;
          final hasAmount = amountVal != null && amountVal > 0;
          final amountStr = hasAmount
              ? CurrencyFormatter.format(amountVal)
              : '0';

          return Container(
            decoration: BoxDecoration(
              color: isEven ? Colors.white : const Color(0xFFF8FAFC),
              border: Border(
                bottom: BorderSide(
                  color: idx == milestones.length - 1 ? Colors.transparent : const Color(0xFFE2E8F0),
                  width: 1.0,
                ),
              ),
            ),
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 12 : 16,
              vertical: isMobile ? 11 : 12,
            ),
            child: isMobile
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // S.No Badge
                      SizedBox(
                        width: 32,
                        child: Center(
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: hasAmount ? const Color(0xFFEFF6FF) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: hasAmount ? const Color(0xFFBFDBFE) : const Color(0xFFE2E8F0),
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '$sno',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: hasAmount ? const Color(0xFF1D4ED8) : const Color(0xFF475569),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Milestone Description & Schedule
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              stageName,
                              style: const TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0F172A),
                                height: 1.3,
                              ),
                            ),
                            if (schedule.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.calendar_today_rounded,
                                    size: 11,
                                    color: Color(0xFF64748B),
                                  ),
                                  const SizedBox(width: 4),
                                  Flexible(
                                    child: Text(
                                      schedule,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF64748B),
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Amount Column
                      SizedBox(
                        width: 110,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '₹ $amountStr',
                              textAlign: TextAlign.right,
                              style: TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                color: hasAmount ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                              ),
                            ),
                            if (hasAmount && floorSubtotal > 0)
                              Padding(
                                padding: const EdgeInsets.only(top: 2),
                                child: Text(
                                  '${((amountVal / floorSubtotal) * 100).toStringAsFixed(1)}%',
                                  style: const TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF059669),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Desktop S.No
                      SizedBox(
                        width: 44,
                        child: Center(
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: hasAmount ? const Color(0xFFEFF6FF) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: hasAmount ? const Color(0xFFBFDBFE) : const Color(0xFFE2E8F0),
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '$sno',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: hasAmount ? const Color(0xFF1D4ED8) : const Color(0xFF475569),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Desktop Description
                      Expanded(
                        flex: 5,
                        child: Text(
                          stageName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Desktop Schedule
                      Expanded(
                        flex: 3,
                        child: Text(
                          schedule.isNotEmpty ? schedule : 'As per site progress',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: schedule.isNotEmpty ? FontWeight.w600 : FontWeight.w400,
                            color: schedule.isNotEmpty ? const Color(0xFF334155) : const Color(0xFF94A3B8),
                            fontStyle: schedule.isEmpty ? FontStyle.italic : FontStyle.normal,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Desktop Amount
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '₹ $amountStr',
                              textAlign: TextAlign.right,
                              style: TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w900,
                                color: hasAmount ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                              ),
                            ),
                            if (hasAmount && floorSubtotal > 0)
                              Text(
                                '${((amountVal / floorSubtotal) * 100).toStringAsFixed(1)}% of subtotal',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF059669),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
          );
        }),

        // Table Footer Summary Bar
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 14 : 16,
            vertical: 10,
          ),
          decoration: const BoxDecoration(
            color: Color(0xFFF8FAFC),
            border: Border(
              top: BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.check_circle_outline_rounded, size: 14, color: Color(0xFF059669)),
                  const SizedBox(width: 6),
                  Text(
                    '${milestones.length} Stages registered',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF475569),
                    ),
                  ),
                ],
              ),
              RichText(
                text: TextSpan(
                  style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
                  children: [
                    const TextSpan(text: 'Section Total: ', style: TextStyle(fontWeight: FontWeight.w600)),
                    TextSpan(
                      text: '₹ ${CurrencyFormatter.format(floorSubtotal)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Compact card layout view (optional toggle for mobile convenience)
  Widget _buildFloorCardsView(List<Map<String, dynamic>> milestones) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(12),
      itemCount: milestones.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, idx) {
        final m = milestones[idx];
        final sno = m['sno'] ?? (idx + 1);
        final stageName = (m['stage_name'] ?? 'STAGE ${idx + 1}').toString();
        final amount = m['amount'];
        final schedule = (m['work_schedule'] ?? '').toString();

        final amountVal = amount != null ? double.tryParse(amount.toString()) : null;
        final hasAmount = amountVal != null && amountVal > 0;

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: hasAmount ? const Color(0xFFEFF6FF) : const Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: hasAmount ? const Color(0xFF3B82F6) : const Color(0xFFCBD5E1),
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  '$sno',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w900,
                    color: hasAmount ? const Color(0xFF1D4ED8) : const Color(0xFF64748B),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stageName,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      schedule.isNotEmpty ? 'Schedule: $schedule' : 'Target: As per site progress',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: schedule.isNotEmpty ? const Color(0xFF475569) : const Color(0xFF94A3B8),
                        fontStyle: schedule.isEmpty ? FontStyle.italic : FontStyle.normal,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: hasAmount ? const Color(0xFFF0FDF4) : Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: hasAmount ? const Color(0xFF86EFAC) : const Color(0xFFCBD5E1),
                  ),
                ),
                child: Text(
                  hasAmount ? '₹ ${CurrencyFormatter.format(amountVal)}' : '₹ 0',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w900,
                    color: hasAmount ? const Color(0xFF166534) : const Color(0xFF64748B),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
