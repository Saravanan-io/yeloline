import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_assets.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/auth_service.dart';
import '../../features/admin/login/admin_login_screen.dart';

class CustomHeader extends StatefulWidget implements PreferredSizeWidget {
  final String? title;
  final bool showBackButton;
  final bool showLogoutButton;
  final VoidCallback? onBackTap;
  final VoidCallback? onNotificationTap;
  final bool hasNotification;

  const CustomHeader({
    super.key,
    this.title,
    this.showBackButton = false,
    this.showLogoutButton = true,
    this.onBackTap,
    this.onNotificationTap,
    this.hasNotification = true,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 8);

  @override
  State<CustomHeader> createState() => _CustomHeaderState();
}

class _CustomHeaderState extends State<CustomHeader> {
  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
      child: Container(
        color: AppColors.darkCharcoal,
        child: SafeArea(
          bottom: false,
          child: Container(
            height: kToolbarHeight + 8,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            decoration: const BoxDecoration(
              color: AppColors.darkCharcoal,
              border: Border(
                bottom: BorderSide(
                  color: Color(0xFF1E293B),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                if (widget.showBackButton) ...[
                  Padding(
                    padding: const EdgeInsets.only(right: 10.0),
                    child: IconButton(
                      onPressed: widget.onBackTap ?? () => Navigator.maybePop(context),
                      icon: const Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ),
                ],
                if (widget.title != null && widget.title!.isNotEmpty) ...[
                  Text(
                    widget.title!,
                    style: GoogleFonts.urbanist(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.3,
                    ),
                  ),
                ] else ...[
                  // Brand Header Logo
                  Image.asset(
                    AppAssets.logo,
                    height: 38,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.construction_rounded, color: AppColors.primaryYellow, size: 28),
                          const SizedBox(width: 8),
                          Text(
                            'Yeloline',
                            style: GoogleFonts.urbanist(
                              color: AppColors.primaryYellow,
                              fontWeight: FontWeight.bold,
                              fontSize: 20,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ],
                const Spacer(),
                if (widget.showLogoutButton) ...[
                  // Logout Button
                  Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        barrierDismissible: false,
                        builder: (context) => PopScope(
                          canPop: false,
                          child: AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            backgroundColor: Colors.white,
                            title: const Row(
                              children: [
                                Icon(Icons.logout_rounded, color: AppColors.darkYellow, size: 24),
                                SizedBox(width: 10),
                                Text(
                                  'Confirm Logout',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                            content: const Text(
                              'Are you sure you want to log out?',
                              style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                            ),
                            actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            actions: [
                              OutlinedButton(
                                onPressed: () => Navigator.of(context).pop(false),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.textPrimary,
                                  side: const BorderSide(color: AppColors.borderLight, width: 1.5),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                ),
                                child: const Text('No', style: TextStyle(fontWeight: FontWeight.w600)),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.of(context).pop(true),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primaryYellow,
                                  foregroundColor: AppColors.darkCharcoal,
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                                ),
                                child: const Text('Yes', style: TextStyle(fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                        ),
                      );

                      if (confirm == true) {
                        if (!context.mounted) return;
                        final nav = Navigator.of(context);
                        await AuthService.clearAllSession();
                        nav.pushReplacement(
                          MaterialPageRoute(builder: (context) => const AdminLoginScreen()),
                        );
                      }
                    },
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white12, width: 1),
                      ),
                      child: const Icon(
                        Icons.logout_rounded,
                        color: Colors.white70,
                        size: 20,
                      ),
                    ),
                  ),
                ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
