# 🧠 Prompt2Mongo – Natural Language to MongoDB Query Generator using Gemini AI

This full-stack project allows users to enter natural language queries like:  
**"Get 3 random users"**, **"Find users from Mumbai"**, or **"List users older than 30"**,  
and converts them into real **MongoDB queries** using **Google Gemini AI**.

---

## 🔧 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (dynamic connection)
- Mongoose
- Google Gemini API (for prompt → query)
- Axios
- dotenv

### Frontend
- React.js
- Axios

---


---


```bash


💬 Example Prompts
"Get 3 random users"
"Find users from Delhi"
"Show users older than 30"
"Users registered after 2023"
"List all users grouped by city"



🧠 Notes
The backend cleans and parses the Gemini AI response to ensure valid MongoDB syntax.
Supports both .find() queries and aggregation queries.
Frontend will alert if there's an error in prompt, connection, or parsing.

