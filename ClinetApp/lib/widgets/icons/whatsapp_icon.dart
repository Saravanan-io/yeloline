import 'package:flutter/material.dart';

class WhatsAppIcon extends StatelessWidget {
  final double size;
  final Color color;

  const WhatsAppIcon({
    super.key,
    this.size = 15,
    this.color = const Color(0xFF1E293B),
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _OfficialWhatsAppIconPainter(color: color),
      ),
    );
  }
}

class _OfficialWhatsAppIconPainter extends CustomPainter {
  final Color color;

  _OfficialWhatsAppIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24.0;

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // Outer speech bubble + tail
    final outerPath = Path();
    outerPath.moveTo(12.01 * s, 2.0 * s);
    outerPath.cubicTo(6.51 * s, 2.0 * s, 2.02 * s, 6.48 * s, 2.02 * s, 11.98 * s);
    outerPath.cubicTo(2.02 * s, 13.75 * s, 2.48 * s, 15.47 * s, 3.35 * s, 16.98 * s);
    outerPath.lineTo(1.93 * s, 22.16 * s);
    outerPath.lineTo(7.23 * s, 20.77 * s);
    outerPath.cubicTo(8.69 * s, 21.57 * s, 10.33 * s, 21.99 * s, 12.01 * s, 21.99 * s);
    outerPath.cubicTo(17.51 * s, 21.99 * s, 22.0 * s, 17.51 * s, 22.0 * s, 12.0 * s);
    outerPath.cubicTo(22.0 * s, 9.33 * s, 20.96 * s, 6.83 * s, 19.08 * s, 4.94 * s);
    outerPath.cubicTo(17.19 * s, 3.05 * s, 14.68 * s, 2.0 * s, 12.01 * s, 2.0 * s);
    outerPath.close();

    // Inner phone handset cutout
    final phonePath = Path();
    phonePath.moveTo(17.37 * s, 14.37 * s);
    phonePath.cubicTo(17.05 * s, 14.21 * s, 15.47 * s, 13.43 * s, 15.17 * s, 13.32 * s);
    phonePath.cubicTo(14.88 * s, 13.21 * s, 14.66 * s, 13.16 * s, 14.45 * s, 13.48 * s);
    phonePath.cubicTo(14.24 * s, 13.80 * s, 13.63 * s, 14.53 * s, 13.44 * s, 14.74 * s);
    phonePath.cubicTo(13.25 * s, 14.96 * s, 13.06 * s, 14.98 * s, 12.74 * s, 14.82 * s);
    phonePath.cubicTo(12.42 * s, 14.66 * s, 11.38 * s, 14.30 * s, 10.15 * s, 13.20 * s);
    phonePath.cubicTo(9.19 * s, 12.35 * s, 8.54 * s, 11.30 * s, 8.35 * s, 10.97 * s);
    phonePath.cubicTo(8.16 * s, 10.65 * s, 8.33 * s, 10.48 * s, 8.49 * s, 10.32 * s);
    phonePath.cubicTo(8.64 * s, 10.17 * s, 8.81 * s, 9.94 * s, 8.97 * s, 9.75 * s);
    phonePath.cubicTo(9.13 * s, 9.56 * s, 9.19 * s, 9.43 * s, 9.29 * s, 9.21 * s);
    phonePath.cubicTo(9.40 * s, 9.0 * s, 9.35 * s, 8.81 * s, 9.27 * s, 8.65 * s);
    phonePath.cubicTo(9.19 * s, 8.49 * s, 8.54 * s, 6.91 * s, 8.28 * s, 6.26 * s);
    phonePath.cubicTo(8.01 * s, 5.63 * s, 7.75 * s, 5.72 * s, 7.55 * s, 5.71 * s);
    phonePath.lineTo(6.93 * s, 5.70 * s);
    phonePath.cubicTo(6.72 * s, 5.70 * s, 6.37 * s, 5.78 * s, 6.07 * s, 6.10 * s);
    phonePath.cubicTo(5.78 * s, 6.42 * s, 4.95 * s, 7.20 * s, 4.95 * s, 8.78 * s);
    phonePath.cubicTo(4.95 * s, 10.37 * s, 6.10 * s, 11.90 * s, 6.26 * s, 12.11 * s);
    phonePath.cubicTo(6.42 * s, 12.33 * s, 8.53 * s, 15.58 * s, 11.76 * s, 16.97 * s);
    phonePath.cubicTo(14.99 * s, 18.37 * s, 14.99 * s, 17.90 * s, 15.58 * s, 17.84 * s);
    phonePath.cubicTo(16.17 * s, 17.78 * s, 17.48 * s, 17.06 * s, 17.75 * s, 16.31 * s);
    phonePath.cubicTo(18.02 * s, 15.56 * s, 18.02 * s, 14.92 * s, 17.94 * s, 14.78 * s);
    phonePath.cubicTo(17.86 * s, 14.65 * s, 17.65 * s, 14.57 * s, 17.37 * s, 14.37 * s);
    phonePath.close();

    final finalLogoPath = Path.combine(PathOperation.difference, outerPath, phonePath);

    canvas.drawPath(finalLogoPath, paint);
  }

  @override
  bool shouldRepaint(covariant _OfficialWhatsAppIconPainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
