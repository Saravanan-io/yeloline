/// Utility for formatting currency and numbers cleanly in Indian/International formats.
class CurrencyFormatter {
  static String format(dynamic value) {
    if (value == null) return '0.00';
    final numVal = double.tryParse(value.toString()) ?? 0.0;

    final isNegative = numVal < 0;
    final absVal = numVal.abs();
    final parts = absVal.toStringAsFixed(2).split('.');
    final whole = parts[0];
    final dec = parts[1];

    if (whole.length <= 3) {
      return '${isNegative ? '-' : ''}$whole.$dec';
    }

    final lastThree = whole.substring(whole.length - 3);
    final remaining = whole.substring(0, whole.length - 3);

    final buffer = StringBuffer();
    for (int i = 0; i < remaining.length; i++) {
      if (i > 0 && (remaining.length - i) % 2 == 0) {
        buffer.write(',');
      }
      buffer.write(remaining[i]);
    }
    buffer.write(',');
    buffer.write(lastThree);
    buffer.write('.');
    buffer.write(dec);

    return '${isNegative ? '-' : ''}${buffer.toString()}';
  }

  static String formatCompactLakhs(dynamic value) {
    if (value == null) return '₹0.00L';
    final numVal = double.tryParse(value.toString()) ?? 0.0;
    final lakhs = numVal / 100000.0;
    return '₹${lakhs.toStringAsFixed(2)}L';
  }
}
