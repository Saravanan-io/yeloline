import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/auth_service.dart';
import '../auth/client_login_screen.dart';
import 'tabs/client_portal_dashboard_tab.dart';
import 'tabs/client_portal_monthly_bill_tab.dart';
import 'tabs/client_portal_payment_breakup_tab.dart';
import 'tabs/client_portal_additional_billing_tab.dart';

class ClientPortalMainLayout extends StatefulWidget {
  final String initialSiteName;

  const ClientPortalMainLayout({
    super.key,
    required this.initialSiteName,
  });

  @override
  State<ClientPortalMainLayout> createState() => _ClientPortalMainLayoutState();
}

class _ClientPortalMainLayoutState extends State<ClientPortalMainLayout> {
  late String _currentSiteName;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _currentSiteName = widget.initialSiteName;
  }

  void _switchSite(String newSite) {
    if (newSite == _currentSiteName) return;
    setState(() {
      _currentSiteName = newSite;
    });
    AuthService.setClientPortalLoggedIn(true, siteName: newSite);
  }

  Future<void> _handleLogout() async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Exit Client Portal?'),
        content: const Text(
          'Do you want to exit the Client Portal and return to the login screen?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryYellow,
              foregroundColor: AppColors.darkCharcoal,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Exit Portal'),
          ),
        ],
      ),
    );

    if (shouldLogout == true && mounted) {
      await AuthService.logoutClientPortal();
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const ClientLoginScreen()),
        (route) => false,
      );
    }
  }

  void _showSitePicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance.collection('sites').snapshots(),
          builder: (context, snapshot) {
            final Set<String> siteNames = {};

            if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
              for (final doc in snapshot.data!.docs) {
                final raw = doc.data();
                if (raw is Map) {
                  final d = Map<String, dynamic>.from(raw);
                  final name = d['site_name']?.toString() ?? d['name']?.toString();
                  if (name != null && name.trim().isNotEmpty) {
                    siteNames.add(name.trim());
                  }
                }
              }
            }

            if (siteNames.isEmpty && _currentSiteName.trim().isNotEmpty) {
              siteNames.add(_currentSiteName.trim());
            }

            final sortedSites = siteNames.toList()..sort();

            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Switch Project Site',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: AppColors.darkCharcoal,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Select which client construction site you would like to inspect:',
                      style: TextStyle(fontSize: 12.5, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 14),
                    Flexible(
                      child: ListView.separated(
                        shrinkWrap: true,
                        itemCount: sortedSites.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, i) {
                          final sName = sortedSites[i];
                          final isSelected = sName.toLowerCase() == _currentSiteName.toLowerCase();

                          return ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primaryYellow.withValues(alpha: 0.2)
                                    : const Color(0xFFF1F5F9),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.apartment_rounded,
                                size: 18,
                                color: isSelected ? AppColors.darkCharcoal : AppColors.textMuted,
                              ),
                            ),
                            title: Text(
                              sName,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                color: isSelected ? AppColors.darkCharcoal : const Color(0xFF334155),
                              ),
                            ),
                            trailing: isSelected
                                ? const Icon(Icons.check_circle_rounded, color: AppColors.primaryYellow)
                                : null,
                            onTap: () {
                              Navigator.pop(ctx);
                              _switchSite(sName);
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: AppColors.darkCharcoal,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: _buildPortalAppBar(),
        body: IndexedStack(
          index: _currentIndex,
          children: [
            ClientPortalDashboardTab(
              siteName: _currentSiteName,
              onNavigateToTab: (idx) => setState(() => _currentIndex = idx),
            ),
            ClientPortalMonthlyBillTab(siteName: _currentSiteName),
            ClientPortalPaymentBreakupTab(siteName: _currentSiteName),
            ClientPortalAdditionalBillingTab(siteName: _currentSiteName),
          ],
        ),
        bottomNavigationBar: _buildBottomNav(),
      ),
    );
  }

  PreferredSizeWidget _buildPortalAppBar() {
    return AppBar(
      backgroundColor: AppColors.darkCharcoal,
      elevation: 0,
      centerTitle: false,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primaryYellow,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'CLIENT PORTAL',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w900,
                    color: AppColors.darkCharcoal,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          InkWell(
            onTap: _showSitePicker,
            borderRadius: BorderRadius.circular(4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.location_city_rounded, size: 14, color: AppColors.primaryYellow),
                const SizedBox(width: 4),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 180),
                  child: Text(
                    _currentSiteName,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(Icons.arrow_drop_down_rounded, color: AppColors.primaryYellow, size: 20),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.swap_horiz_rounded, color: Colors.white),
          tooltip: 'Switch Site',
          onPressed: _showSitePicker,
        ),
        IconButton(
          icon: const Icon(Icons.logout_rounded, color: Color(0xFFF87171)),
          tooltip: 'Exit Portal',
          onPressed: _handleLogout,
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.darkCharcoal,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                index: 0,
                icon: Icons.dashboard_rounded,
                label: 'Dashboard',
              ),
              _buildNavItem(
                index: 1,
                icon: Icons.receipt_long_rounded,
                label: 'Monthly Bill',
              ),
              _buildNavItem(
                index: 2,
                icon: Icons.pie_chart_rounded,
                label: 'Breakup',
              ),
              _buildNavItem(
                index: 3,
                icon: Icons.post_add_rounded,
                label: 'Additional',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = _currentIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _currentIndex = index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primaryYellow.withValues(alpha: 0.15)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 22,
                color: isSelected ? AppColors.primaryYellow : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected ? AppColors.primaryYellow : const Color(0xFF94A3B8),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
