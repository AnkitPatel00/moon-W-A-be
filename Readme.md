# Workasana App

Workasana is a project and task management app with JWT-based authentication, enabling users to manage projects by status, team collaboration, and detailed task tracking. It features dashboards, filters, reports, and a clean UI for managing leads, tasks, and team progress efficiently.

---

## Demo Link

[Live Demo](https://workasanafe.vercel.app/)  

---

## Login

> **Guest**
> Email: `user@domain.com`
> Password: `123456`

---

## Quick Start

```
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
npm run dev  
```

### Technologies
- NodeJS  
- JavaScript  
- React
- Express

## Demo Video
Watch this video [here]() 👈

##  Features

**Dashboard**
- Projects a list of all Projects
- Search Project by title
- Filter Project by status

**Tasks Listing**
- Tasks list
- “See Details” Task button 
- “Delete” Task button 

**Task Details**
- View full Task information (task name, status, project, team, ...)
- “Edit Task” to update status, project,...

**Reports**
- Task Completed by Teams
- Task Completed by Members

### **GET /api/tasks**<br>	 
List all Task<br>	 
Sample Response:<br>
```[{ _id, name, project,team, owners, ... }, …]```

### **POST	/api/tasks/:id**<br>	 	
Update task details<br>		
Sample Response:<br>
```{ _id, name, project,team, owners, ... }```

### **GET	/api/teams**<br> 	
List all Teams<br>	
Sample Response:<br>
```{message:"task updated successfully", _id, name, description, members, ... }```

### **GET	/api/report/pending**<br>  	
Total Days of Work Pending<br> 	 
Sample Response:<br> 
```{ {"daysLeft":10} }```

  ## Contact
For bugs or feature requests, please reach out to ankitpatel.web@gmail.com