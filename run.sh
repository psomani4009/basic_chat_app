#!/bin/bash

# Run client-side in the background
cd client
npm start &

# Run server-side in the background
sleep 5s
cd ..
cd server
npm run start &
