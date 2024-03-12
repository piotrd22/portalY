# MEVN twitter clone

A project made for web technology classes, where we were to implement a clone of X - the old Twitter.

The application is secured by an SSL certificate, which I am not including here.

The hardest part was implementing "graph" dependencies in the MongoDB database so that it made sense. In addition, the project consists of a server part written in Node.js using Express.js and Socket.io and a client part using Vue 3 with Vite, Vueitfy and basic state management with Pinia. Additionally, I use imagekit.io to store photos in the cloud.

The authorization part uses the Passport.js library and maintains the session in MongoDB.

Of course, ultimately the server statically hosts the static frontend.

The website allows classic Twitter functions, i.e. registration, logging in, following, blocking, writing posts and participating in their threads, quoting posts, creating an avatar profile, etc.
