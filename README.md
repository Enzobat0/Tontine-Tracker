# Tontine Tracker — Digital Group Savings Platform
**Description**

Tontine Tracker is a lightweight web application designed to help small community savings groups (commonly known as tontines, ibimina, or stokvels in various African contexts) manage their collective funds digitally.

Across Africa, millions of people rely on informal group savings systems, pooling money monthly or weekly and rotating who receives the payout. However, these groups often face issues like:

- Manual tracking errors in notebooks or WhatsApp messages

- Lack of transparency in contribution and payout records

- Disputes due to lost data or unclear tracking

Tontine Tracker provides an easy, digital way for group leaders to record contributions, track payouts, and visualize the group’s progress, even with limited technical knowledge or internet access.

### Problem Statement & African Context
Informal savings groups are an essential part of local economies across Africa, especially for unbanked or underbanked individuals.
Despite their importance, most tontines still depend on paper records or verbal tracking, leading to confusion, data loss, and mistrust among members.

Tontine Tracker directly addresses this challenge by digitizing group saving management while remaining simple enough for community use.
It focuses on accessibility, transparency, and accountability; crucial values for trust-driven savings groups.

**Key Objectives**

- Enable a group leader to create a tontine (savings group).

- Allow adding members, setting contribution amounts, and defining the payout cycle.

- Track contributions and automatically calculate total savings.

- Record and visualize payout history (who has received funds and when).

- Provide transparency and easy reporting for all members.

**Primary Users**

- Group Leader (Admin): Creates and manages the tontine, adds members, records contributions, and logs payouts.

- Members (Viewers): Can view their contribution status and group progress (optional in future versions).

  ## Core Features (for this formative)
| Feature | Description |
|----------|--------------|
| **User Authentication** | Basic signup/login for the tontine leader. |
| **Tontine Creation** | Create a new tontine with name, description, contribution amount, and rotation length. |
| **Member Management** | Add, update, or remove members in a tontine. |
| **Contribution Tracking** | Record each member’s monthly contribution status (paid/unpaid). |
| **Payout Recording** | Mark who has received the payout for each round. |
| **Dashboard Overview** | Display total savings, current round, and payout history. |
| **Basic UI** | Simple, responsive layout using Bootstrap. |

##  Tech Stack
| Layer | Technology |
|--------|-------------|
| **Backend** | Node.js + Express |
| **Database** | MongoDB or SQLite (depending on deployment environment) |
| **Frontend** | HTML, CSS, JavaScript |
| **Styling** | Bootstrap (for responsiveness and design consistency) |
| **Version Control** | Git & GitHub |
| **DevOps Tools (later phases)** | Docker, GitHub Actions (CI/CD), Deployment via Render/Netlify |

## Setup Instructions

#### 1. Clone the Repository
```
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

#### 2. Backend Setup (Node.js + Express)
Navigate to the backend folder:
```
cd backend
```
Install dependencies:
```
npm install
```
Create a .env file:
Required variables in .env:
```
PORT=4000
JWT_SECRET=<your_secret_key>
JWT_EXPIRES_IN=1d
```
Make sure to replace <your_secret_key> with a secure random string

Start the backend server in development mode:
```
npm run dev
```
#### 3. Frontend Setup (HTML/CSS/JS)
Navigate to the frontend folder:

```
cd ../frontend
```
Serve the frontend locally.Use Node serve:
```
npx serve .
```
Open your browser at the URL provided by your static server.

#### 4. Notes & Tips

Database: Uses local JSON file (db.json) for now, no external DB setup required.

CORS: Backend already configured for frontend requests.

Troubleshooting:

- If server doesn’t start → check .env variables.

- If JWT issues occur → clear browser localStorage.

- If frontend doesn’t load → confirm correct port for static server.


##  Team Members
| Name | Role |
|------|------|
| Enzo Batungwanayo | Team Lead &Backend Developer |
|  Patrick Nayituriki| Frontend Developer |
| Marvelous Nelson | DevOps& FullStack Developer |