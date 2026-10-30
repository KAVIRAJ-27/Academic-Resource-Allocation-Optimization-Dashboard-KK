import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\docs\project-report\screenshots"
BASE_URL = "http://localhost:5173"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def safe_log(text):
    print(str(text).encode('ascii', 'replace').decode())

def login_role(page, role_name):
    safe_log(f"\n>>> Logging in as {role_name}...")
    page.goto(f"{BASE_URL}/login")
    page.wait_for_selector("text=Sign In with Secure JWT", timeout=15000)
    time.sleep(0.5)
    
    # Click demo role button
    buttons = page.query_selector_all("button")
    clicked = False
    for b in buttons:
        if b.inner_text().strip() == role_name:
            b.click()
            clicked = True
            break
    if not clicked:
        safe_log(f"Warning: Demo button for {role_name} not found")
        
    time.sleep(0.4)
    page.click("button:has-text('Sign In with Secure JWT')")
    page.wait_for_url(lambda u: "/login" not in u, timeout=15000)
    time.sleep(2)
    safe_log(f"Successfully logged in as {role_name}. Landed on: {page.url}")

def capture(page, filename, wait_seconds=2.5):
    filepath = os.path.join(OUTPUT_DIR, filename)
    time.sleep(wait_seconds)
    # Ensure page is rendered
    page.wait_for_load_state("networkidle", timeout=10000)
    page.screenshot(path=filepath, full_page=False)
    size_bytes = os.path.getsize(filepath)
    size_kb = size_bytes / 1024
    safe_log(f"[CAPTURED] {filename} -> {size_kb:.1f} KB (bytes: {size_bytes}) at {page.url}")
    return filepath, size_bytes

def run():
    safe_log("Starting Full 27 Screenshots Automation Pipeline...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.on("pageerror", lambda err: safe_log(f"PAGE ERROR: {err}"))

        # =========================================================================
        # 1. PUBLIC: LOGIN PAGE
        # =========================================================================
        safe_log("\n--- Category 1: Authentication ---")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_selector("text=Sign In with Secure JWT", timeout=15000)
        capture(page, "01_Login_Page.png", wait_seconds=1.5)

        # =========================================================================
        # 2. ADMIN ROLE
        # =========================================================================
        login_role(page, "ADMIN")
        
        # 02_Admin_Dashboard.png
        page.goto(f"{BASE_URL}/admin/dashboard")
        capture(page, "02_Admin_Dashboard.png", wait_seconds=2)
        
        # 08_Academic_Resource_Catalogue.png
        page.goto(f"{BASE_URL}/admin/resources?tab=resources")
        capture(page, "08_Academic_Resource_Catalogue.png", wait_seconds=2.5)

        # 09_Classroom_Laboratory_Management.png
        page.goto(f"{BASE_URL}/admin/resources?tab=classrooms")
        capture(page, "09_Classroom_Laboratory_Management.png", wait_seconds=2.5)

        # 13_Academic_Allocation_Preview.png
        page.goto(f"{BASE_URL}/academic/allocations")
        capture(page, "13_Academic_Allocation_Preview.png", wait_seconds=2.5)

        # 15_Hostel_Management.png
        page.goto(f"{BASE_URL}/admin/hostels")
        capture(page, "15_Hostel_Management.png", wait_seconds=2.5)

        # 23_Allocation_Result.png
        page.goto(f"{BASE_URL}/academic/allocations")
        capture(page, "23_Allocation_Result.png", wait_seconds=2)

        # 24_Analytics_Dashboard.png
        page.goto(f"{BASE_URL}/analytics")
        capture(page, "24_Analytics_Dashboard.png", wait_seconds=3)

        # 26_AI_Demand_Forecast.png
        page.goto(f"{BASE_URL}/ai-insights")
        capture(page, "26_AI_Demand_Forecast.png", wait_seconds=3)

        # 27_Audit_History.png
        page.goto(f"{BASE_URL}/admin/settings")
        capture(page, "27_Audit_History.png", wait_seconds=2)

        # =========================================================================
        # 3. PRINCIPAL ROLE
        # =========================================================================
        login_role(page, "PRINCIPAL")

        # 03_Principal_Dashboard.png
        page.goto(f"{BASE_URL}/principal/dashboard")
        capture(page, "03_Principal_Dashboard.png", wait_seconds=2)

        # 21_Pending_Requests.png
        page.goto(f"{BASE_URL}/principal/approvals")
        capture(page, "21_Pending_Requests.png", wait_seconds=2.5)

        # 22_Request_Approval.png
        page.goto(f"{BASE_URL}/approvals")
        capture(page, "22_Request_Approval.png", wait_seconds=2.5)

        # =========================================================================
        # 4. HOD ROLE
        # =========================================================================
        login_role(page, "HOD")

        # 04_HOD_Dashboard.png
        page.goto(f"{BASE_URL}/hod/dashboard")
        capture(page, "04_HOD_Dashboard.png", wait_seconds=2)

        # 10_HOD_Timetable.png
        page.goto(f"{BASE_URL}/hod/timetable")
        capture(page, "10_HOD_Timetable.png", wait_seconds=2.5)

        # 14_Conflict_Validation.png
        # The HOD timetable has interactive conflict detection tags & matrix
        page.goto(f"{BASE_URL}/hod/timetable")
        capture(page, "14_Conflict_Validation.png", wait_seconds=2)

        # 25_Academic_Workload_Analytics.png
        page.goto(f"{BASE_URL}/hod/workload")
        capture(page, "25_Academic_Workload_Analytics.png", wait_seconds=2.5)

        # =========================================================================
        # 5. FACULTY ROLE
        # =========================================================================
        login_role(page, "FACULTY")

        # 05_Faculty_Dashboard.png
        page.goto(f"{BASE_URL}/faculty/dashboard")
        capture(page, "05_Faculty_Dashboard.png", wait_seconds=2)

        # 11_Faculty_Resource_Booking.png
        page.goto(f"{BASE_URL}/faculty/resources")
        capture(page, "11_Faculty_Resource_Booking.png", wait_seconds=2.5)

        # 12_Academic_Request_Submission.png
        page.goto(f"{BASE_URL}/faculty/resource-requests/new")
        capture(page, "12_Academic_Request_Submission.png", wait_seconds=2.5)

        # =========================================================================
        # 6. STUDENT ROLE
        # =========================================================================
        login_role(page, "STUDENT")

        # 06_Student_Dashboard.png
        page.goto(f"{BASE_URL}/student/dashboard")
        capture(page, "06_Student_Dashboard.png", wait_seconds=2)

        # 17_Student_Hostel_Request.png
        page.goto(f"{BASE_URL}/student/hostel/requests")
        capture(page, "17_Student_Hostel_Request.png", wait_seconds=2.5)

        # =========================================================================
        # 7. WARDEN ROLE
        # =========================================================================
        login_role(page, "WARDEN")

        # 07_Warden_Dashboard.png
        page.goto(f"{BASE_URL}/warden/dashboard")
        capture(page, "07_Warden_Dashboard.png", wait_seconds=2)

        # 16_Hostel_Blocks_and_Rooms.png
        page.goto(f"{BASE_URL}/warden/blocks")
        capture(page, "16_Hostel_Blocks_and_Rooms.png", wait_seconds=2.5)

        # 18_Hostel_Bed_Allocation.png
        page.goto(f"{BASE_URL}/warden/allocations")
        capture(page, "18_Hostel_Bed_Allocation.png", wait_seconds=2.5)

        # 19_Hostel_Occupancy.png
        page.goto(f"{BASE_URL}/warden/hostels")
        capture(page, "19_Hostel_Occupancy.png", wait_seconds=2.5)

        # 20_Warden_Resident_Roster.png
        page.goto(f"{BASE_URL}/warden/students")
        capture(page, "20_Warden_Resident_Roster.png", wait_seconds=2.5)

        browser.close()
        safe_log("\n*** COMPLETE: All 27 authentic screenshots captured! ***")

if __name__ == '__main__':
    run()
