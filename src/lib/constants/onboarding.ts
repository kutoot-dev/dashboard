/**
 * Constants: Onboarding wizard configuration
 *
 * Field info tooltips, validation rules, sector options,
 * volume ranges, and rejection reasons.
 */

// ── Field Info Tooltips ────────────────────────────────────────────

export interface FieldInfo {
  label: string;
  placeholder: string;
  tooltip: {
    title: string;
    description: string;
    example: string;
    whyNeeded: string;
  };
}

export const ONBOARDING_FIELDS: Record<string, FieldInfo> = {
  phone: {
    label: "Mobile Number",
    placeholder: "9876543210",
    tooltip: {
      title: "Your 10-digit Mobile Number",
      description:
        "Enter your primary business mobile number. This will be your unique identifier on Kutoot and used for OTP verification.",
      example: "9876543210",
      whyNeeded:
        "Required for authentication, transaction alerts, and communication. One number per merchant.",
    },
  },
  owner_name: {
    label: "Owner Full Name",
    placeholder: "Rajesh Kumar Sharma",
    tooltip: {
      title: "Legal Name of Business Owner",
      description:
        "Enter the full legal name as it appears on your PAN card. Only alphabets and spaces.",
      example: "Rajesh Kumar Sharma",
      whyNeeded:
        "Used for KYC verification. Must match PAN records for compliance.",
    },
  },
  shop_name: {
    label: "Shop / Business Name",
    placeholder: "Sharma General Store",
    tooltip: {
      title: "Your Shop or Business Name",
      description:
        "The name of your shop as displayed on your signboard. This will appear on customer receipts.",
      example: "Sharma General Store, Modern Electronics Hub",
      whyNeeded:
        "Displayed to customers during transactions and used for identification in the Kutoot system.",
    },
  },
  sector: {
    label: "Business Category",
    placeholder: "Select category...",
    tooltip: {
      title: "Type of Business",
      description:
        "Select the category that best describes your primary business activity. This determines your scoring cohort.",
      example: "Grocery, Electronics, Clothing, Restaurant",
      whyNeeded:
        "Used for fair performance comparison. You are scored against similar businesses, not different industries.",
    },
  },
  locality: {
    label: "Area / Locality",
    placeholder: "MG Road, Koramangala",
    tooltip: {
      title: "Shop Locality or Area",
      description:
        "Enter the area, market, or locality where your shop is located. Be as specific as possible.",
      example: "Koramangala 4th Block, MG Road Market",
      whyNeeded:
        "Helps determine your Location Opportunity Index and enables fair comparison with nearby businesses.",
    },
  },
  city: {
    label: "City",
    placeholder: "Bengaluru",
    tooltip: {
      title: "City Name",
      description: "Auto-filled from PIN code. Edit if incorrect.",
      example: "Bengaluru, Mumbai, Jaipur",
      whyNeeded: "Used for location-based scoring and regional analytics.",
    },
  },
  state: {
    label: "State",
    placeholder: "Karnataka",
    tooltip: {
      title: "State Name",
      description: "Auto-filled from PIN code. Edit if incorrect.",
      example: "Karnataka, Maharashtra, Rajasthan",
      whyNeeded: "Required for GST verification and regional compliance.",
    },
  },
  pin_code: {
    label: "PIN Code",
    placeholder: "560034",
    tooltip: {
      title: "6-digit PIN Code",
      description:
        "Enter your shop's PIN code. City and state will be automatically filled.",
      example: "560034 (Koramangala, Bengaluru)",
      whyNeeded:
        "Used to identify your location tier (metro, tier-1, tier-2, etc.) for fair scoring.",
    },
  },
  storefront_photo: {
    label: "Shop Storefront Photo",
    placeholder: "",
    tooltip: {
      title: "Mandatory Photo of Shop Front",
      description:
        "Take a clear photo of your shop's exterior showing the signboard. The photo must be taken live — uploads from gallery are not allowed. GPS location and timestamp are embedded automatically.",
      example: "A well-lit photo showing your shop's name board and entrance.",
      whyNeeded:
        "Verifies the physical existence of your business. Prevents fraudulent registrations. Required for all applications regardless of outcome.",
    },
  },
  commission_rate: {
    label: "Commission Rate (%)",
    placeholder: "2.00",
    tooltip: {
      title: "Transaction Commission Rate",
      description:
        "The percentage of each transaction that Kutoot retains as a service fee. Minimum 2%, maximum 15%. Industry standard for payment services is 2%-5%.",
      example:
        "If set to 3%, on a ₹1,000 transaction, ₹30 goes to Kutoot and ₹970 is credited to your account.",
      whyNeeded:
        "This is the agreed revenue-share model. Lower rates mean more earnings for you, but the minimum of 2% is required to maintain platform operations.",
    },
  },
  commission_model: {
    label: "Commission Model",
    placeholder: "",
    tooltip: {
      title: "Flat or Tiered Commission",
      description:
        "Flat Rate: same percentage on all transactions. Tiered: different rates for different transaction slabs (e.g., lower rate for high-volume months).",
      example:
        "Flat: 2.5% on everything. Tiered: 2.5% up to ₹1L, 2% for ₹1L-₹5L, 1.8% above ₹5L.",
      whyNeeded:
        "Choose the model that best fits your expected transaction volume. Tiered rewards high-volume merchants.",
    },
  },
  gst_number: {
    label: "GST Number (GSTIN)",
    placeholder: "29ABCDE1234F1Z5",
    tooltip: {
      title: "15-character GST Identification Number",
      description:
        "Your GST Identification Number as registered with the government. Format: 2-digit state code + 10-char PAN + 1 entity + 1 Z + 1 check digit.",
      example: "29ABCDE1234F1Z5 (Karnataka-registered business)",
      whyNeeded:
        "Used to verify your business registration. If verification API fails, your application will NOT be blocked — it will be queued for manual review.",
    },
  },
  pan_number: {
    label: "PAN Number",
    placeholder: "ABCDE1234F",
    tooltip: {
      title: "10-character Permanent Account Number",
      description:
        "Your PAN as issued by the Income Tax Department. Format: 5 letters + 4 digits + 1 letter.",
      example: "ABCDE1234F",
      whyNeeded:
        "Tax compliance requirement. The name on PAN is cross-checked against the owner name you provided. Mismatches are flagged but do NOT block onboarding.",
    },
  },
  aadhaar_number: {
    label: "Aadhaar Number (Optional)",
    placeholder: "XXXX XXXX 1234",
    tooltip: {
      title: "12-digit Aadhaar Number",
      description:
        "Optional. If provided, only the last 4 digits are stored. Your full number is never saved in our system.",
      example: "Displayed as XXXX-XXXX-1234",
      whyNeeded:
        "Additional identity verification. Completely optional and only the masked version is stored.",
    },
  },
  bank_account_name: {
    label: "Account Holder Name",
    placeholder: "Rajesh Kumar Sharma",
    tooltip: {
      title: "Name on Bank Account",
      description:
        "The name exactly as it appears on your bank account. Should match your PAN name.",
      example: "RAJESH KUMAR SHARMA",
      whyNeeded: "Required for payout disbursement. Must match bank records.",
    },
  },
  bank_account_number: {
    label: "Account Number",
    placeholder: "123456789012",
    tooltip: {
      title: "Bank Account Number",
      description:
        "Enter your savings or current account number (9-18 digits). You will be asked to confirm it.",
      example: "123456789012 (12 digits for SBI)",
      whyNeeded:
        "Payouts from Kutoot will be credited to this account. Verified via a ₹1 test deposit.",
    },
  },
  bank_account_confirm: {
    label: "Confirm Account Number",
    placeholder: "123456789012",
    tooltip: {
      title: "Re-enter Account Number",
      description:
        "Type your account number again to prevent typos. Must match exactly.",
      example: "Same as above",
      whyNeeded:
        "A single wrong digit sends money to the wrong account. This double-entry prevents errors.",
    },
  },
  bank_ifsc: {
    label: "IFSC Code",
    placeholder: "SBIN0001234",
    tooltip: {
      title: "11-character IFSC Code",
      description:
        "Your bank branch's IFSC code. First 4 chars are the bank code, 5th is 0, last 6 identify the branch. Found on your cheque book or bank website.",
      example: "SBIN0001234 (SBI), HDFC0000123 (HDFC)",
      whyNeeded:
        "Identifies your exact bank branch for NEFT/IMPS payouts. Bank name is auto-fetched from IFSC.",
    },
  },
  qr_serial: {
    label: "QR Code Serial Number",
    placeholder: "KT-QR-00001234",
    tooltip: {
      title: "Physical QR Code Serial",
      description:
        "Scan or manually enter the serial number printed on the physical QR sticker provided by Kutoot.",
      example: "KT-QR-00001234",
      whyNeeded:
        "Links this physical QR to your merchant account. Customers scan this QR to pay you.",
    },
  },
  qr_photo: {
    label: "QR Placement Photo",
    placeholder: "",
    tooltip: {
      title: "Photo of QR Placed Inside Shop",
      description:
        "Take a photo showing the QR code sticker placed inside your shop, clearly visible to customers.",
      example: "QR sticker on the counter near the billing area.",
      whyNeeded:
        "Confirms the QR is physically placed and ready for customer payments.",
    },
  },
  operating_hours: {
    label: "Shop Operating Hours",
    placeholder: "09:00 AM - 09:00 PM",
    tooltip: {
      title: "Your Daily Operating Hours",
      description:
        "The typical time range when your shop is open for business.",
      example: "09:00 AM to 09:00 PM, 10:00 AM to 11:00 PM",
      whyNeeded:
        "Used to calculate your shop activity score. Transactions outside these hours may be flagged.",
    },
  },
  expected_volume: {
    label: "Expected Monthly Transaction Volume",
    placeholder: "Select range...",
    tooltip: {
      title: "Estimated Monthly Volume",
      description:
        "Your best estimate of total monthly transaction value through Kutoot.",
      example: "₹50K-₹2L for a small grocery, ₹2L-₹5L for a busy electronics shop",
      whyNeeded:
        "Helps us set appropriate expectations and thresholds. Not binding — you won't be penalized for under/over-estimating.",
    },
  },
  employee_code: {
    label: "Employee Code",
    placeholder: "KT1234",
    tooltip: {
      title: "Field Executive Employee Code",
      description:
        "Your unique Kutoot employee code (6-8 alphanumeric characters) provided by your manager.",
      example: "KT1234, EX00789",
      whyNeeded:
        "Authenticates you as an authorized field executive and links onboardings to your performance record.",
    },
  },
};

// ── Validation Rules ───────────────────────────────────────────────

export const VALIDATION_RULES = {
  phone: { minLength: 10, maxLength: 10, pattern: /^[6-9]\d{9}$/ },
  owner_name: { minLength: 2, maxLength: 100, pattern: /^[A-Za-z\s.]+$/ },
  shop_name: { minLength: 2, maxLength: 150 },
  pin_code: { minLength: 6, maxLength: 6, pattern: /^\d{6}$/ },
  commission_rate: { min: 2.0, max: 15.0 },
  gst_number: {
    length: 15,
    pattern: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}Z[A-Z0-9]{1}$/,
  },
  pan_number: { length: 10, pattern: /^[A-Z]{5}\d{4}[A-Z]{1}$/ },
  aadhaar_number: { length: 12, pattern: /^\d{12}$/ },
  bank_account_number: { minLength: 9, maxLength: 18, pattern: /^\d{9,18}$/ },
  bank_ifsc: {
    length: 11,
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  },
  employee_code: {
    minLength: 4,
    maxLength: 8,
    pattern: /^[A-Za-z0-9]{4,8}$/,
  },
  photo_min_size: 100 * 1024, // 100KB
  photo_max_size: 10 * 1024 * 1024, // 10MB
  photo_types: ["image/jpeg", "image/png"],
  honeypot_field: "website_url", // hidden field — if filled, reject
  min_form_time_seconds: 30, // less than 30s = bot
};

// ── Sector Options ─────────────────────────────────────────────────

export const SECTOR_OPTIONS = [
  { value: "grocery", label: "Grocery & Kirana" },
  { value: "electronics", label: "Electronics & Appliances" },
  { value: "clothing", label: "Clothing & Fashion" },
  { value: "restaurant", label: "Restaurant & Food" },
  { value: "pharmacy", label: "Pharmacy & Medical" },
  { value: "hardware", label: "Hardware & Tools" },
  { value: "stationery", label: "Stationery & Books" },
  { value: "beauty", label: "Beauty & Salon" },
  { value: "auto_parts", label: "Auto Parts & Service" },
  { value: "mobile_repair", label: "Mobile & Repair" },
  { value: "jewellery", label: "Jewellery & Accessories" },
  { value: "other", label: "Other" },
];

// ── Volume Range Options ───────────────────────────────────────────

export const VOLUME_RANGES = [
  { value: "0-50k", label: "Up to ₹50,000" },
  { value: "50k-2l", label: "₹50,000 – ₹2,00,000" },
  { value: "2l-5l", label: "₹2,00,000 – ₹5,00,000" },
  { value: "5l+", label: "Above ₹5,00,000" },
];

// ── Commission Tiers (Default) ─────────────────────────────────────

export const DEFAULT_COMMISSION_TIERS = [
  { min_amount: 0, max_amount: 100000, rate_percent: 2.5 },
  { min_amount: 100001, max_amount: 500000, rate_percent: 2.0 },
  { min_amount: 500001, max_amount: null, rate_percent: 1.8 },
];

// ── Application Status Labels ──────────────────────────────────────

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_photo: "Pending Photo",
  pending_review: "Under Review",
  pending_kyc_review: "KYC Review",
  pending_bank_verify: "Bank Verification",
  pending_activation: "Pending Activation",
  active: "Active",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const APPLICATION_STATUS_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  draft: { bg: "bg-gray-500/10", text: "text-gray-400" },
  pending_photo: { bg: "bg-warning/10", text: "text-warning" },
  pending_review: { bg: "bg-info/10", text: "text-info" },
  pending_kyc_review: { bg: "bg-warning/10", text: "text-warning" },
  pending_bank_verify: { bg: "bg-warning/10", text: "text-warning" },
  pending_activation: { bg: "bg-info/10", text: "text-info" },
  active: { bg: "bg-success/10", text: "text-success" },
  rejected: { bg: "bg-error/10", text: "text-error" },
  suspended: { bg: "bg-error/10", text: "text-error" },
};

// ── State List (India) ─────────────────────────────────────────────

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ── Incentive Amounts ──────────────────────────────────────────────

export const INCENTIVE_AMOUNTS = {
  onboarding_complete: 50,
  first_transaction: 100,
  thirty_day_retention: 200,
};

// ── Strings ────────────────────────────────────────────────────────

export const ONBOARDING_STRINGS = {
  PAGE_TITLE: "Merchant Onboarding",
  PAGE_SUBTITLE: "Join Kutoot and start accepting digital payments",
  RESUME_TITLE: "Resume Application",
  RESUME_SUBTITLE: "Continue where you left off",

  STEP1_TITLE: "How are you filling this form?",
  STEP1_MERCHANT: "I am a Merchant",
  STEP1_MERCHANT_DESC: "I want to register my own business",
  STEP1_EXECUTIVE: "I am a Field Executive",
  STEP1_EXECUTIVE_DESC: "Registering on behalf of a merchant",

  ALREADY_SUBMITTED:
    "An application has already been submitted for this mobile number.",
  ALREADY_ACTIVE: "This merchant is already active on Kutoot.",
  EXISTING_LEAD: "A lead already exists for this number.",
  PHONE_AVAILABLE: "This number is available for registration.",

  COMMISSION_MIN_ERROR: "Commission rate cannot be less than 2%",
  COMMISSION_MAX_ERROR: "Commission rate cannot exceed 15%",
  COMMISSION_AGREEMENT: "I understand and agree to the commission terms above",

  PHOTO_REQUIRED: "Shop storefront photo is mandatory for all applications",
  PHOTO_GPS_MISSING:
    "Please enable location services. GPS coordinates are required for the photo.",
  PHOTO_SIZE_ERROR: "Photo must be between 100KB and 10MB",
  PHOTO_TYPE_ERROR: "Only JPEG and PNG photos are accepted",

  API_FAIL_GST:
    "GST verification service is temporarily unavailable. Your application will proceed and GST will be verified manually.",
  API_FAIL_PAN:
    "PAN verification service is temporarily unavailable. Your application will proceed and PAN will be verified manually.",
  API_FAIL_BANK:
    "Bank verification is pending. Your onboarding will proceed and bank details will be verified separately.",

  SUBMIT_SUCCESS: "Application submitted successfully!",
  DRAFT_SAVED: "Progress saved. You can resume anytime.",
  TERMS_REQUIRED: "You must accept the Terms & Conditions to proceed",
  PRIVACY_REQUIRED: "You must accept the Privacy Policy to proceed",
};
