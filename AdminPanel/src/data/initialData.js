// Initial Seed Data for Yeloline Admin Web Application

export const initialEnquiries = [];
export const initialMasterHighlights = [];
export const initialProjects = [];
export const initialExpenses = [];
export const initialPurchases = [];
export const initialPayments = [];
export const initialAppointments = [];
export const monthlyFinancialOverview = [];
export const initialUsers = [];

export const masterCategoriesMeta = [
  { key: "lead_stage", name: "Lead & Enquiry Stages", group: "Leads" },
  { key: "structure_type", name: "Structure & Building Types", group: "Leads" },
  { key: "cement_brand", name: "Cement Brands & Specs", group: "Materials" },
  { key: "steel_brand", name: "Steel Brands & Specs", group: "Materials" },
  { key: "bricks_blocks_spec", name: "Bricks & Blocks Specs", group: "Materials" },
  { key: "flooring_spec", name: "Flooring Specs", group: "Materials" },
  { key: "doors_windows_spec", name: "Doors & Windows Specs", group: "Materials" },
  { key: "expense_category", name: "Expense Categories", group: "Finance" },
  { key: "payment_method", name: "Payment Methods", group: "Finance" },
  { key: "material_category", name: "Material Purchase Categories", group: "Finance" },
  { key: "renovation_service", name: "Renovation Appointment Services", group: "Services" },
  { key: "user_role", name: "System User Roles", group: "Users" }
];

export const initialDropdownMasters = [
  // Lead Stages
  { id: "DM-101", category: "lead_stage", label: "New Enquiry", code: "NEW_ENQ", color: "#3B82F6", status: "Active", sort_order: 1, description: "Initial contact or lead submission" },
  { id: "DM-102", category: "lead_stage", label: "Contacted", code: "CONTACTED", color: "#8B5CF6", status: "Active", sort_order: 2, description: "Sales team spoken with client" },
  { id: "DM-103", category: "lead_stage", label: "Site Visit Scheduled", code: "SITE_VISIT", color: "#F59E0B", status: "Active", sort_order: 3, description: "Site inspection appointment fixed" },
  { id: "DM-104", category: "lead_stage", label: "Estimate Shared", code: "ESTIMATE", color: "#EC4899", status: "Active", sort_order: 4, description: "Detailed cost estimate sent to client" },
  { id: "DM-105", category: "lead_stage", label: "Converted", code: "CONVERTED", color: "#10B981", status: "Active", sort_order: 5, description: "Agreement signed & project booked" },
  { id: "DM-106", category: "lead_stage", label: "Closed / Lost", code: "CLOSED_LOST", color: "#64748B", status: "Active", sort_order: 6, description: "Client cancelled or did not proceed" },

  // Structure Types
  { id: "DM-201", category: "structure_type", label: "Residential House", code: "RESIDENTIAL", color: "#3B82F6", status: "Active", sort_order: 1, description: "Individual duplex or multi-floor home" },
  { id: "DM-202", category: "structure_type", label: "Villa", code: "VILLA", color: "#10B981", status: "Active", sort_order: 2, description: "Luxury standalone villa construction" },
  { id: "DM-203", category: "structure_type", label: "Commercial Building", code: "COMMERCIAL", color: "#8B5CF6", status: "Active", sort_order: 3, description: "Office space, retail or showroom" },
  { id: "DM-204", category: "structure_type", label: "Renovation & Remodeling", code: "RENOVATION", color: "#F59E0B", status: "Active", sort_order: 4, description: "Existing building redesign & upgrade" },
  { id: "DM-205", category: "structure_type", label: "Industrial Shed", code: "INDUSTRIAL", color: "#64748B", status: "Active", sort_order: 5, description: "Factory or warehouse steel structure" },

  // Cement Brands
  { id: "DM-301", category: "cement_brand", label: "UltraTech PPC (Premium)", code: "ULTRATECH", color: "#EAB308", status: "Active", sort_order: 1, description: "High performance PPC cement" },
  { id: "DM-302", category: "cement_brand", label: "Ambuja PPC (Premium)", code: "AMBUJA", color: "#3B82F6", status: "Active", sort_order: 2, description: "Water-repellent composite cement" },
  { id: "DM-303", category: "cement_brand", label: "ACC PPC (Premium)", code: "ACC", color: "#EF4444", status: "Active", sort_order: 3, description: "High early strength concrete cement" },
  { id: "DM-304", category: "cement_brand", label: "Dalmia DSP", code: "DALMIA", color: "#10B981", status: "Active", sort_order: 4, description: "Specialty foundation cement" },
  { id: "DM-305", category: "cement_brand", label: "Ramco Supergrade", code: "RAMCO", color: "#8B5CF6", status: "Active", sort_order: 5, description: "Supergrade slag cement" },

  // Steel Brands
  { id: "DM-401", category: "steel_brand", label: "TATA Tiscon 550D (High Strength)", code: "TATA_TISCON", color: "#3B82F6", status: "Active", sort_order: 1, description: "Fe 550D earthquake resistant TMT" },
  { id: "DM-402", category: "steel_brand", label: "JSW Neosteel (Premium)", code: "JSW_NEO", color: "#10B981", status: "Active", sort_order: 2, description: "High ductility Fe 550 rebar" },
  { id: "DM-403", category: "steel_brand", label: "SAIL TMT (Fe 550)", code: "SAIL_TMT", color: "#8B5CF6", status: "Active", sort_order: 3, description: "Government certified steel bars" },
  { id: "DM-404", category: "steel_brand", label: "Vizag Steel 500D", code: "VIZAG_STEEL", color: "#F59E0B", status: "Active", sort_order: 4, description: "Fe 500D grade structural steel" },

  // Bricks & Blocks
  { id: "DM-501", category: "bricks_blocks_spec", label: "Red Bricks (Premium)", code: "RED_BRICKS", color: "#EF4444", status: "Active", sort_order: 1, description: "Kiln-burnt traditional clay bricks" },
  { id: "DM-502", category: "bricks_blocks_spec", label: "AAC Blocks (Lightweight)", code: "AAC_BLOCKS", color: "#3B82F6", status: "Active", sort_order: 2, description: "Autoclaved aerated concrete blocks" },
  { id: "DM-503", category: "bricks_blocks_spec", label: "Fly Ash Bricks (Eco Friendly)", code: "FLYASH_BRICKS", color: "#64748B", status: "Active", sort_order: 3, description: "Eco-friendly cement fly ash bricks" },
  { id: "DM-504", category: "bricks_blocks_spec", label: "Solid Concrete Blocks", code: "SOLID_BLOCKS", color: "#8B5CF6", status: "Active", sort_order: 4, description: "Heavy masonry load-bearing blocks" },

  // Flooring Specs
  { id: "DM-601", category: "flooring_spec", label: "Vitrified Tiles (Premium)", code: "VITRIFIED_TILES", color: "#10B981", status: "Active", sort_order: 1, description: "Double-charged 2x2 vitrified tiles" },
  { id: "DM-602", category: "flooring_spec", label: "Italian Marble (Imported)", code: "ITALIAN_MARBLE", color: "#EC4899", status: "Active", sort_order: 2, description: "High-grade polished Italian marble" },
  { id: "DM-603", category: "flooring_spec", label: "Granite Flooring (Premium)", code: "GRANITE", color: "#8B5CF6", status: "Active", sort_order: 3, description: "Jet black & South Indian granite" },
  { id: "DM-604", category: "flooring_spec", label: "Teak Wooden Flooring", code: "TEAK_WOOD_FLOOR", color: "#F59E0B", status: "Active", sort_order: 4, description: "Engineered hardwood plank flooring" },

  // Doors & Windows Specs
  { id: "DM-701", category: "doors_windows_spec", label: "Teak Wood Doors (Premium)", code: "TEAK_DOORS", color: "#F59E0B", status: "Active", sort_order: 1, description: "Burma/Ghana teak carved doors" },
  { id: "DM-702", category: "doors_windows_spec", label: "Flush Doors (Teak Frame)", code: "FLUSH_DOORS", color: "#3B82F6", status: "Active", sort_order: 2, description: "Veneered flush doors for bedrooms" },
  { id: "DM-703", category: "doors_windows_spec", label: "UPVC Sliding Windows (Soundproof)", code: "UPVC_WINDOWS", color: "#10B981", status: "Active", sort_order: 3, description: "Multi-chambered acoustic UPVC profile" },
  { id: "DM-704", category: "doors_windows_spec", label: "Aluminium Windows (Powder Coated)", code: "ALUM_WINDOWS", color: "#8B5CF6", status: "Active", sort_order: 4, description: "Anodized aluminium section glass window" },

  // Expense Categories
  { id: "DM-801", category: "expense_category", label: "Raw Materials", code: "RAW_MATERIALS", color: "#3B82F6", status: "Active", sort_order: 1, description: "Cement, steel, sand & aggregate purchases" },
  { id: "DM-802", category: "expense_category", label: "Labour Charges", code: "LABOUR", color: "#F59E0B", status: "Active", sort_order: 2, description: "Daily wages, mason payout & contract fees" },
  { id: "DM-803", category: "expense_category", label: "Heavy Equipment Rental", code: "EQUIPMENT", color: "#8B5CF6", status: "Active", sort_order: 3, description: "JCB, crane, mixer machine rentals" },
  { id: "DM-804", category: "expense_category", label: "Site Permits & Fees", code: "PERMITS", color: "#EC4899", status: "Active", sort_order: 4, description: "Plan sanction, EB approval, municipal fees" },
  { id: "DM-805", category: "expense_category", label: "Transport & Freight", code: "TRANSPORT", color: "#10B981", status: "Active", sort_order: 5, description: "Material haulage, lorry freight & diesel" },

  // Payment Methods
  { id: "DM-901", category: "payment_method", label: "Bank Transfer", code: "BANK_TRANSFER", color: "#3B82F6", status: "Active", sort_order: 1, description: "Direct bank account wire transfer" },
  { id: "DM-902", category: "payment_method", label: "UPI", code: "UPI", color: "#10B981", status: "Active", sort_order: 2, description: "Instant mobile QR/UPI payment" },
  { id: "DM-903", category: "payment_method", label: "Cheque", code: "CHEQUE", color: "#8B5CF6", status: "Active", sort_order: 3, description: "Account payee banker cheque" },
  { id: "DM-904", category: "payment_method", label: "Cash Payment", code: "CASH", color: "#F59E0B", status: "Active", sort_order: 4, description: "Petty cash or hand receipt" },

  // Material Categories
  { id: "DM-1001", category: "material_category", label: "Cement & Steel", code: "CEMENT_STEEL", color: "#3B82F6", status: "Active", sort_order: 1, description: "Primary structural raw materials" },
  { id: "DM-1002", category: "material_category", label: "Bricks & Blocks", code: "BRICKS_BLOCKS", color: "#EF4444", status: "Active", sort_order: 2, description: "Masonry clay bricks & AAC blocks" },
  { id: "DM-1003", category: "material_category", label: "Tiles & Flooring", code: "TILES_FLOORING", color: "#10B981", status: "Active", sort_order: 3, description: "Vitrified, granite & marble tiles" },
  { id: "DM-1004", category: "material_category", label: "Electrical & Plumbing", code: "ELEC_PLUMB", color: "#F59E0B", status: "Active", sort_order: 4, description: "Cables, switches, PVC pipes & fittings" },
  { id: "DM-1005", category: "material_category", label: "Paints & Chemicals", code: "PAINTS", color: "#EC4899", status: "Active", sort_order: 5, description: "Primer, emulsions & waterproofing compound" },

  // Renovation Services
  { id: "DM-1101", category: "renovation_service", label: "Kitchen Remodeling", code: "KITCHEN_REMODEL", color: "#F59E0B", status: "Active", sort_order: 1, description: "Modular kitchen setup & quartz counters" },
  { id: "DM-1102", category: "renovation_service", label: "Bathroom Upgrade", code: "BATH_UPGRADE", color: "#3B82F6", status: "Active", sort_order: 2, description: "Sanitaryware, tiling & concealed plumbing" },
  { id: "DM-1103", category: "renovation_service", label: "Painting & Waterproofing", code: "PAINT_WATERPROOF", color: "#10B981", status: "Active", sort_order: 3, description: "Exterior emulsion & terrace waterproofing" },
  { id: "DM-1104", category: "renovation_service", label: "Roofing & Structure", code: "ROOFING", color: "#8B5CF6", status: "Active", sort_order: 4, description: "Polycarbonate/metal roofing sheet extension" },
  { id: "DM-1105", category: "renovation_service", label: "Full Home Renovation", code: "FULL_RENOVATION", color: "#EC4899", status: "Active", sort_order: 5, description: "Complete interior & structural overhaul" },

  // User Roles
  { id: "DM-1201", category: "user_role", label: "Super Admin", code: "SUPER_ADMIN", color: "#EAB308", status: "Active", sort_order: 1, description: "Full system control & configuration rights" },
  { id: "DM-1202", category: "user_role", label: "Project Manager", code: "PROJECT_MGR", color: "#3B82F6", status: "Active", sort_order: 2, description: "Site operations, billing & schedules" },
  { id: "DM-1203", category: "user_role", label: "Site Engineer", code: "SITE_ENG", color: "#10B981", status: "Active", sort_order: 3, description: "On-site quality, material log & daily logs" },
  { id: "DM-1204", category: "user_role", label: "Accountant", code: "ACCOUNTANT", color: "#8B5CF6", status: "Active", sort_order: 4, description: "Expenses, payments, purchases & invoice auditing" },
  { id: "DM-1205", category: "user_role", label: "Architecture Designer", code: "ARCH_DESIGNER", color: "#EC4899", status: "Active", sort_order: 5, description: "Floor plans, 3D renderings & client specs" },
  { id: "DM-1206", category: "user_role", label: "Quality Inspector", code: "QUALITY_INSP", color: "#F59E0B", status: "Active", sort_order: 6, description: "Concrete strength testing & safety checks" }
];

export const initialContactEnquiries = [];
export const initialSites = [];

export const SITE_COLUMNS_SPEC = [
  { key: "site_id", label: "Site ID", type: "String", required: true, example: "SITE-101" },
  { key: "site_name", label: "Site Name", type: "String", required: true, example: "Modern Minimalist Villa - Perundurai" },
  { key: "client_name", label: "Client Name", type: "String", required: true, example: "Ramesh Sundaram" },
  { key: "client_phone", label: "Client Phone", type: "String", required: true, example: "+91 98421 88321" },
  { key: "client_email", label: "Client Email", type: "String", required: false, example: "ramesh.s@gmail.com" },
  { key: "location", label: "Location / Address", type: "String", required: true, example: "Perundurai Road, Erode" },
  { key: "structure_type", label: "Structure Type", type: "String", required: true, example: "Villa" },
  { key: "builtup_area_sqft", label: "Area (sq ft)", type: "Number", required: true, example: "3200" },
  { key: "number_of_floors", label: "Floors", type: "String", required: true, example: "G + 1 Floor" },
  { key: "estimated_budget", label: "Estimated Budget (₹)", type: "Number", required: true, example: "7200000" },
  { key: "supervisor_in_charge", label: "Site Supervisor", type: "String", required: true, example: "Er. S. Prakash" },
  { key: "start_date", label: "Start Date", type: "Date", required: true, example: "2026-02-15" },
  { key: "target_completion_date", label: "Target Completion Date", type: "Date", required: true, example: "2026-11-30" },
  { key: "status", label: "Status", type: "String", required: true, example: "In Progress" },
  { key: "progress_percentage", label: "Progress %", type: "Number", required: false, example: "65" },
  { key: "cement_brand", label: "Cement Brand", type: "String", required: false, example: "UltraTech PPC (Premium)" },
  { key: "steel_brand", label: "Steel Brand", type: "String", required: false, example: "TATA Tiscon 550D" },
  { key: "bricks_spec", label: "Bricks / Blocks Spec", type: "String", required: false, example: "Red Bricks (Premium)" },
  { key: "flooring_spec", label: "Flooring Spec", type: "String", required: false, example: "Vitrified Tiles (Premium)" },
  { key: "description", label: "Notes / Description", type: "String", required: false, example: "Turnkey luxury villa" }
];

export const initialCompanySettings = {
  whatsapp_number: "+91 98421 88321",
  contact_number: "+91 98421 88321",
  secondary_phone: "+91 97892 11045",
  support_email: "contact@yeloline.com",
  office_address: "No. 45, Perundurai Road, Near Golden City, Erode - 638011, Tamil Nadu",
  business_hours: "Monday - Saturday: 8:30 AM - 7:00 PM",
  maps_link: "https://maps.google.com/?q=Yeloline+Construction+Erode",
  website_url: "https://yeloline.com",
  instagram_url: "https://instagram.com/yeloline_constructions",
  facebook_url: "https://facebook.com/yelolineconstructions"
};
export const PAYMENT_BREAKUP_COLUMNS_SPEC = [
  { key: "sno", label: "S.NO", type: "Number", required: true, example: 1 },
  { key: "stage_name", label: "DESCRIPTION OF WORK", type: "String", required: true, example: "MOBILIZATION ADVANCE (16%)" },
  { key: "amount", label: "AMOUNT", type: "Number", required: false, example: "" },
  { key: "work_schedule", label: "WORK SCHEDULE", type: "String", required: false, example: "" }
];

export const DEFAULT_PAYMENT_BREAKUP_STAGES = [
  { sno: 1, stage_name: "MOBILIZATION ADVANCE (16%)", amount: "", work_schedule: "" },
  { sno: 2, stage_name: "ON COMPLETION OF BASEMENT", amount: "", work_schedule: "" },
  { sno: 3, stage_name: "ON COMPLETION OF 7' LINTEL LEVEL RCC WORK", amount: "", work_schedule: "" },
  { sno: 4, stage_name: "ON COMPLETION OF GROUND FLOOR ROOF CONCRETE", amount: "", work_schedule: "" },
  { sno: 5, stage_name: "ON COMPLETION OF MEP CONCEALED WORK", amount: "", work_schedule: "" },
  { sno: 6, stage_name: "ON COMPLETION OF WALL PLASTERING", amount: "", work_schedule: "" },
  { sno: 7, stage_name: "ON COMPLETION OF TILE LAYING", amount: "", work_schedule: "" },
  { sno: 8, stage_name: "ON COMPLETION OF UPVC WINDOW & DOOR FIXING", amount: "", work_schedule: "" },
  { sno: 9, stage_name: "ON COMPLETION OF INTERIOR WALL PAINTING", amount: "", work_schedule: "" },
  { sno: 10, stage_name: "ON COMPLETION OF ALL FINISHING WORKS", amount: "", work_schedule: "" }
];export const DEFAULT_MONTHLY_BILLING_AREAS = [];

export const DEFAULT_MONTHLY_BILLING_AMENITIES = [];
