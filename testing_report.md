# Testing and Analysis

Testing is done to check if the system works correctly and meets the project requirements. Different testing methods are used to find errors and improve system quality. In this project, testing is carried out using unit testing and system testing. These tests help confirm that the system works as expected. 

White box testing is used at the lower level of testing such as unit testing and integration testing. Black box testing is used at a higher level such as system testing, acceptance testing, and security testing.

## 4.1 Test Plan

A test plan describes how the system will be tested. It explains the testing methods, tools, test cases, and expected results. The goal is to ensure that the system works properly and all main features function correctly.

### 4.1.1 Unit Testing Test Plan

Unit testing focuses on testing small parts of the system such as functions, APIs, modules, or isolated components. Each component is tested individually to confirm that it performs the correct operation.

- **Objective:** To verify that each module of the system works correctly (e.g., individual API endpoints, isolated UI components).
- **Testing Method:** White box testing (and black box for API responses).
- **Tools Used:** Postman for APIs, Jest/JUnit (if automated), Manual UI clicks.
- **Test Environment:** Web browser (Chrome/Safari), Postman, Local development environment.

### 4.1.2 System Testing Test Plan

System testing checks the complete system after all modules are integrated. It ensures that the frontend communicates properly with the backend, database operations succeed, and the system meets the user requirements.

- **Objective:** To verify that the entire system functions correctly when all components (Frontend, Backend, Database) are combined.
- **Testing Method:** Black box testing.
- **Test Environment:** Web browser, Mobile devices (responsive checks), staging/production server.

---

## 4.2 Unit Test Cases

Unit testing was performed on individual APIs and UI components. The following are the test cases for manual unit testing.

| Test ID | Module Name | Test Description | Input/Action | Expected Output | Result | Evidence To Provide |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UT01** | User Auth | Check User Registration with valid data | Valid Name, Email, Password | Account created successfully, data saved in DB | Pending | Screenshots of UI & DB table |
| **UT02** | User Auth | Check Login with valid credentials | Registered Email, Password | User logged in, token generated | Pending | Screenshots of Dashboard/Logged-in state |
| **UT03** | User Auth | Check Login with invalid credentials | Wrong Email/Password | Error message "Invalid credentials" displayed | Pending | Screenshots of error message |
| **UT04** | Products API | Fetch list of products | GET Request to `/api/products` | JSON array of products returned with HTTP 200 | Pending | Postman screenshot |
| **UT05** | Admin Panel | Admin creates a new product category | Category Name, Parent ID | Category saved in DB successfully | Pending | Screenshot of Admin Category list |
| **UT06** | Cart UI | Add item to cart | Click "Add to Cart" button on Product | Item count in cart increments by 1 | Pending | Screenshot of Cart Icon with number |
| **UT07** | 3D Viewer | Load 3D model component on item | Open product with 3D model | 3D model renders correctly without errors | Pending | Screenshot of 3D object rendering |
| **UT08** | Live Chat | Send message in Live Chat | Type "Hello" and hit send | Message displayed in chat UI immediately | Pending | Screenshot of chat window |

---

## 4.3 System Test Cases

System testing evaluates the integrated end-to-end user flows.

| Test ID | Feature | Test Scenario | Steps to Test | Expected Result | Result | Evidence To Provide |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ST01** | Admin Full Flow | End-to-end product creation | 1. Admin logs in.<br>2. Navigates to Products.<br>3. Fills in title, price, stock, category.<br>4. Uploads images & 3D model.<br>5. Submits. | Product is successfully created and appears on the user-facing storefront. | Pending | Admin Product list & Storefront view |
| **ST02** | Search & Filter | Browsing products | 1. Go to Shop page.<br>2. Type "Chair" in search.<br>3. Filter by category "Seating". | Only chairs within the 'Seating' category are displayed. | Pending | Screenshot of filtered results |
| **ST03** | Checkout Flow | Purchase with eSewa | 1. Log in.<br>2. Add product to cart.<br>3. Proceed to checkout.<br>4. Select eSewa & pay.<br>5. Redirect back from eSewa. | Payment gets confirmed, order is created, user redirected to success page. | Pending | eSewa portal & Order Success page |
| **ST04** | Live Chat System | Two-way communication | 1. User sends message via widget.<br>2. Admin opens chat panel & replies.<br>3. User sees reply instantly. | Messages pass between user and admin in real-time. | Pending | Screenshot of User side & Admin side |
| **ST05** | Responsive UI | Verify mobile layout | 1. Open DevTools or Mobile Phone.<br>2. Go to Homepage, Cart, and Product views. | Layout adjusts correctly, navigation turns to hamburger menu, no overflow. | Pending | Screenshots on mobile view |

---

## 4.4 Step-by-Step Testing Guide

If you are performing these tests manually, follow these detailed steps for the core features:

### 1. Testing Registration and Login (UT01, UT02, UT03)
- **Step 1:** Open the application in a fresh browser window (or incognito mode).
- **Step 2:** Click on "Signup" or "Register". Fill in dummy user details and submit. Ensure you are redirected or shown a success message.
- **Step 3:** Log out, then go to the Login page. Try logging in with the wrong password. Verify the validation error.
- **Step 4:** Log in with the correct email and password. Verify you land on the customer dashboard or homepage as a logged-in user.

### 2. Testing 3D Product Viewer (UT07)
- **Step 1:** Navigate to a product that has a 3D model associated with it.
- **Step 2:** Wait for the page to load. Ensure the 3D model canvas initializes.
- **Step 3:** Try rotating, zooming, and panning the 3D model to ensure the controls respond smoothly and correctly.

### 3. Testing E-Commerce Flow (ST03)
- **Step 1:** Log in with a customer account.
- **Step 2:** Go to the shop and add 1 or 2 products to your cart.
- **Step 3:** Navigate to the Cart page. Verify the subtotal and total calculations are correct.
- **Step 4:** Click "Checkout". Enter shipping details if required.
- **Step 5:** Proceed to Payment and select eSewa. You should be redirected securely to the eSewa sandbox/portal.
- **Step 6:** Complete the mock payment on eSewa. Ensure you are redirected back to your application to an Order Success screen, and NOT incorrectly redirected to the login page (as fixed previously).

### 4. Testing Live Chat System (ST04)
- **Step 1:** Open two completely separate browser windows (or one Chrome, one Safari/Firefox).
- **Step 2:** In Browser A, log in as **Admin**. Open the Admin chat panel.
- **Step 3:** In Browser B, log in as a **Customer**. Open the floating chat widget.
- **Step 4:** Type a message from Browser B. Verify it instantly pops up in Browser A.
- **Step 5:** Reply from Browser A. Verify it instantly shows up in Browser B. Reload Browser B to check if chat history is persisted.

### 5. Testing Admin Product Management (ST01)
- **Step 1:** Log in as the Admin.
- **Step 2:** Go to Categories and create a new valid Category (e.g., "Living Room").
- **Step 3:** Go to Products and click "Add Product". Fill out all details, select the newly created category, upload an image, and submit.
- **Step 4:** Verify there is no '500 Internal Server Error' due to foreign key constraints (as resolved recently).
- **Step 5:** Go back to the customer view and find the newly created product.

## 4.5 Critical Analysis (To be filled after testing)

After testing the system, record your observations here:
- Did core features work correctly? (Yes/No)
- Were any bugs found in Unit Testing? (List them if any)
- Did the system modules integrate properly during System Testing? (Yes/No)
- *Example entry: "Most core features worked correctly. The eSewa integration flow passed without login redirection issues. Unit testing identified a small UI glitch on the cart total which was fixed."*
