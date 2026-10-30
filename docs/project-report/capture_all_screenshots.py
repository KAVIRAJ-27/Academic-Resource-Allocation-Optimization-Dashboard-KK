import os
import time
import json
import urllib.request
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\docs\project-report\screenshots"
BASE_URL = "http://localhost:5173"
API_URL = "http://localhost:8080/api"

os.makedirs(OUTPUT_DIR, exist_ok=True)

CREDENTIALS = {
    'ADMIN': ('admin', 'Admin@123'),
    'PRINCIPAL': ('principal', 'Principal@123'),
    'HOD': ('hod_cs', 'Hod@123'),
    'FACULTY': ('faculty_john', 'Faculty@123'),
    'STUDENT': ('student_alex', 'Student@123'),
    'WARDEN': ('warden_smith', 'Warden@123'),
}

def get_auth_data(role):
    username, password = CREDENTIALS[role]
    payload = json.dumps({'usernameOrEmail': username, 'password': password}).encode('utf-8')
    req = urllib.request.Request(f"{API_URL}/auth/login", data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))['data']
        token = data['accessToken']
        user_info = {
            'id': data.get('userId') or data.get('id'),
            'username': data.get('username'),
            'name': f"{data.get('firstName', '')} {data.get('lastName', '')}".strip() or data.get('username'),
            'firstName': data.get('firstName'),
            'lastName': data.get('lastName'),
            'email': data.get('email'),
            'role': role,
            'roles': data.get('roles', [role]),
            'permissions': data.get('permissions', []),
            'status': data.get('status', 'ACTIVE')
        }
        return token, user_info

def set_auth(page, role):
    token, user_info = get_auth_data(role)
    page.goto(f"{BASE_URL}/login")
    page.evaluate(f"""() => {{
        localStorage.setItem('ahrao_token', '{token}');
        localStorage.setItem('ahrao_current_user', JSON.stringify({json.dumps(user_info)}));
    }}""")

def capture(page, filename, wait_seconds=2):
    filepath = os.path.join(OUTPUT_DIR, filename)
    time.sleep(wait_seconds)
    page.screenshot(path=filepath, full_page=False)
    size_kb = os.path.getsize(filepath) / 1024
    print(f"[CAPTURED] {filename} ({size_kb:.1f} KB)")
    return filepath

def run():
    print("Starting AHRAO Real-Time Screenshot Automation...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        # 1. Login Page
        print("\n--- 1. Login & Dashboards ---")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_selector("h1:has-text('AHRAO Portal')", timeout=10000)
        capture(page, "01_Login_Page.png", wait_seconds=1)

        # 2. Admin Dashboard
        set_auth(page, 'ADMIN')
        page.goto(f"{BASE_URL}/admin/dashboard")
        page.wait_for_timeout(2000)
        capture(page, "02_Admin_Dashboard.png")

        # 3. Principal Dashboard
        set_auth(page, 'PRINCIPAL')
        page.goto(f"{BASE_URL}/principal/dashboard")
        page.wait_for_timeout(2000)
        capture(page, "03_Principal_Dashboard.png")

        # 4. HOD Dashboard
        set_auth(page, 'HOD')
        page.goto(f"{BASE_URL}/hod/dashboard")
        page.wait_for_timeout(2000)
        capture(page, "04_HOD_Dashboard.png")

        # 5. Faculty Dashboard
        set_auth(page, 'FACULTY')
        page.goto(f"{BASE_URL}/faculty/dashboard")
        page.wait_for_timeout(2000)
        capture(page, "05_Faculty_Dashboard.png")

        # 6. Student Dashboard
        set_auth(page, 'STUDENT')
        page.goto(f"{BASE_URL}/student/dashboard")
        page.wait_for_timeout(2000)
        capture(page, "06_Student_Dashboard.png")

        # 7. Warden Dashboard
        set_auth(page, 'WARDEN')
        page.goto(f"{BASE_URL}/warden/dashboard")
        page.wait_for_timeout(2000)
        capture(page, "07_Warden_Dashboard.png")

        # 8. Academic Resource Catalogue
        print("\n--- 2. Academic Resource Management ---")
        set_auth(page, 'ADMIN')
        page.goto(f"{BASE_URL}/admin/resources")
        page.wait_for_timeout(2000)
        capture(page, "08_Academic_Resource_Catalogue.png")

        # 9. Classroom & Laboratory Management
        page.goto(f"{BASE_URL}/admin/resources/classrooms")
        page.wait_for_timeout(2000)
        capture(page, "09_Classroom_Laboratory_Management.png")

        # 10. HOD Timetable
        set_auth(page, 'HOD')
        page.goto(f"{BASE_URL}/hod/timetable")
        page.wait_for_timeout(2000)
        capture(page, "10_HOD_Timetable.png")

        # 11. Faculty Resource Booking
        set_auth(page, 'FACULTY')
        page.goto(f"{BASE_URL}/faculty/resources")
        page.wait_for_timeout(2000)
        capture(page, "11_Faculty_Resource_Booking.png")

        # 12. Academic Request Submission
        page.goto(f"{BASE_URL}/faculty/resource-requests/new")
        page.wait_for_timeout(2000)
        capture(page, "12_Academic_Request_Submission.png")

        # 13. Academic Allocation Preview
        set_auth(page, 'ADMIN')
        page.goto(f"{BASE_URL}/admin/allocations")
        page.wait_for_timeout(2000)
        capture(page, "13_Academic_Allocation_Preview.png")

        # 14. Conflict Validation
        set_auth(page, 'HOD')
        page.goto(f"{BASE_URL}/hod/timetable")
        page.wait_for_timeout(2000)
        capture(page, "14_Conflict_Validation.png")

        # 15. Hostel Management
        print("\n--- 3. Hostel Resource Management ---")
        set_auth(page, 'ADMIN')
        page.goto(f"{BASE_URL}/admin/hostels")
        page.wait_for_timeout(2000)
        capture(page, "15_Hostel_Management.png")

        # 16. Hostel Blocks and Rooms
        set_auth(page, 'WARDEN')
        page.goto(f"{BASE_URL}/warden/blocks")
        page.wait_for_timeout(2000)
        capture(page, "16_Hostel_Blocks_and_Rooms.png")

        # 17. Student Hostel Request
        set_auth(page, 'STUDENT')
        page.goto(f"{BASE_URL}/student/hostel/requests")
        page.wait_for_timeout(2000)
        capture(page, "17_Student_Hostel_Request.png")

        # 18. Hostel Bed Allocation
        set_auth(page, 'WARDEN')
        page.goto(f"{BASE_URL}/warden/allocations")
        page.wait_for_timeout(2000)
        capture(page, "18_Hostel_Bed_Allocation.png")

        # 19. Hostel Occupancy
        set_auth(page, 'WARDEN')
        page.goto(f"{BASE_URL}/warden/hostels")
        page.wait_for_timeout(2000)
        capture(page, "19_Hostel_Occupancy.png")

        # 20. Warden Resident Roster
        page.goto(f"{BASE_URL}/warden/students")
        page.wait_for_timeout(2000)
        capture(page, "20_Warden_Resident_Roster.png")

        # 21. Pending Requests
        print("\n--- 4. Requests, Analytics & AI ---")
        set_auth(page, 'PRINCIPAL')
        page.goto(f"{BASE_URL}/principal/resource-requests")
        page.wait_for_timeout(2000)
        capture(page, "21_Pending_Requests.png")

        # 22. Request Approval
        page.goto(f"{BASE_URL}/principal/approvals")
        page.wait_for_timeout(2000)
        capture(page, "22_Request_Approval.png")

        # 23. Allocation Result
        set_auth(page, 'ADMIN')
        page.goto(f"{BASE_URL}/admin/allocations")
        page.wait_for_timeout(2000)
        capture(page, "23_Allocation_Result.png")

        # 24. Analytics Dashboard
        page.goto(f"{BASE_URL}/admin/analytics")
        page.wait_for_timeout(2000)
        capture(page, "24_Analytics_Dashboard.png")

        # 25. Academic Workload Analytics
        set_auth(page, 'HOD')
        page.goto(f"{BASE_URL}/hod/workload")
        page.wait_for_timeout(2000)
        capture(page, "25_Academic_Workload_Analytics.png")

        # 26. AI Demand Forecast
        set_auth(page, 'ADMIN')
        page.goto(f"{BASE_URL}/admin/ai-insights")
        page.wait_for_timeout(2500)
        capture(page, "26_AI_Demand_Forecast.png")

        # 27. Audit History
        page.goto(f"{BASE_URL}/admin/users")
        page.wait_for_timeout(2000)
        capture(page, "27_Audit_History.png")

        browser.close()
        print("\nAll 27 screenshots captured successfully!")

if __name__ == '__main__':
    run()
