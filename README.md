# Tontine Tracker — Digital Group Savings Platform
## Live Application URL: <http://20.166.23.234/>
## Demo Video: <https://youtu.be/kP1WezTN1ZA>
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

### Cloud Architecture & Operations
 This project is deployed using a secure, enterprise-grade Hub-and-Spoke network topology on Microsoft Azure.
 
 **Architecture Diagram**
 
![Architecture Diagram](/Architecture.png)

 **Infrastructure Components**
- Bastion Host (Public Subnet): Acts as the secure gateway. It runs Nginx as a Reverse Proxy to route traffic to the private application (Port 80 to Internal Ports 3000/4000).

- Application VM (Private Subnet): Hosts the Dockerized Application (Frontend + Backend). It has no public IP, ensuring maximum security from direct attacks.

- Azure Cosmos DB: Managed MongoDB service for persistent data storage.

- Azure Container Registry (ACR): Private, secure storage for our Docker container images.

### CI/CD Pipeline (DevOps)
We implemented a full GitOps workflow using GitHub Actions, Terraform, and Ansible.
#### 1. Continuous Integration (CI)
Triggers on every Pull Request to the main branch.

- Linting: Checks code quality with ESLint.

- Testing: Runs unit tests (Jest) to ensure logic is sound.

- Security (DevSecOps):

  - Tfsec: Scans Terraform code for infrastructure vulnerabilities.

  - Trivy: Scans Docker images for critical CVEs before building.
#### 2. Continuous Deployment (CD)
Triggers automatically when code is merged to the main branch.

- Build: Creates production-optimized Docker images for Frontend (Nginx) and Backend (Node.js).

- Push: Uploads images to the private Azure Container Registry (ACR).

- Deploy: Uses Ansible to connect to the private VM (via the Bastion jump host), pull the new images, and restart the containers with zero downtime.

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
| **Database** | Azure Cosmos DB (MongoDB API) |
| **Frontend** | HTML, CSS, JavaScript |
| **Styling** | Bootstrap (for responsiveness and design consistency) |
| **Infrastructure** | Terraform (IaC)|
| **Configuration** |	Ansible|
| **CI/CD** |	GitHub Actions|

## Setup Instructions (Local Development)

#### 1. Clone the Repository
```
git clone https://github.com/<your-username>/<Tontine-Tracker>.git
cd <Tontine-Tracker>
```
#### 2. Environment Setup
Create a .env file:
Required variables in .env:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/tontine_local
JWT_SECRET=<your_secret_key>
JWT_EXPIRES_IN=1d
```
Make sure to replace <your_secret_key> with a secure random string

#### 3. Run with Docker Compose
This will start the Database, Backend, and Frontend automatically.
```
docker-compose up --build
```
#### 4. Access the App
Frontend: http://localhost:3000

Backend API: http://localhost:4000


##  Team Members
| Name | Role |
|------|------|
| Enzo Batungwanayo | Team Lead &Backend Developer |
|  Patrick Nayituriki| Frontend Developer |
| Marvelous Nelson | DevOps& FullStack Developer |
