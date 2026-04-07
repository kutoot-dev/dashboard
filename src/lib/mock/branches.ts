/**

 * Mock Data: Branches

 *

 * 50 Indian branches with realistic business names distributed across

 * all 12 sectors and 30 locations. Includes varied statuses and

 * transaction patterns for chart diversity.

 */



import type { Branch } from "@/lib/types";
import { getHOForBranch } from "./head-offices";

const _RAW: Omit<Branch, "ho_id">[] = [

  // â”€â”€ Kirana & Grocery (sec-001) â”€â”€

  { branch_id: "m-001", business_name: "Sharma General Store", owner_name: "Rajesh Sharma", phone: "9876543210", email: "rajesh.sharma@mail.com", gst_number: "27AADCS1234F1Z5", registration_date: "2024-03-15T00:00:00Z", sector_id: "sec-001", location_id: "loc-001", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 84, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.65, status: "active", created_at: "2024-03-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-002", business_name: "Verma Kirana Mart", owner_name: "Sunil Verma", phone: "9876543211", email: "sunil.verma@mail.com", gst_number: "07AADCV5678G1Z3", registration_date: "2024-05-10T00:00:00Z", sector_id: "sec-001", location_id: "loc-002", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 78, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.58, status: "active", created_at: "2024-05-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-003", business_name: "Reddy Provisions", owner_name: "Srinivas Reddy", phone: "9876543212", email: "srinivas.reddy@mail.com", gst_number: "36AADCR9012H1Z1", registration_date: "2024-07-01T00:00:00Z", sector_id: "sec-001", location_id: "loc-006", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 80, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.72, status: "active", created_at: "2024-07-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-004", business_name: "Nair Supermarket", owner_name: "Deepak Nair", phone: "9876543213", email: "deepak.nair@mail.com", gst_number: "32AADCN3456I1Z9", registration_date: "2024-01-20T00:00:00Z", sector_id: "sec-001", location_id: "loc-013", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 72, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.60, status: "active", created_at: "2024-01-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Pharmacy & Wellness (sec-002) â”€â”€

  { branch_id: "m-005", business_name: "Gupta Pharmacy", owner_name: "Anil Gupta", phone: "9876543214", email: "anil.gupta@mail.com", gst_number: "27AADCG7890J1Z7", registration_date: "2024-02-10T00:00:00Z", sector_id: "sec-002", location_id: "loc-001", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 70, is_franchise: false, is_regulated_margin: true, declared_capacity: null, platform_capture_percentage: 0.55, status: "active", created_at: "2024-02-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-006", business_name: "MedPlus Wellness Hub", owner_name: "Priya Mehta", phone: "9876543215", email: "priya.mehta@mail.com", gst_number: "24AADCM1234K1Z5", registration_date: "2024-06-15T00:00:00Z", sector_id: "sec-002", location_id: "loc-008", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 65, is_franchise: true, is_regulated_margin: true, declared_capacity: null, platform_capture_percentage: 0.70, status: "active", created_at: "2024-06-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-007", business_name: "Jain Medical Stores", owner_name: "Rakesh Jain", phone: "9876543216", email: "rakesh.jain@mail.com", gst_number: "08AADCJ5678L1Z3", registration_date: "2024-08-20T00:00:00Z", sector_id: "sec-002", location_id: "loc-012", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: true, declared_capacity: null, platform_capture_percentage: 0.48, status: "active", created_at: "2024-08-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-008", business_name: "Pandey Health Mart", owner_name: "Vivek Pandey", phone: "9876543217", email: "vivek.pandey@mail.com", gst_number: "09AADCP9012M1Z1", registration_date: "2025-11-01T00:00:00Z", sector_id: "sec-002", location_id: "loc-018", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 55, is_franchise: false, is_regulated_margin: true, declared_capacity: null, platform_capture_percentage: 0.42, status: "active", created_at: "2025-11-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Electronics & Appliances (sec-003) â”€â”€

  { branch_id: "m-009", business_name: "Patel Electronics", owner_name: "Nikhil Patel", phone: "9876543218", email: "nikhil.patel@mail.com", gst_number: "24AADCP3456N1Z9", registration_date: "2024-04-05T00:00:00Z", sector_id: "sec-003", location_id: "loc-008", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.45, status: "active", created_at: "2024-04-05T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-010", business_name: "Kumar Electronics World", owner_name: "Manoj Kumar", phone: "9876543219", email: "manoj.kumar@mail.com", gst_number: "29AADCK7890O1Z7", registration_date: "2024-03-01T00:00:00Z", sector_id: "sec-003", location_id: "loc-003", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 65, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.52, status: "active", created_at: "2024-03-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-011", business_name: "TechZone Appliances", owner_name: "Arjun Singh", phone: "9876543220", email: "arjun.singh@mail.com", gst_number: "07AADCT1234P1Z5", registration_date: "2024-09-10T00:00:00Z", sector_id: "sec-003", location_id: "loc-002", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.50, status: "active", created_at: "2024-09-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-012", business_name: "Choudhary Digital", owner_name: "Amit Choudhary", phone: "9876543221", email: "amit.choudhary@mail.com", gst_number: "08AADCC5678Q1Z3", registration_date: "2024-11-15T00:00:00Z", sector_id: "sec-003", location_id: "loc-009", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 55, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.40, status: "under_review", created_at: "2024-11-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Fashion & Textiles (sec-004) â”€â”€

  { branch_id: "m-013", business_name: "Agarwal Sarees Emporium", owner_name: "Vinod Agarwal", phone: "9876543222", email: "vinod.agarwal@mail.com", gst_number: "09AADCA9012R1Z1", registration_date: "2024-02-28T00:00:00Z", sector_id: "sec-004", location_id: "loc-018", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 65, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.35, status: "active", created_at: "2024-02-28T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-014", business_name: "Kapoor Fashion House", owner_name: "Rohit Kapoor", phone: "9876543223", email: "rohit.kapoor@mail.com", gst_number: "07AADCK3456S1Z9", registration_date: "2024-05-15T00:00:00Z", sector_id: "sec-004", location_id: "loc-002", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 55, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.42, status: "active", created_at: "2024-05-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-015", business_name: "Bansal Garments", owner_name: "Pooja Bansal", phone: "9876543224", email: "pooja.bansal@mail.com", gst_number: "08AADCB7890T1Z7", registration_date: "2024-04-20T00:00:00Z", sector_id: "sec-004", location_id: "loc-009", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 50, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.38, status: "active", created_at: "2024-04-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-016", business_name: "Textile Bazaar Chennai", owner_name: "Suresh Iyer", phone: "9876543225", email: "suresh.iyer@mail.com", gst_number: "33AADCT1234U1Z5", registration_date: "2024-07-10T00:00:00Z", sector_id: "sec-004", location_id: "loc-004", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.45, status: "active", created_at: "2024-07-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Hardware & Building (sec-005) â”€â”€

  { branch_id: "m-017", business_name: "Yadav Hardware Centre", owner_name: "Dinesh Yadav", phone: "9876543226", email: "dinesh.yadav@mail.com", gst_number: "09AADCY5678V1Z3", registration_date: "2024-06-01T00:00:00Z", sector_id: "sec-005", location_id: "loc-010", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 65, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.40, status: "active", created_at: "2024-06-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-018", business_name: "BuildRight Supplies", owner_name: "Rajendra Tiwari", phone: "9876543227", email: "rajendra.tiwari@mail.com", gst_number: "27AADCB9012W1Z1", registration_date: "2024-03-20T00:00:00Z", sector_id: "sec-005", location_id: "loc-007", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.48, status: "active", created_at: "2024-03-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-019", business_name: "Singh Hardware Mart", owner_name: "Gurpreet Singh", phone: "9876543228", email: "gurpreet.singh@mail.com", gst_number: "03AADCS3456X1Z9", registration_date: "2024-08-05T00:00:00Z", sector_id: "sec-005", location_id: "loc-011", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 58, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.44, status: "active", created_at: "2024-08-05T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-020", business_name: "Dey Construction Supply", owner_name: "Partha Dey", phone: "9876543229", email: "partha.dey@mail.com", gst_number: "19AADCD7890Y1Z7", registration_date: "2024-10-15T00:00:00Z", sector_id: "sec-005", location_id: "loc-005", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 55, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.38, status: "active", created_at: "2024-10-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Restaurant & Food (sec-006) â”€â”€

  { branch_id: "m-021", business_name: "Mishra Dhaba Express", owner_name: "Santosh Mishra", phone: "9876543230", email: "santosh.mishra@mail.com", gst_number: null, registration_date: "2024-04-01T00:00:00Z", sector_id: "sec-006", location_id: "loc-015", business_type: "services", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 84, is_franchise: false, is_regulated_margin: false, declared_capacity: 40, platform_capture_percentage: 0.55, status: "active", created_at: "2024-04-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-022", business_name: "Biryani House Hyderabad", owner_name: "Mohammed Irfan", phone: "9876543231", email: "irfan.mohammed@mail.com", gst_number: "36AADCB1234Z1Z5", registration_date: "2024-01-15T00:00:00Z", sector_id: "sec-006", location_id: "loc-006", business_type: "services", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 78, is_franchise: false, is_regulated_margin: false, declared_capacity: 60, platform_capture_percentage: 0.68, status: "active", created_at: "2024-01-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-023", business_name: "Dosa Corner Bangalore", owner_name: "Venkatesh Rao", phone: "9876543232", email: "venkatesh.rao@mail.com", gst_number: "29AADCD5678A2Z3", registration_date: "2024-05-20T00:00:00Z", sector_id: "sec-006", location_id: "loc-003", business_type: "services", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 72, is_franchise: false, is_regulated_margin: false, declared_capacity: 35, platform_capture_percentage: 0.62, status: "active", created_at: "2024-05-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-024", business_name: "Thali World", owner_name: "Kavita Deshmukh", phone: "9876543233", email: "kavita.deshmukh@mail.com", gst_number: "27AADCT9012B2Z1", registration_date: "2024-09-15T00:00:00Z", sector_id: "sec-006", location_id: "loc-007", business_type: "services", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 70, is_franchise: false, is_regulated_margin: false, declared_capacity: 50, platform_capture_percentage: 0.58, status: "active", created_at: "2024-09-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Dairy & Milk Products (sec-007) â”€â”€

  { branch_id: "m-025", business_name: "Chauhan Dairy Farm", owner_name: "Bhagwat Chauhan", phone: "9876543234", email: "bhagwat.chauhan@mail.com", gst_number: null, registration_date: "2024-02-01T00:00:00Z", sector_id: "sec-007", location_id: "loc-009", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 56, is_franchise: false, is_regulated_margin: true, declared_capacity: null, platform_capture_percentage: 0.75, status: "active", created_at: "2024-02-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-026", business_name: "Fresh Milk Centre", owner_name: "Lakshmi Pillai", phone: "9876543235", email: "lakshmi.pillai@mail.com", gst_number: "32AADCF3456C2Z9", registration_date: "2024-06-10T00:00:00Z", sector_id: "sec-007", location_id: "loc-013", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 49, is_franchise: false, is_regulated_margin: true, declared_capacity: null, platform_capture_percentage: 0.68, status: "active", created_at: "2024-06-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-027", business_name: "Goel Dairy Products", owner_name: "Sanjay Goel", phone: "9876543236", email: "sanjay.goel@mail.com", gst_number: "07AADCG7890D2Z7", registration_date: "2024-08-01T00:00:00Z", sector_id: "sec-007", location_id: "loc-002", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 52, is_franchise: false, is_regulated_margin: true, declared_capacity: null, platform_capture_percentage: 0.62, status: "active", created_at: "2024-08-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Stationery & Books (sec-008) â”€â”€

  { branch_id: "m-028", business_name: "Trivedi Book House", owner_name: "Hemant Trivedi", phone: "9876543237", email: "hemant.trivedi@mail.com", gst_number: "24AADCT1234E2Z5", registration_date: "2024-03-10T00:00:00Z", sector_id: "sec-008", location_id: "loc-008", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 48, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.50, status: "active", created_at: "2024-03-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-029", business_name: "Chopra Stationery Mart", owner_name: "Neha Chopra", phone: "9876543238", email: "neha.chopra@mail.com", gst_number: "03AADCC5678F2Z3", registration_date: "2024-07-15T00:00:00Z", sector_id: "sec-008", location_id: "loc-011", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 45, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.45, status: "active", created_at: "2024-07-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-030", business_name: "PageTurner Books", owner_name: "Aarav Malhotra", phone: "9876543239", email: "aarav.malhotra@mail.com", gst_number: null, registration_date: "2025-12-01T00:00:00Z", sector_id: "sec-008", location_id: "loc-022", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 42, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.35, status: "active", created_at: "2025-12-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Mobile & Telecom (sec-009) â”€â”€

  { branch_id: "m-031", business_name: "PhoneWala Mumbai", owner_name: "Siddharth Thakur", phone: "9876543240", email: "siddharth.thakur@mail.com", gst_number: "27AADCP9012G2Z1", registration_date: "2024-04-15T00:00:00Z", sector_id: "sec-009", location_id: "loc-001", business_type: "hybrid", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 65, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.52, status: "active", created_at: "2024-04-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-032", business_name: "Mobile Hub Lucknow", owner_name: "Ashish Srivastava", phone: "9876543241", email: "ashish.srivastava@mail.com", gst_number: "09AADCM3456H2Z9", registration_date: "2024-06-20T00:00:00Z", sector_id: "sec-009", location_id: "loc-010", business_type: "hybrid", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.48, status: "active", created_at: "2024-06-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-033", business_name: "Telecom Point Surat", owner_name: "Jayesh Shah", phone: "9876543242", email: "jayesh.shah@mail.com", gst_number: "24AADCT7890I2Z7", registration_date: "2024-10-01T00:00:00Z", sector_id: "sec-009", location_id: "loc-014", business_type: "hybrid", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 55, is_franchise: true, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.55, status: "active", created_at: "2024-10-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Jewellery & Gold (sec-010) â”€â”€

  { branch_id: "m-034", business_name: "Tandon Jewellers", owner_name: "Mohan Tandon", phone: "9876543243", email: "mohan.tandon@mail.com", gst_number: "07AADCT1234J2Z5", registration_date: "2024-01-10T00:00:00Z", sector_id: "sec-010", location_id: "loc-002", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 50, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.30, status: "active", created_at: "2024-01-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-035", business_name: "Swarna Gold Palace", owner_name: "Ramesh Soni", phone: "9876543244", email: "ramesh.soni@mail.com", gst_number: "08AADCS5678K2Z3", registration_date: "2024-05-01T00:00:00Z", sector_id: "sec-010", location_id: "loc-009", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 48, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.28, status: "active", created_at: "2024-05-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-036", business_name: "Malabar Gold Kochi", owner_name: "Thomas Kurian", phone: "9876543245", email: "thomas.kurian@mail.com", gst_number: "32AADCM9012L2Z1", registration_date: "2024-03-15T00:00:00Z", sector_id: "sec-010", location_id: "loc-013", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 48, is_franchise: true, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.35, status: "active", created_at: "2024-03-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Bakery & Sweets (sec-011) â”€â”€

  { branch_id: "m-037", business_name: "Mithai Ghar Kolkata", owner_name: "Arup Ghosh", phone: "9876543246", email: "arup.ghosh@mail.com", gst_number: "19AADCM3456M2Z9", registration_date: "2024-02-20T00:00:00Z", sector_id: "sec-011", location_id: "loc-005", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 70, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.60, status: "active", created_at: "2024-02-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-038", business_name: "Royal Bakery Pune", owner_name: "Shweta Kulkarni", phone: "9876543247", email: "shweta.kulkarni@mail.com", gst_number: "27AADCR7890N2Z7", registration_date: "2024-04-10T00:00:00Z", sector_id: "sec-011", location_id: "loc-007", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 65, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.55, status: "active", created_at: "2024-04-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-039", business_name: "Sweet Palace Chennai", owner_name: "Balaji Krishnan", phone: "9876543248", email: "balaji.krishnan@mail.com", gst_number: "33AADCS1234O2Z5", registration_date: "2024-06-25T00:00:00Z", sector_id: "sec-011", location_id: "loc-004", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.50, status: "active", created_at: "2024-06-25T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-040", business_name: "Nagpur Halwai", owner_name: "Ravi Deshmukh", phone: "9876543249", email: "ravi.deshmukh@mail.com", gst_number: null, registration_date: "2024-09-01T00:00:00Z", sector_id: "sec-011", location_id: "loc-015", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 55, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.45, status: "active", created_at: "2024-09-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ General Merchandise (sec-012) â”€â”€

  { branch_id: "m-041", business_name: "Saxena Traders", owner_name: "Vijay Saxena", phone: "9876543250", email: "vijay.saxena@mail.com", gst_number: "09AADCS5678P2Z3", registration_date: "2024-05-05T00:00:00Z", sector_id: "sec-012", location_id: "loc-010", business_type: "hybrid", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 72, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.55, status: "active", created_at: "2024-05-05T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-042", business_name: "Das General Store", owner_name: "Bikash Das", phone: "9876543251", email: "bikash.das@mail.com", gst_number: "18AADCD9012Q2Z1", registration_date: "2024-07-20T00:00:00Z", sector_id: "sec-012", location_id: "loc-017", business_type: "hybrid", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 68, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.48, status: "active", created_at: "2024-07-20T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-043", business_name: "Mahto Variety Store", owner_name: "Suresh Mahto", phone: "9876543252", email: "suresh.mahto@mail.com", gst_number: null, registration_date: "2024-08-15T00:00:00Z", sector_id: "sec-012", location_id: "loc-016", business_type: "hybrid", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 65, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.42, status: "active", created_at: "2024-08-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-044", business_name: "Bora Trading Co", owner_name: "Manash Bora", phone: "9876543253", email: "manash.bora@mail.com", gst_number: "18AADCB3456R2Z9", registration_date: "2024-10-10T00:00:00Z", sector_id: "sec-012", location_id: "loc-017", business_type: "hybrid", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.40, status: "active", created_at: "2024-10-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },



  // â”€â”€ Additional for variety (across sectors & tiers) â”€â”€

  { branch_id: "m-045", business_name: "Hill Station Grocery", owner_name: "Thakur Dhiman", phone: "9876543254", email: "thakur.dhiman@mail.com", gst_number: null, registration_date: "2024-11-01T00:00:00Z", sector_id: "sec-001", location_id: "loc-023", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 60, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.70, status: "active", created_at: "2024-11-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-046", business_name: "Imphal Fresh Mart", owner_name: "Laishram Tomba", phone: "9876543255", email: "tomba.laishram@mail.com", gst_number: null, registration_date: "2024-12-15T00:00:00Z", sector_id: "sec-001", location_id: "loc-024", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 55, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.65, status: "active", created_at: "2024-12-15T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-047", business_name: "Gangtok Electronics", owner_name: "Tenzing Lepcha", phone: "9876543256", email: "tenzing.lepcha@mail.com", gst_number: null, registration_date: "2025-01-10T00:00:00Z", sector_id: "sec-003", location_id: "loc-025", business_type: "goods", transaction_pattern: "low_frequency_high_value", operating_hours_per_week: 50, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.38, status: "active", created_at: "2025-01-10T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-048", business_name: "Port Blair General", owner_name: "David Baroi", phone: "9876543257", email: "david.baroi@mail.com", gst_number: null, registration_date: "2025-02-01T00:00:00Z", sector_id: "sec-012", location_id: "loc-026", business_type: "hybrid", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 55, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.50, status: "active", created_at: "2025-02-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-049", business_name: "Aizawl Bakery Delight", owner_name: "Lalremruata Pachuau", phone: "9876543258", email: "lalrem.pachuau@mail.com", gst_number: null, registration_date: "2025-03-01T00:00:00Z", sector_id: "sec-011", location_id: "loc-029", business_type: "goods", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 50, is_franchise: false, is_regulated_margin: false, declared_capacity: null, platform_capture_percentage: 0.55, status: "active", created_at: "2025-03-01T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  { branch_id: "m-050", business_name: "Suspended Test Trading", owner_name: "System Test", phone: "9876543259", email: "test.suspended@mail.com", gst_number: null, registration_date: "2024-06-01T00:00:00Z", sector_id: "sec-006", location_id: "loc-021", business_type: "services", transaction_pattern: "high_frequency_low_value", operating_hours_per_week: 40, is_franchise: false, is_regulated_margin: false, declared_capacity: 20, platform_capture_percentage: 0.30, status: "suspended", created_at: "2024-06-01T00:00:00Z", updated_at: "2026-02-15T00:00:00Z" },

];

export const MOCK_BRANCHES: Branch[] = _RAW.map((b) => ({
  ...b,
  ho_id: getHOForBranch(b.branch_id),
}));
