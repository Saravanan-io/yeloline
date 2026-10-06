import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class QuickActionCard extends StatefulWidget {
  final IconData? icon;
  final Widget? customIcon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final Color? iconBgColor;

  const QuickActionCard({
    super.key,
    this.icon,
    this.customIcon,
    required this.title,
    this.subtitle,
    required this.onTap,
    this.iconBgColor,
  });

  @override
  State<QuickActionCard> createState() => _QuickActionCardState();
}

class _QuickActionCardState extends State<QuickActionCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeInOut,
        transform: _isPressed ? Matrix4.diagonal3Values(0.97, 0.97, 1.0) : Matrix4.identity(),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: _isPressed ? AppColors.primaryYellow : AppColors.primaryYellow.withValues(alpha: 0.18),
            width: _isPressed ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: _isPressed ? 0.16 : 0.08),
              blurRadius: _isPressed ? 14 : 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    gradient: widget.iconBgColor != null
                        ? null
                        : AppColors.yellowGradient,
                    color: widget.iconBgColor,
                    borderRadius: BorderRadius.circular(9),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryYellow.withValues(alpha: 0.3),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: widget.customIcon ??
                      Icon(
                        widget.icon,
                        color: AppColors.darkCharcoal,
                        size: 15,
                      ),
                ),
                Container(
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: AppColors.lightYellowBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primaryYellow.withValues(alpha: 0.3)),
                  ),
                  child: const Icon(
                    Icons.arrow_forward_rounded,
                    color: AppColors.darkCharcoal,
                    size: 12,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600, // Semi Bold
                  color: AppColors.textPrimary,
                  letterSpacing: -0.2,
                ),
              ),
            ),
            if (widget.subtitle != null && widget.subtitle!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                widget.subtitle!,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w400, // Regular Text
                  color: AppColors.textSecondary,
                  height: 1.3,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
