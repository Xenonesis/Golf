# Product Requirements Document (PRD)

**Project:** Golf Performance + Charity + Rewards Platform  
**Version:** 1.0  
**Date:** March 2026  
**Prepared For:** Full-Stack Development Trainees  

---

## 1. Project Overview

This platform is a **subscription-based web application** that combines:

- Golf performance tracking (Stableford scoring)
- Charity fundraising
- Monthly draw-based rewards system

### Key Idea
Users subscribe, submit golf scores, support charities, and get a chance to win monthly rewards.

---

## 2. Core Objectives

- **Subscription Engine** → Monthly & yearly plans
- **Score Experience** → Easy score entry (last 5 scores)
- **Draw Engine** → Random or algorithm-based draws
- **Charity Integration** → User-selected donations
- **Admin Control** → Full dashboard for management
- **UI/UX Excellence** → Modern, non-traditional design

---

## 3. User Roles

### Public Visitor
- View platform concept
- Explore charities
- Understand draw system
- Start subscription

### Registered Subscriber
- Manage profile
- Enter/edit golf scores
- Select charity
- Track draws & winnings
- Upload proof if winner

### Administrator
- Manage users & subscriptions
- Run and configure draws
- Manage charities
- Verify winners
- View analytics

---

## 4. Subscription & Payment System

- Plans: Monthly & Yearly (discounted)
- Payment Gateway: Stripe (or equivalent)
- Access Control: Restricted for non-subscribers
- Lifecycle:
  - Active
  - Renewal
  - Cancelled
  - Expired
- Real-time validation on each request

---

## 5. Score Management System

### Input Rules
- Last **5 scores required**
- Score range: **1–45 (Stableford)**
- Each score must include a date

### Logic
- Only latest 5 scores stored
- New score replaces oldest
- Sorted by **latest first**
- One score per date only

---

## 6. Draw & Reward System

### Draw Types
- 5-number match
- 4-number match
- 3-number match

### Draw Logic
- Random (lottery style)
- Algorithm-based (frequency weighted)

### Requirements
- Monthly draws
- Admin-controlled publishing
- Simulation mode available
- Jackpot rollover if no winner

---

## 7. Prize Pool Logic

| Match Type | Pool Share | Rollover |
|------------|-----------|----------|
| 5 Match    | 40%       | Yes      |
| 4 Match    | 35%       | No       |
| 3 Match    | 25%       | No       |

- Based on total subscriptions
- Split equally among winners
- Jackpot carries forward

---

## 8. Charity System

### Contribution
- Minimum: **10% of subscription**
- Users can increase contribution

### Features
- Charity listing page
- Search & filter
- Individual charity profiles
- Featured charity section
- Independent donations allowed

---

## 9. Winner Verification System

- Winners must upload proof
- Admin review required

### Flow
`Pending → Approved/Rejected → Paid`

---

## 10. User Dashboard

Includes:

- Subscription status
- Score management
- Charity selection
- Draw participation summary
- Winnings overview

---

## 11. Admin Dashboard

### User Management
- View/edit users
- Manage subscriptions
- Edit scores

### Draw Management
- Configure logic
- Run simulations
- Publish results

### Charity Management
- Add/edit/delete charities

### Winners Management
- Verify winners
- Track payouts

### Analytics
- Total users
- Prize pool stats
- Charity contributions

---

## 12. UI/UX Requirements

### Design Direction
- Modern & emotional
- Avoid traditional golf themes

### Key Elements
- Clean UI with animations
- Strong CTA (Subscribe)
- Focus on charity impact
- Mobile-first design

---

## 13. Technical Requirements

- Responsive (mobile-first)
- Fast performance
- Secure authentication (JWT/session)
- HTTPS required
- Email notifications:
  - Draw results
  - Updates
  - Alerts

---

## 14. Scalability Considerations

- Multi-country support
- Team/corporate accounts ready
- Future campaign module
- Mobile app compatibility

---

## 15. Mandatory Deliverables

- Live deployed website
- Functional user panel
- Functional admin panel
- Connected database (e.g., Supabase)
- Clean source code

### Deployment Rules
- New Vercel account
- New Supabase project
- Proper environment variables

---

## 16. Evaluation Criteria

- Requirement understanding
- System design quality
- UI/UX creativity
- Data accuracy
- Scalability
- Problem-solving ability

---

## 17. Testing Checklist

- User authentication
- Subscription flow
- Score logic (5-score system)
- Draw functionality
- Charity contribution
- Winner verification
- Dashboard functionality
- Admin controls
- Data accuracy
- Responsive design
- Error handling

---

## Notes

- Only **one score per date allowed**
- Existing scores can be edited or deleted