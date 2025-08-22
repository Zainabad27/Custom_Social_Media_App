# Custom Social Media Backend

A **full-featured backend** for a custom social media application, built with **Express.js** using **industry-level practices** and a proper file structure. This app combines features from **YouTube** and **Twitter**, allowing users to **upload, watch, like videos**, post tweets, comment, and manage channels.  

Integration tests are included with **Supertest** and **Vitest**, using **MongoDB Atlas** as the database and **Mongoose** as the ODM. Complex **aggregation pipelines** are extensively used for optimized data queries.  

---

# Features

- **User Authentication & Management**: Register, login, logout, update details, and refresh access tokens  
- **Video Management**: Upload, watch, like, update, and delete videos  
- **Tweet Functionality**: Post tweets with media, delete tweets, fetch user tweets  
- **Comments**: Comment on videos, fetch comments, delete comments  
- **Likes**: Like/unlike videos, tweets, and comments  
- **Subscriptions**: Subscribe/unsubscribe to channels  
- **Dashboard**: Get stats, watch history, and total likes  
- **Media Upload**: Supports uploading avatars, cover images, video files, thumbnails, and tweet media  
- **Testing**: Integration tests using **Vitest** and **Supertest**  

---

# Tech Stack

- **Backend**: Express.js  
- **Database**: MongoDB Atlas  
- **ODM**: Mongoose  
- **Testing**: Vitest + Supertest  
- **File Uploads**: Multer  
- **Authentication**: JWT  
- **Other**: Aggregation pipelines for advanced data queries  

---

# Project Structure

```
custom-social-backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── middlewares/    # Auth and other middlewares
│   ├── utils/          # Helper functions
│   ├── tests/          # Integration tests
│   └── app.js          # Express app initialization
├── .env                # Environment variables
├── package.json
└── README.md
```



# API Endpoints(And their description)

## Authentication & User Management

- /register	POST	Register a new user (supports avatar & cover image)
- /login	POST	User login
- /logout	POST	Logout user (JWT required)
- /refreshAccesstoken	POST	Refresh access token
- /update-password	POST	Update password (JWT required)
- /update-user/details	PATCH	Update user details (avatar & cover image supported, JWT required)
- /c/:username/getuserprofile	GET	Get user channel/profile (JWT required)


## Video Management

- /uploading-video	POST	Upload video with thumbnail (JWT required)
- /c/:id/click/video	GET	Track video click/view (JWT required)
- /c/:id/update/video	POST	Update video thumbnail (JWT required)
- /c/:id/delete/video	POST	Delete video (JWT required)
- /get/all/videos	GET	Fetch all videos (JWT required)


## Tweets & Comments


- /maketweet	POST	Create a tweet with up to 4 media files (JWT required)
- /c/:id/delete/tweet	DELETE	Delete a tweet (JWT required)
- /c/:username/getalltweets	GET	Fetch all tweets of a user
- /comment/on/video	POST	Comment on a video (JWT required)
- /getallcomments	GET	Get all comments
- /c/:id/delete/comment	DELETE	Delete a comment (JWT required)
## Likes & Subscriptions

- /c/:id/like/video	POST	Like a video (JWT required)
- /c/:id/remove/like/video	DELETE	Remove like from video (JWT required)
- /c/:id/like/tweet	POST	Like a tweet (JWT required)
- /c/:id/remove/like/tweet	DELETE	Remove like from tweet (JWT required)
- /c/:id/like/comment	POST	Like a comment (JWT required)
- /c/:id/remove/like/comment	DELETE	Remove like from comment (JWT required)
- /c/:id/subscribe/channel	POST	Subscribe to a channel (JWT required)
- /c/:id/unsubscribe/channel	POST	Unsubscribe from a channel (JWT required)
  
## Dashboard & Stats

- /get/stats	GET	Get user stats (JWT required)
- /get/all/likes	GET	Get total likes on user content (JWT required)
- /getwatchhistory	GET	Get user's watch history (JWT required)
- /clear/watchhistory	POST	Clear user's watch history (JWT required)

