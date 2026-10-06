import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String? description;
  final bool isDark;
  final bool isCompact;

  const StatCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.description,
    this.isDark = false,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(isCompact ? 10 : 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardWhite,
        borderRadius: BorderRadius.circular(isCompact ? 12 : 16),
        border: Border.all(
          color: isDark ? Colors.white10 : AppColors.borderLight,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.10),
            blurRadius: isCompact ? 8 : 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: EdgeInsets.all(isCompact ? 6 : 10),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : AppColors.lightYellowBg,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: AppColors.primaryYellow,
              size: isCompact ? 18 : 26,
            ),
          ),
          SizedBox(height: isCompact ? 6 : 10),
          Text(
            title,
            style: TextStyle(
              fontSize: isCompact ? 16 : 20,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppColors.textPrimary,
              letterSpacing: -0.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: isCompact ? 11 : 12,
              fontWeight: FontWeight.w500,
              color: isDark ? AppColors.primaryYellow : AppColors.darkCharcoal,
            ),
            textAlign: TextAlign.center,
          ),
          if (description != null) ...[
            SizedBox(height: isCompact ? 3 : 4),
            Text(
              description!,
              style: TextStyle(
                fontSize: isCompact ? 10 : 11,
                fontWeight: FontWeight.w400,
                color: isDark ? AppColors.textMuted : AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }
}
