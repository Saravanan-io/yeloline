import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class AppImage extends StatelessWidget {
  final String url;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? errorWidget;
  final Widget? loadingWidget;
  final BorderRadius? borderRadius;

  const AppImage({
    super.key,
    required this.url,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.errorWidget,
    this.loadingWidget,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final cleanUrl = url.trim();

    Widget content;

    if (cleanUrl.isEmpty) {
      content = _buildErrorFallback();
    } else if (cleanUrl.startsWith('data:image')) {
      try {
        final commaIndex = cleanUrl.indexOf(',');
        if (commaIndex != -1) {
          final base64Data = cleanUrl.substring(commaIndex + 1);
          final bytes = base64Decode(base64Data);
          content = Image.memory(
            bytes,
            width: width,
            height: height,
            fit: fit,
            errorBuilder: (context, error, stackTrace) => _buildErrorFallback(),
          );
        } else {
          content = _buildErrorFallback();
        }
      } catch (e) {
        debugPrint('AppImage base64 decode error: $e');
        content = _buildErrorFallback();
      }
    } else if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('blob:')) {
      if (kIsWeb) {
        content = SizedBox(
          width: width,
          height: height,
          child: HtmlElementView.fromTagName(
            key: ValueKey(cleanUrl),
            tagName: 'img',
            onElementCreated: (Object element) {
              final dynamic img = element;
              img.src = cleanUrl;
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = fit == BoxFit.contain ? 'contain' : 'cover';
              img.style.display = 'block';
              img.style.pointerEvents = 'none';
            },
          ),
        );
      } else {
        content = Image.network(
          cleanUrl,
          width: width,
          height: height,
          fit: fit,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return loadingWidget ??
                Container(
                  width: width,
                  height: height,
                  color: AppColors.darkCharcoal,
                  child: const Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: AppColors.primaryYellow,
                        strokeWidth: 2,
                      ),
                    ),
                  ),
                );
          },
          errorBuilder: (context, error, stackTrace) => _buildErrorFallback(),
        );
      }
    } else {
      content = _buildErrorFallback();
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: content,
      );
    }

    return content;
  }

  Widget _buildErrorFallback() {
    if (errorWidget != null) return errorWidget!;
    return Container(
      width: width,
      height: height,
      color: AppColors.backgroundLight,
      child: const Center(
        child: Icon(Icons.home_work_rounded, color: AppColors.darkYellow, size: 40),
      ),
    );
  }
}
