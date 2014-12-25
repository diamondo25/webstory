cd MapleSocket
start cmd /K "nodemon server"

cd ..

cd WebStory
start cmd /K "grunt"
start cmd /K "http-server -p 8082"