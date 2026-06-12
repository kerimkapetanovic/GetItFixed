import os
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

home = os.path.expanduser('~')
out_path = os.path.join(home, 'Desktop', 'GetItFixed', 'GetItFixed_Improved_Report.docx')

doc = Document()

# Set page margins
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3.0)
    section.right_margin = Cm(2.5)


def add_heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.name = 'Times New Roman'
    return p


def add_body(doc, text, bold=False, italic=False):
    p = doc.add_paragraph(text)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    for run in p.runs:
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = bold
        run.italic = italic
    return p


def add_center(doc, text, size=12, bold=False):
    p = doc.add_paragraph(text)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.bold = bold
    return p


def add_blank(doc):
    doc.add_paragraph('')


# ===========================
# TITLE PAGE
# ===========================
add_blank(doc)
add_blank(doc)
add_center(doc, 'GetItFixed', size=24, bold=True)
add_blank(doc)
add_center(doc, 'Kerim Kapetanovic')
add_center(doc, 'Amar Dizdarevic')
add_center(doc, 'Faris Balic')
add_center(doc, 'Haris Suta')
add_blank(doc)
add_center(doc, 'INTERNATIONAL UNIVERSITY OF SARAJEVO', bold=True)
add_blank(doc)
add_center(doc, '2026')
doc.add_page_break()

add_center(doc, 'GetItFixed', size=20, bold=True)
add_blank(doc)
add_center(doc, 'BY')
add_center(doc, 'Kerim Kapetanovic')
add_center(doc, 'Amar Dizdarevic')
add_center(doc, 'Faris Balic')
add_center(doc, 'Haris Suta')
add_blank(doc)
add_center(doc, 'A graduation project submitted in partial fulfillment of the requirements for the degree of Bachelor of Science at the Faculty of Engineering and Natural Sciences')
add_center(doc, 'International University of Sarajevo')
add_center(doc, 'June, 2026')
doc.add_page_break()

# ===========================
# APPROVAL PAGE
# ===========================
add_heading(doc, 'APPROVAL PAGE', 1)
add_blank(doc)
add_body(doc, 'I certify that I have supervised and read this study and that in my opinion, it conforms to acceptable standards of scholarly presentation and is fully adequate, in scope and quality, as a graduation project for the degree of Bachelor of Science at the Faculty of Engineering and Natural Sciences.')
add_blank(doc)
add_body(doc, '...............................................')
add_body(doc, 'Dr. Mohammed Saeed Jawad')
add_body(doc, '           Mentor')
doc.add_page_break()

# ===========================
# DECLARATION
# ===========================
add_heading(doc, 'DECLARATION', 1)
add_blank(doc)
add_body(doc, 'We hereby declare that all information in this document has been obtained and presented in accordance with academic rules and ethical conduct. We also declare that, as required by these rules and conduct, we have fully cited and referenced all material and results that are not original to this work.')
add_blank(doc)
add_blank(doc)
add_body(doc, '           Date ...................')
add_blank(doc)
table = doc.add_table(rows=4, cols=2)
table.style = 'Table Grid'
sigs = [
    ('Kerim Kapetanovic', 'Signature .................'),
    ('Amar Dizdarevic', 'Signature .................'),
    ('Faris Balic', 'Signature .................'),
    ('Haris Suta', 'Signature .................'),
]
for i, (name, sig) in enumerate(sigs):
    table.cell(i, 0).text = name
    table.cell(i, 1).text = sig
doc.add_page_break()

# ===========================
# COPYRIGHT
# ===========================
add_heading(doc, 'DECLARATION OF COPYRIGHT AND AFFIRMATION OF FAIR USE OF UNPUBLISHED WORK', 1)
add_blank(doc)
add_body(doc, 'Copyright (c) 2026 by Kerim Kapetanovic, Amar Dizdarevic, Faris Balic and Haris Suta. All rights reserved.')
add_blank(doc)
add_body(doc, 'GetItFixed')
add_blank(doc)
add_body(doc, 'No part of this unpublished work may be reproduced, stored in a retrieval system, or transmitted, in any form or by any means, electronic, mechanical, photocopying, recording or otherwise without prior written permission of the copyright holder and IUS Library.')
doc.add_page_break()

# ===========================
# ACKNOWLEDGEMENTS
# ===========================
add_heading(doc, 'ACKNOWLEDGEMENTS', 1)
add_blank(doc)
add_body(doc, 'This thesis is the result of our undergraduate studies and represents an important step toward our academic goals. Many individuals have guided, supported, and encouraged us to reach this point, and we gratefully acknowledge their help.')
add_blank(doc)
add_body(doc, 'We extend our heartfelt gratitude to our mentor, Dr. Mohammed Saeed Jawad, for his exceptional guidance, support, and encouragement throughout this project. His valuable insights and constructive criticism have been indispensable. Dr. Jawad continually pushed us to think critically and to refine both the technical implementation and the academic presentation of our work.')
add_blank(doc)
add_body(doc, 'We also express our great appreciation to the participants and all those who took the time to share their personal experiences regarding home repair coordination challenges. Their willingness to share real-life challenges allowed us to significantly improve our system design based on their feedback.')
add_blank(doc)
add_body(doc, 'Furthermore, we are grateful to our professors and the staff at the University for their guidance and support during our academic years, as well as to our fellow students for their camaraderie and encouragement in tough times.')
add_blank(doc)
add_body(doc, 'Last but not least, we extend a heartfelt thanks to our families. They have been our pillars of strength, never doubting our capabilities, always showing support, and displaying endless patience. We are deeply thankful to everyone who was involved in this journey in any way, whether directly or indirectly.')
doc.add_page_break()

# ===========================
# LIST OF ABBREVIATIONS
# ===========================
add_heading(doc, 'LIST OF ABBREVIATIONS', 1)
add_blank(doc)
abbrevs = [
    ('AI', 'Artificial Intelligence'),
    ('API', 'Application Programming Interface'),
    ('BAM/KM', 'Bosnian Convertible Mark (currency used in Bosnia and Herzegovina)'),
    ('CORS', 'Cross-Origin Resource Sharing'),
    ('CSRF', 'Cross-Site Request Forgery'),
    ('CSS', 'Cascading Style Sheets'),
    ('DBMS', 'Database Management System'),
    ('DRF', 'Django REST Framework'),
    ('FK', 'Foreign Key'),
    ('FTP', 'File Transfer Protocol'),
    ('GUI', 'Graphical User Interface'),
    ('HTTP', 'Hypertext Transfer Protocol'),
    ('JSON', 'JavaScript Object Notation'),
    ('JWT', 'JSON Web Token'),
    ('OOP', 'Object-Oriented Programming'),
    ('ORM', 'Object-Relational Mapping'),
    ('PDV', 'Porez na dodanu vrijednost (Value Added Tax in Bosnia and Herzegovina)'),
    ('REST', 'Representational State Transfer'),
    ('S3', 'Amazon Simple Storage Service (also used for Supabase-compatible object storage)'),
    ('SDK', 'Software Development Kit'),
    ('SSH', 'Secure Shell'),
    ('SRS', 'Software Requirements Specification'),
    ('UI', 'User Interface'),
    ('URL', 'Uniform Resource Locator'),
    ('VAT', 'Value Added Tax'),
    ('WSGI', 'Web Server Gateway Interface'),
]
for abbr, meaning in abbrevs:
    p = doc.add_paragraph()
    r1 = p.add_run(abbr)
    r1.bold = True
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(12)
    r2 = p.add_run(f'    {meaning}')
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(12)
doc.add_page_break()

# ===========================
# ABSTRACT
# ===========================
add_heading(doc, 'ABSTRACT', 1)
add_blank(doc)
add_body(doc, 'GetItFixed', bold=True)
add_blank(doc)
add_body(doc, 'Household repair and artisan services in Bosnia and Herzegovina are predominantly coordinated through informal channels, including telephone calls, social-media groups, and personal referrals. While culturally familiar, this model creates structural inefficiencies that are quantifiable: clients experience unpredictable response times, zero transparency after initial contact, and no auditable record of negotiations; service providers face unpredictable demand, schedule conflicts from parallel commitments, and high per-job coordination overhead.')
add_blank(doc)
add_body(doc, 'GetItFixed is a full-stack digital marketplace designed to formalize this coordination. The system is built on a three-tier architecture: a PostgreSQL database hosted on Supabase, a Django REST Framework backend with token-based authentication, and a Next.js 16 / React 19 / TypeScript frontend with Tailwind CSS 4 for styling. The application is organized into three Django applications: accounts (custom user model with wallet functionality), bookings (lifecycle management, escrow, invoicing), and services (AI-powered category routing).')
add_blank(doc)
add_body(doc, 'One of the key innovations is the dual-state lifecycle model, which separates a global booking status field (15 possible states, from pending through closed) from a four-value negotiation_status field. This design allows the system to represent "awaiting party" scenarios deterministically, enforce response deadlines with urgency-aware timers (30 minutes for urgent, 3 hours for standard), and prevent scheduling conflicts using server-side overlap validation with a mandatory 30-minute buffer between accepted jobs.')
add_blank(doc)
add_body(doc, 'The payment flow uses a phased escrow mechanism. In Phase 1, upon client acceptance of a handyman proposal, the agreed visit fee is locked from the client wallet into an EscrowHold record; the handyman receives payment after client confirmation of visit completion. In Phase 2, the handyman submits a versioned Quote with itemized line items (materials, labor, other); upon client acceptance, a second EscrowHold is created for the full quote amount. The platform fee is computed at 20% of the base amount plus 17% PDV (VAT), and is split into separate columns on the EscrowHold record for auditability. PDF invoices are generated server-side using ReportLab with custom DejaVu Unicode fonts.')
add_blank(doc)
add_body(doc, 'An AI Repair Assistant, powered by Google Gemini (gemini-2.5-flash-lite), classifies user-described home repair problems into the platform service categories using a structured system prompt and fuzzy matching. The frontend supports full bilingual operation (English/Bosnian) via a custom LanguageProvider context and a flat translation key namespace, and implements persistent dark/light theme via localStorage and CSS class toggling.')
add_blank(doc)
add_body(doc, 'Keywords: digital coordination layer, artisan services marketplace, dual-state lifecycle model, Django REST Framework, Next.js, escrow payment, scheduling conflict prevention, AI service classification')
doc.add_page_break()

# ===========================
# INTRODUCTION
# ===========================
add_heading(doc, '1. INTRODUCTION', 1)

add_heading(doc, '1.1 Domain Context', 2)
add_body(doc, 'The home-repair and artisan-services market in Bosnia and Herzegovina is still largely coordinated through informal channels, including phone calls, social-media groups, and ad-hoc personal referrals. While this model is culturally familiar and easy to initiate, it creates structural inefficiencies that accumulate with scale. Communication is fragmented, agreements are verbal, and neither party retains a reliable record of what was requested, promised, or agreed upon.')
add_blank(doc)
add_body(doc, 'From a client perspective, the most common pain points are unpredictability of response time, low transparency after initial contact, and uncertainty about whether a request has been accepted, postponed, or abandoned. From a handyman perspective, the process is equally inefficient: incoming demand is unstructured, scheduling conflicts arise from parallel verbal commitments, and repeated negotiation rounds over disconnected channels consume disproportionate coordination time relative to the value of individual jobs.')
add_blank(doc)
add_body(doc, 'GetItFixed is positioned as a practical digital coordination layer for this domain. Instead of attempting to replace all existing market behavior at once, it formalizes the most critical steps into one structured workflow: request creation, counterpart negotiation, status progression, and ticket-based tracking. Both parties interact with the same shared state through role-specific views, eliminating the ambiguity that arises from decentralized communication.')

add_heading(doc, '1.2 Problem Identification', 2)
add_body(doc, 'The central problem addressed by this project is the lack of a structured, auditable, and scalable digital process for local repair-service coordination. In its current non-standardized form, the market exhibits four recurring operational issues.')
add_blank(doc)
add_body(doc, 'First, there is a transparency gap: when negotiation happens through disconnected channels, neither party has a unified, trustworthy source of current status, prior proposals, or final agreement terms. Second, there is scheduling instability: without system-level conflict checks, parallel commitments are made without awareness of existing calendar obligations, leading to double-bookings or same-day cancellations. Third, there is a payment accountability gap: informal agreements create disputes about what was agreed and what was paid. Fourth, there is a trust asymmetry: clients cannot verify handyman credentials or track historical performance; handymen cannot verify client seriousness.')
add_blank(doc)
add_body(doc, 'The project therefore frames the problem as both a user-experience issue and a process-engineering issue. The technical solution must not only render UI pages, but also enforce business rules that reduce ambiguity in real operational scenarios.')

add_heading(doc, '1.3 Stakeholders and User Needs', 2)
add_body(doc, 'The two primary user groups are clients and handymen, with an additional administrative perspective at system level.')
add_blank(doc)
add_body(doc, 'Clients require a predictable process: they need to submit requests quickly, receive timely responses, understand whether the request is waiting on them or on the handyman, and retain a clear ticket trail for follow-up. In practical terms, they need fewer communication steps and clearer state visibility.')
add_blank(doc)
add_body(doc, 'Handymen require queue control and schedule protection. They need a dashboard view of relevant jobs filtered by their service specialty, the ability to accept, decline, or counter-offer based on real availability, and safeguards against accepting overlapping appointments. They also benefit from reduced communication fragmentation, because negotiation through defined API actions is more auditable than informal messaging.')
add_blank(doc)
add_body(doc, 'The administrative perspective requires traceability and maintainability. The system architecture must preserve clean domain boundaries and auditable transitions so that quality controls can be introduced in later phases without redesigning core logic. Admin-facing endpoints exist for tracking all system lifecycles, verifying handyman accounts, viewing service breakdowns, and reviewing the platform escrow ledger.')

add_heading(doc, '1.4 Data Collection and Evidence Basis', 2)
add_body(doc, 'This final document is grounded in two complementary evidence streams.')
add_blank(doc)
add_body(doc, 'The first stream is domain-level secondary evidence: labor-market and digitalization discussions relevant to Bosnia and Herzegovina, especially around artisan supply pressure and the gradual digital transformation of service SMEs. These sources define strategic motivation and contextual relevance.')
add_blank(doc)
add_body(doc, 'The second stream is implementation-level primary evidence: direct examination of the current GetItFixed codebase and running workflows. The analysis covers domain models, endpoint behavior, authentication mechanisms, scheduling logic, request/negotiation states, and currently available UI modules. References to specific files, model fields, and API endpoint paths throughout this document reflect direct codebase inspection.')

add_heading(doc, '1.5 Project Purpose', 2)
add_body(doc, 'The purpose of GetItFixed is to convert an informal coordination model into a structured digital workflow that is transparent to both sides of the transaction. The platform is designed to make service requests trackable, negotiation explicit, and status progression deterministic.')
add_blank(doc)
add_body(doc, 'At this stage of development, the practical value proposition is: a client can create a request with photo/video attachments, the system generates a formal ticket identifier (GIT-XXXXX format), the handyman can respond through defined actions (accept/decline/counter), both parties see the current state through role-specific views, funds are held in escrow during the job, and a PDF invoice is generated upon completion.')

add_heading(doc, '1.6 Project Objectives (Current Scope)', 2)
add_body(doc, 'The project currently operates under validated objectives consistent with the implemented system.')
add_blank(doc)
add_body(doc, 'The first objective is localization-ready data modeling: user records include location fields suitable for the Bosnian market, including city and county/canton attributes stored in the custom User model. The second objective is urgency-driven response logic: urgent requests are assigned a 30-minute response window, while standard requests receive a 3-hour window, with server-side enforcement via expires_at timestamps. The third objective is dual-state lifecycle tracking: booking status and negotiation status are maintained as independent fields to enable deterministic awaiting-party detection. The fourth objective is escrow-based payment integrity: client funds are locked at acceptance and released only upon confirmed completion, with platform fee and PDV withheld separately.')

add_heading(doc, '1.7 Current Scope Boundaries and Constraints', 2)
add_body(doc, 'The implemented scope includes authentication flows, role-aware routing, profile updates, avatar management, booking creation, negotiation actions, ticket tracking, scheduling conflict checks, escrow payment, invoice generation, and AI service classification. The language provider (EN/BS) and theme provider (light/dark) are also operational and integrated across all pages.')
add_blank(doc)
add_body(doc, 'Several areas remain partially implemented or under refinement. These include full consistency of every status displayed in the UI against backend transition endpoints, deeper automation for expiry finalization beyond interactive countdown behavior, and completion of broader admin-facing workflow pages. Out-of-scope items at this stage include a real payment gateway integration (currently simulated via direct wallet top-up), push notifications for real-time status updates, and full production security hardening.')
doc.add_page_break()

# ===========================
# LITERATURE REVIEW
# ===========================
add_heading(doc, '2. LITERATURE REVIEW', 1)
add_blank(doc)
add_body(doc, 'In an increasingly urban population, the need for quality home repair work and artisan services is growing, but locating a trusted trade worker has become harder. A number of digital booking platforms and service marketplaces cater to this demand worldwide, but each comes with particular constraints that make direct adaptation to the Bosnian context impractical.')
add_blank(doc)
add_body(doc, 'TaskRabbit is regarded as one of the top companies in the casual labor and home repair category. It lets clients look for local service providers, access their rates, and schedule assistance for various tasks. Nonetheless, TaskRabbit requires embedded digital payment infrastructure and is built on the premise of pre-verified identity, which requires costly onboarding processes incompatible with a local startup context in Bosnia and Herzegovina [1].')
add_blank(doc)
add_body(doc, "Thumbtack's purpose is to save clients time by pairing them with the right professional based on project information and location data. Service providers can share their unique quotes and discuss pricing through an in-app chat. Despite this, Thumbtack operates strictly in North America and does not support localization to other languages or currencies. Furthermore, its architecture relies heavily on geographic density of providers that does not yet exist in the BiH market [2].")
add_blank(doc)
add_body(doc, 'Angi (formerly Angie\'s List) shares several features with other platforms, including detailed user reviews, pre-priced service packages, and comprehensive scheduling tools. It emphasizes high-end, certified contractor businesses and offers multi-tier project tracking. However, for average users, the platform\'s complexity is prohibitive, and its North American focus makes European market adaptation structurally difficult [3].')
add_blank(doc)
add_body(doc, 'Most households in Bosnia and Herzegovina still rely on informal communication channels, such as social media groups, public classified ads (oglasi.ba, kupujemprodajem.com), phone calls, and personal referrals. Very few structured service-booking systems are widely offered in the region. While there are general advertising websites and online classifieds, they are one-directional listings without any booking flow, negotiation infrastructure, or payment assurance.')
add_blank(doc)
add_body(doc, 'Existing research in service marketplace design identifies several recurring themes. First, informal agreements are highly vulnerable to communication breakdowns; both client and provider often misunderstand who should take the next step in a negotiation [4]. Second, few local designs focus on structured, backend-verified state transitions, which means that status visibility is dependent on voluntary communication rather than system enforcement. Third, trust mechanisms such as escrow payment and verified profiles have been shown to significantly increase transaction completion rates in bilateral service markets [5].')
add_blank(doc)
add_body(doc, 'While TaskRabbit, Thumbtack, and Angi offer good service-matching and booking solutions, all have rigid financial infrastructures and are available only in Western markets, making them costly and unavailable in Bosnia and Herzegovina. The primary purpose is to automate service and find providers, but none implements the full dual-state lifecycle that GetItFixed centers its design on. GetItFixed addresses these gaps by building a negotiation-centric booking engine with deterministic state transitions, escrow-backed payment flow, and a bilingual interface specifically designed for the BiH market context.')
doc.add_page_break()

# ===========================
# RESEARCH METHODOLOGY
# ===========================
add_heading(doc, '3. RESEARCH METHODOLOGY', 1)

add_heading(doc, '3.1 Software Requirements Specification (SRS)', 2)

add_heading(doc, '3.1.1 SRS Scope and Interpretation', 3)
add_body(doc, 'This SRS defines mandatory system behavior within the current project lifecycle. Functional requirements describe what the system must do, while non-functional requirements define quality constraints under which that behavior must operate. Requirement statements use "shall" wording to support testability and unambiguous interpretation. Where a requirement is partially implemented, an implementation note is included to distinguish aspiration from current state.')

add_heading(doc, '3.1.2 Functional Requirements (FR)', 3)
add_blank(doc)
add_body(doc, 'FR-1 Authentication and Role-Based Access', bold=True)
add_body(doc, 'FR-1.1 The system shall allow account registration for client and handyman roles.')
add_body(doc, 'FR-1.2 The system shall authenticate users through backend-managed token mechanisms.')
add_body(doc, 'FR-1.3 The frontend shall render role-specific navigation and views after successful authentication.')
add_body(doc, 'Rationale and implementation note: This requirement set establishes controlled access to distinct workflows. The current implementation uses DRF TokenAuthentication supplemented by a custom CookieTokenAuthentication class that reads the auth_token cookie, allowing both header-based and cookie-based API calls from the same session. Handyman accounts are set to is_active=False upon registration and require admin approval before login is permitted.')
add_blank(doc)
add_body(doc, 'FR-2 Profile and Identity Management', bold=True)
add_body(doc, 'FR-2.1 The system shall allow authenticated users to view and update core profile data.')
add_body(doc, 'FR-2.2 The system shall allow avatar upload and avatar removal.')
add_body(doc, 'FR-2.3 The system shall store media assets through cloud object storage integration.')
add_body(doc, 'Rationale and implementation note: Identity quality directly affects trust and usability in marketplace applications. The current implementation supports profile retrieval and update via PATCH /api/accounts/me/, password change via POST /api/accounts/change-password/, and avatar lifecycle with the URL stored as a text field pointing to Supabase object storage. A DiceBear avatar fallback is used when no custom avatar has been uploaded.')
add_blank(doc)
add_body(doc, 'FR-3 Booking Creation and Ticketing', bold=True)
add_body(doc, 'FR-3.1 The system shall allow clients to create booking requests with service category, problem description, and preferred time.')
add_body(doc, 'FR-3.2 The system shall allow request urgency designation (urgent vs standard).')
add_body(doc, 'FR-3.3 The system shall generate a unique ticket identifier for each request.')
add_body(doc, 'FR-3.4 The system shall support optional photo and video attachments per booking, with a maximum file size of 50 MB per file and 100 MB total per booking.')
add_body(doc, 'Rationale and implementation note: Ticket identity provides auditable traceability for support and user communication. The current model generates GIT-XXXXX format identifiers using sequential counter logic in the Booking.save() override. Media attachments are stored in Supabase S3-compatible object storage via django-storages with the S3Boto3Storage backend.')
add_blank(doc)
add_body(doc, 'FR-4 Negotiation Workflow', bold=True)
add_body(doc, 'FR-4.1 The system shall maintain negotiation state independently from primary booking lifecycle state.')
add_body(doc, 'FR-4.2 The system shall allow handymen to accept, decline, or counter-offer a request.')
add_body(doc, 'FR-4.3 The system shall allow clients to accept, decline, or counter a handyman proposal.')
add_body(doc, 'FR-4.4 The system shall transition to confirmed acceptance only through valid negotiation resolution.')
add_body(doc, 'Rationale and implementation note: This requirement formalizes the most critical domain behavior. By separating status and negotiation_status fields on the Booking model, the system represents awaiting-party scenarios without corrupting the global job status. The last_action_by field tracks which party acted most recently, enabling the UI to display appropriate call-to-action buttons.')
add_blank(doc)
add_body(doc, 'FR-5 Scheduling Conflict Prevention', bold=True)
add_body(doc, 'FR-5.1 The system shall perform server-side timeslot availability validation before final acceptance.')
add_body(doc, 'FR-5.2 The system shall enforce a minimum buffer period of 30 minutes between accepted jobs for the same handyman.')
add_body(doc, 'Rationale and implementation note: Conflict prevention must be backend-enforced to ensure consistency regardless of client-side behavior. The Booking.is_timeslot_available() static method filters all accepted bookings for the handyman and checks for temporal overlap including the 30-minute buffer. This check is called in both HandymanNegotiationActionView and AcceptJobView before any acceptance is committed.')
add_blank(doc)
add_body(doc, 'FR-6 Tracking and Visibility', bold=True)
add_body(doc, 'FR-6.1 The system shall provide clients with request list and request detail views.')
add_body(doc, 'FR-6.2 The system shall support ticket-based tracking for authorized users via GIT-XXXXX identifiers.')
add_body(doc, 'FR-6.3 The system shall provide handymen with dashboard visibility into relevant pending and active jobs, filtered by their service specialty.')
add_body(doc, 'Rationale and implementation note: Visibility is essential for reducing uncertainty in bilateral service workflows. The HandymanDashboardView query includes both unassigned pending jobs matching the handyman\'s service_type and all jobs where that handyman is the assigned provider, ordered by most recent activity.')
add_blank(doc)
add_body(doc, 'FR-7 Localization and Interface Configuration', bold=True)
add_body(doc, 'FR-7.1 The system shall support English and Bosnian language contexts for core flows.')
add_body(doc, 'FR-7.2 The system shall support light/dark theme configuration.')
add_body(doc, 'Rationale and implementation note: Localization and visual accessibility are practical adoption factors in mixed-user demographics. The frontend implements a custom LanguageProvider React context with a flat translation key namespace (e.g. home.heroTitleStart) and persists user preference to localStorage. The ThemeProvider toggles the dark CSS class on document.documentElement and also persists via localStorage, with an anti-flash inline script injected in layout.tsx to prevent a white flash before React hydration.')
add_blank(doc)
add_body(doc, 'FR-8 Escrow Payment and Financial Transparency', bold=True)
add_body(doc, 'FR-8.1 The system shall lock client funds upon acceptance of a handyman proposal.')
add_body(doc, 'FR-8.2 The system shall release funds to the handyman upon client confirmation of job completion.')
add_body(doc, 'FR-8.3 The system shall refund locked funds to the client if the job is marked as not completed.')
add_body(doc, 'FR-8.4 The system shall generate a downloadable PDF invoice for closed bookings.')
add_body(doc, 'Rationale and implementation note: All financial operations are atomic transactions implemented in escrow_service.py. The pricing module (pricing.py) computes a 20% platform app fee and 17% PDV on top of the base amount, storing each component as separate columns in EscrowHold. PDF generation uses ReportLab with DejaVu Unicode fonts to support diacritic characters.')

add_heading(doc, '3.1.3 Non-Functional Requirements (NFR)', 3)
add_blank(doc)
add_body(doc, 'NFR-1 Performance', bold=True)
add_body(doc, 'NFR-1.1 The frontend shall remain responsive under normal user interaction patterns on standard devices.')
add_body(doc, 'NFR-1.2 Core booking endpoints should maintain low-latency responses under expected load.')
add_body(doc, 'Performance targets should be validated through repeatable test scripts in the next phase.')
add_blank(doc)
add_body(doc, 'NFR-2 Security', bold=True)
add_body(doc, 'NFR-2.1 Protected API resources shall require valid authenticated tokens.')
add_body(doc, 'NFR-2.2 Session transport shall support secure token transfer via cookie/header strategy.')
add_body(doc, 'NFR-2.3 Production deployment shall include finalized CSRF and security hardening policies.')
add_body(doc, 'The current development setup deliberately prioritizes decoupled local integration, with CSRF middleware disabled and Lax SameSite cookie policy. Production hardening is identified as a pending task.')
add_blank(doc)
add_body(doc, 'NFR-3 Reliability and Consistency', bold=True)
add_body(doc, 'NFR-3.1 Booking and negotiation transitions shall be deterministic and auditable.')
add_body(doc, 'NFR-3.2 Critical lifecycle transitions shall be validated server-side, not relying on frontend state.')
add_body(doc, 'NFR-3.3 Escrow financial operations shall use database transactions to prevent partial-state corruption.')
add_blank(doc)
add_body(doc, 'NFR-4 Maintainability', bold=True)
add_body(doc, 'NFR-4.1 Frontend and backend concerns shall remain decoupled via REST API boundary.')
add_body(doc, 'NFR-4.2 Domain rules shall remain centralized in backend logic.')
add_body(doc, 'NFR-4.3 Data model overlap shall be progressively normalized as part of technical debt reduction.')
add_blank(doc)
add_body(doc, 'NFR-5 Scalability', bold=True)
add_body(doc, 'NFR-5.1 The architecture shall support independent evolution of frontend and backend modules.')
add_body(doc, 'NFR-5.2 Service and data design shall allow incremental adaptation for future regional expansion.')
add_blank(doc)
add_body(doc, 'NFR-6 Usability and Accessibility', bold=True)
add_body(doc, 'NFR-6.1 High-frequency user actions shall be executable with minimal interaction steps.')
add_body(doc, 'NFR-6.2 Core flows shall remain usable under both supported language and theme contexts.')
add_body(doc, 'Usability in this domain is not cosmetic; it directly affects whether users complete requests in-app instead of reverting to external communication.')

add_heading(doc, '3.2 Development Methodology', 2)
add_body(doc, 'The project followed an iterative development approach aligned with agile principles. Development was organized into feature-driven cycles with the following progression: (1) authentication and user model, (2) booking creation and basic negotiation flow, (3) scheduling conflict prevention, (4) escrow payment and financial models, (5) quote system and two-phase payment, (6) PDF invoice generation, (7) AI service classification assistant, (8) photo/video attachment support, and (9) admin management APIs.')
add_blank(doc)
add_body(doc, 'Git version control was used throughout, with feature branches for each major subsystem. The codebase maintains unit tests in tests.py files for each Django app, and end-to-end tests in tests_e2e.py for the bookings workflow. The Celery configuration is present for future background task scheduling (e.g., automated expiry processing), though in the current development phase expiry is triggered by frontend countdown timers calling the /expire/ endpoint.')

add_heading(doc, '3.3 Use of AI Tools', 2)
add_body(doc, 'AI-based tools were used to assist with code syntax suggestions, to generate boilerplate code structures, and to improve language clarity in the report. All algorithms, business logic, architectural decisions, and test implementations were designed, implemented, and validated by the authors. The AI service classification feature (Google Gemini integration) is a core system feature rather than a development tool; its design, prompt engineering, fallback handling, and integration are original work by the authors.')
doc.add_page_break()

# ===========================
# SYSTEM ARCHITECTURE
# ===========================
add_heading(doc, '4. SYSTEM ARCHITECTURE AND TECHNICAL DESIGN', 1)

add_heading(doc, '4.1 Architectural Overview', 2)
add_body(doc, 'GetItFixed is built on a three-tier architecture with a strict separation between the data layer, business logic layer, and presentation layer. The backend is a Python/Django application exposing a REST API; the frontend is a React/Next.js application consuming that API. The database is PostgreSQL hosted on Supabase. File storage for booking attachments and avatars also uses Supabase, accessed via an S3-compatible interface.')
add_blank(doc)
add_body(doc, 'The separation between frontend and backend is enforced at the API boundary. All business rule validation, state transition logic, and financial operations occur in the backend. The frontend only presents data and triggers actions via HTTP calls, making it possible to replace or extend either layer independently.')
add_blank(doc)
add_body(doc, 'The backend is structured as a Django project with three custom applications:', bold=False)
add_blank(doc)
add_body(doc, 'accounts: Custom User model extending AbstractUser, authentication views, profile management, and wallet management. Handles registration (with handyman pending-approval logic), login with dual cookie/header token support, logout, avatar management, and wallet top-up.')
add_blank(doc)
add_body(doc, 'bookings: The primary domain application. Contains the Booking, Quote, QuoteLineItem, EscrowHold, WalletTransaction, BookingAttachment, and Review models. Implements the full booking lifecycle, negotiation workflow, scheduling conflict detection, escrow payment operations, and PDF invoice generation.')
add_blank(doc)
add_body(doc, 'services: Handyman directory listing and the AI Repair Assistant using Google Gemini for semantic classification of user-described home problems to registered service categories.')
add_blank(doc)
add_body(doc, 'The core module contains Django project configuration, the ASGI/WSGI entry points, and the Celery configuration for background task processing.')

add_heading(doc, '4.2 Technology Stack', 2)
add_blank(doc)
add_body(doc, 'Backend Technology Stack', bold=True)
add_blank(doc)

tech_table = doc.add_table(rows=1, cols=3)
tech_table.style = 'Table Grid'
hdr = tech_table.rows[0].cells
hdr[0].text = 'Component'
hdr[1].text = 'Technology / Version'
hdr[2].text = 'Purpose'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True

backend_tech = [
    ('Web framework', 'Django 5.2.10', 'ORM, admin, URL routing, middleware pipeline'),
    ('API layer', 'Django REST Framework 3.17.1', 'Serializers, ViewSets, token authentication, permissions'),
    ('Database', 'PostgreSQL (Supabase-hosted)', 'Relational storage via psycopg2-binary 2.9.11'),
    ('File storage', 'Supabase S3 (django-storages 1.14.6 + boto3 1.42.96)', 'Booking attachments, avatar images'),
    ('Background tasks', 'Celery 5.6.3 + Redis (broker)', 'Async task queue (configured, ready for expiry automation)'),
    ('AI classification', 'google-genai 2.6.0 (Gemini 2.5 Flash Lite)', 'Semantic service category classification'),
    ('PDF generation', 'ReportLab 4.4.1', 'Invoice PDF with custom fonts, logo, branded layout'),
    ('CORS', 'django-cors-headers 4.9.0', 'Cross-origin access control for frontend domain'),
    ('Configuration', 'django-environ 0.13.0', 'Environment variable management from .env file'),
]
for row_data in backend_tech:
    row = tech_table.add_row().cells
    for i, val in enumerate(row_data):
        row[i].text = val

add_blank(doc)
add_body(doc, 'Frontend Technology Stack', bold=True)
add_blank(doc)

front_table = doc.add_table(rows=1, cols=3)
front_table.style = 'Table Grid'
hdr = front_table.rows[0].cells
hdr[0].text = 'Component'
hdr[1].text = 'Technology / Version'
hdr[2].text = 'Purpose'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True

frontend_tech = [
    ('Framework', 'Next.js 16.1.6 (App Router)', 'Server-side rendering, file-based routing, layout system'),
    ('UI library', 'React 19.2.3', 'Component model, hooks, context providers'),
    ('Language', 'TypeScript 5.x', 'Static typing for API responses and component props'),
    ('Styling', 'Tailwind CSS 4.2.1', 'Utility-first CSS with dark mode via class strategy'),
    ('HTTP client', 'Axios 1.13.6', 'API requests with token interceptor and cookie credentials'),
    ('Icons', 'Lucide React 0.575.0', 'Consistent SVG icon set throughout the UI'),
    ('Date picker', 'react-datepicker 9.1.0', 'Calendar widget for appointment time selection'),
    ('Phone input', 'react-phone-number-input 3.4.16', 'Formatted international phone number input'),
    ('Build tool', 'Next.js built-in (Turbopack)', 'Compilation, bundling, hot reload in development'),
]
for row_data in frontend_tech:
    row = front_table.add_row().cells
    for i, val in enumerate(row_data):
        row[i].text = val

add_heading(doc, '4.3 Database Design', 2)
add_body(doc, 'The database is PostgreSQL, managed by Django ORM migrations. The schema is organized around seven primary domain models across two Django applications.')

add_heading(doc, '4.3.1 User Model (accounts.User)', 3)
add_body(doc, 'The custom user model extends Django\'s AbstractUser, using email as the primary identifier (USERNAME_FIELD = "email"). It adds the following domain-specific fields:')
add_blank(doc)

user_fields_table = doc.add_table(rows=1, cols=3)
user_fields_table.style = 'Table Grid'
hdr = user_fields_table.rows[0].cells
hdr[0].text = 'Field'
hdr[1].text = 'Type'
hdr[2].text = 'Purpose'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True

user_fields = [
    ('role', 'CharField (choices: client, handyman, admin)', 'Determines access scope and UI routing'),
    ('service_type', 'CharField (nullable)', 'Handyman specialty used for job matching in dashboard query'),
    ('phone', 'CharField (nullable)', 'Contact number displayed to counterpart on confirmed bookings'),
    ('county / city / zip_code', 'CharFields (nullable)', 'Location for BiH-specific geographic filtering'),
    ('rating', 'DecimalField (3.1)', 'Average star rating from completed job reviews (default 5.0)'),
    ('hourly_rate', 'IntegerField', 'Base rate in KM/hr used for price estimation before negotiation'),
    ('bio', 'TextField (max 500)', 'Free-text professional description shown on profile page'),
    ('avatar', 'TextField (nullable)', 'Stores Supabase URL string for avatar image'),
    ('avatar_url', 'URLField (nullable)', 'Alternative URL field (legacy compatibility)'),
    ('terms_accepted', 'BooleanField', 'Records terms-of-service acceptance at registration'),
    ('wallet_balance', 'DecimalField (10.2)', 'Total wallet balance including locked funds'),
    ('wallet_locked_balance', 'DecimalField (10.2)', 'Amount currently locked in active escrow holds'),
    ('wallet_available_balance', '@property', 'Computed: wallet_balance - wallet_locked_balance, floored at 0'),
]
for row_data in user_fields:
    row = user_fields_table.add_row().cells
    for i, val in enumerate(row_data):
        row[i].text = val

add_heading(doc, '4.3.2 Booking Model (bookings.Booking)', 3)
add_body(doc, 'The Booking model is the central domain entity. It carries two independent state fields to implement the dual-state lifecycle model:')
add_blank(doc)
add_body(doc, 'The status field has 15 choices: pending, accepted, in_progress, visit_completed, visit_fee_pending, visit_fee_paid, quote_pending_client, funds_locked, handyman_done, not_completed, awaiting_payment, paid, closed, completed (legacy), and cancelled.')
add_blank(doc)
add_body(doc, 'The negotiation_status field has 4 choices: none, awaiting_handyman, awaiting_client, agreed, declined.')
add_blank(doc)
add_body(doc, 'Key fields and their roles:')
add_blank(doc)

booking_fields_table = doc.add_table(rows=1, cols=3)
booking_fields_table.style = 'Table Grid'
hdr = booking_fields_table.rows[0].cells
hdr[0].text = 'Field'
hdr[1].text = 'Type'
hdr[2].text = 'Purpose'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True

booking_fields = [
    ('ticket_id', 'CharField (unique, editable=False)', 'GIT-XXXXX format identifier, auto-generated in save()'),
    ('client / handyman', 'ForeignKey to User', 'client: CASCADE on delete; handyman: SET_NULL (can be unassigned)'),
    ('is_urgent', 'BooleanField', 'Triggers 30-min expiry window and 1.5x price multiplier'),
    ('client_proposed_time', 'DateTimeField (nullable)', 'First calendar selection by client'),
    ('handyman_proposed_time', 'DateTimeField (nullable)', 'Counter-proposal time from handyman'),
    ('scheduled_time', 'DateTimeField (nullable)', 'Final agreed appointment time after negotiation'),
    ('duration_minutes', 'IntegerField (nullable)', 'Job duration used in scheduling conflict check'),
    ('agreed_price', 'DecimalField (10.2, nullable)', 'Price in KM fixed during negotiation'),
    ('expires_at', 'DateTimeField (nullable)', 'Response deadline enforced by backend and frontend timer'),
    ('handyman_response_phase', 'CharField (3 choices)', 'Tracks whether client proposed time is upcoming or past'),
    ('knows_fix', 'BooleanField (nullable)', 'If True, handyman skips inspection phase on acceptance'),
    ('last_action_by', 'CharField (client/handyman)', 'Used by UI to show correct action buttons'),
    ('visit_fee_amount', 'DecimalField (nullable)', 'Locked escrow amount for Phase 1 visit fee'),
    ('continue_job_requested/confirmed', 'BooleanFields', 'Client decision to proceed to Phase 2 after visit'),
    ('quote_status', 'CharField (7 choices)', 'Mirrors active Quote status for quick querying'),
    ('quote_locked_amount', 'DecimalField (nullable)', 'Amount locked in Phase 2 escrow hold'),
    ('payment_amount / paid_at', 'DecimalField / DateTimeField', 'Final payment record after escrow release'),
    ('client_confirmed_done_at', 'DateTimeField (nullable)', 'Timestamp when client confirmed job completion'),
    ('handyman_marked_done_at', 'DateTimeField (nullable)', 'Timestamp when handyman marked job as finished'),
]
for row_data in booking_fields:
    row = booking_fields_table.add_row().cells
    for i, val in enumerate(row_data):
        row[i].text = val

add_heading(doc, '4.3.3 Quote and QuoteLineItem Models', 3)
add_body(doc, 'The Quote model represents a formal cost estimate submitted by the handyman after the initial visit. Key design features:')
add_blank(doc)
add_body(doc, 'Versioning: Each booking can have multiple Quote versions. The unique_together constraint on (booking, version) prevents duplicate versions. When a new quote is submitted, all previous active quotes for the booking are set to is_active=False. The version counter is read from the last Quote for the booking.')
add_blank(doc)
add_body(doc, 'Subtotals: The Quote model stores pre-computed subtotals by category (subtotal_materials, subtotal_labor, subtotal_other) and a total_amount. These are populated from the QuoteLineItem records at creation time.')
add_blank(doc)
add_body(doc, 'The QuoteLineItem model stores individual line items with category (materials, labor, other), description, quantity, unit_price, and line_total. The line_total is auto-computed in save() as quantity * unit_price. Line items are ordered by sort_order then id.')

add_heading(doc, '4.3.4 EscrowHold and WalletTransaction Models', 3)
add_body(doc, 'The EscrowHold model represents a single escrow event. It has two purpose values (visit_fee and quote), four status values (locked, released, refunded, cancelled), and stores three financial components separately: handyman_amount (what the handyman receives), app_fee_amount (the 20% platform fee), and pdv_amount (the 17% VAT computed on base + app fee). The total amount column is the sum client_total_amount from the pricing formula.')
add_blank(doc)
add_body(doc, 'The pricing formula implemented in pricing.py is: app_fee = base * 0.20; pdv_base = base + app_fee; pdv = pdv_base * 0.17; client_total = base + app_fee + pdv. All arithmetic uses Python Decimal with ROUND_HALF_UP quantization to two decimal places.')
add_blank(doc)
add_body(doc, 'The WalletTransaction model provides a full audit ledger of all wallet changes. Each financial operation (lock, unlock, release, credit, debit, refund) creates one or more WalletTransaction records, recording balance_before and balance_after for each user affected by the operation. This creates a complete financial trail for every booking.')

add_heading(doc, '4.3.5 Review and BookingAttachment Models', 3)
add_body(doc, 'The Review model uses a OneToOneField to Booking (preventing duplicate reviews per booking), with a 1-5 star rating and optional comment. Reviews can only be submitted by the client, and only for bookings in closed or completed status.')
add_blank(doc)
add_body(doc, 'The BookingAttachment model stores file references for photos and videos uploaded at booking creation time. Files are stored in Supabase S3 via the BookingAttachmentStorage custom storage class, organized in YYYY/MM/ directory paths. Each attachment records its file_type (image or video) based on the MIME type of the uploaded file.')
doc.add_page_break()

# ===========================
# BACKEND API DESIGN
# ===========================
add_heading(doc, '5. BACKEND API DESIGN AND IMPLEMENTATION', 1)

add_heading(doc, '5.1 Authentication Architecture', 2)
add_body(doc, 'The authentication system uses DRF\'s built-in TokenAuthentication as the primary mechanism, supplemented by a custom CookieTokenAuthentication class. At login, the backend creates or retrieves an auth token, sends it in the response body (for localStorage storage), and simultaneously sets it as an httponly=False cookie with SameSite=Lax and max_age=604800 (7 days). This dual approach allows the frontend Axios instance to attach the header token from localStorage, while also ensuring that browser-based requests (e.g., direct iframe calls or form submissions) work via the cookie.')
add_blank(doc)
add_body(doc, 'The CookieTokenAuthentication class reads the auth_token cookie key and looks up the token in the database using Token.objects.select_related("user").get(key=token_key). If the token is absent from the cookie, the method returns None (allowing the standard TokenAuthentication to handle header-based tokens). If the token is present but invalid, an AuthenticationFailed exception is raised.')
add_blank(doc)
add_body(doc, 'Handyman accounts have is_active=False set immediately after registration. The login serializer (EmailAuthSerializer) validates is_active and returns a descriptive error message telling the user their account is pending admin approval. This prevents unauthorized service providers from accessing the platform.')

add_heading(doc, '5.2 Booking Lifecycle API', 2)
add_body(doc, 'The booking lifecycle is managed through a set of action-oriented API views, all rooted under /api/bookings/. The following table summarizes the key endpoints:')
add_blank(doc)

api_table = doc.add_table(rows=1, cols=4)
api_table.style = 'Table Grid'
hdr = api_table.rows[0].cells
hdr[0].text = 'Endpoint'
hdr[1].text = 'Method'
hdr[2].text = 'Actor'
hdr[3].text = 'Description'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True

api_endpoints = [
    ('POST /api/bookings/create/', 'POST', 'Client', 'Create booking with optional handyman_id for direct assignment. Handles file attachments up to 100 MB total.'),
    ('GET /api/bookings/my-requests/', 'GET', 'Client', 'List all bookings where client == request.user, ordered by newest first.'),
    ('GET /api/bookings/dashboard/', 'GET', 'Handyman', 'List all pending unassigned jobs matching service_type plus all jobs where handyman == request.user.'),
    ('POST /api/bookings/<id>/handyman-action/', 'POST', 'Handyman', 'Accept (with duration + price), decline, or counter with proposed_time. Enforces scheduling conflict check on accept.'),
    ('POST /api/bookings/<id>/client-action/', 'POST', 'Client', 'Accept (locks escrow, transitions to accepted or visit_fee_paid if knows_fix=True), decline, or counter with proposed_time.'),
    ('POST /api/bookings/<id>/status-check/', 'POST', 'Both', 'Transitions booking from accepted to in_progress when scheduled_time <= now.'),
    ('POST /api/bookings/<id>/visit-complete/', 'POST', 'Handyman', 'Marks visit as finished (handyman_done). Client must then confirm or dispute.'),
    ('POST /api/bookings/<id>/complete/', 'POST', 'Both', 'Multi-action endpoint: mark_done, confirm_done (releases escrow), mark_not_completed (refunds escrow), check_auto_complete, pay, acknowledge_payment.'),
    ('POST /api/bookings/<id>/continue-job/', 'POST', 'Client', 'Client decides whether to proceed to Phase 2 (quote-based repair) after initial visit.'),
    ('POST /api/bookings/<id>/quotes/', 'POST', 'Handyman', 'Create versioned Quote with line_items list. Transitions booking to quote_pending_client.'),
    ('GET /api/bookings/<id>/quotes/latest/', 'GET', 'Both', 'Retrieve the most recent Quote for the booking.'),
    ('POST /api/bookings/<id>/quotes/<qid>/client-action/', 'POST', 'Client', 'Accept (locks Phase 2 escrow), reject, or counter a Quote.'),
    ('GET /api/bookings/<id>/escrow/', 'GET', 'Both', 'Get current EscrowHold status for a booking.'),
    ('GET /api/bookings/<id>/invoice/', 'GET', 'Client', 'Get structured invoice JSON (only for closed bookings).'),
    ('GET /api/bookings/<id>/invoice/pdf/', 'GET', 'Client', 'Download branded PDF invoice (only for closed bookings).'),
    ('POST /api/bookings/<id>/expire/', 'POST', 'Both', 'Trigger expiry processing when countdown reaches zero. Calls process_handyman_negotiation_expiry().'),
    ('GET /api/bookings/tickets/<ticket_id>/', 'GET', 'Client', 'Look up booking by numeric ID extracted from GIT-XXXXX format.'),
    ('GET /api/bookings/busy-slots/<handyman_id>/', 'GET', 'Any', 'Return scheduled_time and duration_minutes for all accepted bookings (for calendar rendering).'),
    ('POST /api/bookings/<id>/review/', 'POST', 'Client', 'Submit 1-5 star review after booking is closed/completed.'),
    ('GET /api/bookings/expert/<expert_id>/reviews/', 'GET', 'Any', 'List all reviews received by a specific handyman.'),
    ('GET /api/accounts/handymen/', 'GET', 'Any', 'List all handyman accounts with optional service_type filter.'),
    ('PATCH /api/accounts/me/', 'PATCH', 'Auth', 'Update profile fields and avatar URL.'),
    ('POST /api/accounts/wallet/add/', 'POST', 'Client', 'Demo wallet top-up (no real payment gateway; for testing escrow flows).'),
    ('POST /api/ai-helper/', 'POST', 'Any', 'Classify user-described problem to service category via Gemini AI.'),
]
for row_data in api_endpoints:
    row = api_table.add_row().cells
    for i, val in enumerate(row_data):
        row[i].text = val

add_heading(doc, '5.3 Dual-State Lifecycle Model', 2)
add_body(doc, 'The dual-state design is the architectural centerpiece of the booking engine. Traditional marketplace platforms use a single status field that conflates negotiation states with lifecycle states, creating ambiguity about which party should act next. GetItFixed separates these concerns into two orthogonal fields.')
add_blank(doc)
add_body(doc, 'The global status field tracks the objective state of the booking: is it pending resolution, in an active visit, waiting for payment, or closed? The negotiation_status field tracks the micro-level negotiation state: is the system waiting for the handyman to respond, the client to decide, or has agreement been reached?')
add_blank(doc)
add_body(doc, 'This design enables the following business rules that would be impossible with a single-field approach: A booking can be simultaneously status=pending and negotiation_status=awaiting_client (the handyman has proposed terms and we are waiting for the client). The UI can show this state with a clear "awaiting your decision" message and action buttons. Without the separate field, "pending" could mean anything from "no handyman yet" to "waiting for client response".')
add_blank(doc)
add_body(doc, 'The last_action_by field records which party most recently changed state, enabling the frontend to render appropriate call-to-action buttons without needing to interpret the combination of both state fields. The handyman_response_phase field adds a third dimension for the specific sub-state within the handyman\'s response window: before_client_time (client\'s proposed time is still upcoming), after_client_time (client\'s time has passed and handyman must counter or decline), and negotiation (counter-offer back-and-forth in progress).')

add_heading(doc, '5.4 Scheduling Conflict Prevention', 2)
add_body(doc, 'The Booking.is_timeslot_available() static method is the central guard against double-booking. The algorithm:')
add_blank(doc)
add_body(doc, '1. Filter all bookings where handyman == target and status == accepted (confirmed appointments).')
add_body(doc, '2. For each existing booking, compute its end time as scheduled_time + duration_minutes + 30 minutes (buffer).')
add_body(doc, '3. Compute the new booking\'s end time as proposed_start + new_duration_minutes + 30 minutes.')
add_body(doc, '4. Check for overlap: new_start < existing_end AND new_end > existing_start.')
add_body(doc, '5. If any overlap is found, return False (slot unavailable). Otherwise return True.')
add_blank(doc)
add_body(doc, 'The method accepts an exclude_booking_id parameter for re-validation of existing bookings (preventing a booking from conflicting with itself during renegotiation). The 30-minute buffer between jobs is enforced on both sides of each slot, meaning a handyman cannot accept a job starting within 30 minutes of a previous job ending, nor starting 30 minutes before an upcoming job begins.')

add_heading(doc, '5.5 Deadline and Expiry Management', 2)
add_body(doc, 'Response deadlines are managed in deadline_utils.py. The set_handyman_response_deadline() function implements the following logic:')
add_blank(doc)
add_body(doc, 'On the first handyman turn (is_first_handyman_turn() returns True when handyman_proposed_time is None): the deadline is the minimum of the client\'s proposed time and the standard 3-hour window (or 1 hour for urgent). This prevents the system from setting a deadline days in the future just because the client proposed a far-future appointment time.')
add_blank(doc)
add_body(doc, 'On subsequent turns (counter-offer negotiations): a fresh 3-hour window is always applied, regardless of any proposed appointment times, to maintain predictable negotiation cadence.')
add_blank(doc)
add_body(doc, 'The repair_stale_handyman_deadline() function is called on every read of a booking (in HandymanDashboardView and BookingDetailView) to fix any deadline discrepancies that may have accumulated, for example if a booking was created before the deadline logic was updated. This function also transitions the handyman_response_phase when the client\'s proposed time passes during the response window.')
add_blank(doc)
add_body(doc, 'The process_handyman_negotiation_expiry() function handles what happens when a deadline is hit: for first-turn bookings in before_client_time phase, if the client time is still upcoming, the deadline is extended to that time (phase transitions to after_client_time); if the client time has passed, it auto-declines; for negotiation-phase bookings, it auto-declines.')

add_heading(doc, '5.6 Escrow Service Implementation', 2)
add_body(doc, 'The escrow_service.py module implements three atomic financial operations using Django\'s select_for_update() on all affected records to prevent race conditions.')
add_blank(doc)
add_body(doc, 'lock_client_funds(): Called when the client accepts a handyman proposal (Phase 1) or accepts a Quote (Phase 2). Validates that the client has sufficient available balance (wallet_balance - wallet_locked_balance). Increments wallet_locked_balance on the client. Creates EscrowHold with purpose=visit_fee or quote, storing all three financial components (handyman_amount, app_fee_amount, pdv_amount). Creates a WalletTransaction of type lock. For quote purposes, also updates booking.funds_locked_at, booking.quote_locked_amount, and booking.status=funds_locked, and sets the Quote.status=accepted.')
add_blank(doc)
add_body(doc, 'release_funds_to_handyman(): Called when client confirms job completion. Decrements both wallet_locked_balance and wallet_balance on the client. Increments wallet_balance on the handyman by handyman_amount only. Increments wallet_balance on the admin account by app_fee_amount (platform fee collection). Creates WalletTransaction records for all three parties. PDV is intentionally withheld and not transferred to any party in the current pre-production accounting mode. Updates EscrowHold.status=released.')
add_blank(doc)
add_body(doc, 'refund_locked_funds(): Called when client marks job as not_completed. Decrements only wallet_locked_balance on the client (releasing the lock without debiting). Creates a WalletTransaction of type unlock. The handyman receives nothing. Updates EscrowHold.status=refunded. This function handles both visit_fee and quote escrow hold types.')

add_heading(doc, '5.7 AI Service Classification', 2)
add_body(doc, 'The AI Repair Assistant uses Google Gemini (gemini-2.5-flash-lite model) for semantic classification of user-described home problems. The system dynamically builds its category list by querying the live database for all distinct service_type values registered by active handymen, normalizing for case and spacing variations. This means the AI prompt automatically reflects the current state of available services without code changes.')
add_blank(doc)
add_body(doc, 'The system prompt instructs Gemini to: (1) use semantic reasoning rather than keyword matching, (2) apply the catalog of DB values to display name mappings, (3) handle plural/variant forms, (4) return a structured JSON response with status (match or no_match), category (DB value), and explanation. The model temperature is set to 0.2 for consistent, deterministic classification.')
add_blank(doc)
add_body(doc, 'The response pipeline includes JSON extraction (with markdown fence stripping), category alias normalization using SERVICE_DISPLAY_ALIASES, and fuzzy matching via difflib.get_close_matches() with a 0.72 similarity cutoff. The system handles Gemini quota errors (HTTP 429) with a single retry after 15-20 seconds, and model unavailability errors (HTTP 404) with immediate graceful fallback to a no_match response.')
add_blank(doc)
add_body(doc, 'A fallback mechanism is implemented at every failure point (missing API key, empty response, JSON parse error, invalid payload structure) to ensure the endpoint always returns a well-formed response rather than exposing server errors to the user.')
doc.add_page_break()

# ===========================
# FRONTEND DESIGN
# ===========================
add_heading(doc, '6. FRONTEND ARCHITECTURE AND USER INTERFACE', 1)

add_heading(doc, '6.1 Next.js Application Structure', 2)
add_body(doc, 'The frontend is a Next.js 16 application using the App Router paradigm. The directory structure under src/app/ defines URL routes through the file system. The following pages are implemented:')
add_blank(doc)

pages_table = doc.add_table(rows=1, cols=3)
pages_table.style = 'Table Grid'
hdr = pages_table.rows[0].cells
hdr[0].text = 'Route'
hdr[1].text = 'Page'
hdr[2].text = 'Purpose'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True

pages = [
    ('/', 'page.tsx', 'Landing page with hero, service categories, how-it-works, and trust badges'),
    ('/login', 'login/page.tsx', 'Email/password login form with role selection'),
    ('/register', 'register/page.tsx', 'Registration form with role-specific fields (service type for handymen, phone, location)'),
    ('/services', 'services/page.tsx', 'Service category directory with handyman listings'),
    ('/[username]', '[username]/page.tsx', 'Role-aware user dashboard (client view or handyman dashboard)'),
    ('/ai-repair-assistant', 'ai-repair-assistant/page.tsx', 'Full-page AI chat interface for repair problem classification'),
    ('/how-it-works', 'how-it-works/page.tsx', 'Illustrated workflow explanation for new users'),
    ('/help', 'help/page.tsx', 'Help center and FAQ for clients'),
    ('/faq-pros', 'faq-pros/page.tsx', 'FAQ specifically for service providers'),
    ('/contact', 'contact/page.tsx', 'Contact form page'),
    ('/stories', 'stories/page.tsx', 'Success stories and testimonials'),
    ('/terms', 'terms/page.tsx', 'Terms of service'),
    ('/privacy', 'privacy/page.tsx', 'Privacy policy'),
]
for row_data in pages:
    row = pages_table.add_row().cells
    for i, val in enumerate(row_data):
        row[i].text = val

add_heading(doc, '6.2 Component Architecture', 2)
add_body(doc, 'The component layer is organized under src/components/:')
add_blank(doc)
add_body(doc, 'Layout components: header.tsx and footer.tsx are present on all pages. The header includes role-aware navigation links, dark/light theme toggle, and language switcher. The footer includes categorized links for clients, providers, and support.')
add_blank(doc)
add_body(doc, 'HandymanDashboard.tsx: The primary functional component for handyman users. It fetches the job list from /api/bookings/dashboard/, implements a four-filter view (All, Available Requests, My Active Jobs, Rejected), and renders job cards with appropriate action controls. It handles the full negotiation action flow (accept with calendar picker, counter with date/time proposal, decline), the visit completion flow, and inter-phase transitions.')
add_blank(doc)
add_body(doc, 'JobTimer.tsx: A countdown timer component that takes an expiresAt ISO string prop and renders a live countdown with second-precision updates. It calls an onExpire callback when the timer reaches zero, which triggers the /expire/ endpoint to process the deadline server-side. The component renders urgency styling when less than 15 minutes remain.')
add_blank(doc)
add_body(doc, 'HandymanNewTicketNotifier.tsx and HandymanNewTicketToast.tsx: Components that poll the dashboard endpoint at regular intervals and display toast notifications when new jobs matching the handyman\'s specialty become available.')
add_blank(doc)
add_body(doc, 'AI Repair components: ChatLauncher.tsx (floating button present on all pages), ChatClient.tsx (the chat interface logic), MessageBubble.tsx (renders individual messages with role-specific styling), and InputBar.tsx (input field with submit handler).')
add_blank(doc)
add_body(doc, 'Provider components: LanguageProvider.tsx and ThemeProvider.tsx wrap the entire application in layout.tsx and are accessible via useLanguage() and useTheme() hooks from any component in the tree.')

add_heading(doc, '6.3 State Management and API Communication', 2)
add_body(doc, 'The frontend uses React\'s built-in useState and useEffect hooks for local component state and data fetching. There is no global state management library (such as Redux or Zustand); instead, data is fetched at the component level on mount and refreshed after each user action.')
add_blank(doc)
add_body(doc, 'All API calls are made through the shared Axios instance defined in lib/axios.ts. This instance is configured with baseURL from the NEXT_PUBLIC_API_URL environment variable (defaulting to http://127.0.0.1:8000), withCredentials=true to send cookies, and a request interceptor that reads the auth_token from localStorage and attaches it as an Authorization: Token <key> header on every outbound request.')
add_blank(doc)
add_body(doc, 'Specialized API functions for the quote/escrow flow are abstracted in src/lib/quoteEscrowApi.ts, which exports named async functions for each API operation: continueJob(), createQuote(), getLatestQuote(), submitQuoteClientAction(), getEscrowStatus(), completeInitialVisit(), getBookingInvoice(), and downloadBookingInvoicePdf(). The PDF download function uses axios responseType: blob to handle the binary response.')

add_heading(doc, '6.4 Internationalization System', 2)
add_body(doc, 'The internationalization system uses a custom LanguageProvider context rather than a library like i18next. The translations are stored in a single TypeScript object in src/lib/i18n/translations.ts, organized by locale (en and bs keys) and then by namespace (home, header, footer, register, login, etc.).')
add_blank(doc)
add_body(doc, 'The getTranslationValue() function traverses the nested translation object using dot-notation keys (e.g., "home.heroTitleStart"). The formatTranslation() function handles string interpolation with named placeholders. The useLanguage() hook exposes the t(key) function, setLocale(), and the current locale to any component.')
add_blank(doc)
add_body(doc, 'Language preference is persisted to localStorage under the key site_language. On initialization, the provider checks localStorage first, then falls back to the browser navigator.language (auto-detecting Bosnian for bs-* locales), then falls back to the default English locale. The html element\'s lang attribute is updated reactively when the locale changes.')

add_heading(doc, '6.5 Theme System', 2)
add_body(doc, 'The dark/light theme system uses Tailwind CSS\'s class-based dark mode strategy, where the presence of the dark class on document.documentElement enables dark-mode variant styles. The ThemeProvider context reads the initial theme from localStorage (site_theme key), with a fallback to the system prefers-color-scheme media query.')
add_blank(doc)
add_body(doc, 'To prevent the "white flash" problem (where the page briefly renders in light mode before React hydration applies the saved theme), an inline script is injected directly in the <head> of layout.tsx. This script runs synchronously before any rendering, reads localStorage, and applies the dark class if needed. This approach is consistent with the Tailwind CSS recommended pattern for SSR-compatible dark mode.')
doc.add_page_break()

# ===========================
# RESULTS AND ANALYSIS
# ===========================
add_heading(doc, '7. RESULTS AND ANALYSIS', 1)

add_heading(doc, '7.1 Implementation Results', 2)
add_body(doc, 'The implemented system successfully addresses all four primary objectives identified in the project scope. The following subsections describe the concrete results for each major feature area.')

add_heading(doc, '7.1.1 Dual-State Lifecycle Model', 3)
add_body(doc, 'The dual-state lifecycle model is fully implemented and operational. The Booking model correctly separates global status from negotiation_status, enabling the UI to render appropriate action buttons and status messages for each party without ambiguity. The state machine handles the following transition paths:')
add_blank(doc)
add_body(doc, 'General Request Path: Client creates booking (status=pending, negotiation_status=none) -> Handyman from dashboard accepts (negotiation_status=awaiting_client) -> Client confirms (status=accepted or visit_fee_paid if knows_fix, negotiation_status=agreed) -> Time arrives (status=in_progress) -> Handyman marks done (status=handyman_done) -> Client confirms (escrow released, status=visit_fee_paid or paid) -> Optionally proceed to Phase 2 quote flow -> Eventually status=closed.')
add_blank(doc)
add_body(doc, 'Direct Request Path: Client selects specific handyman and creates booking (negotiation_status=awaiting_handyman) -> Handyman responds via action endpoint -> Negotiation rounds possible -> Final agreement reached -> Same from accepted onwards.')
add_blank(doc)
add_body(doc, 'The knows_fix shortcut: When the handyman indicates at acceptance time that they already know the solution (knows_fix=True), the client acceptance skips the inspection phase and transitions directly to visit_fee_paid with continue_job auto-confirmed, allowing the quote flow to begin immediately.')

add_heading(doc, '7.1.2 Scheduling Conflict Prevention', 3)
add_body(doc, 'The server-side scheduling conflict check correctly prevents double-booking. The is_timeslot_available() method is called in all acceptance paths and returns appropriate error responses when a conflict is detected. The 30-minute buffer is enforced bidirectionally. The busy-slots endpoint (/api/bookings/busy-slots/<handyman_id>/) allows the frontend calendar to visually block out unavailable time ranges before the user submits a booking.')

add_heading(doc, '7.1.3 Escrow Payment Flow', 3)
add_body(doc, 'The escrow payment flow operates correctly across both phases. Phase 1 (visit fee): upon client acceptance of a handyman offer, lock_client_funds() is called with purpose=visit_fee. The EscrowHold record stores the total client cost including app fee and PDV in separate columns. Upon client confirmation of visit completion, release_funds_to_handyman() credits the handyman wallet, debits the client wallet, and credits the platform admin account with the app fee.')
add_blank(doc)
add_body(doc, 'Phase 2 (quote-based repair): After the client decides to continue, the handyman submits a versioned Quote with itemized line items. Upon client acceptance, lock_client_funds() is called with purpose=quote and the full quote amount. Upon final confirmation, the same release mechanism applies. If the client marks the job as not completed, refund_locked_funds() returns the locked amount to the client without any handyman credit.')
add_blank(doc)
add_body(doc, 'PDF invoices are generated on demand for closed bookings. The invoice distinguishes Phase 1 and Phase 2 items, shows subtotals per phase, and presents the final breakdown of handyman services, platform fee, and PDV. The ReportLab implementation uses custom DejaVu Unicode fonts to correctly render Bosnian diacritic characters (c-hacek, z-hacek, s-hacek, etc.) in the invoice.')

add_heading(doc, '7.1.4 AI Service Classification', 3)
add_body(doc, 'The AI Repair Assistant is operational and correctly routes user-described problems to service categories. The dynamic service list loading ensures that the AI always operates on the current set of available services without requiring code updates. The fuzzy matching fallback handles cases where Gemini returns a category name that differs slightly from the database value (e.g., "Plumbing" vs "plumber").')
add_blank(doc)
add_body(doc, 'The system handles quota errors gracefully with a single automatic retry and a fallback no_match response if the retry also fails. A fallback response is also returned for all other error types, ensuring the API endpoint is always reliable from the frontend perspective.')

add_heading(doc, '7.2 System Performance Observations', 2)
add_body(doc, 'During development testing, the following observations were noted:')
add_blank(doc)
add_body(doc, 'The booking creation and negotiation action endpoints respond within acceptable latency for interactive use. The scheduling conflict check (Booking.is_timeslot_available()) performs a database query for each check; for the current scale of development data this is instantaneous, but would benefit from database indexing on (handyman, status) in production.')
add_blank(doc)
add_body(doc, 'The PDF invoice generation using ReportLab is synchronous and occurs in the request-response cycle. For production use, this should be moved to a Celery background task to avoid blocking the web worker. The Celery configuration is already in place in core/celery.py, making this migration straightforward.')
add_blank(doc)
add_body(doc, 'The AI classification endpoint latency is dependent on Gemini API response time, typically 1-3 seconds. The quota retry logic adds up to 20 seconds in cases of rate limiting. This endpoint is non-blocking from the user perspective as the chat interface shows a typing indicator during the wait.')

add_heading(doc, '7.3 Limitations and Future Development', 2)
add_body(doc, 'The following areas are identified for future development:')
add_blank(doc)
add_body(doc, 'Payment gateway integration: The current wallet system uses a demo top-up endpoint without any real payment processing. Integration with a payment provider (such as Stripe or a BiH-specific provider) is necessary for production deployment. The wallet model and escrow architecture are designed to accommodate this without structural changes; only the top-up endpoint would need to be replaced with a payment webhook handler.')
add_blank(doc)
add_body(doc, 'Push notifications: Real-time status updates currently require page refresh or the polling-based HandymanNewTicketNotifier component. WebSocket integration (e.g., Django Channels) would enable push notifications for booking status changes, new job availability, and message alerts.')
add_blank(doc)
add_body(doc, 'Automated expiry processing: The current expiry mechanism is triggered by the frontend countdown timer calling the /expire/ endpoint. In production, Celery beat scheduled tasks should automatically process expired bookings without requiring any user action.')
add_blank(doc)
add_body(doc, 'CSRF hardening: The current development configuration disables CSRF middleware for development convenience. Production deployment requires either re-enabling CSRF with proper CSRF token flow, or switching to a stateless JWT-only authentication approach.')
add_blank(doc)
add_body(doc, 'Geographic filtering: The county/canton field in the User model provides the foundation for geographic filtering. The current frontend uses city-based and service-based filtering; canton-level filtering for matching clients to service providers within their administrative region is planned for a future phase.')
doc.add_page_break()

# ===========================
# SUSTAINABILITY
# ===========================
add_heading(doc, '8. SUSTAINABILITY, INCLUSIVITY, AND SOCIETAL IMPACT', 1)
add_blank(doc)
add_body(doc, 'GetItFixed addresses several dimensions of sustainable and inclusive design beyond its core technical function.')
add_blank(doc)
add_body(doc, 'Economic sustainability and local labor market support: By formalizing the coordination of artisan and home repair services, the platform reduces the friction cost borne by both clients and service providers. For handymen operating as sole traders or small businesses, reduced coordination overhead translates to more jobs completed per day, more predictable income, and reduced dependence on informal referral networks. The platform\'s fee structure (20% platform fee + 17% PDV) is designed to be sustainable as a business model while remaining competitive with existing informal coordination costs (primarily the time and communications overhead absorbed by providers).')
add_blank(doc)
add_body(doc, 'Digital inclusion: The bilingual interface (English and Bosnian) is specifically designed for the BiH market\'s mixed-language professional and consumer context. The dark/light theme support addresses visual accessibility preferences. The mobile-first responsive layout built with Tailwind CSS ensures the platform is usable on lower-cost smartphones prevalent in the BiH consumer market. The AI Repair Assistant provides guidance to users who may not know which type of service provider to look for, reducing the knowledge barrier to accessing professional services.')
add_blank(doc)
add_body(doc, 'Trust and accountability: The escrow payment system creates financial accountability in a market currently characterized by informal agreements and frequent payment disputes. The review system creates reputation accountability. The admin verification system ensures that only approved service providers can accept jobs, creating a minimum quality bar. These mechanisms collectively improve trust in the platform and create incentives for professional behavior.')
add_blank(doc)
add_body(doc, 'Privacy and data protection: User data is stored in a cloud-hosted PostgreSQL database. The system does not currently implement explicit GDPR-compliant data deletion flows; this is identified as a requirement for production deployment. The authentication token approach (rather than storing credentials client-side) reduces exposure of sensitive credentials. Media files are stored in Supabase S3 with no public listing, accessible only via direct URL.')
add_blank(doc)
add_body(doc, 'Alignment with UN Sustainable Development Goals: The platform primarily aligns with SDG 8 (Decent Work and Economic Growth) by creating a more efficient labor market for skilled trades in a developing economy. It also contributes to SDG 9 (Industry, Innovation, and Infrastructure) by introducing digital infrastructure for a sector that currently relies entirely on informal coordination. SDG 11 (Sustainable Cities and Communities) is indirectly addressed through improved maintenance of existing housing stock through easier access to repair services.')
doc.add_page_break()

# ===========================
# CONCLUSION
# ===========================
add_heading(doc, '9. CONCLUSION', 1)
add_blank(doc)
add_body(doc, 'GetItFixed successfully demonstrates that a structured digital coordination layer for the artisan services market is technically feasible and architecturally sound within the constraints of a university graduation project scope. The key technical contributions are:')
add_blank(doc)
add_body(doc, 'The dual-state lifecycle model, separating global booking status from negotiation_status, provides a clean framework for tracking "awaiting party" scenarios in bilateral service negotiations without state ambiguity. This design pattern is directly applicable to any marketplace requiring multi-round negotiation before commitment.')
add_blank(doc)
add_body(doc, 'The server-side scheduling conflict prevention with a mandatory buffer period demonstrates how domain-specific business rules can be enforced at the API layer, making them robust against any frontend implementation. The separation between the check function (is_timeslot_available()) and its callers makes the rule testable in isolation.')
add_blank(doc)
add_body(doc, 'The phased escrow payment system with atomically managed financial operations, separate tracking of handyman_amount, app_fee_amount, and pdv_amount per hold, and a complete WalletTransaction audit trail provides a production-quality financial accountability model. The pricing module\'s clean separation of the fee computation from the escrow service makes fee adjustments straightforward.')
add_blank(doc)
add_body(doc, 'The AI service classification system demonstrates practical integration of a generative AI model as a functional product feature, with proper error handling, fallback mechanisms, dynamic category loading, and structured output validation.')
add_blank(doc)
add_body(doc, 'The full-stack implementation with Django REST Framework backend and Next.js frontend, connected via a token-authenticated REST API with cookie-header dual authentication, provides a production-ready architectural template that can be extended with additional features (real payment gateway, WebSocket notifications, mobile app, multi-city expansion) without requiring fundamental redesign.')
add_blank(doc)
add_body(doc, 'The platform is positioned to address a genuine market gap in Bosnia and Herzegovina. While the current implementation is at prototype/development stage and requires production hardening (CSRF, real payments, automated task processing), the core domain logic is complete and validated. The codebase quality, with clear separation of concerns, documented business rules, and test coverage, provides a solid foundation for continued development.')
doc.add_page_break()

# ===========================
# REFERENCES
# ===========================
add_heading(doc, 'REFERENCES', 1)
add_blank(doc)
refs = [
    '[1] TaskRabbit. (2024). How TaskRabbit Works. TaskRabbit Inc. Retrieved from https://www.taskrabbit.com/',
    '[2] Thumbtack. (2024). Find Local Pros. Thumbtack Inc. Retrieved from https://www.thumbtack.com/',
    '[3] Angi. (2024). Find Local Contractors. Angi Inc. Retrieved from https://www.angi.com/',
    '[4] Horton, J., & Zeckhauser, R. (2016). Owning, Using and Renting: Some Simple Economics of the "Sharing Economy." NBER Working Paper No. 22029.',
    '[5] Einav, L., Farronato, C., & Levin, J. (2016). Peer-to-Peer Markets. Annual Review of Economics, 8, 615-635.',
    '[6] Django Software Foundation. (2025). Django 5.2 Documentation. Retrieved from https://docs.djangoproject.com/',
    '[7] Django REST Framework. (2025). Django REST Framework 3.17 Documentation. Retrieved from https://www.django-rest-framework.org/',
    '[8] Vercel. (2025). Next.js 16 Documentation. Retrieved from https://nextjs.org/docs/',
    '[9] Google. (2025). Gemini API Documentation. Retrieved from https://ai.google.dev/',
    '[10] Supabase. (2025). Supabase Documentation. Retrieved from https://supabase.com/docs',
    '[11] ReportLab. (2025). ReportLab PDF Library. Retrieved from https://www.reportlab.com/',
    '[12] Tailwind CSS. (2025). Tailwind CSS v4 Documentation. Retrieved from https://tailwindcss.com/',
]
for ref in refs:
    add_body(doc, ref)
doc.add_page_break()

# ===========================
# APPENDICES
# ===========================
add_heading(doc, 'APPENDICES', 1)
add_blank(doc)

add_heading(doc, 'Appendix A: Booking Status State Machine', 2)
add_body(doc, 'The following describes all valid Booking.status transitions in the system:')
add_blank(doc)
state_transitions = [
    ('pending', 'accepted', 'Client confirms handyman offer (standard flow)'),
    ('pending', 'visit_fee_paid', 'Client confirms handyman offer AND knows_fix=True (skip inspection)'),
    ('pending', 'cancelled', 'Either party declines, or deadline expires'),
    ('accepted', 'in_progress', 'Scheduled time arrives (JobStatusCheckView)'),
    ('in_progress', 'handyman_done', 'Handyman marks visit complete (CompleteVisitView)'),
    ('in_progress', 'not_completed', 'Edge case: job reopened and marked not completed'),
    ('handyman_done', 'visit_fee_paid', 'Client confirms Phase 1 completion (escrow released)'),
    ('handyman_done', 'not_completed', 'Client disputes completion (escrow refunded)'),
    ('visit_fee_paid', 'visit_fee_paid', 'Client decides to continue to Phase 2 (continue_job_confirmed=True)'),
    ('visit_fee_paid', 'closed', 'Client decides not to continue (no Phase 2)'),
    ('visit_fee_paid', 'quote_pending_client', 'Handyman submits Phase 2 Quote'),
    ('quote_pending_client', 'funds_locked', 'Client accepts Quote (Phase 2 escrow locked)'),
    ('quote_pending_client', 'visit_fee_paid', 'Client rejects Quote (returns to continue decision)'),
    ('funds_locked', 'in_progress', 'Second scheduled time arrives (same JobStatusCheckView)'),
    ('handyman_done', 'paid', 'Client confirms Phase 2 completion (quote escrow released)'),
    ('paid', 'closed', 'Handyman acknowledges payment receipt'),
    ('not_completed', 'in_progress', 'Reopened after dispute (reopen_after_issue action)'),
]
st_table = doc.add_table(rows=1, cols=3)
st_table.style = 'Table Grid'
hdr = st_table.rows[0].cells
hdr[0].text = 'From Status'
hdr[1].text = 'To Status'
hdr[2].text = 'Trigger'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True
for row_data in state_transitions:
    row = st_table.add_row().cells
    for i, val in enumerate(row_data):
        row[i].text = val

doc.add_page_break()

add_heading(doc, 'Appendix B: Registered Service Categories', 2)
add_body(doc, 'The following service categories are supported by the platform as of the current implementation. Service types are registered at handyman account creation and drive both dashboard job matching and AI classification:')
add_blank(doc)
services = [
    ('mechanic', 'Auto mechanic'),
    ('pools', 'Pool maintenance and swimming pools'),
    ('carpenter', 'Carpenter and woodwork'),
    ('tiler', 'Ceramics and tiling'),
    ('cleaning', 'Cleaning services'),
    ('electrician', 'Electrician'),
    ('excavation', 'Excavation and groundwork'),
    ('facade', 'Facade and insulation'),
    ('fencing', 'Fencing and gates'),
    ('flooring', 'Flooring and parquet'),
    ('renovation', 'Full renovation expert'),
    ('gardener', 'Gardening and landscaping'),
    ('heating', 'Heating and plumbing systems'),
    ('hvac', 'HVAC and air conditioning'),
    ('it_support', 'IT support and tech solutions'),
    ('masonry', 'Masonry and brickwork'),
    ('painter', 'Painter and decorator'),
    ('plumber', 'Plumbing specialist'),
    ('security', 'Security and surveillance systems'),
    ('solar', 'Solar panel installation'),
    ('transport', 'Transport and moving services'),
    ('upholstery', 'Upholstery and furniture repair'),
    ('windows', 'Window and door installation'),
    ('roofing', 'Roofing specialist'),
    ('appliances', 'Appliance repair and maintenance'),
    ('pest_control', 'Pest control and extermination'),
]
svc_table = doc.add_table(rows=1, cols=2)
svc_table.style = 'Table Grid'
hdr = svc_table.rows[0].cells
hdr[0].text = 'Database Key'
hdr[1].text = 'Display Name'
for cell in hdr:
    for para in cell.paragraphs:
        for run in para.runs:
            run.bold = True
for row_data in services:
    row = svc_table.add_row().cells
    row[0].text = row_data[0]
    row[1].text = row_data[1]

doc.save(out_path)
print('Report saved to:', out_path)
