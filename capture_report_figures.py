import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\docs\project-report\screenshots"
BASE_URL = "http://localhost:5173"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def safe_log(text):
    print(str(text).encode('ascii', 'replace').decode())

def login_admin(page):
    safe_log(">>> Logging in as ADMIN via authentic form credentials...")
    page.goto(f"{BASE_URL}/login")
    page.wait_for_selector("text=Sign In with Secure JWT", timeout=15000)
    time.sleep(0.5)
    
    # Click ADMIN quick fill button
    buttons = page.query_selector_all("button")
    for b in buttons:
        if b.inner_text().strip() == "ADMIN":
            b.click()
            break
            
    time.sleep(0.4)
    page.click("button:has-text('Sign In with Secure JWT')")
    page.wait_for_url(lambda u: "/login" not in u, timeout=15000)
    time.sleep(2)
    safe_log(f"Admin logged in successfully. URL: {page.url}")

def capture(page, filename, wait_seconds=2.5):
    filepath = os.path.join(OUTPUT_DIR, filename)
    time.sleep(wait_seconds)
    page.wait_for_load_state("networkidle", timeout=15000)
    page.screenshot(path=filepath, full_page=False)
    size_bytes = os.path.getsize(filepath)
    size_kb = size_bytes / 1024
    safe_log(f"[CAPTURED] {filename} -> {size_kb:.1f} KB ({size_bytes} bytes) at {page.url}")
    return filepath, size_bytes

def run():
    safe_log("Starting Capture of Required Report Figures (Viewport: 1440x1000)...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        # Using 1440x1000 viewport as requested in Phase 4
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on("pageerror", lambda err: safe_log(f"PAGE ERROR: {err}"))

        login_admin(page)

        # -------------------------------------------------------------------------
        # FIGURE 1: Optimization recommendation with score breakdown
        # Save as: Optimization_Recommendation_Score_Breakdown.png
        # -------------------------------------------------------------------------
        safe_log("\n--- Capturing Figure 1: Optimization Recommendation Score Breakdown ---")
        page.goto(f"{BASE_URL}/academic/allocations")
        page.wait_for_load_state("networkidle", timeout=10000)
        time.sleep(1.5)

        # Click Allocate Resource button
        safe_log("Opening Allocate Resource modal...")
        page.click("button:has-text('Allocate Resource')")
        page.wait_for_selector("input[placeholder*='Enter Academic Request ID']", timeout=10000)
        time.sleep(0.5)

        # Input Request ID 182 (AI & Machine Learning Weekend Workshop)
        safe_log("Entering Request ID 182...")
        input_elem = page.query_selector("input[placeholder*='Enter Academic Request ID']")
        input_elem.fill("182")
        time.sleep(0.5)

        # Click Optimize & Recommend button
        safe_log("Executing optimization engine on backend...")
        page.click("button:has-text('Optimize & Recommend')")
        
        # Wait for optimization recommendations to render
        page.wait_for_selector("text=Optimization Results:", timeout=15000)
        time.sleep(1.5)
        safe_log("Optimization results rendered on screen.")

        # Click View Explainable Scoring Breakdown on top card
        safe_log("Expanding explainable 5-factor scoring breakdown...")
        breakdown_btn = page.query_selector("button:has-text('View Explainable Scoring Breakdown')")
        if breakdown_btn:
            breakdown_btn.click()
            time.sleep(1)
            page.wait_for_selector("text=Deterministic 5-Factor Score", timeout=10000)
            safe_log("5-Factor score breakdown panel expanded successfully.")
        else:
            safe_log("Warning: View Explainable Scoring Breakdown button not found, checking if already expanded.")

        capture(page, "Optimization_Recommendation_Score_Breakdown.png", wait_seconds=2)

        # -------------------------------------------------------------------------
        # FIGURE 2: Figure B.7 Utilization Analytics Charts
        # Save as: Figure_B7_Utilization_Analytics_Charts.png
        # -------------------------------------------------------------------------
        safe_log("\n--- Capturing Figure B.7: Utilization Analytics Charts ---")
        page.goto(f"{BASE_URL}/analytics")
        page.wait_for_load_state("networkidle", timeout=15000)
        time.sleep(3)
        capture(page, "Figure_B7_Utilization_Analytics_Charts.png", wait_seconds=2.5)

        # -------------------------------------------------------------------------
        # FIGURE 3: Figure B.8 AI Insights and Recommendations Page
        # Save as: Figure_B8_AI_Insights_Recommendations.png
        # -------------------------------------------------------------------------
        safe_log("\n--- Capturing Figure B.8: AI Insights & Recommendations ---")
        page.goto(f"{BASE_URL}/ai-insights")
        page.wait_for_load_state("networkidle", timeout=15000)
        time.sleep(3)
        capture(page, "Figure_B8_AI_Insights_Recommendations.png", wait_seconds=2.5)

        browser.close()
        safe_log("\n*** SUCCESS: All 3 report figures captured! ***")

if __name__ == '__main__':
    run()
