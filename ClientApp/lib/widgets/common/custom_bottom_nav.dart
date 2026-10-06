import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class CustomBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const CustomBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const navBarHeight = 68.0;

    return Container(
      color: AppColors.darkCharcoal,
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: navBarHeight,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.topCenter,
            children: [
              // Background Notched Bar
              Positioned.fill(
                child: CustomPaint(
                  painter: _NotchedNavPainter(
                    backgroundColor: AppColors.darkCharcoal,
                    borderColor: const Color(0xFF1E293B),
                  ),
                ),
              ),

              // Side Navigation Items Row
              Positioned.fill(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(
                      index: 0,
                      icon: Icons.home_outlined,
                      activeIcon: Icons.home_rounded,
                      label: 'Home',
                    ),
                    _buildNavItem(
                      index: 1,
                      icon: Icons.apartment_outlined,
                      activeIcon: Icons.apartment_rounded,
                      label: 'Projects',
                    ),
                    // Center Gap for Quote Floating Button
                    const SizedBox(width: 68),
                    _buildNavItem(
                      index: 3,
                      icon: Icons.local_shipping_outlined,
                      activeIcon: Icons.local_shipping_rounded,
                      label: 'Renovation',
                    ),
                    _buildNavItem(
                      index: 4,
                      icon: Icons.phone_in_talk_outlined,
                      activeIcon: Icons.phone_in_talk_rounded,
                      label: 'Contact',
                    ),
                  ],
                ),
              ),

              // Center Floating "Get Quote" Button
              Positioned(
                top: -14,
                child: _buildCenterQuoteButton(),
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
    required IconData activeIcon,
    required String label,
  }) {
    final isSelected = currentIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () => onTap(index),
        splashColor: AppColors.primaryYellow.withValues(alpha: 0.15),
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? AppColors.primaryYellow : Colors.white70,
              size: 22,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected ? AppColors.primaryYellow : Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterQuoteButton() {
    final isSelected = currentIndex == 2;

    return GestureDetector(
      onTap: () => onTap(2),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: isSelected
                      ? AppColors.primaryYellow.withValues(alpha: 0.6)
                      : Colors.black.withValues(alpha: 0.35),
                  blurRadius: isSelected ? 12 : 6,
                  spreadRadius: isSelected ? 2 : 0,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            padding: const EdgeInsets.all(3),
            child: Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: AppColors.yellowGradient,
              ),
              child: Icon(
                isSelected ? Icons.assignment_rounded : Icons.assignment_outlined,
                color: AppColors.darkCharcoal,
                size: 22,
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Get Quote',
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
              color: isSelected ? AppColors.primaryYellow : Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}

class _NotchedNavPainter extends CustomPainter {
  final Color backgroundColor;
  final Color borderColor;

  _NotchedNavPainter({
    required this.backgroundColor,
    required this.borderColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final path = Path();
    final cx = size.width / 2;
    const notchRadius = 34.0;
    const barTop = 0.0;

    // Start top left
    path.moveTo(0, barTop);

    // Line to left of center notch
    path.lineTo(cx - notchRadius - 8, barTop);

    // Smooth cutout curve into notch
    path.cubicTo(
      cx - notchRadius + 2, barTop,
      cx - notchRadius + 5, barTop + notchRadius * 0.75,
      cx, barTop + notchRadius * 0.78,
    );
    path.cubicTo(
      cx + notchRadius - 5, barTop + notchRadius * 0.78,
      cx + notchRadius - 2, barTop,
      cx + notchRadius + 8, barTop,
    );

    // Line to top right corner
    path.lineTo(size.width, barTop);

    // Down to bottom right, bottom left, and close
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
    canvas.drawPath(path, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
