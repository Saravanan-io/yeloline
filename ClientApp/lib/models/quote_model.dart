class QuoteData {
  String structure;
  String cement;
  String steel;
  String bricks;
  String flooring;
  String doors;
  String windows;
  String elevation;

  // Client Details
  String clientName;
  String mobileNumber;
  String whatsAppNumber;
  String location;
  String plotSize;
  String approximateArea;
  String numberOfFloors;
  String preferredStartDate;
  String additionalNotes;

  QuoteData({
    this.structure = '',
    this.cement = '',
    this.steel = '',
    this.bricks = '',
    this.flooring = '',
    this.doors = '',
    this.windows = '',
    this.elevation = '',
    this.clientName = '',
    this.mobileNumber = '',
    this.whatsAppNumber = '',
    this.location = '',
    this.plotSize = '',
    this.approximateArea = '',
    this.numberOfFloors = '',
    this.preferredStartDate = '',
    this.additionalNotes = '',
  });

  int get estimatedRateMin => 2300;
  int get estimatedRateMax => 2400;

  String get estimatedRateFormatted => '₹$estimatedRateMin - ₹$estimatedRateMax / sq.ft.';
}
